import { useAuthStore } from '@/store/authStore'

/**
 * Returns a function that checks whether the current admin has a given permission.
 *
 * Usage:
 *   const can = useCan()
 *   can('approve_withdrawal')  // true | false
 */
export function useCan() {
  const permissions = useAuthStore((s) => s.adminUser?.permissions ?? [])
  return (action: string): boolean => permissions.includes(action)
}

// ── All permission strings used across the admin dashboard ───────────────────
// View permissions  (controls sidebar visibility + page access)
export const PERM_VIEW_DASHBOARD    = 'view_dashboard'
export const PERM_VIEW_FINANCIALS   = 'view_financials'
export const PERM_VIEW_USERS        = 'view_users'
export const PERM_VIEW_WITHDRAWALS  = 'view_withdrawals'
export const PERM_VIEW_KYC          = 'view_kyc'
export const PERM_VIEW_FRAUD        = 'view_fraud'
export const PERM_VIEW_RTP          = 'view_rtp'
export const PERM_VIEW_CHALLENGES   = 'view_challenges'
export const PERM_VIEW_REFERRALS    = 'view_referrals'
export const PERM_VIEW_AUDIT_LOGS   = 'view_audit_logs'

// Action permissions
export const PERM_APPROVE_WITHDRAWAL = 'approve_withdrawal'
export const PERM_REJECT_WITHDRAWAL  = 'reject_withdrawal'
export const PERM_APPROVE_KYC        = 'approve_kyc'
export const PERM_REJECT_KYC         = 'reject_kyc'
export const PERM_FLAG_USER          = 'flag_user'
export const PERM_DELETE_USER        = 'delete_user'
export const PERM_CREATE_RTP         = 'create_rtp'
export const PERM_EDIT_RTP           = 'edit_rtp'
export const PERM_CREATE_CHALLENGE   = 'create_challenge'
export const PERM_EDIT_CHALLENGE     = 'edit_challenge'
export const PERM_DELETE_CHALLENGE   = 'delete_challenge'
export const PERM_MANAGE_ADMINS      = 'manage_admins'
