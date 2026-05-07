import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { Search, Clock, TrendingDown, CheckCircle, X } from 'lucide-react'
import { toast } from 'sonner'
import { withdrawalsApi } from '@/api/index'
import type { AdminWithdrawal, WithdrawalsListResponse } from '@/types'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Pagination } from '@/components/Pagination'
import { formatCurrency } from '@/lib/utils'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

// ── Status helpers ────────────────────────────────────────────────────────────

function StatusBadge({ status, display }: { status: AdminWithdrawal['status']; display: string }) {
  const variants: Record<string, string> = {
    pending_review: 'bg-amber-500/20 text-amber-400',
    pending: 'bg-sky-500/20 text-sky-400',
    processing: 'bg-blue-500/20 text-blue-400',
    completed: 'bg-emerald-500/20 text-emerald-400',
    failed: 'bg-red-500/20 text-red-400',
    rejected: 'bg-red-500/20 text-red-400',
    cancelled: 'bg-gray-500/20 text-gray-400',
  }
  return (
    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold ${variants[status] ?? 'bg-gray-500/20 text-gray-400'}`}>
      {display}
    </span>
  )
}

function RiskBadge({ risk }: { risk: string }) {
  if (risk === 'Low') return <Badge variant="success">Low</Badge>
  if (risk === 'Medium') return <Badge variant="warning">Medium</Badge>
  return <Badge variant="destructive">High</Badge>
}

// ── Approve dialog ────────────────────────────────────────────────────────────

function ApproveDialog({
  withdrawal,
  open,
  onClose,
}: {
  withdrawal: AdminWithdrawal | null
  open: boolean
  onClose: () => void
}) {
  const [notes, setNotes] = useState('')
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: () => withdrawalsApi.approve(withdrawal!.id, notes),
    onSuccess: () => {
      toast.success('Withdrawal approved. Processing payout.')
      queryClient.invalidateQueries({ queryKey: ['withdrawals'] })
      onClose()
      setNotes('')
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message ?? 'Failed to approve withdrawal.')
    },
  })

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-sm border-[#1e2a4a]" style={{ background: '#0D1220' }}>
        <DialogHeader className="flex flex-row items-center justify-between pb-3 border-b border-[#1e2a4a]">
          <DialogTitle className="text-white">Approve Withdrawal</DialogTitle>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
            <X className="h-4 w-4" />
          </button>
        </DialogHeader>
        {withdrawal && (
          <div className="space-y-4 pt-2">
            <div
              className="rounded-xl p-4 space-y-1"
              style={{ background: 'rgba(201, 150, 26, 0.06)', border: '1px solid rgba(201, 150, 26, 0.2)' }}
            >
              <p className="text-sm font-semibold text-white">{withdrawal.name}</p>
              <p className="text-xs text-muted-foreground">{withdrawal.bank} · {withdrawal.account_masked}</p>
              <p className="text-xl font-bold mt-1" style={{ color: '#C9961A' }}>
                {formatCurrency(withdrawal.amount)}
              </p>
            </div>
            <div className="space-y-1.5">
              <Label className="text-sm text-muted-foreground">Notes (optional)</Label>
              <Input
                placeholder="e.g. Manually verified identity"
                className="border-[#1e2a4a] bg-[#0A0E1E] text-foreground"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>
            <div className="flex gap-3">
              <Button variant="outline" className="flex-1 border-[#1e2a4a]" onClick={onClose}>
                Cancel
              </Button>
              <Button
                className="flex-1 font-semibold text-white"
                style={{ background: '#22c55e' }}
                disabled={mutation.isPending}
                onClick={() => mutation.mutate()}
              >
                {mutation.isPending ? 'Approving…' : 'Confirm Approve'}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}

// ── Reject dialog ─────────────────────────────────────────────────────────────

function RejectDialog({
  withdrawal,
  open,
  onClose,
}: {
  withdrawal: AdminWithdrawal | null
  open: boolean
  onClose: () => void
}) {
  const [reason, setReason] = useState('')
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: () => withdrawalsApi.reject(withdrawal!.id, reason),
    onSuccess: () => {
      toast.success('Withdrawal rejected. Funds returned to user wallet.')
      queryClient.invalidateQueries({ queryKey: ['withdrawals'] })
      onClose()
      setReason('')
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message ?? 'Failed to reject withdrawal.')
    },
  })

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-sm border-[#1e2a4a]" style={{ background: '#0D1220' }}>
        <DialogHeader className="flex flex-row items-center justify-between pb-3 border-b border-[#1e2a4a]">
          <DialogTitle className="text-white">Reject Withdrawal</DialogTitle>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
            <X className="h-4 w-4" />
          </button>
        </DialogHeader>
        {withdrawal && (
          <div className="space-y-4 pt-2">
            <div
              className="rounded-xl p-4 space-y-1"
              style={{ background: 'rgba(239, 68, 68, 0.06)', border: '1px solid rgba(239, 68, 68, 0.2)' }}
            >
              <p className="text-sm font-semibold text-white">{withdrawal.name}</p>
              <p className="text-xs text-muted-foreground">{withdrawal.bank} · {withdrawal.account_masked}</p>
              <p className="text-xl font-bold mt-1 text-red-400">
                {formatCurrency(withdrawal.amount)}
              </p>
            </div>
            <div className="space-y-1.5">
              <Label className="text-sm text-muted-foreground">Rejection reason <span className="text-destructive">*</span></Label>
              <Input
                placeholder="e.g. Suspicious activity detected"
                className="border-[#1e2a4a] bg-[#0A0E1E] text-foreground"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
              />
            </div>
            <div className="flex gap-3">
              <Button variant="outline" className="flex-1 border-[#1e2a4a]" onClick={onClose}>
                Cancel
              </Button>
              <Button
                variant="destructive"
                className="flex-1 font-semibold"
                disabled={mutation.isPending || !reason.trim()}
                onClick={() => mutation.mutate()}
              >
                {mutation.isPending ? 'Rejecting…' : 'Confirm Reject'}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}

// ── Stat card ─────────────────────────────────────────────────────────────────

function StatCard({
  title, value, icon: Icon, iconColor, isLoading,
}: {
  title: string; value: string; icon: React.ElementType; iconColor: string; isLoading: boolean
}) {
  return (
    <Card className="bg-card border-[#1e2a4a]">
      <CardContent className="flex items-center gap-4 p-5">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl shrink-0" style={{ background: `${iconColor}22` }}>
          <Icon className="h-5 w-5" style={{ color: iconColor }} />
        </div>
        <div>
          <p className="text-xs text-muted-foreground">{title}</p>
          {isLoading ? <Skeleton className="mt-1 h-6 w-24" /> : <p className="text-xl font-bold text-white">{value}</p>}
        </div>
      </CardContent>
    </Card>
  )
}

// ── Main page ─────────────────────────────────────────────────────────────────

const STATUS_FILTERS = [
  { label: 'All', value: '' },
  { label: 'Pending Review', value: 'pending_review' },
  { label: 'Processing', value: 'processing' },
  { label: 'Completed', value: 'completed' },
  { label: 'Failed', value: 'failed' },
]

export function WithdrawalsPage() {
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [page, setPage] = useState(1)
  const [approveTarget, setApproveTarget] = useState<AdminWithdrawal | null>(null)
  const [rejectTarget, setRejectTarget] = useState<AdminWithdrawal | null>(null)
  const navigate = useNavigate()

  const { data, isLoading } = useQuery<WithdrawalsListResponse>({
    queryKey: ['withdrawals', search, statusFilter, page],
    queryFn: () => withdrawalsApi.list({ search, status: statusFilter || undefined, page }),
    refetchInterval: 30_000,
  })

  const overview = data?.overview
  const PAGE_SIZE = 10
  const totalPages = data ? Math.ceil(data.count / PAGE_SIZE) : 1

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-white">Withdrawals</h1>
        <p className="text-sm text-muted-foreground">Review and approve pending withdrawal requests</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard
          title="Pending Amount"
          value={overview ? formatCurrency(overview.total_pending) : '—'}
          icon={Clock}
          iconColor="#C9961A"
          isLoading={isLoading}
        />
        <StatCard
          title="Total Paid Out"
          value={overview ? formatCurrency(overview.total_paid) : '—'}
          icon={TrendingDown}
          iconColor="#ef4444"
          isLoading={isLoading}
        />
        <StatCard
          title="Queued"
          value={overview ? `${overview.queued} requests` : '—'}
          icon={CheckCircle}
          iconColor="#22c55e"
          isLoading={isLoading}
        />
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 items-center justify-between">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by name or reference…"
            className="pl-9 border-[#1e2a4a] bg-card"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1) }}
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {STATUS_FILTERS.map((f) => (
            <button
              key={f.value}
              onClick={() => { setStatusFilter(f.value); setPage(1) }}
              className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                statusFilter === f.value
                  ? 'text-white'
                  : 'bg-[#1e2a4a] text-muted-foreground hover:text-foreground'
              }`}
              style={statusFilter === f.value ? { background: '#C9961A' } : {}}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <Card className="bg-card border-[#1e2a4a]">
        <CardContent className="p-0">
          {isLoading ? (
            <div className="space-y-2 p-4">
              {[1, 2, 3, 4, 5].map((i) => <Skeleton key={i} className="h-14 w-full" />)}
            </div>
          ) : (data?.results ?? []).length === 0 ? (
            <div className="py-16 text-center text-muted-foreground text-sm">
              No withdrawals found.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[#1e2a4a]">
                    {['User', 'Bank', 'Amount', 'Type', 'Risk', 'Status', 'Requested', 'Actions'].map((h) => (
                      <th key={h} className="px-4 py-3 text-left text-xs font-medium text-muted-foreground whitespace-nowrap">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {(data?.results ?? []).map((wd) => (
                    <tr key={wd.id} className="border-b border-[#1e2a4a]/50 last:border-0 hover:bg-white/2">
                      <td className="px-4 py-3">
                        <button
                          className="text-sm font-medium text-white hover:text-gold transition-colors text-left"
                          onClick={() => navigate(`/users/${wd.user_id}`)}
                        >
                          {wd.name}
                        </button>
                        <p className="text-xs text-muted-foreground font-mono">{wd.reference}</p>
                      </td>
                      <td className="px-4 py-3">
                        <p className="text-xs text-foreground">{wd.bank}</p>
                        <p className="text-xs text-muted-foreground font-mono">{wd.account_masked}</p>
                      </td>
                      <td className="px-4 py-3 font-semibold">{formatCurrency(wd.amount)}</td>
                      <td className="px-4 py-3 text-xs text-muted-foreground">{wd.type}</td>
                      <td className="px-4 py-3"><RiskBadge risk={wd.risk} /></td>
                      <td className="px-4 py-3">
                        <StatusBadge status={wd.status} display={wd.status_display} />
                        {wd.forced_manual_review && (
                          <p className="text-xs text-amber-400 mt-1">Manual review</p>
                        )}
                        {wd.failure_reason && (
                          <p className="text-xs text-red-400 mt-1 truncate max-w-[140px]">{wd.failure_reason}</p>
                        )}
                      </td>
                      <td className="px-4 py-3 text-xs text-muted-foreground whitespace-nowrap">
                        {wd.requested_at}
                      </td>
                      <td className="px-4 py-3">
                        {wd.status === 'pending_review' ? (
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              className="text-xs font-semibold text-white h-7 px-3"
                              style={{ background: '#22c55e' }}
                              onClick={() => setApproveTarget(wd)}
                            >
                              Approve
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              className="text-xs font-semibold h-7 px-3"
                              onClick={() => setRejectTarget(wd)}
                            >
                              Reject
                            </Button>
                          </div>
                        ) : wd.status === 'processing' ? (
                          <div className="flex items-center gap-1.5">
                            <div className="h-2 w-2 rounded-full bg-blue-400 animate-pulse" />
                            <span className="text-xs text-muted-foreground">Processing…</span>
                          </div>
                        ) : wd.status === 'completed' ? (
                          <span className="text-xs text-emerald-400">✓ Sent</span>
                        ) : (
                          <span className="text-xs text-muted-foreground">—</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />

      <ApproveDialog
        withdrawal={approveTarget}
        open={!!approveTarget}
        onClose={() => setApproveTarget(null)}
      />
      <RejectDialog
        withdrawal={rejectTarget}
        open={!!rejectTarget}
        onClose={() => setRejectTarget(null)}
      />
    </div>
  )
}
