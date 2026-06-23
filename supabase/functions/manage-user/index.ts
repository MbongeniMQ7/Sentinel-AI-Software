// ============================================================================
// SentinelAI — manage-user edge function
//
// Privileged owner-only account actions that must run with the service role
// (they touch other users' profiles + the account_roles mapping, which RLS
// blocks for normal clients). Each action also emails the affected user with
// the shared branded template.
//
// POST { action, userId, ... }
//   action: 'update_role'    { userId, role }
//   action: 'reset_password' { userId }
//   action: 'set_suspended'  { userId, suspended }
//
// Authorization: the caller must present a valid owner session (Bearer JWT).
//
// Secrets / runtime env:
//   RESEND_API_KEY, OTP_* / SUPPORT_* (shared email), SUPABASE_URL,
//   SUPABASE_SERVICE_ROLE_KEY, SUPABASE_ANON_KEY
// ============================================================================

import { createClient, type SupabaseClient } from 'jsr:@supabase/supabase-js@2'
import { corsHeaders, jsonResponse } from '../_shared/cors.ts'
import { APP_URL, sendBrandedEmail, type BrandedEmailOptions } from '../_shared/email.ts'

type Action = 'update_role' | 'reset_password' | 'set_suspended'
const ROLES = ['employee', 'manager', 'owner'] as const
type Role = (typeof ROLES)[number]

const ROLE_LABEL: Record<Role, string> = {
  employee: 'Employee',
  manager: 'Manager / Admin',
  owner: 'Owner',
}

interface TargetProfile {
  id: string
  full_name: string | null
  email: string | null
  role: string | null
}

