import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { Plus, X, Pencil, Trash2, ShieldCheck } from 'lucide-react'
import { adminMembersApi } from '@/api/index'
import { useAuthStore } from '@/store/authStore'
import type { AdminMember, AdminRole } from '@/types'
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

// ── Helpers ───────────────────────────────────────────────────────────────────

/** Split a display_name into [firstName, lastName] for the table */
function splitName(displayName: string): [string, string] {
  const parts = displayName.trim().split(/\s+/)
  if (parts.length === 1) return [parts[0], '']
  return [parts[0], parts.slice(1).join(' ')]
}

/** Role-derived description shown in the table Description column */
const ROLE_DESCRIPTIONS: Record<string, string> = {
  super_admin:   'Has access to all modules including edit and delete options',
  finance_admin: 'Has access to finance and withdrawals modules including approval actions',
  support_admin: 'Has access to users and KYC modules including freeze and approve actions',
  risk_admin:    'Has access to fraud and risk modules including flag and audit actions',
  read_only:     'View-only access to all dashboard modules',
}

function roleDescription(role: string): string {
  return ROLE_DESCRIPTIONS[role] ?? 'Custom role with selected permissions'
}

/** Capitalise first letter of every word */
function titleCase(s: string): string {
  return s.replace(/\b\w/g, (c) => c.toUpperCase())
}

// ── Static fallback roles (used while API loads) ──────────────────────────────

const FALLBACK_ROLES: AdminRole[] = [
  { value: 'super_admin',   label: 'Super Admin',   permissions: [] },
  { value: 'finance_admin', label: 'Finance Admin', permissions: [] },
  { value: 'support_admin', label: 'Support Admin', permissions: [] },
  { value: 'risk_admin',    label: 'Risk Admin',    permissions: [] },
  { value: 'read_only',     label: 'Read Only',     permissions: [] },
]

// ── Form schemas ──────────────────────────────────────────────────────────────

const createSchema = z.object({
  first_name: z.string().min(1, 'First name required'),
  last_name:  z.string().min(1, 'Last name required'),
  email:      z.string().email('Valid email required'),
  password:   z.string().min(8, 'Minimum 8 characters'),
  role:       z.string().min(1, 'Role required'),
})

const editSchema = z.object({
  first_name: z.string().min(1, 'First name required'),
  last_name:  z.string().min(1, 'Last name required'),
  email:      z.string().email('Valid email required'),
  role:       z.string().min(1, 'Role required'),
})

type CreateFormValues = z.infer<typeof createSchema>
type EditFormValues   = z.infer<typeof editSchema>

// ── Add Admin Modal ───────────────────────────────────────────────────────────

