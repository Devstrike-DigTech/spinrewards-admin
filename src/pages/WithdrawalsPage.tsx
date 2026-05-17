import { useState, useMemo } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { Search, X, Download } from 'lucide-react'
import { toast } from 'sonner'
import { withdrawalsApi } from '@/api/index'
import type { AdminWithdrawal, WithdrawalsListResponse } from '@/types'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import { Pagination } from '@/components/Pagination'
import { formatCurrency } from '@/lib/utils'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

// ── Helpers ───────────────────────────────────────────────────────────────────

function RiskBadge({ risk }: { risk: string }) {
  if (risk === 'Low') return <Badge variant="success">Low</Badge>
  if (risk === 'Medium') return <Badge variant="warning">Medium</Badge>
  return <Badge variant="destructive">High</Badge>
}

function StatusBadge({ status, display }: { status: AdminWithdrawal['status']; display: string }) {
  const cls: Record<string, string> = {
    pending_review: 'bg-amber-500/20 text-amber-400',
    pending: 'bg-sky-500/20 text-sky-400',
    processing: 'bg-blue-500/20 text-blue-400',
    completed: 'bg-emerald-500/20 text-emerald-400',
    failed: 'bg-red-500/20 text-red-400',
    rejected: 'bg-red-500/20 text-red-400',
    cancelled: 'bg-gray-500/20 text-gray-400',
  }
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${cls[status] ?? 'bg-gray-500/20 text-gray-400'}`}>
      {display}
    </span>
  )
}

// ── Stat card ─────────────────────────────────────────────────────────────────

function StatCard({ title, value, isLoading }: { title: string; value: string; isLoading: boolean }) {
  return (
    <div
      className="rounded-2xl px-5 py-4 flex flex-col gap-1"
      style={{ background: '#0D1836', border: '1px solid #1e2a4a' }}
    >
      <p className="text-sm text-muted-foreground">{title}</p>
      {isLoading ? (
        <Skeleton className="h-8 w-24 mt-1" />
      ) : (
        <p className="text-2xl font-bold" style={{ color: '#C9961A' }}>{value}</p>
      )}
    </div>
  )
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
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: () => withdrawalsApi.approve(withdrawal!.id),
    onSuccess: () => {
      toast.success('Withdrawal approved successfully.')
      queryClient.invalidateQueries({ queryKey: ['withdrawals'] })
      onClose()
    },
    onError: (err: unknown) => {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message
      toast.error(msg ?? 'Failed to approve withdrawal.')
    },
  })

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent
        className="max-w-sm border-[#1e2a4a] p-0"
        style={{ background: '#0D1836' }}
      >
        <DialogHeader className="flex flex-row items-center justify-between p-5 pb-4 border-b border-[#1e2a4a]">
          <DialogTitle className="text-white text-base">Confirm Approval</DialogTitle>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </DialogHeader>
        <div className="p-5 space-y-5">
          {withdrawal && (
            <div className="space-y-1">
              <p className="text-sm font-semibold text-white">{withdrawal.name}</p>
              <p className="text-xs text-muted-foreground">{withdrawal.bank} · {withdrawal.account_masked}</p>
              <p className="text-xl font-bold mt-1" style={{ color: '#C9961A' }}>
                {formatCurrency(withdrawal.amount)}
              </p>
            </div>
          )}
          <p className="text-sm text-muted-foreground">
            Are you sure you want to approve this withdrawal?
          </p>
          <div className="flex gap-3">
            <button
              onClick={onClose}
              disabled={mutation.isPending}
              className="flex-1 py-2.5 text-sm font-medium rounded-xl border border-[#1e2a4a] text-muted-foreground hover:text-white transition-colors disabled:opacity-50"
            >
              No
            </button>
            <button
              onClick={() => mutation.mutate()}
              disabled={mutation.isPending}
              className="flex-1 py-2.5 text-sm font-semibold rounded-xl transition-opacity disabled:opacity-60"
              style={{ background: '#C9961A', color: '#07090F' }}
            >
              {mutation.isPending ? 'Approving…' : 'Yes'}
            </button>
          </div>
        </div>
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

  function handleClose() {
    setReason('')
    onClose()
  }

  const mutation = useMutation({
    mutationFn: () => withdrawalsApi.reject(withdrawal!.id, reason),
    onSuccess: () => {
      toast.success('Withdrawal rejected. Funds returned to user wallet.')
      queryClient.invalidateQueries({ queryKey: ['withdrawals'] })
      handleClose()
    },
    onError: (err: unknown) => {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message
      toast.error(msg ?? 'Failed to reject withdrawal.')
    },
  })

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent
        className="max-w-sm border-[#1e2a4a] p-0"
        style={{ background: '#0D1836' }}
      >
        <DialogHeader className="flex flex-row items-center justify-between p-5 pb-4 border-b border-[#1e2a4a]">
          <DialogTitle className="text-white text-base">Confirm Rejection</DialogTitle>
          <button
            onClick={handleClose}
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </DialogHeader>
        <div className="p-5 space-y-4">
          <p className="text-sm text-muted-foreground">
            Kindly state reason for rejection:
          </p>
          <textarea
            rows={4}
            placeholder="Enter reason…"
            className="w-full rounded-xl border border-[#1e2a4a] px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:border-[#C9961A] transition-colors resize-none"
            style={{ background: '#07090F' }}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
          />
          <button
            onClick={() => mutation.mutate()}
            disabled={mutation.isPending || !reason.trim()}
            className="w-full py-2.5 text-sm font-semibold rounded-xl transition-opacity disabled:opacity-60"
            style={{ background: '#C9961A', color: '#07090F' }}
          >
            {mutation.isPending ? 'Submitting…' : 'Submit'}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

// ── See Details dialog (rejection reason) ─────────────────────────────────────

function SeeDetailsDialog({
  withdrawal,
  open,
  onClose,
}: {
  withdrawal: AdminWithdrawal | null
  open: boolean
  onClose: () => void
}) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent
        className="max-w-sm border-[#1e2a4a] p-0"
        style={{ background: '#0D1836' }}
      >
        <DialogHeader className="flex flex-row items-center justify-between p-5 pb-4 border-b border-[#1e2a4a]">
          <DialogTitle className="text-white text-base">Rejected</DialogTitle>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </DialogHeader>
        <div className="p-5 space-y-4">
          {withdrawal && (
            <div className="space-y-1 mb-2">
              <p className="text-sm font-semibold text-white">{withdrawal.name}</p>
              <p className="text-xs text-muted-foreground">{withdrawal.bank} · {withdrawal.account_masked}</p>
              <p className="text-base font-bold text-red-400">{formatCurrency(withdrawal.amount)}</p>
            </div>
          )}
          <div>
            <p className="text-xs text-muted-foreground mb-1.5">Reason for rejection:</p>
            <p className="text-sm text-white">
              {withdrawal?.failure_reason || '—'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-full py-2.5 text-sm font-semibold rounded-xl transition-opacity"
            style={{ background: '#C9961A', color: '#07090F' }}
          >
            Okay
          </button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

// ── Export dialog ─────────────────────────────────────────────────────────────

function ExportDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [from, setFrom] = useState('')
  const [to, setTo] = useState('')

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent
        className="max-w-sm border-[#1e2a4a] p-0"
        style={{ background: '#0D1836' }}
      >
        <DialogHeader className="flex flex-row items-center justify-between p-5 pb-4 border-b border-[#1e2a4a]">
          <DialogTitle className="text-white text-base">Export</DialogTitle>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </DialogHeader>
        <div className="p-5 space-y-4">
          <p className="text-sm text-muted-foreground">Select date range</p>
          <div className="space-y-3">
            <div className="space-y-1.5">
              <label className="text-xs text-muted-foreground">From</label>
              <input
                type="date"
                className="w-full rounded-xl border border-[#1e2a4a] px-3 py-2.5 text-sm text-foreground outline-none focus:border-[#C9961A] transition-colors"
                style={{ background: '#07090F' }}
                value={from}
                onChange={(e) => setFrom(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs text-muted-foreground">To</label>
              <input
                type="date"
                className="w-full rounded-xl border border-[#1e2a4a] px-3 py-2.5 text-sm text-foreground outline-none focus:border-[#C9961A] transition-colors"
                style={{ background: '#07090F' }}
                value={to}
                onChange={(e) => setTo(e.target.value)}
              />
            </div>
          </div>
          <button
            className="w-full py-2.5 text-sm font-semibold rounded-xl flex items-center justify-center gap-2 transition-opacity"
            style={{ background: '#C9961A', color: '#07090F' }}
            onClick={() => {
              toast.success('Export started. Your file will be ready shortly.')
              onClose()
            }}
          >
            <Download className="h-4 w-4" />
            Download
          </button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

// ── Tab types ─────────────────────────────────────────────────────────────────

type TabKey = 'pending' | 'approved' | 'rejected'

const TABS: { key: TabKey; label: string; statuses: string[] }[] = [
  { key: 'pending', label: 'Pending', statuses: ['pending_review', 'pending', 'processing'] },
  { key: 'approved', label: 'Approved', statuses: ['completed'] },
  { key: 'rejected', label: 'Rejected', statuses: ['rejected', 'failed', 'cancelled'] },
]

// ── WithdrawalsPage ────────────────────────────────────────────────────────────

export function WithdrawalsPage() {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState<TabKey>('pending')
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [approveTarget, setApproveTarget] = useState<AdminWithdrawal | null>(null)
  const [rejectTarget, setRejectTarget] = useState<AdminWithdrawal | null>(null)
  const [detailTarget, setDetailTarget] = useState<AdminWithdrawal | null>(null)
  const [exportOpen, setExportOpen] = useState(false)

  // derive the status filter value from active tab
  const statusFilter = useMemo(() => {
    if (activeTab === 'pending') return 'pending'
    if (activeTab === 'approved') return 'completed'
    return 'rejected'
  }, [activeTab])

  const { data, isLoading } = useQuery<WithdrawalsListResponse>({
    queryKey: ['withdrawals', search, statusFilter, page],
    queryFn: () => withdrawalsApi.list({ search, status: statusFilter, page }),
    refetchInterval: 30_000,
  })

  // Also fetch all for overview counts (no status filter)
  const { data: allData } = useQuery<WithdrawalsListResponse>({
    queryKey: ['withdrawals', '', '', 1],
    queryFn: () => withdrawalsApi.list({ page: 1 }),
  })

  const overview = allData?.overview
  const PAGE_SIZE = 10
  const totalPages = data ? Math.ceil(data.count / PAGE_SIZE) : 1
  const rows = data?.results ?? []

  function handleTabChange(tab: TabKey) {
    setActiveTab(tab)
    setPage(1)
    setSelected(new Set())
  }

  function toggleRow(id: string) {
    setSelected((prev) => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  function toggleAll() {
    if (selected.size === rows.length) {
      setSelected(new Set())
    } else {
      setSelected(new Set(rows.map((r) => r.id)))
    }
  }

  const allChecked = rows.length > 0 && selected.size === rows.length
  const someChecked = selected.size > 0 && selected.size < rows.length

  return (
    <div className="space-y-5">
      <h1 className="text-2xl font-bold text-white">Withdrawals</h1>

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

        <div className="grid grid-cols-2 gap-3 lg:grid-cols-3">
          <StatCard
            title="Total Pending"
            value={overview ? formatCurrency(overview.total_pending) : '—'}
            isLoading={isLoading}
          />
          <StatCard
            title="Total Paid Out"
            value={overview ? formatCurrency(overview.total_paid) : '—'}
            isLoading={isLoading}
          />
          <StatCard
            title="Queued"
            value={overview ? `${overview.queued}` : '—'}
            isLoading={isLoading}
          />
        </div>
      </div>

      {/* ── Status tabs ── */}
      <div style={{ borderBottom: '1px solid #1e2a4a' }}>
        <div className="flex items-center gap-0">
          {TABS.map((tab) => {
            const isActive = activeTab === tab.key
            return (
              <button
                key={tab.key}
                onClick={() => handleTabChange(tab.key)}
                className="relative pb-3 px-4 text-sm font-medium transition-colors"
                style={{ color: isActive ? '#C9961A' : undefined }}
              >
                <span className={isActive ? '' : 'text-muted-foreground'}>
                  {tab.label}
                </span>
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
      </div>

      {/* ── Table section ── */}
      <div className="space-y-3">
        {/* Controls row */}
        <div className="flex items-center gap-3">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search by name or reference…"
              className="w-full rounded-xl border border-[#1e2a4a] pl-10 pr-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:border-[#C9961A] transition-colors"
              style={{ background: '#0D1836' }}
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1) }}
            />
          </div>

          {/* Select All */}
          <button
            onClick={toggleAll}
            className="flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium border border-[#1e2a4a] text-muted-foreground hover:text-white transition-colors"
            style={{ background: '#0D1836' }}
          >
            <div
              className="h-4 w-4 rounded border flex items-center justify-center flex-shrink-0"
              style={{
                borderColor: allChecked || someChecked ? '#C9961A' : '#1e2a4a',
                background: allChecked ? '#C9961A' : someChecked ? 'rgba(201,150,26,0.2)' : 'transparent',
              }}
            >
              {(allChecked || someChecked) && (
                <span className="text-[10px] font-bold" style={{ color: allChecked ? '#07090F' : '#C9961A' }}>
                  {allChecked ? '✓' : '−'}
                </span>
              )}
            </div>
            Select All
          </button>

          {/* Export */}
          <button
            onClick={() => setExportOpen(true)}
            className="flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold"
            style={{ background: '#C9961A', color: '#07090F' }}
          >
            <Download className="h-4 w-4" />
            Export
          </button>
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
                  {/* Checkbox header */}
                  <th className="px-4 py-3 w-10">
                    <div
                      className="h-4 w-4 rounded border flex items-center justify-center cursor-pointer"
                      style={{
                        borderColor: allChecked || someChecked ? '#C9961A' : '#1e2a4a',
                        background: allChecked ? '#C9961A' : someChecked ? 'rgba(201,150,26,0.2)' : 'transparent',
                      }}
                      onClick={toggleAll}
                    >
                      {(allChecked || someChecked) && (
                        <span className="text-[10px] font-bold" style={{ color: allChecked ? '#07090F' : '#C9961A' }}>
                          {allChecked ? '✓' : '−'}
                        </span>
                      )}
                    </div>
                  </th>
                  {['Name', 'Amount', 'Bank', 'Type', 'Risk', 'Status', 'Requested', 'Action'].map((h) => (
                    <th
                      key={h}
                      className="px-4 py-3 text-left text-xs font-medium text-muted-foreground whitespace-nowrap"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {isLoading
                  ? Array.from({ length: 6 }).map((_, i) => (
                      <tr key={i} style={{ borderBottom: '1px solid #1e2a4a1a' }}>
                        {Array.from({ length: 9 }).map((__, j) => (
                          <td key={j} className="px-4 py-3">
                            <Skeleton className="h-4 w-20" />
                          </td>
                        ))}
                      </tr>
                    ))
                  : rows.map((wd) => (
                      <tr
                        key={wd.id}
                        className="transition-colors"
                        style={{ borderBottom: '1px solid #1e2a4a33' }}
                        onMouseEnter={(e) =>
                          (e.currentTarget.style.background = 'rgba(255,255,255,0.02)')
                        }
                        onMouseLeave={(e) =>
                          (e.currentTarget.style.background = '')
                        }
                      >
                        {/* Checkbox */}
                        <td className="px-4 py-3 w-10" onClick={(e) => { e.stopPropagation(); toggleRow(wd.id) }}>
                          <div
                            className="h-4 w-4 rounded border flex items-center justify-center cursor-pointer"
                            style={{
                              borderColor: selected.has(wd.id) ? '#C9961A' : '#1e2a4a',
                              background: selected.has(wd.id) ? '#C9961A' : 'transparent',
                            }}
                          >
                            {selected.has(wd.id) && (
                              <span className="text-[10px] font-bold" style={{ color: '#07090F' }}>✓</span>
                            )}
                          </div>
                        </td>

                        {/* Name */}
                        <td className="px-4 py-3">
                          <button
                            className="text-sm font-medium text-white hover:underline text-left transition-colors"
                            onClick={() => navigate(`/users/${wd.user_id}`)}
                          >
                            {wd.name}
                          </button>
                          <p className="text-xs text-muted-foreground font-mono">{wd.reference}</p>
                        </td>

                        {/* Amount */}
                        <td className="px-4 py-3 font-semibold text-sm text-white whitespace-nowrap">
                          {formatCurrency(wd.amount)}
                        </td>

                        {/* Bank */}
                        <td className="px-4 py-3">
                          <p className="text-xs text-foreground">{wd.bank}</p>
                          <p className="text-xs text-muted-foreground font-mono">{wd.account_masked}</p>
                        </td>

                        {/* Type */}
                        <td className="px-4 py-3 text-xs text-muted-foreground whitespace-nowrap">
                          {wd.type}
                        </td>

                        {/* Risk */}
                        <td className="px-4 py-3">
                          <RiskBadge risk={wd.risk} />
                        </td>

                        {/* Status */}
                        <td className="px-4 py-3">
                          <StatusBadge status={wd.status} display={wd.status_display} />
                          {(wd.requires_review || wd.forced_manual_review) && (
                            <p className="text-xs text-amber-400 mt-1">Manual review</p>
                          )}
                        </td>

                        {/* Requested */}
                        <td className="px-4 py-3 text-xs text-muted-foreground whitespace-nowrap">
                          {wd.requested_at}
                        </td>

                        {/* Action */}
                        <td className="px-4 py-3">
                          {activeTab === 'pending' && (
                            <div className="flex items-center gap-2">
                              <button
                                className="px-3 py-1 rounded-lg text-xs font-medium border transition-colors hover:opacity-80"
                                style={{
                                  borderColor: '#22c55e55',
                                  color: '#22c55e',
                                  background: 'rgba(34,197,94,0.08)',
                                }}
                                onClick={() => setApproveTarget(wd)}
                              >
                                Approve
                              </button>
                              <button
                                className="px-3 py-1 rounded-lg text-xs font-medium border transition-colors hover:opacity-80"
                                style={{
                                  borderColor: '#ef444455',
                                  color: '#ef4444',
                                  background: 'rgba(239,68,68,0.08)',
                                }}
                                onClick={() => setRejectTarget(wd)}
                              >
                                Reject
                              </button>
                            </div>
                          )}
                          {activeTab === 'approved' && (
                            <span className="text-xs text-muted-foreground">—</span>
                          )}
                          {activeTab === 'rejected' && (
                            <button
                              className="px-3 py-1 rounded-lg text-xs font-medium border transition-colors hover:opacity-80"
                              style={{
                                borderColor: '#C9961A55',
                                color: '#C9961A',
                                background: 'rgba(201,150,26,0.08)',
                              }}
                              onClick={() => setDetailTarget(wd)}
                            >
                              See Details
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
              </tbody>
            </table>

            {!isLoading && rows.length === 0 && (
              <p className="py-12 text-center text-sm text-muted-foreground">
                No {activeTab} withdrawals found.
              </p>
            )}
          </div>
        </div>

        <Pagination page={page} totalPages={totalPages} onPageChange={setPage} className="mt-2" />
      </div>

      {/* ── Dialogs ── */}
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
      <SeeDetailsDialog
        withdrawal={detailTarget}
        open={!!detailTarget}
        onClose={() => setDetailTarget(null)}
      />
      <ExportDialog
        open={exportOpen}
        onClose={() => setExportOpen(false)}
      />
    </div>
  )
}
