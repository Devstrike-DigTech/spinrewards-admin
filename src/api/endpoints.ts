import { publicClient, apiClient } from './client'
import type {
  AdminLoginResponse,
  AdminAccount,
  AdminDashboard,
  AdminFinancials,
  RTPWheel,
  CreateRTPPayload,
  UpdateRTPPayload,
  AdminUserDetail,
  UserSpinRecord,
  UserTransaction,
  FraudData,
  AuditLogEntry,
  PaginatedResponse,
  UsersListResponse,
  WithdrawalsListResponse,
  KYCQueueListResponse,
  AdminChallenge,
  CreateChallengePayload,
  ChallengeParticipant,
  ChallengeCompletion,
  ChallengesListResponse,
  ReferralsListResponse,
  UserRewardsData,
  AdminMember,
  AdminRole,
  CreateAdminPayload,
  UpdateAdminPayload,
  AdminMembersListResponse,
} from '@/types'

// Unwrap the {success, data} envelope all admin endpoints return
function unwrap<T>(r: { data: { data?: T } & T }): T {
  return (r.data as any)?.data ?? r.data
}

// ── Auth ─────────────────────────────────────────────────────────────────────

export const auth = {
  login: (email: string, password: string): Promise<AdminLoginResponse> =>
    publicClient
      .post('/api/v1/admin/auth/login/', { email, password })
      .then((r) => unwrap<AdminLoginResponse>(r)),

  me: (): Promise<AdminAccount> =>
    apiClient
      .get('/api/v1/admin/auth/me/')
      .then(unwrap<AdminAccount>),

  logout: (refresh_token: string): Promise<void> =>
    apiClient
      .post('/api/v1/admin/auth/logout/', { refresh_token })
      .then(() => undefined),

  changePassword: (current_password: string, new_password: string): Promise<void> =>
    apiClient
      .post('/api/v1/admin/auth/change-password/', { current_password, new_password })
      .then(() => undefined),
}

// ── Dashboard ─────────────────────────────────────────────────────────────────

export const dashboard = {
  get: (params?: { year?: string; month?: string }): Promise<AdminDashboard> =>
    apiClient.get('/api/v1/admin/dashboard/', { params }).then(unwrap<AdminDashboard>),
}

// ── Financials ────────────────────────────────────────────────────────────────

export const financials = {
  get: (params?: { year?: string; month?: string }): Promise<AdminFinancials> =>
    apiClient.get('/api/v1/admin/financials/', { params }).then(unwrap<AdminFinancials>),
}

// ── RTP ───────────────────────────────────────────────────────────────────────

export const rtp = {
  list: (): Promise<RTPWheel[]> =>
    apiClient.get('/api/v1/admin/rtp/').then((r) => {
      const d = unwrap<{ count: number; wheels: RTPWheel[] }>(r)
      return d.wheels ?? d
    }),

  create: (payload: CreateRTPPayload): Promise<{ id: string; name: string }> =>
    apiClient.post('/api/v1/admin/rtp/', payload).then(unwrap),

  update: (id: string, payload: UpdateRTPPayload): Promise<void> =>
    apiClient.put(`/api/v1/admin/rtp/${id}/`, payload).then(() => undefined),
}

// ── Users ─────────────────────────────────────────────────────────────────────

export const users = {
  list: (params?: {
    search?: string
    filter?: string
    page?: number
  }): Promise<UsersListResponse> =>
    apiClient.get('/api/v1/admin/users/', { params }).then(unwrap<UsersListResponse>),

  detail: (id: string): Promise<AdminUserDetail> =>
    apiClient.get(`/api/v1/admin/users/${id}/`).then(unwrap<AdminUserDetail>),

  spins: (
    id: string,
    page = 1,
    outcome?: 'win' | 'loss',
  ): Promise<PaginatedResponse<UserSpinRecord>> =>
    apiClient
      .get(`/api/v1/admin/users/${id}/spins/`, {
        params: { page, ...(outcome ? { outcome } : {}) },
      })
      .then(unwrap<PaginatedResponse<UserSpinRecord>>),

  transactions: (
    id: string,
    page = 1,
    type?: string,
  ): Promise<PaginatedResponse<UserTransaction>> =>
    apiClient
      .get(`/api/v1/admin/users/${id}/transactions/`, {
        params: { page, ...(type ? { type } : {}) },
      })
      .then(unwrap<PaginatedResponse<UserTransaction>>),

  flag: (id: string): Promise<void> =>
    apiClient.post(`/api/v1/admin/users/${id}/flag/`).then(() => undefined),

  ban: (id: string): Promise<void> =>
    apiClient.post(`/api/v1/admin/users/${id}/ban/`).then(() => undefined),
}

// ── Withdrawals ───────────────────────────────────────────────────────────────

export const withdrawals = {
  list: (params?: {
    search?: string
    status?: string
    page?: number
  }): Promise<WithdrawalsListResponse> =>
    apiClient
      .get('/api/v1/admin/withdrawals/', { params })
      .then(unwrap<WithdrawalsListResponse>),

  approve: (id: string, notes?: string): Promise<void> =>
    apiClient
      .post(`/api/v1/admin/withdrawals/${id}/approve/`, { notes })
      .then(() => undefined),

  reject: (id: string, reason: string): Promise<void> =>
    apiClient
      .post(`/api/v1/admin/withdrawals/${id}/reject/`, { reason })
      .then(() => undefined),
}

