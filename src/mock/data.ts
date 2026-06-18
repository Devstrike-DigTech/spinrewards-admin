import type {
  AdminDashboard,
  AdminFinancials,
  AdminUser,
  AdminUserDetail,
  UserSpinRecord,
  UserTransaction,
  AdminWithdrawal,
  AdminKYCQueueItem,
  FraudData,
  RTPWheel,
  AuditLogEntry,
  AdminChallenge,
  AdminReferral,
  UserChallengeProgress,
  UserReferralEntry,
} from '@/types'

// ── Dashboard ────────────────────────────────────────────────────────────────

const gp = (staked: string, won: string, ggr: string, spins: number) => ({ staked, won, ggr, spins })

export const MOCK_DASHBOARD: AdminDashboard = {
  kpis: {
    ngn: {
      total_revenue: '2400500.00',
      total_revenue_change_pct: 2.0,
      net_profit_ggr: '1300000.00',
      net_profit_ggr_change_pct: 1.5,
      realized_house_edge_pct: '30.0',
      total_won_by_players: '1100500.00',
    },
    usdt: {
      total_revenue: '1600.00',
      total_revenue_change_pct: null,
      net_profit_ggr: '410.00',
      net_profit_ggr_change_pct: null,
      realized_house_edge_pct: '25.6',
      total_won_by_players: '1190.00',
    },
    player_win_rate_pct: '21.95',
    total_spins: 2050,
    winning_spins: 450,
    active_users: 4599,
    new_users_today: 52,
  },
  graph: [
    { month: 'Jan', year: 2026, ngn: gp('600000.00', '420000.00', '180000.00', 580), usdt: gp('400', '320', '80', 25) },
    { month: 'Feb', year: 2026, ngn: gp('730000.00', '510000.00', '220000.00', 710), usdt: gp('480', '380', '100', 30) },
    { month: 'Mar', year: 2026, ngn: gp('1030000.00', '720000.00', '310000.00', 990), usdt: gp('700', '560', '140', 44) },
    { month: 'Apr', year: 2026, ngn: gp('900000.00', '630000.00', '270000.00', 870), usdt: gp('600', '480', '120', 38) },
    { month: 'May', year: 2026, ngn: gp('1165000.00', '815000.00', '350000.00', 1120), usdt: gp('780', '620', '160', 49) },
    { month: 'Jun', year: 2026, ngn: gp('1330000.00', '930000.00', '400000.00', 1280), usdt: gp('900', '720', '180', 56) },
    { month: 'Jul', year: 2026, ngn: gp('1600000.00', '1120000.00', '480000.00', 1540), usdt: gp('1080', '860', '220', 67) },
    { month: 'Aug', year: 2026, ngn: gp('1400000.00', '980000.00', '420000.00', 1350), usdt: gp('940', '750', '190', 59) },
    { month: 'Sep', year: 2026, ngn: gp('1700000.00', '1190000.00', '510000.00', 1630), usdt: gp('1140', '910', '230', 71) },
    { month: 'Oct', year: 2026, ngn: gp('1865000.00', '1305000.00', '560000.00', 1790), usdt: gp('1250', '1000', '250', 78) },
    { month: 'Nov', year: 2026, ngn: gp('1765000.00', '1235000.00', '530000.00', 1700), usdt: gp('1180', '945', '235', 73) },
    { month: 'Dec', year: 2026, ngn: gp('2065000.00', '1445000.00', '620000.00', 1980), usdt: gp('1380', '1100', '280', 86) },
  ],
  recent_spins: [
    { id: 'sp1', user: 'Alex Ninth', stake: '500.00', result: '2x', multiplier: '2.0000', win_value: '1000.00', outcome: 'win', date: 'May 4, 2026' },
    { id: 'sp2', user: 'Mariam Akpo', stake: '500.00', result: 'Loss', multiplier: '0.0000', win_value: '0.00', outcome: 'loss', date: 'May 4, 2026' },
    { id: 'sp3', user: 'Chinedu Jacks', stake: '10000.00', result: '5x', multiplier: '5.0000', win_value: '50000.00', outcome: 'win', date: 'May 4, 2026' },
    { id: 'sp4', user: 'Chinedu Jacks', stake: '10000.00', result: '5x', multiplier: '5.0000', win_value: '50000.00', outcome: 'win', date: 'May 4, 2026' },
  ],
  top_winners: {
    ngn: [
      { user: 'Chinedu Jacks', win_value: '50000.00' },
      { user: 'Alex Ninth', win_value: '1000.00' },
    ],
    usdt: [
      { user: 'Linda P.', win_value: '850.00' },
      { user: 'James O.', win_value: '620.00' },
    ],
  },
}

// ── Financials ────────────────────────────────────────────────────────────────

