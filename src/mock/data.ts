import type {
  AdminAnalyticsSummary,
  MonthlyDataPoint,
  CashFlowDataPoint,
  RecentSpin,
  AdminUser,
  UserSpinRecord,
  UserTransaction,
  KYCRecord,
  WithdrawalRecord,
  RTPTierFull,
  AuditLogEntry,
} from '@/types'

// Analytics summary
export const MOCK_SUMMARY: AdminAnalyticsSummary = {
  total_users: 5698,
  total_spins_today: 432,
  gross_revenue_today: '284500',
  net_profit_today: '156000',
  current_rtp: '70',
  pending_withdrawals_count: 12,
  pending_withdrawals_amount: '3500000',
  pending_kyc_count: 12,
  flagged_accounts: 36,
  active_users: 4599,
  new_users_today: 52,
  total_revenue: '2400500',
  net_profit: '1300000',
}

// Monthly profit trend (Jan-Dec)
export const MOCK_PROFIT_TREND: MonthlyDataPoint[] = [
  { month: 'Jan', revenue: 1200000, profit: 840000, spins: 3200 },
  { month: 'Feb', revenue: 980000, profit: 686000, spins: 2800 },
  { month: 'Mar', revenue: 1450000, profit: 1015000, spins: 4100 },
  { month: 'Apr', revenue: 1100000, profit: 770000, spins: 3050 },
  { month: 'May', revenue: 1650000, profit: 1155000, spins: 4600 },
  { month: 'Jun', revenue: 1800000, profit: 1260000, spins: 5200 },
  { month: 'Jul', revenue: 2100000, profit: 1470000, spins: 6100 },
  { month: 'Aug', revenue: 1900000, profit: 1330000, spins: 5400 },
  { month: 'Sep', revenue: 2200000, profit: 1540000, spins: 6300 },
  { month: 'Oct', revenue: 2400000, profit: 1680000, spins: 6900 },
  { month: 'Nov', revenue: 2300000, profit: 1610000, spins: 6600 },
  { month: 'Dec', revenue: 2600000, profit: 1820000, spins: 7400 },
]

// Cash flow for Financials page
export const MOCK_CASHFLOW: CashFlowDataPoint[] = [
  { month: 'Jan', deposits: 1800000, withdrawals: 600000 },
  { month: 'Feb', deposits: 1500000, withdrawals: 520000 },
  { month: 'Mar', deposits: 2100000, withdrawals: 650000 },
  { month: 'Apr', deposits: 1700000, withdrawals: 600000 },
  { month: 'May', deposits: 2300000, withdrawals: 650000 },
  { month: 'Jun', deposits: 2600000, withdrawals: 800000 },
  { month: 'Jul', deposits: 3000000, withdrawals: 900000 },
  { month: 'Aug', deposits: 2700000, withdrawals: 800000 },
  { month: 'Sep', deposits: 3100000, withdrawals: 900000 },
  { month: 'Oct', deposits: 3400000, withdrawals: 1000000 },
  { month: 'Nov', deposits: 3300000, withdrawals: 1000000 },
  { month: 'Dec', deposits: 3700000, withdrawals: 1100000 },
]

// Revenue breakdown for donut chart
export const MOCK_REVENUE_BREAKDOWN = [
  { name: 'Stakes', value: 1050, percent: 51.22, color: '#1A237E' },
  { name: 'Fees', value: 550, percent: 26.83, color: '#C9961A' },
  { name: 'Ads', value: 450, percent: 21.95, color: '#3de8c4' },
]

