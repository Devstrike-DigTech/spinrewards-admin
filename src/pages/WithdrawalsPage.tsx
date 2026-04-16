import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { type ColumnDef } from '@tanstack/react-table'
import { toast } from 'sonner'
import { withdrawals as withdrawalsApi } from '@/api/endpoints'
import type { WithdrawalRecord, WithdrawalStatus } from '@/types'
import { DataTable } from '@/components/DataTable'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { formatDate, formatCurrency } from '@/lib/utils'

const STATUS_BADGE: Record<
  WithdrawalStatus,
  { label: string; variant: 'success' | 'warning' | 'destructive' | 'info' | 'secondary' }
> = {
  pending: { label: 'Pending', variant: 'warning' },
  processing: { label: 'Processing', variant: 'info' },
  completed: { label: 'Completed', variant: 'success' },
  failed: { label: 'Failed', variant: 'destructive' },
}

export function WithdrawalsPage() {
  const queryClient = useQueryClient()
  const [rejectTarget, setRejectTarget] = useState<WithdrawalRecord | null>(null)
  const [rejectReason, setRejectReason] = useState('')

  const { data, isLoading } = useQuery({
    queryKey: ['withdrawals', 'pending'],
    queryFn: () => withdrawalsApi.list({ status: 'pending' }),
  })

  const approveMutation = useMutation({
    mutationFn: (id: string) => withdrawalsApi.approve(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['withdrawals'] })
      toast.success('Withdrawal approved and queued for payout.')
    },
    onError: () => toast.error('Failed to approve withdrawal.'),
  })

  const rejectMutation = useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) =>
      withdrawalsApi.reject(id, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['withdrawals'] })
      setRejectTarget(null)
      setRejectReason('')
      toast.success('Withdrawal rejected. Funds reversed to user wallet.')
    },
    onError: () => toast.error('Failed to reject withdrawal.'),
  })

  const columns: ColumnDef<WithdrawalRecord>[] = [
    {
      accessorKey: 'user',
      header: 'User',
      cell: ({ row }) => (
        <div>
          <p className="font-medium">
            {row.original.user.first_name} {row.original.user.last_name}
          </p>
          <p className="text-xs text-muted-foreground">@{row.original.user.username}</p>
        </div>
      ),
    },
    {
      accessorKey: 'amount',
      header: 'Amount',
      cell: ({ getValue }) => (
        <span className="font-semibold">{formatCurrency(getValue<string>())}</span>
      ),
    },
    {
      accessorKey: 'account_name',
      header: 'Account',
      cell: ({ row }) => (
        <div>
          <p className="text-sm">{row.original.account_name}</p>
          <p className="font-mono text-xs text-muted-foreground">
            {row.original.bank_name} · {row.original.account_number}
          </p>
        </div>
      ),
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ getValue }) => {
        const s = getValue<WithdrawalStatus>()
        const { label, variant } = STATUS_BADGE[s]
        return <Badge variant={variant}>{label}</Badge>
      },
    },
    {
      accessorKey: 'created_at',
      header: 'Requested',
      cell: ({ getValue }) => (
        <span className="text-xs text-muted-foreground">{formatDate(getValue<string>())}</span>
      ),
    },
    {
      id: 'actions',
      cell: ({ row }) =>
        row.original.status === 'pending' ? (
          <div className="flex gap-2">
            <Button
              size="sm"
              onClick={() => approveMutation.mutate(row.original.id)}
              disabled={approveMutation.isPending}
            >
              Approve
            </Button>
            <Button
              size="sm"
              variant="destructive"
              onClick={() => setRejectTarget(row.original)}
            >
              Reject
            </Button>
          </div>
        ) : null,
    },
  ]

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold">Withdrawals</h1>
        <p className="text-sm text-muted-foreground">
          {data?.count ?? 0} pending requests
        </p>
      </div>

      <DataTable columns={columns} data={data?.results ?? []} isLoading={isLoading} />

      <Dialog open={!!rejectTarget} onOpenChange={() => setRejectTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Withdrawal</DialogTitle>
            <DialogDescription>
              Funds will be reversed to the user's cash wallet automatically.
            </DialogDescription>
          </DialogHeader>
          <Textarea
            placeholder="Reason for rejection…"
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            rows={3}
          />
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setRejectTarget(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              disabled={!rejectReason.trim() || rejectMutation.isPending}
              onClick={() =>
                rejectTarget &&
                rejectMutation.mutate({ id: rejectTarget.id, reason: rejectReason })
              }
            >
              Reject & Reverse
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
