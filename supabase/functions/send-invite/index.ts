// ============================================================================
// SentinelAI — send-invite edge function
//
// POST { email, role, companyId?, fullName?, title?, phone?, avatarUrl? }
// Authorization: Bearer <caller access token>
//
//   1. Authenticates the caller and confirms they are an owner or manager.
//   2. Applies authorization rules:
//        - owners   may invite any role into any company,
//        - managers may invite employees/managers into their OWN company only.
//   3. Upserts the email -> role/company/contact mapping in `account_roles`
//      (read by verify-otp on first login to provision the profile).
//   4. Records the invitation in `invites` for auditing.
//   5. Emails the invitee via Resend telling them they can sign in with OTP.
//
// Secrets (set with `supabase secrets set`):
//   RESEND_API_KEY   — Resend API key (required)
//   OTP_FROM_EMAIL   — verified sender, defaults to no-reply@mmqtech.co.za
//   OTP_REPLY_TO     — monitored reply mailbox, defaults to support@mmqtech.co.za
//   OTP_APP_NAME     — branding, defaults to "SentinelAI"
//   INVITE_APP_URL   — sign-in URL, defaults to the production site
//
// Auto-injected by the Supabase runtime:
//   SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY
// ============================================================================

import { createClient } from 'jsr:@supabase/supabase-js@2'
import { corsHeaders, jsonResponse } from '../_shared/cors.ts'
import { APP_NAME, APP_URL, sendBrandedEmail, type BrandedEmailOptions } from '../_shared/email.ts'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const ROLES = ['employee', 'manager', 'owner'] as const
type Role = (typeof ROLES)[number]

const ROLE_LABELS: Record<Role, string> = {
  owner: 'Owner',
  manager: 'Manager / Admin',
  employee: 'Team member',
}

function randomToken(): string {
  return typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : Math.random().toString(36).slice(2) + Date.now().toString(36)
}

function inviteEmailOpts(opts: {
  signInUrl: string
  roleLabel: string
  companyName: string | null
  inviterName: string | null
  invitee: string
}): BrandedEmailOptions {
  const { signInUrl, roleLabel, companyName, inviterName, invitee } = opts
  const intro = inviterName
    ? `${inviterName} has added you to ${APP_NAME}`
    : `You've been added to ${APP_NAME}`
  const scope = companyName
    ? `as a <strong style="color:#1f43f5;">${roleLabel}</strong> for <strong style="color:#0f172a;">${companyName}</strong>`
    : `as a <strong style="color:#1f43f5;">${roleLabel}</strong>`
  return {
    preheader: `${intro} ${scope.replace(/<[^>]+>/g, '')}. Sign in with ${invitee} to get started.`,
    heading: 'Welcome to SentinelAI',
    intro: [
      `${intro} ${scope}.`,
      `Sign in with this email address — <strong style="color:#0f172a;">${invitee}</strong> — and we'll send a one-time code to verify it's you. No password required.`,
    ],
    banner: 'welcome',
    cta: { label: `Sign in to ${APP_NAME}`, url: signInUrl },
    footnote: "If you weren't expecting this, you can safely ignore this email.",
  }
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })
  if (req.method !== 'POST') return jsonResponse({ error: 'Method not allowed' }, 405)

  const resendKey = Deno.env.get('RESEND_API_KEY')
  if (!resendKey) return jsonResponse({ error: 'Email service not configured' }, 500)

  let payload: {
    email?: string
    role?: string
    companyId?: string | null
    fullName?: string
    title?: string
    phone?: string
    avatarUrl?: string
  }
  try {
    payload = await req.json()
  } catch {
    return jsonResponse({ error: 'Invalid JSON body' }, 400)
  }

  const email = (payload.email ?? '').trim().toLowerCase()
  const role = (payload.role ?? 'employee') as Role
  if (!EMAIL_RE.test(email)) return jsonResponse({ error: 'A valid email is required' }, 400)
  if (!ROLES.includes(role)) return jsonResponse({ error: 'Invalid role' }, 400)

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
  )

  // ---- Authenticate the caller --------------------------------------------
  const token = req.headers.get('Authorization')?.replace(/^Bearer\s+/i, '')
  if (!token) return jsonResponse({ error: 'Authentication required' }, 401)

  const { data: authData, error: authErr } = await supabase.auth.getUser(token)
  if (authErr || !authData?.user) return jsonResponse({ error: 'Authentication required' }, 401)

  const { data: caller } = await supabase
    .from('profiles')
    .select('role, company_id, full_name')
    .eq('id', authData.user.id)
    .maybeSingle()

  if (!caller || (caller.role !== 'owner' && caller.role !== 'manager')) {
    return jsonResponse({ error: 'You are not allowed to invite users' }, 403)
  }

  // ---- Authorization rules -------------------------------------------------
  let targetCompany: string | null
  if (caller.role === 'manager') {
    if (role === 'owner') return jsonResponse({ error: 'Managers cannot invite owners' }, 403)
    // Managers can only add people to their own company.
    targetCompany = caller.company_id ?? null
    if (!targetCompany) return jsonResponse({ error: 'Your account is not linked to a company' }, 400)
  } else {
    // Owners may target any company (or none, e.g. platform-level owners).
    targetCompany = payload.companyId ?? null
  }

  const fullName = (payload.fullName ?? '').trim() || null
  const title = (payload.title ?? '').trim() || null
  const phone = (payload.phone ?? '').trim() || null
  const avatarUrl = (payload.avatarUrl ?? '').trim() || null

  // ---- Provision the role mapping (read by verify-otp on first login) ------
  const { error: roleErr } = await supabase.from('account_roles').upsert(
    {
      email,
      role,
      company_id: targetCompany,
      full_name: fullName,
      title,
      phone,
      avatar_url: avatarUrl,
    },
    { onConflict: 'email' },
  )
  if (roleErr) {
    console.error('account_roles upsert error', roleErr)
    return jsonResponse({ error: 'Could not provision the account' }, 500)
  }

  // ---- Record the invitation for auditing ----------------------------------
  const { error: inviteErr } = await supabase.from('invites').insert({
    company_id: targetCompany,
    email,
    role,
    invited_by: authData.user.id,
    token: randomToken(),
  })
  if (inviteErr) console.error('invites insert error (non-fatal)', inviteErr)

  // ---- Resolve company name for the email ----------------------------------
  let companyName: string | null = null
  if (targetCompany) {
    const { data: company } = await supabase
      .from('companies')
      .select('name')
      .eq('id', targetCompany)
      .maybeSingle()
    companyName = company?.name ?? null
  }

  // ---- Send the invitation email via Resend (shared banner template) -------
  const signInUrl = Deno.env.get('INVITE_APP_URL') ?? APP_URL

  const sent = await sendBrandedEmail({
    resendKey,
    to: email,
    subject: companyName
      ? `You've been added to ${companyName} on ${APP_NAME}`
      : `You've been added to ${APP_NAME}`,
    opts: inviteEmailOpts({
      signInUrl,
      roleLabel: ROLE_LABELS[role],
      companyName,
      inviterName: caller.full_name ?? null,
      invitee: email,
    }),
  })

  if (!sent) {
    // The account is provisioned even if the email fails — report partial success.
    return jsonResponse(
      { success: true, emailed: false, error: 'Account added but the email could not be sent' },
      200,
    )
  }

  return jsonResponse({ success: true, emailed: true })
})