// Recent spins for dashboard table
export const MOCK_RECENT_SPINS: RecentSpin[] = [
  { id: 'sp1', user_name: 'Chidi Okonkwo', stake: '500', multiplier: '2', result_label: '2x Win', win_value: '1000', outcome: 'win', created_at: '2026-05-06T10:32:00Z' },
  { id: 'sp2', user_name: 'Ngozi Adeyemi', stake: '200', multiplier: '0', result_label: 'Loss', win_value: '0', outcome: 'loss', created_at: '2026-05-06T10:28:00Z' },
  { id: 'sp3', user_name: 'Emeka Eze', stake: '1000', multiplier: '5', result_label: '5x Win', win_value: '5000', outcome: 'win', created_at: '2026-05-06T10:25:00Z' },
  { id: 'sp4', user_name: 'Amaka Nwosu', stake: '300', multiplier: '0.5', result_label: '0.5x', win_value: '150', outcome: 'partial_loss', created_at: '2026-05-06T10:21:00Z' },
  { id: 'sp5', user_name: 'Bola Tinubu', stake: '500', multiplier: '0', result_label: 'Loss', win_value: '0', outcome: 'loss', created_at: '2026-05-06T10:18:00Z' },
  { id: 'sp6', user_name: 'Ifeanyi Obi', stake: '2000', multiplier: '10', result_label: '10x Win', win_value: '20000', outcome: 'win', created_at: '2026-05-06T10:14:00Z' },
  { id: 'sp7', user_name: 'Sola Adesanya', stake: '200', multiplier: '1', result_label: '1x Push', win_value: '200', outcome: 'push', created_at: '2026-05-06T10:10:00Z' },
  { id: 'sp8', user_name: 'Tunde Badmus', stake: '500', multiplier: '0', result_label: 'Loss', win_value: '0', outcome: 'loss', created_at: '2026-05-06T10:06:00Z' },
  { id: 'sp9', user_name: 'Kemi Okafor', stake: '1000', multiplier: '2', result_label: '2x Win', win_value: '2000', outcome: 'win', created_at: '2026-05-06T10:03:00Z' },
  { id: 'sp10', user_name: 'Dayo Adeleke', stake: '300', multiplier: '0', result_label: 'Loss', win_value: '0', outcome: 'loss', created_at: '2026-05-06T09:58:00Z' },
]

