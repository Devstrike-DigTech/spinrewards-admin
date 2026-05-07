import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { type ColumnDef } from '@tanstack/react-table'
import { auditLogApi } from '@/api/index'
import type { AuditLogEntry } from '@/types'
import { DataTable } from '@/components/DataTable'
import { Pagination } from '@/components/Pagination'
import { Badge } from '@/components/ui/badge'

const TYPE_COLORS: Record<string, string> = {
  withdrawal: '#C9961A',
  kyc: '#f59e0b',
  rtp: '#3de8c4',
}

export function AuditLogPage() {
  const [page, setPage] = useState(1)
  const [typeFilter, setTypeFilter] = useState('')
  const navigate = useNavigate()

  const { data, isLoading } = useQuery({
    queryKey: ['audit-log', typeFilter, page],
    queryFn: () => auditLogApi.list({ type: typeFilter || undefined, page }),
    refetchInterval: 30_000,
  })

  const PAGE_SIZE = 10
  const totalPages = data ? Math.ceil(data.count / PAGE_SIZE) : 1

  const columns: ColumnDef<AuditLogEntry>[] = [
    {
      accessorKey: 'timestamp_display',
      header: 'Time',
      cell: ({ getValue }) => (
        <span className="whitespace-nowrap text-xs text-muted-foreground">
          {getValue<string>()}
        </span>
      ),
    },
    {
      accessorKey: 'type',
      header: 'Type',
      cell: ({ getValue }) => {
        const t = getValue<string>()
        return (
          <span
            className="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold capitalize"
            style={{
              background: (TYPE_COLORS[t] ?? '#888') + '22',
              color: TYPE_COLORS[t] ?? '#888',
            }}
          >
            {t}
          </span>
        )
      },
    },
    {
      accessorKey: 'performed_by',
      header: 'Admin',
      cell: ({ getValue }) => (
        <span className="font-medium text-sm">{getValue<string>()}</span>
      ),
    },
    {
      accessorKey: 'action',
      header: 'Action',
      cell: ({ getValue }) => (
        <Badge variant="secondary" className="font-mono text-xs">
          {getValue<string>()}
        </Badge>
      ),
    },
    {
      accessorKey: 'target_user',
      header: 'User',
      cell: ({ row }) => {
        const user = row.original.target_user
        const userId = row.original.target_user_id
        if (!user) return <span className="text-muted-foreground text-xs">—</span>
        return userId ? (
          <button
            className="text-sm font-medium text-foreground hover:text-gold transition-colors text-left"
            onClick={() => navigate(`/users/${userId}`)}
          >
            {user}
          </button>
        ) : (
          <span className="text-sm text-foreground">{user}</span>
        )
      },
    },
    {
      accessorKey: 'detail',
      header: 'Detail',
      cell: ({ getValue }) => (
        <span className="text-xs text-muted-foreground truncate max-w-[200px] block">
          {getValue<string>() || '—'}
        </span>
      ),
    },
    {
      accessorKey: 'notes',
      header: 'Notes',
      cell: ({ getValue }) => (
        <span className="text-xs text-muted-foreground italic">
          {getValue<string>() || '—'}
        </span>
      ),
    },
  ]

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Audit Logs</h1>
          <p className="text-sm text-muted-foreground">
            Immutable record of all admin actions. Read-only.
          </p>
        </div>
        <select
          className="rounded-md border border-[#1e2a4a] bg-card px-3 py-1.5 text-sm text-foreground"
          value={typeFilter}
          onChange={(e) => {
            setTypeFilter(e.target.value)
            setPage(1)
          }}
        >
          <option value="">All Types</option>
          <option value="withdrawal">Withdrawal</option>
          <option value="kyc">KYC</option>
          <option value="rtp">RTP</option>
        </select>
      </div>

      <DataTable columns={columns} data={data?.results ?? []} isLoading={isLoading} />
      <Pagination page={page} totalPages={totalPages} onPageChange={setPage} className="mt-4" />
    </div>
  )
}
