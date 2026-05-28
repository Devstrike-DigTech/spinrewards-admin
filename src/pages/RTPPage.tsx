import { useState, useEffect, useMemo } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm, useFieldArray, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { Plus, Trash2, X, Activity, Save } from 'lucide-react'
import { rtpApi } from '@/api/index'
import type { RTPWheel } from '@/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

// ── Slider thumb CSS (injected once) ─────────────────────────────────────────

const SLIDER_CSS = `
  .rtp-slider{-webkit-appearance:none;appearance:none;height:6px;border-radius:3px;outline:none;cursor:pointer;transition:opacity .15s;}
  .rtp-slider::-webkit-slider-thumb{-webkit-appearance:none;width:16px;height:16px;border-radius:50%;background:#C9961A;cursor:grab;border:2px solid #07090F;box-shadow:0 0 0 3px rgba(201,150,26,.25);transition:box-shadow .15s;}
  .rtp-slider::-webkit-slider-thumb:active{cursor:grabbing;box-shadow:0 0 0 5px rgba(201,150,26,.35);}
  .rtp-slider::-moz-range-thumb{width:16px;height:16px;border-radius:50%;background:#C9961A;cursor:grab;border:2px solid #07090F;}
  .rtp-slider:disabled{opacity:.35;cursor:not-allowed;}
`

function SliderStyles() {
  return <style dangerouslySetInnerHTML={{ __html: SLIDER_CSS }} />
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function fmtNum(n: number | string, d = 2): string {
  return parseFloat(String(n)).toFixed(d)
}

// ── Stat pill ─────────────────────────────────────────────────────────────────

function StatPill({
  label,
  value,
  color,
}: {
  label: string
  value: string
  color?: string
}) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-[10px] uppercase tracking-wide text-muted-foreground">{label}</span>
      <span className="text-sm font-semibold" style={{ color: color ?? '#e2e8f0' }}>
        {value}
      </span>
    </div>
  )
}

// ── Slider row ────────────────────────────────────────────────────────────────

function SliderRow({
  label,
  color,
  value,
  onPointerDown,
  onChange,
}: {
  label: string
  color?: string
  value: number
  onPointerDown?: () => void
  onChange: (v: number) => void
}) {
  const pct = Math.min(100, Math.max(0, value))
  return (
    <div className="flex items-center gap-3">
      <div className="flex items-center gap-2 w-36 shrink-0">
        {color && (
          <span
            className="inline-block w-2.5 h-2.5 rounded-full shrink-0"
            style={{ background: color }}
          />
        )}
        <span className="text-sm text-muted-foreground truncate">{label}</span>
      </div>
      <div className="flex-1">
        <input
          type="range"
          min={0}
          max={100}
          step={0.5}
          value={pct}
          className="rtp-slider w-full"
          style={{
            background: `linear-gradient(to right, #C9961A ${pct}%, #1e2a4a ${pct}%)`,
          }}
          onPointerDown={onPointerDown}
          onChange={(e) => onChange(parseFloat(e.target.value))}
        />
      </div>
      <span className="w-14 shrink-0 text-right text-sm font-semibold text-white">
        {pct.toFixed(1)}%
      </span>
    </div>
  )
}

// ── Wheel card ────────────────────────────────────────────────────────────────

