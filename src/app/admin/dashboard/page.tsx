"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { DashboardShell } from '@/components/layout/DashboardShell';
import { UsersIcon, ChartIcon, SettingsIcon } from '@/components/layout/Sidebar';
import { MetricCard } from '@/components/ui/MetricCard';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { Button } from '@/components/ui/Button';
import { getUser, clearSession } from '@/lib/auth/session';

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
  { id: 'overview', label: 'Overview & Vetting', icon: <UsersIcon /> },
  { id: 'logs', label: 'System Logs', icon: <ChartIcon /> },
  { id: 'settings', label: 'Settings & Fees', icon: <SettingsIcon /> },
];

export default function AdminDashboardPage() {
  const router = useRouter();
  const user = getUser();

  const [activeTab, setActiveTab] = useState('overview');

  const [landlords, setLandlords] = useState<LandlordVetInfo[]>(() => {
    if (typeof window !== 'undefined') {
      const local = localStorage.getItem('rentflow_admin_landlords');
      return local ? JSON.parse(local) : INITIAL_LANDLORDS;
    }
    return INITIAL_LANDLORDS;
  });

  function handleLogout() {
    clearSession();
    router.replace('/login');
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
        <div className="flex flex-col gap-1 border-b border-outline-variant pb-4">
          <h1 className="text-2xl md:text-3xl font-semibold text-brand-deep-slate">
            Administrator Control Panel
          </h1>
          <p className="text-sm text-on-surface-variant">
            Vet registered landlords, manage transaction ledgers, and trigger settlement payout runs.
          </p>
        </div>

        {/* Metric cards */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-4" aria-label="Platform metrics">
          <MetricCard
            label="Pending Landlord Approvals"
            value={
              <span className={pendingCount > 0 ? 'text-warning' : 'text-brand-deep-slate'}>
                {pendingCount}
              </span>
            }
            sub={pendingCount > 0 ? 'Require review' : 'All up to date'}
          />
          <MetricCard
            label="Vetted Platform Landlords"
            value={verifiedCount}
            sub="Approved for disbursement"
          />
          <MetricCard
            label="Total Payout Value Run"
            value="₦ 3,450,000"
            sub="Cumulative disbursement total"
          />
        </section>

        {/* Landlord vetting table */}
        {activeTab === 'overview' && (
          <section
            className="bg-surface-container-lowest border border-outline-variant rounded-md shadow-sm overflow-hidden"
            aria-labelledby="vetting-title"
          >
            <div className="p-6 border-b border-outline-variant">
              <h2 id="vetting-title" className="text-lg font-semibold text-brand-deep-slate">
                Landlord Payout Settlement Verification
              </h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse font-sans">
                <thead>
                  <tr className="bg-surface-container-low border-b border-outline-variant">
                    <th className="p-3.5 text-xs font-semibold uppercase tracking-wider text-on-surface-variant">Landlord</th>
                    <th className="p-3.5 text-xs font-semibold uppercase tracking-wider text-on-surface-variant">Settlement Bank</th>
                    <th className="p-3.5 text-xs font-semibold uppercase tracking-wider text-on-surface-variant">Account No.</th>
                    <th className="p-3.5 text-xs font-semibold uppercase tracking-wider text-on-surface-variant">Account Name</th>
                    <th className="p-3.5 text-xs font-semibold uppercase tracking-wider text-on-surface-variant">Status</th>
                    <th className="p-3.5 text-xs font-semibold uppercase tracking-wider text-on-surface-variant">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface-container-low">
                  {landlords.map((l) => (
                    <tr key={l.id} className="hover:bg-surface-container-low/40 transition-colors duration-[150ms]">
                      <td className="p-3.5">
                        <span className="block text-sm font-semibold text-on-surface">{l.name}</span>
                        <span className="block text-xs text-on-surface-variant mt-0.5">{l.email}</span>
                      </td>
                      <td className="p-3.5 text-sm text-on-surface">{l.bankName}</td>
                      <td className="p-3.5 text-sm font-mono tabular-nums text-on-surface">{l.accountNumber}</td>
                      <td className="p-3.5 text-sm text-on-surface">{l.accountName}</td>
                      <td className="p-3.5">
                        <StatusBadge status={l.status} />
                      </td>
                      <td className="p-3.5">
                        {l.status === 'PENDING' ? (
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => handleApprove(l.id)}
                          >
                            Verify Details
                          </Button>
                        ) : (
                          <span className="text-xs text-on-secondary-container bg-secondary-container px-2.5 py-1 rounded-full font-semibold">
                            Approved
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
          <div className="bg-surface-container-lowest border border-outline-variant rounded-md p-12 text-center text-on-surface-variant shadow-sm">
            <p className="text-sm font-semibold">System Logs</p>
            <p className="text-xs mt-1">Coming soon — audit trail and system event logs.</p>
          </div>
        )}
        {activeTab === 'settings' && (
          <div className="bg-surface-container-lowest border border-outline-variant rounded-md p-12 text-center text-on-surface-variant shadow-sm">
            <p className="text-sm font-semibold">Settings &amp; Fees</p>
            <p className="text-xs mt-1">Coming soon — platform fee configuration and payout schedules.</p>
          </div>
        )}
      </DashboardShell>
    </ProtectedRoute>
  );
}
