import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus, X, Users, CheckCircle, Trophy, ChevronRight, ToggleLeft, ToggleRight, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { challengesApi } from '@/api/index'
import type { AdminChallenge, ChallengeParticipant, ChallengeCompletion, CreateChallengePayload } from '@/types'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Pagination } from '@/components/Pagination'

// ── Helpers ───────────────────────────────────────────────────────────────────

const CHALLENGE_TYPES = [
  'spin_count', 'spin_streak', 'daily_login', 'login_streak',
  'referral', 'deposit', 'deposit_streak', 'welcome', 'win_streak', 'total_staked', 'custom',
]

const RECURRENCES = ['daily', 'weekly', 'monthly', 'one_time', 'permanent']

const REWARD_TYPES = ['coins', 'cash', 'free_spins', 'multiplier_boost']

const TYPE_LABELS: Record<string, string> = {
  spin_count: 'Spin Count',
  spin_streak: 'Spin Streak',
  daily_login: 'Daily Login',
  login_streak: 'Login Streak',
  referral: 'Referral',
  deposit: 'Deposit',
  deposit_streak: 'Deposit Streak',
  welcome: 'Welcome',
  win_streak: 'Win Streak',
  total_staked: 'Total Staked',
  custom: 'Custom',
}

const RECURRENCE_LABELS: Record<string, string> = {
  daily: 'Daily',
  weekly: 'Weekly',
  monthly: 'Monthly',
  one_time: 'One-Time',
  permanent: 'Permanent',
}

const REWARD_LABELS: Record<string, string> = {
  coins: '🪙 Coins',
  cash: '₦ Cash',
  free_spins: '🎡 Free Spins',
  multiplier_boost: '⚡ Multiplier',
}

function formatReward(reward: { type: string; amount: number }) {
  switch (reward.type) {
    case 'coins': return `${reward.amount.toLocaleString()} coins`
    case 'cash': return `₦${reward.amount.toLocaleString()}`
    case 'free_spins': return `${reward.amount} free spin${reward.amount > 1 ? 's' : ''}`
    case 'multiplier_boost': return `${reward.amount}x multiplier`
    default: return `${reward.amount}`
  }
}

function formatDate(iso: string | null) {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' })
}

// ── Stat card ─────────────────────────────────────────────────────────────────

function StatCard({ label, value }: { label: string; value: number | string }) {
  return (
    <div
      className="rounded-2xl p-5 flex flex-col gap-1"
      style={{ background: '#0D1836', border: '1px solid #1e2a4a' }}
    >
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="text-2xl font-bold" style={{ color: '#C9961A' }}>
        {typeof value === 'number' ? value.toLocaleString() : value}
      </p>
    </div>
  )
}

// ── Create Challenge Form ─────────────────────────────────────────────────────

const INITIAL_FORM: CreateChallengePayload = {
  name: '',
  description: '',
  type: 'spin_count',
  recurrence: 'daily',
  criteria: { action: 'spin', target_count: 5 },
  reward: { type: 'coins', amount: 200 },
  max_completions_per_user: 1,
  is_active: true,
  is_visible: true,
  starts_at: null,
  expires_at: null,
}