// Users (20 users)
export const MOCK_USERS: AdminUser[] = [
  { id: '1', telegram_id: '1001234567', first_name: 'Chidi', last_name: 'Okonkwo', username: 'chidi_o', phone_number: '+2348012345678', is_banned: false, is_kyc_verified: true, kyc_status: 'approved', referral_code: 'CHI001', coin_balance: '1250', cash_balance: '45000', total_spins: 87, total_staked: '89500', risk_level: 'low', created_at: '2025-11-12T08:00:00Z' },
  { id: '2', telegram_id: '1001234568', first_name: 'Ngozi', last_name: 'Adeyemi', username: 'ngozi_a', phone_number: '+2348023456789', is_banned: false, is_kyc_verified: false, kyc_status: 'pending', referral_code: 'NGO002', coin_balance: '340', cash_balance: '12000', total_spins: 23, total_staked: '15600', risk_level: 'low', created_at: '2025-12-01T10:00:00Z' },
  { id: '3', telegram_id: '1001234569', first_name: 'Emeka', last_name: 'Eze', username: 'emeka_eze', phone_number: '+2348034567890', is_banned: false, is_kyc_verified: true, kyc_status: 'approved', referral_code: 'EME003', coin_balance: '5670', cash_balance: '230000', total_spins: 412, total_staked: '556000', risk_level: 'medium', created_at: '2025-10-05T09:00:00Z' },
  { id: '4', telegram_id: '1001234570', first_name: 'Amaka', last_name: 'Nwosu', username: 'amaka_n', phone_number: '+2348045678901', is_banned: false, is_kyc_verified: false, kyc_status: 'unverified', referral_code: 'AMA004', coin_balance: '120', cash_balance: '5000', total_spins: 8, total_staked: '3200', risk_level: 'low', created_at: '2026-01-15T11:00:00Z' },
  { id: '5', telegram_id: '1001234571', first_name: 'Ifeanyi', last_name: 'Obi', username: 'ifeanyi_o', phone_number: '+2348056789012', is_banned: true, is_kyc_verified: true, kyc_status: 'approved', referral_code: 'IFE005', coin_balance: '0', cash_balance: '0', total_spins: 980, total_staked: '1250000', risk_level: 'high', created_at: '2025-09-20T07:00:00Z' },
  { id: '6', telegram_id: '1001234572', first_name: 'Sola', last_name: 'Adesanya', username: 'sola_a', phone_number: '+2348067890123', is_banned: false, is_kyc_verified: true, kyc_status: 'approved', referral_code: 'SOL006', coin_balance: '890', cash_balance: '67000', total_spins: 156, total_staked: '178000', risk_level: 'low', created_at: '2025-10-30T14:00:00Z' },
  { id: '7', telegram_id: '1001234573', first_name: 'Tunde', last_name: 'Badmus', username: 'tunde_b', phone_number: '+2348078901234', is_banned: false, is_kyc_verified: false, kyc_status: 'rejected', referral_code: 'TUN007', coin_balance: '55', cash_balance: '2500', total_spins: 12, total_staked: '4800', risk_level: 'low', created_at: '2026-02-10T15:00:00Z' },
  { id: '8', telegram_id: '1001234574', first_name: 'Kemi', last_name: 'Okafor', username: 'kemi_ok', phone_number: '+2348089012345', is_banned: false, is_kyc_verified: true, kyc_status: 'approved', referral_code: 'KEM008', coin_balance: '2340', cash_balance: '98000', total_spins: 267, total_staked: '310000', risk_level: 'medium', created_at: '2025-11-08T16:00:00Z' },
  { id: '9', telegram_id: '1001234575', first_name: 'Dayo', last_name: 'Adeleke', username: 'dayo_a', phone_number: '+2348090123456', is_banned: false, is_kyc_verified: false, kyc_status: 'pending', referral_code: 'DAY009', coin_balance: '200', cash_balance: '8000', total_spins: 19, total_staked: '9500', risk_level: 'low', created_at: '2026-03-01T09:00:00Z' },
  { id: '10', telegram_id: '1001234576', first_name: 'Femi', last_name: 'Adewale', username: 'femi_a', phone_number: '+2348001234567', is_banned: false, is_kyc_verified: true, kyc_status: 'approved', referral_code: 'FEM010', coin_balance: '4500', cash_balance: '175000', total_spins: 389, total_staked: '445000', risk_level: 'medium', created_at: '2025-10-18T12:00:00Z' },
  { id: '11', telegram_id: '1001234577', first_name: 'Chioma', last_name: 'Igwe', username: 'chioma_i', phone_number: '+2348011234567', is_banned: false, is_kyc_verified: true, kyc_status: 'approved', referral_code: 'CHO011', coin_balance: '780', cash_balance: '42000', total_spins: 95, total_staked: '67000', risk_level: 'low', created_at: '2025-12-20T13:00:00Z' },
  { id: '12', telegram_id: '1001234578', first_name: 'Uche', last_name: 'Nnamdi', username: 'uche_n', phone_number: '+2348022345678', is_banned: false, is_kyc_verified: false, kyc_status: 'pending', referral_code: 'UCH012', coin_balance: '90', cash_balance: '3500', total_spins: 7, total_staked: '2800', risk_level: 'low', created_at: '2026-04-05T10:00:00Z' },
  { id: '13', telegram_id: '1001234579', first_name: 'Adaeze', last_name: 'Okonma', username: 'adaeze_o', phone_number: '+2348033456789', is_banned: false, is_kyc_verified: true, kyc_status: 'approved', referral_code: 'ADA013', coin_balance: '3200', cash_balance: '124000', total_spins: 223, total_staked: '267000', risk_level: 'medium', created_at: '2025-11-25T08:00:00Z' },
  { id: '14', telegram_id: '1001234580', first_name: 'Kayode', last_name: 'Salami', username: 'kayode_s', phone_number: '+2348044567890', is_banned: false, is_kyc_verified: true, kyc_status: 'approved', referral_code: 'KAY014', coin_balance: '11000', cash_balance: '450000', total_spins: 756, total_staked: '890000', risk_level: 'high', created_at: '2025-09-10T07:00:00Z' },
  { id: '15', telegram_id: '1001234581', first_name: 'Blessing', last_name: 'Effiong', username: 'blessing_e', phone_number: '+2348055678901', is_banned: false, is_kyc_verified: false, kyc_status: 'unverified', referral_code: 'BLE015', coin_balance: '45', cash_balance: '1500', total_spins: 3, total_staked: '600', risk_level: 'low', created_at: '2026-04-20T11:00:00Z' },
  { id: '16', telegram_id: '1001234582', first_name: 'Rotimi', last_name: 'Afolabi', username: 'rotimi_a', phone_number: '+2348066789012', is_banned: true, is_kyc_verified: true, kyc_status: 'approved', referral_code: 'ROT016', coin_balance: '0', cash_balance: '0', total_spins: 1200, total_staked: '2500000', risk_level: 'high', created_at: '2025-08-15T06:00:00Z' },
  { id: '17', telegram_id: '1001234583', first_name: 'Maryam', last_name: 'Bello', username: 'maryam_b', phone_number: '+2348077890123', is_banned: false, is_kyc_verified: true, kyc_status: 'approved', referral_code: 'MAR017', coin_balance: '1560', cash_balance: '78000', total_spins: 134, total_staked: '156000', risk_level: 'low', created_at: '2025-12-10T14:00:00Z' },
  { id: '18', telegram_id: '1001234584', first_name: 'Obinna', last_name: 'Okeke', username: 'obinna_ok', phone_number: '+2348088901234', is_banned: false, is_kyc_verified: false, kyc_status: 'pending', referral_code: 'OBI018', coin_balance: '280', cash_balance: '11000', total_spins: 31, total_staked: '18600', risk_level: 'medium', created_at: '2026-01-22T09:00:00Z' },
  { id: '19', telegram_id: '1001234585', first_name: 'Grace', last_name: 'Oduola', username: 'grace_od', phone_number: '+2348099012345', is_banned: false, is_kyc_verified: true, kyc_status: 'approved', referral_code: 'GRA019', coin_balance: '670', cash_balance: '34000', total_spins: 78, total_staked: '56000', risk_level: 'low', created_at: '2025-11-30T15:00:00Z' },
  { id: '20', telegram_id: '1001234586', first_name: 'Seun', last_name: 'Ogundimu', username: 'seun_og', phone_number: '+2348000123456', is_banned: false, is_kyc_verified: true, kyc_status: 'approved', referral_code: 'SEU020', coin_balance: '8900', cash_balance: '356000', total_spins: 540, total_staked: '678000', risk_level: 'high', created_at: '2025-09-28T08:00:00Z' },
]

