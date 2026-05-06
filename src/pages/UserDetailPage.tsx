import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { ArrowLeft, Phone, Shield, AlertTriangle } from 'lucide-react'
import { usersApi } from '@/api/index'
import type { AdminUser, UserSpinRecord, UserTransaction } from '@/types'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Pagination } from '@/components/Pagination'
import { formatDate, formatCurrency } from '@/lib/utils'

type TabType = 'spins' | 'transactions'

function KYCBadge({ status }: { status: AdminUser['kyc_status'] }) {
  if (status === 'approved') return <Badge variant="success">KYC Verified</Badge>
  if (status === 'pending') return <Badge variant="warning">KYC Pending</Badge>
  if (status === 'rejected') return <Badge variant="destructive">KYC Rejected</Badge>
  return <Badge variant="secondary">Not Submitted</Badge>
}

function RiskBadge({ level }: { level: AdminUser['risk_level'] }) {
  if (level === 'low') return <Badge variant="success">Low Risk</Badge>
  if (level === 'medium') return <Badge variant="warning">Medium Risk</Badge>
  return <Badge variant="destructive">High Risk</Badge>
}

function OutcomeChip({ outcome }: { outcome: UserSpinRecord['outcome'] }) {
  const map = {
    win: 'bg-emerald-500/20 text-emerald-400',
    loss: 'bg-red-500/20 text-red-400',
    push: 'bg-sky-500/20 text-sky-400',
    partial_loss: 'bg-amber-500/20 text-amber-400',
  }
  const labels = { win: 'Win', loss: 'Loss', push: 'Push', partial_loss: 'Partial' }
  return (
    <span className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-semibold ${map[outcome]}`}>
      {labels[outcome]}
    </span>
  )
}

function TxTypeIcon({ type }: { type: UserTransaction['type'] }) {
  const icons: Record<UserTransaction['type'], { icon: string; color: string }> = {
    deposit: { icon: '↓', color: '#22c55e' },
    withdrawal: { icon: '↑', color: '#ef4444' },
    spin_stake: { icon: '🎯', color: '#C9961A' },
    spin_payout: { icon: '💰', color: '#22c55e' },
    reward: { icon: '🎁', color: '#a855f7' },
  }
  const { icon, color } = icons[type]
  return (
    <div
      className="flex h-8 w-8 items-center justify-center rounded-full text-sm shrink-0"
      style={{ background: `${color}22`, color }}
    >
      {icon}
    </div>
  )
}

export function UserDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [activeTab, setActiveTab] = useState<TabType>('spins')
  const [spinsPage, setSpinsPage] = useState(1)
  const [txPage, setTxPage] = useState(1)

  const { data: user, isLoading: userLoading } = useQuery<AdminUser>({
    queryKey: ['user', id],
    queryFn: () => usersApi.detail(id!),
    enabled: !!id,
  })

  const { data: spinsData, isLoading: spinsLoading } = useQuery({
    queryKey: ['user-spins', id, spinsPage],
    queryFn: () => usersApi.spins(id!, spinsPage),
    enabled: !!id && activeTab === 'spins',
  })

  const { data: txData, isLoading: txLoading } = useQuery({
    queryKey: ['user-transactions', id, txPage],
    queryFn: () => usersApi.transactions(id!, txPage),
    enabled: !!id && activeTab === 'transactions',
  })

  const banMutation = useMutation({
    mutationFn: () => usersApi.ban(id!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user', id] })
      toast.success('User banned.')
    },
    onError: () => toast.error('Failed to ban user.'),
  })

  const unbanMutation = useMutation({
    mutationFn: () => usersApi.unban(id!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user', id] })
      toast.success('User unbanned.')
    },
    onError: () => toast.error('Failed to unban user.'),
  })

  const PAGE_SIZE = 10
  const spinsTotalPages = spinsData ? Math.ceil(spinsData.count / PAGE_SIZE) : 1
  const txTotalPages = txData ? Math.ceil(txData.count / PAGE_SIZE) : 1

  const initials = user
    ? `${user.first_name[0]}${user.last_name[0]}`.toUpperCase()
    : '?'

  return (
    <div className="space-y-5">
      {/* Back button */}
      <button
        onClick={() => navigate('/users')}
        className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Users
      </button>

      <div className="flex flex-col xl:flex-row gap-5">
        {/* Left: main content */}
        <div className="flex-1 min-w-0 space-y-4">
          {/* Tab switcher */}
          <div className="flex rounded-lg overflow-hidden border border-[#1e2a4a] w-fit">
            <button
              onClick={() => setActiveTab('spins')}
              className={`px-5 py-2 text-sm font-medium transition-colors ${
                activeTab === 'spins'
                  ? 'bg-gold text-white'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Recent Spins
            </button>
            <button
              onClick={() => setActiveTab('transactions')}
              className={`px-5 py-2 text-sm font-medium transition-colors ${
                activeTab === 'transactions'
                  ? 'bg-gold text-white'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Transaction History
            </button>
          </div>

          {/* Recent Spins tab */}
          {activeTab === 'spins' && (
            <Card className="bg-card border-[#1e2a4a]">
              <CardContent className="p-0">
                {spinsLoading ? (
                  <div className="space-y-2 p-4">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <Skeleton key={i} className="h-10 w-full" />
                    ))}
                  </div>
                ) : (
                  <>
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-[#1e2a4a]">
                          <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Stake</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Multiplier</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Result</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Payout</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Date</th>
                        </tr>
                      </thead>
                      <tbody>
                        {(spinsData?.results as UserSpinRecord[] ?? []).map((spin) => (
                          <tr key={spin.id} className="border-b border-[#1e2a4a]/50 last:border-0 hover:bg-white/2">
                            <td className="px-4 py-3 font-medium">{formatCurrency(spin.stake_amount)}</td>
                            <td className="px-4 py-3 text-muted-foreground">{spin.multiplier}×</td>
                            <td className="px-4 py-3">
                              <OutcomeChip outcome={spin.outcome} />
                            </td>
                            <td className="px-4 py-3">
                              {spin.outcome === 'win' || spin.outcome === 'push' ? (
                                <span className="font-semibold text-emerald-400">{formatCurrency(spin.payout_amount)}</span>
                              ) : spin.outcome === 'partial_loss' ? (
                                <span className="font-semibold text-amber-400">{formatCurrency(spin.payout_amount)}</span>
                              ) : (
                                <span className="text-muted-foreground">—</span>
                              )}
                            </td>
                            <td className="px-4 py-3 text-xs text-muted-foreground">{formatDate(spin.created_at)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    {(spinsData?.results?.length ?? 0) === 0 && (
                      <p className="py-8 text-center text-muted-foreground text-sm">No spins found.</p>
                    )}
                  </>
                )}
              </CardContent>
              <Pagination page={spinsPage} totalPages={spinsTotalPages} onPageChange={setSpinsPage} className="py-4" />
            </Card>
          )}

          {/* Transaction History tab */}
          {activeTab === 'transactions' && (
            <Card className="bg-card border-[#1e2a4a]">
              <CardContent className="p-4 space-y-3">
                {txLoading ? (
                  <div className="space-y-2">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <Skeleton key={i} className="h-12 w-full" />
                    ))}
                  </div>
                ) : (
                  <>
                    {(txData?.results as UserTransaction[] ?? []).map((tx) => {
                      const isPositive = parseFloat(tx.amount) >= 0
                      return (
                        <div key={tx.id} className="flex items-center gap-3 rounded-lg px-3 py-3 hover:bg-white/3 border border-transparent hover:border-[#1e2a4a] transition-all">
                          <TxTypeIcon type={tx.type} />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-white">{tx.description}</p>
                            <p className="text-xs text-muted-foreground">{formatDate(tx.created_at)}</p>
                          </div>
                          <span
                            className="font-semibold text-sm shrink-0"
                            style={{ color: isPositive ? '#22c55e' : '#ef4444' }}
                          >
                            {isPositive ? '+' : ''}{formatCurrency(tx.amount)}
                          </span>
                        </div>
                      )
                    })}
                    {(txData?.results?.length ?? 0) === 0 && (
                      <p className="py-8 text-center text-muted-foreground text-sm">No transactions found.</p>
                    )}
                  </>
                )}
              </CardContent>
              <Pagination page={txPage} totalPages={txTotalPages} onPageChange={setTxPage} className="py-4" />
            </Card>
          )}
        </div>

        {/* Right: user sidebar */}
        <div className="xl:w-72 space-y-4 shrink-0">
          <Card className="bg-card border-[#1e2a4a]">
            <CardContent className="p-5 space-y-4">
              {userLoading ? (
                <div className="space-y-3">
                  <Skeleton className="h-16 w-16 rounded-full mx-auto" />
                  <Skeleton className="h-6 w-40 mx-auto" />
                  <Skeleton className="h-4 w-32 mx-auto" />
                </div>
              ) : user ? (
                <>
                  {/* Avatar */}
                  <div className="flex flex-col items-center text-center">
                    <div
                      className="flex h-16 w-16 items-center justify-center rounded-full text-2xl font-bold text-white mb-3"
                      style={{ background: '#1A237E' }}
                    >
                      {initials}
                    </div>
                    <h2 className="text-xl font-bold text-white">
                      {user.first_name} {user.last_name}
                    </h2>
                    <p className="text-xs text-muted-foreground mt-1">
                      ID: #{user.id} · Registered on: Telegram
                    </p>
                  </div>

                  <div className="border-t border-[#1e2a4a] pt-4 space-y-3">
                    {/* Phone */}
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-muted-foreground shrink-0" />
                      <span className="text-sm text-foreground font-mono">{user.phone_number}</span>
                    </div>

                    {/* Badges */}
                    <div className="flex flex-wrap gap-2">
                      <KYCBadge status={user.kyc_status} />
                      <RiskBadge level={user.risk_level} />
                      {user.is_banned && (
                        <Badge variant="destructive">
                          <AlertTriangle className="mr-1 h-3 w-3" />
                          Banned
                        </Badge>
                      )}
                    </div>
                  </div>

                  {/* Balance cards */}
                  <div className="space-y-2">
                    <div
                      className="rounded-xl px-4 py-3"
                      style={{ background: 'rgba(201, 150, 26, 0.1)', border: '1px solid rgba(201, 150, 26, 0.2)' }}
                    >
                      <p className="text-xs text-muted-foreground">Cash Balance</p>
                      <p className="text-xl font-bold mt-0.5" style={{ color: '#C9961A' }}>
                        {formatCurrency(user.cash_balance)}
                      </p>
                    </div>
                    <div
                      className="rounded-xl px-4 py-3"
                      style={{ background: 'rgba(26, 35, 126, 0.2)', border: '1px solid rgba(26, 35, 126, 0.4)' }}
                    >
                      <p className="text-xs text-muted-foreground">Coin Balance</p>
                      <p className="text-xl font-bold text-white mt-0.5">
                        {parseFloat(user.coin_balance).toLocaleString()} coins
                      </p>
                    </div>
                    <div className="rounded-xl px-4 py-3 border border-[#1e2a4a]">
                      <p className="text-xs text-muted-foreground">Total Staked</p>
                      <p className="text-lg font-bold text-white mt-0.5">
                        {formatCurrency(user.total_staked)}
                      </p>
                    </div>
                  </div>

                  {/* Ban / Unban */}
                  {user.is_banned ? (
                    <Button
                      variant="outline"
                      className="w-full border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10"
                      disabled={unbanMutation.isPending}
                      onClick={() => unbanMutation.mutate()}
                    >
                      <Shield className="mr-2 h-4 w-4" />
                      Unban User
                    </Button>
                  ) : (
                    <Button
                      variant="destructive"
                      className="w-full"
                      disabled={banMutation.isPending}
                      onClick={() => {
                        if (confirm(`Ban ${user.first_name} ${user.last_name}? This will prevent them from accessing the platform.`)) {
                          banMutation.mutate()
                        }
                      }}
                    >
                      <AlertTriangle className="mr-2 h-4 w-4" />
                      Ban User
                    </Button>
                  )}
                </>
              ) : null}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
