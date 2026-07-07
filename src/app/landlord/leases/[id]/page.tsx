'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { DashboardShell } from '@/components/layout/DashboardShell';
import { getLeaseById } from '@/lib/api/leases';
import { getLedgersForLease } from '@/lib/api/ledgers';
import { Button } from '@/components/ui/Button';
import {logoutUser} from '@/lib/auth/session';
import { useAuthStore } from '@/store/authStore';
import { LedgerEntryResponse } from '@/types/api';

const NAV_ITEMS = [
  { id: 'properties', label: 'Properties', icon: 'domain' },
  { id: 'units', label: 'Units', icon: 'grid_view' },
  { id: 'leases', label: 'Leases', icon: 'description' },
];

export default function LeaseDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const leaseId = params.id as string;
  const user = useAuthStore(s => s.user);

  function handleLogout() {
    logoutUser();
  }

  const { data: lease, isLoading: isLoadingLease, error: leaseError } = useQuery({
    queryKey: ['lease', leaseId],
    queryFn: () => getLeaseById(leaseId),
  });

  const { data: ledgers, isLoading: isLoadingLedgers } = useQuery({
    queryKey: ['lease-ledgers', leaseId],
    queryFn: () => getLedgersForLease(leaseId),
  });

  if (isLoadingLease) {
    return (
      <ProtectedRoute allowedRole="ROLE_LANDLORD">
        <DashboardShell
          sidebarTitle="RentFlow"
          userLabel="Connected Landlord"
          userEmail={user?.email}
          navItems={NAV_ITEMS}
          activeItem="leases"
          onNavChange={(id) => router.push('/landlord/dashboard')}
          onSignOut={handleLogout}
        >
          <div className="p-6">Loading lease details...</div>
        </DashboardShell>
      </ProtectedRoute>
    );
  }

  if (leaseError || !lease) {
    return (
      <ProtectedRoute allowedRole="ROLE_LANDLORD">
        <DashboardShell
          sidebarTitle="RentFlow"
          userLabel="Connected Landlord"
          userEmail={user?.email}
          navItems={NAV_ITEMS}
          activeItem="leases"
          onNavChange={(id) => router.push('/landlord/dashboard')}
          onSignOut={handleLogout}
        >
          <div className="p-6 text-error">Failed to load lease details.</div>
        </DashboardShell>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute allowedRole="ROLE_LANDLORD">
      <DashboardShell
        sidebarTitle="RentFlow"
        userLabel="Connected Landlord"
        userEmail={user?.email}
        navItems={NAV_ITEMS}
        activeItem="leases"
        onNavChange={(id) => router.push('/landlord/dashboard')}
        onSignOut={handleLogout}
      >
        <div className="max-w-6xl mx-auto p-4 md:p-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
            <div>
              <h1 className="text-display-sm font-bold text-on-surface">Lease Details</h1>
              <p className="text-body-lg text-on-surface-variant mt-1">
                {lease.propertyName} - Unit {lease.unitNumber}
              </p>
            </div>
            <Button variant="ghost" onClick={() => router.back()} leadingIcon={<span className="material-symbols-outlined text-[18px]">arrow_back</span>}>
              Back to Dashboard
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="p-6 bg-surface-container rounded-xl border border-outline-variant">
              <h2 className="text-title-md font-semibold mb-4">Overview</h2>
              <div className="space-y-3 text-body-md text-on-surface">
                <p><span className="font-semibold w-32 inline-block">Tenant:</span> {lease.tenantName || 'Unknown'}</p>
                <p><span className="font-semibold w-32 inline-block">Status:</span> 
                  <span className={`px-2 py-1 rounded-full text-xs font-semibold ml-2 ${
                    lease.status === 'ACTIVE' ? 'bg-primary-container text-on-primary-container' : 
                    lease.status === 'TERMINATED' ? 'bg-error-container text-on-error-container' : 
                    'bg-surface-variant text-on-surface-variant'
                  }`}>
                    {lease.status}
                  </span>
                </p>
                <p><span className="font-semibold w-32 inline-block">Start Date:</span> {lease.startDate}</p>
                <p><span className="font-semibold w-32 inline-block">End Date:</span> {lease.endDate || 'N/A'}</p>
                <p><span className="font-semibold w-32 inline-block">Grace Period:</span> {lease.gracePeriodDays} days</p>
              </div>
            </div>

            <div className="p-6 bg-surface-container rounded-xl border border-outline-variant">
              <h2 className="text-title-md font-semibold mb-4">Payment Details</h2>
              <div className="space-y-3 text-body-md text-on-surface">
                <p><span className="font-semibold w-40 inline-block">Base Rent:</span> ₦{lease.baseRent?.toLocaleString()}</p>
                <p><span className="font-semibold w-40 inline-block">Virtual Account:</span> {lease.nombaVactNumber || 'Pending'}</p>
                <p><span className="font-semibold w-40 inline-block">Bank:</span> {lease.nombaVactBank || 'N/A'}</p>
                <p><span className="font-semibold w-40 inline-block">Wallet Balance:</span> ₦{lease.depositWalletBalance?.toLocaleString() || '0'}</p>
              </div>
            </div>
          </div>

          <div className="bg-surface-container rounded-xl border border-outline-variant overflow-hidden">
            <div className="p-6 border-b border-outline-variant">
              <h2 className="text-title-md font-semibold text-on-surface">Ledger Entries</h2>
              <p className="text-body-sm text-on-surface-variant">Complete billing and payment history for this lease.</p>
            </div>
            
            {isLoadingLedgers ? (
              <div className="p-6 text-center text-on-surface-variant">Loading ledger entries...</div>
            ) : ledgers && ledgers.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-[800px]">
                  <thead>
                    <tr className="bg-surface-container-high border-b border-outline-variant">
                      <th className="p-4 font-label-lg font-semibold text-on-surface">Due Date</th>
                      <th className="p-4 font-label-lg font-semibold text-on-surface">Type</th>
                      <th className="p-4 font-label-lg font-semibold text-on-surface">Description</th>
                      <th className="p-4 font-label-lg font-semibold text-on-surface text-right">Amount (₦)</th>
                      <th className="p-4 font-label-lg font-semibold text-on-surface text-right">Paid (₦)</th>
                      <th className="p-4 font-label-lg font-semibold text-on-surface">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {ledgers.map((entry: LedgerEntryResponse) => (
                      <tr key={entry.id} className="border-b border-outline-variant hover:bg-surface-container-high transition-colors">
                        <td className="p-4 text-body-md whitespace-nowrap">{entry.dueDate}</td>
                        <td className="p-4 text-body-md">
                          <span className="px-2 py-1 rounded bg-secondary-container text-on-secondary-container text-xs font-semibold">
                            {entry.entryType.replace('UTILITY_', '')}
                          </span>
                        </td>
                        <td className="p-4 text-body-md truncate max-w-[200px]" title={entry.description || ''}>
                          {entry.description || '-'}
                        </td>
                        <td className="p-4 text-body-md text-right font-medium">{entry.amountDue.toLocaleString()}</td>
                        <td className="p-4 text-body-md text-right text-primary">{entry.amountPaid.toLocaleString()}</td>
                        <td className="p-4 text-body-md">
                          <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                            entry.status === 'PAID' ? 'bg-primary-container text-on-primary-container' :
                            entry.status === 'OVERDUE' ? 'bg-error-container text-on-error-container' :
                            entry.status === 'PARTIAL' ? 'bg-tertiary-container text-on-tertiary-container' :
                            'bg-surface-variant text-on-surface-variant'
                          }`}>
                            {entry.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="p-8 text-center text-on-surface-variant">
                No ledger entries found for this lease.
              </div>
            )}
          </div>
        </div>
      </DashboardShell>
    </ProtectedRoute>
  );
}