// ── KYC Queue ─────────────────────────────────────────────────────────────────

export const kycQueue = {
  list: (params?: {
    search?: string
    status?: string
    page?: number
  }): Promise<KYCQueueListResponse> =>
    apiClient
      .get('/api/v1/admin/kyc/queue/', { params })
      .then(unwrap<KYCQueueListResponse>),

  approve: (
    id: string,
    section: 'all' | 'personal_info' | 'bank_account' | 'document',
  ): Promise<{ overall_status: string; can_withdraw: boolean }> =>
    apiClient
      .post(`/api/v1/admin/kyc/${id}/approve/`, { section })
      .then(unwrap),

  reject: (
    id: string,
    section: 'personal_info' | 'bank_account' | 'document',
    reason: string,
  ): Promise<{ overall_status: string; can_withdraw: boolean }> =>
    apiClient
      .post(`/api/v1/admin/kyc/${id}/reject/`, { section, reason })
      .then(unwrap),
}

// ── Challenges ────────────────────────────────────────────────────────────────

export const challenges = {
  list: (params?: { type?: string; is_active?: boolean; page?: number }): Promise<ChallengesListResponse> =>
    apiClient.get('/api/v1/admin/challenges/', { params }).then(unwrap<ChallengesListResponse>),

  create: (payload: CreateChallengePayload): Promise<AdminChallenge> =>
    apiClient.post('/api/v1/admin/challenges/', payload).then(unwrap<AdminChallenge>),

  get: (id: string): Promise<AdminChallenge> =>
    apiClient.get(`/api/v1/admin/challenges/${id}/`).then(unwrap<AdminChallenge>),

  update: (id: string, payload: Partial<CreateChallengePayload> & { is_active?: boolean; is_visible?: boolean }): Promise<AdminChallenge> =>
    apiClient.patch(`/api/v1/admin/challenges/${id}/`, payload).then(unwrap<AdminChallenge>),

  delete: (id: string): Promise<void> =>
    apiClient.delete(`/api/v1/admin/challenges/${id}/`).then(() => undefined),

  participants: (id: string, page = 1): Promise<{ challenge: { id: string; name: string }; count: number; next: string | null; previous: string | null; results: ChallengeParticipant[] }> =>
    apiClient.get(`/api/v1/admin/challenges/${id}/participants/`, { params: { page } }).then(unwrap),

  completions: (id: string, page = 1): Promise<{ challenge: { id: string; name: string }; total_completions: number; count: number; results: ChallengeCompletion[] }> =>
    apiClient.get(`/api/v1/admin/challenges/${id}/completions/`, { params: { page } }).then(unwrap),
}

// ── Referrals ─────────────────────────────────────────────────────────────────

export const referrals = {
  list: (params?: { status?: string; search?: string; page?: number }): Promise<ReferralsListResponse> =>
    apiClient.get('/api/v1/admin/referrals/', { params }).then(unwrap<ReferralsListResponse>),
}

// ── User Rewards ──────────────────────────────────────────────────────────────

export const userRewards = {
  get: (userId: string): Promise<UserRewardsData> =>
    apiClient.get(`/api/v1/admin/users/${userId}/rewards/`).then(unwrap<UserRewardsData>),
}

// ── Fraud ─────────────────────────────────────────────────────────────────────

export const fraud = {
  get: (): Promise<FraudData> =>
    apiClient.get('/api/v1/admin/fraud/').then(unwrap<FraudData>),
}

// ── Audit Log ─────────────────────────────────────────────────────────────────

export const auditLog = {
  list: (params?: {
    type?: string
    page?: number
  }): Promise<PaginatedResponse<AuditLogEntry>> =>
    apiClient
      .get('/api/v1/admin/audit-logs/', { params })
      .then(unwrap<PaginatedResponse<AuditLogEntry>>),
}

// ── Admin Members ─────────────────────────────────────────────────────────────

export const adminMembers = {
  roles: (): Promise<AdminRole[]> =>
    apiClient
      .get('/api/v1/admin/roles/')
      .then((r) => unwrap<{ roles: AdminRole[] }>(r).roles ?? []),

  list: (params?: {
    role?: string
    is_active?: boolean
    search?: string
    page?: number
  }): Promise<AdminMembersListResponse> =>
    apiClient
      .get('/api/v1/admin/admins/', { params })
      .then(unwrap<AdminMembersListResponse>),

  get: (id: string): Promise<AdminMember> =>
    apiClient.get(`/api/v1/admin/admins/${id}/`).then(unwrap<AdminMember>),

  create: (payload: CreateAdminPayload): Promise<AdminMember> =>
    apiClient.post('/api/v1/admin/admins/', payload).then(unwrap<AdminMember>),

  update: (id: string, payload: UpdateAdminPayload): Promise<AdminMember> =>
    apiClient.patch(`/api/v1/admin/admins/${id}/`, payload).then(unwrap<AdminMember>),

  deactivate: (id: string): Promise<void> =>
    apiClient.delete(`/api/v1/admin/admins/${id}/`).then(() => undefined),

  resetPassword: (id: string, new_password: string): Promise<void> =>
    apiClient
      .post(`/api/v1/admin/admins/${id}/reset-password/`, { new_password })
      .then(() => undefined),
}
