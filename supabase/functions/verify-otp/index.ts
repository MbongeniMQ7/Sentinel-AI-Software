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

  const { error: consumeErr } = await supabase
    .from('otp_codes')
    .update({ consumed_at: new Date().toISOString() })
    .eq('id', record.id)

  if (consumeErr) return jsonResponse({ error: 'Could not verify code' }, 500)

  return jsonResponse({ success: true, email, role: record.role ?? null })
})
