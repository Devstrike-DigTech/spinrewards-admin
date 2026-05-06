import { useQuery } from '@tanstack/react-query'
import { ShieldCheck } from 'lucide-react'
import { analyticsApi } from '@/api/index'
import type { AdminAnalyticsSummary } from '@/types'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

export function KYCPage() {
  const { data: summary, isLoading } = useQuery<AdminAnalyticsSummary>({
    queryKey: ['analytics', 'summary'],
    queryFn: analyticsApi.summary,
  })

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">KYC Review Queue</h1>
          <p className="text-sm text-muted-foreground">
            {isLoading ? (
              <Skeleton className="inline-block h-4 w-20" />
            ) : (
              `${summary?.pending_kyc_count ?? 0} pending submissions`
            )}
          </p>
        </div>
        <div
          className="flex h-10 w-10 items-center justify-center rounded-xl"
          style={{ background: 'rgba(245, 158, 11, 0.15)' }}
        >
          <ShieldCheck className="h-5 w-5" style={{ color: '#f59e0b' }} />
        </div>
      </div>

      {/* Coming soon */}
      <Card className="bg-card border-[#1e2a4a]">
        <CardContent className="flex flex-col items-center justify-center py-20 text-center">
          <div
            className="flex h-16 w-16 items-center justify-center rounded-2xl mb-4"
            style={{ background: 'rgba(245, 158, 11, 0.1)' }}
          >
            <ShieldCheck className="h-8 w-8" style={{ color: '#f59e0b' }} />
          </div>
          <h3 className="text-lg font-semibold text-white mb-2">
            KYC Review Queue
          </h3>
          <p className="text-sm text-muted-foreground max-w-md mb-8">
            This module will display pending KYC submissions for review. Admins will be able to
            approve or reject submissions with a reason.
          </p>

          {/* Skeleton preview of what it will look like */}
          <div className="w-full max-w-2xl space-y-2 opacity-30 pointer-events-none">
            {['User Name', 'Bank Account', 'Status', 'Actions'].map((_, i) => (
              <div key={i} className="flex items-center gap-4 rounded-lg border border-[#1e2a4a] p-3">
                <Skeleton className="h-8 w-8 rounded-full" />
                <div className="flex-1 space-y-1">
                  <Skeleton className="h-3 w-32" />
                  <Skeleton className="h-3 w-24" />
                </div>
                <Skeleton className="h-6 w-16 rounded-full" />
                <div className="flex gap-2">
                  <Skeleton className="h-8 w-20 rounded-md" />
                  <Skeleton className="h-8 w-20 rounded-md" />
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-amber-400 animate-pulse" />
            <span className="text-xs text-muted-foreground">Under development</span>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
