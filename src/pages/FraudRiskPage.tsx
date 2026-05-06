import { useQuery } from '@tanstack/react-query'
import { ShieldAlert } from 'lucide-react'
import { analyticsApi } from '@/api/index'
import type { AdminAnalyticsSummary } from '@/types'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'

export function FraudRiskPage() {
  const { data: summary, isLoading } = useQuery<AdminAnalyticsSummary>({
    queryKey: ['analytics', 'summary'],
    queryFn: analyticsApi.summary,
  })

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Fraud &amp; Risk Monitor</h1>
          <p className="text-sm text-muted-foreground">
            Detect suspicious activity and manage flagged accounts
          </p>
        </div>
        <Badge variant="destructive" className="text-sm px-3 py-1">
          {isLoading ? (
            <Skeleton className="inline-block h-4 w-8" />
          ) : (
            `${summary?.flagged_accounts ?? 0} flagged`
          )}
        </Badge>
      </div>

      <Card className="bg-card border-[#1e2a4a]">
        <CardContent className="flex flex-col items-center justify-center py-20 text-center">
          <div
            className="flex h-16 w-16 items-center justify-center rounded-2xl mb-4"
            style={{ background: 'rgba(239, 68, 68, 0.1)' }}
          >
            <ShieldAlert className="h-8 w-8 text-red-400" />
          </div>
          <h3 className="text-lg font-semibold text-white mb-2">
            Fraud &amp; Risk Monitor
          </h3>
          <p className="text-sm text-muted-foreground max-w-md mb-4">
            This module will provide real-time fraud detection, flagged account management,
            unusual betting pattern alerts, and risk scoring for all users.
          </p>

          {/* Planned features list */}
          <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3 text-left w-full max-w-lg">
            {[
              { icon: '🔍', title: 'Pattern Detection', desc: 'Identify unusual spin patterns' },
              { icon: '🚩', title: 'Account Flagging', desc: 'Auto-flag high-risk accounts' },
              { icon: '📊', title: 'Risk Scoring', desc: 'Dynamic risk score per user' },
              { icon: '🔔', title: 'Real-time Alerts', desc: 'Instant alerts for fraud events' },
            ].map((f) => (
              <div
                key={f.title}
                className="flex items-start gap-3 rounded-xl p-3"
                style={{ background: 'rgba(239, 68, 68, 0.05)', border: '1px solid rgba(239, 68, 68, 0.15)' }}
              >
                <span className="text-xl">{f.icon}</span>
                <div>
                  <p className="text-sm font-semibold text-white">{f.title}</p>
                  <p className="text-xs text-muted-foreground">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8 flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-red-400 animate-pulse" />
            <span className="text-xs text-muted-foreground">Under development</span>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