// User spins (10 records)
export const MOCK_USER_SPINS: UserSpinRecord[] = [
  { id: 'usp1', stake_amount: '500', segment_label: '2x Win', multiplier: '2', payout_amount: '1000', outcome: 'win', created_at: '2026-05-05T18:30:00Z' },
  { id: 'usp2', stake_amount: '200', segment_label: 'Loss', multiplier: '0', payout_amount: '0', outcome: 'loss', created_at: '2026-05-05T17:45:00Z' },
  { id: 'usp3', stake_amount: '1000', segment_label: '5x Win', multiplier: '5', payout_amount: '5000', outcome: 'win', created_at: '2026-05-05T16:20:00Z' },
  { id: 'usp4', stake_amount: '300', segment_label: '0.5x', multiplier: '0.5', payout_amount: '150', outcome: 'partial_loss', created_at: '2026-05-05T14:10:00Z' },
  { id: 'usp5', stake_amount: '500', segment_label: 'Loss', multiplier: '0', payout_amount: '0', outcome: 'loss', created_at: '2026-05-05T12:00:00Z' },
  { id: 'usp6', stake_amount: '2000', segment_label: '10x Win', multiplier: '10', payout_amount: '20000', outcome: 'win', created_at: '2026-05-04T22:30:00Z' },
  { id: 'usp7', stake_amount: '200', segment_label: '1x Push', multiplier: '1', payout_amount: '200', outcome: 'push', created_at: '2026-05-04T19:15:00Z' },
  { id: 'usp8', stake_amount: '500', segment_label: 'Loss', multiplier: '0', payout_amount: '0', outcome: 'loss', created_at: '2026-05-04T16:00:00Z' },
  { id: 'usp9', stake_amount: '1000', segment_label: '2x Win', multiplier: '2', payout_amount: '2000', outcome: 'win', created_at: '2026-05-04T12:30:00Z' },
  { id: 'usp10', stake_amount: '300', segment_label: 'Loss', multiplier: '0', payout_amount: '0', outcome: 'loss', created_at: '2026-05-03T20:00:00Z' },
]

// User transactions (10 records)
export const MOCK_USER_TRANSACTIONS: UserTransaction[] = [
  { id: 'tx1', type: 'deposit', description: 'Bank transfer deposit', amount: '5000', created_at: '2026-05-05T09:00:00Z' },
  { id: 'tx2', type: 'spin_stake', description: 'Spin stake placed', amount: '-500', created_at: '2026-05-05T18:30:00Z' },
  { id: 'tx3', type: 'spin_payout', description: '2x Win payout', amount: '1000', created_at: '2026-05-05T18:31:00Z' },
  { id: 'tx4', type: 'withdrawal', description: 'Withdrawal to GTBank', amount: '-3000', created_at: '2026-05-05T14:00:00Z' },
  { id: 'tx5', type: 'deposit', description: 'Bank transfer deposit', amount: '10000', created_at: '2026-05-04T11:00:00Z' },
  { id: 'tx6', type: 'spin_stake', description: 'Spin stake placed', amount: '-2000', created_at: '2026-05-04T22:30:00Z' },
  { id: 'tx7', type: 'spin_payout', description: '10x Win payout', amount: '20000', created_at: '2026-05-04T22:31:00Z' },
  { id: 'tx8', type: 'reward', description: 'Referral reward', amount: '500', created_at: '2026-05-03T16:00:00Z' },
  { id: 'tx9', type: 'spin_stake', description: 'Spin stake placed', amount: '-300', created_at: '2026-05-03T20:00:00Z' },
  { id: 'tx10', type: 'deposit', description: 'Bank transfer deposit', amount: '2000', created_at: '2026-05-01T09:00:00Z' },
]

