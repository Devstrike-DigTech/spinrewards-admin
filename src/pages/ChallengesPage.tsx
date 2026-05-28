import { useState, useRef, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  Plus, X, Users, CheckCircle, Trophy, ChevronRight,
  ToggleLeft, ToggleRight, Trash2, Info, Calendar, Eye, EyeOff,
} from 'lucide-react'
import { toast } from 'sonner'
import { challengesApi } from '@/api/index'
import type { AdminChallenge, ChallengeParticipant, ChallengeCompletion, CreateChallengePayload } from '@/types'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import { useCan } from '@/lib/permissions'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Pagination } from '@/components/Pagination'

// ── Constants ──────────────────────────────────────────────────────────────────

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
  welcome: 'Welcome (First Spin)',
  win_streak: 'Win Streak',
  total_staked: 'Total Staked (₦)',
  custom: 'Custom',
}

const TYPE_DESCRIPTIONS: Record<string, string> = {
  spin_count: 'Tracks how many times a player spins within the recurrence window.',
  spin_streak: 'Counts consecutive days where the player made at least one spin. Missing a day breaks the streak.',
  daily_login: 'Rewards the player simply for opening the app within each recurrence window.',
  login_streak: 'Counts consecutive days of app logins. Missing a day may break the streak.',
  referral: 'Counts referred users who completed their first deposit. Registration alone does not qualify.',
  deposit: 'Counts completed deposits within the recurrence window.',
  deposit_streak: 'Counts consecutive days where the player made at least one deposit.',
  welcome: 'One-time reward for a brand-new user\'s very first spin ever. Fires once per user, regardless of recurrence setting. Existing users with prior spins are NOT eligible.',
  win_streak: 'Counts winning spins within the recurrence window.',
  total_staked: 'Tracks cumulative Naira staked across all spins. The Target is a Naira amount — not a spin count.',
  custom: 'Admin-defined challenge. Use for logic that doesn\'t fit other types.',
}

const RECURRENCE_LABELS: Record<string, string> = {
  daily: 'Daily (resets at midnight)',
  weekly: 'Weekly (resets Monday)',
  monthly: 'Monthly (resets 1st)',
  one_time: 'One-Time (never resets)',
  permanent: 'Permanent (accumulates forever)',
}

const RECURRENCE_SHORT: Record<string, string> = {
  daily: 'Daily',
  weekly: 'Weekly',
  monthly: 'Monthly',
  one_time: 'One-Time',
  permanent: 'Permanent',
}

const REWARD_LABELS: Record<string, string> = {
  coins: '🪙 Coins',
  cash: '₦ Cash (real money)',
  free_spins: '🎡 Free Spins (not yet wired)',
  multiplier_boost: '⚡ Multiplier (not yet wired)',
}

// Which types show min_stake in criteria
const SHOWS_MIN_STAKE = new Set(['spin_count', 'spin_streak', 'win_streak', 'total_staked'])
// Which types show min_deposit in criteria
const SHOWS_MIN_DEPOSIT = new Set(['deposit', 'deposit_streak'])

// Auto-select the correct action for each type
const TYPE_AUTO_ACTION: Record<string, string> = {
  spin_count: 'spin',
  spin_streak: 'spin',
  win_streak: 'spin',
  welcome: 'spin',
  total_staked: 'spin',
  daily_login: 'login',
  login_streak: 'login',
  deposit: 'deposit',
  deposit_streak: 'deposit',
  referral: 'referral',
  custom: 'spin',
}

