import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { ChevronLeft, MoreVertical, X } from 'lucide-react'
import { toast } from 'sonner'
import { usersApi, userRewardsApi } from '@/api/index'
import type { AdminUserDetail, UserSpinRecord, UserTransaction, UserChallengeProgress, UserReferralEntry } from '@/types'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Pagination } from '@/components/Pagination'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { useCan } from '@/lib/permissions'

type TabType = 'spins' | 'transactions' | 'rewards'

// ── Filter pills ──────────────────────────────────────────────────────────────

function FilterPills<T extends string>({
  options,
  active,
  onChange,
}: {
  options: { label: string; value: T | undefined }[]
  active: T | undefined
  onChange: (v: T | undefined) => void
}) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      {options.map((opt) => {
        const isActive = opt.value === active
        return (
          <button
            key={String(opt.value ?? 'all')}
            onClick={() => onChange(opt.value)}
            className="px-3 py-1 rounded-lg text-xs font-medium transition-colors"
            style={
              isActive
                ? { background: '#C9961A', color: '#07090F' }
                : {
                    background: '#0D1836',
                    color: '#64748b',
                    border: '1px solid #1e2a4a',
                  }
            }
          >
            {opt.label}
          </button>
        )
      })}
    </div>
  )
}

// ── Badges ────────────────────────────────────────────────────────────────────

function KYCBadge({ status }: { status: string }) {
  if (status === 'Done' || status === 'approved') return <Badge variant="success">Done</Badge>
  if (status === 'Pending' || status === 'pending') return <Badge variant="warning">Pending</Badge>
  if (status === 'Rejected' || status === 'rejected') return <Badge variant="destructive">Rejected</Badge>
  return <Badge variant="secondary">Not Submitted</Badge>
}

function RiskBadge({ risk }: { risk: string }) {
  if (risk === 'Low') return <Badge variant="success">Done</Badge>
  if (risk === 'Medium') return <Badge variant="warning">Medium</Badge>
  if (risk === 'High') return <Badge variant="destructive">High</Badge>
  return <Badge variant="secondary">{risk}</Badge>
}

// ── Confirm dialog ────────────────────────────────────────────────────────────

function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel,
  confirmStyle,
  onConfirm,
  onClose,
  isPending,
}: {
  open: boolean
  title: string
  message: string
  confirmLabel: string
  confirmStyle?: React.CSSProperties
  onConfirm: () => void
  onClose: () => void
  isPending: boolean
}) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent
        className="max-w-sm border-[#1e2a4a] p-0"
        style={{ background: '#0D1836' }}
      >
        <DialogHeader className="flex flex-row items-center justify-between p-5 pb-4 border-b border-[#1e2a4a]">
          <DialogTitle className="text-white text-base">{title}</DialogTitle>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors">
            <X className="h-4 w-4" />
          </button>
        </DialogHeader>
        <div className="p-5 space-y-5">
          <p className="text-sm text-muted-foreground">{message}</p>
          <div className="flex gap-3">
            <button
              onClick={onClose}
              disabled={isPending}
              className="flex-1 py-2.5 text-sm font-medium rounded-xl border border-[#1e2a4a] text-muted-foreground hover:text-white transition-colors disabled:opacity-50"
            >
              No
            </button>
            <button
              onClick={onConfirm}
              disabled={isPending}
              className="flex-1 py-2.5 text-sm font-semibold rounded-xl transition-opacity disabled:opacity-60"
              style={confirmStyle ?? { background: '#C9961A', color: '#07090F' }}
            >
              {isPending ? 'Processing…' : confirmLabel}
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

// ── Spin row ──────────────────────────────────────────────────────────────────

function SpinRow({ spin }: { spin: UserSpinRecord }) {
  const multiplier = parseFloat(spin.multiplier)
  const isLoss = spin.outcome === 'loss'
  const winVal = parseFloat(spin.win_value)

  return (
    <div
      className="flex items-center gap-4 px-4 py-3 rounded-xl transition-colors"
      style={{ border: '1px solid #1e2a4a', marginBottom: '8px' }}
      onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.02)')}
      onMouseLeave={(e) => (e.currentTarget.style.background = '')}
    >
      <div className="flex-1 flex flex-wrap items-center gap-x-6 gap-y-1 min-w-0">
        <span className="text-sm text-muted-foreground">
          Stake:{' '}
          <span className="text-white font-medium">
            {parseFloat(spin.stake).toLocaleString()} coins
          </span>
        </span>
        <span className="text-sm text-muted-foreground">
          {multiplier}× Multiplier
        </span>
      </div>
      <div className="flex items-center gap-4 shrink-0">
        {isLoss ? (
          <span className="text-sm font-bold text-red-400">LOSS</span>
        ) : (
          <span className="text-sm font-bold" style={{ color: '#C9961A' }}>
            +₦{winVal.toLocaleString()}
          </span>
        )}
        <span className="text-xs text-muted-foreground whitespace-nowrap">{spin.date}</span>
      </div>
    </div>
  )
}

