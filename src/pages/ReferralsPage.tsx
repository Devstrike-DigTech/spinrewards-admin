import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { Share2, Search } from 'lucide-react'
import { referralsApi } from '@/api/index'
import type { AdminReferral } from '@/types'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import { Pagination } from '@/components/Pagination'

// ── Helpers ───────────────────────────────────────────────────────────────────

function formatDate(iso: string | null) {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('en-NG', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

function StatusBadge({ status }: { status: AdminReferral['status'] }) {
  const config: Record<AdminReferral['status'], { label: string; variant: 'success' | 'warning' | 'destructive' | 'secondary' }> = {
    pending: { label: 'Pending', variant: 'secondary' },
    qualified: { label: 'Qualified', variant: 'warning' },
    rewarded: { label: 'Rewarded', variant: 'success' },
    rejected: { label: 'Rejected', variant: 'destructive' },
  }
  const { label, variant } = config[status] ?? { label: status, variant: 'secondary' }
  return <Badge variant={variant}>{label}</Badge>
}

// ── Stat card ─────────────────────────────────────────────────────────────────

function StatCard({ label, value, accent }: { label: string; value: number; accent?: boolean }) {
  return (
    <div
      className="rounded-2xl p-5 flex flex-col gap-1"
      style={{ background: '#0D1836', border: '1px solid #1e2a4a' }}
    >
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="text-2xl font-bold" style={{ color: accent ? '#22c55e' : '#C9961A' }}>
        {value.toLocaleString()}
      </p>
    </div>
  )
}

// ── ReferralsPage ─────────────────────────────────────────────────────────────

const PAGE_SIZE = 10

type StatusFilter = '' | 'pending' | 'qualified' | 'rewarded' | 'rejected'

export function ReferralsPage() {
  const navigate = useNavigate()
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('')

  // Debounce search
  function handleSearch(val: string) {
    setSearch(val)
    clearTimeout((window as { _searchTimer?: ReturnType<typeof setTimeout> })._searchTimer)
    ;(window as { _searchTimer?: ReturnType<typeof setTimeout> })._searchTimer = setTimeout(() => {
      setDebouncedSearch(val)
      setPage(1)
    }, 400)
  }

  const { data, isLoading } = useQuery({
    queryKey: ['referrals', { page, search: debouncedSearch, status: statusFilter }],
    queryFn: () => referralsApi.list({
      page,
      search: debouncedSearch || undefined,
      status: statusFilter || undefined,
    }),
  })

  const overview = data?.overview
  const results = data?.results ?? []
  const totalPages = data ? Math.ceil(data.count / PAGE_SIZE) : 1

  const STATUS_TABS: { label: string; value: StatusFilter }[] = [
    { label: 'All', value: '' },
    { label: 'Pending', value: 'pending' },
    { label: 'Qualified', value: 'qualified' },
    { label: 'Rewarded', value: 'rewarded' },
    { label: 'Rejected', value: 'rejected' },
  ]

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center gap-2">
        <Share2 className="h-5 w-5" style={{ color: '#C9961A' }} />
        <h1 className="text-lg font-bold text-white">Referrals</h1>
      </div>

      {/* Overview cards */}
      {isLoading ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-24 rounded-2xl" />)}
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard label="Total Referrals" value={overview?.total ?? 0} />
          <StatCard label="Pending" value={overview?.pending ?? 0} />
          <StatCard label="Qualified" value={overview?.qualified ?? 0} />
          <StatCard label="Rewarded" value={overview?.rewarded ?? 0} accent />
        </div>
      )}

      {/* Filters row */}
      <div
        className="rounded-2xl p-4 flex flex-wrap items-center gap-3"
        style={{ background: '#0D1836', border: '1px solid #1e2a4a' }}
      >
        {/* Search */}
        <div className="relative flex-1 min-w-[200px] max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            className="w-full rounded-xl pl-9 pr-3 py-2 text-sm text-white bg-[#07090F] border border-[#1e2a4a] focus:outline-none focus:border-[#C9961A] placeholder:text-muted-foreground/50"
            placeholder="Search by name…"
            value={search}
            onChange={(e) => handleSearch(e.target.value)}
          />
        </div>

        {/* Status tabs */}
        <div className="flex items-center gap-1">
          {STATUS_TABS.map((tab) => (
            <button
              key={tab.value}
              onClick={() => { setStatusFilter(tab.value); setPage(1) }}
              className="px-3 py-1.5 rounded-lg text-xs font-medium transition-colors"
              style={
                statusFilter === tab.value
                  ? { background: '#C9961A', color: '#07090F' }
                  : { background: '#07090F', color: '#64748b', border: '1px solid #1e2a4a' }
              }
            >
              {tab.label}
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
            {[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-12 w-full rounded-xl" />)}
          </div>
        ) : results.length === 0 ? (
          <p className="py-16 text-center text-sm text-muted-foreground">No referrals found.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr style={{ borderBottom: '1px solid #1e2a4a' }}>
                  {['Referrer', 'Referred User', 'Code', 'Status', 'Qualified', 'Rewarded', 'Joined'].map((h) => (
                    <th
                      key={h}
                      className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide whitespace-nowrap"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {results.map((ref) => (
                  <ReferralRow
                    key={ref.id}
                    referral={ref}
                    onClickUser={(userId) => navigate(`/users/${userId}`)}
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
    </div>
  )
}

// ── Referral Row ──────────────────────────────────────────────────────────────

function ReferralRow({
  referral,
  onClickUser,
}: {
  referral: AdminReferral
  onClickUser: (userId: string) => void
}) {
  return (
    <tr
      className="border-t transition-colors hover:bg-white/[0.02]"
      style={{ borderColor: '#1e2a4a' }}
    >
      <td className="px-4 py-3">
        <button
          onClick={() => onClickUser(referral.referrer.id)}
          className="text-sm font-medium text-white hover:underline text-left"
        >
          {referral.referrer.name}
        </button>
        <p className="text-xs text-muted-foreground">#{referral.referrer.telegram_id}</p>
      </td>

      <td className="px-4 py-3">
        <button
          onClick={() => onClickUser(referral.referred_user.id)}
          className="text-sm font-medium text-white hover:underline text-left"
        >
          {referral.referred_user.name}
        </button>
        <p className="text-xs text-muted-foreground">#{referral.referred_user.telegram_id}</p>
      </td>

      <td className="px-4 py-3">
        <span
          className="text-xs font-mono rounded px-2 py-0.5"
          style={{ background: '#1e2a4a', color: '#C9961A' }}
        >
          {referral.code}
        </span>
      </td>

      <td className="px-4 py-3">
        <StatusBadge status={referral.status} />
      </td>

      <td className="px-4 py-3 text-xs text-muted-foreground whitespace-nowrap">
        {formatDate(referral.qualified_at)}
      </td>

      <td className="px-4 py-3 text-xs text-muted-foreground whitespace-nowrap">
        {formatDate(referral.rewarded_at)}
      </td>

      <td className="px-4 py-3 text-xs text-muted-foreground whitespace-nowrap">
        {formatDate(referral.created_at)}
      </td>
    </tr>
  )
}