export const MOCK_FINANCIALS: AdminFinancials = {
  period: 'month',
  year: 2026,
  month: 'May',
  deposits: {
    ngn: { total_amount: '2400500.00', total_amount_change_pct: '2.0', total_transactions: 1240, average_per_deposit: '1936.00', net_position: '1100500.00' },
    usdt: { total_amount: '0', total_amount_change_pct: '0', total_transactions: 0, average_per_deposit: '0', net_position: '0' },
  },
  withdrawals: {
    ngn: { total_amount: '1300000.00', total_amount_change_pct: '2.0', pct_of_deposits: '54.2', pending_amount: '350000.00', pending_queue_count: 12, success_rate_pct: '86.2' },
    usdt: { total_amount: '0', total_amount_change_pct: '0', pct_of_deposits: '0', pending_amount: '0', pending_queue_count: 0, success_rate_pct: '0' },
  },
  spins: {
    total_spins: 2050,
    win_rate_pct: '21.95',
    wins_count: 450,
    losses_count: 800,
    ngn: { count: 1800, total_staked: '438000.00', avg_stake_per_spin: '243.90' },
    usdt: { count: 0, total_staked: '0', avg_stake_per_spin: '0' },
  },
  ggr: {
    ngn: { ggr_amount: '150000.00', ggr_change_pct: '1.5', ggr_margin_pct: '30.0', total_staked: '500000.00', total_won: '350000.00' },
    usdt: { ggr_amount: '0', ggr_change_pct: '0', ggr_margin_pct: '0', total_staked: '0', total_won: '0' },
  },
  cash_flow: {
    ngn: {
    deposits: [
      { month: 'Jan', year: 2026, count: 120, amount: '1800000.00' },
      { month: 'Feb', year: 2026, count: 98,  amount: '1500000.00' },
      { month: 'Mar', year: 2026, count: 145, amount: '2100000.00' },
      { month: 'Apr', year: 2026, count: 110, amount: '1700000.00' },
      { month: 'May', year: 2026, count: 160, amount: '2300000.00' },
      { month: 'Jun', year: 2026, count: 182, amount: '2600000.00' },
      { month: 'Jul', year: 2026, count: 168, amount: '2400000.00' },
      { month: 'Aug', year: 2026, count: 154, amount: '2200000.00' },
      { month: 'Sep', year: 2026, count: 175, amount: '2500000.00' },
      { month: 'Oct', year: 2026, count: 196, amount: '2800000.00' },
      { month: 'Nov', year: 2026, count: 182, amount: '2600000.00' },
      { month: 'Dec', year: 2026, count: 217, amount: '3100000.00' },
    ],
    withdrawals: [
      { month: 'Jan', year: 2026, count: 32, amount: '600000.00' },
      { month: 'Feb', year: 2026, count: 28, amount: '520000.00' },
      { month: 'Mar', year: 2026, count: 35, amount: '650000.00' },
      { month: 'Apr', year: 2026, count: 32, amount: '600000.00' },
      { month: 'May', year: 2026, count: 35, amount: '650000.00' },
      { month: 'Jun', year: 2026, count: 43, amount: '800000.00' },
      { month: 'Jul', year: 2026, count: 40, amount: '750000.00' },
      { month: 'Aug', year: 2026, count: 38, amount: '700000.00' },
      { month: 'Sep', year: 2026, count: 42, amount: '780000.00' },
      { month: 'Oct', year: 2026, count: 48, amount: '900000.00' },
      { month: 'Nov', year: 2026, count: 45, amount: '830000.00' },
      { month: 'Dec', year: 2026, count: 52, amount: '970000.00' },
    ],
    },
    usdt: { deposits: [], withdrawals: [] },
  },
  spin_breakdown: {
    ngn: { total_ggr: '150000.00', total_won_by_players: '350000.00', total_staked: '500000.00' },
    usdt: { total_ggr: '0', total_won_by_players: '0', total_staked: '0' },
  },
  ggr_trend: {
    ngn: [
    { month: 'Jan', year: 2026, ggr: '112500.00', staked: '375000.00', won: '262500.00' },
    { month: 'Feb', year: 2026, ggr: '93750.00',  staked: '312500.00', won: '218750.00' },
    { month: 'Mar', year: 2026, ggr: '131250.00', staked: '437500.00', won: '306250.00' },
    { month: 'Apr', year: 2026, ggr: '106250.00', staked: '354167.00', won: '247917.00' },
    { month: 'May', year: 2026, ggr: '143750.00', staked: '479167.00', won: '335417.00' },
    { month: 'Jun', year: 2026, ggr: '162500.00', staked: '541667.00', won: '379167.00' },
    { month: 'Jul', year: 2026, ggr: '150000.00', staked: '500000.00', won: '350000.00' },
    { month: 'Aug', year: 2026, ggr: '137500.00', staked: '458333.00', won: '320833.00' },
    { month: 'Sep', year: 2026, ggr: '156250.00', staked: '520833.00', won: '364583.00' },
    { month: 'Oct', year: 2026, ggr: '175000.00', staked: '583333.00', won: '408333.00' },
    { month: 'Nov', year: 2026, ggr: '162500.00', staked: '541667.00', won: '379167.00' },
    { month: 'Dec', year: 2026, ggr: '193750.00', staked: '645833.00', won: '452083.00' },
    ],
    usdt: [],
  },
}

// ── RTP Wheels ────────────────────────────────────────────────────────────────