function AddAdminModal({
  open,
  onClose,
  roles,
}: {
  open: boolean
  onClose: () => void
  roles: AdminRole[]
}) {
  const queryClient = useQueryClient()

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm<CreateFormValues>({
    resolver: zodResolver(createSchema),
    defaultValues: { first_name: '', last_name: '', email: '', password: '', role: '' },
  })

  const selectedRole = watch('role')

  const createMutation = useMutation({
    mutationFn: (values: CreateFormValues) =>
      adminMembersApi.create({
        display_name: `${values.first_name} ${values.last_name}`.trim(),
        email:    values.email,
        password: values.password,
        role:     values.role,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-members'] })
      toast.success('Admin created successfully.')
      reset()
      onClose()
    },
    onError: (err: unknown) => {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message
      toast.error(msg ?? 'Failed to create admin.')
    },
  })

  function handleClose() {
    reset()
    onClose()
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent
        className="max-w-md border-[#1e2a4a] p-0"
        style={{ background: '#0D1836' }}
      >
        <DialogHeader className="flex flex-row items-center justify-between p-6 pb-4 border-b border-[#1e2a4a]">
          <DialogTitle className="text-white text-lg font-semibold">Add Admin</DialogTitle>
          <button onClick={handleClose} className="text-muted-foreground hover:text-white transition-colors">
            <X className="h-5 w-5" />
          </button>
        </DialogHeader>

        <form onSubmit={handleSubmit((v) => createMutation.mutate(v))} className="p-6 space-y-4">
          {/* First Name */}
          <div className="space-y-1.5">
            <Label className="text-sm text-muted-foreground">First Name</Label>
            <Input
              placeholder="e.g. Richard"
              className="border-[#1e2a4a] bg-[#0A0E1E] text-foreground h-11"
              {...register('first_name')}
            />
            {errors.first_name && <p className="text-xs text-destructive">{errors.first_name.message}</p>}
          </div>

          {/* Last Name */}
          <div className="space-y-1.5">
            <Label className="text-sm text-muted-foreground">Last Name</Label>
            <Input
              placeholder="e.g. Uzor"
              className="border-[#1e2a4a] bg-[#0A0E1E] text-foreground h-11"
              {...register('last_name')}
            />
            {errors.last_name && <p className="text-xs text-destructive">{errors.last_name.message}</p>}
          </div>

          {/* Email */}
          <div className="space-y-1.5">
            <Label className="text-sm text-muted-foreground">Email Address</Label>
            <Input
              type="email"
              placeholder="admin@spinrewards.com"
              className="border-[#1e2a4a] bg-[#0A0E1E] text-foreground h-11"
              {...register('email')}
            />
            {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
          </div>

          {/* Password */}
          <div className="space-y-1.5">
            <Label className="text-sm text-muted-foreground">Password</Label>
            <Input
              type="password"
              placeholder="Min. 8 characters"
              className="border-[#1e2a4a] bg-[#0A0E1E] text-foreground h-11"
              {...register('password')}
            />
            {errors.password && <p className="text-xs text-destructive">{errors.password.message}</p>}
          </div>

          {/* Role */}
          <div className="space-y-1.5">
            <Label className="text-sm text-muted-foreground">Role</Label>
            <div className="relative">
              <select
                className="w-full h-11 rounded-md border border-[#1e2a4a] bg-[#0A0E1E] text-foreground text-sm px-3 appearance-none cursor-pointer focus:outline-none focus:ring-1 focus:ring-[#C9961A]"
                {...register('role')}
              >
                <option value="">Select</option>
                {roles.map((r) => (
                  <option key={r.value} value={r.value}>{r.label}</option>
                ))}
              </select>
              <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground text-xs">▾</span>
            </div>
            {errors.role && <p className="text-xs text-destructive">{errors.role.message}</p>}
            {selectedRole && (
              <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                {titleCase(roleDescription(selectedRole))}
              </p>
            )}
          </div>

          <Button
            type="submit"
            disabled={createMutation.isPending}
            className="w-full h-11 font-semibold text-[#07090F] mt-2"
            style={{ background: '#C9961A' }}
          >
            {createMutation.isPending ? 'Creating…' : 'Submit'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}

// ── Edit Admin Modal ──────────────────────────────────────────────────────────

function EditAdminModal({
  open,
  onClose,
  member,
  roles,
}: {
  open: boolean
  onClose: () => void
  member: AdminMember
  roles: AdminRole[]
}) {
  const queryClient  = useQueryClient()
  const currentAdmin = useAuthStore((s) => s.adminUser)
  const isSelf       = currentAdmin?.id === member.id

  const [firstName, lastName] = splitName(member.display_name)

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<EditFormValues>({
    resolver: zodResolver(editSchema),
    defaultValues: {
      first_name: firstName,
      last_name:  lastName,
      email:      member.email,
      role:       member.role,
    },
  })

  const selectedRole = watch('role')

  const updateMutation = useMutation({
    mutationFn: (values: EditFormValues) =>
      adminMembersApi.update(member.id, {
        display_name: `${values.first_name} ${values.last_name}`.trim(),
        role:         values.role,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-members'] })
      toast.success('Admin updated.')
      onClose()
    },
    onError: (err: unknown) => {
      const msg = (err as { response?: { data?: { message?: string; code?: string } } })?.response?.data?.message
      const code = (err as { response?: { data?: { code?: string } } })?.response?.data?.code
      if (code === 'CANNOT_CHANGE_OWN_ROLE') {
        toast.error("You can't change your own role.")
      } else {
        toast.error(msg ?? 'Failed to update admin.')
      }
    },
  })

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent
        className="max-w-md border-[#1e2a4a] p-0"
        style={{ background: '#0D1836' }}
      >
        <DialogHeader className="flex flex-row items-center justify-between p-6 pb-4 border-b border-[#1e2a4a]">
          <DialogTitle className="text-white text-lg font-semibold">Edit Admin</DialogTitle>
          <button onClick={onClose} className="text-muted-foreground hover:text-white transition-colors">
            <X className="h-5 w-5" />
          </button>
        </DialogHeader>

        <form onSubmit={handleSubmit((v) => updateMutation.mutate(v))} className="p-6 space-y-4">
          {/* First Name */}
          <div className="space-y-1.5">
            <Label className="text-sm text-muted-foreground">First Name</Label>
            <Input
              className="border-[#1e2a4a] bg-[#0A0E1E] text-foreground h-11"
              {...register('first_name')}
            />
            {errors.first_name && <p className="text-xs text-destructive">{errors.first_name.message}</p>}
          </div>

          {/* Last Name */}
          <div className="space-y-1.5">
            <Label className="text-sm text-muted-foreground">Last Name</Label>
            <Input
              className="border-[#1e2a4a] bg-[#0A0E1E] text-foreground h-11"
              {...register('last_name')}
            />
            {errors.last_name && <p className="text-xs text-destructive">{errors.last_name.message}</p>}
          </div>

          {/* Email (read-only in edit mode — changing email is a separate security action) */}
          <div className="space-y-1.5">
            <Label className="text-sm text-muted-foreground">Email Address</Label>
            <Input
              type="email"
              readOnly
              className="border-[#1e2a4a] bg-[#0A0E1E] text-muted-foreground h-11 cursor-not-allowed"
              {...register('email')}
            />
            <p className="text-[10px] text-muted-foreground">Email cannot be changed after creation.</p>
          </div>

          {/* Role */}
          <div className="space-y-1.5">
            <Label className="text-sm text-muted-foreground">Role</Label>
            <div className="relative">
              <select
                disabled={isSelf}
                className="w-full h-11 rounded-md border border-[#1e2a4a] bg-[#0A0E1E] text-foreground text-sm px-3 appearance-none cursor-pointer focus:outline-none focus:ring-1 focus:ring-[#C9961A] disabled:opacity-50 disabled:cursor-not-allowed"
                {...register('role')}
              >
                {roles.map((r) => (
                  <option key={r.value} value={r.value}>{r.label}</option>
                ))}
              </select>
              <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground text-xs">▾</span>
            </div>
            {isSelf && (
              <p className="text-xs text-amber-400">You cannot change your own role.</p>
            )}
            {selectedRole && !isSelf && (
              <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                {titleCase(roleDescription(selectedRole))}
              </p>
            )}
          </div>

          <Button
            type="submit"
            disabled={updateMutation.isPending}
            className="w-full h-11 font-semibold text-[#07090F] mt-2"
            style={{ background: '#C9961A' }}
          >
            {updateMutation.isPending ? 'Saving…' : 'Submit'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}

// ── Confirm Delete Dialog ─────────────────────────────────────────────────────

function ConfirmDeleteDialog({
  open,
  onClose,
  member,
}: {
  open: boolean
  onClose: () => void
  member: AdminMember
}) {
  const queryClient = useQueryClient()

  const deleteMutation = useMutation({
    mutationFn: () => adminMembersApi.deactivate(member.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-members'] })
      toast.success(`${member.display_name} has been removed.`)
      onClose()
    },
    onError: (err: unknown) => {
      const msg = (err as { response?: { data?: { message?: string; code?: string } } })?.response?.data?.message
      const code = (err as { response?: { data?: { code?: string } } })?.response?.data?.code
      if (code === 'CANNOT_DEACTIVATE_SELF') {
        toast.error("You can't remove your own account.")
      } else {
        toast.error(msg ?? 'Failed to remove admin.')
      }
    },
  })

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent
        className="max-w-sm border-[#1e2a4a] p-0"
        style={{ background: '#0D1836' }}
      >
        <DialogHeader className="flex flex-row items-center justify-between p-6 pb-4 border-b border-[#1e2a4a]">
          <DialogTitle className="text-white text-base font-semibold">Confirm Delete</DialogTitle>
          <button onClick={onClose} className="text-muted-foreground hover:text-white transition-colors">
            <X className="h-5 w-5" />
          </button>
        </DialogHeader>

        <div className="p-6 space-y-5">
          <p className="text-sm text-muted-foreground">
            Are you sure you want to delete{' '}
            <span className="text-white font-medium">{member.display_name}</span>?
            Their account will be deactivated.
          </p>
          <div className="flex gap-3">
            <button
              onClick={onClose}
              disabled={deleteMutation.isPending}
              className="flex-1 h-11 rounded-lg border border-[#1e2a4a] text-white text-sm font-medium hover:bg-white/5 transition-colors disabled:opacity-50"
            >
              No
            </button>
            <button
              onClick={() => deleteMutation.mutate()}
              disabled={deleteMutation.isPending}
              className="flex-1 h-11 rounded-lg font-semibold text-sm transition-opacity disabled:opacity-60"
              style={{ background: '#C9961A', color: '#07090F' }}
            >
              {deleteMutation.isPending ? 'Removing…' : 'Yes'}
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

// ── AdminPage ─────────────────────────────────────────────────────────────────

type ModalState =
  | { type: 'none' }
  | { type: 'add' }
  | { type: 'edit';   member: AdminMember }
  | { type: 'delete'; member: AdminMember }

export function AdminPage() {
  const currentAdmin = useAuthStore((s) => s.adminUser)
  const canManage    = currentAdmin?.permissions?.includes('manage_admins') ?? false

  const [modal, setModal] = useState<ModalState>({ type: 'none' })

  // ── Queries ──────────────────────────────────────────────────────────────
  const { data: rolesData } = useQuery<AdminRole[]>({
    queryKey: ['admin-roles'],
    queryFn:  adminMembersApi.roles,
    staleTime: Infinity,
  })
  const roles = rolesData ?? FALLBACK_ROLES

  const { data: membersData, isLoading } = useQuery({
    queryKey: ['admin-members'],
    queryFn:  () => adminMembersApi.list(),
  })
  const members: AdminMember[] = membersData?.results ?? []

  // ── Access guard ─────────────────────────────────────────────────────────
  if (!canManage) {
    return (
      <div className="space-y-5">
        <div>
          <h1 className="text-2xl font-bold text-white">Admin</h1>
          <p className="text-sm text-muted-foreground">Admin account management</p>
        </div>
        <div
          className="flex flex-col items-center justify-center py-24 rounded-2xl text-center"
          style={{ background: '#0D1836', border: '1px solid #1e2a4a' }}
        >
          <ShieldCheck className="h-12 w-12 text-muted-foreground mb-4" />
          <p className="text-white font-semibold mb-1">Access Restricted</p>
          <p className="text-sm text-muted-foreground max-w-xs">
            Only Super Admins can manage admin accounts.
          </p>
        </div>
      </div>
    )
  }

  return (
    <>
      <div className="space-y-5">
        {/* ── Page header ── */}
        <div>
          <h1 className="text-2xl font-bold text-white">Admin</h1>
          <p className="text-sm text-muted-foreground">Manage admin accounts and role permissions</p>
        </div>

        {/* ── Table card ── */}
        <div
          className="rounded-2xl overflow-hidden"
          style={{ background: '#0D1836', border: '1px solid #1e2a4a' }}
        >
          {/* Table header row */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-[#1e2a4a]">
            <h2 className="text-base font-semibold text-white">All Admins</h2>
            <button
              onClick={() => setModal({ type: 'add' })}
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-[#07090F] transition-opacity hover:opacity-90"
              style={{ background: '#C9961A' }}
            >
              <Plus className="h-4 w-4" />
              Add Admin
            </button>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr style={{ background: 'rgba(10,14,30,0.6)' }}>
                  {['First Name', 'Last Name', 'Email Address', 'Role', 'Description', 'Action'].map((h) => (
                    <th
                      key={h}
                      className="text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground px-5 py-3 whitespace-nowrap"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  Array.from({ length: 3 }).map((_, i) => (
                    <tr key={i} className="border-t border-[#1e2a4a]">
                      {Array.from({ length: 6 }).map((__, j) => (
                        <td key={j} className="px-5 py-4">
                          <Skeleton className="h-4 w-full rounded" />
                        </td>
                      ))}
                    </tr>
                  ))
                ) : members.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-5 py-16 text-center text-muted-foreground">
                      No admins found.
                    </td>
                  </tr>
                ) : (
                  members.map((member) => {
                    const [fName, lName] = splitName(member.display_name)
                    const isSelf = currentAdmin?.id === member.id
                    return (
                      <tr
                        key={member.id}
                        className="border-t border-[#1e2a4a] transition-colors hover:bg-white/[0.02]"
                      >
                        <td className="px-5 py-4 text-white font-medium">{fName}</td>
                        <td className="px-5 py-4 text-white">{lName || '—'}</td>
                        <td className="px-5 py-4 text-muted-foreground lowercase">{member.email}</td>
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-2">
                            <Badge
                              variant={member.is_active ? 'success' : 'secondary'}
                              className="text-xs whitespace-nowrap"
                            >
                              {member.role_label}
                            </Badge>
                            {isSelf && (
                              <span className="text-[10px] text-amber-400 font-medium">(you)</span>
                            )}
                          </div>
                        </td>
                        <td className="px-5 py-4 text-muted-foreground max-w-xs">
                          <span className="leading-relaxed">
                            {titleCase(roleDescription(member.role))}
                          </span>
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => setModal({ type: 'edit', member })}
                              className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold text-white transition-opacity hover:opacity-80"
                              style={{ background: '#1a8a3a' }}
                            >
                              <Pencil className="h-3 w-3" />
                              Edit
                            </button>
                            <button
                              onClick={() => setModal({ type: 'delete', member })}
                              disabled={isSelf}
                              className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold text-white transition-opacity hover:opacity-80 disabled:opacity-30 disabled:cursor-not-allowed"
                              style={{ background: '#b91c1c' }}
                              title={isSelf ? "You can't remove your own account" : 'Remove admin'}
                            >
                              <Trash2 className="h-3 w-3" />
                              Remove
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Member count footer */}
          {!isLoading && members.length > 0 && (
            <div className="px-5 py-3 border-t border-[#1e2a4a]">
              <p className="text-xs text-muted-foreground">
                {members.length} admin{members.length !== 1 ? 's' : ''} total
              </p>
            </div>
          )}
        </div>
      </div>

      {/* ── Modals ── */}
      <AddAdminModal
        open={modal.type === 'add'}
        onClose={() => setModal({ type: 'none' })}
        roles={roles}
      />

      {modal.type === 'edit' && (
        <EditAdminModal
          open
          onClose={() => setModal({ type: 'none' })}
          member={modal.member}
          roles={roles}
        />
      )}

      {modal.type === 'delete' && (
        <ConfirmDeleteDialog
          open
          onClose={() => setModal({ type: 'none' })}
          member={modal.member}
        />
      )}
    </>
  )
}
