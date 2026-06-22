// ============================================================================
// SentinelAI — send-otp edge function
//
// POST { email: string, role?: 'employee' | 'manager' | 'owner' }
//
//   1. Validates the email.
//   2. Rate-limits requests per email (max 1 code / 30s, 5 codes / hour).
//   3. Generates a 6-digit code, stores only its SHA-256 hash.
//   4. Emails the code to the user via Resend.
//
// Secrets (set with `supabase secrets set`):
//   RESEND_API_KEY   — Resend API key (required)
//   OTP_FROM_EMAIL   — verified sender, defaults to no-reply@mmqtech.co.za
//   OTP_REPLY_TO     — monitored reply mailbox, defaults to support@mmqtech.co.za
//   OTP_APP_NAME     — branding used in the email, defaults to "SentinelAI"
//
// Auto-injected by the Supabase runtime:
//   SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY
// ============================================================================

import { createClient } from 'jsr:@supabase/supabase-js@2'
import { corsHeaders, jsonResponse } from '../_shared/cors.ts'

const OTP_TTL_MINUTES = 10
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

async function sha256Hex(input: string): Promise<string> {
  const data = new TextEncoder().encode(input)
  const digest = await crypto.subtle.digest('SHA-256', data)
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
}

function generateCode(): string {
  // Cryptographically secure 6-digit code (000000–999999).
  const n = crypto.getRandomValues(new Uint32Array(1))[0] % 1_000_000
  return n.toString().padStart(6, '0')
}

function otpEmailText(appName: string, code: string): string {
  const year = new Date().getFullYear()
  return [
    `${appName} — Verify it's you`,
    '',
    `Your verification code is: ${code}`,
    '',
    `Enter this code to securely sign in to your workspace.`,
    `This code expires in ${OTP_TTL_MINUTES} minutes.`,
    '',
    `Didn't request this code? You can safely ignore this email — your account is still secure.`,
    '',
    `© ${year} ${appName} · Workforce Fatigue & Wellness Platform`,
  ].join('\n')
}

