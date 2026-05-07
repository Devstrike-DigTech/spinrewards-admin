import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { ArrowLeft, Phone, Shield, CreditCard } from 'lucide-react'
import { usersApi } from '@/api/index'
import type { AdminUserDetail, UserSpinRecord, UserTransaction } from '@/types'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Pagination } from '@/components/Pagination'
import { formatCurrency } from '@/lib/utils'

type TabType = 'spins' | 'transactions'

function KYCBadge({ status }: { status: string }) {
  if (status === 'Done' || status === 'approved') return <Badge variant="success">KYC Verified</Badge>
  if (status === 'Pending' || status === 'pending') return <Badge variant="warning">KYC Pending</Badge>
  if (status === 'Rejected' || status === 'rejected') return <Badge variant="destructive">KYC Rejected</Badge>
  return <Badge variant="secondary">Not Submitted</Badge>
}

function RiskBadge({ risk }: { risk: string }) {
  if (risk === 'Low') return <Badge variant="success">Low Risk</Badge>
  if (risk === 'Medium') return <Badge variant="warning">Medium Risk</Badge>
  if (risk === 'High') return <Badge variant="destructive">High Risk</Badge>
  return <Badge variant="secondary">{risk}</Badge>
}

function OutcomeChip({ outcome }: { outcome: 'win' | 'loss' }) {
  return outcome === 'win' ? (
    <span className="inline-flex items-center rounded-md px-2 py-0.5 text-xs font-semibold bg-emerald-500/20 text-emerald-400">Win</span>
  ) : (
    <span className="inline-flex items-center rounded-md px-2 py-0.5 text-xs font-semibold bg-red-500/20 text-red-400">Loss</span>
  )
}

const PAGE_SIZE = 10

