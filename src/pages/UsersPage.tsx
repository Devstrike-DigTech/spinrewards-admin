import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { Search, ChevronDown, X } from 'lucide-react'
import { toast } from 'sonner'
import { usersApi } from '@/api/index'
import type { AdminUser, UsersListResponse } from '@/types'
import { Pagination } from '@/components/Pagination'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

// ── Stat card ─────────────────────────────────────────────────────────────────

function StatCard({
  title,
  value,
  isLoading,
}: {
  title: string
  value: string | number
  isLoading: boolean
}) {
  return (
    <div
      className="rounded-2xl px-5 py-4 flex flex-col gap-1"
      style={{ background: '#0D1836', border: '1px solid #1e2a4a' }}
    >
      <p className="text-sm text-muted-foreground">{title}</p>
      {isLoading ? (
        <Skeleton className="h-8 w-24 mt-1" />
      ) : (
        <p className="text-2xl font-bold" style={{ color: '#C9961A' }}>
          {value}
        </p>
      )}
    </div>
  )
}

// ── Badges ────────────────────────────────────────────────────────────────────

function KYCBadge({ status }: { status: string }) {
  if (status === 'Done') return <Badge variant="success">Done</Badge>
  if (status === 'Pending') return <Badge variant="warning">Pending</Badge>
  if (status === 'Rejected') return <Badge variant="destructive">Rejected</Badge>
  return <Badge variant="secondary">—</Badge>
}

