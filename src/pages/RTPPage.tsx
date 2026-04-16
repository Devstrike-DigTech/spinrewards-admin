import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm, useFieldArray } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { Plus, Trash2, ChevronDown, ChevronRight } from 'lucide-react'
import { rtp as rtpApi } from '@/api/endpoints'
import type { RTPTier } from '@/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'

const outcomeSchema = z.object({
  label: z.string().min(1),
  multiplier: z.string().min(1),
  probability: z.string().refine((v) => parseFloat(v) > 0 && parseFloat(v) <= 100),
  color: z.string().min(4),
})

const tierSchema = z.object({
  min_stake: z.coerce.number().min(1),
  max_stake: z.coerce.number().min(1),
  rtp_target: z.coerce.number().min(1).max(100),
  outcomes: z.array(outcomeSchema).min(2),
})

type TierFormValues = z.infer<typeof tierSchema>

function TierCard({ tier, onEdit, onDelete }: { tier: RTPTier; onEdit: () => void; onDelete: () => void }) {
  const [open, setOpen] = useState(false)
  const totalProb = tier.outcomes.reduce((s, o) => s + parseFloat(o.probability), 0)

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => setOpen((p) => !p)} className="text-muted-foreground">
              {open ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
            </button>
            <CardTitle className="text-base">
              ₦{parseFloat(tier.min_stake).toLocaleString()} – ₦{parseFloat(tier.max_stake).toLocaleString()}
            </CardTitle>
            <Badge variant="secondary">RTP {tier.rtp_target}%</Badge>
            {Math.abs(totalProb - 100) > 0.01 && (
              <Badge variant="destructive">Probabilities ≠ 100%</Badge>
            )}
          </div>
          <div className="flex gap-2">
            <Button size="sm" variant="outline" onClick={onEdit}>Edit</Button>
            <Button size="sm" variant="destructive" onClick={onDelete}>Delete</Button>
          </div>
        </div>
      </CardHeader>
      {open && (
        <CardContent className="pt-0">
          <div className="grid grid-cols-4 gap-2 text-xs font-medium text-muted-foreground mb-2 px-1">
            <span>Label</span><span>Multiplier</span><span>Probability</span><span>Color</span>
          </div>
          {tier.outcomes.map((o) => (
            <div key={o.id} className="grid grid-cols-4 gap-2 rounded px-1 py-1.5 text-sm hover:bg-muted/40">
              <span>{o.label}</span>
              <span>{o.multiplier}x</span>
              <span>{o.probability}%</span>
              <div className="flex items-center gap-2">
                <div className="h-4 w-4 rounded" style={{ background: o.color }} />
                <span className="font-mono text-xs">{o.color}</span>
              </div>
            </div>
          ))}
        </CardContent>
      )}
    </Card>
  )
}

