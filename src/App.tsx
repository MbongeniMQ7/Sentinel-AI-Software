import { Navigate, Route, Routes } from 'react-router-dom'
import { useAuth, roleHome, type Role } from '@/lib/auth'
import { AppShell } from '@/components/layout/AppShell'

// Auth
import { Landing } from '@/features/auth/Landing'
import { RoleSelect } from '@/features/auth/RoleSelect'
import { OtpVerify } from '@/features/auth/OtpVerify'
import { NotFound } from '@/features/NotFound'

// Employee
import { EmployeeDashboard } from '@/features/employee/EmployeeDashboard'
import { EmployeeMonitoring } from '@/features/employee/EmployeeMonitoring'
import { EmployeeAlerts } from '@/features/employee/EmployeeAlerts'
import { EmployeeBreaks } from '@/features/employee/EmployeeBreaks'
import { EmployeeLeave } from '@/features/employee/EmployeeLeave'
import { EmployeeReports } from '@/features/employee/EmployeeReports'
import { EmployeeProfile } from '@/features/employee/EmployeeProfile'
import { EmployeeSettings } from '@/features/employee/EmployeeSettings'
import { EmployeeSupport } from '@/features/employee/EmployeeSupport'

// Manager
import { ManagerDashboard } from '@/features/manager/ManagerDashboard'
import { ManagerWorkforce } from '@/features/manager/ManagerWorkforce'
import { ManagerEmployeeDetail } from '@/features/manager/ManagerEmployeeDetail'
import { ManagerAlerts } from '@/features/manager/ManagerAlerts'
import { ManagerAnalytics } from '@/features/manager/ManagerAnalytics'
import { ManagerDevices } from '@/features/manager/ManagerDevices'
import { ManagerApprovals } from '@/features/manager/ManagerApprovals'
import { ManagerReports } from '@/features/manager/ManagerReports'
import { ManagerOnboarding } from '@/features/manager/ManagerOnboarding'
import { ManagerHierarchy } from '@/features/manager/ManagerHierarchy'
import { ManagerAudit } from '@/features/manager/ManagerAudit'
import { ManagerSettings } from '@/features/manager/ManagerSettings'

// Owner
import { OwnerDashboard } from '@/features/owner/OwnerDashboard'
import { OwnerActivity } from '@/features/owner/OwnerActivity'
import { OwnerUsers } from '@/features/owner/OwnerUsers'
import { OwnerCompanies } from '@/features/owner/OwnerCompanies'
import { OwnerFleet } from '@/features/owner/OwnerFleet'
import { OwnerBilling } from '@/features/owner/OwnerBilling'
import { OwnerRevenue } from '@/features/owner/OwnerRevenue'
import { OwnerReports } from '@/features/owner/OwnerReports'
import { OwnerSettings } from '@/features/owner/OwnerSettings'

function RequireRole({ role }: { role: Role }) {
  const { user, loading } = useAuth()
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-surface-subtle">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-line border-t-brand-600" />
      </div>
    )
  }
  if (!user) return <Navigate to="/auth/role" replace />
  if (user.role !== role) return <Navigate to={roleHome[user.role]} replace />
  return <AppShell role={role} />
}

export default function App() {
  return (
    <Routes>
      {/* Public / auth */}
      <Route path="/" element={<Landing />} />
      <Route path="/auth/role" element={<RoleSelect />} />
      <Route path="/auth/verify" element={<OtpVerify />} />

      {/* Employee */}
      <Route path="/user" element={<RequireRole role="employee" />}>
        <Route index element={<Navigate to="/user/dashboard" replace />} />
        <Route path="dashboard" element={<EmployeeDashboard />} />
        <Route path="monitoring" element={<EmployeeMonitoring />} />
        <Route path="alerts" element={<EmployeeAlerts />} />
        <Route path="breaks" element={<EmployeeBreaks />} />
        <Route path="leave" element={<EmployeeLeave />} />
        <Route path="reports" element={<EmployeeReports />} />
        <Route path="profile" element={<EmployeeProfile />} />
        <Route path="settings" element={<EmployeeSettings />} />
        <Route path="support" element={<EmployeeSupport />} />
      </Route>

      {/* Manager */}
      <Route path="/admin" element={<RequireRole role="manager" />}>
        <Route index element={<Navigate to="/admin/dashboard" replace />} />
        <Route path="dashboard" element={<ManagerDashboard />} />
        <Route path="workforce" element={<ManagerWorkforce />} />
        <Route path="workforce/:id" element={<ManagerEmployeeDetail />} />
        <Route path="alerts" element={<ManagerAlerts />} />
        <Route path="analytics" element={<ManagerAnalytics />} />
        <Route path="devices" element={<ManagerDevices />} />
        <Route path="approvals" element={<ManagerApprovals />} />
        <Route path="reports" element={<ManagerReports />} />
        <Route path="onboarding" element={<ManagerOnboarding />} />
        <Route path="hierarchy" element={<ManagerHierarchy />} />
        <Route path="audit" element={<ManagerAudit />} />
        <Route path="settings" element={<ManagerSettings />} />
      </Route>

      {/* Owner */}
      <Route path="/owner" element={<RequireRole role="owner" />}>
        <Route index element={<Navigate to="/owner/dashboard" replace />} />
        <Route path="dashboard" element={<OwnerDashboard />} />
        <Route path="activity" element={<OwnerActivity />} />
        <Route path="users" element={<OwnerUsers />} />
        <Route path="companies" element={<OwnerCompanies />} />
        <Route path="fleet" element={<OwnerFleet />} />
        <Route path="billing" element={<OwnerBilling />} />
        <Route path="revenue" element={<OwnerRevenue />} />
        <Route path="reports" element={<OwnerReports />} />
        <Route path="settings" element={<OwnerSettings />} />
      </Route>

      <Route path="*" element={<NotFound />} />
    </Routes>
  )
}
