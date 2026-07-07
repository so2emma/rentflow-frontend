"use client";

import React from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { DashboardShell } from '@/components/layout/DashboardShell';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { getProperty, getPropertyLedgers, getPropertyTransactions } from '@/lib/api/properties';
import { useAuthStore } from '@/store/authStore';
import {logoutUser} from '@/lib/auth/session';
import { LedgerEntryResponse, InboundTransactionDTO } from '@/types/api';

export default function PropertyRevenuePage() {
  const router = useRouter();
  const params = useParams();
  const propertyId = params.id as string;
  
  const user = useAuthStore(s => s.user);

  const { data: property, isLoading: isPropertyLoading } = useQuery({
    queryKey: ['property', propertyId],
    queryFn: () => getProperty(propertyId)
  });

  const { data: ledgers, isLoading: isLedgersLoading } = useQuery({
    queryKey: ['property-ledgers', propertyId],
    queryFn: () => getPropertyLedgers(propertyId)
  });

  const { data: transactions, isLoading: isTransactionsLoading } = useQuery({
    queryKey: ['property-transactions', propertyId],
    queryFn: () => getPropertyTransactions(propertyId)
  });

  const isLoading = isPropertyLoading || isLedgersLoading || isTransactionsLoading;

  if (isLoading) {
    return (
      <ProtectedRoute allowedRole="ROLE_LANDLORD">
        <DashboardShell
          sidebarTitle="RentFlow"
          userLabel="Connected Landlord"
          userEmail={user?.email}
          navItems={[{ id: 'dashboard', label: 'Dashboard', icon: 'dashboard' }, { id: 'properties', label: 'Properties', icon: 'domain' }, { id: 'units', label: 'Units', icon: 'grid_view' }, { id: 'leases', label: 'Leases', icon: 'description' }]}
          activeItem="dashboard"
          onNavChange={(id) => { if (id === 'dashboard') router.push('/landlord/dashboard'); }}
          onSignOut={() => { logoutUser(); }}
        >
          <div className="flex items-center justify-center h-64">
            <p className="text-on-surface-variant font-body-md">Loading revenue details...</p>
          </div>
        </DashboardShell>
      </ProtectedRoute>
    );
  }

  if (!property) {
    return (
      <ProtectedRoute allowedRole="ROLE_LANDLORD">
        <DashboardShell
          sidebarTitle="RentFlow"
          userLabel="Connected Landlord"
          userEmail={user?.email}
          navItems={[{ id: 'dashboard', label: 'Dashboard', icon: 'dashboard' }, { id: 'properties', label: 'Properties', icon: 'domain' }, { id: 'units', label: 'Units', icon: 'grid_view' }, { id: 'leases', label: 'Leases', icon: 'description' }]}
          activeItem="dashboard"
          onNavChange={(id) => { if (id === 'dashboard') router.push('/landlord/dashboard'); }}
          onSignOut={() => { logoutUser(); }}
        >
          <div className="flex items-center justify-center h-64">
            <p className="text-error font-body-md">Property not found.</p>
          </div>
        </DashboardShell>
      </ProtectedRoute>
    );
  }

  const safeLedgers = ledgers || [];
  const safeTransactions = transactions || [];

  return (
    <ProtectedRoute allowedRole="ROLE_LANDLORD">
      <DashboardShell
        sidebarTitle="RentFlow"
        userLabel="Connected Landlord"
        userEmail={user?.email}
        navItems={[
          { id: 'dashboard', label: 'Dashboard', icon: 'dashboard' },
          { id: 'properties', label: 'Properties', icon: 'domain' },
          { id: 'units', label: 'Units', icon: 'grid_view' },
          { id: 'leases', label: 'Leases', icon: 'description' },
        ]}
        activeItem="dashboard"
        onNavChange={(id) => {
          if (id === 'dashboard') router.push('/landlord/dashboard');
          else if (id === 'properties') router.push('/landlord/dashboard');
          else if (id === 'units') router.push('/landlord/dashboard');
          else if (id === 'leases') router.push('/landlord/dashboard');
        }}
        onSignOut={() => {
          logoutUser();
        }}
      >
        <div className="flex flex-col gap-6 max-w-6xl mx-auto mt-6">
          
          {/* Header */}
          <div className="flex items-center justify-between border-b border-outline-variant pb-6">
            <div className="flex items-center gap-4">
              <button onClick={() => router.back()} className="text-on-surface-variant hover:text-on-surface transition-colors">
                <span className="material-symbols-outlined text-2xl">arrow_back</span>
              </button>
              <div>
                <h1 className="font-display-md text-headline-md font-bold text-on-surface tracking-tight">
                  {property.name} Revenue Details
                </h1>
                <p className="text-on-surface-variant font-body-md mt-1">Detailed payment history and ledgers for this property.</p>
              </div>
            </div>
          </div>

          {/* Recent Transactions Table */}
          <div>
            <h2 className="text-title-lg font-bold text-on-surface mb-4">Recent Inbound Transactions</h2>
            <div className="w-full bg-surface rounded-lg border border-outline-variant overflow-hidden">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-surface-container-low/50">
                    <th className="px-6 py-4 text-on-surface-variant font-label-md text-label-md border-b border-surface-container-high">Time</th>
                    <th className="px-6 py-4 text-on-surface-variant font-label-md text-label-md border-b border-surface-container-high">Amount</th>
                    <th className="px-6 py-4 text-on-surface-variant font-label-md text-label-md border-b border-surface-container-high">Sender Name</th>
                    <th className="px-6 py-4 text-on-surface-variant font-label-md text-label-md border-b border-surface-container-high">Bank / Account</th>
                    <th className="px-6 py-4 text-on-surface-variant font-label-md text-label-md border-b border-surface-container-high">Transaction ID</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface-container-high">
                  {safeTransactions.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-10 text-center font-body-md text-on-surface-variant">
                        No recent transactions found for this property.
                      </td>
                    </tr>
                  ) : (
                    safeTransactions.map((t: InboundTransactionDTO) => (
                      <tr key={t.id} className="hover:bg-surface-container-low/20 transition-colors">
                        <td className="px-6 py-4 font-body-md text-on-surface">
                          {new Date(t.transactionTime).toLocaleString()}
                        </td>
                        <td className="px-6 py-4 font-code-md text-secondary">
                          ₦ {Number(t.amount).toLocaleString()}
                        </td>
                        <td className="px-6 py-4 font-body-md text-on-surface">{t.senderName || '—'}</td>
                        <td className="px-6 py-4 font-body-md text-on-surface">
                          {t.senderBankName ? `${t.senderBankName} / ${t.senderAccountNumber}` : '—'}
                        </td>
                        <td className="px-6 py-4 font-code-md text-on-surface-variant text-sm truncate max-w-[150px]">
                          {t.nombaTransactionId || '—'}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Ledgers table */}
          <div>
            <h2 className="text-title-lg font-bold text-on-surface mb-4">Property Ledgers</h2>
            <div className="w-full bg-surface rounded-lg border border-outline-variant overflow-hidden">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-surface-container-low/50">
                    <th className="px-6 py-4 text-on-surface-variant font-label-md text-label-md border-b border-surface-container-high">Due Date</th>
                    <th className="px-6 py-4 text-on-surface-variant font-label-md text-label-md border-b border-surface-container-high">Type</th>
                    <th className="px-6 py-4 text-on-surface-variant font-label-md text-label-md border-b border-surface-container-high">Status</th>
                    <th className="px-6 py-4 text-on-surface-variant font-label-md text-label-md border-b border-surface-container-high">Amount Due</th>
                    <th className="px-6 py-4 text-on-surface-variant font-label-md text-label-md border-b border-surface-container-high">Amount Paid</th>
                    <th className="px-6 py-4 text-on-surface-variant font-label-md text-label-md border-b border-surface-container-high">Payment Date</th>
                    <th className="px-6 py-4 text-on-surface-variant font-label-md text-label-md border-b border-surface-container-high">Reference</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface-container-high">
                  {safeLedgers.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-6 py-10 text-center font-body-md text-on-surface-variant">
                        No ledger entries found for this property.
                      </td>
                    </tr>
                  ) : (
                    safeLedgers.map((l: LedgerEntryResponse) => (
                      <tr key={l.id} className="hover:bg-surface-container-low/20 transition-colors">
                        <td className="px-6 py-4 font-body-md text-on-surface">{l.dueDate}</td>
                        <td className="px-6 py-4 font-body-md text-on-surface capitalize">{l.entryType.replace('_', ' ')}</td>
                        <td className="px-6 py-4">
                          <StatusBadge status={l.status} />
                        </td>
                        <td className="px-6 py-4 font-code-md text-error">
                          ₦ {Number(l.amountDue).toLocaleString()}
                        </td>
                        <td className="px-6 py-4 font-code-md text-secondary">
                          ₦ {Number(l.amountPaid).toLocaleString()}
                        </td>
                        <td className="px-6 py-4 font-body-md text-on-surface-variant">
                          {l.paymentDate || '—'}
                        </td>
                        <td className="px-6 py-4 font-code-md text-on-surface-variant text-sm truncate max-w-[150px]">
                          {l.transactionReference || '—'}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </DashboardShell>
    </ProtectedRoute>
  );
}
