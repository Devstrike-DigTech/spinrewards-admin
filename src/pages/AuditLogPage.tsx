import { useQuery } from '@tanstack/react-query'
import { type ColumnDef } from '@tanstack/react-table'
import { auditLog as auditLogApi } from '@/api/endpoints'
import type { AuditLogEntry } from '@/types'
import { DataTable } from '@/components/DataTable'
import { Badge } from '@/components/ui/badge'
import { formatDate } from '@/lib/utils'

export function AuditLogPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['audit-log'],
    queryFn: () => auditLogApi.list(),
    refetchInterval: 30_000,
  })

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
        <span className="font-medium">{getValue<string>()}</span>
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
          <p className="text-sm">{row.original.target_model}</p>
          <p className="font-mono text-xs text-muted-foreground">{row.original.target_id}</p>
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
        <h1 className="text-2xl font-bold">Audit Log</h1>
        <p className="text-sm text-muted-foreground">
          Immutable record of all admin actions. Read-only.
        </p>
      </div>
      <DataTable columns={columns} data={data?.results ?? []} isLoading={isLoading} />
    </div>
  )
}