function otpEmailHtml(appName: string, code: string, logoUrl: string): string {
  const year = new Date().getFullYear()
  const spacedCode = code.split('').join('&nbsp;&nbsp;')
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta name="color-scheme" content="light dark" />
  <title>${appName} verification code</title>
</head>
<body style="margin:0;padding:0;background:#eef2fb;-webkit-font-smoothing:antialiased;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
  <span style="display:none!important;visibility:hidden;opacity:0;height:0;width:0;overflow:hidden;mso-hide:all;">Your ${appName} verification code is ${code}. It expires in ${OTP_TTL_MINUTES} minutes.</span>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#eef2fb;padding:32px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:480px;width:100%;background:#ffffff;border-radius:20px;overflow:hidden;box-shadow:0 10px 40px rgba(31,67,245,0.10);">
          <!-- Header / brand band -->
          <tr>
            <td style="background:linear-gradient(135deg,#1f43f5 0%,#3563ff 100%);padding:32px 32px 28px;text-align:center;">
              <img src="${logoUrl}" width="56" height="56" alt="${appName}" style="display:inline-block;width:56px;height:56px;object-fit:contain;border:0;outline:none;text-decoration:none;" />
              <div style="margin-top:12px;font-size:20px;font-weight:700;letter-spacing:-0.3px;color:#ffffff;">${appName}</div>
            </td>
          </tr>
          <!-- Body -->
          <tr>
            <td style="padding:36px 36px 8px;text-align:center;">
              <h1 style="margin:0 0 8px;font-size:22px;font-weight:700;color:#0f172a;letter-spacing:-0.4px;">Verify it's you</h1>
              <p style="margin:0 0 28px;font-size:15px;line-height:1.55;color:#475569;">
                Enter the code below to securely sign in to your workspace. This code expires in <strong style="color:#1f43f5;">${OTP_TTL_MINUTES} minutes</strong>.
              </p>
              <!-- Code -->
              <table role="presentation" align="center" cellpadding="0" cellspacing="0" style="margin:0 auto;">
                <tr>
                  <td style="background:#f4f6fd;border:1px solid #dbe2fb;border-radius:14px;padding:20px 28px;font-size:34px;font-weight:700;letter-spacing:8px;color:#1f43f5;font-family:'SF Mono',ui-monospace,Menlo,Consolas,monospace;">
                    ${spacedCode}
                  </td>
                </tr>
              </table>
              <p style="margin:28px 0 0;font-size:13px;line-height:1.55;color:#94a3b8;">
                Didn't request this code? You can safely ignore this email — your account is still secure.
              </p>
            </td>
          </tr>
          <!-- Divider -->
          <tr>
            <td style="padding:28px 36px 0;">
              <div style="border-top:1px solid #eef2fb;"></div>
            </td>
          </tr>
          <!-- Footer -->
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

  let payload: { email?: string; role?: string }
  try {
    payload = await req.json()
  } catch {
    return jsonResponse({ error: 'Invalid JSON body' }, 400)
  }

  const email = (payload.email ?? '').trim().toLowerCase()
  const role = payload.role
  if (!EMAIL_RE.test(email)) return jsonResponse({ error: 'A valid email is required' }, 400)
  if (role && !['employee', 'manager', 'owner'].includes(role)) {
    return jsonResponse({ error: 'Invalid role' }, 400)
  }

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
  )

  // ---- Authorization: only pre-registered accounts may sign in -------------
  // An email can only receive a code if an owner/admin invited it first
  // (i.e. it exists in account_roles). This blocks unknown emails entirely.
  const { data: account, error: accountErr } = await supabase
    .from('account_roles')
    .select('email')
    .eq('email', email)
    .maybeSingle()

  if (accountErr) return jsonResponse({ error: 'Could not process request' }, 500)
  if (!account) {
    return jsonResponse(
      { error: "This email isn't registered. Ask your administrator to invite you first." },
      403,
    )
  }

  // ---- Rate limiting -------------------------------------------------------
  const { data: recent, error: recentErr } = await supabase
    .from('otp_codes')
    .select('created_at')
    .eq('email', email)
    .gte('created_at', new Date(Date.now() - 60 * 60 * 1000).toISOString())
    .order('created_at', { ascending: false })

  if (recentErr) return jsonResponse({ error: 'Could not process request' }, 500)

  if (recent && recent.length > 0) {
    const lastSent = new Date(recent[0].created_at).getTime()
    if (Date.now() - lastSent < 30 * 1000) {
      return jsonResponse({ error: 'Please wait before requesting another code' }, 429)
    }
    if (recent.length >= 5) {
      return jsonResponse({ error: 'Too many codes requested. Try again later.' }, 429)
    }
  }

  // ---- Generate + persist --------------------------------------------------
  const code = generateCode()
  const codeHash = await sha256Hex(code)
  const expiresAt = new Date(Date.now() + OTP_TTL_MINUTES * 60 * 1000).toISOString()
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? null

  const { error: insertErr } = await supabase.from('otp_codes').insert({
    email,
    code_hash: codeHash,
    role: role ?? null,
    expires_at: expiresAt,
    ip_address: ip,
  })

  if (insertErr) return jsonResponse({ error: 'Could not generate code' }, 500)

  // ---- Send via Resend -----------------------------------------------------
  const appName = Deno.env.get('OTP_APP_NAME') ?? 'SentinelAI'
  const fromEmail = Deno.env.get('OTP_FROM_EMAIL') ?? 'no-reply@mmqtech.co.za'
  const replyTo = Deno.env.get('OTP_REPLY_TO') ?? 'support@mmqtech.co.za'
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
      reply_to: replyTo,
      to: [email],
      subject: `Your ${appName} verification code`,
      html: otpEmailHtml(appName, code, logoUrl),
      text: otpEmailText(appName, code),
    }),
  })

  if (!emailRes.ok) {
    const detail = await emailRes.text()
    console.error('Resend error', emailRes.status, detail)
    return jsonResponse({ error: 'Could not send verification email' }, 502)
  }

  return jsonResponse({ success: true, expires_at: expiresAt })
})
