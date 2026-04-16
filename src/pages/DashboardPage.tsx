import { useQuery } from '@tanstack/react-query'
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import { Users, TrendingUp, Clock, ShieldAlert } from 'lucide-react'
import { analytics } from '@/api/endpoints'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { formatCurrency } from '@/lib/utils'

function StatCard({
  title,
  value,
  icon: Icon,
  isLoading,
}: {
  title: string
  value: string | number
  icon: React.ElementType
  isLoading: boolean
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <Skeleton className="h-7 w-32" />
        ) : (
          <p className="text-2xl font-bold">{value}</p>
        )}
      </CardContent>
    </Card>
  )
}

export function DashboardPage() {
  const { data: summary, isLoading: summaryLoading } = useQuery({
    queryKey: ['analytics', 'summary'],
    queryFn: analytics.summary,
    refetchInterval: 60_000,
  })

  const { data: revenueData, isLoading: revenueLoading } = useQuery({
    queryKey: ['analytics', 'revenue'],
    queryFn: () => analytics.revenue(30),
  })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-sm text-muted-foreground">Platform overview — refreshes every minute</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
        <StatCard
          title="Total Users"
          value={summary?.total_users.toLocaleString() ?? '—'}
          icon={Users}
          isLoading={summaryLoading}
        />
        <StatCard
          title="Spins Today"
          value={summary?.total_spins_today.toLocaleString() ?? '—'}
          icon={TrendingUp}
          isLoading={summaryLoading}
        />
        <StatCard
          title="Pending Withdrawals"
          value={
            summary
              ? `${summary.pending_withdrawals_count} · ${formatCurrency(summary.pending_withdrawals_amount)}`
              : '—'
          }
          icon={Clock}
          isLoading={summaryLoading}
        />
        <StatCard
          title="Pending KYC"
          value={summary?.pending_kyc_count ?? '—'}
          icon={ShieldAlert}
          isLoading={summaryLoading}
        />
      </div>

      {/* Revenue chart */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Revenue — Last 30 Days</CardTitle>
        </CardHeader>
        <CardContent>
          {revenueLoading ? (
            <Skeleton className="h-64 w-full" />
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <AreaChart data={revenueData} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(263 70% 60%)" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="hsl(263 70% 60%)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(216 34% 17%)" />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 11, fill: 'hsl(215 16% 47%)' }}
                  tickFormatter={(v: string) =>
                    new Date(v).toLocaleDateString('en-NG', { day: 'numeric', month: 'short' })
                  }
                />
                <YAxis
                  tick={{ fontSize: 11, fill: 'hsl(215 16% 47%)' }}
                  tickFormatter={(v: number) => `₦${(v / 1000).toFixed(0)}k`}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(224 71% 6%)',
                    border: '1px solid hsl(216 34% 17%)',
                    borderRadius: '8px',
                    fontSize: 12,
                  }}
                  formatter={(v: number) => [formatCurrency(v), 'Revenue']}
                />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="hsl(263 70% 60%)"
                  strokeWidth={2}
                  fill="url(#colorRevenue)"
                />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
