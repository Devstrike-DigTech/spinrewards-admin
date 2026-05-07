import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm, useFieldArray } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { Plus, Trash2, X } from 'lucide-react'
import { rtpApi } from '@/api/index'
import type { RTPWheel } from '@/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

const segmentSchema = z.object({
  label: z.string().min(1, 'Label required'),
  multiplier: z.string().min(1, 'Multiplier required'),
  probability_weight: z.coerce.number().min(0).max(100),
  color: z.string().min(4),
})

const stakeSchema = z.object({
  name: z.string().min(1, 'Name required'),
  wheel_type: z.string().min(1, 'Required'),
  min_stake: z.coerce.number().min(1, 'Required'),
  max_stake: z.coerce.number().min(1, 'Required'),
  rtp_target: z.coerce.number().min(0).max(100),
  is_active: z.boolean(),
  segments: z.array(segmentSchema).min(2, 'At least 2 segments'),
})

type StakeFormValues = z.infer<typeof stakeSchema>

function TierCard({ tier, onEdit }: { tier: RTPWheel; onEdit: () => void }) {
  const segments = tier.segments ?? []

  return (
    <Card className="bg-card border-[#1e2a4a]">
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-semibold text-white text-base">{tier.name}</h3>
              <Badge variant={tier.is_active ? 'success' : 'secondary'}>
                {tier.is_active ? 'Active' : 'Inactive'}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              ₦{parseFloat(tier.min_stake).toLocaleString()} –
              ₦{parseFloat(tier.max_stake).toLocaleString()} · {tier.total_spins.toLocaleString()} spins
            </p>

            <div
              className="rounded-xl p-4"
              style={{ background: 'rgba(10, 14, 30, 0.6)', border: '1px solid #1e2a4a' }}
            >
              <div className="mb-3 flex flex-wrap gap-6">
                <div>
                  <p className="text-xs text-muted-foreground">House Edge</p>
                  <p className="font-semibold text-white">{tier.house_edge}%</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">RTP Target</p>
                  <p className="font-semibold text-white">{tier.rtp_target}%</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Computed RTP</p>
                  <p className="font-semibold text-emerald-400">{tier.computed_rtp}%</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5">
                {segments.map((s) => (
                  <div
                    key={s.position}
                    className="flex flex-col items-center rounded-lg px-3 py-2 text-center"
                    style={{ background: s.color + '22', border: `1px solid ${s.color}44` }}
                  >
                    <span className="text-xs text-muted-foreground mb-0.5">{s.label}</span>
                    <span className="text-sm font-bold text-white">
                      {s.probability_pct.toFixed(1)}%
                    </span>
                    <span className="text-xs text-muted-foreground">w:{s.probability_weight}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <Button
            size="sm"
            variant="outline"
            className="shrink-0 border-[#1e2a4a] text-muted-foreground hover:text-foreground"
            onClick={onEdit}
          >
            Edit
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

function StakeModal({
  open,
  onClose,
  tier,
}: {
  open: boolean
  onClose: () => void
  tier?: RTPWheel
}) {
  const queryClient = useQueryClient()
  const isEdit = !!tier

  const defaultSegments: StakeFormValues['segments'] = [
    { label: 'Loss', multiplier: '0', probability_weight: 50, color: '#3a3a3a' },
    { label: '2×', multiplier: '2', probability_weight: 30, color: '#1A237E' },
    { label: '5×', multiplier: '5', probability_weight: 20, color: '#C9961A' },
  ]

  const { register, control, handleSubmit, watch, setValue, formState: { errors } } =
    useForm<StakeFormValues>({
      resolver: zodResolver(stakeSchema),
      defaultValues: isEdit
        ? {
            name: tier.name,
            wheel_type: tier.wheel_type,
            min_stake: parseFloat(tier.min_stake),
            max_stake: parseFloat(tier.max_stake),
            rtp_target: parseFloat(tier.rtp_target),
            is_active: tier.is_active,
            segments: tier.segments.map((s) => ({
              label: s.label,
              multiplier: s.multiplier,
              probability_weight: s.probability_weight,
              color: s.color,
            })),
          }
        : {
            name: '',
            wheel_type: 'standard',
            min_stake: 200,
            max_stake: 499,
            rtp_target: 80,
            is_active: false,
            segments: defaultSegments,
          },
    })

  const { fields, append, remove } = useFieldArray({ control, name: 'segments' })
  const isActive = watch('is_active')

  const createMutation = useMutation({
    mutationFn: (values: StakeFormValues) =>
      rtpApi.create({
        name: values.name,
        wheel_type: values.wheel_type,
        currency_type: 'cash',
        min_stake: String(values.min_stake),
        max_stake: String(values.max_stake),
        rtp_target: String(values.rtp_target),
        is_active: values.is_active,
        segments: values.segments.map((s) => ({
          label: s.label,
          multiplier: s.multiplier,
          probability_weight: s.probability_weight,
          color: s.color,
        })),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rtp'] })
      toast.success('Wheel created.')
      onClose()
    },
    onError: () => toast.error('Failed to create wheel.'),
  })

  const updateMutation = useMutation({
    mutationFn: (values: StakeFormValues) =>
      rtpApi.update(tier!.id, {
        is_active: values.is_active,
        segments: values.segments.map((s, i) => ({
          position: i,
          probability_weight: s.probability_weight,
        })),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rtp'] })
      toast.success('Wheel updated.')
      onClose()
    },
    onError: () => toast.error('Failed to update wheel.'),
  })

  function onSubmit(values: StakeFormValues) {
    const totalWeight = values.segments.reduce((s, seg) => s + seg.probability_weight, 0)
    if (totalWeight === 0) {
      toast.error('Probability weights cannot all be zero.')
      return
    }
    if (isEdit) {
      updateMutation.mutate(values)
    } else {
      createMutation.mutate(values)
    }
  }

  const isPending = createMutation.isPending || updateMutation.isPending

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent
        className="max-w-lg max-h-[90vh] overflow-y-auto border-[#1e2a4a] p-0"
        style={{ background: '#0D1220' }}
      >
        <DialogHeader className="flex flex-row items-center justify-between p-5 pb-4 border-b border-[#1e2a4a]">
          <DialogTitle className="text-white text-lg">
            {isEdit ? 'Edit Wheel' : 'Create Stake'}
          </DialogTitle>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors">
            <X className="h-5 w-5" />
          </button>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="p-5 space-y-4">
          {/* Name */}
          <div className="space-y-1.5">
            <Label className="text-sm text-muted-foreground">Name</Label>
            <Input
              placeholder="e.g. Entry Stake (₦200–₦499)"
              className="border-[#1e2a4a] bg-[#0A0E1E] text-foreground"
              {...register('name')}
            />
            {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
          </div>

          {/* Range */}
          {!isEdit && (
            <div className="space-y-1.5">
              <Label className="text-sm text-muted-foreground">Stake Range</Label>
              <div className="flex items-center gap-3">
                <div className="relative flex-1">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">₦</span>
                  <Input type="number" placeholder="From" className="border-[#1e2a4a] bg-[#0A0E1E] text-foreground pl-8" {...register('min_stake')} />
                </div>
                <span className="text-muted-foreground">—</span>
                <div className="relative flex-1">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">₦</span>
                  <Input type="number" placeholder="To" className="border-[#1e2a4a] bg-[#0A0E1E] text-foreground pl-8" {...register('max_stake')} />
                </div>
              </div>
            </div>
          )}

          {/* RTP */}
          {!isEdit && (
            <div className="space-y-1.5">
              <Label className="text-sm text-muted-foreground">RTP Target</Label>
              <div className="relative">
                <Input
                  type="number"
                  className="border-[#1e2a4a] bg-[#0A0E1E] text-foreground pr-8"
                  {...register('rtp_target')}
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">%</span>
              </div>
            </div>
          )}

          {/* Segments */}
          <div
            className="rounded-xl p-4 space-y-3"
            style={{ background: '#0A0E1E', border: '1px solid #1e2a4a' }}
          >
            <div className="flex items-center justify-between">
              <Label className="text-sm text-white font-medium">
                Segments
                <span className="ml-2 text-xs text-muted-foreground">
                  (total weight: {fields.reduce((s, _, i) => {
                    const el = document.querySelector<HTMLInputElement>(`input[name="segments.${i}.probability_weight"]`)
                    return s + (el ? parseInt(el.value) || 0 : 0)
                  }, 0)})
                </span>
              </Label>
              {!isEdit && (
                <button
                  type="button"
                  className="flex items-center gap-1 text-xs font-medium"
                  style={{ color: '#C9961A' }}
                  onClick={() => append({ label: '', multiplier: '0', probability_weight: 10, color: '#1A237E' })}
                >
                  Add <Plus className="h-3.5 w-3.5" />
                </button>
              )}
            </div>

            <div className="space-y-2">
              {fields.map((field, i) => (
                <div key={field.id} className="flex items-center gap-2">
                  <div className="flex-1">
                    <Input
                      placeholder="Label"
                      className="border-[#1e2a4a] bg-[#0D1220] text-foreground text-sm h-9"
                      {...register(`segments.${i}.label`)}
                    />
                  </div>
                  {!isEdit && (
                    <div className="w-20 relative">
                      <Input
                        type="number"
                        step="0.1"
                        placeholder="×"
                        className="border-[#1e2a4a] bg-[#0D1220] text-foreground text-sm h-9 pr-6"
                        {...register(`segments.${i}.multiplier`)}
                      />
                      <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">×</span>
                    </div>
                  )}
                  <div className="w-24 relative">
                    <Input
                      type="number"
                      step="1"
                      placeholder="weight"
                      className="border-[#1e2a4a] bg-[#0D1220] text-foreground text-sm h-9 pr-8"
                      {...register(`segments.${i}.probability_weight`)}
                    />
                    <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">wt</span>
                  </div>
                  {!isEdit && (
                    <button
                      type="button"
                      onClick={() => remove(i)}
                      className="text-muted-foreground hover:text-destructive transition-colors"
                      disabled={fields.length <= 2}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
            <p className="text-xs text-muted-foreground">
              Weights are relative — backend normalises to 100%.
            </p>
          </div>

          {/* Status toggle */}
          <div className="space-y-1.5">
            <Label className="text-sm text-muted-foreground">Status</Label>
            <div className="flex rounded-lg overflow-hidden border border-[#1e2a4a] w-fit">
              <button
                type="button"
                onClick={() => setValue('is_active', false)}
                className={`px-5 py-2 text-sm font-medium transition-colors ${
                  !isActive ? 'bg-primary text-white' : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                Inactive
              </button>
              <button
                type="button"
                onClick={() => setValue('is_active', true)}
                className={`px-5 py-2 text-sm font-medium transition-colors ${
                  isActive ? 'text-white' : 'text-muted-foreground hover:text-foreground'
                }`}
                style={isActive ? { background: '#C9961A' } : {}}
              >
                Active
              </button>
            </div>
          </div>

          <Button
            type="submit"
            className="w-full h-11 font-semibold text-white"
            style={{ background: '#C9961A' }}
            disabled={isPending}
          >
            {isPending ? 'Saving…' : 'Submit'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export function RTPPage() {
  const [dialogState, setDialogState] = useState<{ open: boolean; tier?: RTPWheel }>({
    open: false,
  })

  const { data: wheels, isLoading } = useQuery<RTPWheel[]>({
    queryKey: ['rtp'],
    queryFn: rtpApi.list,
  })

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">RTP Control</h1>
          <p className="text-sm text-muted-foreground">Manage spin wheels and outcome probabilities.</p>
        </div>
        <Button
          onClick={() => setDialogState({ open: true })}
          className="font-semibold text-white"
          style={{ background: '#C9961A' }}
        >
          <Plus className="mr-2 h-4 w-4" />
          Create Stake
        </Button>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => <Skeleton key={i} className="h-44 w-full" />)}
        </div>
      ) : (
        <div className="space-y-4">
          {(wheels ?? []).map((wheel) => (
            <TierCard
              key={wheel.id}
              tier={wheel}
              onEdit={() => setDialogState({ open: true, tier: wheel })}
            />
          ))}
          {(wheels ?? []).length === 0 && (
            <p className="py-12 text-center text-muted-foreground">
              No wheels configured. Create one to enable spinning.
            </p>
          )}
        </div>
      )}

      <StakeModal
        open={dialogState.open}
        onClose={() => setDialogState({ open: false })}
        tier={dialogState.tier}
      />
    </div>
  )
}
