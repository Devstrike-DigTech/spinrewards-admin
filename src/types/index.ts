// Auth
export interface AdminTokens {
  access_token: string
  refresh_token: string
}

export interface AdminAccount {
  id: string
  email: string
  display_name: string
  is_staff: boolean
  is_superuser: boolean
}

export interface AdminLoginResponse {
  access_token: string
  refresh_token: string
  token_type: string
  admin: AdminAccount
}

// ── Dashboard ────────────────────────────────────────────────────────────────

export interface DashboardKPIs {
  total_revenue: string
  total_revenue_change_pct: string
  net_profit: string
  current_rtp: string
  house_edge_pct: string          // (total_staked - total_won) / total_staked * 100
  house_edge_change_pct: string
  player_win_rate_pct: string     // winning_spins / total_spins * 100
  player_win_rate_change_pct: string
  active_users: number
  active_users_change_pct: string
  new_users_today: number
}

export interface ProfitTrendPoint {
  month: string
  year: number
  value: string
}

export interface RecentSpin {
  id: string
  user: string
  stake: string
  result: string
  multiplier: string
  win_value: string
  outcome: 'win' | 'loss'
  date: string
}

export interface TopWinner {
  user: string
  win_value: string
}

export interface AdminDashboard {
  kpis: DashboardKPIs
  profit_trend: ProfitTrendPoint[]
  recent_spins: RecentSpin[]
  top_winners: TopWinner[]
}

// ── Financials ───────────────────────────────────────────────────────────────

export interface FinancialsKPIs {
  // Core fields — returned by real API
  total_deposits: string
  total_deposits_change_pct: string
  total_withdrawals: string
  total_withdrawals_change_pct: string
  pending_withdrawals: string
  // Extended fields — returned by real API when ready, optional until then
  total_deposit_count?: number         // number of deposit transactions
  avg_deposit?: string                 // total_deposits / total_deposit_count
  net_cash_position?: string           // total_deposits − total_withdrawals
  withdrawal_pending_count?: number    // number of queued/pending withdrawal requests
  withdrawal_count?: number            // total withdrawal transactions processed
  withdrawal_success_rate?: string     // approved / total * 100
  ggr?: string                         // gross gaming revenue = total_staked − total_won
  ggr_margin_pct?: string              // ggr / total_staked * 100
  withdrawal_rate_pct?: string         // total_withdrawals / total_deposits * 100
}

export interface SpinsBreakdown {
  // Core fields — returned by real API
  total_staked: string
  total_won: string
  house_fees: string
  spin_count_total: number
  spin_count_wins: number
  spin_count_losses: number
  // Extended fields — optional until backend adds them
  avg_stake?: string                   // total_staked / spin_count_total
  win_rate_pct?: string                // spin_count_wins / spin_count_total * 100
}

export interface CashFlowPoint {
  month: string
  year: number
  value: string
}

export interface AdminFinancials {
  kpis: FinancialsKPIs
  spins_breakdown: SpinsBreakdown
  cash_flow: {
    deposits: CashFlowPoint[]
    withdrawals: CashFlowPoint[]
  }
  ggr_trend?: CashFlowPoint[]          // optional until backend adds it
}

// ── RTP ──────────────────────────────────────────────────────────────────────

export interface RTPSegment {
  position: number
  label: string
  multiplier: string
  probability_weight: number
  probability_pct: number
  color: string
  is_active: boolean
}

export interface RTPWheel {
  id: string
  name: string
  wheel_type: string
  min_stake: string
  max_stake: string
  rtp_target: string
  computed_rtp: string
  house_edge: string
  is_active: boolean
  total_spins: number
  segments: RTPSegment[]
}

export interface CreateRTPSegment {
  label: string
  multiplier: string
  probability_weight: number
  color: string
}

export interface CreateRTPPayload {
  name: string
  wheel_type: string
  currency_type: string
  min_stake: string
  max_stake: string
  rtp_target: string
  is_active: boolean
  segments: CreateRTPSegment[]
}

export interface UpdateRTPPayload {
  is_active?: boolean
  segments?: { position: number; probability_weight: number }[]
}

// ── Users ────────────────────────────────────────────────────────────────────

export interface UsersOverview {
  total_users: number
  flagged_accounts: number
  pending_kyc: number
}

