"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { DashboardShell } from '@/components/layout/DashboardShell';
import { GridIcon, DocumentIcon, ChartIcon } from '@/components/layout/Sidebar';
import { MetricCard } from '@/components/ui/MetricCard';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { getActiveLease } from '@/lib/api/leases';
import { getActiveLeaseLedgers } from '@/lib/api/ledgers';
import { getUser, clearSession } from '@/lib/auth/session';
import { LeaseResponse, LedgerEntryResponse } from '@/types/api';

const NAV_ITEMS = [
  { id: 'dashboard', label: 'My Dashboard', icon: <GridIcon /> },
  { id: 'lease', label: 'Lease Details', icon: <DocumentIcon /> },
  { id: 'history', label: 'Payment History', icon: <ChartIcon /> },
];

export default function TenantDashboardPage() {
  const router = useRouter();
  const user = getUser();

  const [activeTab, setActiveTab] = useState('dashboard');
  const [lease, setLease] = useState<LeaseResponse | null>(null);
  const [ledgers, setLedgers] = useState<LedgerEntryResponse[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    async function load() {
      try {
        const leaseData = await getActiveLease();
        if (!mounted) return;
        setLease(leaseData);

        try {
          const ledgerData = await getActiveLeaseLedgers();
          if (mounted) setLedgers(ledgerData);
        } catch (err) {
          console.warn('Could not load ledgers:', err);
        }
      } catch {
        if (mounted) setLease(null);
      } finally {
        if (mounted) setLoading(false);
      }
    }

    load();
    return () => { mounted = false; };
  }, []);

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
        <div className="flex items-center justify-center min-h-screen bg-background">
          <div className="text-lg font-semibold text-brand-deep-slate animate-pulse">
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
        onNavChange={setActiveTab}
        onSignOut={handleLogout}
      >
        {/* Page header */}
        <div className="flex flex-col gap-1 border-b border-outline-variant pb-4">
          <h1 className="text-2xl md:text-3xl font-semibold text-brand-deep-slate">Tenant Portal</h1>
          <p className="text-sm text-on-surface-variant">
            Monitor your active lease agreement, virtual account, and payment ledger.
          </p>
        </div>

        {/* No active lease */}
        {!lease ? (
          <div className="bg-surface-container-lowest border border-outline-variant rounded-md p-14 flex flex-col items-center gap-4 shadow-sm text-center">
            <svg className="w-14 h-14 text-outline-variant" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round"
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <h2 className="text-lg font-bold text-brand-deep-slate">No Active Lease</h2>
            <p className="text-sm text-on-surface-variant max-w-sm">
              No active lease or virtual account has been assigned to your account yet.
              Please contact your landlord.
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-6">
            {/* Virtual Account Card */}
            <div className="bg-gradient-to-br from-slate-800 to-slate-950 text-white rounded-md p-7 flex flex-col gap-5 shadow-[0px_8px_32px_rgba(15,23,42,0.12)] border border-slate-700/50">
              <div className="text-xs text-white/60 uppercase tracking-widest font-semibold">
                {virtualAccountBank}
              </div>

              <div>
                <p className="text-[10px] text-white/60 uppercase tracking-wider font-medium">
                  Virtual Rent Deposit Account
                </p>
                <div className="font-mono text-2xl md:text-3xl font-bold tracking-widest text-white mt-1 tabular-nums">
                  {virtualAccountNumber}
                </div>
              </div>

              <div className="flex justify-between items-end border-t border-white/10 pt-4">
                <div>
                  <p className="text-[10px] text-white/60 uppercase tracking-wider font-medium">Account Ref</p>
                  <div className="text-sm font-semibold text-white/90 truncate max-w-[200px]">
                    {virtualAccountRef}
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-[10px] text-white/60 uppercase tracking-wider font-medium">Unit</p>
                  <div className="text-sm font-semibold text-white/90">{lease.unitNumber ?? '—'}</div>
                </div>
              </div>

              <p className="text-xs text-white/80 leading-relaxed">
                <strong>Payment Instruction:</strong> To pay rent of{' '}
                <span className="font-mono">₦{Number(rentAmount).toLocaleString()}</span>, transfer the
                outstanding amount to this dedicated virtual account. Payments are automatically recognised,
                recorded in the ledger, and split to settlement wallets.
              </p>
            </div>

            {/* Metric cards row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <MetricCard
                label="Outstanding Balance"
                value={`₦ ${Number(outstandingAmount).toLocaleString()}`}
                sub={
                  outstandingAmount > 0 ? (
                    <span className="inline-block bg-warning-container text-on-warning-container rounded-xs px-2 py-0.5 text-xs font-semibold">
                      Rent outstanding
                    </span>
                  ) : (
                    <span className="inline-block bg-secondary-container text-on-secondary-container rounded-xs px-2 py-0.5 text-xs font-semibold">
                      Fully paid
                    </span>
                  )
                }
              />
              <MetricCard
                label="Next Due Date"
                value={nextDueDate}
                sub="Based on earliest unpaid invoice"
              />
              <MetricCard
                label="Rollover Credit"
                value={`₦ ${Number(lease.depositWalletBalance ?? 0).toLocaleString()}`}
                sub={
                  <span className="inline-block bg-secondary-container text-on-secondary-container rounded-xs px-2 py-0.5 text-xs font-semibold">
                    Available balance
                  </span>
                }
              />
              <MetricCard
                label="Lease Status"
                value={
                  <span className="text-xl font-bold">
                    {lease.status?.toLowerCase().replace(/_/g, ' ') ?? 'Pending'}
                  </span>
                }
                sub={`Unit: ${lease.unitNumber ?? '—'}`}
              />
            </div>

            {/* Ledger table */}
            <section
              className="bg-surface-container-lowest border border-outline-variant rounded-md shadow-sm overflow-hidden"
              aria-labelledby="ledger-title"
            >
              <div className="p-6 border-b border-outline-variant">
                <h2 id="ledger-title" className="text-sm font-bold uppercase tracking-wider text-brand-deep-slate">
                  Billing &amp; Payment Ledger
                </h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse font-sans">
                  <thead>
                    <tr className="bg-surface-container-low border-b border-outline-variant">
                      <th className="p-3.5 text-xs font-semibold uppercase tracking-wider text-on-surface-variant">Date</th>
                      <th className="p-3.5 text-xs font-semibold uppercase tracking-wider text-on-surface-variant">Ref</th>
                      <th className="p-3.5 text-xs font-semibold uppercase tracking-wider text-on-surface-variant">Description</th>
                      <th className="p-3.5 text-xs font-semibold uppercase tracking-wider text-on-surface-variant">Amount Due</th>
                      <th className="p-3.5 text-xs font-semibold uppercase tracking-wider text-on-surface-variant">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-surface-container-low">
                    {ledgers.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="p-12 text-center">
                          <div className="flex flex-col items-center gap-2 text-on-surface-variant">
                            <svg className="w-10 h-10 text-outline-variant" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                              <path strokeLinecap="round" strokeLinejoin="round"
                                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            <strong className="text-brand-deep-slate text-sm">Ledger is empty</strong>
                            <p className="text-xs">No transactions or invoices have been posted yet.</p>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      ledgers.map((entry) => (
                        <tr key={entry.id} className="hover:bg-surface-container-low/40 transition-colors duration-[150ms]">
                          <td className="p-3.5 text-sm font-mono tabular-nums text-brand-deep-slate">
                            {entry.dueDate}
                          </td>
                          <td className="p-3.5 text-xs font-mono text-on-surface-variant truncate max-w-[100px]">
                            {entry.id.slice(0, 8)}…
                          </td>
                          <td className="p-3.5 text-sm text-brand-deep-slate font-medium capitalize">
                            {entry.entryType?.toLowerCase().replace(/_/g, ' ') ?? '—'}
                          </td>
                          <td className="p-3.5 text-sm font-mono tabular-nums text-brand-deep-slate">
                            ₦{Number(entry.amountDue).toLocaleString()}
                          </td>
                          <td className="p-3.5">
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
