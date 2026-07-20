import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL || 'https://fohowwcyimfhtasqusys.supabase.co'
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_vZK_pxXB-eV_sRgnrtEaQQ_YSQYeCaG'

// Demo mode is based on the RESOLVED endpoint, not on whether the env var is
// present. This guarantees a real deployment (which falls back to the real URL
// + publishable key above) always calls the live backend and actually sends
// OTP emails, instead of silently short-circuiting into a mock session.
const IS_DEMO = url.includes('placeholder') || url.includes('mock') || anonKey === 'mock-anon-key'

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
  if (IS_DEMO) {
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
 * Verify an OTP code. On success the edge function returns real Supabase
 * session tokens which are applied locally so RLS-protected queries run as
 * this user.
 */
export async function verifyOtp(email: string, code: string): Promise<{ role: string }> {
  if (IS_DEMO) {
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

  const { error } = await supabase.auth.setSession({
    access_token: data.access_token,
    refresh_token: data.refresh_token,
  })
  if (error) throw new Error('Could not establish your session')

  return { role: data.role }
}