// KYC records (15 records)
export const MOCK_KYC: KYCRecord[] = [
  { id: 'kyc1', user: { id: '2', telegram_id: '1001234568', first_name: 'Ngozi', last_name: 'Adeyemi', username: 'ngozi_a' }, status: 'pending', bank_name: 'GTBank', account_number: '0123456789', account_name: 'Ngozi Adeyemi', submitted_at: '2026-05-03T10:00:00Z', reviewed_at: null, rejection_reason: null },
  { id: 'kyc2', user: { id: '9', telegram_id: '1001234575', first_name: 'Dayo', last_name: 'Adeleke', username: 'dayo_a' }, status: 'pending', bank_name: 'Access Bank', account_number: '0234567890', account_name: 'Dayo Adeleke', submitted_at: '2026-05-02T12:00:00Z', reviewed_at: null, rejection_reason: null },
  { id: 'kyc3', user: { id: '12', telegram_id: '1001234578', first_name: 'Uche', last_name: 'Nnamdi', username: 'uche_n' }, status: 'pending', bank_name: 'First Bank', account_number: '3012345678', account_name: 'Uche Nnamdi', submitted_at: '2026-05-04T08:00:00Z', reviewed_at: null, rejection_reason: null },
  { id: 'kyc4', user: { id: '18', telegram_id: '1001234584', first_name: 'Obinna', last_name: 'Okeke', username: 'obinna_ok' }, status: 'pending', bank_name: 'UBA', account_number: '2034567890', account_name: 'Obinna Okeke', submitted_at: '2026-05-05T07:00:00Z', reviewed_at: null, rejection_reason: null },
  { id: 'kyc5', user: { id: '1', telegram_id: '1001234567', first_name: 'Chidi', last_name: 'Okonkwo', username: 'chidi_o' }, status: 'approved', bank_name: 'Zenith Bank', account_number: '1023456789', account_name: 'Chidi Okonkwo', submitted_at: '2025-11-15T10:00:00Z', reviewed_at: '2025-11-16T09:00:00Z', rejection_reason: null },
  { id: 'kyc6', user: { id: '3', telegram_id: '1001234569', first_name: 'Emeka', last_name: 'Eze', username: 'emeka_eze' }, status: 'approved', bank_name: 'GTBank', account_number: '0345678901', account_name: 'Emeka Eze', submitted_at: '2025-10-08T09:00:00Z', reviewed_at: '2025-10-09T10:00:00Z', rejection_reason: null },
  { id: 'kyc7', user: { id: '7', telegram_id: '1001234573', first_name: 'Tunde', last_name: 'Badmus', username: 'tunde_b' }, status: 'rejected', bank_name: 'Polaris Bank', account_number: '4056789012', account_name: 'T Badmus', submitted_at: '2026-02-12T09:00:00Z', reviewed_at: '2026-02-13T10:00:00Z', rejection_reason: 'Account name does not match provided name.' },
  { id: 'kyc8', user: { id: '6', telegram_id: '1001234572', first_name: 'Sola', last_name: 'Adesanya', username: 'sola_a' }, status: 'approved', bank_name: 'Stanbic IBTC', account_number: '0056789012', account_name: 'Sola Adesanya', submitted_at: '2025-11-01T10:00:00Z', reviewed_at: '2025-11-02T09:00:00Z', rejection_reason: null },
  { id: 'kyc9', user: { id: '8', telegram_id: '1001234574', first_name: 'Kemi', last_name: 'Okafor', username: 'kemi_ok' }, status: 'approved', bank_name: 'Fidelity Bank', account_number: '6067890123', account_name: 'Kemi Okafor', submitted_at: '2025-11-10T11:00:00Z', reviewed_at: '2025-11-11T09:00:00Z', rejection_reason: null },
  { id: 'kyc10', user: { id: '10', telegram_id: '1001234576', first_name: 'Femi', last_name: 'Adewale', username: 'femi_a' }, status: 'approved', bank_name: 'Access Bank', account_number: '0078901234', account_name: 'Femi Adewale', submitted_at: '2025-10-20T08:00:00Z', reviewed_at: '2025-10-21T09:00:00Z', rejection_reason: null },
  { id: 'kyc11', user: { id: '11', telegram_id: '1001234577', first_name: 'Chioma', last_name: 'Igwe', username: 'chioma_i' }, status: 'approved', bank_name: 'GTBank', account_number: '0089012345', account_name: 'Chioma Igwe', submitted_at: '2025-12-22T09:00:00Z', reviewed_at: '2025-12-23T10:00:00Z', rejection_reason: null },
  { id: 'kyc12', user: { id: '13', telegram_id: '1001234579', first_name: 'Adaeze', last_name: 'Okonma', username: 'adaeze_o' }, status: 'approved', bank_name: 'Zenith Bank', account_number: '1098765432', account_name: 'Adaeze Okonma', submitted_at: '2025-11-27T09:00:00Z', reviewed_at: '2025-11-28T10:00:00Z', rejection_reason: null },
  { id: 'kyc13', user: { id: '14', telegram_id: '1001234580', first_name: 'Kayode', last_name: 'Salami', username: 'kayode_s' }, status: 'approved', bank_name: 'UBA', account_number: '2087654321', account_name: 'Kayode Salami', submitted_at: '2025-09-12T09:00:00Z', reviewed_at: '2025-09-13T10:00:00Z', rejection_reason: null },
  { id: 'kyc14', user: { id: '17', telegram_id: '1001234583', first_name: 'Maryam', last_name: 'Bello', username: 'maryam_b' }, status: 'approved', bank_name: 'First Bank', account_number: '3076543210', account_name: 'Maryam Bello', submitted_at: '2025-12-12T10:00:00Z', reviewed_at: '2025-12-13T09:00:00Z', rejection_reason: null },
  { id: 'kyc15', user: { id: '19', telegram_id: '1001234585', first_name: 'Grace', last_name: 'Oduola', username: 'grace_od' }, status: 'approved', bank_name: 'Access Bank', account_number: '0065432109', account_name: 'Grace Oduola', submitted_at: '2025-12-02T09:00:00Z', reviewed_at: '2025-12-03T10:00:00Z', rejection_reason: null },
]

