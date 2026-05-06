import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { type ColumnDef } from '@tanstack/react-table'
import { auditLogApi } from '@/api/index'
import type { AuditLogEntry } from '@/types'
import { DataTable } from '@/components/DataTable'
import { Pagination } from '@/components/Pagination'
import { Badge } from '@/components/ui/badge'
import { formatDate } from '@/lib/utils'

export function AuditLogPage() {
  const [page, setPage] = useState(1)

  const { data, isLoading } = useQuery({
    queryKey: ['audit-log', page],
    queryFn: () => auditLogApi.list({ page }),
    refetchInterval: 30_000,
  })

  const PAGE_SIZE = 10
  const totalPages = data ? Math.ceil(data.count / PAGE_SIZE) : 1

  const columns: ColumnDef<AuditLogEntry>[] = [
    {
      accessorKey: 'created_at',
      header: 'Time',
      cell: ({ getValue }) => (
        <span className="whitespace-nowrap text-xs text-muted-foreground">
          {formatDate(getValue<string>())}
        </span>
      ),
    },
    {
      accessorKey: 'admin_user',
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
      accessorKey: 'target_model',
      header: 'Target',
      cell: ({ row }) => (
        <div>
          <p className="text-sm text-foreground">{row.original.target_model}</p>
          <p className="font-mono text-xs text-muted-foreground">#{row.original.target_id}</p>
        </div>
      ),
    },
    {
      accessorKey: 'details',
      header: 'Details',
      cell: ({ getValue }) => (
        <pre className="max-w-xs overflow-hidden truncate rounded bg-muted px-2 py-1 text-xs">
          {JSON.stringify(getValue<Record<string, unknown>>(), null, 0)}
        </pre>
      ),
    },
  ]

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold text-white">Audit Logs</h1>
        <p className="text-sm text-muted-foreground">
          Immutable record of all admin actions. Read-only.
        </p>
      </div>
      <DataTable columns={columns} data={data?.results ?? []} isLoading={isLoading} />
      <Pagination page={page} totalPages={totalPages} onPageChange={setPage} className="mt-4" />
    </div>
  )
}
