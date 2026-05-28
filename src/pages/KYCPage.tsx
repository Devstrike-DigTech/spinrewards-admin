import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { Search, X, ShieldCheck, FileText, CreditCard, User } from 'lucide-react'
import { toast } from 'sonner'
import { kycApi } from '@/api/index'
import type { AdminKYCQueueItem, KYCSectionInfo, KYCQueueListResponse } from '@/types'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Pagination } from '@/components/Pagination'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { useCan } from '@/lib/permissions'

// ── Section status display ────────────────────────────────────────────────────

function SectionBadge({ status }: { status: string }) {
  const map: Record<string, { cls: string; label: string }> = {
    verified: { cls: 'bg-emerald-500/20 text-emerald-400', label: '✓ Verified' },
    pending: { cls: 'bg-amber-500/20 text-amber-400', label: '⏳ Pending' },
    requires_correction: { cls: 'bg-orange-500/20 text-orange-400', label: '⚠ Needs Fix' },
    rejected: { cls: 'bg-red-500/20 text-red-400', label: '✗ Rejected' },
  }
  const s = map[status] ?? { cls: 'bg-gray-500/20 text-gray-400', label: status }
  return (
    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold ${s.cls}`}>
      {s.label}
    </span>
  )
}

function OverallBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    approved: 'bg-emerald-500/20 text-emerald-400',
    partial: 'bg-amber-500/20 text-amber-400',
    pending: 'bg-sky-500/20 text-sky-400',
    rejected: 'bg-red-500/20 text-red-400',
  }
  return (
    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold capitalize ${map[status] ?? 'bg-gray-500/20 text-gray-400'}`}>
      {status}
    </span>
  )
}

// ── KYC Detail Dialog ─────────────────────────────────────────────────────────

type SectionKey = 'personal_info' | 'bank_account' | 'document'

const SECTION_META: { key: SectionKey; label: string; icon: React.ElementType }[] = [
  { key: 'personal_info', label: 'Personal Info', icon: User },
  { key: 'bank_account', label: 'Bank Account', icon: CreditCard },
  { key: 'document', label: 'Document', icon: FileText },
]