export function UserDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState<TabType>('spins')
  const [spinsPage, setSpinsPage] = useState(1)
  const [txPage, setTxPage] = useState(1)

  const { data: user, isLoading: userLoading } = useQuery<AdminUserDetail>({
    queryKey: ['user', id],
    queryFn: () => usersApi.detail(id!),
    enabled: !!id,
  })

  const { data: spinsData, isLoading: spinsLoading } = useQuery({
    queryKey: ['user-spins', id, spinsPage],
    queryFn: () => usersApi.spins(id!, spinsPage),
    enabled: !!id && activeTab === 'spins',
  })

  const { data: txData, isLoading: txLoading } = useQuery({
    queryKey: ['user-transactions', id, txPage],
    queryFn: () => usersApi.transactions(id!, txPage),
    enabled: !!id && activeTab === 'transactions',
  })

  const spinsTotalPages = spinsData ? Math.ceil(spinsData.count / PAGE_SIZE) : 1
  const txTotalPages = txData ? Math.ceil(txData.count / PAGE_SIZE) : 1

  const initials = user
    ? user.name.split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase()
    : '?'

  return (
    <div className="space-y-5">
      <button
        onClick={() => navigate('/users')}
        className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Users
      </button>

      <div className="flex flex-col xl:flex-row gap-5">
        {/* Left: tabs */}
        <div className="flex-1 min-w-0 space-y-4">
          <div className="flex rounded-lg overflow-hidden border border-[#1e2a4a] w-fit">
            {(['spins', 'transactions'] as TabType[]).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-5 py-2 text-sm font-medium transition-colors capitalize ${
                  activeTab === tab ? 'bg-gold text-white' : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {tab === 'spins' ? 'Recent Spins' : 'Transactions'}
              </button>
            ))}
          </div>

          {/* Spins tab */}
          {activeTab === 'spins' && (
            <Card className="bg-card border-[#1e2a4a]">
              <CardContent className="p-0">
                {spinsLoading ? (
                  <div className="space-y-2 p-4">
                    {[1, 2, 3, 4, 5].map((i) => <Skeleton key={i} className="h-10 w-full" />)}
                  </div>
                ) : (
                  <>
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-[#1e2a4a]">
                          <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Wheel</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Stake</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Result</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Outcome</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Win</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Date</th>
                        </tr>
                      </thead>
                      <tbody>
                        {((spinsData?.results ?? []) as UserSpinRecord[]).map((spin) => (
                          <tr key={spin.id} className="border-b border-[#1e2a4a]/50 last:border-0 hover:bg-white/2">
                            <td className="px-4 py-3 text-xs text-muted-foreground">{spin.wheel}</td>
                            <td className="px-4 py-3 font-medium">{formatCurrency(spin.stake)}</td>
                            <td className="px-4 py-3 text-xs text-muted-foreground">{spin.result_label}</td>
                            <td className="px-4 py-3"><OutcomeChip outcome={spin.outcome} /></td>
                            <td className="px-4 py-3">
                              {spin.outcome === 'win' ? (
                                <span className="font-semibold text-emerald-400">{formatCurrency(spin.win_value)}</span>
                              ) : (
                                <span className="text-muted-foreground">—</span>
                              )}
                            </td>
                            <td className="px-4 py-3 text-xs text-muted-foreground">{spin.date}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    {(spinsData?.results?.length ?? 0) === 0 && (
                      <p className="py-8 text-center text-muted-foreground text-sm">No spins found.</p>
                    )}
                  </>
                )}
              </CardContent>
              <Pagination page={spinsPage} totalPages={spinsTotalPages} onPageChange={setSpinsPage} className="py-4" />
            </Card>
          )}

          {/* Transactions tab */}
          {activeTab === 'transactions' && (
            <Card className="bg-card border-[#1e2a4a]">
              <CardContent className="p-4 space-y-3">
                {txLoading ? (
                  <div className="space-y-2">
                    {[1, 2, 3, 4, 5].map((i) => <Skeleton key={i} className="h-12 w-full" />)}
                  </div>
                ) : (
                  <>
                    {((txData?.results ?? []) as UserTransaction[]).map((tx) => (
                      <div
                        key={tx.id}
                        className="flex items-center gap-3 rounded-lg px-3 py-3 hover:bg-white/3 border border-transparent hover:border-[#1e2a4a] transition-all"
                      >
                        <div
                          className="flex h-8 w-8 items-center justify-center rounded-full text-sm shrink-0"
                          style={{
                            background: tx.is_credit ? '#22c55e22' : '#ef444422',
                            color: tx.is_credit ? '#22c55e' : '#ef4444',
                          }}
                        >
                          {tx.is_credit ? '↓' : '↑'}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-white">{tx.label}</p>
                          <p className="text-xs text-muted-foreground">{tx.date}</p>
                        </div>
                        <div className="text-right shrink-0">
                          <span
                            className="font-semibold text-sm"
                            style={{ color: tx.is_credit ? '#22c55e' : '#ef4444' }}
                          >
                            {tx.is_credit ? '+' : ''}{formatCurrency(tx.amount)}
                          </span>
                          <p className="text-xs text-muted-foreground capitalize">{tx.status}</p>
                        </div>
                      </div>
                    ))}
                    {(txData?.results?.length ?? 0) === 0 && (
                      <p className="py-8 text-center text-muted-foreground text-sm">No transactions found.</p>
                    )}
                  </>
                )}
              </CardContent>
              <Pagination page={txPage} totalPages={txTotalPages} onPageChange={setTxPage} className="py-4" />
            </Card>
          )}
        </div>

        {/* Right: user sidebar */}
        <div className="xl:w-72 space-y-4 shrink-0">
          <Card className="bg-card border-[#1e2a4a]">
            <CardContent className="p-5 space-y-4">
              {userLoading ? (
                <div className="space-y-3">
                  <Skeleton className="h-16 w-16 rounded-full mx-auto" />
                  <Skeleton className="h-6 w-40 mx-auto" />
                  <Skeleton className="h-4 w-32 mx-auto" />
                </div>
              ) : user ? (
                <>
                  <div className="flex flex-col items-center text-center">
                    <div
                      className="flex h-16 w-16 items-center justify-center rounded-full text-2xl font-bold text-white mb-3"
                      style={{ background: '#1A237E' }}
                    >
                      {initials}
                    </div>
                    <h2 className="text-xl font-bold text-white">{user.name}</h2>
                    <p className="text-xs text-muted-foreground mt-1">
                      TG: #{user.telegram_id}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Joined {user.registered_on}
                    </p>
                  </div>

                  <div className="border-t border-[#1e2a4a] pt-4 space-y-3">
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-muted-foreground shrink-0" />
                      <span className="text-sm font-mono text-foreground">—</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <KYCBadge status={user.kyc.display_status} />
                      <RiskBadge risk={user.risk} />
                      {!user.is_active && (
                        <Badge variant="destructive">Inactive</Badge>
                      )}
                    </div>
                  </div>

                  {/* Balance cards */}
                  <div className="space-y-2">
                    <div
                      className="rounded-xl px-4 py-3"
                      style={{ background: 'rgba(201, 150, 26, 0.1)', border: '1px solid rgba(201, 150, 26, 0.2)' }}
                    >
                      <p className="text-xs text-muted-foreground">Cash Balance</p>
                      <p className="text-xl font-bold mt-0.5" style={{ color: '#C9961A' }}>
                        {formatCurrency(user.cash_balance)}
                      </p>
                    </div>
                    <div
                      className="rounded-xl px-4 py-3"
                      style={{ background: 'rgba(26, 35, 126, 0.2)', border: '1px solid rgba(26, 35, 126, 0.4)' }}
                    >
                      <p className="text-xs text-muted-foreground">Coin Balance</p>
                      <p className="text-xl font-bold text-white mt-0.5">
                        {parseFloat(user.coin_balance).toLocaleString()} coins
                      </p>
                    </div>
                    <div className="rounded-xl px-4 py-3 border border-[#1e2a4a]">
                      <p className="text-xs text-muted-foreground">Total Balance</p>
                      <p className="text-lg font-bold text-white mt-0.5">
                        {formatCurrency(user.total_balance)}
                      </p>
                    </div>
                  </div>

                  {/* KYC details */}
                  <div className="border-t border-[#1e2a4a] pt-4 space-y-2">
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">KYC Details</p>
                    {[
                      ['Personal Info', user.kyc.personal_info_status],
                      ['Bank Account', user.kyc.bank_account_status],
                      ['Document', user.kyc.document_status],
                    ].map(([label, status]) => (
                      <div key={label} className="flex items-center justify-between">
                        <span className="text-xs text-muted-foreground">{label}</span>
                        <span className={`text-xs font-medium ${
                          status === 'verified' ? 'text-emerald-400' :
                          status === 'rejected' ? 'text-red-400' :
                          status === 'requires_correction' ? 'text-amber-400' :
                          'text-muted-foreground'
                        }`}>
                          {status}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Bank account */}
                  {user.bank_account && (
                    <div className="border-t border-[#1e2a4a] pt-4 space-y-1">
                      <div className="flex items-center gap-2 mb-2">
                        <CreditCard className="h-4 w-4 text-muted-foreground" />
                        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Bank Account</p>
                      </div>
                      <p className="text-sm font-medium text-white">{user.bank_account.account_name}</p>
                      <p className="text-xs text-muted-foreground">
                        {user.bank_account.bank_name} · {user.bank_account.account_number_masked}
                      </p>
                      <p className="text-xs text-muted-foreground">Verified {user.bank_account.verified_at}</p>
                    </div>
                  )}

                  {/* Last login */}
                  <div className="border-t border-[#1e2a4a] pt-3 flex items-center gap-2">
                    <Shield className="h-4 w-4 text-muted-foreground" />
                    <p className="text-xs text-muted-foreground">Last login: {user.last_login}</p>
                  </div>
                </>
              ) : null}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