// ── Transaction row ───────────────────────────────────────────────────────────

function TxRow({ tx }: { tx: UserTransaction }) {
  const isCredit = tx.is_credit
  const amount = parseFloat(tx.amount)
  const isCoin = tx.balance_type === 'coin'

  return (
    <div
      className="flex items-center gap-3 px-4 py-3 rounded-xl transition-colors"
      style={{ border: '1px solid #1e2a4a', marginBottom: '8px' }}
      onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.02)')}
      onMouseLeave={(e) => (e.currentTarget.style.background = '')}
    >
      {/* Icon */}
      <div
        className="flex h-8 w-8 items-center justify-center rounded-full text-sm shrink-0 font-bold"
        style={{
          background: isCredit ? '#22c55e18' : '#ef444418',
          color: isCredit ? '#22c55e' : '#ef4444',
        }}
      >
        {isCredit ? '↓' : '↑'}
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-white">{tx.label}</p>
      </div>

      <div className="flex items-center gap-4 shrink-0">
        <span
          className="text-sm font-semibold"
          style={{ color: isCredit ? '#C9961A' : '#ef4444' }}
        >
          {isCredit ? '+' : '-'}
          {isCoin ? '🪙 ' : '₦'}
          {amount.toLocaleString()}
        </span>
        <span className="text-xs text-muted-foreground whitespace-nowrap">{tx.date}</span>
      </div>
    </div>
  )
}

// ── Challenge progress row ────────────────────────────────────────────────────

const REWARD_LABELS: Record<string, string> = {
  coins: '🪙',
  cash: '₦',
  free_spins: '🎡',
  multiplier_boost: '⚡',
}

function ChallengeProgressRow({ challenge }: { challenge: UserChallengeProgress }) {
  const pct = Math.min(challenge.progress_pct, 100)
  const rewardSymbol = REWARD_LABELS[challenge.reward.type] ?? ''
  const rewardText = challenge.reward.type === 'cash'
    ? `₦${challenge.reward.amount.toLocaleString()}`
    : challenge.reward.type === 'coins'
      ? `${challenge.reward.amount.toLocaleString()} coins`
      : `${challenge.reward.amount}`

  return (
    <div
      className="rounded-xl px-4 py-3 flex items-center gap-4"
      style={{ border: '1px solid #1e2a4a' }}
    >
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2 mb-1.5">
          <p className="text-sm font-medium text-white truncate">{challenge.challenge_name}</p>
          {challenge.is_completed
            ? <Badge variant="success" className="text-xs shrink-0">Completed</Badge>
            : <span className="text-xs text-muted-foreground shrink-0">{pct.toFixed(0)}%</span>
          }
        </div>
        <div className="h-1.5 rounded-full" style={{ background: '#1e2a4a' }}>
          <div
            className="h-1.5 rounded-full transition-all"
            style={{
              width: `${pct}%`,
              background: challenge.is_completed ? '#22c55e' : '#C9961A',
            }}
          />
        </div>
        <p className="text-xs text-muted-foreground mt-1">
          {challenge.current_count}/{challenge.target_count}
          {challenge.reward_claimed && (
            <span className="ml-2" style={{ color: '#22c55e' }}>
              {rewardSymbol} {rewardText} sent
            </span>
          )}
        </p>
      </div>
    </div>
  )
}

// ── Referral progress row ─────────────────────────────────────────────────────

function ReferralProgressRow({ referral }: { referral: UserReferralEntry }) {
  const STATUS_CONFIG: Record<string, { label: string; variant: 'success' | 'warning' | 'destructive' | 'secondary' }> = {
    pending: { label: 'Pending', variant: 'secondary' },
    qualified: { label: 'Qualified', variant: 'warning' },
    rewarded: { label: 'Rewarded', variant: 'success' },
    rejected: { label: 'Rejected', variant: 'destructive' },
  }
  const cfg = STATUS_CONFIG[referral.status] ?? { label: referral.status, variant: 'secondary' as const }

  return (
    <div
      className="flex items-center justify-between gap-3 rounded-xl px-4 py-3 transition-colors"
      style={{ border: '1px solid #1e2a4a' }}
    >
      <div>
        <p className="text-sm font-medium text-white">{referral.referred_user.name}</p>
        <p className="text-xs text-muted-foreground mt-0.5">
          #{referral.referred_user.telegram_id} · {new Date(referral.created_at).toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' })}
        </p>
      </div>
      <Badge variant={cfg.variant}>{cfg.label}</Badge>
    </div>
  )
}

