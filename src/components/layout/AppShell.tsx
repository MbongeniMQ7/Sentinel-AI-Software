import { useMemo, useState } from 'react'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import {
  Bell,
  ChevronDown,
  LogOut,
  Menu,
  Moon,
  Search,
  Settings,
  Sun,
  UserCog,
  X,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAuth, type Role } from '@/lib/auth'
import { useTheme } from '@/lib/theme'
import { navConfig, roleMeta, type NavGroup } from '@/lib/nav'
import { Avatar } from '@/components/ui/Avatar'
import { logoUrl } from '@/components/shared/Logo'
import { Button } from '@/components/ui/Button'
import { Dropdown, DropdownDivider, DropdownItem } from '@/components/ui/Dropdown'
import { Input } from '@/components/ui/Input'

interface AppShellProps {
  role: Role
}

function GlobalSearch({ groups }: { groups: NavGroup[] }) {
  const navigate = useNavigate()
  const [query, setQuery] = useState('')
  const [open, setOpen] = useState(false)
  const items = useMemo(
    () => groups.flatMap((g) => g.items.map((i) => ({ ...i, group: g.title }))),
    [groups],
  )
  const results = useMemo(
    () => (query ? items.filter((i) => i.label.toLowerCase().includes(query.toLowerCase())) : []),
    [query, items],
  )
  const go = (to: string) => {
    setQuery('')
    setOpen(false)
    navigate(to)
  }
  return (
    <div className="relative hidden max-w-md flex-1 sm:block">
      <Input
        icon={<Search className="h-4 w-4" />}
        placeholder="Search pages…"
        value={query}
        onChange={(e) => { setQuery(e.target.value); setOpen(true) }}
        onFocus={() => setOpen(true)}
        onBlur={() => setTimeout(() => setOpen(false), 150)}
        onKeyDown={(e) => { if (e.key === 'Enter' && results[0]) go(results[0].to) }}
        className="h-9 bg-surface-subtle"
      />
      {open && query && (
        <div className="absolute left-0 right-0 top-11 z-40 overflow-hidden rounded-xl border border-line bg-surface shadow-pop">
          {results.length === 0 ? (
            <p className="px-3 py-3 text-sm text-ink-subtle">No pages match “{query}”</p>
          ) : (
            results.slice(0, 8).map((r) => (
              <button
                key={r.to}
                onMouseDown={() => go(r.to)}
                className="flex w-full items-center gap-3 px-3 py-2 text-left text-sm hover:bg-surface-muted"
              >
                <r.icon className="h-4 w-4 text-ink-subtle" />
                <span className="flex-1 text-ink">{r.label}</span>
                <span className="text-[11px] text-ink-subtle">{r.group}</span>
              </button>
            ))
          )}
        </div>
      )}
    </div>
  )
}

