import { Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'sonner'
import { PrivateRoute } from '@/routes/PrivateRoute'
import { AppShell } from '@/components/layout/AppShell'
import { LoginPage } from '@/pages/LoginPage'
import { DashboardPage } from '@/pages/DashboardPage'
import { FinancialsPage } from '@/pages/FinancialsPage'
import { UsersPage } from '@/pages/UsersPage'
import { UserDetailPage } from '@/pages/UserDetailPage'
import { KYCPage } from '@/pages/KYCPage'
import { WithdrawalsPage } from '@/pages/WithdrawalsPage'
import { RTPPage } from '@/pages/RTPPage'
import { FraudRiskPage } from '@/pages/FraudRiskPage'
import { AdminPage } from '@/pages/AdminPage'
import { AuditLogPage } from '@/pages/AuditLogPage'

export function App() {
  return (
    <>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route element={<PrivateRoute />}>
          <Route element={<AppShell />}>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/financials" element={<FinancialsPage />} />
            <Route path="/users" element={<UsersPage />} />
            <Route path="/users/:id" element={<UserDetailPage />} />
            <Route path="/kyc" element={<KYCPage />} />
            <Route path="/withdrawals" element={<WithdrawalsPage />} />
            <Route path="/rtp" element={<RTPPage />} />
            <Route path="/fraud-risk" element={<FraudRiskPage />} />
            <Route path="/admin" element={<AdminPage />} />
            <Route path="/audit-log" element={<AuditLogPage />} />
          </Route>
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <Toaster theme="dark" position="top-right" richColors />
    </>
  )
}