// Field tooltip descriptions
const FIELD_TIPS: Record<string, string> = {
  name: 'The display name shown to players in their challenge list.',
  description: 'Short description explaining what the player needs to do. Shown in the mini app.',
  type: 'Defines what kind of action tracks progress. Changing this auto-selects the correct backend trigger.',
  recurrence: 'How often progress resets. "One-Time" = never resets after first completion. "Permanent" = accumulates indefinitely. "Daily" = resets every midnight.',
  target_count: 'Number of actions the player must complete to earn the reward.',
  target_amount: 'The cumulative Naira amount the player must stake across all spins. This is a Naira value, not a spin count.',
  min_stake: 'Only spins at or above this Naira amount count toward progress. Leave blank to count all stakes.',
  min_deposit: 'Only deposits at or above this Naira amount count toward progress. Leave blank to count all deposit amounts.',
  reward_type: '"Coins" credits the coin wallet. "Cash" credits the Naira cash wallet (real money). Free Spins and Multiplier are not yet wired — they only log an entry.',
  reward_amount: 'Amount to award. For Cash = Naira. For Coins = coin units. For Multiplier = the multiplier value (e.g. 2 = 2×).',
  max_completions: 'How many times one user can earn this reward per recurrence window. Leave blank for unlimited. Default = 1.',
  is_visible: 'When on, players can see this challenge. When off, it runs silently — useful for surprise rewards or A/B tests.',
  is_active: 'Master on/off. When off, the engine ignores this challenge entirely — no progress tracking, no rewards.',
  starts_at: 'Challenge becomes active at this exact time. Leave blank to activate immediately on save.',
  expires_at: 'Challenge stops accepting progress after this time. Leave blank for no expiry.',
}

// ── Helpers ────────────────────────────────────────────────────────────────────

function formatReward(reward: { type: string; amount: number }) {
  switch (reward.type) {
    case 'coins': return `${reward.amount.toLocaleString()} coins`
    case 'cash': return `₦${reward.amount.toLocaleString()}`
    case 'free_spins': return `${reward.amount} free spin${reward.amount > 1 ? 's' : ''}`
    case 'multiplier_boost': return `${reward.amount}× multiplier`
    default: return `${reward.amount}`
  }
}

function formatDate(iso: string | null) {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
}

function formatDateShort(iso: string | null) {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' })
}

/** Generates the claim explanation summary shown at the bottom of forms and detail views */
function getClaimSummary(type: string, recurrence: string, targetCount: number, rewardType: string, rewardAmount: number): { text: string; warning?: string } {
  const rewardStr = rewardType === 'coins'
    ? `${rewardAmount.toLocaleString()} coins`
    : rewardType === 'cash'
    ? `₦${rewardAmount.toLocaleString()} cash`
    : rewardType === 'free_spins'
    ? `${rewardAmount} free spin(s)`
    : `${rewardAmount}× multiplier`

  const winStr = rewardType === 'coins'
    ? 'credited to their coin wallet'
    : rewardType === 'cash'
    ? 'credited to their Naira cash wallet instantly'
    : 'logged (not yet fully wired)'

  const recurrenceStr = recurrence === 'daily' ? 'day'
    : recurrence === 'weekly' ? 'week'
    : recurrence === 'monthly' ? 'month'
    : recurrence === 'one_time' ? 'ever (one-time only)'
    : 'across all time'

  switch (type) {
    case 'spin_count':
      return {
        text: `Player spins ${targetCount} time(s) within the ${recurrenceStr} → ${rewardStr} is automatically ${winStr}. No manual action needed from the player. Progress resets at the start of each ${recurrence === 'permanent' ? 'completion window' : recurrenceStr}.`,
      }
    case 'spin_streak':
      return {
        text: `Player makes at least one spin per day for ${targetCount} consecutive day(s) → ${rewardStr} is automatically ${winStr}. Missing any single day may break the streak and reset progress.`,
      }
    case 'daily_login':
      return {
        text: `Player opens the app once per ${recurrenceStr} → ${rewardStr} is automatically ${winStr}. No spin or deposit required — just opening the app triggers the login event.`,
      }
    case 'login_streak':
      return {
        text: `Player opens the app on ${targetCount} consecutive day(s) → ${rewardStr} is automatically ${winStr}. Missing a day may reset the streak counter back to zero.`,
      }
    case 'referral':
      return {
        text: `Each time a referred friend completes their FIRST deposit (not just registers), the referrer automatically receives ${rewardStr} — ${winStr}. Registration alone is NOT enough.`,
        warning: recurrence !== 'permanent'
          ? `⚠ Recurrence "${RECURRENCE_SHORT[recurrence]}" is unusual for referrals. Consider "Permanent" so progress accumulates across time.`
          : undefined,
      }
    case 'deposit':
      return {
        text: `Player completes ${targetCount} deposit(s) within the ${recurrenceStr} → ${rewardStr} is automatically ${winStr}. Each qualifying deposit increments the counter by 1.`,
      }
    case 'deposit_streak':
      return {
        text: `Player deposits on ${targetCount} consecutive day(s) → ${rewardStr} is automatically ${winStr}. Missing a day resets the streak counter.`,
      }
    case 'welcome':
      return {
        text: `Fires exactly once when a brand-new user completes their very first spin. ${rewardStr} is automatically ${winStr}. Any player who has already made a spin is NOT eligible — this is strictly for new users.`,
        warning: recurrence !== 'one_time'
          ? '⚠ Welcome challenges always fire once per user regardless of recurrence. Setting "One-Time" is strongly recommended.'
          : undefined,
      }
    case 'win_streak':
      return {
        text: `Player wins ${targetCount} spin(s) within the ${recurrenceStr} → ${rewardStr} is automatically ${winStr}. Note: the current engine counts cumulative wins — a loss in between does not reset progress.`,
      }
    case 'total_staked':
      return {
        text: `Once the player's cumulative stake total across all spins reaches ₦${targetCount.toLocaleString()}, ${rewardStr} is automatically ${winStr}. The target is a Naira amount staked — not a number of spins.`,
        warning: recurrence !== 'permanent'
          ? '⚠ "Total Staked" milestones work best with "Permanent" recurrence so the total accumulates over all time.'
          : undefined,
      }
    case 'custom':
      return {
        text: `Custom challenge — the backend engine must be configured to fire the correct progress event. When the event fires and ${targetCount} count(s) are reached, ${rewardStr} is automatically ${winStr}.`,
      }
    default:
      return { text: `Reward of ${rewardStr} is credited automatically when the player meets the challenge criteria.` }
  }
}

