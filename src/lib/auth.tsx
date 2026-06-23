import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import type { Session } from '@supabase/supabase-js'
import { supabase } from './supabase'
import { employeeAvatar, managerAvatar, ownerAvatar } from './avatars'

export type Role = 'employee' | 'manager' | 'owner'

export interface SessionUser {
  id: string
  name: string
  email: string
  role: Role
  title: string
  phone: string
  avatarUrl: string
  companyId: string | null
}

const roleAvatar: Record<Role, string> = {
  employee: employeeAvatar,
  manager: managerAvatar,
  owner: ownerAvatar,
}

interface AuthContextValue {
  user: SessionUser | null
  loading: boolean
  pendingEmail: string | null
  setPendingEmail: (email: string) => void
  refresh: () => Promise<void>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

async function loadProfile(userId: string, fallbackEmail: string): Promise<SessionUser | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select('id, full_name, email, role, title, phone, avatar_url, company_id')
    .eq('id', userId)
    .maybeSingle()

  if (error || !data) return null
  const role = (data.role ?? 'employee') as Role
  return {
    id: data.id,
    name: data.full_name ?? fallbackEmail.split('@')[0],
    email: data.email ?? fallbackEmail,
    role,
    title: data.title ?? '',
    phone: data.phone ?? '',
    avatarUrl: data.avatar_url ?? roleAvatar[role],
    companyId: data.company_id ?? null,
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<SessionUser | null>(null)
  const [loading, setLoading] = useState(true)
  const [pendingEmail, setPendingEmail] = useState<string | null>(null)

  const applySession = async (session: Session | null) => {
    if (session?.user) {
      setUser(await loadProfile(session.user.id, session.user.email ?? ''))
    } else {
      setUser(null)
    }
    setLoading(false)
  }

  useEffect(() => {
    const mockUserStr = localStorage.getItem('sentinel_mock_user')
    if (mockUserStr) {
      setUser(JSON.parse(mockUserStr))
      setLoading(false)
      return
    }

    supabase.auth.getSession().then(({ data }) => applySession(data.session))
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      applySession(session)
    })
    return () => sub.subscription.unsubscribe()
  }, [])

  const refresh = async () => {
    const mockUserStr = localStorage.getItem('sentinel_mock_user')
    if (mockUserStr) {
      setUser(JSON.parse(mockUserStr))
      return
    }

    const { data } = await supabase.auth.getSession()
    await applySession(data.session)
  }

  const logout = async () => {
    localStorage.removeItem('sentinel_mock_user')
    await supabase.auth.signOut()
    setUser(null)
    setPendingEmail(null)
  }

  return (
    <AuthContext.Provider
      value={{ user, loading, pendingEmail, setPendingEmail, refresh, logout }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}

export const roleHome: Record<Role, string> = {
  employee: '/user/dashboard',
  manager: '/admin/dashboard',
  owner: '/owner/dashboard',
}