function TierFormDialog({
  open,
  onClose,
  defaultValues,
  tierId,
}: {
  open: boolean
  onClose: () => void
  defaultValues?: TierFormValues
  tierId?: string
}) {
  const queryClient = useQueryClient()
  const isEdit = !!tierId

  const { register, control, handleSubmit, formState: { errors } } = useForm<TierFormValues>({
    resolver: zodResolver(tierSchema),
    defaultValues: defaultValues ?? {
      min_stake: 50,
      max_stake: 500,
      rtp_target: 70,
      outcomes: [
        { label: 'Try Again', multiplier: '0', probability: '60', color: '#1a1a3e' },
        { label: '2x', multiplier: '2', probability: '40', color: '#6c3de8' },
      ],
    },
  })

  const { fields, append, remove } = useFieldArray({ control, name: 'outcomes' })

  const mutation = useMutation({
    mutationFn: (values: TierFormValues) =>
      isEdit
        ? rtpApi.update(tierId!, values)
        : rtpApi.create(values),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rtp'] })
      toast.success(isEdit ? 'Tier updated.' : 'Tier created.')
      onClose()
    },
    onError: () => toast.error('Failed to save tier.'),
  })

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Edit RTP Tier' : 'New RTP Tier'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit((v) => mutation.mutate(v))} className="space-y-4">
          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-1.5">
              <Label>Min Stake (₦)</Label>
              <Input type="number" {...register('min_stake')} />
            </div>
            <div className="space-y-1.5">
              <Label>Max Stake (₦)</Label>
              <Input type="number" {...register('max_stake')} />
            </div>
            <div className="space-y-1.5">
              <Label>RTP Target (%)</Label>
              <Input type="number" step="0.1" {...register('rtp_target')} />
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Outcomes</Label>
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => append({ label: '', multiplier: '0', probability: '0', color: '#1a1a3e' })}
              >
                <Plus className="mr-1 h-3 w-3" /> Add
              </Button>
            </div>
            <div className="grid grid-cols-[1fr_80px_80px_80px_36px] gap-2 text-xs text-muted-foreground px-1">
              <span>Label</span><span>Multiplier</span><span>Prob %</span><span>Color</span><span/>
            </div>
            {fields.map((field, i) => (
              <div key={field.id} className="grid grid-cols-[1fr_80px_80px_80px_36px] gap-2 items-center">
                <Input placeholder="e.g. 2x Win" {...register(`outcomes.${i}.label`)} />
                <Input type="number" step="0.1" placeholder="2" {...register(`outcomes.${i}.multiplier`)} />
                <Input type="number" step="0.1" placeholder="30" {...register(`outcomes.${i}.probability`)} />
                <Input type="color" {...register(`outcomes.${i}.color`)} className="h-9 cursor-pointer p-1" />
                <Button type="button" size="icon" variant="ghost" onClick={() => remove(i)}>
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            ))}
            {errors.outcomes && (
              <p className="text-xs text-destructive">All outcome fields are required and probabilities must be positive.</p>
            )}
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending ? 'Saving…' : 'Save Tier'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export function RTPPage() {
  const queryClient = useQueryClient()
  const [dialogState, setDialogState] = useState<{
    open: boolean
    tier?: RTPTier
  }>({ open: false })

  const { data: tiers, isLoading } = useQuery({
    queryKey: ['rtp'],
    queryFn: rtpApi.list,
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => rtpApi.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rtp'] })
      toast.success('Tier deleted.')
    },
    onError: () => toast.error('Failed to delete tier.'),
  })

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">RTP Configuration</h1>
          <p className="text-sm text-muted-foreground">
            Manage spin tiers and outcome probabilities.
          </p>
        </div>
        <Button onClick={() => setDialogState({ open: true })}>
          <Plus className="mr-2 h-4 w-4" /> New Tier
        </Button>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => <Skeleton key={i} className="h-20 w-full" />)}
        </div>
      ) : (
        <div className="space-y-3">
          {tiers?.map((tier) => (
            <TierCard
              key={tier.id}
              tier={tier}
              onEdit={() => setDialogState({ open: true, tier })}
              onDelete={() => {
                if (confirm('Delete this tier? This cannot be undone.')) {
                  deleteMutation.mutate(tier.id)
                }
              }}
            />
          ))}
          {tiers?.length === 0 && (
            <p className="py-12 text-center text-muted-foreground">
              No RTP tiers configured. Add one to enable spinning.
            </p>
          )}
        </div>
      )}

      <TierFormDialog
        open={dialogState.open}
        onClose={() => setDialogState({ open: false })}
        tierId={dialogState.tier?.id}
        defaultValues={
          dialogState.tier
            ? {
                min_stake: parseFloat(dialogState.tier.min_stake),
                max_stake: parseFloat(dialogState.tier.max_stake),
                rtp_target: parseFloat(dialogState.tier.rtp_target),
                outcomes: dialogState.tier.outcomes.map((o) => ({
                  label: o.label,
                  multiplier: o.multiplier,
                  probability: o.probability,
                  color: o.color,
                })),
              }
            : undefined
        }
      />
    </div>
  )
}
