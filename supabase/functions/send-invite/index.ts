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
//   OTP_FROM_EMAIL   — verified sender, defaults to onboarding@resend.dev
//   OTP_APP_NAME     — branding, defaults to "SentinelAI"
//   INVITE_APP_URL   — sign-in URL, defaults to the production site
//
// Auto-injected by the Supabase runtime:
//   SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY
// ============================================================================

import { createClient } from 'jsr:@supabase/supabase-js@2'
import { corsHeaders, jsonResponse } from '../_shared/cors.ts'

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

function inviteEmailHtml(opts: {
  appName: string
  logoUrl: string
  signInUrl: string
  roleLabel: string
  companyName: string | null
  inviterName: string | null
  invitee: string
}): string {
  const { appName, logoUrl, signInUrl, roleLabel, companyName, inviterName, invitee } = opts
  const year = new Date().getFullYear()
  const intro = inviterName
    ? `${inviterName} has added you to ${appName}`
    : `You've been added to ${appName}`
  const scope = companyName
    ? `as a <strong style="color:#1f43f5;">${roleLabel}</strong> for <strong style="color:#0f172a;">${companyName}</strong>`
    : `as a <strong style="color:#1f43f5;">${roleLabel}</strong>`
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta name="color-scheme" content="light dark" />
  <title>You've been invited to ${appName}</title>
</head>
<body style="margin:0;padding:0;background:#eef2fb;-webkit-font-smoothing:antialiased;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
  <span style="display:none!important;visibility:hidden;opacity:0;height:0;width:0;overflow:hidden;mso-hide:all;">${intro} ${scope.replace(/<[^>]+>/g, '')}. Sign in with ${invitee} to get started.</span>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#eef2fb;padding:32px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:480px;width:100%;background:#ffffff;border-radius:20px;overflow:hidden;box-shadow:0 10px 40px rgba(31,67,245,0.10);">
          <tr>
            <td style="background:linear-gradient(135deg,#1f43f5 0%,#3563ff 100%);padding:32px 32px 28px;text-align:center;">
              <img src="${logoUrl}" width="56" height="56" alt="${appName}" style="display:inline-block;width:56px;height:56px;object-fit:contain;border:0;outline:none;text-decoration:none;" />
              <div style="margin-top:12px;font-size:20px;font-weight:700;letter-spacing:-0.3px;color:#ffffff;">${appName}</div>
            </td>
          </tr>
          <tr>
            <td style="padding:36px 36px 8px;text-align:center;">
              <h1 style="margin:0 0 8px;font-size:22px;font-weight:700;color:#0f172a;letter-spacing:-0.4px;">You're invited</h1>
              <p style="margin:0 0 24px;font-size:15px;line-height:1.6;color:#475569;">
                ${intro} ${scope}.
              </p>
              <p style="margin:0 0 28px;font-size:15px;line-height:1.6;color:#475569;">
                Sign in with this email address — <strong style="color:#0f172a;">${invitee}</strong> — and we'll send a one-time code to verify it's you. No password required.
              </p>
              <table role="presentation" align="center" cellpadding="0" cellspacing="0" style="margin:0 auto;">
                <tr>
                  <td style="border-radius:12px;background:linear-gradient(135deg,#1f43f5 0%,#3563ff 100%);">
                    <a href="${signInUrl}" target="_blank" style="display:inline-block;padding:14px 32px;font-size:15px;font-weight:600;color:#ffffff;text-decoration:none;border-radius:12px;">Sign in to ${appName}</a>
                  </td>
                </tr>
              </table>
              <p style="margin:28px 0 0;font-size:13px;line-height:1.55;color:#94a3b8;">
                If you weren't expecting this invitation, you can safely ignore this email.
              </p>
            </td>
          </tr>
          <tr>
            <td style="padding:28px 36px 0;">
              <div style="border-top:1px solid #eef2fb;"></div>
            </td>
          </tr>
          <tr>
            <td style="padding:18px 36px 32px;text-align:center;">
              <p style="margin:0 0 4px;font-size:12px;color:#94a3b8;">Sent by ${appName} · Workforce Fatigue &amp; Wellness Platform</p>
              <p style="margin:0;font-size:12px;color:#cbd5e1;">© ${year} ${appName}. All rights reserved.</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`
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

  // ---- Send the invitation email via Resend --------------------------------
  const appName = Deno.env.get('OTP_APP_NAME') ?? 'SentinelAI'
  const fromEmail = Deno.env.get('OTP_FROM_EMAIL') ?? 'onboarding@resend.dev'
  const signInUrl = Deno.env.get('INVITE_APP_URL') ?? 'https://sentinel-ai-software.vercel.app'
  const logoUrl =
    Deno.env.get('OTP_LOGO_URL') ??
    `${Deno.env.get('SUPABASE_URL')}/storage/v1/object/public/public-assets/logo.png`

  const emailRes = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${resendKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: `${appName} <${fromEmail}>`,
      to: [email],
      subject: companyName
        ? `You've been added to ${companyName} on ${appName}`
        : `You've been invited to ${appName}`,
      html: inviteEmailHtml({
        appName,
        logoUrl,
        signInUrl,
        roleLabel: ROLE_LABELS[role],
        companyName,
        inviterName: caller.full_name ?? null,
        invitee: email,
      }),
    }),
  })

  if (!emailRes.ok) {
    const detail = await emailRes.text()
    console.error('Resend error', emailRes.status, detail)
    // The account is provisioned even if the email fails — report partial success.
    return jsonResponse(
      { success: true, emailed: false, error: 'Account added but the email could not be sent' },
      200,
    )
  }

  return jsonResponse({ success: true, emailed: true })
})
