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
import { analyticsApi } from '@/api/index'
import { MOCK_CASHFLOW, MOCK_REVENUE_BREAKDOWN } from '@/mock/data'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { formatCurrency } from '@/lib/utils'
import type { AdminAnalyticsSummary } from '@/types'

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
  const { data: summary, isLoading } = useQuery<AdminAnalyticsSummary>({
    queryKey: ['analytics', 'summary'],
    queryFn: analyticsApi.summary,
  })

  const totalDeposits = 2400500
  const totalWithdrawals = 1300000

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
          value={formatCurrency(totalDeposits)}
          badge="+2%"
          icon={TrendingUp}
          iconColor="#22c55e"
          isLoading={isLoading}
        />
        <StatCard
          title="Total Withdrawals"
          value={formatCurrency(totalWithdrawals)}
          badge="+2%"
          icon={TrendingDown}
          iconColor="#ef4444"
          isLoading={isLoading}
        />
        <StatCard
          title="Pending Withdrawals"
          value={summary ? formatCurrency(summary.pending_withdrawals_amount) : '—'}
          badge="+2%"
          icon={Clock}
          iconColor="#C9961A"
          isLoading={isLoading}
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-5">
        {/* Revenue breakdown donut (40%) */}
        <Card className="xl:col-span-2 bg-card border-[#1e2a4a]">
          <CardHeader>
            <CardTitle className="text-base text-white">Revenue Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie
                  data={MOCK_REVENUE_BREAKDOWN}
                  cx="50%"
                  cy="50%"
                  innerRadius={70}
                  outerRadius={110}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {MOCK_REVENUE_BREAKDOWN.map((entry, index) => (
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
                  formatter={(value: number, name: string) => [`₦${value}k`, name]}
                />
              </PieChart>
            </ResponsiveContainer>
            {/* Legend */}
            <div className="mt-2 space-y-2">
              {MOCK_REVENUE_BREAKDOWN.map((item) => (
                <div key={item.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="h-3 w-3 rounded-full" style={{ background: item.color }} />
                    <span className="text-sm text-muted-foreground">{item.name}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-semibold text-white">₦{item.value}k</span>
                    <span className="ml-2 text-xs text-muted-foreground">{item.percent}%</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Cash flow bar chart (60%) */}
        <Card className="xl:col-span-3 bg-card border-[#1e2a4a]">
          <CardHeader>
            <CardTitle className="text-base text-white">Cash Flow</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={320}>
              <BarChart
                data={MOCK_CASHFLOW}
                margin={{ top: 4, right: 4, left: 0, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(216 34% 17%)" />
                <XAxis
                  dataKey="month"
                  tick={{ fontSize: 11, fill: 'hsl(215 16% 47%)' }}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: 'hsl(215 16% 47%)' }}
                  tickFormatter={(v: number) => `₦${(v / 1000000).toFixed(1)}M`}
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
                <Legend
                  wrapperStyle={{ fontSize: 12, color: 'hsl(215 16% 47%)' }}
                />
                <Bar dataKey="deposits" name="Deposits" fill="#1A237E" radius={[4, 4, 0, 0]} />
                <Bar dataKey="withdrawals" name="Withdrawals" fill="#C9961A" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