export const MOCK_RTP_TIERS: RTPWheel[] = [
  {
    id: '1',
    name: 'Entry Stake (₦200–₦499)',
    wheel_type: 'standard',
    min_stake: '200',
    max_stake: '499',
    rtp_target: '80.00',
    computed_rtp: '79.50',
    house_edge: '20.50',
    is_active: true,
    total_spins: 1250,
    segments: [
      { position: 0, label: 'Loss', multiplier: '0.0000', probability_weight: 30, probability_pct: 30.0, color: '#3a3a3a', is_active: true },
      { position: 1, label: '0.5x', multiplier: '0.5000', probability_weight: 20, probability_pct: 20.0, color: '#5a5a5a', is_active: true },
      { position: 2, label: '1x', multiplier: '1.0000', probability_weight: 20, probability_pct: 20.0, color: '#455A64', is_active: true },
      { position: 3, label: '2x', multiplier: '2.0000', probability_weight: 20, probability_pct: 20.0, color: '#1A237E', is_active: true },
      { position: 4, label: '5x', multiplier: '5.0000', probability_weight: 10, probability_pct: 10.0, color: '#C9961A', is_active: true },
    ],
  },
  {
    id: '2',
    name: 'Power Stake (₦500–₦1,999)',
    wheel_type: 'power',
    min_stake: '500',
    max_stake: '1999',
    rtp_target: '80.00',
    computed_rtp: '80.20',
    house_edge: '19.80',
    is_active: true,
    total_spins: 870,
    segments: [
      { position: 0, label: 'Loss', multiplier: '0.0000', probability_weight: 40, probability_pct: 40.0, color: '#3a3a3a', is_active: true },
      { position: 1, label: '1x', multiplier: '1.0000', probability_weight: 20, probability_pct: 20.0, color: '#455A64', is_active: true },
      { position: 2, label: '3x', multiplier: '3.0000', probability_weight: 20, probability_pct: 20.0, color: '#E86D1F', is_active: true },
      { position: 3, label: '5x', multiplier: '5.0000', probability_weight: 15, probability_pct: 15.0, color: '#F5A623', is_active: true },
      { position: 4, label: '10x', multiplier: '10.0000', probability_weight: 5, probability_pct: 5.0, color: '#C9961A', is_active: true },
    ],
  },
  {
    id: '3',
    name: 'Mega Stake (₦2,000+)',
    wheel_type: 'mega',
    min_stake: '2000',
    max_stake: '100000',
    rtp_target: '80.00',
    computed_rtp: '78.00',
    house_edge: '22.00',
    is_active: false,
    total_spins: 120,
    segments: [
      { position: 0, label: 'Loss', multiplier: '0.0000', probability_weight: 50, probability_pct: 50.0, color: '#3a3a3a', is_active: true },
      { position: 1, label: '2x', multiplier: '2.0000', probability_weight: 20, probability_pct: 20.0, color: '#1558BF', is_active: true },
      { position: 2, label: '5x', multiplier: '5.0000', probability_weight: 15, probability_pct: 15.0, color: '#1E73E8', is_active: true },
      { position: 3, label: '10x', multiplier: '10.0000', probability_weight: 10, probability_pct: 10.0, color: '#0D47A1', is_active: true },
      { position: 4, label: '50x', multiplier: '50.0000', probability_weight: 5, probability_pct: 5.0, color: '#F5A623', is_active: true },
    ],
  },
]

// ── Users ─────────────────────────────────────────────────────────────────────

export const MOCK_USERS: AdminUser[] = [
  { id: '41df4f5d-0001-4fc7-b4c5-bd51cde8c040', telegram_id: 1001234567, name: 'Chidi Okonkwo', phone_number: '+2348012345678', registered_on: 'Nov 12, 2025', registered_via: 'Telegram', balance: '45000.00', staked: '89500', kyc_status: 'Done', risk: 'Low', is_active: true },
  { id: '41df4f5d-0002-4fc7-b4c5-bd51cde8c040', telegram_id: 1001234568, name: 'Ngozi Adeyemi', phone_number: '+2348023456789', registered_on: 'Dec 1, 2025', registered_via: 'Telegram', balance: '12000.00', staked: '15600', kyc_status: 'Pending', risk: 'Low', is_active: true },
  { id: '41df4f5d-0003-4fc7-b4c5-bd51cde8c040', telegram_id: 1001234569, name: 'Emeka Eze', phone_number: '+2348034567890', registered_on: 'Oct 5, 2025', registered_via: 'Telegram', balance: '230000.00', staked: '556000', kyc_status: 'Done', risk: 'Medium', is_active: true },
  { id: '41df4f5d-0004-4fc7-b4c5-bd51cde8c040', telegram_id: 1001234570, name: 'Amaka Nwosu', phone_number: '+2348045678901', registered_on: 'Jan 15, 2026', registered_via: 'Telegram', balance: '5000.00', staked: '3200', kyc_status: 'Pending', risk: 'Low', is_active: true },
  { id: '41df4f5d-0005-4fc7-b4c5-bd51cde8c040', telegram_id: 1001234571, name: 'Ifeanyi Obi', phone_number: '+2348056789012', registered_on: 'Sep 20, 2025', registered_via: 'Telegram', balance: '0.00', staked: '1250000', kyc_status: 'Done', risk: 'High', is_active: false },
  { id: '41df4f5d-0006-4fc7-b4c5-bd51cde8c040', telegram_id: 1001234572, name: 'Sola Adesanya', phone_number: '+2348067890123', registered_on: 'Oct 30, 2025', registered_via: 'Telegram', balance: '67000.00', staked: '178000', kyc_status: 'Done', risk: 'Low', is_active: true },
  { id: '41df4f5d-0007-4fc7-b4c5-bd51cde8c040', telegram_id: 1001234573, name: 'Tunde Badmus', phone_number: '+2348078901234', registered_on: 'Feb 10, 2026', registered_via: 'Telegram', balance: '2500.00', staked: '4800', kyc_status: 'Rejected', risk: 'Low', is_active: true },
  { id: '41df4f5d-0008-4fc7-b4c5-bd51cde8c040', telegram_id: 1001234574, name: 'Kemi Okafor', phone_number: '+2348089012345', registered_on: 'Nov 8, 2025', registered_via: 'Telegram', balance: '98000.00', staked: '310000', kyc_status: 'Done', risk: 'Medium', is_active: true },
  { id: '41df4f5d-0009-4fc7-b4c5-bd51cde8c040', telegram_id: 1001234575, name: 'Dayo Adeleke', phone_number: '+2348090123456', registered_on: 'Mar 1, 2026', registered_via: 'Telegram', balance: '8000.00', staked: '9500', kyc_status: 'Pending', risk: 'Low', is_active: true },
  { id: '41df4f5d-0010-4fc7-b4c5-bd51cde8c040', telegram_id: 1001234576, name: 'Femi Adewale', phone_number: '+2348001234567', registered_on: 'Oct 18, 2025', registered_via: 'Telegram', balance: '175000.00', staked: '445000', kyc_status: 'Done', risk: 'Medium', is_active: true },
]