async function emailTarget(
  resendKey: string,
  to: string,
  subject: string,
  opts: BrandedEmailOptions,
): Promise<void> {
  try {
    await sendBrandedEmail({ resendKey, to, subject, opts })
  } catch (err) {
    console.error('manage-user email error', err)
  }
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })
  if (req.method !== 'POST') return jsonResponse({ error: 'Method not allowed' }, 405)

  const resendKey = Deno.env.get('RESEND_API_KEY')
  if (!resendKey) return jsonResponse({ error: 'Email service not configured' }, 500)

  // ---- Authenticate the caller and confirm they're an owner ----------------
  const authHeader = req.headers.get('Authorization') ?? ''
  const token = authHeader.replace(/^Bearer\s+/i, '').trim()
  if (!token) return jsonResponse({ error: 'Not authenticated' }, 401)

  const admin: SupabaseClient = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
  )

  const { data: caller, error: callerErr } = await admin.auth.getUser(token)
  if (callerErr || !caller?.user) return jsonResponse({ error: 'Not authenticated' }, 401)

  const { data: callerProfile } = await admin
    .from('profiles')
    .select('role')
    .eq('id', caller.user.id)
    .maybeSingle()
  if (callerProfile?.role !== 'owner') {
    return jsonResponse({ error: 'Only owners can perform this action' }, 403)
  }

  // ---- Parse the request ---------------------------------------------------
  let payload: { action?: string; userId?: string; role?: string; suspended?: boolean }
  try {
    payload = await req.json()
  } catch {
    return jsonResponse({ error: 'Invalid JSON body' }, 400)
  }

  const action = (payload.action ?? '') as Action
  const userId = (payload.userId ?? '').trim()
  if (!userId) return jsonResponse({ error: 'A target user is required' }, 400)

  const { data: target, error: targetErr } = await admin
    .from('profiles')
    .select('id, full_name, email, role')
    .eq('id', userId)
    .maybeSingle()
  if (targetErr || !target) return jsonResponse({ error: 'User not found' }, 404)
  const user = target as TargetProfile
  const greeting = user.full_name?.split(' ')[0] || 'there'

  switch (action) {
    // ---- Change a user's role --------------------------------------------
    case 'update_role': {
      const role = (payload.role ?? '') as Role
      if (!ROLES.includes(role)) return jsonResponse({ error: 'Invalid role' }, 400)
      if (user.id === caller.user.id) {
        return jsonResponse({ error: 'You cannot change your own role.' }, 400)
      }

      const { error: profErr } = await admin
        .from('profiles')
        .update({ role, updated_at: new Date().toISOString() })
        .eq('id', user.id)
      if (profErr) return jsonResponse({ error: 'Could not update role' }, 500)

      // Keep the account_roles mapping in sync so the role survives re-login.
      if (user.email) {
        await admin
          .from('account_roles')
          .update({ role })
          .eq('email', user.email)
      }

      if (user.email) {
        await emailTarget(resendKey, user.email, 'Your SentinelAI access level changed', {
          preheader: `Your role is now ${ROLE_LABEL[role]}.`,
          heading: 'Your access level changed',
          banner: 'future-management',
          intro: `Hi ${greeting}, an administrator has updated your access level on SentinelAI. Your new permissions take effect the next time you sign in.`,
          highlight: ROLE_LABEL[role],
          infoRows: [{ label: 'New role', value: ROLE_LABEL[role] }],
          cta: { label: 'Open SentinelAI', url: APP_URL },
          footnote: "If you weren't expecting this change, please contact your administrator.",
        })
      }
      return jsonResponse({ success: true })
    }

    // ---- Reset a user's access (passwordless re-auth) --------------------
    case 'reset_password': {
      // The platform is passwordless (OTP). "Reset" revokes any active
      // sessions so the user must re-verify with a fresh one-time code.
      try {
        await admin.auth.admin.signOut(user.id)
      } catch (err) {
        console.error('signOut error', err)
      }

      if (user.email) {
        await emailTarget(resendKey, user.email, 'Your SentinelAI sign-in was reset', {
          preheader: 'Sign in again with a new one-time code.',
          heading: 'Your sign-in was reset',
          banner: 'risk-detection',
          intro: [
            `Hi ${greeting}, an administrator has reset your SentinelAI access for security.`,
            'SentinelAI is passwordless — there is nothing to remember. Just sign in with your email and we will send you a fresh one-time code to verify it is you.',
          ],
          cta: { label: 'Sign in to SentinelAI', url: APP_URL },
          footnote: "If you didn't expect this, please contact your administrator right away.",
        })
      }
      return jsonResponse({ success: true })
    }

    // ---- Suspend / reactivate a user -------------------------------------
    case 'set_suspended': {
      const suspended = payload.suspended === true
      if (user.id === caller.user.id) {
        return jsonResponse({ error: 'You cannot suspend your own account.' }, 400)
      }

      const { error: profErr } = await admin
        .from('profiles')
        .update({ is_active: !suspended, updated_at: new Date().toISOString() })
        .eq('id', user.id)
      if (profErr) return jsonResponse({ error: 'Could not update account' }, 500)

      // Persist on the mapping so the OTP functions enforce it at sign-in.
      if (user.email) {
        await admin
          .from('account_roles')
          .update({ is_active: !suspended })
          .eq('email', user.email)
      }

      // Revoking sessions on suspension takes effect immediately.
      if (suspended) {
        try {
          await admin.auth.admin.signOut(user.id)
        } catch (err) {
          console.error('signOut error', err)
        }
      }

      if (user.email) {
        await emailTarget(
          resendKey,
          user.email,
          suspended ? 'Your SentinelAI account was suspended' : 'Your SentinelAI account was reactivated',
          suspended
            ? {
                preheader: 'Your access has been temporarily suspended.',
                heading: 'Your account was suspended',
                banner: 'risk-detection',
                intro: `Hi ${greeting}, your SentinelAI account has been suspended by an administrator. You will not be able to sign in until it is reactivated.`,
                highlight: 'Suspended',
                footnote: 'If you believe this is a mistake, please contact your administrator.',
              }
            : {
                preheader: 'Welcome back — your access has been restored.',
                heading: 'Your account was reactivated',
                banner: 'welcome',
                intro: `Hi ${greeting}, good news — your SentinelAI account has been reactivated. You can sign in again right away.`,
                highlight: '✓ Active',
                cta: { label: 'Sign in to SentinelAI', url: APP_URL },
              },
        )
      }
      return jsonResponse({ success: true })
    }

    default:
      return jsonResponse({ error: 'Unknown action' }, 400)
  }
})