function RiskBadge({ risk }: { risk: string }) {
  if (risk === 'Low') return <Badge variant="success">Low</Badge>
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
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
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

// ── UsersPage ─────────────────────────────────────────────────────────────────

const FILTER_OPTIONS = [
  { value: 'all', label: 'All Users' },
  { value: 'kyc_pending', label: 'KYC Pending' },
  { value: 'flagged', label: 'Flagged' },
  { value: 'banned', label: 'Banned' },
]

export function UsersPage() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('all')
  const [page, setPage] = useState(1)
  const [filterOpen, setFilterOpen] = useState(false)

  // Confirm dialog state
  const [confirmState, setConfirmState] = useState<{
    type: 'flag' | 'ban' | null
    userId: string | null
    userName: string
  }>({ type: null, userId: null, userName: '' })

  const { data, isLoading } = useQuery<UsersListResponse>({
    queryKey: ['users', search, filter, page],
    queryFn: () => usersApi.list({ search, filter, page }),
  })

  const flagMutation = useMutation({
    mutationFn: (id: string) => usersApi.flag(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] })
      toast.success(`${confirmState.userName} has been flagged.`)
      setConfirmState({ type: null, userId: null, userName: '' })
    },
    onError: (err: unknown) => {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message
      toast.error(msg ?? 'Failed to flag user.')
    },
  })

  const banMutation = useMutation({
    mutationFn: (id: string) => usersApi.ban(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] })
      toast.success(`${confirmState.userName} has been banned.`)
      setConfirmState({ type: null, userId: null, userName: '' })
    },
    onError: (err: unknown) => {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message
      toast.error(msg ?? 'Failed to ban user.')
    },
  })

  function handleConfirm() {
    if (!confirmState.userId) return
    if (confirmState.type === 'flag') flagMutation.mutate(confirmState.userId)
    if (confirmState.type === 'ban') banMutation.mutate(confirmState.userId)
  }

  const overview = data?.overview
  const PAGE_SIZE = 10
  const totalPages = data ? Math.ceil(data.count / PAGE_SIZE) : 1
  const activeFilterLabel = FILTER_OPTIONS.find((o) => o.value === filter)?.label ?? 'All Users'
  const isPendingAction = flagMutation.isPending || banMutation.isPending

  return (
    <div className="space-y-5">
      <h1 className="text-2xl font-bold text-white">Users</h1>

      {/* ── Overview ── */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <p className="text-sm font-semibold text-white">Overview</p>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span>Filter by:</span>
            <select className="rounded-md border border-[#1e2a4a] bg-[#0D1836] px-2 py-1 text-xs text-foreground">
              <option>Month</option>
            </select>
            <select className="rounded-md border border-[#1e2a4a] bg-[#0D1836] px-2 py-1 text-xs text-foreground">
              <option>2026</option>
              <option>2025</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <StatCard
            title="Total Users"
            value={overview?.total_users.toLocaleString() ?? '—'}
            isLoading={isLoading}
          />
          <StatCard
            title="Pending KYC"
            value={overview?.pending_kyc ?? '—'}
            isLoading={isLoading}
          />
          <StatCard
            title="Flagged Accounts"
            value={overview?.flagged_accounts ?? '—'}
            isLoading={isLoading}
          />
          <StatCard
            title="Banned Accounts"
            value={overview?.banned_accounts ?? '—'}
            isLoading={isLoading}
          />
        </div>
      </div>

      {/* ── Table section ── */}
      <div className="space-y-3">
        <p className="text-sm font-semibold text-white">Sort by:</p>

        <div className="flex items-center gap-3">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Enter a specific name"
              className="w-full rounded-xl border border-[#1e2a4a] pl-10 pr-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:border-[#C9961A] transition-colors"
              style={{ background: '#0D1836' }}
              value={search}
              onChange={(e) => {
                setSearch(e.target.value)
                setPage(1)
              }}
            />
          </div>

          {/* Filter dropdown */}
          <div className="relative">
            <button
              onClick={() => setFilterOpen((v) => !v)}
              className="flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold"
              style={{ background: '#C9961A', color: '#07090F' }}
            >
              {activeFilterLabel}
              <ChevronDown className="h-4 w-4" />
            </button>
            {filterOpen && (
              <div
                className="absolute right-0 top-full mt-1 z-20 min-w-[150px] rounded-xl border border-[#1e2a4a] py-1 shadow-xl"
                style={{ background: '#0D1836' }}
              >
                {FILTER_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    className={`block w-full px-4 py-2 text-left text-sm transition-colors hover:bg-white/5 ${
                      filter === opt.value ? 'text-white font-medium' : 'text-muted-foreground'
                    }`}
                    onClick={() => {
                      setFilter(opt.value)
                      setPage(1)
                      setFilterOpen(false)
                    }}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Table */}
        <div
          className="rounded-2xl overflow-hidden"
          style={{ background: '#0D1836', border: '1px solid #1e2a4a' }}
        >
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr style={{ borderBottom: '1px solid #1e2a4a' }}>
                  {['ID', 'Name', 'Phone Number', 'Registered On', 'Balance (₦)', 'Total Staked', 'KYC', 'Risk', 'Action'].map(
                    (h) => (
                      <th
                        key={h}
                        className="px-4 py-3 text-left text-xs font-medium text-muted-foreground whitespace-nowrap"
                      >
                        {h}
                      </th>
                    )
                  )}
                </tr>
              </thead>
              <tbody>
                {isLoading
                  ? Array.from({ length: 8 }).map((_, i) => (
                      <tr key={i} style={{ borderBottom: '1px solid #1e2a4a1a' }}>
                        {Array.from({ length: 9 }).map((__, j) => (
                          <td key={j} className="px-4 py-3">
                            <Skeleton className="h-4 w-20" />
                          </td>
                        ))}
                      </tr>
                    ))
                  : (data?.results ?? []).map((user: AdminUser) => (
                      <tr
                        key={user.id}
                        className="transition-colors cursor-pointer"
                        style={{ borderBottom: '1px solid #1e2a4a33' }}
                        onMouseEnter={(e) =>
                          (e.currentTarget.style.background = 'rgba(255,255,255,0.02)')
                        }
                        onMouseLeave={(e) =>
                          (e.currentTarget.style.background = '')
                        }
                        onClick={() => navigate(`/users/${user.id}`)}
                      >
                        <td className="px-4 py-3 font-mono text-xs text-muted-foreground whitespace-nowrap">
                          #{user.telegram_id}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <p className="font-medium text-white text-sm">{user.name}</p>
                        </td>
                        <td className="px-4 py-3 font-mono text-xs text-muted-foreground whitespace-nowrap">
                          {user.phone_number || '—'}
                        </td>
                        <td className="px-4 py-3 text-xs text-muted-foreground whitespace-nowrap">
                          {user.registered_via}
                        </td>
                        <td className="px-4 py-3 font-semibold text-sm text-white whitespace-nowrap">
                          {parseFloat(user.balance).toLocaleString()}
                        </td>
                        <td className="px-4 py-3 text-sm text-white whitespace-nowrap">
                          {parseFloat(user.staked).toLocaleString()}
                        </td>
                        <td className="px-4 py-3">
                          <KYCBadge status={user.kyc_status} />
                        </td>
                        <td className="px-4 py-3">
                          <RiskBadge risk={user.risk} />
                        </td>
                        <td
                          className="px-4 py-3"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <div className="flex items-center gap-2">
                            <button
                              className="px-3 py-1 rounded-lg text-xs font-medium border transition-colors hover:opacity-80"
                              style={{
                                borderColor: '#C9961A44',
                                color: '#C9961A',
                                background: 'rgba(201,150,26,0.08)',
                              }}
                              onClick={() =>
                                setConfirmState({
                                  type: 'flag',
                                  userId: user.id,
                                  userName: user.name,
                                })
                              }
                            >
                              Flag
                            </button>
                            <button
                              className="px-3 py-1 rounded-lg text-xs font-medium transition-colors hover:opacity-80"
                              style={{ background: '#ef444422', color: '#ef4444', border: '1px solid #ef444433' }}
                              onClick={() =>
                                setConfirmState({
                                  type: 'ban',
                                  userId: user.id,
                                  userName: user.name,
                                })
                              }
                            >
                              Ban
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
              </tbody>
            </table>

            {!isLoading && (data?.results ?? []).length === 0 && (
              <p className="py-12 text-center text-sm text-muted-foreground">No users found.</p>
            )}
          </div>
        </div>

        <Pagination page={page} totalPages={totalPages} onPageChange={setPage} className="mt-2" />
      </div>

      {/* ── Confirm dialogs ── */}
      <ConfirmDialog
        open={confirmState.type === 'flag'}
        title="Flag"
        message={`Are you sure you want to flag ${confirmState.userName || 'this user'}?`}
        confirmLabel="Yes"
        onConfirm={handleConfirm}
        onClose={() => setConfirmState({ type: null, userId: null, userName: '' })}
        isPending={isPendingAction}
      />
      <ConfirmDialog
        open={confirmState.type === 'ban'}
        title="Ban User"
        message={`Are you sure you want to ban ${confirmState.userName || 'this user'}? This will immediately restrict their access.`}
        confirmLabel="Yes, Ban"
        confirmStyle={{ background: '#ef4444', color: '#fff' }}
        onConfirm={handleConfirm}
        onClose={() => setConfirmState({ type: null, userId: null, userName: '' })}
        isPending={isPendingAction}
      />
    </div>
  )
}
