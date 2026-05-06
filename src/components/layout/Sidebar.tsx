import { useState } from 'react'
import { NavLink, useNavigate, useLocation } from 'react-router-dom'
import {
  LayoutDashboard,
  Users,
  ShieldCheck,
  Wallet,
  Settings2,
  ScrollText,
  LogOut,
  DollarSign,
  ShieldAlert,
  Settings,
  ChevronDown,
  ChevronRight,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAuthStore } from '@/store/authStore'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'

export function Sidebar() {
  const { adminUsername, clearAuth } = useAuthStore()
  const navigate = useNavigate()
  const location = useLocation()

  const financialsExpanded =
    location.pathname === '/financials' || location.pathname === '/rtp'
  const [financialsOpen, setFinancialsOpen] = useState(financialsExpanded)

  function handleLogout() {
    clearAuth()
    navigate('/login')
  }

  const navItemClass = (isActive: boolean) =>
    cn(
      'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
      isActive
        ? 'border-l-2 border-gold bg-gold/10 text-gold'
        : 'text-muted-foreground hover:bg-white/5 hover:text-foreground'
    )

  return (
    <aside className="flex h-full w-60 flex-col border-r border-[#1e2a4a] bg-[#0A0E1E]">
      {/* Logo */}
      <div className="flex h-14 items-center px-5 gap-2">
        <div className="flex items-baseline gap-0.5">
          <span className="text-lg font-bold text-white">Spin</span>
          <span className="text-lg font-bold text-white">Rewards</span>
        </div>
        <span
          className="rounded px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider"
          style={{ background: '#C9961A22', color: '#C9961A' }}
        >
          Admin
        </span>
      </div>

      <Separator className="bg-[#1e2a4a]" />

      {/* Nav */}
      <nav className="flex-1 space-y-0.5 p-2 pt-3">
        {/* Dashboard */}
        <NavLink
          to="/"
          end
          className={({ isActive }) => navItemClass(isActive)}
        >
          <LayoutDashboard className="h-4 w-4 shrink-0" />
          Dashboard
        </NavLink>

        {/* Financials (collapsible parent) */}
        <div>
          <button
            onClick={() => {
              setFinancialsOpen((prev) => !prev)
              navigate('/financials')
            }}
            className={cn(
              'flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
              location.pathname === '/financials' || location.pathname === '/rtp'
                ? 'border-l-2 border-gold bg-gold/10 text-gold'
                : 'text-muted-foreground hover:bg-white/5 hover:text-foreground'
            )}
          >
            <DollarSign className="h-4 w-4 shrink-0" />
            <span className="flex-1 text-left">Financials</span>
            {financialsOpen ? (
              <ChevronDown className="h-3.5 w-3.5" />
            ) : (
              <ChevronRight className="h-3.5 w-3.5" />
            )}
          </button>

          {financialsOpen && (
            <div className="ml-4 mt-0.5 space-y-0.5 border-l border-[#1e2a4a] pl-2">
              <NavLink
                to="/rtp"
                className={({ isActive }) =>
                  cn(
                    'flex items-center gap-3 rounded-md px-3 py-1.5 text-sm transition-colors',
                    isActive
                      ? 'text-gold font-medium'
                      : 'text-muted-foreground hover:text-foreground'
                  )
                }
              >
                <Settings2 className="h-3.5 w-3.5 shrink-0" />
                RTP Control
              </NavLink>
            </div>
          )}
        </div>

        {/* Users */}
        <NavLink
          to="/users"
          className={({ isActive }) => navItemClass(isActive)}
        >
          <Users className="h-4 w-4 shrink-0" />
          Users
        </NavLink>

        {/* Withdrawals */}
        <NavLink
          to="/withdrawals"
          className={({ isActive }) => navItemClass(isActive)}
        >
          <Wallet className="h-4 w-4 shrink-0" />
          Withdrawals
        </NavLink>

        {/* Fraud & Risk Monitor */}
        <NavLink
          to="/fraud-risk"
          className={({ isActive }) => navItemClass(isActive)}
        >
          <ShieldAlert className="h-4 w-4 shrink-0" />
          Fraud &amp; Risk Monitor
        </NavLink>

        {/* KYC Review Queue */}
        <NavLink
          to="/kyc"
          className={({ isActive }) => navItemClass(isActive)}
        >
          <ShieldCheck className="h-4 w-4 shrink-0" />
          KYC Review Queue
        </NavLink>

        {/* Admin */}
        <NavLink
          to="/admin"
          className={({ isActive }) => navItemClass(isActive)}
        >
          <Settings className="h-4 w-4 shrink-0" />
          Admin
        </NavLink>

        {/* Audit Logs */}
        <NavLink
          to="/audit-log"
          className={({ isActive }) => navItemClass(isActive)}
        >
          <ScrollText className="h-4 w-4 shrink-0" />
          Audit Logs
        </NavLink>
      </nav>

      <Separator className="bg-[#1e2a4a]" />

      {/* Footer */}
      <div className="p-3">
        <div className="mb-2 flex items-center gap-2 px-2">
          <div
            className="flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold text-white"
            style={{ background: '#1A237E' }}
          >
            {adminUsername ? adminUsername[0].toUpperCase() : 'A'}
          </div>
          <p className="truncate text-xs text-muted-foreground">{adminUsername}</p>
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-start gap-2 text-muted-foreground hover:text-destructive"
          onClick={handleLogout}
        >
          <LogOut className="h-4 w-4" />
          Log out
        </Button>
      </div>
    </aside>
  )
}
