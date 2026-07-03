"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { DashboardShell } from '@/components/layout/DashboardShell';
import { MetricCard } from '@/components/ui/MetricCard';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { getActiveLease } from '@/lib/api/leases';
import { getActiveLeaseLedgers } from '@/lib/api/ledgers';
import { clearSession } from '@/lib/auth/session';
import { useAuthStore } from '@/store/authStore';
import { LeaseResponse, LedgerEntryResponse } from '@/types/api';


export default function TenantDashboardPage() {
  const router = useRouter();
  const user = useAuthStore(s => s.user);

  const [activeTab, setActiveTab] = useState('dashboard');

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

  return (
    <ProtectedRoute allowedRole="ROLE_TENANT">
      <DashboardShell
        sidebarTitle="RentFlow"
        userLabel="Connected Tenant"
        userEmail={user?.email}
        activeItem={activeTab}
        onNavChange={setActiveTab}
        onSignOut={handleLogout}
      >
        <div className="flex flex-col gap-1 border-b border-outline-variant pb-6 mb-2">
          <h1 className="font-display-lg text-headline-lg font-bold text-on-surface tracking-tight">Tenant Portal</h1>
          <p className="text-on-surface-variant font-body-lg">
            Monitor your active lease agreement, virtual account, and payment ledger.
          </p>
        </div>
        {!lease ? (
          <div className="bg-surface rounded-lg border border-outline-variant p-14 flex flex-col items-center gap-4 text-center">
            <span className="material-symbols-outlined text-[48px] text-on-surface-variant/50">document_scanner</span>
            <h2 className="font-headline-md text-title-lg font-bold text-on-surface">No Active Lease</h2>
            <p className="font-body-md text-on-surface-variant max-w-sm">
              No active lease or virtual account has been assigned to your account yet.
              Please contact your landlord.
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-6">
            <div className="bg-gradient-to-br from-primary to-primary-fixed-dim text-on-primary rounded-lg p-7 flex flex-col gap-5 shadow-[0px_8px_32px_rgba(30,58,138,0.12)]">
              <div className="font-label-md text-label-md text-on-primary/70 uppercase tracking-widest font-semibold">
                {virtualAccountBank}
              </div>

              <div>
                <p className="font-label-md text-[11px] text-on-primary/70 uppercase tracking-wider font-medium">
                  Virtual Rent Deposit Account
                </p>
                <div className="font-code-lg text-headline-md font-bold tracking-widest text-on-primary mt-1 tabular-nums">
                  {virtualAccountNumber}
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

              <p className="font-body-sm text-[13px] text-on-primary/80 leading-relaxed bg-black/10 p-3 rounded-lg">
                <strong>Payment Instruction:</strong> To pay rent of{' '}
                <span className="font-code-md">₦{Number(rentAmount).toLocaleString()}</span>, transfer the
                outstanding amount to this dedicated virtual account. Payments are automatically recognised,
                recorded in the ledger, and split to settlement wallets.
              </p>
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
    </ProtectedRoute>
  );
}