// Withdrawals (15 records)
export const MOCK_WITHDRAWALS: WithdrawalRecord[] = [
  { id: 'wd1', user: { id: '1', first_name: 'Chidi', last_name: 'Okonkwo', username: 'chidi_o' }, amount: '15000', status: 'pending', bank_name: 'Zenith Bank', account_number: '1023456789', account_name: 'Chidi Okonkwo', provider_reference: null, created_at: '2026-05-06T09:00:00Z' },
  { id: 'wd2', user: { id: '3', first_name: 'Emeka', last_name: 'Eze', username: 'emeka_eze' }, amount: '50000', status: 'pending', bank_name: 'GTBank', account_number: '0345678901', account_name: 'Emeka Eze', provider_reference: null, created_at: '2026-05-06T08:30:00Z' },
  { id: 'wd3', user: { id: '6', first_name: 'Sola', last_name: 'Adesanya', username: 'sola_a' }, amount: '25000', status: 'processing', bank_name: 'Stanbic IBTC', account_number: '0056789012', account_name: 'Sola Adesanya', provider_reference: 'PST20260506001', created_at: '2026-05-05T20:00:00Z' },
  { id: 'wd4', user: { id: '8', first_name: 'Kemi', last_name: 'Okafor', username: 'kemi_ok' }, amount: '35000', status: 'completed', bank_name: 'Fidelity Bank', account_number: '6067890123', account_name: 'Kemi Okafor', provider_reference: 'PST20260505001', created_at: '2026-05-05T14:00:00Z' },
  { id: 'wd5', user: { id: '10', first_name: 'Femi', last_name: 'Adewale', username: 'femi_a' }, amount: '75000', status: 'completed', bank_name: 'Access Bank', account_number: '0078901234', account_name: 'Femi Adewale', provider_reference: 'PST20260504002', created_at: '2026-05-04T16:00:00Z' },
  { id: 'wd6', user: { id: '14', first_name: 'Kayode', last_name: 'Salami', username: 'kayode_s' }, amount: '120000', status: 'pending', bank_name: 'UBA', account_number: '2087654321', account_name: 'Kayode Salami', provider_reference: null, created_at: '2026-05-06T07:00:00Z' },
  { id: 'wd7', user: { id: '20', first_name: 'Seun', last_name: 'Ogundimu', username: 'seun_og' }, amount: '200000', status: 'pending', bank_name: 'Zenith Bank', account_number: '1045678901', account_name: 'Seun Ogundimu', provider_reference: null, created_at: '2026-05-06T06:00:00Z' },
  { id: 'wd8', user: { id: '13', first_name: 'Adaeze', last_name: 'Okonma', username: 'adaeze_o' }, amount: '40000', status: 'failed', bank_name: 'Zenith Bank', account_number: '1098765432', account_name: 'Adaeze Okonma', provider_reference: 'PST20260503003', created_at: '2026-05-03T10:00:00Z' },
  { id: 'wd9', user: { id: '17', first_name: 'Maryam', last_name: 'Bello', username: 'maryam_b' }, amount: '20000', status: 'completed', bank_name: 'First Bank', account_number: '3076543210', account_name: 'Maryam Bello', provider_reference: 'PST20260502001', created_at: '2026-05-02T12:00:00Z' },
  { id: 'wd10', user: { id: '11', first_name: 'Chioma', last_name: 'Igwe', username: 'chioma_i' }, amount: '18000', status: 'completed', bank_name: 'GTBank', account_number: '0089012345', account_name: 'Chioma Igwe', provider_reference: 'PST20260501002', created_at: '2026-05-01T14:00:00Z' },
  { id: 'wd11', user: { id: '19', first_name: 'Grace', last_name: 'Oduola', username: 'grace_od' }, amount: '12000', status: 'pending', bank_name: 'Access Bank', account_number: '0065432109', account_name: 'Grace Oduola', provider_reference: null, created_at: '2026-05-06T10:00:00Z' },
  { id: 'wd12', user: { id: '4', first_name: 'Amaka', last_name: 'Nwosu', username: 'amaka_n' }, amount: '3000', status: 'completed', bank_name: 'Sterling Bank', account_number: '8012345678', account_name: 'Amaka Nwosu', provider_reference: 'PST20260430001', created_at: '2026-04-30T09:00:00Z' },
  { id: 'wd13', user: { id: '3', first_name: 'Emeka', last_name: 'Eze', username: 'emeka_eze' }, amount: '100000', status: 'completed', bank_name: 'GTBank', account_number: '0345678901', account_name: 'Emeka Eze', provider_reference: 'PST20260429002', created_at: '2026-04-29T12:00:00Z' },
  { id: 'wd14', user: { id: '2', first_name: 'Ngozi', last_name: 'Adeyemi', username: 'ngozi_a' }, amount: '8000', status: 'failed', bank_name: 'GTBank', account_number: '0123456789', account_name: 'Ngozi Adeyemi', provider_reference: 'PST20260428001', created_at: '2026-04-28T10:00:00Z' },
  { id: 'wd15', user: { id: '8', first_name: 'Kemi', last_name: 'Okafor', username: 'kemi_ok' }, amount: '45000', status: 'pending', bank_name: 'Fidelity Bank', account_number: '6067890123', account_name: 'Kemi Okafor', provider_reference: null, created_at: '2026-05-06T05:00:00Z' },
]

