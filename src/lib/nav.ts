import {
  AlertTriangle,
  BadgeDollarSign,
  Bell,
  Building2,
  CalendarDays,
  ClipboardList,
  Coffee,
  Cpu,
  FileBarChart,
  Gauge,
  HeartPulse,
  HelpCircle,
  LayoutDashboard,
  LineChart,
  Network,
  ScrollText,
  Settings,
  ShieldCheck,
  UserCog,
  UserPlus,
  Users,
  Wallet,
  type LucideIcon,
} from 'lucide-react'
import type { Role } from './auth'

export interface NavItem {
  label: string
  to: string
  icon: LucideIcon
  badge?: string
}

export interface NavGroup {
  title: string
  items: NavItem[]
}

export const navConfig: Record<Role, NavGroup[]> = {
  employee: [
    {
      title: 'Overview',
      items: [
        { label: 'Dashboard', to: '/user/dashboard', icon: LayoutDashboard },
        { label: 'Live Monitoring', to: '/user/monitoring', icon: HeartPulse },
        { label: 'Alert Center', to: '/user/alerts', icon: AlertTriangle, badge: '3' },
      ],
    },
    {
      title: 'Wellness',
      items: [
        { label: 'Break Management', to: '/user/breaks', icon: Coffee },
        { label: 'Leave Management', to: '/user/leave', icon: CalendarDays },
        { label: 'Reports', to: '/user/reports', icon: FileBarChart },
      ],
    },
    {
      title: 'Account',
      items: [
        { label: 'Profile', to: '/user/profile', icon: UserCog },
        { label: 'Settings', to: '/user/settings', icon: Settings },
        { label: 'Support', to: '/user/support', icon: HelpCircle },
      ],
    },
  ],
  manager: [
    {
      title: 'Operations',
      items: [
        { label: 'Dashboard', to: '/admin/dashboard', icon: LayoutDashboard },
        { label: 'Workforce', to: '/admin/workforce', icon: Users },
        { label: 'Alerts', to: '/admin/alerts', icon: AlertTriangle, badge: '7' },
        { label: 'Fatigue Analytics', to: '/admin/analytics', icon: LineChart },
      ],
    },
    {
      title: 'Management',
      items: [
        { label: 'Devices', to: '/admin/devices', icon: Cpu },
        { label: 'Approvals', to: '/admin/approvals', icon: ClipboardList, badge: '5' },
        { label: 'Reports', to: '/admin/reports', icon: FileBarChart },
        { label: 'Onboarding', to: '/admin/onboarding', icon: UserPlus },
      ],
    },
    {
      title: 'Governance',
      items: [
        { label: 'Hierarchy', to: '/admin/hierarchy', icon: Network },
        { label: 'Audit Logs', to: '/admin/audit', icon: ScrollText },
        { label: 'Settings', to: '/admin/settings', icon: Settings },
      ],
    },
  ],
  owner: [
    {
      title: 'Overview',
      items: [
        { label: 'Home', to: '/owner/dashboard', icon: LayoutDashboard },
        { label: 'Users', to: '/owner/users', icon: Users },
        { label: 'Companies', to: '/owner/companies', icon: Building2 },
      ],
    },
    {
      title: 'Financials',
      items: [
        { label: 'Revenue', to: '/owner/revenue', icon: LineChart },
      ],
    },
    {
      title: 'Safety & Monitoring',
      items: [
        { label: 'Alerts', to: '/owner/alerts', icon: AlertTriangle },
        { label: 'IoT Wristbands', to: '/owner/fleet', icon: Cpu },
      ],
    },
    {
      title: 'Operations',
      items: [
        { label: 'Issues', to: '/owner/issues', icon: HelpCircle },
        { label: 'Audit Log', to: '/owner/audit', icon: ScrollText },
        { label: 'Reports', to: '/owner/reports', icon: FileBarChart },
      ],
    },
    {
      title: 'Management',
      items: [
        { label: 'Create Manager', to: '/owner/create-manager', icon: UserPlus },
        { label: 'Settings', to: '/owner/settings', icon: Settings },
      ],
    },
  ],
}

export const roleMeta: Record<Role, { label: string; accent: string; icons: LucideIcon[] }> = {
  employee: { label: 'Employee Workspace', accent: 'text-brand-600', icons: [Gauge, HeartPulse] },
  manager: { label: 'Manager Console', accent: 'text-violet-600', icons: [ShieldCheck, Bell] },
  owner: { label: 'Owner Platform', accent: 'text-emerald-600', icons: [BadgeDollarSign, Wallet] },
}