export const MOCK_USER_DETAIL: AdminUserDetail = {
  id: '41df4f5d-0001-4fc7-b4c5-bd51cde8c040',
  telegram_id: 1001234567,
  name: 'Chidi Okonkwo',
  registered_on: 'Nov 12, 2025',
  registered_via: 'Telegram',
  last_login: 'May 6, 2026 20:40',
  wallet: {
    crypto_coins: '12.500000',
    naira_coins: '1250.00',
    bonus_coins: '300.00',
    crypto_withdraw_balance: '0.000000',
    naira_withdraw_balance: '45000.00',
    staked: '89500.00',
  },
  kyc: {
    overall_status: 'approved',
    display_status: 'Done',
    personal_info_status: 'verified',
    bank_account_status: 'verified',
    document_status: 'verified',
    submitted_at: 'Nov 15, 2025',
  },
  risk: 'Low',
  bank_accounts: [
    { id: 'ba1', bank_name: 'Zenith Bank', account_name: 'CHIDI OKONKWO', account_number_masked: '****6789', is_default: true, verified_at: 'Nov 16, 2025' },
  ],
  crypto_wallets: [],
  bank_account: {
    bank_name: 'Zenith Bank',
    account_name: 'CHIDI OKONKWO',
    account_number_masked: '****6789',
    verified_at: 'Nov 16, 2025',
  },
  is_active: true,
  is_staff: false,
}

// ── User spins ────────────────────────────────────────────────────────────────

export const MOCK_USER_SPINS: UserSpinRecord[] = [
  { id: 'usp1', wheel: 'Standard Wheel', stake: '500', result_label: '2x Multiplier', multiplier: '2.0000x', outcome: 'win', win_value: '1000.00', is_welcome_spin: false, date: 'May 5, 2026' },
  { id: 'usp2', wheel: 'Standard Wheel', stake: '200', result_label: 'Loss', multiplier: '0.0000x', outcome: 'loss', win_value: '0.00', is_welcome_spin: false, date: 'May 5, 2026' },
  { id: 'usp3', wheel: 'Power Wheel', stake: '1000', result_label: '5x Multiplier', multiplier: '5.0000x', outcome: 'win', win_value: '5000.00', is_welcome_spin: false, date: 'May 5, 2026' },
  { id: 'usp4', wheel: 'Standard Wheel', stake: '500', result_label: 'Loss', multiplier: '0.0000x', outcome: 'loss', win_value: '0.00', is_welcome_spin: false, date: 'May 5, 2026' },
  { id: 'usp5', wheel: 'Power Wheel', stake: '2000', result_label: '10x Multiplier', multiplier: '10.0000x', outcome: 'win', win_value: '20000.00', is_welcome_spin: false, date: 'May 4, 2026' },
  { id: 'usp6', wheel: 'Standard Wheel', stake: '300', result_label: 'Loss', multiplier: '0.0000x', outcome: 'loss', win_value: '0.00', is_welcome_spin: false, date: 'May 3, 2026' },
]

// ── User transactions ─────────────────────────────────────────────────────────

export const MOCK_USER_TRANSACTIONS: UserTransaction[] = [
  { id: 'tx1', type: 'deposit', label: 'Cash Deposit', amount: '5000.00', is_credit: true, balance_type: 'cash', balance_before: '40000.00', balance_after: '45000.00', status: 'completed', date: 'May 5, 2026' },
  { id: 'tx2', type: 'spin_stake', label: 'Spin Stake', amount: '-500.00', is_credit: false, balance_type: 'cash', balance_before: '45000.00', balance_after: '44500.00', status: 'completed', date: 'May 5, 2026' },
  { id: 'tx3', type: 'spin_win', label: 'Spin Win', amount: '1000.00', is_credit: true, balance_type: 'cash', balance_before: '44500.00', balance_after: '45500.00', status: 'completed', date: 'May 5, 2026' },
  { id: 'tx4', type: 'withdrawal', label: 'Cash Withdrawal', amount: '-3000.00', is_credit: false, balance_type: 'cash', balance_before: '45500.00', balance_after: '42500.00', status: 'completed', date: 'May 5, 2026' },
  { id: 'tx5', type: 'deposit', label: 'Cash Deposit', amount: '10000.00', is_credit: true, balance_type: 'cash', balance_before: '30000.00', balance_after: '40000.00', status: 'completed', date: 'May 4, 2026' },
]

