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
  net_profit_ggr: string              // total_staked − total_won (GGR)
  net_profit_ggr_change_pct: string
  realized_house_edge_pct: string     // (total_staked − total_won) / total_staked × 100
  player_win_rate_pct: string         // winning_spins / total_spins × 100
  total_spins: number
  winning_spins: number
  active_users: number
  new_users_today: number
}

export interface DashboardGraphPoint {
  day?: number       // present when endpoint is called with a specific month
  month: string
  year: number
  staked: string
  won: string
  ggr: string
  spins: number
}

/** @deprecated Use DashboardGraphPoint */
export type ProfitTrendPoint = DashboardGraphPoint

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
  graph: DashboardGraphPoint[]
  recent_spins: RecentSpin[]
  top_winners: TopWinner[]
}

// ── Financials ───────────────────────────────────────────────────────────────

export interface FinancialsCashFlowPoint {
  day?: number | null
  month: string
  year: number
  count: number
  amount: string
}

export interface FinancialsGGRPoint {
  day?: number | null
  month: string
  year: number
  ggr: string
  staked: string
  won: string
}

export interface AdminFinancials {
  period: string
  year: number
  month: string | null
  deposits: {
    total_amount: string
    total_amount_change_pct: string
    total_transactions: number
    average_per_deposit: string
    net_position: string
  }
  withdrawals: {
    total_amount: string
    total_amount_change_pct: string
    pct_of_deposits: string
    pending_amount: string
    pending_queue_count: number
    success_rate_pct: string
  }
  spins: {
    total_spins: number
    win_rate_pct: string
    wins_count: number
    losses_count: number
    average_stake_per_spin: string
  }
  ggr: {
    ggr_amount: string
    ggr_change_pct: string
    ggr_margin_pct: string
    total_staked: string
    total_won: string
    average_stake_per_spin: string
  }
  cash_flow: {
    deposits: FinancialsCashFlowPoint[]
    withdrawals: FinancialsCashFlowPoint[]
  }
  spin_breakdown: {
    total_ggr: string
    total_won_by_players: string
    total_staked: string
  }
  ggr_trend: FinancialsGGRPoint[]
}

/** @deprecated — kept so mock data file compiles without rewrite */
export interface CashFlowPoint {
  month: string
  year: number
  value: string
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
  banned_accounts?: number
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

// ── Challenges ───────────────────────────────────────────────────────────────

export interface AdminChallenge {
  id: string
  name: string
  description: string
  type: string
  recurrence: string
  criteria: Record<string, unknown>
  reward: {
    type: string
    amount: number
  }
  is_active: boolean
  is_visible: boolean
  max_completions_per_user: number | null
  starts_at: string | null
  expires_at: string | null
  created_at: string
  participant_count: number
  completion_count: number
}

export interface CreateChallengePayload {
  name: string
  description?: string
  type: string
  recurrence: string
  criteria: Record<string, unknown>
  reward: { type: string; amount: number }
  max_completions_per_user?: number | null
  is_active?: boolean
  is_visible?: boolean
  starts_at?: string | null
  expires_at?: string | null
}

export interface ChallengeParticipant {
  user_id: string
  name: string
  telegram_id: number
  current_count: number
  target_count: number
  progress_pct: number
  is_completed: boolean
  completed_at: string | null
  reward_claimed: boolean
  window_start: string
}

export interface ChallengeCompletion {
  user_id: string
  name: string
  telegram_id: number
  completed_at: string
  reward_claimed: boolean
  reward_claimed_at: string | null
  window_start: string
}

export interface ChallengesListResponse extends PaginatedResponse<AdminChallenge> {}

// ── Referrals ────────────────────────────────────────────────────────────────

export interface AdminReferral {
  id: string
  referrer: {
    id: string
    name: string
    telegram_id: number
  }
  referred_user: {
    id: string
    name: string
    telegram_id: number
  }
  code: string
  status: 'pending' | 'qualified' | 'rewarded' | 'rejected'
  qualified_at: string | null
  rewarded_at: string | null
  reward_snapshot: Record<string, unknown>
  created_at: string
}

export interface ReferralsOverview {
  total: number
  pending: number
  qualified: number
  rewarded: number
}

export interface ReferralsListResponse {
  overview: ReferralsOverview
  count: number
  next: string | null
  previous: string | null
  results: AdminReferral[]
}

// ── User Rewards (for UserDetailPage) ────────────────────────────────────────

export interface UserChallengeProgress {
  challenge_id: string
  challenge_name: string
  challenge_type: string
  recurrence: string
  reward: { type: string; amount: number }
  current_count: number
  target_count: number
  progress_pct: number
  is_completed: boolean
  completed_at: string | null
  reward_claimed: boolean
  reward_claimed_at: string | null
}

export interface UserReferralEntry {
  id: string
  referred_user: {
    id: string
    name: string
    telegram_id: number
  }
  code: string
  status: 'pending' | 'qualified' | 'rewarded' | 'rejected'
  qualified_at: string | null
  rewarded_at: string | null
  created_at: string
}

export interface UserRewardsData {
  challenges: UserChallengeProgress[]
  referrals: {
    stats: { total_referrals: number; pending: number; qualified: number; rewarded: number }
    referrals: UserReferralEntry[]
  }
}

// Legacy aliases so mock data compiles without a full rewrite
/** @deprecated Use AdminWithdrawal */
export type WithdrawalRecord = AdminWithdrawal
/** @deprecated Use AdminKYCQueueItem */
export type KYCRecord = AdminKYCQueueItem
/** @deprecated Use RTPWheel */
export type RTPTierFull = RTPWheel & { outcomes?: RTPSegment[]; created_by?: string }
