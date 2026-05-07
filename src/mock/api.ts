import {
  MOCK_DASHBOARD,
  MOCK_FINANCIALS,
  MOCK_USERS,
  MOCK_USER_DETAIL,
  MOCK_USER_SPINS,
  MOCK_USER_TRANSACTIONS,
  MOCK_KYC,
  MOCK_WITHDRAWALS,
  MOCK_FRAUD,
  MOCK_RTP_TIERS,
  MOCK_AUDIT_LOG,
} from './data'
import type {
  AdminUserDetail,
  RTPWheel,
  CreateRTPPayload,
  PaginatedResponse,
  UsersListResponse,
  WithdrawalsListResponse,
  KYCQueueListResponse,
} from '@/types'

function delay<T>(data: T): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(data), 300))
}

const PAGE_SIZE = 10

// ── Auth ──────────────────────────────────────────────────────────────────────

export const mockAuth = {
  login: async (email: string, _password: string) => {
    await delay(null)
    if (!email) throw new Error('Email required')
    return {
      access_token: 'mock-access-token',
      refresh_token: 'mock-refresh-token',
      token_type: 'Bearer',
      admin: {
        id: 'mock-admin-id',
        email,
        display_name: 'Mock Admin',
        is_staff: true,
        is_superuser: false,
      },
    }
  },

  me: async () => {
    await delay(null)
    return {
      id: 'mock-admin-id',
      email: 'admin@spinrewards.com',
      display_name: 'Mock Admin',
      is_staff: true,
      is_superuser: false,
    }
  },

  logout: async (_refresh_token: string) => { await delay(null) },

  changePassword: async (_current: string, _next: string) => { await delay(null) },
}

// ── Dashboard ─────────────────────────────────────────────────────────────────

export const mockDashboard = {
  get: () => delay(MOCK_DASHBOARD),
}

// ── Financials ────────────────────────────────────────────────────────────────

export const mockFinancials = {
  get: () => delay(MOCK_FINANCIALS),
}

// ── RTP ───────────────────────────────────────────────────────────────────────

export const mockRtp = {
  list: (): Promise<RTPWheel[]> => delay(MOCK_RTP_TIERS),

  create: (payload: CreateRTPPayload): Promise<{ id: string; name: string }> =>
    delay({ id: String(Date.now()), name: payload.name }),

  update: (_id: string, _payload: unknown): Promise<void> =>
    delay(undefined as void),
}

// ── Users ─────────────────────────────────────────────────────────────────────

export const mockUsers = {
  list: ({
    search = '',
    page = 1,
  }: { search?: string; filter?: string; page?: number } = {}): Promise<UsersListResponse> => {
    const filtered = search
      ? MOCK_USERS.filter((u) =>
          `${u.name} ${u.phone_number}`.toLowerCase().includes(search.toLowerCase())
        )
      : MOCK_USERS
    const start = (page - 1) * PAGE_SIZE
    return delay({
      overview: { total_users: MOCK_USERS.length, flagged_accounts: 3, pending_kyc: 2 },
      count: filtered.length,
      next: filtered.length > page * PAGE_SIZE ? `?page=${page + 1}` : null,
      previous: page > 1 ? `?page=${page - 1}` : null,
      results: filtered.slice(start, start + PAGE_SIZE),
    })
  },

  detail: (id: string): Promise<AdminUserDetail> => {
    const user = MOCK_USERS.find((u) => u.id === id)
    if (user) {
      return delay({ ...MOCK_USER_DETAIL, id: user.id, name: user.name })
    }
    return delay(MOCK_USER_DETAIL)
  },

  spins: (_id: string, page = 1): Promise<PaginatedResponse<typeof MOCK_USER_SPINS[0]>> =>
    delay({
      count: MOCK_USER_SPINS.length,
      next: null,
      previous: page > 1 ? `?page=${page - 1}` : null,
      results: MOCK_USER_SPINS,
    }),

  transactions: (_id: string, page = 1): Promise<PaginatedResponse<typeof MOCK_USER_TRANSACTIONS[0]>> =>
    delay({
      count: MOCK_USER_TRANSACTIONS.length,
      next: null,
      previous: page > 1 ? `?page=${page - 1}` : null,
      results: MOCK_USER_TRANSACTIONS,
    }),
}

// ── KYC Queue ─────────────────────────────────────────────────────────────────

export const mockKyc = {
  list: ({
    status = '',
    page = 1,
  }: { search?: string; status?: string; page?: number } = {}): Promise<KYCQueueListResponse> => {
    const filtered = status
      ? MOCK_KYC.filter((k) => k.overall_status === status)
      : MOCK_KYC
    const start = (page - 1) * PAGE_SIZE
    return delay({
      overview: { total_pending: 2, total_approved: 580, total_rejected: 1 },
      count: filtered.length,
      next: filtered.length > page * PAGE_SIZE ? `?page=${page + 1}` : null,
      previous: page > 1 ? `?page=${page - 1}` : null,
      results: filtered.slice(start, start + PAGE_SIZE),
    })
  },

  approve: (_id: string, _section: string): Promise<{ overall_status: string; can_withdraw: boolean }> =>
    delay({ overall_status: 'approved', can_withdraw: true }),

  reject: (_id: string, _section: string, _reason: string): Promise<{ overall_status: string; can_withdraw: boolean }> =>
    delay({ overall_status: 'rejected', can_withdraw: false }),
}

// ── Withdrawals ───────────────────────────────────────────────────────────────

export const mockWithdrawals = {
  list: ({
    status = '',
    page = 1,
  }: { search?: string; status?: string; page?: number } = {}): Promise<WithdrawalsListResponse> => {
    const filtered = status
      ? MOCK_WITHDRAWALS.filter((w) => w.status === status)
      : MOCK_WITHDRAWALS
    const start = (page - 1) * PAGE_SIZE
    return delay({
      overview: { total_pending: '350000.00', total_paid: '1125000.00', queued: 3 },
      count: filtered.length,
      next: filtered.length > page * PAGE_SIZE ? `?page=${page + 1}` : null,
      previous: page > 1 ? `?page=${page - 1}` : null,
      results: filtered.slice(start, start + PAGE_SIZE),
    })
  },

  approve: (_id: string, _notes?: string): Promise<void> => delay(undefined as void),
  reject: (_id: string, _reason: string): Promise<void> => delay(undefined as void),
}

// ── Fraud ─────────────────────────────────────────────────────────────────────

export const mockFraud = {
  get: () => delay(MOCK_FRAUD),
}

// ── Audit Log ─────────────────────────────────────────────────────────────────

export const mockAuditLog = {
  list: ({ page = 1 }: { type?: string; page?: number } = {}) => {
    const start = (page - 1) * PAGE_SIZE
    return delay({
      count: MOCK_AUDIT_LOG.length,
      next: MOCK_AUDIT_LOG.length > page * PAGE_SIZE ? `?page=${page + 1}` : null,
      previous: page > 1 ? `?page=${page - 1}` : null,
      results: MOCK_AUDIT_LOG.slice(start, start + PAGE_SIZE),
    })
  },
}
