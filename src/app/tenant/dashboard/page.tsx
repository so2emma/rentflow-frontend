"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { DashboardShell } from '@/components/layout/DashboardShell';
import { MetricCard } from '@/components/ui/MetricCard';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { getActiveLease, approveLease, rejectLease, contestLease } from '@/lib/api/leases';
import { getActiveLeaseLedgers } from '@/lib/api/ledgers';
import { clearSession } from '@/lib/auth/session';
import { useAuthStore } from '@/store/authStore';
import { LedgerEntryResponse } from '@/types/api';

const NAV_ITEMS = [
  { id: 'dashboard', label: 'My Dashboard', icon: 'dashboard' },
  { id: 'lease', label: 'Lease Details', icon: 'description' },
  { id: 'history', label: 'Payment History', icon: 'receipt_long' },
];

export default function TenantDashboardPage() {
  const router = useRouter();
  const user = useAuthStore(s => s.user);
  const queryClient = useQueryClient();

  const [activeTab, setActiveTab] = useState('dashboard');
  const [showContestModal, setShowContestModal] = useState(false);
  const [contestReason, setContestReason] = useState('');
  const [copiedItem, setCopiedItem] = useState<'account' | 'all' | null>(null);

  const handleCopy = (text: string, type: 'account' | 'all') => {
    navigator.clipboard.writeText(text);
    setCopiedItem(type);
    setTimeout(() => setCopiedItem(null), 2000);
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

  const ledgers: LedgerEntryResponse[] = ledgersData || [];
  const loading = isLeaseLoading || (!!lease && isLedgersLoading);

  const approveMutation = useMutation({
    mutationFn: (id: string) => approveLease(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['activeLease'] });
      queryClient.invalidateQueries({ queryKey: ['activeLeaseLedgers'] });
    }
  });

  const rejectMutation = useMutation({
    mutationFn: (id: string) => rejectLease(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['activeLease'] });
      queryClient.invalidateQueries({ queryKey: ['activeLeaseLedgers'] });
    }
  });

  const contestMutation = useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) => contestLease(id, reason),
    onSuccess: () => {
      setShowContestModal(false);
      setContestReason('');
      queryClient.invalidateQueries({ queryKey: ['activeLease'] });
      queryClient.invalidateQueries({ queryKey: ['activeLeaseLedgers'] });
    }
  });

  function handleLogout() {
    clearSession();
    router.replace('/login');
  }

  /* ── Derived values ─────────────────────────────────────────────────── */

  const virtualAccountBank = lease?.nombaVactBank ?? '—';
  const virtualAccountNumber = lease?.nombaVactNumber ?? 'Pending...';
  const virtualAccountRef = lease?.nombaVactRef ?? '—';
  const rentAmount = lease?.baseRent ?? 0;

  const outstandingAmount = ledgers
    .filter((e) => e.status !== 'PAID')
    .reduce((sum, e) => sum + (e.amountDue - e.amountPaid), 0);

  const nextDueEntry = ledgers
    .filter((e) => e.status !== 'PAID')
    .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())[0];
  const nextDueDate = nextDueEntry?.dueDate ?? '—';

  /* ── Loading state ──────────────────────────────────────────────────── */

  if (loading) {
    return (
      <ProtectedRoute allowedRole="ROLE_TENANT">
        <div className="w-full flex items-center justify-center min-h-screen bg-background">
          <div className="font-headline-md text-title-lg font-bold text-brand-deep-slate animate-pulse">
            Loading your dashboard…
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
        activeItem={activeTab}
        onNavChange={(id) => {
          if (id === 'profile') {
            router.push('/tenant/profile');
          } else if (id === 'history') {
            router.push('/tenant/history');
          } else {
            setActiveTab(id);
          }
        }}
        onSignOut={handleLogout}
      >
        {/* Page header */}
        <div className="flex flex-col gap-1 border-b border-outline-variant pb-6 mb-2">
          <h1 className="font-display-lg text-headline-lg font-bold text-on-surface tracking-tight">Tenant Portal</h1>
          <p className="text-on-surface-variant font-body-lg">
            Monitor your active lease agreement, virtual account, and payment ledger.
          </p>
        </div>

        {/* No active lease */}
        {!lease || lease.status === 'REJECTED' ? (
          <div className="bg-surface rounded-lg border border-outline-variant p-14 flex flex-col items-center gap-4 text-center">
            <span className="material-symbols-outlined text-[48px] text-on-surface-variant/50">document_scanner</span>
            <h2 className="font-headline-md text-title-lg font-bold text-on-surface">No Active Lease</h2>
            <p className="font-body-md text-on-surface-variant max-w-sm">
              No active lease or virtual account has been assigned to your account yet.
              Please contact your landlord.
            </p>
          </div>
        ) : lease.status === 'PENDING_APPROVAL' || lease.status === 'CONTESTED' ? (
          <div className="flex flex-col gap-6 mt-4">
            {/* Card 1: Review & Approve */}
            <div className="bg-surface rounded-2xl border border-outline-variant p-8 shadow-sm flex flex-col lg:flex-row gap-8 items-start">
              <div className="flex-1 flex gap-5">
                <div className="shrink-0 w-16 h-16 bg-[#e6f4ea] rounded-2xl flex items-center justify-center">
                  <span className="material-symbols-outlined text-3xl text-[#137333]">description</span>
                </div>
                <div className="flex flex-col gap-2">
                  <div className="text-xs font-bold text-[#137333] tracking-widest uppercase">
                    {lease.status === 'CONTESTED' ? 'Contested Lease Agreement' : 'Pending Lease Agreement'}
                  </div>
                  <h2 className="font-headline-sm text-title-lg font-bold text-on-surface">
                    {lease.status === 'CONTESTED' ? 'Lease Under Review' : 'Review & Approve Your Lease'}
                  </h2>
                  <p className="font-body-md text-on-surface-variant max-w-md leading-relaxed">
                    {lease.status === 'CONTESTED'
                      ? 'You have contested this lease. Waiting for the landlord to review and update the terms.'
                      : 'Your landlord has invited you to a new lease. Please review the terms below and approve to activate your lease.'}
                  </p>
                  {lease.status === 'CONTESTED' && lease.contestedReason && (
                    <div className="mt-2 p-3 bg-error-container/50 text-on-error-container rounded-lg font-body-sm border border-error/20">
                      <strong>Contest Reason:</strong> {lease.contestedReason}
                    </div>
                  )}
                </div>
              </div>

              {/* Stats Grid */}
              <div className="w-full lg:w-[500px] shrink-0 bg-surface-container-lowest rounded-xl p-6 border border-outline-variant/60">
                <div className="flex border-b border-outline-variant/60 pb-5 mb-5">
                  <div className="flex-1 flex gap-3 items-center border-r border-outline-variant/60 pr-5">
                    <span className="material-symbols-outlined text-[#137333] text-2xl">domain</span>
                    <div>
                      <p className="text-sm text-on-surface-variant font-medium mb-0.5">Unit</p>
                      <p className="font-semibold text-on-surface text-base">Unit {lease.unitNumber}</p>
                    </div>
                  </div>
                  <div className="flex-1 flex gap-3 items-center pl-5">
                    <span className="material-symbols-outlined text-[#137333] text-2xl">payments</span>
                    <div>
                      <p className="text-sm text-on-surface-variant font-medium mb-0.5">Base Rent</p>
                      <p className="font-semibold text-on-surface text-base">₦{Number(lease.baseRent).toLocaleString()}</p>
                    </div>
                  </div>
                </div>
                <div className="flex">
                  <div className="flex-1 flex gap-3 items-center border-r border-outline-variant/60 pr-5">
                    <span className="material-symbols-outlined text-[#137333] text-2xl">calendar_today</span>
                    <div>
                      <p className="text-sm text-on-surface-variant font-medium mb-0.5">Start Date</p>
                      <p className="font-semibold text-on-surface text-base">{lease.startDate}</p>
                    </div>
                  </div>
                  <div className="flex-1 flex gap-3 items-center pl-5">
                    <span className="material-symbols-outlined text-[#137333] text-2xl">event</span>
                    <div>
                      <p className="text-sm text-on-surface-variant font-medium mb-0.5">End Date</p>
                      <p className="font-semibold text-on-surface text-base">{lease.endDate}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Card 2: Proposed Payment Ledger */}
            {ledgers && ledgers.length > 0 && (
              <div className="bg-surface rounded-2xl border border-outline-variant p-8 shadow-sm flex flex-col lg:flex-row gap-8 items-start">
                <div className="flex-1 flex gap-5 lg:max-w-sm">
                  <div className="shrink-0 w-16 h-16 bg-[#f3e8ff] rounded-2xl flex items-center justify-center">
                    <span className="material-symbols-outlined text-3xl text-[#7e22ce]">receipt_long</span>
                  </div>
                  <div className="flex flex-col gap-2">
                    <h2 className="font-headline-sm text-title-lg font-bold text-on-surface">Proposed Payment Ledger</h2>
                    <p className="font-body-md text-on-surface-variant leading-relaxed">
                      Below is the payment schedule associated with your proposed lease.
                    </p>
                  </div>
                </div>

                <div className="w-full lg:flex-1 border border-outline-variant/60 rounded-xl overflow-hidden bg-surface-container-lowest">
                  <table className="w-full text-left border-collapse">
                    <thead className="bg-[#f8f9fa] border-b border-outline-variant/60">
                      <tr>
                        <th className="p-4 font-label-md font-semibold text-on-surface-variant">Description</th>
                        <th className="p-4 font-label-md font-semibold text-on-surface-variant">Amount</th>
                        <th className="p-4 font-label-md font-semibold text-on-surface-variant">Due Date</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-outline-variant/60">
                      {ledgers.map(l => {
                        const isRent = l.entryType === 'RENT' || l.description?.toLowerCase().includes('rent');
                        const isDeposit = l.entryType === 'SECURITY_DEPOSIT' || l.description?.toLowerCase().includes('deposit');
                        const isService = l.entryType === 'SERVICE_CHARGE' || l.description?.toLowerCase().includes('service');
                        
                        let iconName = 'payments';
                        if (isRent) iconName = 'home';
                        if (isDeposit) iconName = 'security';
                        if (isService) iconName = 'build';

                        return (
                          <tr key={l.id} className="group hover:bg-[#f8f9fa]/50 transition-colors">
                            <td className="p-4 font-body-md text-on-surface flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-[#f3e8ff] flex items-center justify-center shrink-0">
                                <span className="material-symbols-outlined text-[16px] text-[#7e22ce]">{iconName}</span>
                              </div>
                              <span className="font-medium">{l.description || l.entryType}</span>
                            </td>
                            <td className="p-4 font-body-md text-on-surface font-semibold">₦{Number(l.amountDue).toLocaleString()}</td>
                            <td className="p-4 font-body-md text-on-surface-variant">{l.dueDate}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {lease.status === 'PENDING_APPROVAL' && (
              <div className="flex justify-end gap-4 mt-2">
                <button
                  onClick={() => rejectMutation.mutate(lease.id)}
                  disabled={rejectMutation.isPending || approveMutation.isPending || contestMutation.isPending}
                  className="flex items-center gap-2 px-6 py-3 bg-[#fce8e8] text-[#c5221f] border border-[#fce8e8] hover:border-[#f9d2d2] hover:bg-[#f9d2d2] font-label-lg font-semibold rounded-xl transition-colors disabled:opacity-50"
                >
                  <span className="material-symbols-outlined text-[20px]">close</span>
                  {rejectMutation.isPending ? 'Rejecting...' : 'Reject'}
                </button>
                <button
                  onClick={() => setShowContestModal(true)}
                  disabled={rejectMutation.isPending || approveMutation.isPending || contestMutation.isPending}
                  className="flex items-center gap-2 px-6 py-3 bg-[#e6f4ea] text-[#137333] border border-[#e6f4ea] hover:border-[#ceead6] hover:bg-[#ceead6] font-label-lg font-semibold rounded-xl transition-colors disabled:opacity-50"
                >
                  <span className="material-symbols-outlined text-[20px]">chat_bubble_outline</span>
                  Contest Terms
                </button>
                <button
                  onClick={() => approveMutation.mutate(lease.id)}
                  disabled={rejectMutation.isPending || approveMutation.isPending || contestMutation.isPending}
                  className="flex items-center gap-2 px-8 py-3 bg-[#1e293b] text-white font-label-lg font-semibold rounded-xl hover:bg-[#0f172a] shadow-sm transition-colors disabled:opacity-50"
                >
                  <span className="material-symbols-outlined text-[20px]">check_circle</span>
                  {approveMutation.isPending ? 'Approving...' : 'Approve Lease'}
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="flex flex-col gap-6">
            {/* Virtual Account Card */}
            <div className="bg-gradient-to-br from-primary to-primary-fixed-dim text-on-primary rounded-lg p-7 flex flex-col gap-5 shadow-[0px_8px_32px_rgba(30,58,138,0.12)]">
              <div className="font-label-md text-label-md text-on-primary/70 uppercase tracking-widest font-semibold">
                {virtualAccountBank}
              </div>

              <div>
                <p className="font-label-md text-[11px] text-on-primary/70 uppercase tracking-wider font-medium">
                  Virtual Rent Deposit Account
                </p>
                <div className="flex items-center gap-3 mt-1">
                  <div className="font-code-lg text-headline-md font-bold tracking-widest text-on-primary tabular-nums">
                    {virtualAccountNumber}
                  </div>
                  {virtualAccountNumber !== 'Pending...' && (
                    <button
                      onClick={() => handleCopy(virtualAccountNumber, 'account')}
                      className="p-1.5 rounded-md hover:bg-on-primary/10 transition-colors text-on-primary/80 hover:text-on-primary flex items-center gap-1"
                      title="Copy Account Number"
                    >
                      <span className="material-symbols-outlined text-[20px]">
                        {copiedItem === 'account' ? 'check' : 'content_copy'}
                      </span>
                      {copiedItem === 'account' && <span className="text-[11px] font-medium tracking-wide">Copied</span>}
                    </button>
                  )}
                </div>
              </div>

              <div className="flex justify-between items-end border-t border-on-primary/10 pt-4">
                <div>
                  <p className="font-label-md text-[11px] text-on-primary/70 uppercase tracking-wider font-medium mb-0.5">Account Ref</p>
                  <div className="font-body-md font-semibold text-on-primary/90 truncate max-w-[200px]">
                    {virtualAccountRef}
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-label-md text-[11px] text-on-primary/70 uppercase tracking-wider font-medium mb-0.5">Unit</p>
                  <div className="font-body-md font-semibold text-on-primary/90">{lease.unitNumber ?? '—'}</div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center bg-black/10 p-3 rounded-lg">
                <p className="font-body-sm text-[13px] text-on-primary/80 leading-relaxed flex-1">
                  <strong>Payment Instruction:</strong> Transfer the outstanding balance plus a <strong>₦150</strong> platform fee to this dedicated virtual account. Payments are automatically recognised, recorded in the ledger, and split to settlement wallets.
                </p>
                {virtualAccountNumber !== 'Pending...' && (
                  <button
                    onClick={() => handleCopy(`Bank: ${virtualAccountBank}\nAccount Number: ${virtualAccountNumber}\nAmount: ₦${Number(rentAmount).toLocaleString()}`, 'all')}
                    className="flex-shrink-0 flex items-center gap-2 px-4 py-2 bg-on-primary/10 hover:bg-on-primary/20 text-on-primary rounded-lg font-label-md transition-colors"
                  >
                    <span className="material-symbols-outlined text-[18px]">
                      {copiedItem === 'all' ? 'check_circle' : 'content_copy'}
                    </span>
                    {copiedItem === 'all' ? 'Copied Details' : 'Copy All Details'}
                  </button>
                )}
              </div>
            </div>

            {/* Flat platform fee warning banner */}
            <div className="bg-warning-container border border-warning/20 rounded-2xl p-5 flex gap-4 text-on-warning-container shadow-sm">
              <span className="material-symbols-outlined text-warning text-3xl shrink-0 mt-0.5 animate-pulse">info</span>
              <div className="flex flex-col gap-1">
                <h4 className="font-headline-sm text-title-md font-bold tracking-tight text-on-warning-container">Platform Transfer Fee Notice</h4>
                <p className="font-body-md text-on-warning-container/90 leading-relaxed">
                  A flat platform fee of <strong>₦150</strong> is deducted from every transfer. Please add <strong>₦150</strong> to your transfer amount to ensure it fully covers your outstanding balance (e.g. transfer <strong>₦10,150</strong> to pay <strong>₦10,000</strong>).
                </p>
              </div>
            </div>

            {/* Metric cards row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <MetricCard
                label="Outstanding Balance"
                value={`₦${Number(outstandingAmount).toLocaleString()}`}
                sub={
                  outstandingAmount > 0 ? (
                    <span className="flex items-center gap-1 text-warning"><span className="w-1.5 h-1.5 rounded-full bg-warning"></span> Rent outstanding</span>
                  ) : (
                    <span className="flex items-center gap-1 text-secondary"><span className="w-1.5 h-1.5 rounded-full bg-secondary"></span> Fully paid</span>
                  )
                }
                icon="account_balance_wallet"
              />
              <MetricCard
                label="Next Due Date"
                value={nextDueDate}
                sub="Based on earliest unpaid invoice"
                icon="event_upcoming"
              />
              <MetricCard
                label="Rollover Credit"
                value={`₦${Number(lease.depositWalletBalance ?? 0).toLocaleString()}`}
                sub="Available balance"
                icon="savings"
              />
              <MetricCard
                label="Lease Status"
                value={
                  <span className="capitalize">
                    {lease.status?.toLowerCase().replace(/_/g, ' ') ?? 'Pending'}
                  </span>
                }
                sub={`Unit: ${lease.unitNumber ?? '—'}`}
                icon="home_work"
              />
            </div>

            {/* Ledger table */}
            <section
              className="bg-surface rounded-lg border border-outline-variant overflow-hidden"
              aria-labelledby="ledger-title"
            >
              <div className="p-6 border-b border-outline-variant bg-surface-container-lowest">
                <h2 id="ledger-title" className="font-headline-md text-title-lg font-bold text-on-surface">
                  Billing &amp; Payment Ledger
                </h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-surface-container-low/50">
                      <th className="px-6 py-4 text-on-surface-variant font-label-md text-label-md border-b border-surface-container-high">Date</th>
                      <th className="px-6 py-4 text-on-surface-variant font-label-md text-label-md border-b border-surface-container-high">Ref</th>
                      <th className="px-6 py-4 text-on-surface-variant font-label-md text-label-md border-b border-surface-container-high">Description</th>
                      <th className="px-6 py-4 text-on-surface-variant font-label-md text-label-md border-b border-surface-container-high">Amount Due</th>
                      <th className="px-6 py-4 text-on-surface-variant font-label-md text-label-md border-b border-surface-container-high">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-surface-container-high">
                    {ledgers.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="px-6 py-12 text-center">
                          <div className="flex flex-col items-center gap-3 text-on-surface-variant">
                            <span className="material-symbols-outlined text-[48px] text-on-surface-variant/30">receipt_long</span>
                            <div>
                              <strong className="block text-on-surface font-body-lg">Ledger is empty</strong>
                              <p className="font-body-md">No transactions or invoices have been posted yet.</p>
                            </div>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      ledgers.map((entry) => (
                        <tr key={entry.id} className="hover:bg-surface-container-low/20 transition-colors group">
                          <td className="px-6 py-4 font-code-md tabular-nums text-on-surface">
                            {entry.dueDate}
                          </td>
                          <td className="px-6 py-4 font-code-md text-on-surface-variant truncate max-w-[100px]">
                            {entry.id.slice(0, 8)}…
                          </td>
                          <td className="px-6 py-4 font-body-md text-on-surface capitalize">
                            {entry.entryType?.toLowerCase().replace(/_/g, ' ') ?? '—'}
                          </td>
                          <td className="px-6 py-4 font-code-md tabular-nums text-on-surface">
                            ₦{Number(entry.amountDue).toLocaleString()}
                          </td>
                          <td className="px-6 py-4">
                            <StatusBadge status={entry.status} />
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

      {/* Contest Modal */}
      {showContestModal && lease && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-surface rounded-2xl shadow-xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-outline-variant flex justify-between items-center">
              <h3 className="font-headline-sm text-title-lg font-bold text-on-surface">Contest Lease Terms</h3>
              <button 
                onClick={() => setShowContestModal(false)}
                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-surface-variant text-on-surface-variant transition-colors"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>
            
            <div className="p-6">
              <p className="font-body-md text-on-surface-variant mb-4">
                Please describe why you are contesting this lease. Be specific about which terms or ledger entries you'd like the landlord to adjust.
              </p>
              <textarea
                value={contestReason}
                onChange={(e) => setContestReason(e.target.value)}
                placeholder="e.g. The base rent in the ledger does not match what we agreed on."
                className="w-full h-32 p-3 rounded-lg border border-outline-variant bg-surface-container-lowest text-on-surface focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent font-body-md resize-none"
              ></textarea>
            </div>
            
            <div className="p-6 bg-surface-container-lowest border-t border-outline-variant flex justify-end gap-3">
              <button
                onClick={() => setShowContestModal(false)}
                className="px-5 py-2.5 font-label-lg font-semibold text-on-surface hover:bg-surface-variant rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (contestReason.trim()) {
                    contestMutation.mutate({ id: lease.id, reason: contestReason });
                  }
                }}
                disabled={!contestReason.trim() || contestMutation.isPending}
                className="px-5 py-2.5 bg-primary text-on-primary font-label-lg font-semibold rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                {contestMutation.isPending && (
                  <span className="material-symbols-outlined text-[18px] animate-spin">progress_activity</span>
                )}
                Submit Contest
              </button>
            </div>
          </div>
        </div>
      )}
    </ProtectedRoute>
  );
}
