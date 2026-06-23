import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL || 'https://fohowwcyimfhtasqusys.supabase.co'
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'mock-anon-key'

// We will not throw dynamic crashes so the entire application is fully loadable 
// as an offline preview frontend.
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
  const isDemo = !import.meta.env.VITE_SUPABASE_URL || import.meta.env.VITE_SUPABASE_URL.includes('placeholder') || import.meta.env.VITE_SUPABASE_URL.includes('mock')
  if (isDemo) {
    return // Resolve immediately for demo purposes
  }

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
  const isDemo = !import.meta.env.VITE_SUPABASE_URL || import.meta.env.VITE_SUPABASE_URL.includes('placeholder') || import.meta.env.VITE_SUPABASE_URL.includes('mock')
  if (isDemo) {
    // Determine target mock role
    let role = 'employee'
    const value = email.trim().toLowerCase()
    if (value.includes('manager') || value.includes('admin') || value.includes('priya') || value.includes('marcus')) {
      role = 'manager'
    } else if (value.includes('owner') || value.includes('director') || value.includes('ceo') || value.includes('executive')) {
      role = 'owner'
    }

    const mockUser = {
      id: 'mock-user-id',
      name: email.split('@')[0].split('.').map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(' '),
      email: email,
      role: role,
      title: role === 'manager' ? 'Shift Manager · Operations' : role === 'owner' ? 'Company Director' : 'Line Operator',
      avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150',
      companyId: 'comp-1'
    }
    localStorage.setItem('sentinel_mock_user', JSON.stringify(mockUser))
    return { role }
  }

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