export interface AdminUser {
  id: string
  telegram_id: number
  name: string
  phone_number: string
  registered_on: string
  registered_via: string
  balance: string
  staked: string
  kyc_status: string   // "Done" | "Pending" | "Rejected"
  risk: string         // "Low" | "Medium" | "High"
  is_active: boolean
}

export interface AdminUserKYC {
  overall_status: string
  display_status: string
  personal_info_status: string
  bank_account_status: string
  document_status: string
  submitted_at: string
}

export interface AdminUserBankAccount {
  bank_name: string
  account_name: string
  account_number_masked: string
  verified_at: string
}

export interface AdminUserDetail {
  id: string
  telegram_id: number
  name: string
  registered_on: string
  registered_via: string
  last_login: string
  cash_balance: string
  coin_balance: string
  total_balance: string
  staked: string
  kyc: AdminUserKYC
  risk: string
  bank_account: AdminUserBankAccount | null
  is_active: boolean
  is_staff: boolean
}

export interface UserSpinRecord {
  id: string
  wheel: string
  stake: string
  result_label: string
  multiplier: string
  outcome: 'win' | 'loss'
  win_value: string
  is_welcome_spin: boolean
  date: string
}

export interface UserTransaction {
  id: string
  type: string
  label: string
  amount: string
  is_credit: boolean
  balance_type: string
  balance_before: string
  balance_after: string
  status: string
  date: string
}

// ── Withdrawals ──────────────────────────────────────────────────────────────

export type WithdrawalStatus =
  | 'pending_review'
  | 'pending'
  | 'processing'
  | 'completed'
  | 'failed'
  | 'rejected'
  | 'cancelled'

export interface WithdrawalsOverview {
  total_pending: string
  total_paid: string
  queued: number
}

export interface AdminWithdrawal {
  id: string
  name: string
  user_id: string
  amount: string
  net_amount: string
  bank: string
  account_masked: string
  type: string
  risk: string
  status: WithdrawalStatus
  status_display: string
  requires_review: boolean
  forced_manual_review: boolean
  reference: string
  requested_at: string
  completed_at: string | null
  failure_reason: string
}

// ── KYC Queue ────────────────────────────────────────────────────────────────

export type KYCSectionStatus = 'pending' | 'verified' | 'requires_correction' | 'rejected'

export interface KYCSectionInfo {
  status: KYCSectionStatus
  reason: string
  bank_name?: string
  account_name?: string
  account_masked?: string
  filename?: string
  document_type?: string
  file_url?: string
}

export interface AdminKYCQueueItem {
  id: string
  user_id: string
  telegram_id: number
  name: string
  overall_status: string
  can_withdraw: boolean
  sections: {
    personal_info: KYCSectionInfo
    bank_account: KYCSectionInfo
    document: KYCSectionInfo
  }
  submitted_at: string
  last_resubmission_at: string | null
}

export interface KYCQueueOverview {
  total_pending: number
  total_approved: number
  total_rejected: number
}

// ── Fraud ────────────────────────────────────────────────────────────────────

export interface FraudFlaggedUser {
  user_id: string
  name: string
  telegram_id: number
  flag: string
  risk: string
  flag_type: string
}

export interface FraudData {
  total_flagged: number
  flagged_users: FraudFlaggedUser[]
}

// ── Audit Log ────────────────────────────────────────────────────────────────

export interface AuditLogEntry {
  id: string
  type: string
  action: string
  detail: string
  target_user: string
  target_user_id?: string
  performed_by: string
  notes?: string
  timestamp: string
  timestamp_display: string
}

// ── Paginated responses ──────────────────────────────────────────────────────

export interface PaginatedResponse<T> {
  count: number
  next: string | null
  previous: string | null
  results: T[]
}

export interface UsersListResponse extends PaginatedResponse<AdminUser> {
  overview: UsersOverview
}

export interface WithdrawalsListResponse extends PaginatedResponse<AdminWithdrawal> {
  overview: WithdrawalsOverview
}

export interface KYCQueueListResponse extends PaginatedResponse<AdminKYCQueueItem> {
  overview: KYCQueueOverview
}

// Legacy aliases so mock data compiles without a full rewrite
/** @deprecated Use AdminWithdrawal */
export type WithdrawalRecord = AdminWithdrawal
/** @deprecated Use AdminKYCQueueItem */
export type KYCRecord = AdminKYCQueueItem
/** @deprecated Use RTPWheel */
export type RTPTierFull = RTPWheel & { outcomes?: RTPSegment[]; created_by?: string }
