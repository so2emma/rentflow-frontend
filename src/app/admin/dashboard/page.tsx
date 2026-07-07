"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { DashboardShell } from '@/components/layout/DashboardShell';
import { MetricCard } from '@/components/ui/MetricCard';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { Button } from '@/components/ui/Button';
import {logoutUser} from '@/lib/auth/session';
import { useAuthStore } from '@/store/authStore';

interface LandlordVetInfo {
  id: string;
  name: string;
  email: string;
  bankName: string;
  accountNumber: string;
  accountName: string;
  status: 'PENDING' | 'VERIFIED';
}

const INITIAL_LANDLORDS: LandlordVetInfo[] = [
  {
    id: 'lnd-1',
    name: 'Alhaji Ibrahim',
    email: 'ibrahim@landlord.com',
    bankName: 'GTBank (058)',
    accountNumber: '0123456789',
    accountName: 'Ibrahim & Sons Ltd',
    status: 'PENDING',
  },
  {
    id: 'lnd-2',
    name: 'Chinedu Okafor',
    email: 'chinedu@landlord.com',
    bankName: 'Zenith Bank (057)',
    accountNumber: '9876543210',
    accountName: 'Okafor Real Estate',
    status: 'PENDING',
  },
  {
    id: 'lnd-3',
    name: 'Olumide Awosika',
    email: 'olumide@landlord.com',
    bankName: 'Access Bank (044)',
    accountNumber: '0443210987',
    accountName: 'Awosika Properties',
    status: 'VERIFIED',
  },
];

const NAV_ITEMS = [
  { id: 'overview', label: 'Overview & Vetting', icon: 'admin_panel_settings' },
  { id: 'logs', label: 'System Logs', icon: 'list_alt' },
  { id: 'settings', label: 'Settings & Fees', icon: 'settings' },
];