// ── FieldTooltip ───────────────────────────────────────────────────────────────

function FieldTooltip({ tipKey }: { tipKey: keyof typeof FIELD_TIPS }) {
  const [show, setShow] = useState(false)
  const ref = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    if (!show) return
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setShow(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [show])

  return (
    <span ref={ref} className="relative inline-flex items-center ml-1.5">
      <button
        type="button"
        onClick={() => setShow((s) => !s)}
        className="flex items-center justify-center rounded-full transition-colors"
        style={{ color: show ? '#C9961A' : '#4a5568' }}
        title="Field info"
      >
        <Info className="h-3 w-3" />
      </button>
      {show && (
        <div
          className="absolute z-50 bottom-full left-0 mb-2 w-64 rounded-xl p-3 text-xs leading-relaxed shadow-xl"
          style={{
            background: '#0a0f1e',
            border: '1px solid #C9961A',
            color: '#cbd5e0',
          }}
        >
          <span style={{ color: '#C9961A' }} className="font-semibold block mb-1">
            {FIELD_TIPS[tipKey].split('.')[0]}.
          </span>
          {FIELD_TIPS[tipKey]}
        </div>
      )}
    </span>
  )
}

// ── ClaimSummaryBox ────────────────────────────────────────────────────────────

function ClaimSummaryBox({
  type, recurrence, targetCount, rewardType, rewardAmount,
}: {
  type: string; recurrence: string; targetCount: number; rewardType: string; rewardAmount: number
}) {
  const { text, warning } = getClaimSummary(type, recurrence, targetCount, rewardType, rewardAmount)
  return (
    <div
      className="rounded-xl p-3.5 space-y-2"
      style={{ background: 'rgba(201,150,26,0.07)', border: '1px solid rgba(201,150,26,0.25)' }}
    >
      <p className="text-xs font-semibold" style={{ color: '#C9961A' }}>
        💡 How the reward is claimed
      </p>
      <p className="text-xs leading-relaxed" style={{ color: '#94a3b8' }}>
        {text}
      </p>
      {warning && (
        <p className="text-xs leading-relaxed" style={{ color: '#f59e0b' }}>
          {warning}
        </p>
      )}
    </div>
  )
}

