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
  is_banned: boolean
  is_kyc_verified: boolean
  referral_code: string
  coin_balance: string
  cash_balance: string
  total_spins: number
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

// Analytics
export interface AnalyticsSummary {
  total_users: number
  total_spins_today: number
  gross_revenue_today: string
  pending_withdrawals_count: number
  pending_withdrawals_amount: string
  pending_kyc_count: number
}

export interface RevenueDataPoint {
  date: string
  revenue: number
  spins: number
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