// ── KYC Queue ─────────────────────────────────────────────────────────────────

export const MOCK_KYC: AdminKYCQueueItem[] = [
  {
    id: 'kyc1',
    user_id: '41df4f5d-0002-4fc7-b4c5-bd51cde8c040',
    telegram_id: 1001234568,
    name: 'NGOZI ADEYEMI',
    overall_status: 'partial',
    can_withdraw: false,
    sections: {
      personal_info: { status: 'verified', reason: '' },
      bank_account: { status: 'requires_correction', reason: 'Bank account name does not match identity.', bank_name: 'GTBank', account_name: 'N ADEYEMI', account_masked: '****6789' },
      document: { status: 'verified', reason: '', filename: 'utility_bill.pdf', document_type: 'utility_bill', file_url: '#' },
    },
    submitted_at: 'May 3, 2026',
    last_resubmission_at: null,
  },
  {
    id: 'kyc2',
    user_id: '41df4f5d-0009-4fc7-b4c5-bd51cde8c040',
    telegram_id: 1001234575,
    name: 'DAYO ADELEKE',
    overall_status: 'pending',
    can_withdraw: false,
    sections: {
      personal_info: { status: 'pending', reason: '' },
      bank_account: { status: 'pending', reason: '', bank_name: 'Access Bank', account_name: 'DAYO ADELEKE', account_masked: '****7890' },
      document: { status: 'pending', reason: '', filename: 'id_card.jpg', document_type: 'national_id', file_url: '#' },
    },
    submitted_at: 'May 2, 2026',
    last_resubmission_at: null,
  },
  {
    id: 'kyc3',
    user_id: '41df4f5d-0007-4fc7-b4c5-bd51cde8c040',
    telegram_id: 1001234573,
    name: 'TUNDE BADMUS',
    overall_status: 'rejected',
    can_withdraw: false,
    sections: {
      personal_info: { status: 'verified', reason: '' },
      bank_account: { status: 'rejected', reason: 'Account name does not match provided identity.', bank_name: 'Polaris Bank', account_name: 'T BADMUS', account_masked: '****2345' },
      document: { status: 'verified', reason: '' },
    },
    submitted_at: 'Feb 12, 2026',
    last_resubmission_at: null,
  },
]

// ── Withdrawals ───────────────────────────────────────────────────────────────

const _MOCK_W: Array<Omit<AdminWithdrawal, 'rail' | 'currency' | 'destination' | 'wallet_address' | 'network' | 'tx_hash'>> = [
  { id: 'wd1', name: 'Chidi Okonkwo', user_id: '41df4f5d-0001-4fc7-b4c5-bd51cde8c040', amount: '15000.00', net_amount: '15000.00', bank: 'Zenith', account_masked: '****6789', type: 'Small', risk: 'Low', status: 'pending', status_display: 'Pending Processing', requires_review: true, forced_manual_review: false, reference: 'wd_abc001', requested_at: 'May 6, 2026 09:00', completed_at: null, failure_reason: '' },
  { id: 'wd2', name: 'Emeka Eze', user_id: '41df4f5d-0003-4fc7-b4c5-bd51cde8c040', amount: '50000.00', net_amount: '50000.00', bank: 'GTBank', account_masked: '****8901', type: 'Medium', risk: 'Medium', status: 'pending', status_display: 'Pending Processing', requires_review: false, forced_manual_review: false, reference: 'wd_abc002', requested_at: 'May 6, 2026 08:30', completed_at: null, failure_reason: '' },
  { id: 'wd3', name: 'Sola Adesanya', user_id: '41df4f5d-0006-4fc7-b4c5-bd51cde8c040', amount: '25000.00', net_amount: '25000.00', bank: 'Stanbic IBTC', account_masked: '****9012', type: 'Small', risk: 'Low', status: 'processing', status_display: 'Processing', requires_review: false, forced_manual_review: false, reference: 'wd_abc003', requested_at: 'May 5, 2026 20:00', completed_at: null, failure_reason: '' },
  { id: 'wd4', name: 'Kemi Okafor', user_id: '41df4f5d-0008-4fc7-b4c5-bd51cde8c040', amount: '35000.00', net_amount: '35000.00', bank: 'Fidelity', account_masked: '****0123', type: 'Small', risk: 'Low', status: 'completed', status_display: 'Completed', requires_review: false, forced_manual_review: false, reference: 'wd_abc004', requested_at: 'May 5, 2026 14:00', completed_at: 'May 5, 2026 15:30', failure_reason: '' },
  { id: 'wd5', name: 'Kayode Salami', user_id: '41df4f5d-0010-4fc7-b4c5-bd51cde8c040', amount: '120000.00', net_amount: '120000.00', bank: 'UBA', account_masked: '****4321', type: 'Large', risk: 'High', status: 'pending', status_display: 'Pending Processing', requires_review: true, forced_manual_review: false, reference: 'wd_abc005', requested_at: 'May 6, 2026 07:00', completed_at: null, failure_reason: '' },
  { id: 'wd6', name: 'Ngozi Adeyemi', user_id: '41df4f5d-0002-4fc7-b4c5-bd51cde8c040', amount: '8000.00', net_amount: '8000.00', bank: 'GTBank', account_masked: '****6789', type: 'Small', risk: 'Low', status: 'rejected', status_display: 'Rejected', requires_review: false, forced_manual_review: false, reference: 'wd_abc006', requested_at: 'Apr 28, 2026 10:00', completed_at: null, failure_reason: 'Account name mismatch — KYC name does not match bank account holder.' },
  { id: 'wd7', name: 'Ifeanyi Obi', user_id: '41df4f5d-0005-4fc7-b4c5-bd51cde8c040', amount: '22000.00', net_amount: '22000.00', bank: 'Access Bank', account_masked: '****3344', type: 'Small', risk: 'High', status: 'rejected', status_display: 'Rejected', requires_review: false, forced_manual_review: false, reference: 'wd_abc007', requested_at: 'Apr 30, 2026 11:15', completed_at: null, failure_reason: 'Suspicious activity detected — multiple withdrawal attempts within 24 hours.' },
]

