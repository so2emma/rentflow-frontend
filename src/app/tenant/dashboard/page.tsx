"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { getActiveLease } from '@/lib/api/leases';
import { getActiveLeaseLedgers } from '@/lib/api/ledgers';
import { LeaseResponse, LedgerEntryResponse } from '@/types/api';

export default function TenantDashboardPage() {
  const router = useRouter();

  // Retrieve user details from localStorage safely
  const [user] = useState(() => {
    if (typeof window !== 'undefined') {
      const userString = localStorage.getItem('rentflow_user');
      return userString ? JSON.parse(userString) : null;
    }
    return null;
  });

  const [lease, setLease] = useState<LeaseResponse | null>(null);
  const [ledgers, setLedgers] = useState<LedgerEntryResponse[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    async function fetchActiveLeaseAndLedgers() {
      try {
        const leaseRes = await getActiveLease();
        if (isMounted) {
          if (leaseRes) {
            setLease(leaseRes);
            try {
              const ledgersRes = await getActiveLeaseLedgers();
              if (isMounted && ledgersRes) {
                setLedgers(ledgersRes);
              }
            } catch (err) {
              console.warn('Error fetching active lease ledgers:', err);
            }
          } else {
            setLease(null);
          }
        }
      } catch (error) {
        console.warn('Error fetching active lease:', error);
        if (isMounted) {
          setLease(null);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }
    fetchActiveLeaseAndLedgers();
    return () => {
      isMounted = false;
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('rentflow_token');
    localStorage.removeItem('rentflow_user');
    router.replace('/login');
  };

  if (loading) {
    return (
      <ProtectedRoute allowedRole="ROLE_TENANT">
        <div className="max-w-[1440px] mx-auto p-4 md:p-8 flex items-center justify-center min-h-screen bg-background">
          <div className="text-lg font-semibold text-brand-deep-slate animate-pulse font-sans">Loading your dashboard...</div>
        </div>
      </ProtectedRoute>
    );
  }

  const tenantName = user ? `${user.email.split('@')[0].toUpperCase()}` : 'RESIDENT';
  const virtualAccountBank = lease?.nombaVactBank || 'Nomba / Wema Bank';
  const virtualAccountNumber = lease?.nombaVactNumber || 'Pending...';
  const virtualAccountName = lease?.nombaVactRef || `RentFlow Depot - ${tenantName}`;
  const rentAmount = lease?.baseRent || 0;

  // Calculate outstanding balance from ledger entries
  const outstandingAmount = ledgers
    .filter((item) => item.status !== 'PAID')
    .reduce((sum, item) => sum + (item.amountDue - item.amountPaid), 0);
  const outstandingBalance = `₦ ${Number(outstandingAmount).toLocaleString()}`;

  // Find next due date from earliest unpaid ledger entry
  const nextDueEntry = ledgers
    .filter((item) => item.status !== 'PAID')
    .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())[0];
  const nextDueDate = nextDueEntry ? nextDueEntry.dueDate : 'N/A';

  return (
    <ProtectedRoute allowedRole="ROLE_TENANT">
      <div className="max-w-[1440px] mx-auto p-4 md:p-8 grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-6 min-h-screen bg-background">
        
        {/* Sidebar Section */}
        <aside className="bg-brand-deep-slate text-on-primary rounded-lg p-6 flex flex-col justify-between lg:h-[calc(100vh-64px)] lg:sticky lg:top-8 shadow-sm">
          <div>
            <div className="text-2xl font-bold tracking-tight mb-6 font-sans">RentFlow</div>
            {user && (
              <div className="mb-6 text-xs opacity-80 border-b border-white/10 pb-4">
                <p className="font-sans text-[10px] uppercase tracking-wider text-[#7c839b]">Connected Tenant</p>
                <strong className="block text-sm mt-0.5 truncate font-sans font-semibold text-white">{user.email}</strong>
              </div>
            )}
            <nav className="flex flex-col gap-2">
              <button className="bg-white/10 text-on-primary text-left px-3.5 py-2.5 rounded font-semibold text-sm border-l-4 border-brand-emerald-green transition-all duration-150 outline-none focus-visible:ring-2 focus-visible:ring-focus-ring focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900">
                My Dashboard
              </button>
              <button className="text-left px-3.5 py-2.5 text-[#7c839b] hover:bg-white/5 hover:text-white rounded font-semibold text-sm transition-all duration-150 outline-none focus-visible:ring-2 focus-visible:ring-focus-ring focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900">
                Lease Details
              </button>
              <button className="text-left px-3.5 py-2.5 text-[#7c839b] hover:bg-white/5 hover:text-white rounded font-semibold text-sm transition-all duration-150 outline-none focus-visible:ring-2 focus-visible:ring-focus-ring focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900">
                Payment History
              </button>
            </nav>
          </div>
          <button 
            onClick={handleLogout} 
            className="mt-6 bg-transparent border border-white/20 text-on-primary py-2.5 rounded cursor-pointer font-semibold text-sm hover:bg-white/10 transition duration-150 outline-none focus-visible:ring-2 focus-visible:ring-focus-ring focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900"
          >
            Sign Out
          </button>
        </aside>

        {/* Main Content Pane */}
        <main className="flex flex-col gap-6">
          <div className="flex justify-between items-center border-b border-outline-variant pb-4">
            <div className="headerInfo">
              <h1 className="text-2xl md:text-3xl font-semibold text-brand-deep-slate font-sans">Tenant Portal</h1>
              <p className="text-sm text-on-surface-variant">Monitor your active lease agreement, manage automatic bank settlement splits, and review ledgers.</p>
            </div>
          </div>

          {!lease ? (
            <div className="bg-surface-container-lowest border border-outline-variant rounded-md p-12 text-center flex flex-col items-center gap-4 shadow-sm font-sans">
              <svg className="w-16 h-16 text-outline-variant" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <h2 className="text-lg font-bold text-brand-deep-slate">No Active Lease</h2>
              <p className="text-sm text-on-surface-variant max-w-md">
                No active lease or virtual account assigned. Contact your landlord.
              </p>
            </div>
          ) : (
            /* Dashboard Cards Grid */
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              
              {/* Nomba Virtual Account Card */}
              <div className="bg-gradient-to-br from-slate-800 to-slate-950 text-white rounded-md p-7 flex flex-col gap-5 shadow-lg border border-slate-700/50 font-sans">
                <div className="text-sm text-white/70 uppercase tracking-widest font-semibold">{virtualAccountBank}</div>
                <div>
                  <p className="text-[10px] text-white/60 uppercase tracking-wider font-medium">Virtual Rent Deposit Account</p>
                  <div className="font-mono text-2xl md:text-3xl font-bold tracking-widest text-white mt-1">{virtualAccountNumber}</div>
                </div>
                <div className="flex justify-between items-end border-t border-white/10 pt-4">
                  <div>
                    <p className="text-[10px] text-white/60 uppercase tracking-wider font-medium">Account Ref</p>
                    <div className="text-sm font-semibold text-white/90 truncate max-w-[200px]">{virtualAccountName}</div>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] text-white/60 uppercase tracking-wider font-medium">Unit</p>
                    <div className="text-sm font-semibold text-white/90">{lease.unitNumber || 'N/A'}</div>
                  </div>
                </div>
                <p className="text-xs text-white/80 leading-relaxed">
                  <strong>Payment Instruction:</strong> To pay rent of ₦{Number(rentAmount).toLocaleString()}, transfer the outstanding amount to this dedicated virtual account. Payments are automatically recognized, recorded in the ledger, and split to settlement wallets.
                </p>
              </div>

              {/* Account Metrics Stack */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-surface-container-lowest border border-outline-variant rounded-md p-5 flex flex-col gap-1.5 justify-between shadow-sm transition hover:shadow-md duration-150 font-sans">
                  <div>
                    <div className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider">Outstanding Balance</div>
                    <div className="text-2xl font-bold text-brand-deep-slate mt-1 font-mono tabular-nums">{outstandingBalance}</div>
                  </div>
                  <span className={`text-xs font-semibold ${outstandingAmount > 0 ? 'text-on-warning-container bg-warning-container rounded-xs px-2 py-0.5 w-fit' : 'text-on-secondary-container bg-secondary-container rounded-xs px-2 py-0.5 w-fit'}`}>
                    {outstandingAmount > 0 ? 'Rent outstanding' : 'Rent fully paid'}
                  </span>
                </div>

                <div className="bg-surface-container-lowest border border-outline-variant rounded-md p-5 flex flex-col gap-1.5 justify-between shadow-sm transition hover:shadow-md duration-150 font-sans">
                  <div>
                    <div className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider">Next Due Date</div>
                    <div className="text-2xl font-bold text-brand-deep-slate mt-1 font-mono tabular-nums">{nextDueDate}</div>
                  </div>
                  <span className="text-xs text-on-surface-variant">Based on active invoice due date</span>
                </div>

                <div className="bg-surface-container-lowest border border-outline-variant rounded-md p-5 flex flex-col gap-1.5 justify-between shadow-sm transition hover:shadow-md duration-150 font-sans">
                  <div>
                    <div className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider">Rollover Credit</div>
                    <div className="text-2xl font-bold text-brand-deep-slate mt-1 font-mono tabular-nums">₦ {Number(lease.depositWalletBalance || 0).toLocaleString()}</div>
                  </div>
                  <span className="text-xs text-on-secondary-container bg-secondary-container rounded-xs px-2 py-0.5 w-fit font-semibold">Available balance</span>
                </div>

                <div className="bg-surface-container-lowest border border-outline-variant rounded-md p-5 flex flex-col gap-1.5 justify-between shadow-sm transition hover:shadow-md duration-150 font-sans">
                  <div>
                    <div className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider">Lease Status &amp; Unit</div>
                    <div className="flex justify-between items-center mt-1">
                      <div className="text-xl font-bold text-brand-blue capitalize">{lease.status ? lease.status.toLowerCase().replace(/_/g, ' ') : 'Pending'}</div>
                      <div className="text-sm font-semibold text-on-surface-variant">Unit: {lease.unitNumber || 'N/A'}</div>
                    </div>
                  </div>
                  <span className="text-xs text-on-surface-variant">Active tenant agreement</span>
                </div>
              </div>

              {/* Dynamic Ledger Details Card */}
              <div className="lg:col-span-2 bg-surface-container-lowest border border-outline-variant rounded-md p-6 shadow-sm">
                <h2 className="text-sm font-bold uppercase tracking-wider text-brand-deep-slate mb-4 font-sans">Billing &amp; Payment Ledger</h2>
                <div className="overflow-x-auto border border-outline-variant rounded-md">
                  <table className="w-full text-left border-collapse font-sans">
                    <thead>
                      <tr className="bg-surface-container-low border-b border-outline-variant">
                        <th className="p-3.5 text-xs font-semibold uppercase tracking-wider text-on-surface-variant">Date</th>
                        <th className="p-3.5 text-xs font-semibold uppercase tracking-wider text-on-surface-variant">Transaction Ref</th>
                        <th className="p-3.5 text-xs font-semibold uppercase tracking-wider text-on-surface-variant">Description</th>
                        <th className="p-3.5 text-xs font-semibold uppercase tracking-wider text-on-surface-variant">Amount</th>
                        <th className="p-3.5 text-xs font-semibold uppercase tracking-wider text-on-surface-variant">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {ledgers.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="p-12 text-center">
                            <div className="flex flex-col items-center gap-2 text-on-surface-variant">
                              <svg className="w-10 h-10 text-outline-variant" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                              </svg>
                              <strong className="text-brand-deep-slate text-sm">Ledger is Empty</strong>
                              <p className="text-xs">
                                No transactions or invoices have been posted to your ledger.
                              </p>
                            </div>
                          </td>
                        </tr>
                      ) : (
                        ledgers.map((item) => (
                          <tr key={item.id} className="hover:bg-surface-container-low/30 transition duration-100 border-b border-slate-100">
                            <td className="p-3.5 text-sm font-mono tabular-nums text-brand-deep-slate">{item.dueDate}</td>
                            <td className="p-3.5 text-xs font-mono text-on-surface-variant truncate max-w-[120px]">{item.id}</td>
                            <td className="p-3.5 text-sm text-brand-deep-slate font-medium capitalize">
                              {item.entryType ? item.entryType.toLowerCase().replace(/_/g, ' ') : 'N/A'}
                            </td>
                            <td className="p-3.5 text-sm font-mono tabular-nums text-brand-deep-slate">
                              ₦{Number(item.amountDue).toLocaleString()}
                            </td>
                            <td className="p-3.5 text-sm">
                              <span className={`px-2.5 py-1 rounded-full text-xs font-semibold inline-flex items-center ${
                                item.status === 'PAID' ? 'bg-secondary-container text-on-secondary-container' :
                                item.status === 'PARTIALLY_PAID' ? 'bg-warning-container text-[#b45309]' :
                                'bg-error-container text-on-error-container'
                              }`}>
                                {item.status ? item.status.replace(/_/g, ' ') : 'UNPAID'}
                              </span>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>
          )}
        </main>
      </div>
    </ProtectedRoute>
  );
}