// ── Stat card ─────────────────────────────────────────────────────────────────

function StatCard({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="rounded-2xl p-5 flex flex-col gap-1" style={{ background: '#0D1836', border: '1px solid #1e2a4a' }}>
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

  function handleTypeChange(newType: string) {
    const autoAction = TYPE_AUTO_ACTION[newType] ?? 'spin'
    const newRecurrence = newType === 'welcome' ? 'one_time' : form.recurrence

    // Rebuild criteria — keep only fields relevant to the new type
    const newCriteria: Record<string, unknown> = {
      action: autoAction,
      target_count: form.criteria.target_count ?? 1,
    }
    if (SHOWS_MIN_STAKE.has(newType) && form.criteria.min_stake) newCriteria.min_stake = form.criteria.min_stake
    if (SHOWS_MIN_DEPOSIT.has(newType) && form.criteria.min_deposit) newCriteria.min_deposit = form.criteria.min_deposit

    setForm((f) => ({
      ...f,
      type: newType,
      recurrence: newRecurrence,
      criteria: newCriteria,
    }))
  }

  function updateCriteria(key: string, value: unknown) {
    setForm((f) => ({ ...f, criteria: { ...f.criteria, [key]: value } }))
  }

  function handleSubmit() {
    if (!form.name.trim()) { setError('Name is required.'); return }
    if (!form.type) { setError('Type is required.'); return }
    if (!form.recurrence) { setError('Recurrence is required.'); return }
    if (!form.reward.type) { setError('Reward type is required.'); return }
    if (form.reward.amount < 0) { setError('Reward amount must be ≥ 0.'); return }
    setError('')
    mutation.mutate()
  }

  const inputCls = "w-full rounded-xl px-3 py-2.5 text-sm text-white bg-[#07090F] border border-[#1e2a4a] focus:outline-none focus:border-[#C9961A] placeholder:text-muted-foreground/50"
  const labelCls = "flex items-center text-xs text-muted-foreground mb-1"
  const targetLabel = form.type === 'total_staked' ? 'Target Amount (₦)' : 'Target Count *'
  const targetTip: keyof typeof FIELD_TIPS = form.type === 'total_staked' ? 'target_amount' : 'target_count'

  const targetCount = (form.criteria.target_count as number) ?? 1

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent
        className="max-w-lg border-[#1e2a4a] p-0 max-h-[90vh] overflow-y-auto"
        style={{ background: '#0D1836' }}
      >
        <DialogHeader
          className="flex flex-row items-center justify-between p-5 pb-4 border-b border-[#1e2a4a] sticky top-0 z-10"
          style={{ background: '#0D1836' }}
        >
          <DialogTitle className="text-white text-base">Create Challenge</DialogTitle>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors">
            <X className="h-4 w-4" />
          </button>
        </DialogHeader>

        <div className="p-5 space-y-4">
          {/* ── Name ── */}
          <div>
            <label className={labelCls}>Name * <FieldTooltip tipKey="name" /></label>
            <input
              className={inputCls}
              placeholder="e.g. Daily Spinner"
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            />
          </div>

          {/* ── Description ── */}
          <div>
            <label className={labelCls}>Description <FieldTooltip tipKey="description" /></label>
            <textarea
              className={inputCls + ' resize-none h-16'}
              placeholder="Short description shown to players"
              value={form.description ?? ''}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
            />
          </div>

          {/* ── Type ── */}
          <div>
            <label className={labelCls}>Type * <FieldTooltip tipKey="type" /></label>
            <select
              className={inputCls}
              value={form.type}
              onChange={(e) => handleTypeChange(e.target.value)}
            >
              {CHALLENGE_TYPES.map((t) => (
                <option key={t} value={t}>{TYPE_LABELS[t] ?? t}</option>
              ))}
            </select>
            {/* Type description callout */}
            <p className="mt-1.5 text-xs leading-relaxed" style={{ color: '#64748b' }}>
              {TYPE_DESCRIPTIONS[form.type]}
            </p>
          </div>

          {/* ── Recurrence (hidden for welcome — forced one_time) ── */}
          {form.type !== 'welcome' && (
            <div>
              <label className={labelCls}>Recurrence * <FieldTooltip tipKey="recurrence" /></label>
              <select
                className={inputCls}
                value={form.recurrence}
                onChange={(e) => setForm((f) => ({ ...f, recurrence: e.target.value }))}
              >
                {RECURRENCES.map((r) => (
                  <option key={r} value={r}>{RECURRENCE_LABELS[r] ?? r}</option>
                ))}
              </select>
            </div>
          )}
          {form.type === 'welcome' && (
            <div className="rounded-xl px-4 py-2.5 text-xs" style={{ background: '#07090F', border: '1px solid #1e2a4a', color: '#64748b' }}>
              <span style={{ color: '#C9961A' }} className="font-semibold">Recurrence: One-Time</span> — Welcome challenges always fire once per user. Recurrence is fixed.
            </div>
          )}

          {/* ── Criteria ── */}
          <div
            className="rounded-xl p-4 space-y-3"
            style={{ background: '#07090F', border: '1px solid #1e2a4a' }}
          >
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Criteria</p>

            {/* Target Count / Amount */}
            <div>
              <label className={labelCls}>{targetLabel} <FieldTooltip tipKey={targetTip} /></label>
              <input
                type="number"
                min={1}
                className={inputCls}
                placeholder={form.type === 'total_staked' ? 'e.g. 50000' : 'e.g. 5'}
                value={targetCount}
                onChange={(e) => updateCriteria('target_count', parseInt(e.target.value) || 1)}
              />
              {form.type === 'total_staked' && (
                <p className="mt-1 text-xs" style={{ color: '#64748b' }}>Enter a Naira value, not a spin count. e.g. 50000 = ₦50,000 staked.</p>
              )}
            </div>

            {/* Min Stake — spin_count, spin_streak, win_streak, total_staked */}
            {SHOWS_MIN_STAKE.has(form.type) && (
              <div>
                <label className={labelCls}>Min Stake (₦) — optional <FieldTooltip tipKey="min_stake" /></label>
                <input
                  type="number"
                  min={0}
                  className={inputCls}
                  placeholder="Leave blank to count all stakes"
                  value={(form.criteria.min_stake as string) ?? ''}
                  onChange={(e) => {
                    const v = e.target.value
                    updateCriteria('min_stake', v ? v : undefined)
                  }}
                />
              </div>
            )}

            {/* Min Deposit — deposit, deposit_streak */}
            {SHOWS_MIN_DEPOSIT.has(form.type) && (
              <div>
                <label className={labelCls}>Min Deposit (₦) — optional <FieldTooltip tipKey="min_deposit" /></label>
                <input
                  type="number"
                  min={0}
                  className={inputCls}
                  placeholder="Leave blank to count all deposits"
                  value={(form.criteria.min_deposit as string) ?? ''}
                  onChange={(e) => {
                    const v = e.target.value
                    updateCriteria('min_deposit', v ? v : undefined)
                  }}
                />
              </div>
            )}
          </div>

          {/* ── Reward ── */}
          <div
            className="rounded-xl p-4 space-y-3"
            style={{ background: '#07090F', border: '1px solid #1e2a4a' }}
          >
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Reward</p>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelCls}>Type * <FieldTooltip tipKey="reward_type" /></label>
                <select
                  className={inputCls}
                  value={form.reward.type}
                  onChange={(e) => setForm((f) => ({ ...f, reward: { ...f.reward, type: e.target.value } }))}
                >
                  {REWARD_TYPES.map((r) => (
                    <option key={r} value={r}>{REWARD_LABELS[r] ?? r}</option>
                  ))}
                </select>
                {(form.reward.type === 'free_spins' || form.reward.type === 'multiplier_boost') && (
                  <p className="mt-1 text-xs" style={{ color: '#f59e0b' }}>⚠ Not yet wired — reward logs only, not granted to player.</p>
                )}
              </div>
              <div>
                <label className={labelCls}>Amount * <FieldTooltip tipKey="reward_amount" /></label>
                <input
                  type="number"
                  min={0}
                  className={inputCls}
                  value={form.reward.amount}
                  onChange={(e) => setForm((f) => ({ ...f, reward: { ...f.reward, amount: parseInt(e.target.value) || 0 } }))}
                />
              </div>
            </div>
          </div>

          {/* ── Settings ── */}
          <div
            className="rounded-xl p-4 space-y-3"
            style={{ background: '#07090F', border: '1px solid #1e2a4a' }}
          >
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Settings</p>

            {/* Max Completions + Toggles row */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelCls}>Max Completions / User <FieldTooltip tipKey="max_completions" /></label>
                <input
                  type="number"
                  min={1}
                  className={inputCls}
                  placeholder="Blank = unlimited"
                  value={form.max_completions_per_user ?? ''}
                  onChange={(e) => setForm((f) => ({ ...f, max_completions_per_user: e.target.value ? parseInt(e.target.value) : null }))}
                />
              </div>
              <div className="space-y-2 pt-5">
                {/* Visible toggle */}
                <button
                  type="button"
                  onClick={() => setForm((f) => ({ ...f, is_visible: !f.is_visible }))}
                  className="flex items-center gap-2 text-sm text-muted-foreground hover:text-white transition-colors w-full"
                >
                  {form.is_visible
                    ? <><Eye className="h-4 w-4" style={{ color: '#C9961A' }} /> <span className="text-xs" style={{ color: '#C9961A' }}>Visible to players</span></>
                    : <><EyeOff className="h-4 w-4" /> <span className="text-xs">Hidden from players</span></>
                  }
                  <FieldTooltip tipKey="is_visible" />
                </button>
                {/* Active toggle */}
                <button
                  type="button"
                  onClick={() => setForm((f) => ({ ...f, is_active: !f.is_active }))}
                  className="flex items-center gap-2 text-sm text-muted-foreground hover:text-white transition-colors w-full"
                >
                  {form.is_active
                    ? <><ToggleRight className="h-4 w-4" style={{ color: '#22c55e' }} /> <span className="text-xs" style={{ color: '#22c55e' }}>Active</span></>
                    : <><ToggleLeft className="h-4 w-4" /> <span className="text-xs">Inactive</span></>
                  }
                  <FieldTooltip tipKey="is_active" />
                </button>
              </div>
            </div>

            {/* Dates */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelCls}>
                  <Calendar className="h-3 w-3 mr-1" style={{ color: '#C9961A' }} />
                  Starts At
                  <FieldTooltip tipKey="starts_at" />
                </label>
                <input
                  type="datetime-local"
                  className={inputCls}
                  style={{ colorScheme: 'dark' }}
                  value={form.starts_at ? form.starts_at.slice(0, 16) : ''}
                  onChange={(e) => setForm((f) => ({ ...f, starts_at: e.target.value ? new Date(e.target.value).toISOString() : null }))}
                />
              </div>
              <div>
                <label className={labelCls}>
                  <Calendar className="h-3 w-3 mr-1" style={{ color: '#C9961A' }} />
                  Expires At
                  <FieldTooltip tipKey="expires_at" />
                </label>
                <input
                  type="datetime-local"
                  className={inputCls}
                  style={{ colorScheme: 'dark' }}
                  value={form.expires_at ? form.expires_at.slice(0, 16) : ''}
                  onChange={(e) => setForm((f) => ({ ...f, expires_at: e.target.value ? new Date(e.target.value).toISOString() : null }))}
                />
              </div>
            </div>
          </div>

          {/* ── Claim Summary ── */}
          <ClaimSummaryBox
            type={form.type}
            recurrence={form.recurrence}
            targetCount={targetCount}
            rewardType={form.reward.type}
            rewardAmount={form.reward.amount}
          />

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

// ── Challenge Detail Dialog ───────────────────────────────────────────────────

function ChallengeDetailDialog({
  challenge,
  onClose,
}: {
  challenge: AdminChallenge
  onClose: () => void
}) {
  const targetCount = (challenge.criteria.target_count as number) ?? 0
  const minStake = challenge.criteria.min_stake as string | undefined
  const minDeposit = challenge.criteria.min_deposit as string | undefined

  function DetailRow({ label, value, valueColor }: { label: string; value: React.ReactNode; valueColor?: string }) {
    return (
      <div className="flex items-start justify-between gap-3 py-2.5 border-b" style={{ borderColor: '#1e2a4a' }}>
        <span className="text-xs text-muted-foreground shrink-0">{label}</span>
        <span className="text-xs font-medium text-right" style={{ color: valueColor ?? '#e2e8f0' }}>{value}</span>
      </div>
    )
  }

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent
        className="max-w-lg border-[#1e2a4a] p-0 max-h-[90vh] overflow-y-auto"
        style={{ background: '#0D1836' }}
      >
        <DialogHeader
          className="flex flex-row items-center justify-between p-5 pb-4 border-b border-[#1e2a4a] sticky top-0 z-10"
          style={{ background: '#0D1836' }}
        >
          <div className="flex-1 min-w-0">
            <DialogTitle className="text-white text-base truncate">{challenge.name}</DialogTitle>
            <div className="flex items-center gap-2 mt-1.5 flex-wrap">
              <span
                className="inline-block px-2 py-0.5 rounded-full text-xs font-semibold"
                style={{ background: 'rgba(201,150,26,0.15)', color: '#C9961A' }}
              >
                {TYPE_LABELS[challenge.type] ?? challenge.type}
              </span>
              {challenge.is_active
                ? <Badge variant="success">Active</Badge>
                : <Badge variant="secondary">Inactive</Badge>
              }
              {!challenge.is_visible && (
                <span className="text-xs text-muted-foreground">(hidden from players)</span>
              )}
            </div>
          </div>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors ml-3 shrink-0">
            <X className="h-4 w-4" />
          </button>
        </DialogHeader>

        <div className="p-5 space-y-4">
          {/* Description */}
          {challenge.description && (
            <p className="text-sm leading-relaxed" style={{ color: '#94a3b8' }}>{challenge.description}</p>
          )}

          {/* Type explanation */}
          <div className="rounded-xl px-4 py-3 text-xs leading-relaxed" style={{ background: '#07090F', border: '1px solid #1e2a4a', color: '#64748b' }}>
            {TYPE_DESCRIPTIONS[challenge.type]}
          </div>

          {/* Core details */}
          <div>
            <DetailRow label="Recurrence" value={RECURRENCE_SHORT[challenge.recurrence] ?? challenge.recurrence} />
            <DetailRow
              label={challenge.type === 'total_staked' ? 'Target Amount' : 'Target Count'}
              value={challenge.type === 'total_staked' ? `₦${targetCount.toLocaleString()}` : targetCount.toLocaleString()}
              valueColor="#C9961A"
            />
            {minStake && <DetailRow label="Min Stake (per spin)" value={`₦${parseFloat(minStake).toLocaleString()}`} />}
            {minDeposit && <DetailRow label="Min Deposit" value={`₦${parseFloat(minDeposit).toLocaleString()}`} />}
            <DetailRow
              label="Reward"
              value={formatReward(challenge.reward)}
              valueColor={challenge.reward.type === 'cash' ? '#22c55e' : '#C9961A'}
            />
            {(challenge.reward.type === 'free_spins' || challenge.reward.type === 'multiplier_boost') && (
              <p className="text-xs mt-1" style={{ color: '#f59e0b' }}>⚠ This reward type is not yet fully wired — it logs only.</p>
            )}
            <DetailRow
              label="Max completions / user"
              value={challenge.max_completions_per_user === null ? 'Unlimited' : challenge.max_completions_per_user?.toLocaleString() ?? '1'}
            />
            <DetailRow label="Visible to players" value={challenge.is_visible ? 'Yes' : 'No (hidden)'} />
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-xl p-4 text-center" style={{ background: '#07090F', border: '1px solid #1e2a4a' }}>
              <p className="text-xs text-muted-foreground">Participants</p>
              <p className="text-xl font-bold mt-1" style={{ color: '#C9961A' }}>{challenge.participant_count.toLocaleString()}</p>
            </div>
            <div className="rounded-xl p-4 text-center" style={{ background: '#07090F', border: '1px solid #1e2a4a' }}>
              <p className="text-xs text-muted-foreground">Completions</p>
              <p className="text-xl font-bold mt-1" style={{ color: '#22c55e' }}>{challenge.completion_count.toLocaleString()}</p>
            </div>
          </div>

          {/* Dates */}
          <div>
            <DetailRow label="Starts" value={challenge.starts_at ? formatDate(challenge.starts_at) : 'Immediately'} />
            <DetailRow label="Expires" value={challenge.expires_at ? formatDate(challenge.expires_at) : 'Never'} />
            <DetailRow label="Created" value={formatDateShort(challenge.created_at)} />
          </div>

          {/* Claim Summary */}
          <ClaimSummaryBox
            type={challenge.type}
            recurrence={challenge.recurrence}
            targetCount={targetCount}
            rewardType={challenge.reward.type}
            rewardAmount={challenge.reward.amount}
          />
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
  onViewDetail,
  onViewParticipants,
  onViewCompletions,
}: {
  challenge: AdminChallenge
  onViewDetail: (c: AdminChallenge) => void
  onViewParticipants: (c: AdminChallenge) => void
  onViewCompletions: (c: AdminChallenge) => void
}) {
  const can = useCan()
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
      className="border-t transition-colors cursor-pointer hover:bg-white/[0.02]"
      style={{ borderColor: '#1e2a4a' }}
      onClick={() => onViewDetail(challenge)}
    >
      {/* Name + type */}
      <td className="px-4 py-3">
        <div className="flex items-center gap-1.5">
          <div>
            <p className="text-sm font-medium text-white">{challenge.name}</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              {TYPE_LABELS[challenge.type] ?? challenge.type}
            </p>
          </div>
          <ChevronRight className="h-3.5 w-3.5 ml-1 opacity-30" style={{ color: '#C9961A' }} />
        </div>
      </td>

      {/* Recurrence */}
      <td className="px-4 py-3 text-sm text-muted-foreground">
        {RECURRENCE_SHORT[challenge.recurrence] ?? challenge.recurrence}
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
          onClick={(e) => { e.stopPropagation(); onViewParticipants(challenge) }}
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
          onClick={(e) => { e.stopPropagation(); onViewCompletions(challenge) }}
          className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-white transition-colors"
        >
          <CheckCircle className="h-3.5 w-3.5" />
          {challenge.completion_count.toLocaleString()}
          <ChevronRight className="h-3 w-3" />
        </button>
      </td>

      {/* Actions */}
      <td className="px-4 py-3">
        <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
          {can('edit_challenge') && (
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
          )}
          {can('delete_challenge') && (
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
          )}
        </div>
      </td>
    </tr>
  )
}

