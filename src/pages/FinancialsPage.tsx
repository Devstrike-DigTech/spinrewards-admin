import { useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import {
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import { Info } from 'lucide-react'
import { financialsApi } from '@/api/index'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Tooltip as UITooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { formatCurrency } from '@/lib/utils'
import type { AdminFinancials } from '@/types'

// ── constants ─────────────────────────────────────────────────────────────────

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
const YEARS = [2024, 2025, 2026]

const CHART_STYLE = {
  backgroundColor: '#0A0E1E',
  border: '1px solid #1e2a4a',
  borderRadius: '8px',
  fontSize: 12,
}

// ── tooltip texts ─────────────────────────────────────────────────────────────

const TIP = {
  deposits:
    'Total amount of money players deposited in the selected period. "Avg/Txn" is the average deposit size. "Net Position" = Deposits − Withdrawals — money still inside the platform.',
  withdrawals:
    'Total amount successfully paid out to players. "Pending" is the total value of withdrawal requests awaiting approval. "Success Rate" = Approved ÷ Total Requested × 100.',
  spins:
    'Spin activity for the period. "Win Rate" = Winning Spins ÷ Total Spins × 100. If this deviates significantly from your configured RTP probability, investigate for anomalies.',
  ggr:
    'Gross Gaming Revenue = Total Staked − Total Won by players. This is the raw revenue the platform earned from spin activity before any operational costs. "Margin" = GGR ÷ Total Staked × 100.',
  cashFlow:
    'Deposits vs withdrawals over the selected period. The gap between the two lines is the net cash retained in the platform.',
  spinBreakdown:
    'How total staked funds are distributed: amount paid back to players as winnings vs. amount retained by the house (GGR).',
  ggrTrend:
    'Gross Gaming Revenue trend over the selected period. Rising GGR indicates improving spin monetisation.',
} as const

// ── helpers ───────────────────────────────────────────────────────────────────

function fmt(v: string | number) {
  return formatCurrency(typeof v === 'string' ? parseFloat(v) : v)
}

function InfoTip({ text }: { text: string }) {
  return (
    <TooltipProvider delayDuration={200}>
      <UITooltip>
        <TooltipTrigger asChild>
          <Info className="h-3.5 w-3.5 cursor-help text-muted-foreground/60 hover:text-muted-foreground transition-colors shrink-0" />
        </TooltipTrigger>
        <TooltipContent side="top" className="leading-relaxed">
          {text}
        </TooltipContent>
      </UITooltip>
    </TooltipProvider>
  )
}

interface SubStat {
  label: string
  value: string
  color?: string
}

function GroupedCard({
  title,
  tooltip,
  primary,
  primarySub,
  stats,
  isLoading,
}: {
  title: string
  tooltip: string
  primary: string
  primarySub?: React.ReactNode
  stats: SubStat[]
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
            {primary}
          </p>
        )}
        {primarySub && !isLoading && <div className="mt-1">{primarySub}</div>}
        <div className="my-3 border-t border-[#1e2a4a]" />
        {isLoading ? (
          <div className="flex gap-4">
            {stats.map((_, i) => <Skeleton key={i} className="h-8 flex-1" />)}
          </div>
        ) : (
          <div className="grid gap-3" style={{ gridTemplateColumns: `repeat(${stats.length}, 1fr)` }}>
            {stats.map((s, i) => (
              <div key={i}>
                <p className="text-[10px] leading-tight text-muted-foreground">{s.label}</p>
                <p className="mt-0.5 text-sm font-semibold truncate" style={{ color: s.color ?? '#e2e8f0' }}>
                  {s.value}
                </p>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

// ── main component ────────────────────────────────────────────────────────────

export function FinancialsPage() {
  const [filterMonth, setFilterMonth] = useState(MONTHS[new Date().getMonth()])
  const [filterYear, setFilterYear] = useState('2026')

  const apiParams = useMemo(() => {
    const params: { year: string; month?: string } = { year: filterYear }
    if (filterMonth !== 'Month') params.month = filterMonth
    return params
  }, [filterMonth, filterYear])

  const { data, isLoading } = useQuery<AdminFinancials>({
    queryKey: ['financials', filterMonth, filterYear],
    queryFn: () => financialsApi.get(apiParams),
  })

  const dep        = data?.deposits
  const wit        = data?.withdrawals
  const spins      = data?.spins
  const ggr        = data?.ggr
  const flow       = data?.cash_flow ?? { deposits: [], withdrawals: [] }
  const spinBreak  = data?.spin_breakdown
  const ggrPoints  = data?.ggr_trend ?? []

  const isMonthView = filterMonth !== 'Month'

  // ── chart data ──────────────────────────────────────────────────────────────

  const cashFlowData = useMemo(() => {
    const deps = flow.deposits
    const wits = flow.withdrawals
    if (deps.length === 0) return []
    const isDaily = deps[0].day != null
    return deps.map((d, i) => ({
      label: isDaily ? String(d.day) : d.month,
      deposits: parseFloat(d.amount) || 0,
      withdrawals: parseFloat(wits[i]?.amount ?? '0') || 0,
    }))
  }, [flow])

  const ggrChartData = useMemo(() => {
    if (ggrPoints.length === 0) return []
    const isDaily = ggrPoints[0].day != null
    return ggrPoints.map(p => ({
      label: isDaily ? String(p.day) : p.month,
      value: parseFloat(p.ggr) || 0,
    }))
  }, [ggrPoints])

  const donutData = useMemo(() => {
    if (!spinBreak) return []
    const won = parseFloat(spinBreak.total_won_by_players)
    const house = parseFloat(spinBreak.total_ggr)
    return [
      { name: 'Won (Players)', value: Math.max(0, won), color: '#2d3f8c' },
      { name: 'GGR (House)',   value: Math.max(0, house), color: '#C9961A' },
    ]
  }, [spinBreak])

  const selectCls =
    'h-8 rounded-md border border-[#1e2a4a] bg-[#0D1836] px-3 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-[#C9961A]'

  const axisProps = {
    tick: { fontSize: 11, fill: '#64748b' },
    axisLine: false as const,
    tickLine: false as const,
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-base font-semibold text-foreground">Financials</h2>
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">Filter by:</span>
          <select
            value={filterMonth}
            onChange={e => { setFilterMonth(e.target.value) }}
            className={selectCls}
          >
            <option value="Month">All Months</option>
            {MONTHS.map(m => <option key={m}>{m}</option>)}
          </select>
          <select
            value={filterYear}
            onChange={e => { setFilterYear(e.target.value) }}
            className={selectCls}
          >
            {YEARS.map(y => <option key={y}>{y}</option>)}
          </select>
        </div>
      </div>

      {/* ── Stat cards ── */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">

        {/* Deposits */}
        <GroupedCard
          title="Deposits"
          tooltip={TIP.deposits}
          primary={dep ? fmt(dep.total_amount) : '—'}
          primarySub={
            dep && dep.total_amount_change_pct !== '0' && (
              <span className="text-xs text-emerald-400">
                +{dep.total_amount_change_pct}% vs last period
              </span>
            )
          }
          stats={[
            { label: 'Transactions', value: dep ? dep.total_transactions.toLocaleString() : '—' },
            { label: 'Avg / Txn',    value: dep ? fmt(dep.average_per_deposit) : '—' },
            { label: 'Net Position', value: dep ? fmt(dep.net_position) : '—', color: '#34d399' },
          ]}
          isLoading={isLoading}
        />

        {/* Withdrawals */}
        <GroupedCard
          title="Withdrawals"
          tooltip={TIP.withdrawals}
          primary={wit ? fmt(wit.total_amount) : '—'}
          primarySub={
            wit && wit.pct_of_deposits !== '0.0' && (
              <span className="text-xs text-orange-400">
                {wit.pct_of_deposits}% of deposits
              </span>
            )
          }
          stats={[
            { label: 'Pending ₦',    value: wit ? fmt(wit.pending_amount) : '—', color: '#fb923c' },
            { label: 'Queue',        value: wit ? String(wit.pending_queue_count) : '—', color: '#fb923c' },
            { label: 'Success Rate', value: wit ? `${wit.success_rate_pct}%` : '—', color: '#34d399' },
          ]}
          isLoading={isLoading}
        />

        {/* Spins */}
        <GroupedCard
          title="Spins"
          tooltip={TIP.spins}
          primary={spins ? spins.total_spins.toLocaleString() : '—'}
          primarySub={
            spins && (
              <span className="text-xs text-muted-foreground">
                Win rate: {spins.win_rate_pct}%
              </span>
            )
          }
          stats={[
            { label: 'Wins',      value: spins ? spins.wins_count.toLocaleString() : '—',   color: '#34d399' },
            { label: 'Losses',    value: spins ? spins.losses_count.toLocaleString() : '—', color: '#f87171' },
            { label: 'Avg Stake', value: spins ? fmt(spins.average_stake_per_spin) : '—' },
          ]}
          isLoading={isLoading}
        />

        {/* GGR */}
        <GroupedCard
          title="Gross Gaming Revenue"
          tooltip={TIP.ggr}
          primary={ggr ? fmt(ggr.ggr_amount) : '—'}
          primarySub={
            ggr && (
              <span className="text-xs" style={{ color: '#C9961A' }}>
                {ggr.ggr_margin_pct}% margin on stakes
              </span>
            )
          }
          stats={[
            { label: 'Total Staked', value: ggr ? fmt(ggr.total_staked) : '—' },
            { label: 'Total Won',    value: ggr ? fmt(ggr.total_won) : '—', color: '#f87171' },
            { label: 'Avg Stake',    value: ggr ? fmt(ggr.average_stake_per_spin) : '—' },
          ]}
          isLoading={isLoading}
        />
      </div>

      {/* ── Cash Flow chart ── */}
      <Card className="border-[#1e2a4a]" style={{ background: '#0D1836' }}>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <CardTitle className="text-base font-semibold text-foreground">Cash Flow</CardTitle>
              <InfoTip text={TIP.cashFlow} />
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1.5">
                <div className="h-2.5 w-2.5 rounded-full" style={{ background: '#3a4fa0' }} />
                <span className="text-xs text-muted-foreground">Deposits</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="h-2.5 w-2.5 rounded-full" style={{ background: '#C9961A' }} />
                <span className="text-xs text-muted-foreground">Withdrawals</span>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <Skeleton className="h-64 w-full" />
          ) : (
            <ResponsiveContainer width="100%" height={280}>
              <AreaChart data={cashFlowData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="depGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#3a4fa0" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="#3a4fa0" stopOpacity={0.02} />
                  </linearGradient>
                  <linearGradient id="witGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#C9961A" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#C9961A" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e2a4a" vertical={false} />
                <XAxis
                  dataKey="label"
                  {...axisProps}
                  interval={isMonthView ? 'preserveStartEnd' : 0}
                />
                <YAxis
                  {...axisProps}
                  tickFormatter={(v: number) =>
                    v >= 1_000_000 ? `₦${(v / 1_000_000).toFixed(1)}M` : `₦${(v / 1000).toFixed(0)}k`
                  }
                />
                <Tooltip
                  contentStyle={CHART_STYLE}
                  formatter={(v: number, name: string) => [
                    formatCurrency(v),
                    name === 'deposits' ? 'Deposits' : 'Withdrawals',
                  ]}
                />
                <Area type="monotone" dataKey="deposits"    stroke="#3a4fa0" strokeWidth={2} fill="url(#depGrad)" dot={false} activeDot={{ r: 4, fill: '#3a4fa0' }} />
                <Area type="monotone" dataKey="withdrawals" stroke="#C9961A" strokeWidth={2} fill="url(#witGrad)" dot={false} activeDot={{ r: 4, fill: '#C9961A' }} />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      {/* ── Bottom row: Spin Breakdown donut + GGR Trend ── */}
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-5">

        {/* Spin Breakdown donut */}
        <Card className="xl:col-span-2 border-[#1e2a4a]" style={{ background: '#0D1836' }}>
          <CardHeader className="pb-2">
            <div className="flex items-center gap-1.5">
              <CardTitle className="text-base font-semibold text-foreground">Spin Breakdown</CardTitle>
              <InfoTip text={TIP.spinBreakdown} />
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-56 w-full" />
            ) : (
              <>
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie
                      data={donutData}
                      cx="50%"
                      cy="50%"
                      innerRadius={58}
                      outerRadius={88}
                      paddingAngle={4}
                      dataKey="value"
                      strokeWidth={0}
                    >
                      {donutData.map((entry, i) => (
                        <Cell key={i} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={CHART_STYLE}
                      formatter={(v: number, name: string) => [formatCurrency(v), name]}
                    />
                  </PieChart>
                </ResponsiveContainer>

                {/* Centre GGR overlay */}
                <div className="relative -mt-[200px] flex h-[200px] items-center justify-center pointer-events-none">
                  <div className="text-center">
                    <p className="text-[10px] text-muted-foreground">GGR</p>
                    <p className="text-lg font-bold" style={{ color: '#C9961A' }}>
                      {ggr ? fmt(ggr.ggr_amount) : '—'}
                    </p>
                  </div>
                </div>

                {/* Legend */}
                <div className="mt-3 space-y-2">
                  {donutData.map((item) => {
                    const total = donutData.reduce((s, d) => s + d.value, 0)
                    const pct = total > 0 ? ((item.value / total) * 100).toFixed(1) : '0'
                    return (
                      <div key={item.name} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="h-2.5 w-2.5 rounded-full shrink-0" style={{ background: item.color }} />
                          <span className="text-xs text-muted-foreground">{item.name}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-semibold text-foreground">{formatCurrency(item.value)}</span>
                          <span className="text-[10px] text-muted-foreground">{pct}%</span>
                        </div>
                      </div>
                    )
                  })}
                  {spinBreak && (
                    <div className="flex items-center justify-between border-t border-[#1e2a4a] pt-2 mt-2">
                      <div className="flex items-center gap-2">
                        <div className="h-2.5 w-2.5 rounded-full shrink-0 bg-[#1e2a4a]" />
                        <span className="text-xs text-muted-foreground">Total Staked</span>
                      </div>
                      <span className="text-xs font-semibold text-foreground">
                        {fmt(spinBreak.total_staked)}
                      </span>
                    </div>
                  )}
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* GGR Trend */}
        <Card className="xl:col-span-3 border-[#1e2a4a]" style={{ background: '#0D1836' }}>
          <CardHeader className="pb-2">
            <div className="flex items-center gap-1.5">
              <CardTitle className="text-base font-semibold text-foreground">GGR Trend</CardTitle>
              <InfoTip text={TIP.ggrTrend} />
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-64 w-full" />
            ) : (
              <ResponsiveContainer width="100%" height={280}>
                <AreaChart data={ggrChartData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="ggrGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor="#C9961A" stopOpacity={0.35} />
                      <stop offset="95%" stopColor="#C9961A" stopOpacity={0.02} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e2a4a" vertical={false} />
                  <XAxis
                    dataKey="label"
                    {...axisProps}
                    interval={isMonthView ? 'preserveStartEnd' : 0}
                  />
                  <YAxis
                    {...axisProps}
                    tickFormatter={(v: number) =>
                      v >= 1_000_000 ? `₦${(v / 1_000_000).toFixed(1)}M` : `₦${(v / 1000).toFixed(0)}k`
                    }
                  />
                  <Tooltip
                    contentStyle={CHART_STYLE}
                    formatter={(v: number) => [formatCurrency(v), 'GGR']}
                  />
                  <Area
                    type="monotone"
                    dataKey="value"
                    stroke="#C9961A"
                    strokeWidth={2.5}
                    fill="url(#ggrGrad)"
                    dot={false}
                    activeDot={{ r: 4, fill: '#C9961A', strokeWidth: 0 }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
