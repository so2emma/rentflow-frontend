"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { DashboardShell } from '@/components/layout/DashboardShell';
import { MetricCard } from '@/components/ui/MetricCard';
import { getActiveLease, getActiveLeaseTransactions, downloadTenantStatement } from '@/lib/api/leases';
import { getActiveLeaseLedgers } from '@/lib/api/ledgers';
import {logoutUser} from '@/lib/auth/session';
import { useAuthStore } from '@/store/authStore';
import { InboundTransactionDTO, LedgerEntryResponse } from '@/types/api';


const NAV_ITEMS = [
  { id: 'dashboard', label: 'My Dashboard', icon: 'dashboard' },
  { id: 'lease', label: 'Lease Details', icon: 'description' },
  { id: 'history', label: 'Payment History', icon: 'receipt_long' },
];

export default function TenantPaymentHistoryPage() {
  const router = useRouter();
  const user = useAuthStore(s => s.user);

  const [selectedTransaction, setSelectedTransaction] = useState<InboundTransactionDTO | null>(null);
  const [copiedTextId, setCopiedTextId] = useState<string | null>(null);

  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [isDownloading, setIsDownloading] = useState<boolean>(false);
  const [downloadError, setDownloadError] = useState<string | null>(null);

  const handleDownloadStatement = async () => {
    if (!startDate || !endDate) return;
    try {
      setIsDownloading(true);
      setDownloadError(null);
      const blob = await downloadTenantStatement(startDate, endDate);
      
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `tenant-statement-${startDate}-to-${endDate}.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err: any) {
      console.error('Failed to download tenant statement:', err);
      setDownloadError(err?.message || 'Failed to download statement. Please try again.');
    } finally {
      setIsDownloading(false);
    }
  };


  const { data: lease, isLoading: isLeaseLoading } = useQuery({
    queryKey: ['activeLease'],
    queryFn: getActiveLease,
    retry: false,
  });

  const { data: ledgersData, isLoading: isLedgersLoading } = useQuery({
    queryKey: ['activeLeaseLedgers'],
    queryFn: getActiveLeaseLedgers,
    enabled: !!lease,
    retry: false,
  });

  const { data: transactionsData, isLoading: isTransactionsLoading } = useQuery({
    queryKey: ['activeLeaseTransactions'],
    queryFn: () => getActiveLeaseTransactions(),
    enabled: !!lease,
    retry: false,
  });

  const ledgers: LedgerEntryResponse[] = ledgersData || [];
  const transactions: InboundTransactionDTO[] = transactionsData || [];

  const filteredTransactions = transactions.filter((t) => {
    if (!t.transactionTime) return true;
    const txDate = new Date(t.transactionTime);
    if (startDate) {
      const start = new Date(startDate);
      start.setHours(0, 0, 0, 0);
      if (txDate < start) return false;
    }
    if (endDate) {
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      if (txDate > end) return false;
    }
    return true;
  });

  const loading = isLeaseLoading || (!!lease && (isLedgersLoading || isTransactionsLoading));


  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedTextId(id);
    setTimeout(() => setCopiedTextId(null), 2000);
  };

  function handleLogout() {
    logoutUser();
  }

  /* ── Calculations ──────────────────────────────────────────────────── */
  const totalInvoiced = ledgers.reduce((sum, entry) => sum + (entry.amountDue || 0), 0);
  const totalPaid = ledgers.reduce((sum, entry) => sum + (entry.amountPaid || 0), 0);
  const remainingAmount = Math.max(0, totalInvoiced - totalPaid);

  /* ── Loading state ──────────────────────────────────────────────────── */
  if (loading) {
    return (
      <ProtectedRoute allowedRole="ROLE_TENANT">
        <div className="w-full flex items-center justify-center min-h-screen bg-background">
          <div className="font-headline-md text-title-lg font-bold text-brand-deep-slate animate-pulse">
            Loading your payment history…
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  /* ── Render ─────────────────────────────────────────────────────────── */
  return (
    <ProtectedRoute allowedRole="ROLE_TENANT">
      <DashboardShell
        sidebarTitle="RentFlow"
        userLabel="Connected Tenant"
        userEmail={user?.email}
        navItems={NAV_ITEMS}
        activeItem="history"
        onNavChange={(id) => {
          if (id === 'profile') {
            router.push('/tenant/profile');
          } else if (id === 'dashboard' || id === 'lease') {
            router.push('/tenant/dashboard');
          }
        }}
        onSignOut={handleLogout}
      >
        {/* Page header */}
        <div className="flex flex-col gap-1 border-b border-outline-variant pb-6 mb-2">
          <h1 className="font-display-lg text-headline-lg font-bold text-on-surface tracking-tight">Payment History</h1>
          <p className="text-on-surface-variant font-body-lg">
            Track all your successful transactions, payments made, and current balances.
          </p>
        </div>

        {/* No active lease container */}
        {!lease || lease.status === 'REJECTED' ? (
          <div className="bg-surface rounded-lg border border-outline-variant p-14 flex flex-col items-center gap-4 text-center">
            <span className="material-symbols-outlined text-[48px] text-on-surface-variant/50">receipt_long</span>
            <h2 className="font-headline-md text-title-lg font-bold text-on-surface">No Billing History</h2>
            <p className="font-body-md text-on-surface-variant max-w-sm">
              You do not have an active lease assigned, so no billing or payment history is available yet.
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-6">
            {/* Metric Cards Row */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <MetricCard
                label="Total Charged"
                value={`₦${Number(totalInvoiced).toLocaleString()}`}
                sub="Cumulative lease charges"
                icon="receipt_long"
              />
              <MetricCard
                label="Total Paid"
                value={`₦${Number(totalPaid).toLocaleString()}`}
                sub={
                  totalPaid > 0 ? (
                    <span className="flex items-center gap-1 text-secondary">
                      <span className="w-1.5 h-1.5 rounded-full bg-secondary"></span> Successful payments
                    </span>
                  ) : (
                    <span>No payments made yet</span>
                  )
                }
                icon="payments"
              />
              <MetricCard
                label="Outstanding Balance"
                value={`₦${Number(remainingAmount).toLocaleString()}`}
                sub={
                  remainingAmount > 0 ? (
                    <span className="flex items-center gap-1 text-warning">
                      <span className="w-1.5 h-1.5 rounded-full bg-warning"></span> Action required
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-secondary">
                      <span className="w-1.5 h-1.5 rounded-full bg-secondary"></span> Fully settled
                    </span>
                  )
                }
                icon="account_balance_wallet"
              />
            </div>

            {/* Inbound Transactions Section */}
            <section
              className="bg-surface rounded-lg border border-outline-variant overflow-hidden shadow-sm"
              aria-labelledby="history-ledger-title"
            >
              <div className="p-6 border-b border-outline-variant bg-surface-container-lowest flex flex-col xl:flex-row xl:items-center justify-between gap-4">
                <div className="flex-1 min-w-[280px]">
                  <h2 id="history-ledger-title" className="font-headline-md text-title-lg font-bold text-on-surface">
                    Successful Inbound Payments
                  </h2>
                  <p className="font-body-sm text-on-surface-variant mt-0.5">
                    A list of all direct transfers recognized by your virtual deposit account.
                  </p>
                </div>
                
                {/* Date Filters and Download Button */}
                <div className="flex flex-wrap items-center gap-3">
                  <div className="flex items-center gap-2">
                    <label htmlFor="tenant-start-date" className="text-xs font-semibold text-on-surface-variant">From</label>
                    <input
                      type="date"
                      id="tenant-start-date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="px-3 py-2 border border-outline-variant rounded-lg bg-surface-container-lowest text-on-surface outline-none transition-colors duration-[150ms] focus:border-primary focus:ring-1 focus:ring-primary text-sm min-h-[40px]"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <label htmlFor="tenant-end-date" className="text-xs font-semibold text-on-surface-variant">To</label>
                    <input
                      type="date"
                      id="tenant-end-date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="px-3 py-2 border border-outline-variant rounded-lg bg-surface-container-lowest text-on-surface outline-none transition-colors duration-[150ms] focus:border-primary focus:ring-1 focus:ring-primary text-sm min-h-[40px]"
                    />
                  </div>
                  {(startDate || endDate) && (
                    <button
                      onClick={() => { setStartDate(''); setEndDate(''); setDownloadError(null); }}
                      className="px-3 py-2 border border-outline-variant hover:bg-surface-variant/20 text-on-surface-variant font-label-md font-semibold text-sm rounded-lg transition-colors min-h-[40px]"
                    >
                      Clear
                    </button>
                  )}
                  <div className="flex flex-col">
                    <button
                      onClick={handleDownloadStatement}
                      disabled={isDownloading || !startDate || !endDate}
                      className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#1e293b] hover:bg-[#0f172a] disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-label-md font-semibold text-sm rounded-lg transition-colors shadow-sm min-h-[40px]"
                    >
                      {isDownloading ? (
                        <>
                          <span className="animate-spin mr-1 h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                          Downloading...
                        </>
                      ) : (
                        <>
                          <span className="material-symbols-outlined text-[18px]">download</span>
                          Download CSV Statement
                        </>
                      )}
                    </button>
                    {downloadError && (
                      <span className="text-error text-[11px] mt-1 font-medium">{downloadError}</span>
                    )}
                  </div>
                  {lease.nombaVactNumber && (
                    <div className="bg-[#e6f4ea] text-[#137333] px-4 py-2.5 rounded-xl border border-[#ceead6] flex items-center gap-2 text-xs font-semibold max-w-fit">
                      <span className="material-symbols-outlined text-[18px]">info</span>
                      <span>Virtual Rent Account: <strong>{lease.nombaVactNumber}</strong></span>
                    </div>
                  )}
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-surface-container-low/50">
                      <th className="px-6 py-4 text-on-surface-variant font-label-md text-label-md border-b border-surface-container-high">Payment Date</th>
                      <th className="px-6 py-4 text-on-surface-variant font-label-md text-label-md border-b border-surface-container-high">Sender Name</th>
                      <th className="px-6 py-4 text-on-surface-variant font-label-md text-label-md border-b border-surface-container-high">Bank / Account</th>
                      <th className="px-6 py-4 text-on-surface-variant font-label-md text-label-md border-b border-surface-container-high">Transaction ID</th>
                      <th className="px-6 py-4 text-on-surface-variant font-label-md text-label-md border-b border-surface-container-high text-right">Amount Paid</th>
                      <th className="px-6 py-4 text-on-surface-variant font-label-md text-label-md border-b border-surface-container-high text-center">Receipt</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-surface-container-high">
                    {filteredTransactions.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="px-6 py-12 text-center">
                          <div className="flex flex-col items-center gap-3 text-on-surface-variant">
                            <span className="material-symbols-outlined text-[48px] text-on-surface-variant/30">payments</span>
                            <div>
                              <strong className="block text-on-surface font-body-lg">
                                {startDate || endDate ? 'No transactions match' : 'No payment history'}
                              </strong>
                              <p className="font-body-md">
                                {startDate || endDate
                                  ? 'Try choosing a different date range.'
                                  : 'You have not completed any virtual account transfers yet.'}
                              </p>
                            </div>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      filteredTransactions.map((t) => (
                        <tr key={t.id} className="hover:bg-surface-container-low/20 transition-colors group">
                          <td className="px-6 py-4 font-body-md text-on-surface">
                            {new Date(t.transactionTime).toLocaleString()}
                          </td>
                          <td className="px-6 py-4 font-body-md text-on-surface font-semibold capitalize">
                            {t.senderName || 'Unknown Sender'}
                          </td>
                          <td className="px-6 py-4 font-body-md text-on-surface-variant">
                            {t.senderBankName ? `${t.senderBankName} / ${t.senderAccountNumber}` : '—'}
                          </td>
                          <td className="px-6 py-4 font-code-md text-on-surface-variant text-sm truncate max-w-[150px]" title={t.nombaTransactionId}>
                            {t.nombaTransactionId || '—'}
                          </td>
                          <td className="px-6 py-4 font-code-md tabular-nums text-secondary text-right font-semibold">
                            ₦{Number(t.amount).toLocaleString()}
                          </td>
                          <td className="px-6 py-4 text-center">
                            <button
                              onClick={() => setSelectedTransaction(t)}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#f1f5f9] hover:bg-[#e2e8f0] text-slate-800 border border-[#cbd5e1] font-label-md font-semibold text-xs rounded-lg transition-colors shadow-sm"
                            >
                              <span className="material-symbols-outlined text-[16px]">receipt</span>
                              View Details
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

            </section>
          </div>
        )}
      </DashboardShell>

      {/* Transaction Details Modal */}
      {selectedTransaction && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-surface rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="p-6 border-b border-outline-variant flex justify-between items-center">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[#137333]">check_circle</span>
                <h3 className="font-headline-sm text-title-lg font-bold text-on-surface">Payment Receipt</h3>
              </div>
              <button
                onClick={() => setSelectedTransaction(null)}
                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-surface-variant text-on-surface-variant transition-colors"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 flex flex-col gap-6 bg-surface-container-lowest">
              {/* Receipt Amount Header */}
              <div className="flex flex-col items-center justify-center text-center p-6 bg-[#f8fafc] border border-outline-variant/60 rounded-2xl">
                <p className="font-label-md text-xs text-on-surface-variant uppercase tracking-wider font-semibold">
                  Amount Transferred
                </p>
                <div className="font-display-lg text-headline-lg font-bold text-secondary tracking-tight mt-1.5">
                  ₦{Number(selectedTransaction.amount).toLocaleString()}
                </div>
                <div className="mt-2.5 inline-flex items-center gap-1 px-2.5 py-1 bg-secondary-fixed/20 text-on-secondary-fixed-variant rounded-full text-[10px] uppercase font-bold tracking-widest">
                  <span className="w-1.5 h-1.5 rounded-full bg-secondary-fixed-dim"></span>
                  SUCCESSFUL
                </div>
              </div>

              {/* Transaction Metadata */}
              <div className="flex flex-col gap-3 font-body-md text-on-surface">
                <div className="flex justify-between border-b border-outline-variant/20 py-2">
                  <span className="text-on-surface-variant">Payment Date:</span>
                  <span className="font-medium text-right">
                    {new Date(selectedTransaction.transactionTime).toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between border-b border-outline-variant/20 py-2">
                  <span className="text-on-surface-variant">Sender Account Name:</span>
                  <span className="font-semibold capitalize text-right">
                    {selectedTransaction.senderName || '—'}
                  </span>
                </div>
                <div className="flex justify-between border-b border-outline-variant/20 py-2">
                  <span className="text-on-surface-variant">Sender Bank / Account:</span>
                  <span className="font-medium text-right">
                    {selectedTransaction.senderBankName ? `${selectedTransaction.senderBankName} (${selectedTransaction.senderAccountNumber})` : '—'}
                  </span>
                </div>
                <div className="flex justify-between border-b border-outline-variant/20 py-2 items-center">
                  <span className="text-on-surface-variant">Nomba Transaction ID:</span>
                  <div className="flex items-center gap-1.5 justify-end">
                    <span className="font-code-md text-xs bg-[#f1f5f9] px-2 py-0.5 rounded select-all font-semibold">
                      {selectedTransaction.nombaTransactionId || '—'}
                    </span>
                    {selectedTransaction.nombaTransactionId && (
                      <button
                        onClick={() => handleCopy(selectedTransaction.nombaTransactionId, 'receipt-ref')}
                        className="p-1 text-on-surface-variant hover:text-on-surface rounded hover:bg-[#e2e8f0] transition-colors"
                        title="Copy Transaction ID"
                      >
                        <span className="material-symbols-outlined text-[14px]">
                          {copiedTextId === 'receipt-ref' ? 'check' : 'content_copy'}
                        </span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="p-6 bg-surface border-t border-outline-variant flex justify-end gap-3">
              <button
                onClick={() => window.print()}
                className="px-4 py-2 border border-[#cbd5e1] hover:bg-[#f8fafc] text-slate-700 font-label-lg font-semibold rounded-xl transition-colors flex items-center gap-1.5 shadow-sm"
              >
                <span className="material-symbols-outlined text-[18px]">print</span>
                Print Receipt
              </button>
              <button
                onClick={() => setSelectedTransaction(null)}
                className="px-5 py-2 bg-[#1e293b] hover:bg-[#0f172a] text-white font-label-lg font-semibold rounded-xl transition-colors shadow-sm"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </ProtectedRoute>
  );
}
