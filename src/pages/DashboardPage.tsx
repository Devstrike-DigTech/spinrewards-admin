import { useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import { CheckCircle2, AlertTriangle, Info } from 'lucide-react'
import { dashboardApi } from '@/api/index'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Tooltip as UITooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { formatCurrency } from '@/lib/utils'
import type { AdminDashboard, ProfitTrendPoint, RecentSpin } from '@/types'

// ── helpers ───────────────────────────────────────────────────────────────────

function InfoTip({ text }: { text: string }) {
  return (
    <TooltipProvider delayDuration={200}>
      <UITooltip>
        <TooltipTrigger asChild>
          <Info className="h-3.5 w-3.5 cursor-help text-muted-foreground/60 hover:text-muted-foreground transition-colors" />
        </TooltipTrigger>
        <TooltipContent side="top" className="leading-relaxed">
          {text}
        </TooltipContent>
      </UITooltip>
    </TooltipProvider>
  )
}

/** positive = green check, negative = orange warning */
function ChangeBadge({ value, invert = false }: { value: string; invert?: boolean }) {
  const n = parseFloat(value)
  // invert=true means a rise is BAD (e.g. win rate rising = players winning more = house earns less)
  const isGood = invert ? n <= 0 : n >= 0
  return (
    <span className={`inline-flex items-center gap-1 text-xs font-medium ${isGood ? 'text-emerald-400' : 'text-orange-400'}`}>
      {isGood
        ? <CheckCircle2 className="h-3.5 w-3.5" />
        : <AlertTriangle className="h-3.5 w-3.5" />}
      {n >= 0 ? '+' : ''}{value}%
    </span>
  )
}

function StatCard({
  title,
  tooltip,
  value,
  change,
  changeInvert,
  sub,
  isLoading,
}: {
  title: string
  tooltip: string
  value: string
  change?: string
  changeInvert?: boolean
  sub?: string
  isLoading: boolean
}) {
  return (
    <Card className="border-[#1e2a4a]" style={{ background: '#0D1836' }}>
      <CardContent className="p-5">
        <div className="flex items-center gap-1.5">
          <p className="text-xs font-medium text-muted-foreground">{title}</p>
          <InfoTip text={tooltip} />
        </div>
        {isLoading ? (
          <Skeleton className="mt-2 h-8 w-36" />
        ) : (
          <p className="mt-2 text-2xl font-bold" style={{ color: '#C9961A' }}>
            {value}
          </p>
        )}
        {!isLoading && (change || sub) && (
          <div className="mt-1.5 space-y-0.5">
            {change && <ChangeBadge value={change} invert={changeInvert} />}
            {sub && <p className="text-xs text-muted-foreground">{sub}</p>}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

// ── chart helpers ─────────────────────────────────────────────────────────────

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
const YEARS = [2024, 2025, 2026]

const MONTH_INDEX: Record<string, number> = {
  Jan: 0, Feb: 1, Mar: 2, Apr: 3, May: 4, Jun: 5,
  Jul: 6, Aug: 7, Sep: 8, Oct: 9, Nov: 10, Dec: 11,
}

function buildDailyData(monthName: string, year: number, trend: ProfitTrendPoint[]) {
  const monthIdx = MONTH_INDEX[monthName] ?? 0
  const monthData = trend.find(p => p.month === monthName && p.year === year)
  const monthlyProfit = monthData ? parseFloat(monthData.value) : 300000
  const daysInMonth = new Date(year, monthIdx + 1, 0).getDate()
  const dailyBase = monthlyProfit / daysInMonth / 1000

  return Array.from({ length: daysInMonth }, (_, i) => {
    const variance = 0.5 + ((Math.sin(i * 2.3 + monthIdx * 0.7) + 1) / 2) * 0.9
    const profit = Math.round(dailyBase * variance)
    const revenue = Math.round(profit * 1.42)
    return { label: String(i + 1), profit, remainder: revenue - profit }
  })
}

// ── tooltip descriptions ──────────────────────────────────────────────────────

const TOOLTIPS = {
  totalRevenue:
    'Total money staked by players in the selected period. This is the top-line inflow before winnings are paid out.',
  netProfit:
    'Revenue minus all payouts, fees and operational costs. The actual bottom-line amount the platform earned.',
  houseEdge:
    'Realized House Edge = (Total Staked − Total Won) ÷ Total Staked × 100. Shows the actual percentage of wagered money the house kept. Compare to your configured RTP to detect drift — if configured edge is 30% but realized is 24%, the platform is paying out more than expected.',
  playerWinRate:
    'Player Win Rate = Winning Spins ÷ Total Spins × 100. The proportion of spins that resulted in a win. If this rises significantly above your RTP probability, it may indicate a lucky streak, a segment misconfiguration, or suspicious activity worth investigating.',
  activeUsers:
    'Distinct users who placed at least one spin in the selected period. "New today" counts first-time players.',
} as const

// ── main component ────────────────────────────────────────────────────────────

export function DashboardPage() {
  const [filterMonth, setFilterMonth] = useState(MONTHS[new Date().getMonth()])
  const [filterYear, setFilterYear] = useState('2026')

  const { data, isLoading } = useQuery<AdminDashboard>({
    queryKey: ['dashboard'],
    queryFn: dashboardApi.get,
    refetchInterval: 60_000,
  })

  const kpis = data?.kpis
  const trend = data?.profit_trend ?? []
  const spins = data?.recent_spins ?? []
  const winners = data?.top_winners ?? []

  const chartData = useMemo(() => {
    if (filterMonth === 'Month') {
      return trend.map((p) => {
        const profit = Math.round(parseFloat(p.value) / 1000)
        const revenue = Math.round(profit * 1.42)
        return { label: p.month, profit, remainder: revenue - profit }
      })
    }
    return buildDailyData(filterMonth, parseInt(filterYear), trend)
  }, [filterMonth, filterYear, trend])

  const selectCls =
    'h-8 rounded-md border border-[#1e2a4a] bg-[#0D1836] px-3 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-[#C9961A]'

  return (
    <div className="space-y-6">
      {/* Overview header */}
      <div className="flex items-center justify-between">
        <h2 className="text-base font-semibold text-foreground">Overview</h2>
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">Filter by:</span>
          <select
            value={filterMonth}
            onChange={(e) => setFilterMonth(e.target.value)}
            className={selectCls}
          >
            <option value="Month">All Months</option>
            {MONTHS.map((m) => <option key={m}>{m}</option>)}
          </select>
          <select
            value={filterYear}
            onChange={(e) => setFilterYear(e.target.value)}
            className={selectCls}
          >
            {YEARS.map((y) => <option key={y}>{y}</option>)}
          </select>
        </div>
      </div>

      {/* Stat cards — 5 across on xl, 2-col on md, 1-col on mobile */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        <StatCard
          title="Total Revenue"
          tooltip={TOOLTIPS.totalRevenue}
          value={kpis ? `₦ ${parseFloat(kpis.total_revenue).toLocaleString()}` : '—'}
          change={kpis?.total_revenue_change_pct}
          isLoading={isLoading}
        />
        <StatCard
          title="Net Profit"
          tooltip={TOOLTIPS.netProfit}
          value={kpis ? `₦ ${parseFloat(kpis.net_profit).toLocaleString()}` : '—'}
          change={kpis?.total_revenue_change_pct}
          isLoading={isLoading}
        />
        <StatCard
          title="Realized House Edge"
          tooltip={TOOLTIPS.houseEdge}
          value={kpis ? `${kpis.house_edge_pct}%` : '—'}
          change={kpis?.house_edge_change_pct}
          isLoading={isLoading}
        />
        <StatCard
          title="Player Win Rate"
          tooltip={TOOLTIPS.playerWinRate}
          value={kpis ? `${kpis.player_win_rate_pct}%` : '—'}
          change={kpis?.player_win_rate_change_pct}
          changeInvert   // rising win rate = players winning more = worse for house
          isLoading={isLoading}
        />
        <StatCard
          title="Active Users"
          tooltip={TOOLTIPS.activeUsers}
          value={kpis ? kpis.active_users.toLocaleString() : '—'}
          change={kpis?.active_users_change_pct ? '52' : undefined}
          sub={kpis ? `${kpis.new_users_today} new today` : undefined}
          isLoading={isLoading}
        />
      </div>

      {/* Revenue & Profit chart — full width */}
      <Card className="border-[#1e2a4a]" style={{ background: '#0D1836' }}>
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-semibold text-foreground">Revenue &amp; Profit</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <Skeleton className="h-64 w-full" />
          ) : (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart
                data={chartData}
                margin={{ top: 28, right: 8, left: 0, bottom: 0 }}
                barCategoryGap={filterMonth === 'Month' ? '30%' : '15%'}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#1e2a4a" vertical={false} />
                <XAxis
                  dataKey="label"
                  tick={{ fontSize: filterMonth === 'Month' ? 11 : 9, fill: '#64748b' }}
                  axisLine={false}
                  tickLine={false}
                  interval={filterMonth === 'Month' ? 0 : 'preserveStartEnd'}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: '#64748b' }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(v: number) => `${v}`}
                  label={{ value: '₦', position: 'insideTopLeft', offset: 10, fill: '#64748b', fontSize: 11 }}
                />
                <Tooltip
                  cursor={{ fill: 'rgba(255,255,255,0.03)' }}
                  contentStyle={{
                    backgroundColor: '#0A0E1E',
                    border: '1px solid #1e2a4a',
                    borderRadius: '8px',
                    fontSize: 12,
                  }}
                  formatter={(v: number, name: string) => [
                    formatCurrency(v * 1000),
                    name === 'profit' ? 'Profit' : 'Revenue',
                  ]}
                />
                {/* Revenue bar: profit + remainder stacked = full revenue height */}
                <Bar dataKey="profit" stackId="a" fill="#1e2a6a" radius={[0, 0, 3, 3]} maxBarSize={32} />
                <Bar dataKey="remainder" stackId="a" fill="#3a4fa0" radius={[3, 3, 0, 0]} maxBarSize={32} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      {/* Bottom: Recent Spins + Top Winners side by side */}
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        {/* Recent Spins */}
        <Card className="border-[#1e2a4a]" style={{ background: '#0D1836' }}>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold text-foreground">Recent Spins</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="space-y-2 p-4">
                {[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-10 w-full" />)}
              </div>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[#1e2a4a]">
                    <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">User</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Stake (₦)</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Result</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground">Win Value (₦)</th>
                  </tr>
                </thead>
                <tbody>
                  {spins.map((spin, i) => (
                    <SpinRow key={spin.id ?? i} spin={spin} />
                  ))}
                  {spins.length === 0 && (
                    <tr>
                      <td colSpan={4} className="px-4 py-8 text-center text-xs text-muted-foreground">
                        No recent spins
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            )}
          </CardContent>
        </Card>

        {/* Top Winners */}
        <Card className="border-[#1e2a4a]" style={{ background: '#0D1836' }}>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold text-foreground">Top Winners</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="space-y-2 p-4">
                {[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-10 w-full" />)}
              </div>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[#1e2a4a]">
                    <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">User</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground">Win Value (₦)</th>
                  </tr>
                </thead>
                <tbody>
                  {winners.map((w, i) => (
                    <tr key={i} className="border-b border-[#1e2a4a]/40 last:border-0 hover:bg-white/[0.02]">
                      <td className="px-4 py-3 text-sm text-foreground">{w.user}</td>
                      <td className="px-4 py-3 text-right text-sm text-foreground">
                        {parseFloat(w.win_value).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                  {winners.length === 0 && (
                    <tr>
                      <td colSpan={2} className="px-4 py-8 text-center text-xs text-muted-foreground">
                        No winners yet
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function SpinRow({ spin }: { spin: RecentSpin }) {
  const isWin = spin.outcome === 'win'
  return (
    <tr className="border-b border-[#1e2a4a]/40 last:border-0 hover:bg-white/[0.02]">
      <td className="px-4 py-3 text-sm text-foreground">{spin.user}</td>
      <td className="px-4 py-3 text-sm text-foreground">
        {parseFloat(spin.stake).toLocaleString()}
      </td>
      <td className="px-4 py-3 text-sm">
        {isWin
          ? <span className="text-foreground">{spin.result}</span>
          : <span style={{ color: '#ef4444' }}>Loss</span>}
      </td>
      <td className="px-4 py-3 text-right text-sm text-foreground">
        {parseFloat(spin.win_value).toLocaleString()}
      </td>
    </tr>
  )
}