// ── UserDetailPage ────────────────────────────────────────────────────────────

const PAGE_SIZE = 10

export function UserDetailPage() {
  const can = useCan()
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const [activeTab, setActiveTab] = useState<TabType>('spins')
  const [spinsPage, setSpinsPage] = useState(1)
  const [txPage, setTxPage] = useState(1)
  const [spinOutcome, setSpinOutcome] = useState<'win' | 'loss' | undefined>(undefined)
  const [txType, setTxType] = useState<string | undefined>(undefined)
  const [menuOpen, setMenuOpen] = useState(false)
  const [confirmState, setConfirmState] = useState<{
    type: 'flag' | 'ban' | null
  }>({ type: null })

  const { data: user, isLoading: userLoading } = useQuery<AdminUserDetail>({
    queryKey: ['user', id],
    queryFn: () => usersApi.detail(id!),
    enabled: !!id,
  })

  const { data: spinsData, isLoading: spinsLoading } = useQuery({
    queryKey: ['user-spins', id, spinsPage, spinOutcome],
    queryFn: () => usersApi.spins(id!, spinsPage, spinOutcome),
    enabled: !!id && activeTab === 'spins',
  })

  const { data: txData, isLoading: txLoading } = useQuery({
    queryKey: ['user-transactions', id, txPage, txType],
    queryFn: () => usersApi.transactions(id!, txPage, txType),
    enabled: !!id && activeTab === 'transactions',
  })

  const { data: rewardsData, isLoading: rewardsLoading } = useQuery({
    queryKey: ['user-rewards', id],
    queryFn: () => userRewardsApi.get(id!),
    enabled: !!id && activeTab === 'rewards',
  })

  const flagMutation = useMutation({
    mutationFn: () => usersApi.flag(id!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user', id] })
      toast.success(`${user?.name} has been flagged.`)
      setConfirmState({ type: null })
    },
    onError: (err: unknown) => {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message
      toast.error(msg ?? 'Failed to flag user.')
    },
  })

  const banMutation = useMutation({
    mutationFn: () => usersApi.ban(id!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user', id] })
      toast.success(`${user?.name} has been banned.`)
      setConfirmState({ type: null })
    },
    onError: (err: unknown) => {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message
      toast.error(msg ?? 'Failed to ban user.')
    },
  })

  const spinsTotalPages = spinsData ? Math.ceil(spinsData.count / PAGE_SIZE) : 1
  const txTotalPages = txData ? Math.ceil(txData.count / PAGE_SIZE) : 1

  const initials = user
    ? user.name.split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase()
    : '?'

  const isPending = flagMutation.isPending || banMutation.isPending

  return (
    <div className="space-y-5">
      {/* Back */}
      <button
        onClick={() => navigate('/users')}
        className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-white transition-colors"
      >
        <ChevronLeft className="h-4 w-4" />
        User Details
      </button>

      {/* ── Top cards ── */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        {/* Profile card (wider) */}
        <div
          className="lg:col-span-2 rounded-2xl p-5 flex items-center gap-4"
          style={{ background: '#0D1836', border: '1px solid #1e2a4a' }}
        >
          {userLoading ? (
            <>
              <Skeleton className="h-16 w-16 rounded-full shrink-0" />
              <div className="space-y-2">
                <Skeleton className="h-5 w-32" />
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-28" />
              </div>
            </>
          ) : user ? (
            <>
              {/* Avatar */}
              <div
                className="flex h-16 w-16 items-center justify-center rounded-full text-xl font-bold text-white shrink-0"
                style={{ background: '#1A237E' }}
              >
                {initials}
              </div>
              <div className="min-w-0">
                <p className="font-bold text-white text-base leading-snug">{user.name}</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  ID:{' '}
                  <span className="text-foreground">#{user.telegram_id}</span>
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Registered on:{' '}
                  <span style={{ color: '#C9961A' }}>{user.registered_via}</span>
                </p>
                {user.last_login && (
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Contact:{' '}
                    <span className="text-foreground">{user.last_login}</span>
                  </p>
                )}
              </div>
            </>
          ) : null}
        </div>

        {/* Stats card */}
        <div
          className="lg:col-span-3 rounded-2xl p-5 space-y-3"
          style={{ background: '#0D1836', border: '1px solid #1e2a4a' }}
        >
          {userLoading ? (
            <div className="space-y-3">
              <Skeleton className="h-5 w-40" />
              <div className="grid grid-cols-2 gap-3">
                <Skeleton className="h-20 rounded-xl" />
                <Skeleton className="h-20 rounded-xl" />
              </div>
            </div>
          ) : user ? (
            <>
              {/* KYC / Risk / menu row */}
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 flex-wrap">
                  <div className="flex items-center gap-1.5 text-sm">
                    <span className="text-muted-foreground">KYC:</span>
                    <KYCBadge status={user.kyc.display_status} />
                  </div>
                  <div className="flex items-center gap-1.5 text-sm">
                    <span className="text-muted-foreground">Risk:</span>
                    <RiskBadge risk={user.risk} />
                  </div>
                </div>
                {/* 3-dot action menu — only shown when the admin has at least one user action */}
                {(can('flag_user') || can('delete_user')) && (
                <div className="relative">
                  <button
                    onClick={() => setMenuOpen((v) => !v)}
                    className="p-1.5 rounded-lg text-muted-foreground hover:text-white hover:bg-white/5 transition-colors"
                  >
                    <MoreVertical className="h-4 w-4" />
                  </button>
                  {menuOpen && (can('flag_user') || can('delete_user')) && (
                    <div
                      className="absolute right-0 top-full mt-1 z-20 w-36 rounded-xl border border-[#1e2a4a] py-1 shadow-xl"
                      style={{ background: '#0D1836' }}
                    >
                      {can('flag_user') && (
                        <button
                          className="block w-full px-4 py-2 text-left text-sm text-amber-400 hover:bg-white/5 transition-colors"
                          onClick={() => {
                            setMenuOpen(false)
                            setConfirmState({ type: 'flag' })
                          }}
                        >
                          Flag User
                        </button>
                      )}
                      {can('delete_user') && (
                        <button
                          className="block w-full px-4 py-2 text-left text-sm text-red-400 hover:bg-white/5 transition-colors"
                          onClick={() => {
                            setMenuOpen(false)
                            setConfirmState({ type: 'ban' })
                          }}
                        >
                          Ban User
                        </button>
                      )}
                    </div>
                  )}
                </div>
                )}
              </div>

              {/* Balance + Staked */}
              <div className="grid grid-cols-2 gap-3">
                <div
                  className="rounded-xl px-4 py-3"
                  style={{ border: '1px solid #1e2a4a' }}
                >
                  <p className="text-xs text-muted-foreground mb-1">Balance</p>
                  <p className="text-2xl font-bold" style={{ color: '#C9961A' }}>
                    {parseFloat(user.cash_balance).toLocaleString()}
                  </p>
                </div>
                <div
                  className="rounded-xl px-4 py-3"
                  style={{ border: '1px solid #1e2a4a' }}
                >
                  <p className="text-xs text-muted-foreground mb-1">Staked</p>
                  <p className="text-2xl font-bold" style={{ color: '#C9961A' }}>
                    {parseFloat(user.staked).toLocaleString()}
                  </p>
                </div>
              </div>
            </>
          ) : null}
        </div>
      </div>

      {/* ── Tabs + content ── */}
      <div>
        {/* Tab bar */}
        <div
          className="flex gap-1 border-b pb-0"
          style={{ borderColor: '#1e2a4a' }}
        >
          {(['spins', 'transactions', 'rewards'] as TabType[]).map((tab) => {
            const label = tab === 'spins' ? 'Recent Spins' : tab === 'transactions' ? 'Transaction History' : 'Rewards & Challenges'
            const isActive = activeTab === tab
            return (
              <button
                key={tab}
                onClick={() => {
                  setActiveTab(tab)
                  setSpinOutcome(undefined)
                  setTxType(undefined)
                  setSpinsPage(1)
                  setTxPage(1)
                }}
                className={`px-4 py-2.5 text-sm font-medium transition-colors relative ${
                  isActive ? 'text-white' : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {label}
                {isActive && (
                  <span
                    className="absolute bottom-0 left-0 right-0 h-0.5 rounded-full"
                    style={{ background: '#C9961A' }}
                  />
                )}
              </button>
            )
          })}
        </div>

        {/* Content */}
        <div className="mt-4">
          {/* Recent Spins */}
          {activeTab === 'spins' && (
            <div className="space-y-3">
              <FilterPills
                options={[
                  { label: 'All', value: undefined },
                  { label: 'Wins', value: 'win' as const },
                  { label: 'Losses', value: 'loss' as const },
                ]}
                active={spinOutcome}
                onChange={(v) => {
                  setSpinOutcome(v)
                  setSpinsPage(1)
                }}
              />
              {spinsLoading ? (
                <div className="space-y-2">
                  {[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-14 w-full rounded-xl" />)}
                </div>
              ) : (spinsData?.results ?? []).length === 0 ? (
                <p className="py-12 text-center text-sm text-muted-foreground">No spins found.</p>
              ) : (
                <>
                  {(spinsData?.results as UserSpinRecord[]).map((spin) => (
                    <SpinRow key={spin.id} spin={spin} />
                  ))}
                  <Pagination
                    page={spinsPage}
                    totalPages={spinsTotalPages}
                    onPageChange={setSpinsPage}
                    className="mt-4"
                  />
                </>
              )}
            </div>
          )}

          {/* Transaction History */}
          {activeTab === 'transactions' && (
            <div className="space-y-3">
              <FilterPills
                options={[
                  { label: 'All', value: undefined },
                  { label: 'Deposits', value: 'deposit' },
                  { label: 'Withdrawals', value: 'withdrawal' },
                  { label: 'Spin Stakes', value: 'spin_stake' },
                  { label: 'Spin Wins', value: 'spin_win' },
                ]}
                active={txType}
                onChange={(v) => {
                  setTxType(v)
                  setTxPage(1)
                }}
              />
              {txLoading ? (
                <div className="space-y-2">
                  {[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-14 w-full rounded-xl" />)}
                </div>
              ) : (txData?.results ?? []).length === 0 ? (
                <p className="py-12 text-center text-sm text-muted-foreground">No transactions found.</p>
              ) : (
                <>
                  {(txData?.results as UserTransaction[]).map((tx) => (
                    <TxRow key={tx.id} tx={tx} />
                  ))}
                  <Pagination
                    page={txPage}
                    totalPages={txTotalPages}
                    onPageChange={setTxPage}
                    className="mt-4"
                  />
                </>
              )}
            </div>
          )}

          {/* Rewards & Challenges */}
          {activeTab === 'rewards' && (
            <div className="space-y-5">
              {rewardsLoading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => <Skeleton key={i} className="h-20 w-full rounded-xl" />)}
                </div>
              ) : (
                <>
                  {/* Challenges section */}
                  <div>
                    <p className="text-sm font-semibold text-white mb-3">Challenges Progress</p>
                    {(rewardsData?.challenges ?? []).length === 0 ? (
                      <p className="text-sm text-muted-foreground py-4">No challenge activity yet.</p>
                    ) : (
                      <div className="space-y-2">
                        {(rewardsData?.challenges as UserChallengeProgress[]).map((ch) => (
                          <ChallengeProgressRow key={ch.challenge_id} challenge={ch} />
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Referrals section */}
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <p className="text-sm font-semibold text-white">Referrals</p>
                      {rewardsData?.referrals?.stats && (
                        <p className="text-xs text-muted-foreground">
                          {rewardsData.referrals.stats.rewarded} rewarded · {rewardsData.referrals.stats.total_referrals} total
                        </p>
                      )}
                    </div>
                    {(rewardsData?.referrals?.referrals ?? []).length === 0 ? (
                      <p className="text-sm text-muted-foreground py-4">No referrals yet.</p>
                    ) : (
                      <div className="space-y-2">
                        {(rewardsData?.referrals.referrals as UserReferralEntry[]).map((ref) => (
                          <ReferralProgressRow key={ref.id} referral={ref} />
                        ))}
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ── Confirm dialogs ── */}
      <ConfirmDialog
        open={confirmState.type === 'flag'}
        title="Flag"
        message={`Are you sure you want to flag ${user?.name ?? 'this user'}?`}
        confirmLabel="Yes"
        onConfirm={() => flagMutation.mutate()}
        onClose={() => setConfirmState({ type: null })}
        isPending={isPending}
      />
      <ConfirmDialog
        open={confirmState.type === 'ban'}
        title="Ban User"
        message={`Are you sure you want to ban ${user?.name ?? 'this user'}?`}
        confirmLabel="Yes, Ban"
        confirmStyle={{ background: '#ef4444', color: '#fff' }}
        onConfirm={() => banMutation.mutate()}
        onClose={() => setConfirmState({ type: null })}
        isPending={isPending}
      />
    </div>
  )
}
