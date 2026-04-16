import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { type ColumnDef } from '@tanstack/react-table'
import { toast } from 'sonner'
import { kyc as kycApi } from '@/api/endpoints'
import type { KYCRecord, KYCStatus } from '@/types'
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
import { formatDate } from '@/lib/utils'

const STATUS_BADGE: Record<KYCStatus, { label: string; variant: 'success' | 'warning' | 'destructive' | 'secondary' }> = {
  approved: { label: 'Approved', variant: 'success' },
  pending: { label: 'Pending', variant: 'warning' },
  rejected: { label: 'Rejected', variant: 'destructive' },
  unverified: { label: 'Unverified', variant: 'secondary' },
}

export function KYCPage() {
  const queryClient = useQueryClient()
  const [rejectTarget, setRejectTarget] = useState<KYCRecord | null>(null)
  const [rejectReason, setRejectReason] = useState('')

  const { data, isLoading } = useQuery({
    queryKey: ['kyc', 'pending'],
    queryFn: () => kycApi.list({ status: 'pending' }),
  })

  const approveMutation = useMutation({
    mutationFn: (id: string) => kycApi.approve(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['kyc'] })
      toast.success('KYC approved.')
    },
    onError: () => toast.error('Failed to approve KYC.'),
  })

  const rejectMutation = useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) =>
      kycApi.reject(id, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['kyc'] })
      setRejectTarget(null)
      setRejectReason('')
      toast.success('KYC rejected.')
    },
    onError: () => toast.error('Failed to reject KYC.'),
  })

  const columns: ColumnDef<KYCRecord>[] = [
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
      accessorKey: 'account_name',
      header: 'Account Name',
    },
    {
      accessorKey: 'account_number',
      header: 'Account Number',
      cell: ({ getValue }) => (
        <span className="font-mono text-sm">{getValue<string>()}</span>
      ),
    },
    {
      accessorKey: 'bank_name',
      header: 'Bank',
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ getValue }) => {
        const s = getValue<KYCStatus>()
        const { label, variant } = STATUS_BADGE[s]
        return <Badge variant={variant}>{label}</Badge>
      },
    },
    {
      accessorKey: 'submitted_at',
      header: 'Submitted',
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
              variant="default"
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
        <h1 className="text-2xl font-bold">KYC Verification</h1>
        <p className="text-sm text-muted-foreground">
          {data?.count ?? 0} pending submissions
        </p>
      </div>

      <DataTable columns={columns} data={data?.results ?? []} isLoading={isLoading} />

      {/* Reject dialog */}
      <Dialog open={!!rejectTarget} onOpenChange={() => setRejectTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject KYC</DialogTitle>
            <DialogDescription>
              Provide a reason for rejection. This will be shown to the user.
            </DialogDescription>
          </DialogHeader>
          <Textarea
            placeholder="e.g. Bank account name does not match provided name."
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            rows={4}
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
              Confirm Rejection
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