export const MOCK_WITHDRAWALS: AdminWithdrawal[] = _MOCK_W.map((w) => ({
  rail: 'bank' as const,
  currency: 'NGN' as const,
  destination: '',
  wallet_address: '',
  network: '',
  tx_hash: '',
  ...w,
}))

// ── Fraud ─────────────────────────────────────────────────────────────────────

export const MOCK_FRAUD: FraudData = {
  total_flagged: 3,
  flagged_users: [
    { user_id: '41df4f5d-0005-4fc7-b4c5-bd51cde8c040', name: 'Ifeanyi Obi', telegram_id: 1001234571, flag: 'High withdrawal frequency (3 in 7 days)', risk: 'High', flag_type: 'withdrawal_frequency' },
    { user_id: '41df4f5d-0010-4fc7-b4c5-bd51cde8c040', name: 'Kayode Salami', telegram_id: 1001234576, flag: 'Large win ₦120,000', risk: 'High', flag_type: 'large_win' },
    { user_id: '41df4f5d-0007-4fc7-b4c5-bd51cde8c040', name: 'Tunde Badmus', telegram_id: 1001234573, flag: 'KYC section rejected', risk: 'Medium', flag_type: 'kyc_rejected' },
  ],
}

// ── Audit Log ─────────────────────────────────────────────────────────────────

export const MOCK_AUDIT_LOG: AuditLogEntry[] = [
  { id: 'al1', type: 'withdrawal', action: 'Withdrawal approved', detail: '₦15,000 → Zenith Bank', target_user: 'Chidi Okonkwo', target_user_id: '41df4f5d-0001-4fc7-b4c5-bd51cde8c040', performed_by: 'John Mudiagha', notes: 'Manually verified', timestamp: '2026-05-06T09:30:00+01:00', timestamp_display: 'May 6, 2026 09:30' },
  { id: 'al2', type: 'kyc', action: 'KYC approved', detail: 'Overall: approved', target_user: 'Chidi Okonkwo', performed_by: 'John Mudiagha', timestamp: '2026-05-05T14:20:00+01:00', timestamp_display: 'May 5, 2026 14:20' },
  { id: 'al3', type: 'withdrawal', action: 'Withdrawal rejected', detail: '₦8,000 — Account verification failed', target_user: 'Ngozi Adeyemi', target_user_id: '41df4f5d-0002-4fc7-b4c5-bd51cde8c040', performed_by: 'John Mudiagha', timestamp: '2026-05-05T11:00:00+01:00', timestamp_display: 'May 5, 2026 11:00' },
  { id: 'al4', type: 'rtp', action: 'RTP updated', detail: 'Power Wheel — rtp_target 75 → 80', target_user: '', performed_by: 'John Mudiagha', timestamp: '2026-05-04T16:45:00+01:00', timestamp_display: 'May 4, 2026 16:45' },
  { id: 'al5', type: 'kyc', action: 'KYC rejected', detail: 'bank_account — Name mismatch', target_user: 'Tunde Badmus', target_user_id: '41df4f5d-0007-4fc7-b4c5-bd51cde8c040', performed_by: 'John Mudiagha', timestamp: '2026-02-13T10:00:00+01:00', timestamp_display: 'Feb 13, 2026 10:00' },
]

// Revenue breakdown for donut chart (used directly in FinancialsPage from spins_breakdown)
export const MOCK_REVENUE_BREAKDOWN = [
  { name: 'Staked', value: 500, percent: 50, color: '#1A237E' },
  { name: 'Fees', value: 150, percent: 15, color: '#C9961A' },
  { name: 'Won', value: 350, percent: 35, color: '#3de8c4' },
]

// ── Challenges ────────────────────────────────────────────────────────────────

