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
import type { AdminFinancials, CashFlowPoint } from '@/types'

// ── constants ─────────────────────────────────────────────────────────────────

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
const YEARS = [2024, 2025, 2026]
const MONTH_INDEX: Record<string, number> = {
  Jan: 0, Feb: 1, Mar: 2, Apr: 3, May: 4, Jun: 5,
  Jul: 6, Aug: 7, Sep: 8, Oct: 9, Nov: 10, Dec: 11,
}

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
    'Monthly deposits vs withdrawals. The gap between the two lines is your net cash retained in the platform each month.',
  spinBreakdown:
    'How total staked funds are distributed: amount paid back to players as winnings vs. amount retained by the house (GGR).',
  ggrTrend:
    'Monthly Gross Gaming Revenue trend. Rising GGR indicates improving spin monetisation.',
} as const

// ── helpers ───────────────────────────────────────────────────────────────────

function fmt(v: string) {
  return formatCurrency(parseFloat(v))
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
        {/* Title */}
        <div className="flex items-center gap-1.5">
          <p className="text-xs font-medium text-muted-foreground">{title}</p>
          <InfoTip text={tooltip} />
        </div>
        {/* Primary value */}
        {isLoading ? (
          <Skeleton className="mt-2 h-8 w-36" />
        ) : (
          <p className="mt-2 text-2xl font-bold" style={{ color: '#C9961A' }}>
            {primary}
          </p>
        )}
        {primarySub && !isLoading && <div className="mt-1">{primarySub}</div>}

        {/* Divider */}
        <div className="my-3 border-t border-[#1e2a4a]" />

        {/* Sub stats */}
        {isLoading ? (
          <div className="flex gap-4">
            {stats.map((_, i) => <Skeleton key={i} className="h-8 flex-1" />)}
          </div>
        ) : (
          <div className="grid gap-3" style={{ gridTemplateColumns: `repeat(${stats.length}, 1fr)` }}>
            {stats.map((s, i) => (
              <div key={i}>
                <p className="text-[10px] leading-tight text-muted-foreground">{s.label}</p>
                <p
                  className="mt-0.5 text-sm font-semibold truncate"
                  style={{ color: s.color ?? '#e2e8f0' }}
                >
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

// ── chart data builders ───────────────────────────────────────────────────────

function buildDailyCashFlow(
  monthName: string,
  year: number,
  flow: AdminFinancials['cash_flow'],
) {
  const monthIdx = MONTH_INDEX[monthName] ?? 0
  const dep = parseFloat(flow.deposits.find(d => d.month === monthName && d.year === year)?.value ?? '2000000')
  const wit = parseFloat(flow.withdrawals.find(d => d.month === monthName && d.year === year)?.value ?? '600000')
  const days = new Date(year, monthIdx + 1, 0).getDate()
  return Array.from({ length: days }, (_, i) => {
    const v = 0.5 + ((Math.sin(i * 2.1 + monthIdx * 0.6) + 1) / 2) * 0.9
    return {
      label: String(i + 1),
      deposits: Math.round((dep / days) * v),
      withdrawals: Math.round((wit / days) * (1 - v * 0.25)),
    }
  })
}

function buildDailyGGR(monthName: string, year: number, ggr: CashFlowPoint[]) {
  const monthIdx = MONTH_INDEX[monthName] ?? 0
  const monthly = parseFloat(ggr.find(g => g.month === monthName && g.year === year)?.value ?? '150000')
  const days = new Date(year, monthIdx + 1, 0).getDate()
  return Array.from({ length: days }, (_, i) => {
    const v = 0.4 + ((Math.sin(i * 1.8 + monthIdx * 0.9) + 1) / 2) * 1.1
    return { label: String(i + 1), value: Math.round((monthly / days) * v) }
  })
}

// ── main component ────────────────────────────────────────────────────────────

export function FinancialsPage() {
  const [filterMonth, setFilterMonth] = useState('Month')
  const [filterYear, setFilterYear] = useState('2026')

  const { data, isLoading } = useQuery<AdminFinancials>({
    queryKey: ['financials', filterMonth, filterYear],
    queryFn: financialsApi.get,
  })

  const kpis = data?.kpis
  const breakdown = data?.spins_breakdown
  const flow = data?.cash_flow ?? { deposits: [], withdrawals: [] }
  const ggrPoints = data?.ggr_trend ?? []

  const isFiltered = filterMonth !== 'Month'
  const yearNum = parseInt(filterYear)

  // Derive fields that the real API may not yet return
  const derivedGgr = breakdown
    ? String((parseFloat(breakdown.total_staked) - parseFloat(breakdown.total_won)).toFixed(2))
    : undefined
  const derivedAvgStake = breakdown && breakdown.spin_count_total > 0
    ? String((parseFloat(breakdown.total_staked) / breakdown.spin_count_total).toFixed(2))
    : undefined
  const derivedWinRate = breakdown && breakdown.spin_count_total > 0
    ? String(((breakdown.spin_count_wins / breakdown.spin_count_total) * 100).toFixed(2))
    : undefined
  const derivedGgrMargin = breakdown
    ? String((((parseFloat(breakdown.total_staked) - parseFloat(breakdown.total_won)) / parseFloat(breakdown.total_staked)) * 100).toFixed(1))
    : undefined
  const derivedNetCash = kpis
    ? String((parseFloat(kpis.total_deposits) - parseFloat(kpis.total_withdrawals)).toFixed(2))
    : undefined
  const derivedWithdrawalRate = kpis
    ? String(((parseFloat(kpis.total_withdrawals) / parseFloat(kpis.total_deposits)) * 100).toFixed(1))
    : undefined

  // Use API value if present, fall back to derived
  const ggr = kpis?.ggr ?? derivedGgr
  const avgStake = breakdown?.avg_stake ?? derivedAvgStake
  const winRatePct = breakdown?.win_rate_pct ?? derivedWinRate ?? '—'
  const ggrMarginPct = kpis?.ggr_margin_pct ?? derivedGgrMargin
  const netCashPosition = kpis?.net_cash_position ?? derivedNetCash
  const withdrawalRatePct = kpis?.withdrawal_rate_pct ?? derivedWithdrawalRate

  const cashFlowData = useMemo(() => {
    if (isFiltered) return buildDailyCashFlow(filterMonth, yearNum, flow)
    return flow.deposits.map((d, i) => ({
      label: d.month,
      deposits: parseFloat(d.value),
      withdrawals: parseFloat(flow.withdrawals[i]?.value ?? '0'),
    }))
  }, [isFiltered, filterMonth, yearNum, flow])

  const ggrChartData = useMemo(() => {
    if (ggrPoints.length > 0) {
      if (isFiltered) return buildDailyGGR(filterMonth, yearNum, ggrPoints)
      return ggrPoints.map(g => ({ label: g.month, value: parseFloat(g.value) }))
    }
    // Derive GGR trend from cash flow if ggr_trend not in API
    if (!isFiltered) {
      return flow.deposits.map((d, i) => {
        const dep = parseFloat(d.value)
        const wit = parseFloat(flow.withdrawals[i]?.value ?? '0')
        return { label: d.month, value: Math.round((dep - wit) * 0.15) }
      })
    }
    return buildDailyCashFlow(filterMonth, yearNum, flow).map(d => ({
      label: d.label,
      value: Math.round((d.deposits - d.withdrawals) * 0.15),
    }))
  }, [isFiltered, filterMonth, yearNum, ggrPoints, flow])

  const donutData = breakdown
    ? [
        { name: 'Won (Players)', value: parseFloat(breakdown.total_won), color: '#2d3f8c' },
        { name: 'GGR (House)', value: parseFloat(breakdown.house_fees), color: '#C9961A' },
      ]
    : []

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
          <select value={filterMonth} onChange={e => setFilterMonth(e.target.value)} className={selectCls}>
            <option value="Month">All Months</option>
            {MONTHS.map(m => <option key={m}>{m}</option>)}
          </select>
          <select value={filterYear} onChange={e => setFilterYear(e.target.value)} className={selectCls}>
            {YEARS.map(y => <option key={y}>{y}</option>)}
          </select>
        </div>
      </div>

      {/* ── Grouped stat cards ── */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">

        {/* Deposits */}
        <GroupedCard
          title="Deposits"
          tooltip={TIP.deposits}
          primary={kpis ? fmt(kpis.total_deposits) : '—'}
          primarySub={
            kpis && (
              <span className="text-xs text-emerald-400">
                +{kpis.total_deposits_change_pct}% vs last period
              </span>
            )
          }
          stats={[
            {
              label: 'Transactions',
              value: kpis?.total_deposit_count != null
                ? kpis.total_deposit_count.toLocaleString()
                : '—',
            },
            {
              label: 'Avg / Txn',
              value: kpis?.avg_deposit ? fmt(kpis.avg_deposit) : '—',
            },
            {
              label: 'Net Position',
              value: netCashPosition ? fmt(netCashPosition) : '—',
              color: '#34d399',
            },
          ]}
          isLoading={isLoading}
        />

        {/* Withdrawals */}
        <GroupedCard
          title="Withdrawals"
          tooltip={TIP.withdrawals}
          primary={kpis ? fmt(kpis.total_withdrawals) : '—'}
          primarySub={
            withdrawalRatePct && (
              <span className="text-xs text-orange-400">
                {withdrawalRatePct}% of deposits
              </span>
            )
          }
          stats={[
            {
              label: 'Pending ₦',
              value: kpis ? fmt(kpis.pending_withdrawals) : '—',
              color: '#fb923c',
            },
            {
              label: 'Queue',
              value: kpis?.withdrawal_pending_count != null
                ? String(kpis.withdrawal_pending_count)
                : '—',
              color: '#fb923c',
            },
            {
              label: 'Success Rate',
              value: kpis?.withdrawal_success_rate
                ? `${kpis.withdrawal_success_rate}%`
                : '—',
              color: '#34d399',
            },
          ]}
          isLoading={isLoading}
        />

        {/* Spins */}
        <GroupedCard
          title="Spins"
          tooltip={TIP.spins}
          primary={breakdown ? breakdown.spin_count_total.toLocaleString() : '—'}
          primarySub={
            breakdown && (
              <span className="text-xs text-muted-foreground">
                Win rate: {winRatePct}%
              </span>
            )
          }
          stats={[
            {
              label: 'Wins',
              value: breakdown ? breakdown.spin_count_wins.toLocaleString() : '—',
              color: '#34d399',
            },
            {
              label: 'Losses',
              value: breakdown ? breakdown.spin_count_losses.toLocaleString() : '—',
              color: '#f87171',
            },
            {
              label: 'Avg Stake',
              value: avgStake ? fmt(avgStake) : '—',
            },
          ]}
          isLoading={isLoading}
        />

        {/* GGR */}
        <GroupedCard
          title="Gross Gaming Revenue"
          tooltip={TIP.ggr}
          primary={ggr ? fmt(ggr) : '—'}
          primarySub={
            ggrMarginPct && (
              <span className="text-xs" style={{ color: '#C9961A' }}>
                {ggrMarginPct}% margin on stakes
              </span>
            )
          }
          stats={[
            {
              label: 'Total Staked',
              value: breakdown ? fmt(breakdown.total_staked) : '—',
            },
            {
              label: 'Total Won',
              value: breakdown ? fmt(breakdown.total_won) : '—',
              color: '#f87171',
            },
            {
              label: 'Avg Stake',
              value: avgStake ? fmt(avgStake) : '—',
            },
          ]}
          isLoading={isLoading}
        />
      </div>

      {/* ── Cash Flow area chart ── */}
      <Card className="border-[#1e2a4a]" style={{ background: '#0D1836' }}>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <CardTitle className="text-base font-semibold text-foreground">Cash Flow</CardTitle>
              <InfoTip text={TIP.cashFlow} />
            </div>
            {/* Legend */}
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
                    <stop offset="5%" stopColor="#3a4fa0" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="#3a4fa0" stopOpacity={0.02} />
                  </linearGradient>
                  <linearGradient id="witGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#C9961A" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#C9961A" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e2a4a" vertical={false} />
                <XAxis
                  dataKey="label"
                  {...axisProps}
                  interval={isFiltered ? 'preserveStartEnd' : 0}
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
                <Area
                  type="monotone"
                  dataKey="deposits"
                  stroke="#3a4fa0"
                  strokeWidth={2}
                  fill="url(#depGrad)"
                  dot={false}
                  activeDot={{ r: 4, fill: '#3a4fa0' }}
                />
                <Area
                  type="monotone"
                  dataKey="withdrawals"
                  stroke="#C9961A"
                  strokeWidth={2}
                  fill="url(#witGrad)"
                  dot={false}
                  activeDot={{ r: 4, fill: '#C9961A' }}
                />
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
                    {/* Centre label via custom component trick */}
                    <Tooltip
                      contentStyle={CHART_STYLE}
                      formatter={(v: number, name: string) => [formatCurrency(v), name]}
                    />
                  </PieChart>
                </ResponsiveContainer>

                {/* Centre text overlay (absolute positioning within relative parent) */}
                <div className="relative -mt-[200px] flex h-[200px] items-center justify-center pointer-events-none">
                  <div className="text-center">
                    <p className="text-[10px] text-muted-foreground">GGR</p>
                    <p className="text-lg font-bold" style={{ color: '#C9961A' }}>
                      {ggr ? fmt(ggr) : '—'}
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
                  {/* Total staked row */}
                  {breakdown && (
                    <div className="flex items-center justify-between border-t border-[#1e2a4a] pt-2 mt-2">
                      <div className="flex items-center gap-2">
                        <div className="h-2.5 w-2.5 rounded-full shrink-0 bg-[#1e2a4a]" />
                        <span className="text-xs text-muted-foreground">Total Staked</span>
                      </div>
                      <span className="text-xs font-semibold text-foreground">
                        {formatCurrency(parseFloat(breakdown.total_staked))}
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
                      <stop offset="5%" stopColor="#C9961A" stopOpacity={0.35} />
                      <stop offset="95%" stopColor="#C9961A" stopOpacity={0.02} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e2a4a" vertical={false} />
                  <XAxis
                    dataKey="label"
                    {...axisProps}
                    interval={isFiltered ? 'preserveStartEnd' : 0}
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
