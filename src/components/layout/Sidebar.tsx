import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard,
  Users,
  ShieldCheck,
  Wallet,
  Settings2,
  ScrollText,
  DollarSign,
  ShieldAlert,
  Settings,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Separator } from '@/components/ui/separator'

export function Sidebar() {
  const navItemClass = (isActive: boolean) =>
    cn(
      'flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors',
      isActive
        ? 'bg-[#C9961A] text-[#07090F] font-semibold'
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
        <NavLink to="/" end className={({ isActive }) => navItemClass(isActive)}>
          <LayoutDashboard className="h-4 w-4 shrink-0" />
          Dashboard
        </NavLink>

        <NavLink to="/financials" className={({ isActive }) => navItemClass(isActive)}>
          <DollarSign className="h-4 w-4 shrink-0" />
          Financials
        </NavLink>

        <NavLink to="/rtp" className={({ isActive }) => navItemClass(isActive)}>
          <Settings2 className="h-4 w-4 shrink-0" />
          RTP Control
        </NavLink>

        <NavLink to="/users" className={({ isActive }) => navItemClass(isActive)}>
          <Users className="h-4 w-4 shrink-0" />
          Users
        </NavLink>

        <NavLink to="/withdrawals" className={({ isActive }) => navItemClass(isActive)}>
          <Wallet className="h-4 w-4 shrink-0" />
          Withdrawals
        </NavLink>

        <NavLink to="/fraud-risk" className={({ isActive }) => navItemClass(isActive)}>
          <ShieldAlert className="h-4 w-4 shrink-0" />
          Fraud &amp; Risk Monitor
        </NavLink>

        <NavLink to="/kyc" className={({ isActive }) => navItemClass(isActive)}>
          <ShieldCheck className="h-4 w-4 shrink-0" />
          KYC Review Queue
        </NavLink>

        <NavLink to="/admin" className={({ isActive }) => navItemClass(isActive)}>
          <Settings className="h-4 w-4 shrink-0" />
          Admin
        </NavLink>

        <NavLink to="/audit-log" className={({ isActive }) => navItemClass(isActive)}>
          <ScrollText className="h-4 w-4 shrink-0" />
          Audit Logs
        </NavLink>
      </nav>
    </aside>
  )
}
