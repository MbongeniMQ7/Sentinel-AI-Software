import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!url || !anonKey) {
  throw new Error(
    'Missing Supabase env vars. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env.local',
  )
}

export const supabase = createClient(url, anonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: false,
  },
})

const FUNCTIONS_BASE = `${url}/functions/v1`

/** Request an OTP code be emailed to the address. */
export async function requestOtp(email: string): Promise<void> {
  const res = await fetch(`${FUNCTIONS_BASE}/send-otp`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', apikey: anonKey },
    body: JSON.stringify({ email }),
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(data.error ?? 'Could not send the code')
}

/**
 * Verify an OTP code. On success the returned token_hash is exchanged for a
 * real Supabase session so RLS-protected queries run as this user.
 */
export async function verifyOtp(email: string, code: string): Promise<{ role: string }> {
  const res = await fetch(`${FUNCTIONS_BASE}/verify-otp`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', apikey: anonKey },
    body: JSON.stringify({ email, code }),
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(data.error ?? 'Could not verify the code')

  const { error } = await supabase.auth.verifyOtp({
    token_hash: data.token_hash,
    type: 'magiclink',
  })
  if (error) throw new Error('Could not establish your session')

  return { role: data.role }
}
