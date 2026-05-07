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
} from '@/types'

// ── Dashboard ────────────────────────────────────────────────────────────────

export const MOCK_DASHBOARD: AdminDashboard = {
  kpis: {
    total_revenue: '2400500.00',
    total_revenue_change_pct: '2.0',
    net_profit: '1300000.00',
    current_rtp: '70.0%',
    active_users: 4599,
    active_users_change_pct: '52.0',
    new_users_today: 52,
  },
  profit_trend: [
    { month: 'Jan', year: 2026, value: '180000.00' },
    { month: 'Feb', year: 2026, value: '220000.00' },
    { month: 'Mar', year: 2026, value: '310000.00' },
    { month: 'Apr', year: 2026, value: '270000.00' },
    { month: 'May', year: 2026, value: '350000.00' },
    { month: 'Jun', year: 2026, value: '400000.00' },
    { month: 'Jul', year: 2026, value: '480000.00' },
    { month: 'Aug', year: 2026, value: '420000.00' },
    { month: 'Sep', year: 2026, value: '510000.00' },
    { month: 'Oct', year: 2026, value: '560000.00' },
    { month: 'Nov', year: 2026, value: '530000.00' },
    { month: 'Dec', year: 2026, value: '620000.00' },
  ],
  recent_spins: [
    { id: 'sp1', user: 'Chidi Okonkwo', stake: '500.00', result: '2x', multiplier: '2.0000', win_value: '1000.00', outcome: 'win', date: 'May 4, 2026' },
    { id: 'sp2', user: 'Ngozi Adeyemi', stake: '200.00', result: 'Loss', multiplier: '0.0000', win_value: '0.00', outcome: 'loss', date: 'May 4, 2026' },
    { id: 'sp3', user: 'Emeka Eze', stake: '1000.00', result: '5x', multiplier: '5.0000', win_value: '5000.00', outcome: 'win', date: 'May 4, 2026' },
    { id: 'sp4', user: 'Sola Adesanya', stake: '500.00', result: 'Loss', multiplier: '0.0000', win_value: '0.00', outcome: 'loss', date: 'May 4, 2026' },
    { id: 'sp5', user: 'Kemi Okafor', stake: '1000.00', result: '2x', multiplier: '2.0000', win_value: '2000.00', outcome: 'win', date: 'May 4, 2026' },
    { id: 'sp6', user: 'Dayo Adeleke', stake: '300.00', result: 'Loss', multiplier: '0.0000', win_value: '0.00', outcome: 'loss', date: 'May 4, 2026' },
  ],
  top_winners: [
    { user: 'Emeka Eze', win_value: '50000.00' },
    { user: 'Kayode Salami', win_value: '35000.00' },
    { user: 'Kemi Okafor', win_value: '20000.00' },
  ],
}

// ── Financials ────────────────────────────────────────────────────────────────

