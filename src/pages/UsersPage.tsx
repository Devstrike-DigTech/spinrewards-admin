import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { type ColumnDef } from '@tanstack/react-table'
import { Search, Users, ShieldAlert, ShieldCheck } from 'lucide-react'
import { usersApi } from '@/api/index'
import type { AdminUser, UsersListResponse } from '@/types'
import { DataTable } from '@/components/DataTable'
import { Pagination } from '@/components/Pagination'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { formatCurrency } from '@/lib/utils'

function StatCard({
  title,
  value,
  icon: Icon,
  iconColor,
  isLoading,
}: {
  title: string
  value: string | number
  icon: React.ElementType
  iconColor: string
  isLoading: boolean
}) {
  return (
    <Card className="bg-card border-[#1e2a4a]">
      <CardContent className="flex items-center gap-4 p-5">
        <div
          className="flex h-10 w-10 items-center justify-center rounded-xl shrink-0"
          style={{ background: `${iconColor}22` }}
        >
          <Icon className="h-5 w-5" style={{ color: iconColor }} />
        </div>
        <div>
          <p className="text-xs text-muted-foreground">{title}</p>
          {isLoading ? (
            <Skeleton className="mt-1 h-6 w-20" />
          ) : (
            <p className="text-xl font-bold text-white">{value}</p>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

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

export function UsersPage() {
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('all')
  const [page, setPage] = useState(1)
  const navigate = useNavigate()

  const { data, isLoading } = useQuery<UsersListResponse>({
    queryKey: ['users', search, filter, page],
    queryFn: () => usersApi.list({ search, filter, page }),
  })

  const overview = data?.overview
  const PAGE_SIZE = 10
  const totalPages = data ? Math.ceil(data.count / PAGE_SIZE) : 1

  const columns: ColumnDef<AdminUser>[] = [
    {
      accessorKey: 'telegram_id',
      header: 'Telegram ID',
      cell: ({ getValue }) => (
        <span className="font-mono text-xs text-muted-foreground">#{getValue<number>()}</span>
      ),
    },
    {
      accessorKey: 'name',
      header: 'Name',
      cell: ({ row }) => (
        <div>
          <p className="font-medium text-sm text-white">{row.original.name}</p>
          <p className="text-xs text-muted-foreground">{row.original.registered_via}</p>
        </div>
      ),
    },
    {
      accessorKey: 'phone_number',
      header: 'Phone',
      cell: ({ getValue }) => (
        <span className="font-mono text-xs">{getValue<string>()}</span>
      ),
    },
    {
      accessorKey: 'registered_on',
      header: 'Registered',
      cell: ({ getValue }) => (
        <span className="text-xs text-muted-foreground">{getValue<string>()}</span>
      ),
    },
    {
      accessorKey: 'balance',
      header: 'Balance (₦)',
      cell: ({ getValue }) => (
        <span className="font-semibold text-sm">{formatCurrency(getValue<string>())}</span>
      ),
    },
    {
      accessorKey: 'kyc_status',
      header: 'KYC',
      cell: ({ getValue }) => <KYCBadge status={getValue<string>()} />,
    },
    {
      accessorKey: 'risk',
      header: 'Risk',
      cell: ({ getValue }) => <RiskBadge risk={getValue<string>()} />,
    },
    {
      id: 'action',
      header: '',
      cell: ({ row }) => (
        <Button
          size="sm"
          variant="outline"
          className="border-[#1e2a4a] text-xs hover:border-gold hover:text-gold"
          onClick={() => navigate(`/users/${row.original.id}`)}
        >
          View
        </Button>
      ),
    },
  ]

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-white">Users</h1>
        <p className="text-sm text-muted-foreground">Manage and review all platform users</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard
          title="Total Users"
          value={overview?.total_users.toLocaleString() ?? '—'}
          icon={Users}
          iconColor="#C9961A"
          isLoading={isLoading}
        />
        <StatCard
          title="Flagged Accounts"
          value={overview?.flagged_accounts ?? '—'}
          icon={ShieldAlert}
          iconColor="#ef4444"
          isLoading={isLoading}
        />
        <StatCard
          title="Pending KYC"
          value={overview?.pending_kyc ?? '—'}
          icon={ShieldCheck}
          iconColor="#f59e0b"
          isLoading={isLoading}
        />
      </div>

      {/* Table section */}
      <div className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search by name or phone…"
              className="pl-9 border-[#1e2a4a] bg-card"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value)
                setPage(1)
              }}
            />
          </div>
          <div className="flex items-center gap-2 text-sm">
            <span className="text-muted-foreground">Filter:</span>
            <select
              className="rounded-md border border-[#1e2a4a] bg-card px-3 py-1.5 text-sm text-foreground"
              value={filter}
              onChange={(e) => {
                setFilter(e.target.value)
                setPage(1)
              }}
            >
              <option value="all">All Users</option>
              <option value="kyc_pending">KYC Pending</option>
              <option value="flagged">Flagged</option>
            </select>
          </div>
        </div>

        <DataTable columns={columns} data={data?.results ?? []} isLoading={isLoading} />
        <Pagination page={page} totalPages={totalPages} onPageChange={setPage} className="mt-4" />
      </div>
    </div>
  )
}
