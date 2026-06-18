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
  MOCK_CHALLENGES,
  MOCK_CHALLENGE_PARTICIPANTS,
  MOCK_CHALLENGE_COMPLETIONS,
  MOCK_REFERRALS,
  MOCK_USER_CHALLENGES,
  MOCK_USER_REFERRALS,
} from './data'
import type {
  AdminUserDetail,
  RTPWheel,
  CreateRTPPayload,
  PaginatedResponse,
  UsersListResponse,
  WithdrawalsListResponse,
  KYCQueueListResponse,
  AdminChallenge,
  CreateChallengePayload,
  ChallengesListResponse,
  ReferralsListResponse,
  UserRewardsData,
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
  get: (_params?: { year?: string; month?: string }) => delay(MOCK_DASHBOARD),
}

// ── Financials ────────────────────────────────────────────────────────────────

export const mockFinancials = {
  get: (_params?: { year?: string; month?: string }) => delay(MOCK_FINANCIALS),
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

  spins: (
    _id: string,
    page = 1,
    outcome?: 'win' | 'loss',
  ): Promise<PaginatedResponse<typeof MOCK_USER_SPINS[0]>> => {
    const filtered = outcome
      ? MOCK_USER_SPINS.filter((s) => s.outcome === outcome)
      : MOCK_USER_SPINS
    return delay({
      count: filtered.length,
      next: null,
      previous: page > 1 ? `?page=${page - 1}` : null,
      results: filtered,
    })
  },

  transactions: (
    _id: string,
    page = 1,
    type?: string,
  ): Promise<PaginatedResponse<typeof MOCK_USER_TRANSACTIONS[0]>> => {
    const filtered = type
      ? MOCK_USER_TRANSACTIONS.filter((t) => t.type === type)
      : MOCK_USER_TRANSACTIONS
    return delay({
      count: filtered.length,
      next: null,
      previous: page > 1 ? `?page=${page - 1}` : null,
      results: filtered,
    })
  },

  flag: (_id: string): Promise<void> => delay(undefined),

  ban: (_id: string): Promise<void> => delay(undefined),
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
    // 'rejected' tab includes rejected, failed, and cancelled
    // 'pending' tab includes pending and processing
    const filtered = status
      ? status === 'rejected'
        ? MOCK_WITHDRAWALS.filter((w) => w.status === 'rejected' || w.status === 'failed' || w.status === 'cancelled')
        : status === 'pending'
          ? MOCK_WITHDRAWALS.filter((w) => w.status === 'pending' || w.status === 'processing')
          : MOCK_WITHDRAWALS.filter((w) => w.status === status)
      : MOCK_WITHDRAWALS
    const start = (page - 1) * PAGE_SIZE
    return delay({
      overview: {
        ngn: { total_pending: '350000.00', total_paid: '1125000.00', queued: 3 },
        usdt: { total_pending: '0', total_paid: '0', queued: 0 },
        queued_total: 3,
      },
      count: filtered.length,
      next: filtered.length > page * PAGE_SIZE ? `?page=${page + 1}` : null,
      previous: page > 1 ? `?page=${page - 1}` : null,
      results: filtered.slice(start, start + PAGE_SIZE),
    })
  },

  approve: (_id: string, _notes?: string): Promise<void> => delay(undefined as void),
  reject: (_id: string, _reason: string): Promise<void> => delay(undefined as void),
}

// ── Challenges ────────────────────────────────────────────────────────────────

let mockChallengesStore = [...MOCK_CHALLENGES]

