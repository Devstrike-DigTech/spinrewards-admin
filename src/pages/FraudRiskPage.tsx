import { useQuery } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { ShieldAlert } from 'lucide-react'
import { fraudApi } from '@/api/index'
import type { FraudData, FraudFlaggedUser } from '@/types'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'

function RiskBadge({ risk }: { risk: string }) {
  if (risk === 'High') return <Badge variant="destructive">High</Badge>
  if (risk === 'Medium') return <Badge variant="warning">Medium</Badge>
  return <Badge variant="success">Low</Badge>
}

function FlagTypeIcon({ type }: { type: string }) {
  const icons: Record<string, string> = {
    withdrawal_frequency: '🔁',
    large_win: '💰',
    kyc_rejected: '🚫',
  }
  return <span className="text-xl">{icons[type] ?? '🚩'}</span>
}

function FlaggedUserRow({ user }: { user: FraudFlaggedUser }) {
  const navigate = useNavigate()
  const initials = user.name
    .split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()

  return (
    <div className="flex items-center gap-4 p-4 hover:bg-white/2 transition-colors border-b border-[#1e2a4a] last:border-0">
      {/* Avatar */}
      <div
        className="flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold text-white shrink-0"
        style={{ background: user.risk === 'High' ? '#ef444422' : '#f59e0b22', color: user.risk === 'High' ? '#ef4444' : '#f59e0b' }}
      >
        {initials}
      </div>

      {/* Flag icon */}
      <div className="shrink-0">
        <FlagTypeIcon type={user.flag_type} />
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <button
            className="text-sm font-semibold text-white hover:text-gold transition-colors"
            onClick={() => navigate(`/users/${user.user_id}`)}
          >
            {user.name}
          </button>
          <RiskBadge risk={user.risk} />
        </div>
        <p className="text-xs text-muted-foreground mt-0.5">TG: #{user.telegram_id}</p>
        <p className="text-xs text-amber-400 mt-1">{user.flag}</p>
      </div>

      {/* Action */}
      <button
        className="shrink-0 text-xs font-medium hover:underline"
        style={{ color: '#C9961A' }}
        onClick={() => navigate(`/users/${user.user_id}`)}
      >
        View User →
      </button>
    </div>
  )
}

export function FraudRiskPage() {
  const { data, isLoading } = useQuery<FraudData>({
    queryKey: ['fraud'],
    queryFn: fraudApi.get,
    refetchInterval: 60_000,
  })

  const total = data?.total_flagged ?? 0
  const users = data?.flagged_users ?? []

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Fraud &amp; Risk Monitor</h1>
          <p className="text-sm text-muted-foreground">
            Flagged accounts sorted by risk level
          </p>
        </div>
        {isLoading ? (
          <Skeleton className="h-8 w-24 rounded-full" />
        ) : (
          <Badge variant={total > 0 ? 'destructive' : 'secondary'} className="text-sm px-3 py-1">
            {total} flagged
          </Badge>
        )}
      </div>

      {/* Summary cards */}
      {!isLoading && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {[
            { label: 'High Risk', count: users.filter((u) => u.risk === 'High').length, color: '#ef4444' },
            { label: 'Medium Risk', count: users.filter((u) => u.risk === 'Medium').length, color: '#f59e0b' },
            { label: 'Low Risk', count: users.filter((u) => u.risk === 'Low').length, color: '#22c55e' },
          ].map((s) => (
            <Card key={s.label} className="bg-card border-[#1e2a4a]">
              <CardContent className="flex items-center gap-4 p-5">
                <div
                  className="flex h-10 w-10 items-center justify-center rounded-xl shrink-0"
                  style={{ background: `${s.color}22` }}
                >
                  <ShieldAlert className="h-5 w-5" style={{ color: s.color }} />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">{s.label}</p>
                  <p className="text-xl font-bold text-white">{s.count}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Flagged users list */}
      <Card className="bg-card border-[#1e2a4a]">
        <CardContent className="p-0">
          {isLoading ? (
            <div className="space-y-2 p-4">
              {[1, 2, 3].map((i) => <Skeleton key={i} className="h-16 w-full" />)}
            </div>
          ) : users.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div
                className="flex h-16 w-16 items-center justify-center rounded-2xl mb-4"
                style={{ background: 'rgba(34, 197, 94, 0.1)' }}
              >
                <ShieldAlert className="h-8 w-8 text-emerald-400" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">All clear</h3>
              <p className="text-sm text-muted-foreground max-w-md">
                No flagged accounts at this time. The system will auto-flag suspicious activity.
              </p>
            </div>
          ) : (
            <div>
              {users.map((user) => (
                <FlaggedUserRow key={user.user_id} user={user} />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