export const MOCK_CHALLENGES: AdminChallenge[] = [
  {
    id: 'ch-001',
    name: 'Daily Spinner',
    description: 'Spin 5 times a day to earn coins',
    type: 'spin_count',
    recurrence: 'daily',
    criteria: { action: 'spin', target_count: 5, per: 'day' },
    reward: { type: 'coins', amount: 200 },
    is_active: true,
    is_visible: true,
    max_completions_per_user: 1,
    starts_at: '2026-05-01T00:00:00Z',
    expires_at: null,
    created_at: '2026-05-01T00:00:00Z',
    participant_count: 142,
    completion_count: 89,
  },
  {
    id: 'ch-002',
    name: 'Bring a Friend',
    description: 'Earn ₦1,000 for every friend who makes their first deposit',
    type: 'referral',
    recurrence: 'permanent',
    criteria: { action: 'referral', target_count: 1 },
    reward: { type: 'cash', amount: 1000 },
    is_active: true,
    is_visible: true,
    max_completions_per_user: null,
    starts_at: '2026-01-01T00:00:00Z',
    expires_at: null,
    created_at: '2026-01-01T00:00:00Z',
    participant_count: 58,
    completion_count: 41,
  },
  {
    id: 'ch-003',
    name: 'Welcome Spin',
    description: 'Take your welcome spin and earn 500 coins',
    type: 'welcome',
    recurrence: 'one_time',
    criteria: { action: 'spin', target_count: 1 },
    reward: { type: 'coins', amount: 500 },
    is_active: true,
    is_visible: true,
    max_completions_per_user: 1,
    starts_at: null,
    expires_at: null,
    created_at: '2026-01-01T00:00:00Z',
    participant_count: 4599,
    completion_count: 4512,
  },
  {
    id: 'ch-004',
    name: '7-Day Login Streak',
    description: 'Log in every day for 7 days to earn ₦500 cash',
    type: 'login_streak',
    recurrence: 'permanent',
    criteria: { action: 'login', target_count: 7 },
    reward: { type: 'cash', amount: 500 },
    is_active: true,
    is_visible: true,
    max_completions_per_user: null,
    starts_at: '2026-03-01T00:00:00Z',
    expires_at: null,
    created_at: '2026-03-01T00:00:00Z',
    participant_count: 320,
    completion_count: 74,
  },
  {
    id: 'ch-005',
    name: 'Big Depositor',
    description: 'Make a ₦10,000 deposit to earn 1,000 coins',
    type: 'deposit',
    recurrence: 'one_time',
    criteria: { action: 'deposit', target_count: 1, min_deposit: '10000.00' },
    reward: { type: 'coins', amount: 1000 },
    is_active: false,
    is_visible: false,
    max_completions_per_user: 1,
    starts_at: '2026-04-01T00:00:00Z',
    expires_at: '2026-04-30T23:59:59Z',
    created_at: '2026-04-01T00:00:00Z',
    participant_count: 23,
    completion_count: 19,
  },
]

export const MOCK_CHALLENGE_PARTICIPANTS = [
  {
    user_id: '41df4f5d-0001-4fc7-b4c5-bd51cde8c040',
    name: 'Chidi Okonkwo',
    telegram_id: 1001234567,
    current_count: 3,
    target_count: 5,
    progress_pct: 60.0,
    is_completed: false,
    completed_at: null,
    reward_claimed: false,
    window_start: '2026-05-16T00:00:00Z',
  },
  {
    user_id: '41df4f5d-0002-4fc7-b4c5-bd51cde8c040',
    name: 'Ngozi Adeyemi',
    telegram_id: 1001234568,
    current_count: 5,
    target_count: 5,
    progress_pct: 100.0,
    is_completed: true,
    completed_at: '2026-05-16T10:23:00Z',
    reward_claimed: true,
    window_start: '2026-05-16T00:00:00Z',
  },
]

export const MOCK_CHALLENGE_COMPLETIONS = [
  {
    user_id: '41df4f5d-0002-4fc7-b4c5-bd51cde8c040',
    name: 'Ngozi Adeyemi',
    telegram_id: 1001234568,
    completed_at: '2026-05-16T10:23:00Z',
    reward_claimed: true,
    reward_claimed_at: '2026-05-16T10:23:01Z',
    window_start: '2026-05-16T00:00:00Z',
  },
  {
    user_id: '41df4f5d-0003-4fc7-b4c5-bd51cde8c040',
    name: 'Emeka Nwosu',
    telegram_id: 1001234569,
    completed_at: '2026-05-15T18:45:00Z',
    reward_claimed: true,
    reward_claimed_at: '2026-05-15T18:45:01Z',
    window_start: '2026-05-15T00:00:00Z',
  },
]

// ── Referrals ────────────────────────────────────────────────────────────────