// RTP Tiers (3 tiers)
export const MOCK_RTP_TIERS: RTPTierFull[] = [
  {
    id: '1',
    name: 'Standard',
    wheel_type: 'standard',
    min_stake: '200',
    max_stake: '499',
    house_edge: '20',
    rtp_target: '80',
    is_active: true,
    created_by: 'John Mudiagha',
    outcomes: [
      { id: '1', label: 'Loss', multiplier: '0', probability: '30', color: '#2a2a2a', showCoin: false },
      { id: '2', label: '0.5×', multiplier: '0.5', probability: '20', color: '#374151', showCoin: false },
      { id: '3', label: '1×', multiplier: '1', probability: '20', color: '#455A64', showCoin: true },
      { id: '4', label: '2×', multiplier: '2', probability: '20', color: '#1A237E', showCoin: true },
      { id: '5', label: '5×', multiplier: '5', probability: '10', color: '#E65100', showCoin: true },
    ],
  },
  {
    id: '2',
    name: 'Power',
    wheel_type: 'power',
    min_stake: '500',
    max_stake: '1999',
    house_edge: '20',
    rtp_target: '80',
    is_active: true,
    created_by: 'John Mudiagha',
    outcomes: [
      { id: '6', label: 'Loss', multiplier: '0', probability: '40', color: '#2a2a2a', showCoin: false },
      { id: '7', label: '1×', multiplier: '1', probability: '20', color: '#455A64', showCoin: true },
      { id: '8', label: '3×', multiplier: '3', probability: '20', color: '#E86D1F', showCoin: true },
      { id: '9', label: '5×', multiplier: '5', probability: '15', color: '#F5A623', showCoin: true },
      { id: '10', label: '10×', multiplier: '10', probability: '5', color: '#C9961A', showCoin: true },
    ],
  },
  {
    id: '3',
    name: 'Mega',
    wheel_type: 'mega',
    min_stake: '2000',
    max_stake: '100000',
    house_edge: '20',
    rtp_target: '80',
    is_active: false,
    created_by: 'John Mudiagha',
    outcomes: [
      { id: '11', label: 'Loss', multiplier: '0', probability: '50', color: '#2a2a2a', showCoin: false },
      { id: '12', label: '2×', multiplier: '2', probability: '20', color: '#1558BF', showCoin: true },
      { id: '13', label: '5×', multiplier: '5', probability: '15', color: '#1E73E8', showCoin: true },
      { id: '14', label: '10×', multiplier: '10', probability: '10', color: '#0D47A1', showCoin: true },
      { id: '15', label: '50×', multiplier: '50', probability: '5', color: '#F5A623', showCoin: true },
    ],
  },
]