function WheelCard({
  wheel,
  onOpenEdit,
}: {
  wheel: RTPWheel
  onOpenEdit: () => void
}) {
  const queryClient = useQueryClient()
  const segments = wheel.segments ?? []

  const [isEditing, setIsEditing]   = useState(false)
  const [localRtp, setLocalRtp]     = useState(parseFloat(wheel.rtp_target))
  const [localPcts, setLocalPcts]   = useState<number[]>(() =>
    segments.map((s) => s.probability_pct)
  )

  // Sync from server when not actively editing
  useEffect(() => {
    if (!isEditing) {
      setLocalRtp(parseFloat(wheel.rtp_target))
      setLocalPcts(segments.map((s) => s.probability_pct))
    }
  }, [wheel.rtp_target, wheel.computed_rtp, isEditing]) // eslint-disable-line react-hooks/exhaustive-deps

  // ── Saved (server) stats ───────────────────────────────────────────────────
  const winRate      = segments.reduce((sum, s) => (parseFloat(s.multiplier) > 0 ? sum + s.probability_pct : sum), 0)
  const rtpTarget    = parseFloat(wheel.rtp_target)
  const serverRtp    = parseFloat(wheel.computed_rtp)
  const houseEdge    = parseFloat(wheel.house_edge)
  const rtpDrift     = serverRtp - rtpTarget
  const midStake     = (parseFloat(wheel.min_stake) + parseFloat(wheel.max_stake)) / 2
  const estGgrPer1k  = midStake * 1000 * (houseEdge / 100)

  // ── Live preview stats (computed from current slider positions) ────────────
  const totalLocalPcts = localPcts.reduce((a, b) => a + b, 0)

  const liveComputedRtp = useMemo(() => {
    if (totalLocalPcts === 0) return 0
    return segments.reduce((sum, seg, i) => {
      const pct = (localPcts[i] ?? 0) / totalLocalPcts
      return sum + pct * parseFloat(seg.multiplier)
    }, 0) * 100
  }, [localPcts, totalLocalPcts, segments])

  const liveHouseEdge     = 100 - liveComputedRtp
  const liveRtpDelta      = liveComputedRtp - localRtp
  const totalIsValid      = Math.abs(totalLocalPcts - 100) < 0.5
  const rtpIsValid        = liveComputedRtp <= 100

  const previewStatus: 'danger' | 'warn' | 'ok' =
    !rtpIsValid ? 'danger'
    : !totalIsValid ? 'danger'
    : Math.abs(liveRtpDelta) > 10 ? 'warn'
    : 'ok'

  const canSave = isEditing && totalIsValid && rtpIsValid

  // ── Mutation ───────────────────────────────────────────────────────────────
  const updateMutation = useMutation({
    mutationFn: () =>
      rtpApi.update(wheel.id, {
        name:       wheel.name,
        min_stake:  wheel.min_stake,
        max_stake:  wheel.max_stake,
        rtp_target: String(localRtp),
        is_active:  wheel.is_active,
        segments:   localPcts.map((pct, i) => ({
          position:          segments[i]?.position ?? i,
          label:             segments[i]?.label ?? '',
          color:             segments[i]?.color ?? '#888888',
          multiplier:        parseFloat(segments[i]?.multiplier ?? '0').toFixed(2),
          probability_weight: parseFloat(pct.toFixed(1)),
        })),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rtp'] })
      toast.success(`${wheel.name} updated.`)
      setIsEditing(false)
    },
    onError: (err: unknown) => {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message
      toast.error(msg ?? 'Failed to update wheel.')
    },
  })

  function startEditing() {
    if (!isEditing) setIsEditing(true)
  }

  // Each slider is fully independent — no redistribution
  function handlePctChange(idx: number, v: number) {
    startEditing()
    setLocalPcts((prev) => prev.map((val, j) => j === idx ? Math.max(0, Math.min(100, v)) : val))
  }

  function handleRtpChange(v: number) {
    startEditing()
    setLocalRtp(v)
  }

  function handleCancel() {
    setLocalRtp(parseFloat(wheel.rtp_target))
    setLocalPcts(segments.map((s) => s.probability_pct))
    setIsEditing(false)
  }

  function handleSave() {
    if (!totalIsValid) {
      toast.error(`Probabilities sum to ${totalLocalPcts.toFixed(1)}% — must be exactly 100%. Adjust the sliders and try again.`)
      return
    }
    if (!rtpIsValid) {
      toast.error(`Computed RTP is ${liveComputedRtp.toFixed(1)}% — house edge is negative. Fix segment weights first.`)
      return
    }
    updateMutation.mutate()
  }

  return (
    <div
      className="rounded-2xl p-5 space-y-4"
      style={{ background: '#0D1836', border: '1px solid #1e2a4a' }}
    >
      {/* ── Header ── */}
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <h3 className="font-semibold text-white text-base">{wheel.name}</h3>
            <Badge variant={wheel.is_active ? 'success' : 'secondary'}>
              {wheel.is_active ? 'Active' : 'Inactive'}
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground">
            ₦{parseFloat(wheel.min_stake).toLocaleString()} –{' '}
            ₦{parseFloat(wheel.max_stake).toLocaleString()} &nbsp;·&nbsp; {wheel.wheel_type}
          </p>
        </div>
        <div className="shrink-0 text-right">
          <p className="text-[11px] text-muted-foreground">House Edge</p>
          <p className="text-2xl font-bold leading-tight" style={{ color: '#C9961A' }}>
            {isEditing ? liveHouseEdge.toFixed(1) : fmtNum(wheel.house_edge)}%
          </p>
        </div>
      </div>

      {/* ── Saved stat strip ── */}
      <div
        className="flex flex-wrap gap-x-6 gap-y-3 rounded-xl px-4 py-3"
        style={{ background: 'rgba(10,14,30,0.55)', border: '1px solid #1e2a4a' }}
      >
        <StatPill label="Total Spins"      value={wheel.total_spins.toLocaleString()} />
        <StatPill label="Win Rate"         value={`${winRate.toFixed(1)}%`}           color={winRate >= 40 ? '#34d399' : '#94a3b8'} />
        <StatPill
          label="RTP Drift"
          value={`${rtpDrift >= 0 ? '+' : ''}${rtpDrift.toFixed(2)}%`}
          color={Math.abs(rtpDrift) < 1 ? '#34d399' : Math.abs(rtpDrift) < 3 ? '#fbbf24' : '#f87171'}
        />
        <StatPill label="Computed RTP"     value={`${fmtNum(wheel.computed_rtp)}%`}  color="#a5f3fc" />
        <StatPill label="Est. GGR / 1k spins" value={`₦${Math.round(estGgrPer1k).toLocaleString()}`} color="#C9961A" />
      </div>

      {/* ── Slider section ── */}
      <div
        className="rounded-xl p-4 space-y-3"
        style={{ background: 'rgba(10,14,30,0.4)', border: '1px solid #1e2a4a' }}
      >
        <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground pb-1">
          RTP Configuration
        </p>

        {/* RTP Target slider */}
        <SliderRow
          label="RTP Target"
          value={isEditing ? localRtp : rtpTarget}
          onPointerDown={startEditing}
          onChange={handleRtpChange}
        />

        {/* House Edge — read-only derived bar */}
        <div className="flex items-center gap-3">
          <div className="w-36 shrink-0">
            <span className="text-sm text-muted-foreground">House Edge</span>
          </div>
          <div className="flex-1">
            <div className="h-[6px] rounded-full overflow-hidden" style={{ background: '#1e2a4a' }}>
              <div
                className="h-full rounded-full transition-all duration-150"
                style={{
                  width: `${Math.max(0, isEditing ? (100 - localRtp) : houseEdge)}%`,
                  background: 'linear-gradient(to right, #6d28d9, #a855f7)',
                }}
              />
            </div>
          </div>
          <span className="w-14 shrink-0 text-right text-sm font-semibold text-purple-400">
            {isEditing ? (100 - localRtp).toFixed(1) : fmtNum(wheel.house_edge)}%
          </span>
        </div>

        {segments.length > 0 && (
          <div className="border-t border-[#1e2a4a] pt-2 space-y-1">
            <div className="flex items-center justify-between pb-1">
              <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                Segment Probabilities
              </p>
              {isEditing && (
                <span
                  className="text-xs font-semibold tabular-nums"
                  style={{ color: totalIsValid ? '#34d399' : totalLocalPcts > 100 ? '#f87171' : '#fbbf24' }}
                >
                  Total: {totalLocalPcts.toFixed(1)}%{totalIsValid ? ' ✓' : totalLocalPcts > 100 ? ' — over' : ' — under'}
                </span>
              )}
            </div>

            {segments.map((seg, i) => (
              <div key={seg.position}>
                <SliderRow
                  label={seg.label || `Segment ${i + 1}`}
                  color={seg.color}
                  value={isEditing ? (localPcts[i] ?? seg.probability_pct) : seg.probability_pct}
                  onPointerDown={startEditing}
                  onChange={(v) => handlePctChange(i, v)}
                />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Live config preview — appears as soon as editing starts ── */}
      {isEditing && (
        <div
          className="rounded-xl p-4 space-y-2"
          style={{
            background:
              previewStatus === 'danger' ? 'rgba(239,68,68,0.08)'
              : previewStatus === 'warn'  ? 'rgba(251,191,36,0.08)'
              : 'rgba(52,211,153,0.06)',
            border: `1px solid ${
              previewStatus === 'danger' ? '#ef444440'
              : previewStatus === 'warn' ? '#fbbf2440'
              : '#34d39940'
            }`,
          }}
        >
          <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
            Configuration Preview
          </p>
          <div className="flex flex-wrap gap-x-6 gap-y-2">
            <div>
              <p className="text-[10px] text-muted-foreground">Computed RTP</p>
              <p
                className="text-base font-bold"
                style={{ color: previewStatus === 'danger' ? '#f87171' : previewStatus === 'warn' ? '#fbbf24' : '#34d399' }}
              >
                {liveComputedRtp.toFixed(2)}%
              </p>
            </div>
            <div>
              <p className="text-[10px] text-muted-foreground">House Edge</p>
              <p
                className="text-base font-bold"
                style={{ color: liveHouseEdge < 0 ? '#f87171' : liveHouseEdge < 5 ? '#fbbf24' : '#e2e8f0' }}
              >
                {liveHouseEdge.toFixed(2)}%
              </p>
            </div>
            <div>
              <p className="text-[10px] text-muted-foreground">Drift from Target</p>
              <p
                className="text-base font-bold"
                style={{ color: Math.abs(liveRtpDelta) < 5 ? '#34d399' : Math.abs(liveRtpDelta) < 10 ? '#fbbf24' : '#f87171' }}
              >
                {liveRtpDelta >= 0 ? '+' : ''}{liveRtpDelta.toFixed(2)}%
              </p>
            </div>
          </div>

          {!totalIsValid && (
            <p className="text-xs text-red-400 font-medium">
              ⛔ Probabilities sum to {totalLocalPcts.toFixed(1)}% — must be exactly 100% before saving.
            </p>
          )}
          {totalIsValid && !rtpIsValid && (
            <p className="text-xs text-red-400 font-medium">
              ⛔ House edge is negative — the platform will lose money on every spin. Fix segment weights first.
            </p>
          )}
          {totalIsValid && rtpIsValid && previewStatus === 'warn' && (
            <p className="text-xs text-amber-400 font-medium">
              ⚠️ Computed RTP deviates from target by {Math.abs(liveRtpDelta).toFixed(1)}%. Adjust weights or the RTP target.
            </p>
          )}
          {totalIsValid && rtpIsValid && previewStatus === 'ok' && (
            <p className="text-xs text-emerald-400 font-medium">✓ Configuration looks healthy.</p>
          )}
        </div>
      )}

      {/* ── Footer actions ── */}
      <div className="flex items-center justify-end gap-2">
        {isEditing ? (
          <>
            <p className="text-xs text-amber-400 flex items-center gap-1.5 mr-auto">
              <Activity className="h-3 w-3 shrink-0" />
              Unsaved changes
            </p>
            <button
              onClick={handleCancel}
              disabled={updateMutation.isPending}
              className="px-4 py-1.5 text-sm text-muted-foreground hover:text-white rounded-lg border border-[#1e2a4a] transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={updateMutation.isPending || !canSave}
              className="flex items-center gap-1.5 px-4 py-1.5 text-sm font-semibold rounded-lg text-[#07090F] transition-opacity disabled:opacity-40 disabled:cursor-not-allowed"
              style={{ background: canSave ? '#C9961A' : '#4b5563' }}
            >
              <Save className="h-3.5 w-3.5" />
              {updateMutation.isPending ? 'Saving…' : 'Save'}
            </button>
          </>
        ) : (
          <button
            onClick={onOpenEdit}
            className="px-4 py-1.5 text-sm text-muted-foreground hover:text-white rounded-lg border border-[#1e2a4a] transition-colors"
          >
            Edit
          </button>
        )}
      </div>
    </div>
  )
}

// ── Form schemas ──────────────────────────────────────────────────────────────

const segmentSchema = z.object({
  label: z.string().min(1, 'Label required'),
  multiplier: z.string().min(1, 'Multiplier required'),
  probability_weight: z.coerce.number().min(0.1).max(100),
  color: z.string().min(4),
})

const stakeSchema = z.object({
  name: z.string().min(1, 'Name required'),
  wheel_type: z.string().min(1, 'Required'),
  min_stake: z.coerce.number().min(1, 'Required'),
  max_stake: z.coerce.number().min(1, 'Required'),
  rtp_target: z.coerce.number().min(1).max(99),
  is_active: z.boolean(),
  segments: z.array(segmentSchema).min(2, 'At least 2 segments'),
})

type StakeFormValues = z.infer<typeof stakeSchema>

// ── Create / Edit modal ───────────────────────────────────────────────────────

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

  // Loss 75% × 0  +  2× 15% × 2  +  5× 10% × 5  =  80% RTP → matches rtp_target default
  const defaultSegments: StakeFormValues['segments'] = [
    { label: 'Loss', multiplier: '0.00', probability_weight: 75, color: '#3a3a3a' },
    { label: '2×',   multiplier: '2.00', probability_weight: 15, color: '#1A237E' },
    { label: '5×',   multiplier: '5.00', probability_weight: 10, color: '#C9961A' },
  ]

  const {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<StakeFormValues>({
    resolver: zodResolver(stakeSchema),
    defaultValues: isEdit
      ? {
          name:       tier.name,
          wheel_type: tier.wheel_type,
          min_stake:  parseFloat(tier.min_stake),
          max_stake:  parseFloat(tier.max_stake),
          rtp_target: parseFloat(tier.rtp_target),
          is_active:  tier.is_active,
          segments: tier.segments.map((s) => ({
            label:             s.label,
            multiplier:        parseFloat(s.multiplier).toFixed(2),
            probability_weight: parseFloat(s.probability_pct.toFixed(1)),
            color:             s.color,
          })),
        }
      : {
          name:       '',
          wheel_type: 'standard',
          min_stake:  200,
          max_stake:  499,
          rtp_target: 80,
          is_active:  false,
          segments:   defaultSegments,
        },
  })

  const { fields, append, remove } = useFieldArray({ control, name: 'segments' })
  const isActive = watch('is_active')
  // useWatch alongside useFieldArray — watch() returns a stale array ref
  const rtpVal          = useWatch({ control, name: 'rtp_target' }) as number
  const watchedSegments = useWatch({ control, name: 'segments' }) as StakeFormValues['segments']

  // ── Live RTP preview ──────────────────────────────────────────────────────
  const { computedRtp, computedHouseEdge, rtpDelta } = useMemo(() => {
    const segs = watchedSegments ?? []
    const totalWeight = segs.reduce((s, seg) => s + (Number(seg.probability_weight) || 0), 0)
    if (totalWeight === 0) return { computedRtp: 0, computedHouseEdge: 100, rtpDelta: 0 }
    const rtp =
      segs.reduce((sum, seg) => {
        const pct = Number(seg.probability_weight) / totalWeight
        return sum + pct * (parseFloat(String(seg.multiplier)) || 0)
      }, 0) * 100
    const target = parseFloat(String(rtpVal)) || 0
    return { computedRtp: rtp, computedHouseEdge: 100 - rtp, rtpDelta: rtp - target }
  }, [watchedSegments, rtpVal])

  const rtpStatus: 'danger' | 'warn' | 'ok' =
    computedRtp > 100 ? 'danger' : Math.abs(rtpDelta) > 10 ? 'warn' : 'ok'

  const houseEdgeDisplay = Math.max(0, 100 - (parseFloat(String(rtpVal)) || 0))

  // ── Mutations ─────────────────────────────────────────────────────────────
  const createMutation = useMutation({
    mutationFn: (values: StakeFormValues) =>
      rtpApi.create({
        name:          values.name,
        wheel_type:    values.wheel_type,
        currency_type: 'coin',
        min_stake:     String(values.min_stake),
        max_stake:     String(values.max_stake),
        rtp_target:    String(values.rtp_target),
        is_active:     values.is_active,
        segments: values.segments.map((s) => ({
          label:             s.label,
          multiplier:        parseFloat(s.multiplier).toFixed(2),
          probability_weight: s.probability_weight,
          color:             s.color,
        })),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rtp'] })
      toast.success('Wheel created.')
      onClose()
    },
    onError: (err: unknown) => {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message
      toast.error(msg ?? 'Failed to create wheel.')
    },
  })

  const updateMutation = useMutation({
    mutationFn: (values: StakeFormValues) =>
      rtpApi.update(tier!.id, {
        name:      values.name,
        min_stake: String(values.min_stake),
        max_stake: String(values.max_stake),
        rtp_target: String(values.rtp_target),
        is_active:  values.is_active,
        segments: values.segments.map((s, i) => ({
          position:          tier!.segments[i]?.position ?? i,
          label:             s.label,
          color:             s.color,
          multiplier:        parseFloat(s.multiplier).toFixed(2),
          probability_weight: parseFloat(Number(s.probability_weight).toFixed(1)),
        })),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rtp'] })
      toast.success('Wheel updated.')
      onClose()
    },
    onError: (err: unknown) => {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message
      toast.error(msg ?? 'Failed to update wheel.')
    },
  })

  function onSubmit(values: StakeFormValues) {
    const totalWeight = values.segments.reduce((s, seg) => s + seg.probability_weight, 0)
    if (totalWeight === 0) {
      toast.error('Probabilities cannot all be zero.')
      return
    }
    if (Math.abs(totalWeight - 100) > 0.5) {
      toast.error(
        `Segment probabilities must sum to 100% (currently ${totalWeight.toFixed(1)}%). Adjust and try again.`
      )
      return
    }
    if (computedRtp > 100) {
      toast.error(
        `Computed RTP is ${computedRtp.toFixed(1)}% — house edge is negative. Fix segment weights first.`
      )
      return
    }
    isEdit ? updateMutation.mutate(values) : createMutation.mutate(values)
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

          {/* ── Name ── */}
          <div className="space-y-1.5">
            <Label className="text-sm text-muted-foreground">Name</Label>
            <Input
              placeholder="e.g. Entry Stake (₦200 – ₦499)"
              className="border-[#1e2a4a] bg-[#0A0E1E] text-foreground"
              {...register('name')}
            />
            {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
          </div>

          {/* ── Stake range ── */}
          <div className="space-y-1.5">
            <Label className="text-sm text-muted-foreground">Stake Range</Label>
            <div className="flex items-center gap-3">
              <div className="relative flex-1">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">₦</span>
                <Input
                  type="number"
                  placeholder="From"
                  className="border-[#1e2a4a] bg-[#0A0E1E] text-foreground pl-8"
                  {...register('min_stake')}
                />
              </div>
              <span className="text-muted-foreground">—</span>
              <div className="relative flex-1">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">₦</span>
                <Input
                  type="number"
                  placeholder="To"
                  className="border-[#1e2a4a] bg-[#0A0E1E] text-foreground pl-8"
                  {...register('max_stake')}
                />
              </div>
            </div>
            {(errors.min_stake || errors.max_stake) && (
              <p className="text-xs text-destructive">
                {errors.min_stake?.message ?? errors.max_stake?.message}
              </p>
            )}
          </div>

          {/* ── RTP Target + House Edge ── */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-sm text-muted-foreground">RTP Target %</Label>
              <div className="relative">
                <Input
                  type="number"
                  step="0.1"
                  className="border-[#1e2a4a] bg-[#0A0E1E] text-foreground pr-8"
                  {...register('rtp_target', {
                    onChange: (e) => {
                      const v = parseFloat(e.target.value)
                      if (!isNaN(v)) setValue('rtp_target', v)
                    },
                  })}
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">%</span>
              </div>
              {errors.rtp_target && <p className="text-xs text-destructive">{errors.rtp_target.message}</p>}
            </div>
            <div className="space-y-1.5">
              <Label className="text-sm text-muted-foreground">House Edge %</Label>
              <div className="relative">
                <Input
                  type="number"
                  step="0.1"
                  value={houseEdgeDisplay}
                  readOnly
                  className="border-[#1e2a4a] bg-[#0A0E1E] pr-8 cursor-not-allowed"
                  style={{ color: '#C9961A' }}
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">%</span>
              </div>
              <p className="text-[10px] text-muted-foreground">= 100 − RTP Target</p>
            </div>
          </div>

          {/* ── Segments ── */}
          <div
            className="rounded-xl p-4 space-y-3"
            style={{ background: '#0A0E1E', border: '1px solid #1e2a4a' }}
          >
            <div className="flex items-center justify-between">
              <Label className="text-sm text-white font-medium">Segments</Label>
              <button
                type="button"
                className="flex items-center gap-1 text-xs font-medium"
                style={{ color: '#C9961A' }}
                onClick={() =>
                  append({ label: '', multiplier: '0.00', probability_weight: 5, color: '#1A237E' })
                }
              >
                Add <Plus className="h-3.5 w-3.5" />
              </button>
            </div>

            {/* Column headers */}
            <div
              className="grid text-[10px] text-muted-foreground font-medium uppercase tracking-wide px-1"
              style={{ gridTemplateColumns: '1fr 5rem 6rem 1.5rem' }}
            >
              <span>Label</span>
              <span>Multiplier</span>
              <span>Probability</span>
              <span />
            </div>

            <div className="space-y-2">
              {fields.map((field, i) => (
                <div key={field.id} className="flex items-center gap-2">
                  {/* Color swatch */}
                  <label className="shrink-0 cursor-pointer" title="Pick colour">
                    <input type="color" className="sr-only" {...register(`segments.${i}.color`)} />
                    <span
                      className="inline-block w-6 h-6 rounded-md border border-[#1e2a4a]"
                      style={{ background: watch(`segments.${i}.color`) || '#1A237E' }}
                    />
                  </label>

                  {/* Label */}
                  <div className="flex-1">
                    <Input
                      placeholder="e.g. Loss / 2×"
                      className="border-[#1e2a4a] bg-[#0D1220] text-foreground text-sm h-9"
                      {...register(`segments.${i}.label`)}
                    />
                  </div>

                  {/* Multiplier — fully editable, 2 dp */}
                  <div className="w-20 relative">
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder="0.00"
                      className="border-[#1e2a4a] bg-[#0D1220] text-foreground text-sm h-9 pr-6"
                      {...register(`segments.${i}.multiplier`, {
                        onBlur: (e) => {
                          const v = parseFloat(e.target.value)
                          if (!isNaN(v)) setValue(`segments.${i}.multiplier`, v.toFixed(2))
                        },
                      })}
                    />
                    <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">×</span>
                  </div>

                  {/* Probability % */}
                  <div className="w-24 relative">
                    <Input
                      type="number"
                      step="0.1"
                      min="0.1"
                      max="100"
                      placeholder="0.0"
                      className="border-[#1e2a4a] bg-[#0D1220] text-foreground text-sm h-9 pr-8"
                      {...register(`segments.${i}.probability_weight`)}
                    />
                    <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">%</span>
                  </div>

                  {/* Remove */}
                  <button
                    type="button"
                    onClick={() => remove(i)}
                    disabled={fields.length <= 2}
                    className="text-muted-foreground hover:text-destructive transition-colors disabled:opacity-25 disabled:cursor-not-allowed"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>

            {/* Live probability total */}
            {(() => {
              const total = watchedSegments?.reduce(
                (s, seg) => s + (Number(seg.probability_weight) || 0), 0
              ) ?? 0
              const isOk = Math.abs(total - 100) < 0.5
              return (
                <div className="flex items-center justify-between pt-1">
                  <p className="text-xs text-muted-foreground">Probabilities must sum to exactly 100%</p>
                  <span
                    className="text-xs font-semibold tabular-nums"
                    style={{ color: isOk ? '#34d399' : total > 100 ? '#f87171' : '#fbbf24' }}
                  >
                    Total: {total.toFixed(1)}%{isOk ? ' ✓' : total > 100 ? ' — over' : ' — under'}
                  </span>
                </div>
              )
            })()}
          </div>

          {/* ── Status toggle ── */}
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
                  isActive ? 'text-[#07090F]' : 'text-muted-foreground hover:text-foreground'
                }`}
                style={isActive ? { background: '#C9961A' } : {}}
              >
                Active
              </button>
            </div>
          </div>

          {/* ── Live Configuration Preview ── */}
          <div
            className="rounded-xl p-4 space-y-2"
            style={{
              background:
                rtpStatus === 'danger'
                  ? 'rgba(239,68,68,0.08)'
                  : rtpStatus === 'warn'
                  ? 'rgba(251,191,36,0.08)'
                  : 'rgba(52,211,153,0.06)',
              border: `1px solid ${
                rtpStatus === 'danger' ? '#ef444440' : rtpStatus === 'warn' ? '#fbbf2440' : '#34d39940'
              }`,
            }}
          >
            <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
              Configuration Preview
            </p>
            <div className="flex flex-wrap gap-x-6 gap-y-2">
              <div>
                <p className="text-[10px] text-muted-foreground">Computed RTP</p>
                <p
                  className="text-base font-bold"
                  style={{
                    color: rtpStatus === 'danger' ? '#f87171' : rtpStatus === 'warn' ? '#fbbf24' : '#34d399',
                  }}
                >
                  {computedRtp.toFixed(2)}%
                </p>
              </div>
              <div>
                <p className="text-[10px] text-muted-foreground">House Edge</p>
                <p
                  className="text-base font-bold"
                  style={{
                    color: computedHouseEdge < 0 ? '#f87171' : computedHouseEdge < 5 ? '#fbbf24' : '#e2e8f0',
                  }}
                >
                  {computedHouseEdge.toFixed(2)}%
                </p>
              </div>
              <div>
                <p className="text-[10px] text-muted-foreground">Drift from Target</p>
                <p
                  className="text-base font-bold"
                  style={{
                    color:
                      Math.abs(rtpDelta) < 5 ? '#34d399' : Math.abs(rtpDelta) < 10 ? '#fbbf24' : '#f87171',
                  }}
                >
                  {rtpDelta >= 0 ? '+' : ''}{rtpDelta.toFixed(2)}%
                </p>
              </div>
            </div>

            {rtpStatus === 'danger' && (
              <p className="text-xs text-red-400 font-medium">
                ⛔ House edge is negative — the platform will lose money on every spin. Fix the segment weights first.
              </p>
            )}
            {rtpStatus === 'warn' && (
              <p className="text-xs text-amber-400 font-medium">
                ⚠️ Computed RTP deviates from target by {Math.abs(rtpDelta).toFixed(1)}%. Adjust weights or the RTP target.
              </p>
            )}
            {rtpStatus === 'ok' && (
              <p className="text-xs text-emerald-400 font-medium">✓ Configuration looks healthy.</p>
            )}
          </div>

          <Button
            type="submit"
            className="w-full h-11 font-semibold text-[#07090F]"
            style={{
              background: rtpStatus === 'danger' ? '#4b5563' : '#C9961A',
              cursor: rtpStatus === 'danger' ? 'not-allowed' : undefined,
            }}
            disabled={isPending || rtpStatus === 'danger'}
          >
            {isPending ? 'Saving…' : isEdit ? 'Save Changes' : 'Create Wheel'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}

// ── RTPPage ───────────────────────────────────────────────────────────────────

export function RTPPage() {
  const [dialogState, setDialogState] = useState<{ open: boolean; tier?: RTPWheel }>({
    open: false,
  })

  const { data: wheels, isLoading } = useQuery<RTPWheel[]>({
    queryKey: ['rtp'],
    queryFn: rtpApi.list,
  })

  return (
    <>
      <SliderStyles />

      <div className="space-y-5">
        {/* Page header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">RTP Control</h1>
            <p className="text-sm text-muted-foreground">
              Configure spin wheels, segment probabilities, and payout targets.
            </p>
          </div>
          <Button
            onClick={() => setDialogState({ open: true })}
            className="font-semibold text-[#07090F]"
            style={{ background: '#C9961A' }}
          >
            <Plus className="mr-2 h-4 w-4" />
            Create Stake
          </Button>
        </div>

        {/* Legend */}
        <div
          className="flex flex-wrap items-center gap-x-5 gap-y-2 rounded-xl px-4 py-3 text-xs text-muted-foreground"
          style={{ background: '#0D1836', border: '1px solid #1e2a4a' }}
        >
          <span className="font-medium text-white">Reading the stats:</span>
          <span>
            <span className="text-emerald-400 font-semibold">Win Rate</span> — % of spins that land
            on a paying outcome
          </span>
          <span>
            <span className="text-sky-300 font-semibold">RTP Drift</span> — difference between
            computed &amp; target RTP (green = on-target)
          </span>
          <span>
            <span style={{ color: '#C9961A' }} className="font-semibold">
              Est. GGR / 1k
            </span>{' '}
            — expected gross revenue per 1,000 spins at mid-stake
          </span>
        </div>

        {/* Wheel list */}
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-72 w-full rounded-2xl" />
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {(wheels ?? []).map((wheel) => (
              <WheelCard
                key={wheel.id}
                wheel={wheel}
                onOpenEdit={() => setDialogState({ open: true, tier: wheel })}
              />
            ))}
            {(wheels ?? []).length === 0 && (
              <div
                className="py-16 text-center rounded-2xl"
                style={{ background: '#0D1836', border: '1px solid #1e2a4a' }}
              >
                <p className="text-muted-foreground mb-3">No wheels configured yet.</p>
                <Button
                  onClick={() => setDialogState({ open: true })}
                  className="font-semibold text-[#07090F]"
                  style={{ background: '#C9961A' }}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Create First Stake
                </Button>
              </div>
            )}
          </div>
        )}
      </div>

      <StakeModal
        key={dialogState.tier?.id ?? 'create'}
        open={dialogState.open}
        onClose={() => setDialogState({ open: false })}
        tier={dialogState.tier}
      />
    </>
  )
}
