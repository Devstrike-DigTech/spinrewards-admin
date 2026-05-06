import { useQuery } from '@tanstack/react-query'
import { Clock, TrendingDown, CheckCircle } from 'lucide-react'
import { analyticsApi } from '@/api/index'
import type { AdminAnalyticsSummary } from '@/types'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { formatCurrency } from '@/lib/utils'

function StatCard({
  title,
  value,
  icon: Icon,
  iconColor,
  isLoading,
  muted,
}: {
  title: string
  value: string
  icon: React.ElementType
  iconColor: string
  isLoading: boolean
  muted?: boolean
}) {
  return (
    <Card className={`border-[#1e2a4a] ${muted ? 'opacity-60' : 'bg-card'}`}>
      <CardContent className="flex items-center gap-4 p-5">
        <div
          className="flex h-10 w-10 items-center justify-center rounded-xl shrink-0"
          style={{ background: `${iconColor}22` }}
        >
          <Icon className="h-5 w-5" style={{ color: iconColor }} />
        </div>
        <div>
          <p className="text-xs text-muted-foreground">{title}</p>
          {isLoading ? (
            <Skeleton className="mt-1 h-6 w-24" />
          ) : (
            <p className="text-xl font-bold text-white">{value}</p>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

export function WithdrawalsPage() {
  const { data: summary, isLoading } = useQuery<AdminAnalyticsSummary>({
    queryKey: ['analytics', 'summary'],
    queryFn: analyticsApi.summary,
  })

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-white">Withdrawals</h1>
        <p className="text-sm text-muted-foreground">Withdrawal management and approvals</p>
      </div>

      {/* Muted stat cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard
          title="Pending Requests"
          value={summary ? `${summary.pending_withdrawals_count} · ${formatCurrency(summary.pending_withdrawals_amount)}` : '—'}
          icon={Clock}
          iconColor="#C9961A"
          isLoading={isLoading}
          muted
        />
        <StatCard
          title="Total Paid Out"
          value="₦1,300,000"
          icon={TrendingDown}
          iconColor="#ef4444"
          isLoading={false}
          muted
        />
        <StatCard
          title="Completed Today"
          value="₦284,500"
          icon={CheckCircle}
          iconColor="#22c55e"
          isLoading={false}
          muted
        />
      </div>

      {/* Coming soon placeholder */}
      <Card className="bg-card border-[#1e2a4a]">
        <CardContent className="flex flex-col items-center justify-center py-20 text-center">
          <div
            className="flex h-16 w-16 items-center justify-center rounded-2xl mb-4"
            style={{ background: 'rgba(201, 150, 26, 0.1)' }}
          >
            <Clock className="h-8 w-8" style={{ color: '#C9961A' }} />
          </div>
          <h3 className="text-lg font-semibold text-white mb-2">
            Withdrawal Management module is in progress.
          </h3>
          <p className="text-sm text-muted-foreground max-w-md">
            This module will allow you to review, approve, and reject withdrawal requests.
            Funds will be automatically reversed for rejections.
          </p>
          <div className="mt-6 flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-amber-400 animate-pulse" />
            <span className="text-xs text-muted-foreground">Under development</span>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
