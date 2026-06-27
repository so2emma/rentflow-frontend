"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ProtectedRoute } from '@/components/ProtectedRoute';

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

export default function AdminDashboardPage() {
  const router = useRouter();
  const [landlords, setLandlords] = useState<LandlordVetInfo[]>(INITIAL_LANDLORDS);

  // Retrieve user details from localStorage safely
  const [user, setUser] = useState(() => {
    if (typeof window !== 'undefined') {
      const userString = localStorage.getItem('rentflow_user');
      return userString ? JSON.parse(userString) : null;
    }
    return null;
  });

  const handleLogout = () => {
    localStorage.removeItem('rentflow_token');
    localStorage.removeItem('rentflow_user');
    router.replace('/login');
  };

  const handleApprove = (id: string) => {
    setLandlords((prev) =>
      prev.map((l) => (l.id === id ? { ...l, status: 'VERIFIED' } : l))
    );
  };

  // Metrics
  const pendingCount = landlords.filter((l) => l.status === 'PENDING').length;
  const verifiedCount = landlords.filter((l) => l.status === 'VERIFIED').length;

  return (
    <ProtectedRoute allowedRole="ROLE_ADMIN">
      <div className="max-w-[1440px] mx-auto p-4 md:p-8 grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-6 min-h-screen">
        
        {/* Sidebar Navigation */}
        <aside className="bg-brand-deep-slate text-on-primary rounded-lg p-6 flex flex-col justify-between lg:h-[calc(100vh-64px)] lg:sticky lg:top-8">
          <div>
            <div className="text-2xl font-bold tracking-tight mb-6">RentFlow Admin</div>
            {user && (
              <div className="mb-6 text-xs opacity-80">
                <p>Connected Operator</p>
                <strong className="block text-sm mt-0.5 truncate">{user.email}</strong>
              </div>
            )}
            <nav className="flex flex-col gap-2">
              <button className="bg-white/10 text-on-primary text-left px-3.5 py-2.5 rounded-[6px] font-semibold text-sm border-l-3 border-brand-emerald-green">
                Overview &amp; Vetting
              </button>
              <button className="text-left px-3.5 py-2.5 text-[#7c839b] hover:bg-white/5 hover:text-white rounded-[6px] font-semibold text-sm transition">
                System Logs
              </button>
              <button className="text-left px-3.5 py-2.5 text-[#7c839b] hover:bg-white/5 hover:text-white rounded-[6px] font-semibold text-sm transition">
                Payout Runs
              </button>
              <button className="text-left px-3.5 py-2.5 text-[#7c839b] hover:bg-white/5 hover:text-white rounded-[6px] font-semibold text-sm transition">
                Settings &amp; Fees
              </button>
            </nav>
          </div>
          <button 
            onClick={handleLogout} 
            className="mt-6 bg-transparent border border-white/20 text-on-primary py-2.5 rounded-[6px] cursor-pointer font-semibold hover:bg-white/10 transition"
          >
            Sign Out
          </button>
        </aside>

        {/* Main Content Area */}
        <main className="flex flex-col gap-6">
          <div className="flex justify-between items-center border-b border-outline-variant pb-4">
            <div className="headerInfo">
              <h1 className="text-2xl md:text-3xl font-semibold text-brand-deep-slate">Administrator Control Panel</h1>
              <p className="text-sm text-on-surface-variant">Vet registered landlords, manage transaction ledgers, and trigger settlement payout runs.</p>
            </div>
          </div>

          {/* Overview Metrics */}
          <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-surface-container-lowest border border-outline-variant rounded-lg p-5 flex flex-col gap-1.5">
              <div className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider">Pending Landlord Approvals</div>
              <div className="text-3xl font-bold" style={{ color: pendingCount > 0 ? '#b45309' : 'var(--brand-deep-slate)' }}>
                {pendingCount}
              </div>
            </div>

            <div className="bg-surface-container-lowest border border-outline-variant rounded-lg p-5 flex flex-col gap-1.5">
              <div className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider">Vetted Platform Landlords</div>
              <div className="text-3xl font-bold text-brand-deep-slate">{verifiedCount}</div>
            </div>

            <div className="bg-surface-container-lowest border border-outline-variant rounded-lg p-5 flex flex-col gap-1.5">
              <div className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider">Total Payout Value Run</div>
              <div className="text-3xl font-bold text-brand-deep-slate tabular-nums">₦ 3,450,000.00</div>
            </div>
          </section>

          {/* Landlord Vetting List */}
          <section className="bg-surface-container-lowest border border-outline-variant rounded-lg p-6">
            <h2 className="text-lg font-semibold text-brand-deep-slate border-b border-surface-container-low pb-2 mb-4">Landlord Payout Settlement Verification</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-surface-container-low border-b border-outline-variant">
                    <th className="p-3.5 text-xs font-semibold uppercase text-on-surface-variant">Landlord Details</th>
                    <th className="p-3.5 text-xs font-semibold uppercase text-on-surface-variant">Settlement Bank</th>
                    <th className="p-3.5 text-xs font-semibold uppercase text-on-surface-variant">Account Number</th>
                    <th className="p-3.5 text-xs font-semibold uppercase text-on-surface-variant">Account Name</th>
                    <th className="p-3.5 text-xs font-semibold uppercase text-on-surface-variant">Status</th>
                    <th className="p-3.5 text-xs font-semibold uppercase text-on-surface-variant">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface-container-low">
                  {landlords.map((l) => (
                    <tr key={l.id} className="hover:bg-surface/50">
                      <td className="p-3.5 text-sm">
                        <strong className="text-on-surface">{l.name}</strong>
                        <span className="block text-xs text-on-surface-variant mt-0.5">{l.email}</span>
                      </td>
                      <td className="p-3.5 text-sm text-on-surface">{l.bankName}</td>
                      <td className="p-3.5 text-sm font-mono text-on-surface">{l.accountNumber}</td>
                      <td className="p-3.5 text-sm text-on-surface">{l.accountName}</td>
                      <td className="p-3.5 text-sm">
                        <span
                          className={`inline-flex items-center px-2.5 py-1 text-xs font-semibold rounded-full ${
                            l.status === 'VERIFIED'
                              ? 'bg-emerald-500/10 text-brand-emerald-green'
                              : 'bg-amber-500/10 text-[#b45309]'
                          }`}
                        >
                          {l.status}
                        </span>
                      </td>
                      <td className="p-3.5 text-sm">
                        {l.status === 'PENDING' ? (
                          <button
                            onClick={() => handleApprove(l.id)}
                            className="bg-secondary text-on-secondary py-1 px-3 text-xs font-semibold rounded-[6px] hover:opacity-90 cursor-pointer transition"
                          >
                            Verify Details
                          </button>
                        ) : (
                          <span className="text-xs text-brand-emerald-green font-semibold">
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
        </main>
      </div>
    </ProtectedRoute>
  );
}
