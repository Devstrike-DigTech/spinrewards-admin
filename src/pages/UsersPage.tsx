import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { type ColumnDef } from '@tanstack/react-table'
import { Search } from 'lucide-react'
import { usersApi, analyticsApi } from '@/api/index'
import type { AdminUser, AdminAnalyticsSummary } from '@/types'
import { DataTable } from '@/components/DataTable'
import { Pagination } from '@/components/Pagination'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { formatDate, formatCurrency } from '@/lib/utils'
import { Users, ShieldAlert, ShieldCheck } from 'lucide-react'

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

function KYCBadge({ status }: { status: AdminUser['kyc_status'] }) {
  if (status === 'approved') return <Badge variant="success">Done</Badge>
  if (status === 'pending') return <Badge variant="warning">Pending</Badge>
  if (status === 'rejected') return <Badge variant="destructive">Rejected</Badge>
  return <Badge variant="secondary">None</Badge>
}

function RiskBadge({ level }: { level: AdminUser['risk_level'] }) {
  if (level === 'low') return <Badge variant="success">Low</Badge>
  if (level === 'medium') return <Badge variant="warning">Medium</Badge>
  return <Badge variant="destructive">High</Badge>
}

export function UsersPage() {
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const navigate = useNavigate()

  const { data: summary, isLoading: summaryLoading } = useQuery<AdminAnalyticsSummary>({
    queryKey: ['analytics', 'summary'],
    queryFn: analyticsApi.summary,
  })

  const { data, isLoading } = useQuery({
    queryKey: ['users', search, page],
    queryFn: () => usersApi.list({ search, page }),
  })

  const PAGE_SIZE = 10
  const totalPages = data ? Math.ceil(data.count / PAGE_SIZE) : 1

  const columns: ColumnDef<AdminUser>[] = [
    {
      accessorKey: 'id',
      header: 'ID',
      cell: ({ getValue }) => (
        <span className="font-mono text-xs text-muted-foreground">#{getValue<string>()}</span>
      ),
    },
    {
      accessorKey: 'first_name',
      header: 'Name',
      cell: ({ row }) => (
        <div>
          <p className="font-medium text-sm text-white">
            {row.original.first_name} {row.original.last_name}
          </p>
          <p className="text-xs text-muted-foreground">@{row.original.username}</p>
        </div>
      ),
    },
    {
      accessorKey: 'phone_number',
      header: 'Phone Number',
      cell: ({ getValue }) => (
        <span className="font-mono text-xs">{getValue<string>()}</span>
      ),
    },
    {
      accessorKey: 'created_at',
      header: 'Registered On',
      cell: ({ getValue }) => (
        <span className="text-xs text-muted-foreground">{formatDate(getValue<string>())}</span>
      ),
    },
    {
      accessorKey: 'cash_balance',
      header: 'Balance (₦)',
      cell: ({ getValue }) => (
        <span className="font-semibold text-sm">{formatCurrency(getValue<string>())}</span>
      ),
    },
    {
      accessorKey: 'total_staked',
      header: 'Total Staked',
      cell: ({ getValue }) => (
        <span className="text-sm">{parseFloat(getValue<string>()).toLocaleString()}</span>
      ),
    },
    {
      accessorKey: 'kyc_status',
      header: 'KYC',
      cell: ({ getValue }) => <KYCBadge status={getValue<AdminUser['kyc_status']>()} />,
    },
    {
      accessorKey: 'risk_level',
      header: 'Risk',
      cell: ({ getValue }) => <RiskBadge level={getValue<AdminUser['risk_level']>()} />,
    },
    {
      id: 'action',
      header: 'Action',
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
          value={summary?.total_users.toLocaleString() ?? '—'}
          icon={Users}
          iconColor="#C9961A"
          isLoading={summaryLoading}
        />
        <StatCard
          title="Flagged Accounts"
          value={summary?.flagged_accounts ?? '—'}
          icon={ShieldAlert}
          iconColor="#ef4444"
          isLoading={summaryLoading}
        />
        <StatCard
          title="Pending KYC"
          value={summary?.pending_kyc_count ?? '—'}
          icon={ShieldCheck}
          iconColor="#f59e0b"
          isLoading={summaryLoading}
        />
      </div>

      {/* Table section */}
      <div className="space-y-3">
        <div className="flex items-center justify-between gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search by name, username, phone…"
              className="pl-9 border-[#1e2a4a] bg-card"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value)
                setPage(1)
              }}
            />
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>Sort by:</span>
            <select className="rounded-md border border-[#1e2a4a] bg-card px-3 py-1.5 text-sm text-foreground">
              <option>Date Joined</option>
              <option>Balance</option>
              <option>Total Spins</option>
            </select>
          </div>
        </div>

        <DataTable columns={columns} data={data?.results ?? []} isLoading={isLoading} />

        <Pagination
          page={page}
          totalPages={totalPages}
          onPageChange={setPage}
          className="mt-4"
        />
      </div>
    </div>
  )
}
