import { Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'sonner'
import { PrivateRoute } from '@/routes/PrivateRoute'
import { AppShell } from '@/components/layout/AppShell'
import { LoginPage } from '@/pages/LoginPage'
import { DashboardPage } from '@/pages/DashboardPage'
import { UsersPage } from '@/pages/UsersPage'
import { KYCPage } from '@/pages/KYCPage'
import { WithdrawalsPage } from '@/pages/WithdrawalsPage'
import { RTPPage } from '@/pages/RTPPage'
import { AuditLogPage } from '@/pages/AuditLogPage'

export function App() {
  return (
    <>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route element={<PrivateRoute />}>
          <Route element={<AppShell />}>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/users" element={<UsersPage />} />
            <Route path="/kyc" element={<KYCPage />} />
            <Route path="/withdrawals" element={<WithdrawalsPage />} />
            <Route path="/rtp" element={<RTPPage />} />
            <Route path="/audit-log" element={<AuditLogPage />} />
          </Route>
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <Toaster theme="dark" position="top-right" richColors />
    </>
  )
}
