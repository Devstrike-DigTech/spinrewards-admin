import { publicClient, apiClient } from './client'
import type {
  AdminTokens,
  AdminUser,
  KYCRecord,
  WithdrawalRecord,
  RTPTier,
  RTPTierPayload,
  AnalyticsSummary,
  RevenueDataPoint,
  AuditLogEntry,
  PaginatedResponse,
} from '@/types'

// Auth
export const auth = {
  login: (username: string, password: string): Promise<AdminTokens> =>
    publicClient
      .post<AdminTokens>('/admin/auth/login/', { username, password })
      .then((r) => r.data),
}

// Users
export const users = {
  list: (params?: { search?: string; page?: number }): Promise<PaginatedResponse<AdminUser>> =>
    apiClient.get('/admin/users/', { params }).then((r) => r.data),

  detail: (id: string): Promise<AdminUser> =>
    apiClient.get(`/admin/users/${id}/`).then((r) => r.data),

  ban: (id: string): Promise<void> =>
    apiClient.post(`/admin/users/${id}/ban/`).then(() => undefined),

  unban: (id: string): Promise<void> =>
    apiClient.post(`/admin/users/${id}/unban/`).then(() => undefined),
}

// KYC
export const kyc = {
  list: (params?: {
    status?: string
    page?: number
  }): Promise<PaginatedResponse<KYCRecord>> =>
    apiClient.get('/admin/kyc/', { params }).then((r) => r.data),

  approve: (id: string): Promise<void> =>
    apiClient.post(`/admin/kyc/${id}/approve/`).then(() => undefined),

  reject: (id: string, reason: string): Promise<void> =>
    apiClient.post(`/admin/kyc/${id}/reject/`, { reason }).then(() => undefined),
}

// Withdrawals
export const withdrawals = {
  list: (params?: {
    status?: string
    page?: number
  }): Promise<PaginatedResponse<WithdrawalRecord>> =>
    apiClient.get('/admin/withdrawals/', { params }).then((r) => r.data),

  approve: (id: string): Promise<void> =>
    apiClient.post(`/admin/withdrawals/${id}/approve/`).then(() => undefined),

  reject: (id: string, reason: string): Promise<void> =>
    apiClient.post(`/admin/withdrawals/${id}/reject/`, { reason }).then(() => undefined),
}

// RTP
export const rtp = {
  list: (): Promise<RTPTier[]> =>
    apiClient.get('/admin/rtp/tiers/').then((r) => r.data),

  create: (payload: RTPTierPayload): Promise<RTPTier> =>
    apiClient.post('/admin/rtp/tiers/', payload).then((r) => r.data),

  update: (id: string, payload: RTPTierPayload): Promise<RTPTier> =>
    apiClient.put(`/admin/rtp/tiers/${id}/`, payload).then((r) => r.data),

  remove: (id: string): Promise<void> =>
    apiClient.delete(`/admin/rtp/tiers/${id}/`).then(() => undefined),
}

// Analytics
export const analytics = {
  summary: (): Promise<AnalyticsSummary> =>
    apiClient.get('/admin/analytics/summary/').then((r) => r.data),

  revenue: (days = 30): Promise<RevenueDataPoint[]> =>
    apiClient.get('/admin/analytics/revenue/', { params: { days } }).then((r) => r.data),
}

// Audit log
export const auditLog = {
  list: (params?: { page?: number }): Promise<PaginatedResponse<AuditLogEntry>> =>
    apiClient.get('/admin/audit-log/', { params }).then((r) => r.data),
}
