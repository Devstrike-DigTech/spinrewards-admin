import { useQuery } from '@tanstack/react-query'
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart,
} from 'recharts'
import { TrendingUp, DollarSign, Percent, Users } from 'lucide-react'
import { analyticsApi, recentSpinsApi } from '@/api/index'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { formatCurrency } from '@/lib/utils'
import type { AdminAnalyticsSummary, RecentSpin } from '@/types'

function TrendBadge({ value }: { value: string }) {
  return (
    <span className="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold bg-emerald-500/20 text-emerald-400">
      {value}
    </span>
  )
}

function StatCard({
  title,
  value,
  subtitle,
  badge,
  icon: Icon,
  isLoading,
}: {
  title: string
  value: string | number
  subtitle?: string
  badge?: string
  icon: React.ElementType
  isLoading: boolean
}) {
  return (
    <Card className="bg-card border-[#1e2a4a]">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        <div
          className="flex h-8 w-8 items-center justify-center rounded-lg"
          style={{ background: 'rgba(201, 150, 26, 0.12)' }}
        >
          <Icon className="h-4 w-4" style={{ color: '#C9961A' }} />
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
        {subtitle && !isLoading && (
          <p className="mt-1 text-xs text-muted-foreground">{subtitle}</p>
        )}
      </CardContent>
    </Card>
  )
}

function OutcomeBadge({ outcome }: { outcome: RecentSpin['outcome'] }) {
  if (outcome === 'win') {
    return (
      <span className="inline-flex items-center rounded-md px-2 py-0.5 text-xs font-semibold bg-emerald-500/20 text-emerald-400">
        Win
      </span>
    )
  }
  if (outcome === 'loss') {
    return (
      <span className="inline-flex items-center rounded-md px-2 py-0.5 text-xs font-semibold bg-red-500/20 text-red-400">
        Loss
      </span>
    )
  }
  if (outcome === 'push') {
    return (
      <span className="inline-flex items-center rounded-md px-2 py-0.5 text-xs font-semibold bg-sky-500/20 text-sky-400">
        Push
      </span>
    )
  }
  return (
    <span className="inline-flex items-center rounded-md px-2 py-0.5 text-xs font-semibold bg-amber-500/20 text-amber-400">
      Partial
    </span>
  )
}