function SectionPanel({
  sectionKey,
  label,
  icon: Icon,
  info,
  kycId,
  onMutated,
}: {
  sectionKey: SectionKey
  label: string
  icon: React.ElementType
  info: KYCSectionInfo
  kycId: string
  onMutated: () => void
}) {
  const can = useCan()
  const [rejectReason, setRejectReason] = useState('')
  const [showReject, setShowReject] = useState(false)

  const approveMutation = useMutation({
    mutationFn: () => kycApi.approve(kycId, sectionKey),
    onSuccess: () => { toast.success(`${label} approved.`); onMutated() },
    onError: (err: any) => toast.error(err?.response?.data?.message ?? 'Failed.'),
  })

  const rejectMutation = useMutation({
    mutationFn: () => kycApi.reject(kycId, sectionKey, rejectReason),
    onSuccess: () => { toast.success(`${label} rejected.`); setShowReject(false); onMutated() },
    onError: (err: any) => toast.error(err?.response?.data?.message ?? 'Failed.'),
  })

  const sectionNeedsAction = info.status === 'pending' || info.status === 'requires_correction'
  const canAct = sectionNeedsAction && (can('approve_kyc') || can('reject_kyc'))

  return (
    <div className="rounded-xl p-4 space-y-3" style={{ background: '#0A0E1E', border: '1px solid #1e2a4a' }}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Icon className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium text-white">{label}</span>
        </div>
        <SectionBadge status={info.status} />
      </div>

      {/* Section-specific details */}
      {sectionKey === 'bank_account' && info.bank_name && (
        <div className="space-y-0.5">
          <p className="text-xs text-muted-foreground">Bank: {info.bank_name}</p>
          <p className="text-xs text-muted-foreground">Account: {info.account_name} — {info.account_masked}</p>
        </div>
      )}
      {sectionKey === 'document' && info.filename && (
        <div className="space-y-0.5">
          <p className="text-xs text-muted-foreground capitalize">Type: {info.document_type?.replace('_', ' ')}</p>
          <p className="text-xs text-muted-foreground">File: {info.filename}</p>
          {info.file_url && info.file_url !== '#' && (
            <a
              href={info.file_url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs font-medium"
              style={{ color: '#C9961A' }}
            >
              View document ↗
            </a>
          )}
        </div>
      )}

      {info.reason && (
        <p className="text-xs text-red-400 bg-red-500/10 rounded-lg px-3 py-2">{info.reason}</p>
      )}

      {canAct && (
        <div className="space-y-2">
          {!showReject ? (
            <div className="flex gap-2">
              {can('approve_kyc') && (
                <Button
                  size="sm"
                  className="text-xs font-semibold text-white h-7 px-3"
                  style={{ background: '#22c55e' }}
                  disabled={approveMutation.isPending}
                  onClick={() => approveMutation.mutate()}
                >
                  {approveMutation.isPending ? 'Approving…' : 'Approve'}
                </Button>
              )}
              {can('reject_kyc') && (
                <Button
                  size="sm"
                  variant="destructive"
                  className="text-xs font-semibold h-7 px-3"
                  onClick={() => setShowReject(true)}
                >
                  Reject
                </Button>
              )}
            </div>
          ) : (
            <div className="space-y-2">
              <Input
                placeholder="Rejection reason…"
                className="border-[#1e2a4a] bg-[#0D1220] text-foreground text-sm h-9"
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
              />
              <div className="flex gap-2">
                <Button size="sm" variant="outline" className="text-xs border-[#1e2a4a] h-7" onClick={() => setShowReject(false)}>
                  Cancel
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  className="text-xs font-semibold h-7 px-3"
                  disabled={rejectMutation.isPending || !rejectReason.trim()}
                  onClick={() => rejectMutation.mutate()}
                >
                  {rejectMutation.isPending ? 'Rejecting…' : 'Confirm'}
                </Button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function KYCDetailDialog({
  item,
  open,
  onClose,
}: {
  item: AdminKYCQueueItem | null
  open: boolean
  onClose: () => void
}) {
  const can = useCan()
  const queryClient = useQueryClient()

  const approveAllMutation = useMutation({
    mutationFn: () => kycApi.approve(item!.id, 'all'),
    onSuccess: () => {
      toast.success('KYC fully approved.')
      queryClient.invalidateQueries({ queryKey: ['kyc-queue'] })
      onClose()
    },
    onError: (err: any) => toast.error(err?.response?.data?.message ?? 'Failed.'),
  })

  function handleMutated() {
    queryClient.invalidateQueries({ queryKey: ['kyc-queue'] })
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent
        className="max-w-xl max-h-[90vh] overflow-y-auto border-[#1e2a4a] p-0"
        style={{ background: '#0D1220' }}
      >
        <DialogHeader className="flex flex-row items-center justify-between p-5 pb-4 border-b border-[#1e2a4a]">
          <div>
            <DialogTitle className="text-white">{item?.name}</DialogTitle>
            {item && (
              <p className="text-xs text-muted-foreground mt-0.5">
                TG: #{item.telegram_id} · Submitted {item.submitted_at}
              </p>
            )}
          </div>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
            <X className="h-5 w-5" />
          </button>
        </DialogHeader>

        {item && (
          <div className="p-5 space-y-4">
            {/* Overall status */}
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Overall status</span>
              <div className="flex items-center gap-3">
                <OverallBadge status={item.overall_status} />
                {item.overall_status !== 'approved' && can('approve_kyc') && (
                  <Button
                    size="sm"
                    className="text-xs font-semibold text-white h-7 px-3"
                    style={{ background: '#22c55e' }}
                    disabled={approveAllMutation.isPending}
                    onClick={() => approveAllMutation.mutate()}
                  >
                    {approveAllMutation.isPending ? 'Approving…' : 'Approve All'}
                  </Button>
                )}
              </div>
            </div>

            {/* Section panels */}
            {SECTION_META.map(({ key, label, icon }) => (
              <SectionPanel
                key={key}
                sectionKey={key}
                label={label}
                icon={icon}
                info={item.sections[key]}
                kycId={item.id}
                onMutated={handleMutated}
              />
            ))}
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}

// ── Main page ─────────────────────────────────────────────────────────────────

const STATUS_FILTERS = [
  { label: 'All', value: '' },
  { label: 'Pending', value: 'pending' },
  { label: 'Needs Fix', value: 'requires_correction' },
  { label: 'Rejected', value: 'rejected' },
  { label: 'Approved', value: 'approved' },
]

export function KYCPage() {
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [page, setPage] = useState(1)
  const [selected, setSelected] = useState<AdminKYCQueueItem | null>(null)
  const navigate = useNavigate()

  const { data, isLoading } = useQuery<KYCQueueListResponse>({
    queryKey: ['kyc-queue', search, statusFilter, page],
    queryFn: () => kycApi.list({ search, status: statusFilter || undefined, page }),
    refetchInterval: 30_000,
  })

  const overview = data?.overview
  const PAGE_SIZE = 10
  const totalPages = data ? Math.ceil(data.count / PAGE_SIZE) : 1

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">KYC Review Queue</h1>
          <p className="text-sm text-muted-foreground">
            {isLoading ? <Skeleton className="inline-block h-4 w-32" /> : `${overview?.total_pending ?? 0} pending · ${overview?.total_approved ?? 0} approved · ${overview?.total_rejected ?? 0} rejected`}
          </p>
        </div>
        <div className="flex h-10 w-10 items-center justify-center rounded-xl" style={{ background: 'rgba(245, 158, 11, 0.15)' }}>
          <ShieldCheck className="h-5 w-5" style={{ color: '#f59e0b' }} />
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 items-center justify-between">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by name…"
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
              style={statusFilter === f.value ? { background: '#f59e0b' } : {}}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Queue list */}
      <Card className="bg-card border-[#1e2a4a]">
        <CardContent className="p-0">
          {isLoading ? (
            <div className="space-y-2 p-4">
              {[1, 2, 3].map((i) => <Skeleton key={i} className="h-20 w-full" />)}
            </div>
          ) : (data?.results ?? []).length === 0 ? (
            <div className="py-16 text-center text-muted-foreground text-sm">
              No KYC submissions found.
            </div>
          ) : (
            <div className="divide-y divide-[#1e2a4a]">
              {(data?.results ?? []).map((item) => (
                <div key={item.id} className="flex items-center gap-4 p-4 hover:bg-white/2 transition-colors">
                  {/* Avatar */}
                  <div
                    className="flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold text-white shrink-0"
                    style={{ background: '#1A237E' }}
                  >
                    {item.name.split(' ').map((n) => n[0]).slice(0, 2).join('')}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <button
                        className="text-sm font-semibold text-white hover:text-gold transition-colors"
                        onClick={() => navigate(`/users/${item.user_id}`)}
                      >
                        {item.name}
                      </button>
                      <OverallBadge status={item.overall_status} />
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      TG: #{item.telegram_id} · Submitted {item.submitted_at}
                    </p>
                    {/* Section summary row */}
                    <div className="flex gap-3 mt-2 flex-wrap">
                      {SECTION_META.map(({ key, label }) => (
                        <div key={key} className="flex items-center gap-1">
                          <span className="text-xs text-muted-foreground">{label}:</span>
                          <SectionBadge status={item.sections[key].status} />
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Action */}
                  <Button
                    size="sm"
                    variant="outline"
                    className="shrink-0 border-[#1e2a4a] text-xs hover:border-amber-500 hover:text-amber-400"
                    onClick={() => setSelected(item)}
                  >
                    Review
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />

      <KYCDetailDialog
        item={selected}
        open={!!selected}
        onClose={() => setSelected(null)}
      />
    </div>
  )
}