export default function AdminDashboardPage() {
  const router = useRouter();
  const user = useAuthStore(s => s.user);

  const [activeTab, setActiveTab] = useState('overview');

  const [landlords, setLandlords] = useState<LandlordVetInfo[]>(() => {
    if (typeof window !== 'undefined') {
      const local = localStorage.getItem('rentflow_admin_landlords');
      return local ? JSON.parse(local) : INITIAL_LANDLORDS;
    }
    return INITIAL_LANDLORDS;
  });

  function handleLogout() {
    logoutUser();
  }

  function handleApprove(id: string) {
    const updated = landlords.map((l) =>
      l.id === id ? { ...l, status: 'VERIFIED' as const } : l
    );
    setLandlords(updated);
    localStorage.setItem('rentflow_admin_landlords', JSON.stringify(updated));
  }

  const pendingCount = landlords.filter((l) => l.status === 'PENDING').length;
  const verifiedCount = landlords.filter((l) => l.status === 'VERIFIED').length;

  return (
    <ProtectedRoute allowedRole="ROLE_ADMIN">
      <DashboardShell
        sidebarTitle="RentFlow Admin"
        userLabel="Connected Operator"
        userEmail={user?.email}
        navItems={NAV_ITEMS}
        activeItem={activeTab}
        onNavChange={setActiveTab}
        onSignOut={handleLogout}
      >
        {/* Page header */}
        <div className="flex flex-col gap-1 border-b border-outline-variant pb-6 mb-2">
          <h1 className="font-display-lg text-headline-lg font-bold text-on-surface tracking-tight">
            Administrator Control Panel
          </h1>
          <p className="text-on-surface-variant font-body-lg">
            Vet registered landlords, manage transaction ledgers, and trigger settlement payout runs.
          </p>
        </div>

        {/* Metric cards */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6" aria-label="Platform metrics">
          <MetricCard
            label="Pending Approvals"
            value={pendingCount}
            sub={pendingCount > 0 ? <span className="text-error flex items-center gap-1"><span className="material-symbols-outlined text-[16px]">warning</span> Action Required</span> : 'All up to date'}
            icon="pending_actions"
          />
          <MetricCard
            label="Vetted Landlords"
            value={verifiedCount}
            sub="Approved for disbursement"
            icon="verified_user"
          />
          <MetricCard
            label="Total Payout Value Run"
            value="₦3,450,000"
            sub="Cumulative disbursement total"
            icon="payments"
          />
        </section>

        {/* Landlord vetting table */}
        {activeTab === 'overview' && (
          <section className="bg-surface rounded-lg border border-outline-variant overflow-hidden">
            <div className="p-6 border-b border-outline-variant bg-surface-container-lowest">
              <h2 id="vetting-title" className="font-headline-md text-title-lg font-bold text-on-surface">
                Landlord Payout Settlement Verification
              </h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-surface-container-low/50">
                    <th className="px-6 py-4 text-on-surface-variant font-label-md text-label-md border-b border-surface-container-high">Landlord</th>
                    <th className="px-6 py-4 text-on-surface-variant font-label-md text-label-md border-b border-surface-container-high">Settlement Bank</th>
                    <th className="px-6 py-4 text-on-surface-variant font-label-md text-label-md border-b border-surface-container-high">Account No.</th>
                    <th className="px-6 py-4 text-on-surface-variant font-label-md text-label-md border-b border-surface-container-high">Account Name</th>
                    <th className="px-6 py-4 text-on-surface-variant font-label-md text-label-md border-b border-surface-container-high">Status</th>
                    <th className="px-6 py-4 text-on-surface-variant font-label-md text-label-md border-b border-surface-container-high">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface-container-high">
                  {landlords.map((l) => (
                    <tr key={l.id} className="hover:bg-surface-container-low/20 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="font-semibold text-on-surface font-body-md">{l.name}</div>
                        <div className="text-on-surface-variant text-[13px]">{l.email}</div>
                      </td>
                      <td className="px-6 py-4 text-on-surface font-body-md">{l.bankName}</td>
                      <td className="px-6 py-4 font-code-md text-on-surface">{l.accountNumber}</td>
                      <td className="px-6 py-4 text-on-surface font-body-md">{l.accountName}</td>
                      <td className="px-6 py-4">
                        <StatusBadge status={l.status} />
                      </td>
                      <td className="px-6 py-4">
                        {l.status === 'PENDING' ? (
                          <button
                            className="bg-primary text-on-primary hover:bg-primary/90 px-4 py-2 rounded-lg font-label-md text-label-md transition-all active:scale-[0.98]"
                            onClick={() => handleApprove(l.id)}
                          >
                            Verify Details
                          </button>
                        ) : (
                          <span className="text-on-surface-variant font-label-md text-label-md">
                            Verified
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {/* Placeholder sections for other tabs */}
        {activeTab === 'logs' && (
          <div className="bg-surface rounded-lg border border-outline-variant p-12 flex flex-col items-center justify-center text-center">
            <span className="material-symbols-outlined text-[48px] text-on-surface-variant/30 mb-4">list_alt</span>
            <p className="font-headline-md text-title-lg font-bold text-on-surface mb-2">System Logs</p>
            <p className="text-on-surface-variant font-body-md max-w-md">Coming soon — audit trail and system event logs will appear here for full traceability.</p>
          </div>
        )}
        {activeTab === 'settings' && (
          <div className="bg-surface rounded-lg border border-outline-variant p-12 flex flex-col items-center justify-center text-center">
            <span className="material-symbols-outlined text-[48px] text-on-surface-variant/30 mb-4">settings</span>
            <p className="font-headline-md text-title-lg font-bold text-on-surface mb-2">Settings &amp; Fees</p>
            <p className="text-on-surface-variant font-body-md max-w-md">Coming soon — platform fee configuration and global payout schedules.</p>
          </div>
        )}
      </DashboardShell>
    </ProtectedRoute>
  );
}
