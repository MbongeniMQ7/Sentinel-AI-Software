// ============================================================================
// SentinelAI — verify-otp edge function
//
// POST { email: string, code: string }
//
//   1. Looks up the most recent unconsumed code for the email.
//   2. Enforces expiry + a max attempt count (5).
//   3. Compares the SHA-256 hash in constant time.
//   4. On success marks the code consumed and returns the stored role.
//
// Auto-injected by the Supabase runtime:
//   SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY
// ============================================================================

import { createClient } from 'jsr:@supabase/supabase-js@2'
import { corsHeaders, jsonResponse } from '../_shared/cors.ts'

const MAX_ATTEMPTS = 5
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

async function sha256Hex(input: string): Promise<string> {
  const data = new TextEncoder().encode(input)
  const digest = await crypto.subtle.digest('SHA-256', data)
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
}

// Constant-time comparison to avoid timing leaks.
function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false
  let mismatch = 0
  for (let i = 0; i < a.length; i++) mismatch |= a.charCodeAt(i) ^ b.charCodeAt(i)
  return mismatch === 0
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })
  if (req.method !== 'POST') return jsonResponse({ error: 'Method not allowed' }, 405)

  let payload: { email?: string; code?: string }
  try {
    payload = await req.json()
  } catch {
    return jsonResponse({ error: 'Invalid JSON body' }, 400)
  }

  const email = (payload.email ?? '').trim().toLowerCase()
  const code = (payload.code ?? '').trim()
  if (!EMAIL_RE.test(email)) return jsonResponse({ error: 'A valid email is required' }, 400)
  if (!/^\d{6}$/.test(code)) return jsonResponse({ error: 'Enter the 6-digit code' }, 400)

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
  )

  // Only pre-registered accounts may sign in. If an owner/admin never invited
  // this email (no account_roles row), reject before doing any work.
  const { data: account, error: accountErr } = await supabase
    .from('account_roles')
    .select('email')
    .eq('email', email)
    .maybeSingle()

  if (accountErr) return jsonResponse({ error: 'Could not verify code' }, 500)
  if (!account) {
    return jsonResponse(
      { error: "This email isn't registered. Ask your administrator to invite you first." },
      403,
    )
  }

  const { data: record, error: lookupErr } = await supabase
    .from('otp_codes')
    .select('id, code_hash, role, expires_at, consumed_at, attempts')
    .eq('email', email)
    .is('consumed_at', null)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (lookupErr) return jsonResponse({ error: 'Could not verify code' }, 500)
  if (!record) return jsonResponse({ error: 'No active code. Request a new one.' }, 400)

  if (new Date(record.expires_at).getTime() < Date.now()) {
    return jsonResponse({ error: 'Code expired. Request a new one.' }, 400)
  }

  if (record.attempts >= MAX_ATTEMPTS) {
    return jsonResponse({ error: 'Too many attempts. Request a new code.' }, 429)
  }

  const submittedHash = await sha256Hex(code)
  const matches = timingSafeEqual(submittedHash, record.code_hash)

  if (!matches) {
    await supabase
      .from('otp_codes')
      .update({ attempts: record.attempts + 1 })
      .eq('id', record.id)
    return jsonResponse({ error: 'Incorrect code' }, 401)
  }

  await supabase
    .from('otp_codes')
    .update({ consumed_at: new Date().toISOString() })
    .eq('id', record.id)

  // ---- Provision the auth user + profile and mint a session token ----------
  // generateLink (magiclink) creates the auth user if it doesn't exist and
  // returns a hashed_token the client exchanges for a real session.
  const { data: linkData, error: linkErr } = await supabase.auth.admin.generateLink({
    type: 'magiclink',
    email,
  })

  if (linkErr || !linkData?.user || !linkData.properties?.hashed_token) {
    console.error('generateLink error', linkErr)
    return jsonResponse({ error: 'Could not establish a session' }, 500)
  }

  const userId = linkData.user.id

  // Role / company come from the account_roles mapping (defaults to employee).
  const { data: mapping } = await supabase
    .from('account_roles')
    .select('role, company_id, full_name, title, phone, avatar_url')
    .eq('email', email)
    .maybeSingle()

  const role = mapping?.role ?? 'employee'
  const fullName = mapping?.full_name ?? email.split('@')[0]
  const companyId = mapping?.company_id ?? null

  // Link the profile to the auth user id so RLS (auth.uid()) resolves the role.
  const { error: upsertErr } = await supabase.from('profiles').upsert(
    {
      id: userId,
      email,
      role,
      company_id: companyId,
      full_name: fullName,
      title: mapping?.title ?? null,
      phone: mapping?.phone ?? null,
      avatar_url: mapping?.avatar_url ?? null,
      is_active: true,
      last_active_at: new Date().toISOString(),
    },
    { onConflict: 'id' },
  )

  // A seeded data profile may already own this email with a different id.
  // Fall back to updating that row's role/company so login still succeeds.
  if (upsertErr) {
    await supabase
      .from('profiles')
      .update({ role, company_id: companyId, last_active_at: new Date().toISOString() })
      .eq('email', email)
  }

  return jsonResponse({
    success: true,
    email,
    role,
    token_hash: linkData.properties.hashed_token,
  })
})
