import { useRef, useState, useEffect } from 'react'
import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import { LogOut, X } from 'lucide-react'
import { Sidebar } from './Sidebar'
import { useAuthStore } from '@/store/authStore'
import { authApi } from '@/api/index'
import { Button } from '@/components/ui/button'

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
  const navigate = useNavigate()
  const { adminUser, tokens, clearAuth } = useAuthStore()
  const [profileOpen, setProfileOpen] = useState(false)
  const profileRef = useRef<HTMLDivElement>(null)

  const pathBase = '/' + location.pathname.split('/')[1]
  const pageTitle = PAGE_TITLES[pathBase] ?? 'Dashboard'

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setProfileOpen(false)
      }
    }
    if (profileOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [profileOpen])

  async function handleLogout() {
    setProfileOpen(false)
    try {
      if (tokens?.refresh_token) {
        await authApi.logout(tokens.refresh_token)
      }
    } catch {
      // Proceed with local logout even if the API call fails
    }
    clearAuth()
    navigate('/login')
  }

  const initials = adminUser?.display_name
    ? adminUser.display_name.split(' ').map((w) => w[0]).join('').toUpperCase().slice(0, 2)
    : 'A'

  const role = adminUser?.is_superuser ? 'Super Admin' : adminUser?.is_staff ? 'Admin' : 'Staff'

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

          {/* Avatar + profile dropdown */}
          <div className="relative" ref={profileRef}>
            <button
              onClick={() => setProfileOpen((o) => !o)}
              className="flex items-center gap-2.5 rounded-lg px-2 py-1 transition-colors hover:bg-white/5"
            >
              <span className="hidden text-sm text-foreground sm:block">
                {adminUser?.display_name ?? 'Admin'}
              </span>
              <div
                className="flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold text-white shrink-0"
                style={{ background: '#1A237E' }}
              >
                {initials}
              </div>
            </button>

            {/* Profile card */}
            {profileOpen && (
              <div
                className="absolute right-0 top-12 z-50 w-72 rounded-xl border border-[#1e2a4a] p-5 shadow-2xl"
                style={{ background: '#0D1220' }}
              >
                {/* Close */}
                <button
                  onClick={() => setProfileOpen(false)}
                  className="absolute right-3 top-3 rounded-md p-1 text-muted-foreground hover:text-foreground"
                >
                  <X className="h-4 w-4" />
                </button>

                {/* Avatar */}
                <div className="flex flex-col items-center gap-3 pb-4">
                  <div
                    className="flex h-16 w-16 items-center justify-center rounded-full text-xl font-bold text-white"
                    style={{ background: '#1A237E' }}
                  >
                    {initials}
                  </div>
                  <div className="text-center">
                    <p className="text-base font-semibold text-foreground">
                      {adminUser?.display_name ?? 'Admin'}
                    </p>
                    <p className="mt-0.5 text-xs font-medium" style={{ color: '#C9961A' }}>
                      {role}
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {adminUser?.email ?? ''}
                    </p>
                  </div>
                </div>

                {/* Logout button */}
                <Button
                  className="h-11 w-full font-semibold text-[#07090F]"
                  style={{ background: '#C9961A' }}
                  onClick={handleLogout}
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Logout
                </Button>
              </div>
            )}
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