// Audit log (10 entries)
export const MOCK_AUDIT_LOG: AuditLogEntry[] = [
  { id: 'al1', admin_user: 'John Mudiagha', action: 'BAN_USER', target_model: 'User', target_id: '5', details: { reason: 'Suspicious activity pattern' }, created_at: '2026-05-06T09:30:00Z' },
  { id: 'al2', admin_user: 'John Mudiagha', action: 'APPROVE_KYC', target_model: 'KYCRecord', target_id: 'kyc6', details: { bank: 'GTBank' }, created_at: '2026-05-05T14:20:00Z' },
  { id: 'al3', admin_user: 'John Mudiagha', action: 'REJECT_WITHDRAWAL', target_model: 'Withdrawal', target_id: 'wd8', details: { reason: 'Account verification failed' }, created_at: '2026-05-05T11:00:00Z' },
  { id: 'al4', admin_user: 'John Mudiagha', action: 'UPDATE_RTP_TIER', target_model: 'RTPTier', target_id: '2', details: { changed: 'rtp_target', from: '75', to: '80' }, created_at: '2026-05-04T16:45:00Z' },
  { id: 'al5', admin_user: 'John Mudiagha', action: 'APPROVE_WITHDRAWAL', target_model: 'Withdrawal', target_id: 'wd4', details: { amount: '35000' }, created_at: '2026-05-05T13:00:00Z' },
  { id: 'al6', admin_user: 'John Mudiagha', action: 'BAN_USER', target_model: 'User', target_id: '16', details: { reason: 'Multiple accounts detected' }, created_at: '2026-05-03T10:00:00Z' },
  { id: 'al7', admin_user: 'John Mudiagha', action: 'CREATE_RTP_TIER', target_model: 'RTPTier', target_id: '3', details: { name: 'Mega', min_stake: '2000' }, created_at: '2026-05-02T09:00:00Z' },
  { id: 'al8', admin_user: 'John Mudiagha', action: 'REJECT_KYC', target_model: 'KYCRecord', target_id: 'kyc7', details: { reason: 'Name mismatch' }, created_at: '2026-02-13T10:00:00Z' },
  { id: 'al9', admin_user: 'John Mudiagha', action: 'UNBAN_USER', target_model: 'User', target_id: '3', details: { reason: 'Appeal approved' }, created_at: '2026-01-20T11:00:00Z' },
  { id: 'al10', admin_user: 'John Mudiagha', action: 'APPROVE_WITHDRAWAL', target_model: 'Withdrawal', target_id: 'wd5', details: { amount: '75000' }, created_at: '2026-05-04T15:00:00Z' },
]
