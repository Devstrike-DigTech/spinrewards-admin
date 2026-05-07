import { useQuery } from '@tanstack/react-query'
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
} from 'recharts'
import { TrendingUp, TrendingDown, Clock } from 'lucide-react'
import { financialsApi } from '@/api/index'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { formatCurrency } from '@/lib/utils'
import type { AdminFinancials } from '@/types'

function TrendBadge({ value }: { value: string }) {
  return (
    <span className="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold bg-emerald-500/20 text-emerald-400">
      +{value}%
    </span>
  )
}

function StatCard({
  title,
  value,
  badge,
  icon: Icon,
  iconColor,
  isLoading,
}: {
  title: string
  value: string
  badge?: string
  icon: React.ElementType
  iconColor: string
  isLoading: boolean
}) {
  return (
    <Card className="bg-card border-[#1e2a4a]">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        <div
          className="flex h-8 w-8 items-center justify-center rounded-lg"
          style={{ background: `${iconColor}20` }}
        >
          <Icon className="h-4 w-4" style={{ color: iconColor }} />
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <Skeleton className="h-8 w-36" />
        ) : (
          <div className="flex items-end gap-2">
            <p className="text-2xl font-bold text-white">{value}</p>
            {badge && <TrendBadge value={badge} />}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export function FinancialsPage() {
  const { data, isLoading } = useQuery<AdminFinancials>({
    queryKey: ['financials'],
    queryFn: financialsApi.get,
  })

  const kpis = data?.kpis
  const breakdown = data?.spins_breakdown

  // Donut chart data from spins_breakdown
  const donutData = breakdown
    ? [
        { name: 'Staked', value: parseFloat(breakdown.total_staked), color: '#1A237E' },
        { name: 'Won (RTP)', value: parseFloat(breakdown.total_won), color: '#3de8c4' },
        { name: 'House Fees', value: parseFloat(breakdown.house_fees), color: '#C9961A' },
      ]
    : []

  // Combine deposits + withdrawals by month for bar chart
  const depositData = data?.cash_flow.deposits ?? []
  const withdrawalData = data?.cash_flow.withdrawals ?? []
  const cashFlowData = depositData.map((d, i) => ({
    month: d.month,
    deposits: parseFloat(d.value),
    withdrawals: parseFloat(withdrawalData[i]?.value ?? '0'),
  }))

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Financials</h1>
        <p className="text-sm text-muted-foreground">Revenue, deposits and withdrawal overview</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard
          title="Total Deposits"
          value={kpis ? formatCurrency(kpis.total_deposits) : '—'}
          badge={kpis?.total_deposits_change_pct}
          icon={TrendingUp}
          iconColor="#22c55e"
          isLoading={isLoading}
        />
        <StatCard
          title="Total Withdrawals"
          value={kpis ? formatCurrency(kpis.total_withdrawals) : '—'}
          badge={kpis?.total_withdrawals_change_pct}
          icon={TrendingDown}
          iconColor="#ef4444"
          isLoading={isLoading}
        />
        <StatCard
          title="Pending Withdrawals"
          value={kpis ? formatCurrency(kpis.pending_withdrawals) : '—'}
          icon={Clock}
          iconColor="#C9961A"
          isLoading={isLoading}
        />
      </div>

      {/* Spin stats strip */}
      {breakdown && (
        <Card className="bg-card border-[#1e2a4a]">
          <CardContent className="py-4">
            <div className="flex flex-wrap items-center gap-8">
              <div className="text-center">
                <p className="text-xs text-muted-foreground">Total Spins</p>
                <p className="mt-0.5 text-lg font-bold text-white">
                  {breakdown.spin_count_total.toLocaleString()}
                </p>
              </div>
              <div className="h-8 w-px bg-[#1e2a4a]" />
              <div className="text-center">
                <p className="text-xs text-muted-foreground">Wins</p>
                <p className="mt-0.5 text-lg font-bold text-emerald-400">
                  {breakdown.spin_count_wins.toLocaleString()}
                </p>
              </div>
              <div className="h-8 w-px bg-[#1e2a4a]" />
              <div className="text-center">
                <p className="text-xs text-muted-foreground">Losses</p>
                <p className="mt-0.5 text-lg font-bold text-red-400">
                  {breakdown.spin_count_losses.toLocaleString()}
                </p>
              </div>
              <div className="h-8 w-px bg-[#1e2a4a]" />
              <div className="text-center">
                <p className="text-xs text-muted-foreground">Total Staked</p>
                <p className="mt-0.5 text-lg font-bold text-white">
                  {formatCurrency(breakdown.total_staked)}
                </p>
              </div>
              <div className="h-8 w-px bg-[#1e2a4a]" />
              <div className="text-center">
                <p className="text-xs text-muted-foreground">House Fees</p>
                <p className="mt-0.5 text-lg font-bold" style={{ color: '#C9961A' }}>
                  {formatCurrency(breakdown.house_fees)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Charts */}
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-5">
        {/* Revenue breakdown donut (40%) */}
        <Card className="xl:col-span-2 bg-card border-[#1e2a4a]">
          <CardHeader>
            <CardTitle className="text-base text-white">Spin Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-[280px] w-full" />
            ) : (
              <>
                <ResponsiveContainer width="100%" height={220}>
                  <PieChart>
                    <Pie
                      data={donutData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={95}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {donutData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'hsl(228 50% 7%)',
                        border: '1px solid hsl(216 34% 17%)',
                        borderRadius: '8px',
                        fontSize: 12,
                      }}
                      formatter={(value: number, name: string) => [formatCurrency(value), name]}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div className="mt-2 space-y-2">
                  {donutData.map((item) => {
                    const total = donutData.reduce((s, d) => s + d.value, 0)
                    const pct = total > 0 ? ((item.value / total) * 100).toFixed(1) : '0'
                    return (
                      <div key={item.name} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="h-3 w-3 rounded-full shrink-0" style={{ background: item.color }} />
                          <span className="text-sm text-muted-foreground">{item.name}</span>
                        </div>
                        <div className="text-right">
                          <span className="text-sm font-semibold text-white">{formatCurrency(item.value)}</span>
                          <span className="ml-2 text-xs text-muted-foreground">{pct}%</span>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Cash flow bar chart (60%) */}
        <Card className="xl:col-span-3 bg-card border-[#1e2a4a]">
          <CardHeader>
            <CardTitle className="text-base text-white">Cash Flow</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-[320px] w-full" />
            ) : (
              <ResponsiveContainer width="100%" height={320}>
                <BarChart
                  data={cashFlowData}
                  margin={{ top: 4, right: 4, left: 0, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(216 34% 17%)" />
                  <XAxis
                    dataKey="month"
                    tick={{ fontSize: 11, fill: 'hsl(215 16% 47%)' }}
                  />
                  <YAxis
                    tick={{ fontSize: 11, fill: 'hsl(215 16% 47%)' }}
                    tickFormatter={(v: number) => `₦${(v / 1_000_000).toFixed(1)}M`}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(228 50% 7%)',
                      border: '1px solid hsl(216 34% 17%)',
                      borderRadius: '8px',
                      fontSize: 12,
                    }}
                    formatter={(v: number, name: string) => [formatCurrency(v), name]}
                  />
                  <Legend wrapperStyle={{ fontSize: 12, color: 'hsl(215 16% 47%)' }} />
                  <Bar dataKey="deposits" name="Deposits" fill="#1A237E" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="withdrawals" name="Withdrawals" fill="#C9961A" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