function CreateChallengeDialog({
  open,
  onClose,
  onCreated,
}: {
  open: boolean
  onClose: () => void
  onCreated: () => void
}) {
  const [form, setForm] = useState<CreateChallengePayload>(INITIAL_FORM)
  const [error, setError] = useState('')

  const mutation = useMutation({
    mutationFn: () => challengesApi.create(form),
    onSuccess: () => {
      toast.success('Challenge created successfully.')
      onCreated()
      setForm(INITIAL_FORM)
      setError('')
    },
    onError: (err: unknown) => {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message
      setError(msg ?? 'Failed to create challenge.')
    },
  })

  function handleSubmit() {
    if (!form.name.trim()) { setError('Name is required.'); return }
    if (!form.type) { setError('Type is required.'); return }
    if (!form.recurrence) { setError('Recurrence is required.'); return }
    if (!form.reward.type) { setError('Reward type is required.'); return }
    if (form.reward.amount < 0) { setError('Reward amount must be ≥ 0.'); return }
    setError('')
    mutation.mutate()
  }

  function updateCriteria(key: string, value: unknown) {
    setForm((f) => ({ ...f, criteria: { ...f.criteria, [key]: value } }))
  }

  const inputClass = "w-full rounded-xl px-3 py-2.5 text-sm text-white bg-[#07090F] border border-[#1e2a4a] focus:outline-none focus:border-[#C9961A] placeholder:text-muted-foreground/50"
  const labelClass = "block text-xs text-muted-foreground mb-1"

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent
        className="max-w-lg border-[#1e2a4a] p-0 max-h-[90vh] overflow-y-auto"
        style={{ background: '#0D1836' }}
      >
        <DialogHeader className="flex flex-row items-center justify-between p-5 pb-4 border-b border-[#1e2a4a] sticky top-0 z-10" style={{ background: '#0D1836' }}>
          <DialogTitle className="text-white text-base">Create Challenge</DialogTitle>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors">
            <X className="h-4 w-4" />
          </button>
        </DialogHeader>

        <div className="p-5 space-y-4">
          {/* Name */}
          <div>
            <label className={labelClass}>Name *</label>
            <input
              className={inputClass}
              placeholder="e.g. Daily Spinner"
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            />
          </div>

          {/* Description */}
          <div>
            <label className={labelClass}>Description</label>
            <textarea
              className={inputClass + ' resize-none h-16'}
              placeholder="Short description shown to players"
              value={form.description ?? ''}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
            />
          </div>

          {/* Type + Recurrence */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelClass}>Type *</label>
              <select
                className={inputClass}
                value={form.type}
                onChange={(e) => setForm((f) => ({ ...f, type: e.target.value }))}
              >
                {CHALLENGE_TYPES.map((t) => (
                  <option key={t} value={t}>{TYPE_LABELS[t] ?? t}</option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelClass}>Recurrence *</label>
              <select
                className={inputClass}
                value={form.recurrence}
                onChange={(e) => setForm((f) => ({ ...f, recurrence: e.target.value }))}
              >
                {RECURRENCES.map((r) => (
                  <option key={r} value={r}>{RECURRENCE_LABELS[r] ?? r}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Criteria target count */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelClass}>Target Count *</label>
              <input
                type="number"
                min={1}
                className={inputClass}
                value={(form.criteria.target_count as number) ?? 1}
                onChange={(e) => updateCriteria('target_count', parseInt(e.target.value) || 1)}
              />
            </div>
            {(form.type === 'deposit') && (
              <div>
                <label className={labelClass}>Min Deposit (₦)</label>
                <input
                  type="number"
                  min={0}
                  className={inputClass}
                  placeholder="e.g. 5000"
                  value={(form.criteria.min_deposit as string) ?? ''}
                  onChange={(e) => updateCriteria('min_deposit', e.target.value)}
                />
              </div>
            )}
            {(form.type === 'spin_count') && (
              <div>
                <label className={labelClass}>Min Stake (₦)</label>
                <input
                  type="number"
                  min={0}
                  className={inputClass}
                  placeholder="optional"
                  value={(form.criteria.min_stake as string) ?? ''}
                  onChange={(e) => updateCriteria('min_stake', e.target.value)}
                />
              </div>
            )}
          </div>

          {/* Reward */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelClass}>Reward Type *</label>
              <select
                className={inputClass}
                value={form.reward.type}
                onChange={(e) => setForm((f) => ({ ...f, reward: { ...f.reward, type: e.target.value } }))}
              >
                {REWARD_TYPES.map((r) => (
                  <option key={r} value={r}>{REWARD_LABELS[r] ?? r}</option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelClass}>Reward Amount *</label>
              <input
                type="number"
                min={0}
                className={inputClass}
                value={form.reward.amount}
                onChange={(e) => setForm((f) => ({ ...f, reward: { ...f.reward, amount: parseInt(e.target.value) || 0 } }))}
              />
            </div>
          </div>

          {/* Max completions + Visibility */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelClass}>Max Completions per User</label>
              <input
                type="number"
                min={1}
                className={inputClass}
                placeholder="Leave blank for unlimited"
                value={form.max_completions_per_user ?? ''}
                onChange={(e) => setForm((f) => ({ ...f, max_completions_per_user: e.target.value ? parseInt(e.target.value) : null }))}
              />
            </div>
            <div>
              <label className={labelClass}>Visible to Players</label>
              <div className="flex items-center gap-2 mt-2">
                <button
                  type="button"
                  onClick={() => setForm((f) => ({ ...f, is_visible: !f.is_visible }))}
                  className="flex items-center gap-2 text-sm text-muted-foreground hover:text-white transition-colors"
                >
                  {form.is_visible
                    ? <ToggleRight className="h-5 w-5" style={{ color: '#C9961A' }} />
                    : <ToggleLeft className="h-5 w-5" />
                  }
                  {form.is_visible ? 'Visible' : 'Hidden'}
                </button>
              </div>
            </div>
          </div>

          {/* Dates */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelClass}>Starts At</label>
              <input
                type="datetime-local"
                className={inputClass}
                value={form.starts_at ? form.starts_at.slice(0, 16) : ''}
                onChange={(e) => setForm((f) => ({ ...f, starts_at: e.target.value ? new Date(e.target.value).toISOString() : null }))}
              />
            </div>
            <div>
              <label className={labelClass}>Expires At</label>
              <input
                type="datetime-local"
                className={inputClass}
                value={form.expires_at ? form.expires_at.slice(0, 16) : ''}
                onChange={(e) => setForm((f) => ({ ...f, expires_at: e.target.value ? new Date(e.target.value).toISOString() : null }))}
              />
            </div>
          </div>

          {error && <p className="text-sm text-red-400">{error}</p>}

          <div className="flex gap-3 pt-1">
            <button
              onClick={onClose}
              disabled={mutation.isPending}
              className="flex-1 py-2.5 text-sm font-medium rounded-xl border border-[#1e2a4a] text-muted-foreground hover:text-white transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={mutation.isPending}
              className="flex-1 py-2.5 text-sm font-semibold rounded-xl transition-opacity disabled:opacity-60"
              style={{ background: '#C9961A', color: '#07090F' }}
            >
              {mutation.isPending ? 'Creating…' : 'Create Challenge'}
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

// ── Participants/Completions Drawer ───────────────────────────────────────────

function ParticipantsDialog({
  challenge,
  mode,
  onClose,
}: {
  challenge: AdminChallenge
  mode: 'participants' | 'completions'
  onClose: () => void
}) {
  const [page, setPage] = useState(1)

  const { data: pData } = useQuery({
    queryKey: ['challenge-participants', challenge.id, page],
    queryFn: () => challengesApi.participants(challenge.id, page),
    enabled: mode === 'participants',
  })

  const { data: cData } = useQuery({
    queryKey: ['challenge-completions', challenge.id, page],
    queryFn: () => challengesApi.completions(challenge.id, page),
    enabled: mode === 'completions',
  })

  const isParticipants = mode === 'participants'
  const results = isParticipants
    ? (pData?.results ?? []) as ChallengeParticipant[]
    : (cData?.results ?? []) as ChallengeCompletion[]
  const count = isParticipants ? (pData?.count ?? 0) : (cData?.count ?? 0)
  const totalPages = Math.ceil(count / 10)

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent
        className="max-w-lg border-[#1e2a4a] p-0 max-h-[85vh] flex flex-col"
        style={{ background: '#0D1836' }}
      >
        <DialogHeader className="flex flex-row items-center justify-between p-5 pb-4 border-b border-[#1e2a4a]">
          <div>
            <DialogTitle className="text-white text-base">
              {isParticipants ? 'Participants' : 'Completions'}
            </DialogTitle>
            <p className="text-xs text-muted-foreground mt-0.5">{challenge.name}</p>
          </div>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors">
            <X className="h-4 w-4" />
          </button>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto p-5 space-y-2">
          {results.length === 0 ? (
            <p className="text-center text-sm text-muted-foreground py-10">No records yet.</p>
          ) : isParticipants ? (
            (results as ChallengeParticipant[]).map((p) => (
              <div
                key={p.user_id}
                className="flex items-center gap-3 rounded-xl px-4 py-3"
                style={{ border: '1px solid #1e2a4a' }}
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white">{p.name}</p>
                  <div className="mt-1.5 h-1.5 rounded-full" style={{ background: '#1e2a4a' }}>
                    <div
                      className="h-1.5 rounded-full transition-all"
                      style={{ width: `${p.progress_pct}%`, background: p.is_completed ? '#22c55e' : '#C9961A' }}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {p.current_count}/{p.target_count} • {p.progress_pct.toFixed(0)}%
                  </p>
                </div>
                {p.is_completed && (
                  <Badge variant="success" className="text-xs shrink-0">Done</Badge>
                )}
              </div>
            ))
          ) : (
            (results as ChallengeCompletion[]).map((c) => (
              <div
                key={c.user_id}
                className="flex items-center justify-between gap-3 rounded-xl px-4 py-3"
                style={{ border: '1px solid #1e2a4a' }}
              >
                <div>
                  <p className="text-sm font-medium text-white">{c.name}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Completed {formatDate(c.completed_at)}
                  </p>
                </div>
                {c.reward_claimed && (
                  <Badge variant="success" className="text-xs shrink-0">Reward Sent</Badge>
                )}
              </div>
            ))
          )}
        </div>

        {totalPages > 1 && (
          <div className="border-t border-[#1e2a4a] p-4">
            <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}

// ── Challenge Row ─────────────────────────────────────────────────────────────

function ChallengeRow({
  challenge,
  onViewParticipants,
  onViewCompletions,
}: {
  challenge: AdminChallenge
  onViewParticipants: (c: AdminChallenge) => void
  onViewCompletions: (c: AdminChallenge) => void
}) {
  const qc = useQueryClient()

  const toggleMutation = useMutation({
    mutationFn: () => challengesApi.update(challenge.id, { is_active: !challenge.is_active }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['challenges'] })
      toast.success(`Challenge ${challenge.is_active ? 'deactivated' : 'activated'}.`)
    },
    onError: () => toast.error('Failed to update challenge.'),
  })

  const deleteMutation = useMutation({
    mutationFn: () => challengesApi.delete(challenge.id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['challenges'] })
      toast.success('Challenge deactivated.')
    },
    onError: () => toast.error('Failed to deactivate challenge.'),
  })

  return (
    <tr
      className="border-t transition-colors"
      style={{ borderColor: '#1e2a4a' }}
    >
      {/* Name + type */}
      <td className="px-4 py-3">
        <p className="text-sm font-medium text-white">{challenge.name}</p>
        <p className="text-xs text-muted-foreground mt-0.5">
          {TYPE_LABELS[challenge.type] ?? challenge.type}
        </p>
      </td>

      {/* Recurrence */}
      <td className="px-4 py-3 text-sm text-muted-foreground">
        {RECURRENCE_LABELS[challenge.recurrence] ?? challenge.recurrence}
      </td>

      {/* Reward */}
      <td className="px-4 py-3 text-sm font-medium" style={{ color: '#C9961A' }}>
        {formatReward(challenge.reward)}
      </td>

      {/* Status */}
      <td className="px-4 py-3">
        {challenge.is_active
          ? <Badge variant="success">Active</Badge>
          : <Badge variant="secondary">Inactive</Badge>
        }
        {!challenge.is_visible && (
          <span className="ml-1.5 text-xs text-muted-foreground">(hidden)</span>
        )}
      </td>

      {/* Participants */}
      <td className="px-4 py-3">
        <button
          onClick={() => onViewParticipants(challenge)}
          className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-white transition-colors"
        >
          <Users className="h-3.5 w-3.5" />
          {challenge.participant_count.toLocaleString()}
          <ChevronRight className="h-3 w-3" />
        </button>
      </td>

      {/* Completions */}
      <td className="px-4 py-3">
        <button
          onClick={() => onViewCompletions(challenge)}
          className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-white transition-colors"
        >
          <CheckCircle className="h-3.5 w-3.5" />
          {challenge.completion_count.toLocaleString()}
          <ChevronRight className="h-3 w-3" />
        </button>
      </td>

      {/* Actions */}
      <td className="px-4 py-3">
        <div className="flex items-center gap-2">
          <button
            onClick={() => toggleMutation.mutate()}
            disabled={toggleMutation.isPending}
            title={challenge.is_active ? 'Deactivate' : 'Activate'}
            className="p-1.5 rounded-lg text-muted-foreground hover:text-white hover:bg-white/5 transition-colors disabled:opacity-40"
          >
            {challenge.is_active
              ? <ToggleRight className="h-4 w-4" style={{ color: '#22c55e' }} />
              : <ToggleLeft className="h-4 w-4" />
            }
          </button>
          <button
            onClick={() => {
              if (confirm(`Deactivate "${challenge.name}"?`)) deleteMutation.mutate()
            }}
            disabled={deleteMutation.isPending}
            title="Deactivate / delete"
            className="p-1.5 rounded-lg text-muted-foreground hover:text-red-400 hover:bg-red-400/10 transition-colors disabled:opacity-40"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </td>
    </tr>
  )
}

// ── ChallengesPage ────────────────────────────────────────────────────────────

const PAGE_SIZE = 10

export function ChallengesPage() {
  const [page, setPage] = useState(1)
  const [typeFilter, setTypeFilter] = useState('')
  const [activeFilter, setActiveFilter] = useState<'all' | 'active' | 'inactive'>('all')
  const [showCreate, setShowCreate] = useState(false)
  const [drawerState, setDrawerState] = useState<{
    challenge: AdminChallenge | null
    mode: 'participants' | 'completions'
  }>({ challenge: null, mode: 'participants' })

  const qc = useQueryClient()

  const queryParams = {
    page,
    ...(typeFilter ? { type: typeFilter } : {}),
    ...(activeFilter !== 'all' ? { is_active: activeFilter === 'active' } : {}),
  }

  const { data, isLoading } = useQuery({
    queryKey: ['challenges', queryParams],
    queryFn: () => challengesApi.list(queryParams),
  })

  const challenges = data?.results ?? []
  const totalPages = data ? Math.ceil(data.count / PAGE_SIZE) : 1

  // Stats from all fetched data
  const totalActive = challenges.filter((c) => c.is_active).length
  const totalParticipants = challenges.reduce((s, c) => s + c.participant_count, 0)
  const totalCompletions = challenges.reduce((s, c) => s + c.completion_count, 0)

  const inputClass = "rounded-xl px-3 py-2 text-sm text-white bg-[#07090F] border border-[#1e2a4a] focus:outline-none focus:border-[#C9961A]"

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Trophy className="h-5 w-5" style={{ color: '#C9961A' }} />
          <h1 className="text-lg font-bold text-white">Challenges</h1>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-xl transition-opacity hover:opacity-90"
          style={{ background: '#C9961A', color: '#07090F' }}
        >
          <Plus className="h-4 w-4" />
          New Challenge
        </button>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Total Challenges" value={data?.count ?? 0} />
        <StatCard label="Active" value={totalActive} />
        <StatCard label="Total Participants" value={totalParticipants} />
        <StatCard label="Total Completions" value={totalCompletions} />
      </div>

      {/* Filters */}
      <div
        className="flex flex-wrap items-center gap-3 rounded-2xl p-4"
        style={{ background: '#0D1836', border: '1px solid #1e2a4a' }}
      >
        <select
          className={inputClass}
          value={typeFilter}
          onChange={(e) => { setTypeFilter(e.target.value); setPage(1) }}
        >
          <option value="">All Types</option>
          {CHALLENGE_TYPES.map((t) => (
            <option key={t} value={t}>{TYPE_LABELS[t]}</option>
          ))}
        </select>

        <div className="flex items-center gap-1">
          {(['all', 'active', 'inactive'] as const).map((val) => (
            <button
              key={val}
              onClick={() => { setActiveFilter(val); setPage(1) }}
              className="px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-colors"
              style={
                activeFilter === val
                  ? { background: '#C9961A', color: '#07090F' }
                  : { background: '#07090F', color: '#64748b', border: '1px solid #1e2a4a' }
              }
            >
              {val}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div
        className="rounded-2xl overflow-hidden"
        style={{ background: '#0D1836', border: '1px solid #1e2a4a' }}
      >
        {isLoading ? (
          <div className="p-5 space-y-3">
            {[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-14 w-full rounded-xl" />)}
          </div>
        ) : challenges.length === 0 ? (
          <p className="py-16 text-center text-sm text-muted-foreground">No challenges found.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr style={{ borderBottom: '1px solid #1e2a4a' }}>
                  {['Challenge', 'Recurrence', 'Reward', 'Status', 'Participants', 'Completions', 'Actions'].map((h) => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {challenges.map((challenge) => (
                  <ChallengeRow
                    key={challenge.id}
                    challenge={challenge}
                    onViewParticipants={(c) => setDrawerState({ challenge: c, mode: 'participants' })}
                    onViewCompletions={(c) => setDrawerState({ challenge: c, mode: 'completions' })}
                  />
                ))}
              </tbody>
            </table>
          </div>
        )}

        {totalPages > 1 && (
          <div className="p-4 border-t border-[#1e2a4a]">
            <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
          </div>
        )}
      </div>

      {/* Create dialog */}
      <CreateChallengeDialog
        open={showCreate}
        onClose={() => setShowCreate(false)}
        onCreated={() => {
          setShowCreate(false)
          qc.invalidateQueries({ queryKey: ['challenges'] })
        }}
      />

      {/* Participants/Completions dialog */}
      {drawerState.challenge && (
        <ParticipantsDialog
          challenge={drawerState.challenge}
          mode={drawerState.mode}
          onClose={() => setDrawerState({ challenge: null, mode: 'participants' })}
        />
      )}
    </div>
  )
}
