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
import { APP_NAME, APP_URL, sendBrandedEmail, type BrandedEmailOptions } from '../_shared/email.ts'

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

function otpEmailOpts(code: string): BrandedEmailOptions {
  const spacedCode = code.split('').join('&nbsp;&nbsp;')
  const codeBox = `<span style="display:inline-block;background:#f4f6fd;border:1px solid #dbe2fb;border-radius:14px;padding:18px 30px;font-size:32px;font-weight:700;letter-spacing:8px;color:#1f43f5;font-family:'SF Mono',ui-monospace,Menlo,Consolas,monospace;">${spacedCode}</span>`
  return {
    preheader: `Your ${APP_NAME} verification code is ${code}. It expires in ${OTP_TTL_MINUTES} minutes.`,
    heading: "Verify it's you",
    intro: `Enter the code below to securely sign in to your workspace. This code expires in <strong style="color:#1f43f5;">${OTP_TTL_MINUTES} minutes</strong>.`,
    highlight: codeBox,
    cta: { label: `Open ${APP_NAME}`, url: APP_URL },
    footnote:
      "Didn't request this code? You can safely ignore this email — your account is still secure.",
  }
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

  // ---- Send via Resend (shared banner-branded template) --------------------
  const sent = await sendBrandedEmail({
    resendKey,
    to: email,
    subject: `Your ${APP_NAME} verification code`,
    opts: otpEmailOpts(code),
  })

  if (!sent) return jsonResponse({ error: 'Could not send verification email' }, 502)

  return jsonResponse({ success: true, expires_at: expiresAt })
})
