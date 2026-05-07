import { Outlet, useLocation } from 'react-router-dom'
import { Sidebar } from './Sidebar'
import { useAuthStore } from '@/store/authStore'

const PAGE_TITLES: Record<string, string> = {
  '/': 'Dashboard',
  '/financials': 'Financials',
  '/rtp': 'RTP Control',
  '/users': 'Users',
  '/withdrawals': 'Withdrawals',
  '/fraud-risk': 'Fraud & Risk Monitor',
  '/kyc': 'KYC Review Queue',
  '/admin': 'Admin Settings',
  '/audit-log': 'Audit Logs',
}

export function AppShell() {
  const location = useLocation()
  const { adminUser } = useAuthStore()

  const pathBase = '/' + location.pathname.split('/')[1]
  const pageTitle = PAGE_TITLES[pathBase] ?? 'Dashboard'

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Top header */}
        <header className="flex h-14 shrink-0 items-center justify-between border-b border-[#1e2a4a] bg-[#0A0E1E] px-6">
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">SpinRewards Admin</span>
            <span className="text-muted-foreground">/</span>
            <span className="text-sm font-semibold text-foreground">{pageTitle}</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-muted-foreground hidden sm:block">{adminUser?.display_name}</span>
            <div
              className="flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold text-white"
              style={{ background: '#1A237E' }}
            >
              {adminUser?.display_name?.[0]?.toUpperCase() ?? 'A'}
            </div>
          </div>
        </header>

        {/* Main content */}
        <main className="flex-1 overflow-y-auto">
          <div className="h-full p-6">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}
