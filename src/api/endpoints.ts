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
  get: (): Promise<AdminDashboard> =>
    apiClient.get('/api/v1/admin/dashboard/').then(unwrap<AdminDashboard>),
}

// ── Financials ────────────────────────────────────────────────────────────────

export const financials = {
  get: (): Promise<AdminFinancials> =>
    apiClient.get('/api/v1/admin/financials/').then(unwrap<AdminFinancials>),
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