export function AppShell({ role }: AppShellProps) {
  const [mobileOpen, setMobileOpen] = useState(false)
  const { user, logout } = useAuth()
  const { theme, toggle } = useTheme()
  const navigate = useNavigate()
  const meta = roleMeta[role]
  const groups = navConfig[role]

  const handleLogout = async () => {
    await logout()
    navigate('/')
  }

  const settingsPath = { employee: '/user/settings', manager: '/admin/settings', owner: '/owner/settings' }[role]
  const profilePath = '/user/profile'

  return (
    <div className="flex h-full bg-surface-subtle">
      {/* Sidebar */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 flex w-72 flex-col border-r border-line bg-surface transition-transform lg:static lg:translate-x-0',
          mobileOpen ? 'translate-x-0' : '-translate-x-full',
        )}
      >
        <div className="flex h-16 items-center justify-between border-b border-line px-5">
          <div className="flex items-center gap-2.5">
            <img src={logoUrl} alt="SentinelAI" className="h-9 w-9 object-contain" draggable={false} />
            <div>
              <p className="text-sm font-bold tracking-tight text-ink">SentinelAI</p>
              <p className={cn('text-[11px] font-medium', meta.accent)}>{meta.label}</p>
            </div>
          </div>
          <button className="lg:hidden" onClick={() => setMobileOpen(false)} aria-label="Close menu">
            <X className="h-5 w-5 text-ink-muted" />
          </button>
        </div>

        <nav className="flex-1 space-y-6 overflow-y-auto px-3 py-5">
          {groups.map((group) => (
            <div key={group.title}>
              <p className="px-3 pb-2 text-[11px] font-semibold uppercase tracking-wider text-ink-subtle">{group.title}</p>
              <div className="space-y-0.5">
                {group.items.map((item) => (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    onClick={() => setMobileOpen(false)}
                    className={({ isActive }) =>
                      cn(
                        'group flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition-colors',
                        isActive
                          ? 'bg-brand-50 text-brand-700 dark:bg-brand-950/50 dark:text-brand-300'
                          : 'text-ink-muted hover:bg-surface-muted hover:text-ink',
                      )
                    }
                  >
                    {({ isActive }) => (
                      <>
                        <item.icon className={cn('h-[18px] w-[18px]', isActive ? 'text-brand-600' : 'text-ink-subtle group-hover:text-ink')} />
                        <span className="flex-1">{item.label}</span>
                        {item.badge && (
                          <span className="rounded-full bg-rose-500 px-1.5 py-0.5 text-[10px] font-bold text-white">{item.badge}</span>
                        )}
                      </>
                    )}
                  </NavLink>
                ))}
              </div>
            </div>
          ))}
        </nav>

        <div className="border-t border-line p-3">
          <div className="flex items-center gap-3 rounded-xl px-2 py-2">
            <Avatar name={user?.name ?? 'User'} src={user?.avatarUrl} size="sm" status="online" />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-ink">{user?.name}</p>
              <p className="truncate text-xs text-ink-subtle">{user?.title}</p>
            </div>
          </div>
        </div>
      </aside>

      {mobileOpen && <div className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-sm lg:hidden" onClick={() => setMobileOpen(false)} />}

      {/* Main */}
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-line bg-surface/80 px-4 backdrop-blur-md sm:px-6">
          <button className="lg:hidden" onClick={() => setMobileOpen(true)} aria-label="Open menu">
            <Menu className="h-5 w-5 text-ink-muted" />
          </button>

          <GlobalSearch groups={groups} />

          <div className="ml-auto flex items-center gap-1.5">
            <Button variant="ghost" size="icon" onClick={toggle} aria-label="Toggle theme">
              {theme === 'dark' ? <Sun className="h-[18px] w-[18px]" /> : <Moon className="h-[18px] w-[18px]" />}
            </Button>

            <Dropdown
              trigger={
                <Button variant="ghost" size="icon" className="relative" aria-label="Notifications">
                  <Bell className="h-[18px] w-[18px]" />
                  <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-rose-500 ring-2 ring-surface" />
                </Button>
              }
              className="w-80"
            >
              <div className="px-3 py-2">
                <p className="text-sm font-semibold text-ink">Notifications</p>
              </div>
              <DropdownDivider />
              {[
                { t: 'Critical fatigue alert', d: 'Marcus Cole · Zone 3', time: '2m' },
                { t: 'Break request approved', d: 'Your 15m break starts now', time: '12m' },
                { t: 'New report ready', d: 'Weekly wellness summary', time: '1h' },
              ].map((n) => (
                <button key={n.t} className="flex w-full items-start gap-3 rounded-lg px-3 py-2 text-left hover:bg-surface-muted">
                  <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-brand-500" />
                  <span className="min-w-0">
                    <span className="block text-sm font-medium text-ink">{n.t}</span>
                    <span className="block truncate text-xs text-ink-muted">{n.d}</span>
                  </span>
                  <span className="ml-auto shrink-0 text-[11px] text-ink-subtle">{n.time}</span>
                </button>
              ))}
            </Dropdown>

            <Dropdown
              trigger={
                <button className="flex items-center gap-2 rounded-xl px-1.5 py-1 hover:bg-surface-muted focus-ring">
                  <Avatar name={user?.name ?? 'User'} src={user?.avatarUrl} size="sm" />
                  <ChevronDown className="hidden h-4 w-4 text-ink-subtle sm:block" />
                </button>
              }
            >
              <div className="px-3 py-2">
                <p className="text-sm font-medium text-ink">{user?.name}</p>
                <p className="text-xs text-ink-subtle">{user?.email}</p>
              </div>
              <DropdownDivider />
              {role === 'employee' && (
                <DropdownItem icon={<UserCog className="h-4 w-4" />} onClick={() => navigate(profilePath)}>
                  Profile
                </DropdownItem>
              )}
              <DropdownItem icon={<Settings className="h-4 w-4" />} onClick={() => navigate(settingsPath)}>
                Settings
              </DropdownItem>
              <DropdownDivider />
              <DropdownItem icon={<LogOut className="h-4 w-4" />} danger onClick={handleLogout}>
                Sign out
              </DropdownItem>
            </Dropdown>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto">
          <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:py-8">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}
