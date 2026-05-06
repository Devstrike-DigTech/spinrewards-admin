import {
  mockAuth,
  mockAnalytics,
  mockUsers,
  mockKyc,
  mockWithdrawals,
  mockRtp,
  mockAuditLog,
  mockRecentSpins,
} from '@/mock/api'
import { auth, users, kyc, withdrawals, rtp, analytics, auditLog } from './endpoints'
import type { AdminAnalyticsSummary, RTPTierFull, UserSpinRecord, UserTransaction, PaginatedResponse } from '@/types'

const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true'

// Real analytics with type cast to match AdminAnalyticsSummary
const realAnalytics = {
  summary: analytics.summary as () => Promise<AdminAnalyticsSummary>,
  revenue: analytics.revenue,
}

// Real users extended with mock-compatible methods
const realUsers = {
  ...users,
  spins: (_id: string, _page?: number): Promise<PaginatedResponse<UserSpinRecord>> =>
    Promise.resolve({ count: 0, next: null, previous: null, results: [] }),
  transactions: (_id: string, _page?: number): Promise<PaginatedResponse<UserTransaction>> =>
    Promise.resolve({ count: 0, next: null, previous: null, results: [] }),
}

// Real rtp with type cast
const realRtp = {
  list: rtp.list as () => Promise<RTPTierFull[]>,
  create: rtp.create as unknown as typeof mockRtp.create,
  update: rtp.update as unknown as typeof mockRtp.update,
  remove: rtp.remove,
}

const realRecentSpins = {
  list: () => Promise.resolve([] as import('@/types').RecentSpin[]),
}

export const authApi = USE_MOCK ? mockAuth : auth
export const analyticsApi = USE_MOCK ? mockAnalytics : realAnalytics
export const usersApi = USE_MOCK ? mockUsers : realUsers
export const kycApi = USE_MOCK ? mockKyc : kyc
export const withdrawalsApi = USE_MOCK ? mockWithdrawals : withdrawals
export const rtpApi = USE_MOCK ? mockRtp : realRtp
export const auditLogApi = USE_MOCK ? mockAuditLog : auditLog
export const recentSpinsApi = USE_MOCK ? mockRecentSpins : realRecentSpins
