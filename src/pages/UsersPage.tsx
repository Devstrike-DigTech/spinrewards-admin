import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { type ColumnDef } from '@tanstack/react-table'
import { toast } from 'sonner'
import { users as usersApi } from '@/api/endpoints'
import type { AdminUser } from '@/types'
import { DataTable } from '@/components/DataTable'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { formatDate, formatCurrency } from '@/lib/utils'

export function UsersPage() {
  const [search, setSearch] = useState('')
  const queryClient = useQueryClient()

  const { data, isLoading } = useQuery({
    queryKey: ['users', search],
    queryFn: () => usersApi.list({ search }),
  })

  const banMutation = useMutation({
    mutationFn: (id: string) => usersApi.ban(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] })
      toast.success('User banned.')
    },
    onError: () => toast.error('Failed to ban user.'),
  })

  const unbanMutation = useMutation({
    mutationFn: (id: string) => usersApi.unban(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] })
      toast.success('User unbanned.')
    },
    onError: () => toast.error('Failed to unban user.'),
  })

  const columns: ColumnDef<AdminUser>[] = [
    {
      accessorKey: 'first_name',
      header: 'User',
      cell: ({ row }) => (
        <div>
          <p className="font-medium">
            {row.original.first_name} {row.original.last_name}
          </p>
          <p className="text-xs text-muted-foreground">@{row.original.username}</p>
        </div>
      ),
    },
    {
      accessorKey: 'telegram_id',
      header: 'Telegram ID',
      cell: ({ getValue }) => (
        <span className="font-mono text-xs">{getValue<string>()}</span>
      ),
    },
    {
      accessorKey: 'coin_balance',
      header: 'Coins',
      cell: ({ getValue }) => parseFloat(getValue<string>()).toLocaleString(),
    },
    {
      accessorKey: 'cash_balance',
      header: 'Cash',
      cell: ({ getValue }) => formatCurrency(getValue<string>()),
    },
    {
      accessorKey: 'is_kyc_verified',
      header: 'KYC',
      cell: ({ getValue }) =>
        getValue<boolean>() ? (
          <Badge variant="success">Verified</Badge>
        ) : (
          <Badge variant="warning">Pending</Badge>
        ),
    },
    {
      accessorKey: 'is_banned',
      header: 'Status',
      cell: ({ getValue }) =>
        getValue<boolean>() ? (
          <Badge variant="destructive">Banned</Badge>
        ) : (
          <Badge variant="success">Active</Badge>
        ),
    },
    {
      accessorKey: 'created_at',
      header: 'Joined',
      cell: ({ getValue }) => (
        <span className="text-xs text-muted-foreground">{formatDate(getValue<string>())}</span>
      ),
    },
    {
      id: 'actions',
      cell: ({ row }) => (
        <div className="flex gap-2">
          {row.original.is_banned ? (
            <Button
              size="sm"
              variant="outline"
              onClick={() => unbanMutation.mutate(row.original.id)}
              disabled={unbanMutation.isPending}
            >
              Unban
            </Button>
          ) : (
            <Button
              size="sm"
              variant="destructive"
              onClick={() => banMutation.mutate(row.original.id)}
              disabled={banMutation.isPending}
            >
              Ban
            </Button>
          )}
        </div>
      ),
    },
  ]

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Users</h1>
          <p className="text-sm text-muted-foreground">
            {data?.count ?? 0} total users
          </p>
        </div>
        <Input
          placeholder="Search by name or username…"
          className="w-64"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>
      <DataTable columns={columns} data={data?.results ?? []} isLoading={isLoading} />
    </div>
  )
}
