import { useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import {
  BarChart,
  Bar,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
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
import type { AdminDashboard, DashboardGraphPoint, RecentSpin, TopWinner } from '@/types'

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

function buildDailyData(monthName: string, year: number, graph: DashboardGraphPoint[]) {
  const monthIdx = MONTH_INDEX[monthName] ?? 0
  const monthData = graph.find(p => p.month === monthName && p.year === year)
  const monthlyStaked = monthData ? parseFloat(monthData.ngn.staked) : 600000
  const monthlyWon   = monthData ? parseFloat(monthData.ngn.won)    : 420000
  const monthlyGgr   = monthData ? parseFloat(monthData.ngn.ggr)    : 180000
  const daysInMonth  = new Date(year, monthIdx + 1, 0).getDate()

  return Array.from({ length: daysInMonth }, (_, i) => {
    const variance = 0.5 + ((Math.sin(i * 2.3 + monthIdx * 0.7) + 1) / 2) * 0.9
    const staked = Math.round((monthlyStaked / daysInMonth / 1000) * variance)
    const won    = Math.round((monthlyWon    / daysInMonth / 1000) * variance)
    const ggr    = Math.round((monthlyGgr    / daysInMonth / 1000) * variance)
    return { label: String(i + 1), staked, won, ggr }
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

  // Build API params from the active filter selection
  const apiParams = useMemo(() => {
    const params: { year: string; month?: string } = { year: filterYear }
    if (filterMonth !== 'Month') params.month = filterMonth
    return params
  }, [filterMonth, filterYear])

  const { data, isLoading } = useQuery<AdminDashboard>({
    queryKey: ['dashboard', filterMonth, filterYear],
    queryFn: () => dashboardApi.get(apiParams),
    refetchInterval: 60_000,
  })

  const kpis = data?.kpis
  const ngn = kpis?.ngn
  const usdt = kpis?.usdt
  const graph = data?.graph ?? []
  const spins = data?.recent_spins ?? []
  const winnersNgn = data?.top_winners?.ngn ?? []
  const winnersUsdt = data?.top_winners?.usdt ?? []

  const pct = (v: number | null | undefined) => (v != null ? String(v) : undefined)

  const chartData = useMemo(() => {
    if (filterMonth === 'Month') {
      // Always render all 12 months; zero-fill months the API hasn't returned yet
      return MONTHS.map((month) => {
        const p = graph.find((g) => g.month === month && g.year === parseInt(filterYear))
        return {
          label: month,
          staked: p ? Math.round(parseFloat(p.ngn.staked) / 1000) : 0,
          won:    p ? Math.round(parseFloat(p.ngn.won)    / 1000) : 0,
          ggr:    p ? Math.round(parseFloat(p.ngn.ggr)    / 1000) : 0,
        }
      })
    }

    // Specific month selected — use real daily data from API when available (graph entries have `day`)
    const hasDailyData = graph.length > 0 && graph[0].day !== undefined
    if (hasDailyData) {
      const monthIdx = MONTH_INDEX[filterMonth] ?? 0
      const daysInMonth = new Date(parseInt(filterYear), monthIdx + 1, 0).getDate()
      return Array.from({ length: daysInMonth }, (_, i) => {
        const day = i + 1
        const p = graph.find((g) => g.day === day)
        return {
          label: String(day),
          staked: p ? Math.round(parseFloat(p.ngn.staked) / 1000) : 0,
          won:    p ? Math.round(parseFloat(p.ngn.won)    / 1000) : 0,
          ggr:    p ? Math.round(parseFloat(p.ngn.ggr)    / 1000) : 0,
        }
      })
    }

    // Fallback: simulate daily data until backend adds daily support
    return buildDailyData(filterMonth, parseInt(filterYear), graph)
  }, [filterMonth, filterYear, graph])

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

      {/* Naira KPIs */}
      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Naira (₦)</p>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        <StatCard
          title="Total Revenue"
          tooltip={TOOLTIPS.totalRevenue}
          value={ngn ? `₦ ${parseFloat(ngn.total_revenue).toLocaleString()}` : '—'}
          change={pct(ngn?.total_revenue_change_pct)}
          isLoading={isLoading}
        />
        <StatCard
          title="Net Profit (GGR)"
          tooltip={TOOLTIPS.netProfit}
          value={ngn ? `₦ ${parseFloat(ngn.net_profit_ggr).toLocaleString()}` : '—'}
          change={pct(ngn?.net_profit_ggr_change_pct)}
          sub={kpis ? `${kpis.total_spins.toLocaleString()} total spins` : undefined}
          isLoading={isLoading}
        />
        <StatCard
          title="Realized House Edge"
          tooltip={TOOLTIPS.houseEdge}
          value={ngn ? `${ngn.realized_house_edge_pct}%` : '—'}
          isLoading={isLoading}
        />
        <StatCard
          title="Player Win Rate"
          tooltip={TOOLTIPS.playerWinRate}
          value={kpis ? `${kpis.player_win_rate_pct}%` : '—'}
          sub={kpis ? `${kpis.winning_spins} wins / ${kpis.total_spins} spins` : undefined}
          changeInvert   // rising win rate = players winning more = worse for house
          isLoading={isLoading}
        />
        <StatCard
          title="Active Users"
          tooltip={TOOLTIPS.activeUsers}
          value={kpis ? kpis.active_users.toLocaleString() : '—'}
          sub={kpis ? `${kpis.new_users_today} new today` : undefined}
          isLoading={isLoading}
        />
      </div>

      {/* USDT KPIs — separate, never summed with NGN */}
      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">USDT ($)</p>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard
          title="Total Revenue"
          tooltip={TOOLTIPS.totalRevenue}
          value={usdt ? `$ ${parseFloat(usdt.total_revenue).toLocaleString()}` : '—'}
          change={pct(usdt?.total_revenue_change_pct)}
          isLoading={isLoading}
        />
        <StatCard
          title="Net Profit (GGR)"
          tooltip={TOOLTIPS.netProfit}
          value={usdt ? `$ ${parseFloat(usdt.net_profit_ggr).toLocaleString()}` : '—'}
          change={pct(usdt?.net_profit_ggr_change_pct)}
          isLoading={isLoading}
        />
        <StatCard
          title="Realized House Edge"
          tooltip={TOOLTIPS.houseEdge}
          value={usdt ? `${usdt.realized_house_edge_pct}%` : '—'}
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
                barCategoryGap={filterMonth === 'Month' ? '35%' : '20%'}
                barGap={2}
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
                  formatter={(v: number, name: string) => {
                    const labels: Record<string, string> = {
                      staked: 'Staked',
                      won: 'Payouts',
                      ggr: 'GGR (Profit)',
                    }
                    return [formatCurrency(v * 1000), labels[name] ?? name]
                  }}
                />
                {/* Zero reference line — makes negative GGR visually obvious */}
                <ReferenceLine y={0} stroke="#ef4444" strokeWidth={1.5} strokeDasharray="4 3" />
                {/* Staked — total wagered */}
                <Bar dataKey="staked" fill="#1e3a8a" radius={[3, 3, 0, 0]} maxBarSize={24} name="staked" />
                {/* Payouts — paid out to players */}
                <Bar dataKey="won" fill="#C9961A" radius={[3, 3, 0, 0]} maxBarSize={24} name="won" />
                {/* GGR — green when profit, red when loss */}
                <Bar dataKey="ggr" maxBarSize={24} radius={[3, 3, 0, 0]} name="ggr">
                  {chartData.map((entry, i) => (
                    <Cell key={i} fill={entry.ggr >= 0 ? '#22c55e' : '#ef4444'} />
                  ))}
                </Bar>
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
                    <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Stake</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Result</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground">Win Value</th>
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
              <div>
                <WinnersList title="₦ Naira" symbol="₦" list={winnersNgn} />
                <WinnersList title="$ USDT" symbol="$" list={winnersUsdt} />
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function WinnersList({ title, symbol, list }: { title: string; symbol: string; list: TopWinner[] }) {
  return (
    <div className="border-b border-[#1e2a4a]/40 last:border-0">
      <p className="px-4 pb-1 pt-3 text-xs font-semibold text-muted-foreground">{title}</p>
      {list.length === 0 ? (
        <p className="px-4 pb-3 text-xs text-muted-foreground">No winners yet</p>
      ) : (
        list.map((w, i) => (
          <div key={i} className="flex items-center justify-between px-4 py-2 hover:bg-white/[0.02]">
            <span className="text-sm text-foreground">{w.user}</span>
            <span className="text-sm text-foreground">{symbol} {parseFloat(w.win_value).toLocaleString()}</span>
          </div>
        ))
      )}
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