export function DashboardPage() {
  const { data: summary, isLoading: summaryLoading } = useQuery<AdminAnalyticsSummary>({
    queryKey: ['analytics', 'summary'],
    queryFn: analyticsApi.summary,
    refetchInterval: 60_000,
  })

  const { data: trendData, isLoading: trendLoading } = useQuery({
    queryKey: ['analytics', 'revenue'],
    queryFn: () => analyticsApi.revenue() as Promise<import('@/types').MonthlyDataPoint[]>,
  })

  const { data: recentSpins, isLoading: spinsLoading } = useQuery<import('@/types').RecentSpin[]>({
    queryKey: ['recent-spins'],
    queryFn: recentSpinsApi.list,
    refetchInterval: 30_000,
  })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Dashboard</h1>
        <p className="text-sm text-muted-foreground">Platform overview — refreshes every minute</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Total Revenue"
          value={summary ? formatCurrency(summary.total_revenue) : '—'}
          badge="+2%"
          icon={DollarSign}
          isLoading={summaryLoading}
        />
        <StatCard
          title="Net Profit"
          value={summary ? formatCurrency(summary.net_profit) : '—'}
          badge="+2%"
          icon={TrendingUp}
          isLoading={summaryLoading}
        />
        <StatCard
          title="Current RTP"
          value={summary ? `${summary.current_rtp}%` : '—'}
          badge="+2%"
          icon={Percent}
          isLoading={summaryLoading}
        />
        <StatCard
          title="Active Users"
          value={summary ? summary.active_users.toLocaleString() : '—'}
          subtitle={summary ? `${summary.new_users_today} new today` : undefined}
          icon={Users}
          isLoading={summaryLoading}
        />
      </div>

      {/* Middle section: chart + recent spins */}
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-5">
        {/* Profit Trend chart (60%) */}
        <Card className="xl:col-span-3 bg-card border-[#1e2a4a]">
          <CardHeader>
            <CardTitle className="text-base text-white">Profit Trend</CardTitle>
          </CardHeader>
          <CardContent>
            {trendLoading ? (
              <Skeleton className="h-64 w-full" />
            ) : (
              <ResponsiveContainer width="100%" height={260}>
                <AreaChart data={trendData ?? []} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorProfit" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#C9961A" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#C9961A" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(216 34% 17%)" />
                  <XAxis
                    dataKey="month"
                    tick={{ fontSize: 11, fill: 'hsl(215 16% 47%)' }}
                  />
                  <YAxis
                    tick={{ fontSize: 11, fill: 'hsl(215 16% 47%)' }}
                    tickFormatter={(v: number) => `₦${(v / 1000).toFixed(0)}k`}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(228 50% 7%)',
                      border: '1px solid hsl(216 34% 17%)',
                      borderRadius: '8px',
                      fontSize: 12,
                    }}
                    formatter={(v: number) => [formatCurrency(v), 'Revenue']}
                  />
                  <Area
                    type="monotone"
                    dataKey="revenue"
                    stroke="#C9961A"
                    strokeWidth={2}
                    fill="url(#colorProfit)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Recent Spins table (40%) */}
        <Card className="xl:col-span-2 bg-card border-[#1e2a4a]">
          <CardHeader>
            <CardTitle className="text-base text-white">Recent Spins</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {spinsLoading ? (
              <div className="space-y-2 p-4">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Skeleton key={i} className="h-10 w-full" />
                ))}
              </div>
            ) : (
              <div className="overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-[#1e2a4a]">
                      <th className="px-4 py-2 text-left text-xs font-medium text-muted-foreground">User</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-muted-foreground">Stake</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-muted-foreground">Result</th>
                      <th className="px-4 py-2 text-right text-xs font-medium text-muted-foreground">Win</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(recentSpins ?? []).map((spin) => (
                      <tr key={spin.id} className="border-b border-[#1e2a4a]/50 hover:bg-white/2 last:border-0">
                        <td className="px-4 py-2 text-xs font-medium text-foreground truncate max-w-[80px]">
                          {spin.user_name.split(' ')[0]}
                        </td>
                        <td className="px-4 py-2 text-xs text-muted-foreground">
                          ₦{parseFloat(spin.stake).toLocaleString()}
                        </td>
                        <td className="px-4 py-2">
                          <OutcomeBadge outcome={spin.outcome} />
                        </td>
                        <td className="px-4 py-2 text-right text-xs font-semibold">
                          {spin.outcome === 'win' ? (
                            <span className="text-emerald-400">
                              ₦{parseFloat(spin.win_value).toLocaleString()}
                            </span>
                          ) : spin.outcome === 'partial_loss' ? (
                            <span className="text-amber-400">
                              ₦{parseFloat(spin.win_value).toLocaleString()}
                            </span>
                          ) : (
                            <span className="text-muted-foreground">—</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Today's stats strip */}
      <Card className="bg-card border-[#1e2a4a]">
        <CardContent className="py-4">
          <div className="flex flex-wrap items-center gap-8">
            <div className="text-center">
              <p className="text-xs text-muted-foreground">Today's Revenue</p>
              <p className="mt-0.5 text-lg font-bold text-white">
                {summary ? formatCurrency(summary.gross_revenue_today) : '—'}
              </p>
            </div>
            <div className="h-8 w-px bg-[#1e2a4a]" />
            <div className="text-center">
              <p className="text-xs text-muted-foreground">Today's Profit</p>
              <p className="mt-0.5 text-lg font-bold text-emerald-400">
                {summary ? formatCurrency(summary.net_profit_today) : '—'}
              </p>
            </div>
            <div className="h-8 w-px bg-[#1e2a4a]" />
            <div className="text-center">
              <p className="text-xs text-muted-foreground">Spins Today</p>
              <p className="mt-0.5 text-lg font-bold text-white">
                {summary?.total_spins_today.toLocaleString() ?? '—'}
              </p>
            </div>
            <div className="h-8 w-px bg-[#1e2a4a]" />
            <div className="text-center">
              <p className="text-xs text-muted-foreground">Pending Withdrawals</p>
              <p className="mt-0.5 text-lg font-bold" style={{ color: '#C9961A' }}>
                {summary ? `${summary.pending_withdrawals_count} · ${formatCurrency(summary.pending_withdrawals_amount)}` : '—'}
              </p>
            </div>
            <div className="h-8 w-px bg-[#1e2a4a]" />
            <div className="text-center">
              <p className="text-xs text-muted-foreground">Flagged Accounts</p>
              <p className="mt-0.5 text-lg font-bold text-red-400">
                {summary?.flagged_accounts ?? '—'}
              </p>
            </div>
            <div className="h-8 w-px bg-[#1e2a4a]" />
            <div className="text-center">
              <p className="text-xs text-muted-foreground">Pending KYC</p>
              <p className="mt-0.5 text-lg font-bold text-amber-400">
                {summary?.pending_kyc_count ?? '—'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
