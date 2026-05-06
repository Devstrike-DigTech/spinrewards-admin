import {
  MOCK_SUMMARY,
  MOCK_PROFIT_TREND,
  MOCK_USERS,
  MOCK_USER_SPINS,
  MOCK_USER_TRANSACTIONS,
  MOCK_KYC,
  MOCK_WITHDRAWALS,
  MOCK_RTP_TIERS,
  MOCK_AUDIT_LOG,
  MOCK_RECENT_SPINS,
} from './data'
import type {
  AdminUser,
  PaginatedResponse,
  KYCRecord,
  WithdrawalRecord,
  RTPTierFull,
} from '@/types'

function delay<T>(data: T): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(data), 300))
}

export const mockAuth = {
  login: async (username: string, _password: string) => {
    await delay(null)
    if (username) {
      return { access: 'mock-access-token', refresh: 'mock-refresh-token' }
    }
    throw new Error('Invalid credentials')
  },
}

export const mockAnalytics = {
  summary: () => delay(MOCK_SUMMARY),
  revenue: (_days?: number) => delay(MOCK_PROFIT_TREND),
}

const PAGE_SIZE = 10

export const mockUsers = {
  list: ({ search = '', page = 1 }: { search?: string; page?: number } = {}): Promise<PaginatedResponse<AdminUser>> => {
    const filtered = search
      ? MOCK_USERS.filter((u) =>
          `${u.first_name} ${u.last_name} ${u.username} ${u.phone_number}`
            .toLowerCase()
            .includes(search.toLowerCase())
        )
      : MOCK_USERS
    const start = (page - 1) * PAGE_SIZE
    return delay({
      count: filtered.length,
      next: filtered.length > page * PAGE_SIZE ? `?page=${page + 1}` : null,
      previous: page > 1 ? `?page=${page - 1}` : null,
      results: filtered.slice(start, start + PAGE_SIZE),
    })
  },

  detail: (id: string) =>
    delay(MOCK_USERS.find((u) => u.id === id) ?? MOCK_USERS[0]),

  spins: (_id: string, page = 1) =>
    delay({
      count: MOCK_USER_SPINS.length,
      next: null,
      previous: page > 1 ? `?page=${page - 1}` : null,
      results: MOCK_USER_SPINS,
    }),

  transactions: (_id: string, page = 1) =>
    delay({
      count: MOCK_USER_TRANSACTIONS.length,
      next: null,
      previous: page > 1 ? `?page=${page - 1}` : null,
      results: MOCK_USER_TRANSACTIONS,
    }),

  ban: (_id: string) => delay(undefined as void),
  unban: (_id: string) => delay(undefined as void),
}

export const mockKyc = {
  list: ({ status = '', page = 1 }: { status?: string; page?: number } = {}): Promise<PaginatedResponse<KYCRecord>> => {
    const filtered = status
      ? MOCK_KYC.filter((k) => k.status === status)
      : MOCK_KYC
    const start = (page - 1) * PAGE_SIZE
    return delay({
      count: filtered.length,
      next: filtered.length > page * PAGE_SIZE ? `?page=${page + 1}` : null,
      previous: page > 1 ? `?page=${page - 1}` : null,
      results: filtered.slice(start, start + PAGE_SIZE),
    })
  },
  approve: (_id: string) => delay(undefined as void),
  reject: (_id: string, _reason: string) => delay(undefined as void),
}

export const mockWithdrawals = {
  list: ({ status = '', page = 1 }: { status?: string; page?: number } = {}): Promise<PaginatedResponse<WithdrawalRecord>> => {
    const filtered = status
      ? MOCK_WITHDRAWALS.filter((w) => w.status === status)
      : MOCK_WITHDRAWALS
    const start = (page - 1) * PAGE_SIZE
    return delay({
      count: filtered.length,
      next: filtered.length > page * PAGE_SIZE ? `?page=${page + 1}` : null,
      previous: page > 1 ? `?page=${page - 1}` : null,
      results: filtered.slice(start, start + PAGE_SIZE),
    })
  },
  approve: (_id: string) => delay(undefined as void),
  reject: (_id: string, _reason: string) => delay(undefined as void),
}

export const mockRtp = {
  list: (): Promise<RTPTierFull[]> => delay(MOCK_RTP_TIERS),
  create: (payload: Partial<RTPTierFull>): Promise<RTPTierFull> =>
    delay({ ...MOCK_RTP_TIERS[0], ...payload, id: String(Date.now()) }),
  update: (id: string, payload: Partial<RTPTierFull>): Promise<RTPTierFull> =>
    delay({ ...MOCK_RTP_TIERS[0], ...payload, id }),
  remove: (_id: string) => delay(undefined as void),
}

export const mockAuditLog = {
  list: ({ page = 1 }: { page?: number } = {}) => {
    const start = (page - 1) * PAGE_SIZE
    return delay({
      count: MOCK_AUDIT_LOG.length,
      next: MOCK_AUDIT_LOG.length > page * PAGE_SIZE ? `?page=${page + 1}` : null,
      previous: page > 1 ? `?page=${page - 1}` : null,
      results: MOCK_AUDIT_LOG.slice(start, start + PAGE_SIZE),
    })
  },
}

export const mockRecentSpins = {
  list: () => delay(MOCK_RECENT_SPINS),
}
