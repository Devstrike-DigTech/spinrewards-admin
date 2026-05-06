// Auth
export interface AdminTokens {
  access: string
  refresh: string
}

// Users
export interface AdminUser {
  id: string
  telegram_id: string
  first_name: string
  last_name: string
  username: string
  phone_number: string
  is_banned: boolean
  is_kyc_verified: boolean
  kyc_status: 'unverified' | 'pending' | 'approved' | 'rejected'
  referral_code: string
  coin_balance: string
  cash_balance: string
  total_spins: number
  total_staked: string
  risk_level: 'low' | 'medium' | 'high'
  created_at: string
}

// KYC
export type KYCStatus = 'unverified' | 'pending' | 'approved' | 'rejected'

export interface KYCRecord {
  id: string
  user: {
    id: string
    telegram_id: string
    first_name: string
    last_name: string
    username: string
  }
  status: KYCStatus
  bank_name: string
  account_number: string
  account_name: string
  submitted_at: string
  reviewed_at: string | null
  rejection_reason: string | null
}

// Withdrawals
export type WithdrawalStatus = 'pending' | 'processing' | 'completed' | 'failed'

export interface WithdrawalRecord {
  id: string
  user: {
    id: string
    first_name: string
    last_name: string
    username: string
  }
  amount: string
  status: WithdrawalStatus
  bank_name: string
  account_number: string
  account_name: string
  provider_reference: string | null
  created_at: string
}

// RTP
export interface RTPOutcome {
  id: string
  label: string
  multiplier: string
  probability: string
  color: string
  showCoin?: boolean
}

export interface RTPTier {
  id: string
  min_stake: string
  max_stake: string
  rtp_target: string
  outcomes: RTPOutcome[]
}

export interface RTPTierPayload {
  min_stake: number
  max_stake: number
  rtp_target: number
  outcomes: Omit<RTPOutcome, 'id'>[]
}

// Extended RTP tier (matches Create Stake modal)
export interface RTPTierFull {
  id: string
  name: string
  wheel_type: string
  min_stake: string
  max_stake: string
  house_edge: string
  rtp_target: string
  is_active: boolean
  created_by: string
  outcomes: RTPOutcome[]
}

export interface CreateStakePayload {
  name: string
  description: string
  min_stake: number
  max_stake: number
  house_edge: number
  rtp_target: number
  is_active: boolean
  outcomes: { multiplier: string; probability: number }[]
}

// Analytics
export interface AdminAnalyticsSummary {
  total_users: number
  total_spins_today: number
  gross_revenue_today: string
  net_profit_today: string
  current_rtp: string
  pending_withdrawals_count: number
  pending_withdrawals_amount: string
  pending_kyc_count: number
  flagged_accounts: number
  active_users: number
  new_users_today: number
  total_revenue: string
  net_profit: string
}

// AnalyticsSummary is the same as AdminAnalyticsSummary for full compatibility
export type AnalyticsSummary = AdminAnalyticsSummary

export interface MonthlyDataPoint {
  month: string
  revenue: number
  profit: number
  spins: number
}

export interface CashFlowDataPoint {
  month: string
  deposits: number
  withdrawals: number
}

export interface RevenueDataPoint {
  date: string
  revenue: number
  spins: number
}

export interface RecentSpin {
  id: string
  user_name: string
  stake: string
  multiplier: string
  result_label: string
  win_value: string
  outcome: 'win' | 'loss' | 'push' | 'partial_loss'
  created_at: string
}

export interface UserTransaction {
  id: string
  type: 'deposit' | 'withdrawal' | 'spin_stake' | 'spin_payout' | 'reward'
  description: string
  amount: string
  created_at: string
}

export interface UserSpinRecord {
  id: string
  stake_amount: string
  segment_label: string
  multiplier: string
  payout_amount: string
  outcome: 'win' | 'loss' | 'push' | 'partial_loss'
  created_at: string
}

// Audit log
export interface AuditLogEntry {
  id: string
  admin_user: string
  action: string
  target_model: string
  target_id: string
  details: Record<string, unknown>
  created_at: string
}

// Paginated response
export interface PaginatedResponse<T> {
  count: number
  next: string | null
  previous: string | null
  results: T[]
}