export const MOCK_REFERRALS: AdminReferral[] = [
  {
    id: 'ref-001',
    referrer: { id: '41df4f5d-0001-4fc7-b4c5-bd51cde8c040', name: 'Chidi Okonkwo', telegram_id: 1001234567 },
    referred_user: { id: '41df4f5d-0003-4fc7-b4c5-bd51cde8c040', name: 'Emeka Nwosu', telegram_id: 1001234569 },
    code: 'SPIN-X7K2M9PQ',
    status: 'rewarded',
    qualified_at: '2026-05-10T10:00:00Z',
    rewarded_at: '2026-05-10T10:00:01Z',
    reward_snapshot: {},
    created_at: '2026-05-08T08:30:00Z',
  },
  {
    id: 'ref-002',
    referrer: { id: '41df4f5d-0001-4fc7-b4c5-bd51cde8c040', name: 'Chidi Okonkwo', telegram_id: 1001234567 },
    referred_user: { id: '41df4f5d-0005-4fc7-b4c5-bd51cde8c040', name: 'Funke Adesanya', telegram_id: 1001234571 },
    code: 'SPIN-X7K2M9PQ',
    status: 'pending',
    qualified_at: null,
    rewarded_at: null,
    reward_snapshot: {},
    created_at: '2026-05-14T11:00:00Z',
  },
  {
    id: 'ref-003',
    referrer: { id: '41df4f5d-0002-4fc7-b4c5-bd51cde8c040', name: 'Ngozi Adeyemi', telegram_id: 1001234568 },
    referred_user: { id: '41df4f5d-0006-4fc7-b4c5-bd51cde8c040', name: 'Bola Tinubu Jr', telegram_id: 1001234572 },
    code: 'SPIN-AB12CD34',
    status: 'qualified',
    qualified_at: '2026-05-15T14:20:00Z',
    rewarded_at: null,
    reward_snapshot: {},
    created_at: '2026-05-13T09:00:00Z',
  },
  {
    id: 'ref-004',
    referrer: { id: '41df4f5d-0004-4fc7-b4c5-bd51cde8c040', name: 'Taiwo Olaolu', telegram_id: 1001234570 },
    referred_user: { id: '41df4f5d-0007-4fc7-b4c5-bd51cde8c040', name: 'Tunde Badmus', telegram_id: 1001234573 },
    code: 'SPIN-QR78ST90',
    status: 'rewarded',
    qualified_at: '2026-05-05T08:00:00Z',
    rewarded_at: '2026-05-05T08:00:02Z',
    reward_snapshot: {},
    created_at: '2026-05-03T16:45:00Z',
  },
  {
    id: 'ref-005',
    referrer: { id: '41df4f5d-0002-4fc7-b4c5-bd51cde8c040', name: 'Ngozi Adeyemi', telegram_id: 1001234568 },
    referred_user: { id: '41df4f5d-0001-4fc7-b4c5-bd51cde8c040', name: 'Chidi Okonkwo', telegram_id: 1001234567 },
    code: 'SPIN-AB12CD34',
    status: 'rejected',
    qualified_at: null,
    rewarded_at: null,
    reward_snapshot: {},
    created_at: '2026-04-20T10:00:00Z',
  },
]

// ── User Rewards (mock data for a specific user's challenges + referrals) ─────

export const MOCK_USER_CHALLENGES: UserChallengeProgress[] = [
  {
    challenge_id: 'ch-001',
    challenge_name: 'Daily Spinner',
    challenge_type: 'spin_count',
    recurrence: 'daily',
    reward: { type: 'coins', amount: 200 },
    current_count: 3,
    target_count: 5,
    progress_pct: 60.0,
    is_completed: false,
    completed_at: null,
    reward_claimed: false,
    reward_claimed_at: null,
  },
  {
    challenge_id: 'ch-003',
    challenge_name: 'Welcome Spin',
    challenge_type: 'welcome',
    recurrence: 'one_time',
    reward: { type: 'coins', amount: 500 },
    current_count: 1,
    target_count: 1,
    progress_pct: 100.0,
    is_completed: true,
    completed_at: '2026-05-01T09:00:00Z',
    reward_claimed: true,
    reward_claimed_at: '2026-05-01T09:00:01Z',
  },
  {
    challenge_id: 'ch-004',
    challenge_name: '7-Day Login Streak',
    challenge_type: 'login_streak',
    recurrence: 'permanent',
    reward: { type: 'cash', amount: 500 },
    current_count: 4,
    target_count: 7,
    progress_pct: 57.14,
    is_completed: false,
    completed_at: null,
    reward_claimed: false,
    reward_claimed_at: null,
  },
  {
    challenge_id: 'ch-002',
    challenge_name: 'Bring a Friend',
    challenge_type: 'referral',
    recurrence: 'permanent',
    reward: { type: 'cash', amount: 1000 },
    current_count: 2,
    target_count: 1,
    progress_pct: 100.0,
    is_completed: true,
    completed_at: '2026-05-10T10:00:01Z',
    reward_claimed: true,
    reward_claimed_at: '2026-05-10T10:00:01Z',
  },
]

export const MOCK_USER_REFERRALS: { stats: { total_referrals: number; pending: number; qualified: number; rewarded: number }; referrals: UserReferralEntry[] } = {
  stats: { total_referrals: 2, pending: 1, qualified: 0, rewarded: 1 },
  referrals: [
    {
      id: 'ref-001',
      referred_user: { id: '41df4f5d-0003-4fc7-b4c5-bd51cde8c040', name: 'Emeka Nwosu', telegram_id: 1001234569 },
      code: 'SPIN-X7K2M9PQ',
      status: 'rewarded',
      qualified_at: '2026-05-10T10:00:00Z',
      rewarded_at: '2026-05-10T10:00:01Z',
      created_at: '2026-05-08T08:30:00Z',
    },
    {
      id: 'ref-002',
      referred_user: { id: '41df4f5d-0005-4fc7-b4c5-bd51cde8c040', name: 'Funke Adesanya', telegram_id: 1001234571 },
      code: 'SPIN-X7K2M9PQ',
      status: 'pending',
      qualified_at: null,
      rewarded_at: null,
      created_at: '2026-05-14T11:00:00Z',
    },
  ],
}
