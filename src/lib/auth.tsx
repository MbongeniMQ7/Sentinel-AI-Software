import { createContext, useContext, useState, type ReactNode } from 'react'
import { employeeAvatar, managerAvatar, ownerAvatar } from './avatars'

export type Role = 'employee' | 'manager' | 'owner'

export interface SessionUser {
  name: string
  email: string
  role: Role
  title: string
  avatarUrl: string
}

const ROLE_PROFILES: Record<Role, SessionUser> = {
  employee: {
    name: 'Alex Mercer',
    email: 'alex.mercer@sentinel.ai',
    role: 'employee',
    title: 'Line Operator · Plant 4',
    avatarUrl: employeeAvatar,
  },
  manager: {
    name: 'Priya Nair',
    email: 'priya.nair@sentinel.ai',
    role: 'manager',
    title: 'Shift Manager · Operations',
    avatarUrl: managerAvatar,
  },
  owner: {
    name: 'Jordan Vale',
    email: 'jordan.vale@sentinel.ai',
    role: 'owner',
    title: 'Founder & CEO',
    avatarUrl: ownerAvatar,
  },
}

interface AuthContextValue {
  user: SessionUser | null
  pendingRole: Role | null
  setPendingRole: (r: Role) => void
  login: (r: Role) => void
  logout: () => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<SessionUser | null>(null)
  const [pendingRole, setPendingRole] = useState<Role | null>(null)

  const login = (r: Role) => setUser(ROLE_PROFILES[r])
  const logout = () => {
    setUser(null)
    setPendingRole(null)
  }

  return (
    <AuthContext.Provider value={{ user, pendingRole, setPendingRole, login, logout }}>
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