// ── ChallengesPage ────────────────────────────────────────────────────────────

const PAGE_SIZE = 10

export function ChallengesPage() {
  const can = useCan()
  const [page, setPage] = useState(1)
  const [typeFilter, setTypeFilter] = useState('')
  const [activeFilter, setActiveFilter] = useState<'all' | 'active' | 'inactive'>('all')
  const [showCreate, setShowCreate] = useState(false)
  const [detailChallenge, setDetailChallenge] = useState<AdminChallenge | null>(null)
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
        {can('create_challenge') && (
          <button
            onClick={() => setShowCreate(true)}
            className="flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-xl transition-opacity hover:opacity-90"
            style={{ background: '#C9961A', color: '#07090F' }}
          >
            <Plus className="h-4 w-4" />
            New Challenge
          </button>
        )}
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

        <p className="ml-auto text-xs text-muted-foreground hidden md:block">
          Click any row to view details
        </p>
      </div>

      {/* Table */}
      <div className="rounded-2xl overflow-hidden" style={{ background: '#0D1836', border: '1px solid #1e2a4a' }}>
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
                    onViewDetail={setDetailChallenge}
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

      {/* Detail dialog */}
      {detailChallenge && (
        <ChallengeDetailDialog
          challenge={detailChallenge}
          onClose={() => setDetailChallenge(null)}
        />
      )}

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