export const mockChallenges = {
  list: ({
    type = '',
    is_active,
    page = 1,
  }: { type?: string; is_active?: boolean; page?: number } = {}): Promise<ChallengesListResponse> => {
    let filtered = mockChallengesStore
    if (type) filtered = filtered.filter((c) => c.type === type)
    if (is_active !== undefined) filtered = filtered.filter((c) => c.is_active === is_active)
    const start = (page - 1) * PAGE_SIZE
    return delay({
      count: filtered.length,
      next: filtered.length > page * PAGE_SIZE ? `?page=${page + 1}` : null,
      previous: page > 1 ? `?page=${page - 1}` : null,
      results: filtered.slice(start, start + PAGE_SIZE),
    })
  },

  create: (payload: CreateChallengePayload): Promise<AdminChallenge> => {
    const newChallenge: AdminChallenge = {
      id: `ch-${Date.now()}`,
      name: payload.name,
      description: payload.description ?? '',
      type: payload.type,
      recurrence: payload.recurrence,
      criteria: payload.criteria,
      reward: payload.reward,
      is_active: payload.is_active ?? true,
      is_visible: payload.is_visible ?? true,
      max_completions_per_user: payload.max_completions_per_user ?? null,
      starts_at: payload.starts_at ?? null,
      expires_at: payload.expires_at ?? null,
      created_at: new Date().toISOString(),
      participant_count: 0,
      completion_count: 0,
    }
    mockChallengesStore = [newChallenge, ...mockChallengesStore]
    return delay(newChallenge)
  },

  get: (id: string): Promise<AdminChallenge> => {
    const ch = mockChallengesStore.find((c) => c.id === id)
    if (!ch) return Promise.reject(new Error('Not found'))
    return delay(ch)
  },

  update: (id: string, payload: Partial<CreateChallengePayload> & { is_active?: boolean; is_visible?: boolean }): Promise<AdminChallenge> => {
    mockChallengesStore = mockChallengesStore.map((c) =>
      c.id === id ? { ...c, ...payload } : c
    )
    return delay(mockChallengesStore.find((c) => c.id === id)!)
  },

  delete: (id: string): Promise<void> => {
    mockChallengesStore = mockChallengesStore.map((c) =>
      c.id === id ? { ...c, is_active: false } : c
    )
    return delay(undefined as void)
  },

  participants: (_id: string, _page = 1) =>
    delay({
      challenge: { id: _id, name: 'Challenge' },
      count: MOCK_CHALLENGE_PARTICIPANTS.length,
      next: null,
      previous: null,
      results: MOCK_CHALLENGE_PARTICIPANTS,
    }),

  completions: (_id: string, _page = 1) =>
    delay({
      challenge: { id: _id, name: 'Challenge' },
      total_completions: MOCK_CHALLENGE_COMPLETIONS.length,
      count: MOCK_CHALLENGE_COMPLETIONS.length,
      results: MOCK_CHALLENGE_COMPLETIONS,
    }),
}

// ── Referrals ─────────────────────────────────────────────────────────────────

export const mockReferrals = {
  list: ({
    status = '',
    search = '',
    page = 1,
  }: { status?: string; search?: string; page?: number } = {}): Promise<ReferralsListResponse> => {
    let filtered = MOCK_REFERRALS
    if (status) filtered = filtered.filter((r) => r.status === status)
    if (search) {
      const q = search.toLowerCase()
      filtered = filtered.filter(
        (r) =>
          r.referrer.name.toLowerCase().includes(q) ||
          r.referred_user.name.toLowerCase().includes(q)
      )
    }
    const start = (page - 1) * PAGE_SIZE
    const overview = {
      total: MOCK_REFERRALS.length,
      pending: MOCK_REFERRALS.filter((r) => r.status === 'pending').length,
      qualified: MOCK_REFERRALS.filter((r) => r.status === 'qualified').length,
      rewarded: MOCK_REFERRALS.filter((r) => r.status === 'rewarded').length,
    }
    return delay({
      overview,
      count: filtered.length,
      next: filtered.length > page * PAGE_SIZE ? `?page=${page + 1}` : null,
      previous: page > 1 ? `?page=${page - 1}` : null,
      results: filtered.slice(start, start + PAGE_SIZE),
    })
  },
}

// ── User Rewards ──────────────────────────────────────────────────────────────

export const mockUserRewards = {
  get: (_userId: string): Promise<UserRewardsData> =>
    delay({
      challenges: MOCK_USER_CHALLENGES,
      referrals: MOCK_USER_REFERRALS,
    }),
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
