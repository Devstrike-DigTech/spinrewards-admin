import {
  mockAuth,
  mockDashboard,
  mockFinancials,
  mockUsers,
  mockKyc,
  mockWithdrawals,
  mockFraud,
  mockRtp,
  mockAuditLog,
  mockChallenges,
  mockReferrals,
  mockUserRewards,
} from '@/mock/api'

import {
  auth,
  dashboard,
  financials,
  users,
  kycQueue,
  withdrawals,
  fraud,
  rtp,
  auditLog,
  challenges,
  referrals,
  userRewards,
  adminMembers,
} from './endpoints'

const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true'

export const authApi          = USE_MOCK ? mockAuth         : auth
export const dashboardApi     = USE_MOCK ? mockDashboard    : dashboard
export const financialsApi    = USE_MOCK ? mockFinancials   : financials
export const usersApi         = USE_MOCK ? mockUsers        : users
export const kycApi           = USE_MOCK ? mockKyc          : kycQueue
export const withdrawalsApi   = USE_MOCK ? mockWithdrawals  : withdrawals
export const fraudApi         = USE_MOCK ? mockFraud        : fraud
export const rtpApi           = USE_MOCK ? mockRtp          : rtp
export const auditLogApi      = USE_MOCK ? mockAuditLog     : auditLog
export const challengesApi    = USE_MOCK ? mockChallenges   : challenges
export const referralsApi     = USE_MOCK ? mockReferrals    : referrals
export const userRewardsApi   = USE_MOCK ? mockUserRewards  : userRewards
export const adminMembersApi  = adminMembers   // no mock — always live