export const MOCK_FINANCIALS: AdminFinancials = {
  kpis: {
    total_deposits: '2400500.00',
    total_deposits_change_pct: '2.0',
    total_withdrawals: '1300000.00',
    total_withdrawals_change_pct: '2.0',
    pending_withdrawals: '350000.00',
  },
  spins_breakdown: {
    total_staked: '500000.00',
    total_won: '350000.00',
    house_fees: '150000.00',
    spin_count_total: 2050,
    spin_count_wins: 450,
    spin_count_losses: 800,
  },
  cash_flow: {
    deposits: [
      { month: 'Jan', year: 2026, value: '1800000.00' },
      { month: 'Feb', year: 2026, value: '1500000.00' },
      { month: 'Mar', year: 2026, value: '2100000.00' },
      { month: 'Apr', year: 2026, value: '1700000.00' },
      { month: 'May', year: 2026, value: '2300000.00' },
      { month: 'Jun', year: 2026, value: '2600000.00' },
    ],
    withdrawals: [
      { month: 'Jan', year: 2026, value: '600000.00' },
      { month: 'Feb', year: 2026, value: '520000.00' },
      { month: 'Mar', year: 2026, value: '650000.00' },
      { month: 'Apr', year: 2026, value: '600000.00' },
      { month: 'May', year: 2026, value: '650000.00' },
      { month: 'Jun', year: 2026, value: '800000.00' },
    ],
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
  cash_balance: '45000.00',
  coin_balance: '1250.00',
  total_balance: '46250.00',
  staked: '89500',
  kyc: {
    overall_status: 'approved',
    display_status: 'Done',
    personal_info_status: 'verified',
    bank_account_status: 'verified',
    document_status: 'verified',
    submitted_at: 'Nov 15, 2025',
  },
  risk: 'Low',
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

export const MOCK_WITHDRAWALS: AdminWithdrawal[] = [
  { id: 'wd1', name: 'Chidi Okonkwo', user_id: '41df4f5d-0001-4fc7-b4c5-bd51cde8c040', amount: '15000.00', net_amount: '15000.00', bank: 'Zenith', account_masked: '****6789', type: 'Small', risk: 'Low', status: 'pending_review', status_display: 'Pending Review (Admin)', requires_review: true, forced_manual_review: true, reference: 'wd_abc001', requested_at: 'May 6, 2026 09:00', completed_at: null, failure_reason: '' },
  { id: 'wd2', name: 'Emeka Eze', user_id: '41df4f5d-0003-4fc7-b4c5-bd51cde8c040', amount: '50000.00', net_amount: '50000.00', bank: 'GTBank', account_masked: '****8901', type: 'Medium', risk: 'Medium', status: 'pending_review', status_display: 'Pending Review (Admin)', requires_review: true, forced_manual_review: false, reference: 'wd_abc002', requested_at: 'May 6, 2026 08:30', completed_at: null, failure_reason: '' },
  { id: 'wd3', name: 'Sola Adesanya', user_id: '41df4f5d-0006-4fc7-b4c5-bd51cde8c040', amount: '25000.00', net_amount: '25000.00', bank: 'Stanbic IBTC', account_masked: '****9012', type: 'Small', risk: 'Low', status: 'processing', status_display: 'Processing', requires_review: false, forced_manual_review: false, reference: 'wd_abc003', requested_at: 'May 5, 2026 20:00', completed_at: null, failure_reason: '' },
  { id: 'wd4', name: 'Kemi Okafor', user_id: '41df4f5d-0008-4fc7-b4c5-bd51cde8c040', amount: '35000.00', net_amount: '35000.00', bank: 'Fidelity', account_masked: '****0123', type: 'Small', risk: 'Low', status: 'completed', status_display: 'Completed', requires_review: false, forced_manual_review: false, reference: 'wd_abc004', requested_at: 'May 5, 2026 14:00', completed_at: 'May 5, 2026 15:30', failure_reason: '' },
  { id: 'wd5', name: 'Kayode Salami', user_id: '41df4f5d-0010-4fc7-b4c5-bd51cde8c040', amount: '120000.00', net_amount: '120000.00', bank: 'UBA', account_masked: '****4321', type: 'Large', risk: 'High', status: 'pending_review', status_display: 'Pending Review (Admin)', requires_review: true, forced_manual_review: true, reference: 'wd_abc005', requested_at: 'May 6, 2026 07:00', completed_at: null, failure_reason: '' },
  { id: 'wd6', name: 'Ngozi Adeyemi', user_id: '41df4f5d-0002-4fc7-b4c5-bd51cde8c040', amount: '8000.00', net_amount: '8000.00', bank: 'GTBank', account_masked: '****6789', type: 'Small', risk: 'Low', status: 'failed', status_display: 'Failed', requires_review: false, forced_manual_review: false, reference: 'wd_abc006', requested_at: 'Apr 28, 2026 10:00', completed_at: null, failure_reason: 'Bank transfer failed' },
]

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
