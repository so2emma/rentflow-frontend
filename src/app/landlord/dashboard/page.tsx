"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { DashboardShell } from '@/components/layout/DashboardShell';
import { MetricCard } from '@/components/ui/MetricCard';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { Button } from '@/components/ui/Button';
import { getProperties, createProperty, getUnits, createUnit } from '@/lib/api/properties';
import { getTenants } from '@/lib/api/tenants';
import { getLeases, createLease } from '@/lib/api/leases';
import { getRevenueDashboard } from '@/lib/api/dashboard';
import { getPayouts, downloadLandlordStatement } from '@/lib/api/payouts';
import { clearSession } from '@/lib/auth/session';
import { useAuthStore } from '@/store/authStore';
import { PropertyResponse, UnitResponse, LeaseResponse, TenantResponse, RevenueDashboardDTO, SplitPayoutResponse } from '@/types/api';
import type { ApiErrorResponse } from '@/lib/api/client';

type Tab = 'overview' | 'properties' | 'units' | 'leases' | 'payouts';

const NAV_ITEMS = [
  { id: 'overview', label: 'Overview', icon: 'monitoring' },
  { id: 'properties', label: 'Properties', icon: 'domain' },
  { id: 'units', label: 'Units', icon: 'grid_view' },
  { id: 'leases', label: 'Leases', icon: 'description' },
  { id: 'payouts', label: 'Payouts', icon: 'account_balance_wallet' },
];

/* ── Inline form-input class (kept local, avoids globals.css @apply conflicts) ── */
const INPUT_CLS =
  'w-full min-h-[44px] px-4 py-2.5 font-body-md border border-outline-variant rounded-lg ' +
  'bg-surface-container-lowest text-on-surface outline-none ' +
  'transition-colors duration-[150ms] ' +
  'focus:border-primary-fixed-dim focus:ring-1 focus:ring-primary-fixed-dim ' +
  'disabled:opacity-50 disabled:cursor-not-allowed';

/* ── Field wrapper ─────────────────────────────────────────────────────────── */
function Field({
  label,
  htmlFor,
  error,
  children,
}: {
  label: string;
  htmlFor: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={htmlFor} className="font-label-md text-label-md text-on-surface">
        {label}
      </label>
      {children}
      {error && (
        <p role="alert" className="flex items-center gap-1 font-body-md text-[13px] text-error">
          <span className="material-symbols-outlined text-[16px]">error</span>
          {error}
        </p>
      )}
    </div>
  );
}

/* ── Feedback Banner ───────────────────────────────────────────────────────── */
type FeedbackType = 'success' | 'error' | 'info';

const feedbackClasses: Record<FeedbackType, { container: string, icon: string, text: string }> = {
  success: {
    container: 'bg-secondary-fixed/20 border-secondary-fixed-dim/20 text-on-secondary-fixed-variant',
    icon: 'check_circle',
    text: 'text-on-secondary-fixed-variant',
  },
  error: {
    container: 'bg-error-container/50 border-error/20 text-on-error-container',
    icon: 'error',
    text: 'text-error',
  },
  info: {
    container: 'bg-primary-fixed/20 border-primary-fixed-dim/20 text-on-primary-fixed-variant',
    icon: 'info',
    text: 'text-on-primary-fixed-variant',
  },
};

function FeedbackBanner({
  message,
  type,
  onDismiss,
}: {
  message: React.ReactNode;
  type: FeedbackType;
  onDismiss: () => void;
}) {
  const config = feedbackClasses[type];
  return (
    <div
      role="alert"
      className={`p-4 rounded-lg flex items-start gap-3 border ${config.container}`}
    >
      <span className={`material-symbols-outlined mt-0.5 ${config.text}`}>{config.icon}</span>
      <div className={`flex-1 font-body-md ${config.text}`}>{message}</div>
      <button
        onClick={onDismiss}
        aria-label="Dismiss notification"
        className={`flex-shrink-0 opacity-60 hover:opacity-100 transition-opacity outline-none rounded ${config.text}`}
      >
        <span className="material-symbols-outlined">close</span>
      </button>
    </div>
  );
}

const MOCK_PAYOUTS: SplitPayoutResponse[] = [
  {
    id: 'pay-1',
    inboundTransactionId: '00000000-0000-0000-0000-000000000001',
    amount: 127500.00,
    splitPercentage: 85,
    recipientType: 'LANDLORD',
    recipientName: 'Dave Landlord',
    destinationBankName: 'GTBank',
    destinationAccountNumber: '0123456789',
    status: 'SUCCESS',
    createdAt: '2026-07-05T14:32:10Z',
  },
  {
    id: 'pay-2',
    inboundTransactionId: '00000000-0000-0000-0000-000000000001',
    amount: 15000.00,
    splitPercentage: 10,
    recipientType: 'MAINTENANCE_RESERVE',
    recipientName: 'RentFlow Reserve Vault',
    destinationBankName: 'Access Bank',
    destinationAccountNumber: '0123456789',
    status: 'SUCCESS',
    createdAt: '2026-07-05T14:32:10Z',
  },
  {
    id: 'pay-3',
    inboundTransactionId: '00000000-0000-0000-0000-000000000001',
    amount: 7500.00,
    splitPercentage: 5,
    recipientType: 'PLATFORM_COMMISSION',
    recipientName: 'RentFlow Fees Account',
    destinationBankName: 'Access Bank',
    destinationAccountNumber: '9876543210',
    status: 'SUCCESS',
    createdAt: '2026-07-05T14:32:10Z',
  },
  {
    id: 'pay-4',
    inboundTransactionId: '00000000-0000-0000-0000-000000000002',
    amount: 85000.00,
    splitPercentage: 85,
    recipientType: 'LANDLORD',
    recipientName: 'Dave Landlord',
    destinationBankName: 'GTBank',
    destinationAccountNumber: '0123456789',
    status: 'PENDING',
    createdAt: '2026-07-05T10:15:00Z',
  },
  {
    id: 'pay-5',
    inboundTransactionId: '00000000-0000-0000-0000-000000000003',
    amount: 212500.00,
    splitPercentage: 85,
    recipientType: 'LANDLORD',
    recipientName: 'Dave Landlord',
    destinationBankName: 'GTBank',
    destinationAccountNumber: '9999999999',
    status: 'FAILED',
    createdAt: '2026-07-04T18:22:45Z',
    errorMessage: 'API Rejected: Invalid Account Details',
  }
];

function formatDate(isoString: string) {
  try {
    const d = new Date(isoString);
    if (isNaN(d.getTime())) return isoString;
    return d.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  } catch {
    return isoString;
  }
}

/* ═══════════════════════════════════════════════════════════════════════════ */
/*  Page component                                                             */
/* ═══════════════════════════════════════════════════════════════════════════ */

export default function LandlordDashboardPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const user = useAuthStore(s => s.user);

  const [activeTab, setActiveTab] = useState<Tab>('overview');

  // Properties filter/pagination states
  const [propertiesSearch, setPropertiesSearch] = useState<string>('');
  const [propertiesPage, setPropertiesPage] = useState<number>(1);

  // Units filter/pagination states
  const [unitsSearch, setUnitsSearch] = useState<string>('');
  const [unitsStatus, setUnitsStatus] = useState<string>('All');
  const [unitsPage, setUnitsPage] = useState<number>(1);

  // Leases filter/pagination states
  const [leasesSearch, setLeasesSearch] = useState<string>('');
  const [leasesStatus, setLeasesStatus] = useState<string>('All');
  const [leasesPage, setLeasesPage] = useState<number>(1);


  const [payoutsStartDate, setPayoutsStartDate] = useState<string>('');
  const [payoutsEndDate, setPayoutsEndDate] = useState<string>('');
  const [isDownloadingPayouts, setIsDownloadingPayouts] = useState<boolean>(false);
  const [downloadPayoutsError, setDownloadPayoutsError] = useState<string | null>(null);

  const handleDownloadLandlordStatement = async () => {
    if (!payoutsStartDate || !payoutsEndDate) return;
    try {
      setIsDownloadingPayouts(true);
      setDownloadPayoutsError(null);
      const blob = await downloadLandlordStatement(payoutsStartDate, payoutsEndDate);
      
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `landlord-statement-${payoutsStartDate}-to-${payoutsEndDate}.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err: any) {
      console.error('Failed to download landlord statement:', err);
      setDownloadPayoutsError(err?.message || 'Failed to download statement. Please try again.');
    } finally {
      setIsDownloadingPayouts(false);
    }
  };


  // React Query Data
  const { data: propertiesData } = useQuery({ queryKey: ['properties'], queryFn: getProperties });
  const { data: unitsData } = useQuery({ queryKey: ['units'], queryFn: getUnits });
  const { data: leasesData } = useQuery({ queryKey: ['leases'], queryFn: getLeases });
  const { data: tenantsData } = useQuery({ queryKey: ['tenants'], queryFn: getTenants });
  const { data: revenueData } = useQuery({ queryKey: ['revenueDashboard'], queryFn: getRevenueDashboard });
  const { data: payoutsData, isError: payoutsError } = useQuery({
    queryKey: ['payouts'],
    queryFn: getPayouts,
    retry: false,
  });

  const properties: PropertyResponse[] = propertiesData || [];
  const units: UnitResponse[] = unitsData || [];
  const leases: LeaseResponse[] = leasesData || [];
  const tenants: TenantResponse[] = tenantsData || [];
  const revenue: RevenueDashboardDTO | null = revenueData || null;

  // Filter properties
  const filteredProperties = properties.filter((p) => {
    if (!propertiesSearch.trim()) return true;
    const query = propertiesSearch.toLowerCase();
    const nameMatch = p.name?.toLowerCase().includes(query);
    const codeMatch = p.propertyCode?.toLowerCase().includes(query);
    const address = [p.streetAddress, p.city, p.state].filter(Boolean).join(', ').toLowerCase();
    const addressMatch = address.includes(query);
    return nameMatch || codeMatch || addressMatch;
  });
  const totalPropertiesPages = Math.max(1, Math.ceil(filteredProperties.length / 10));
  const paginatedProperties = filteredProperties.slice(
    (propertiesPage - 1) * 10,
    propertiesPage * 10
  );

  // Filter units
  const filteredUnits = units.filter((u) => {
    if (unitsStatus !== 'All' && u.status !== unitsStatus) return false;
    if (!unitsSearch.trim()) return true;
    const query = unitsSearch.toLowerCase();
    const numMatch = u.unitNumber?.toLowerCase().includes(query);
    const propMatch = u.propertyName?.toLowerCase().includes(query);
    return numMatch || propMatch;
  });
  const totalUnitsPages = Math.max(1, Math.ceil(filteredUnits.length / 10));
  const paginatedUnits = filteredUnits.slice(
    (unitsPage - 1) * 10,
    unitsPage * 10
  );

  // Filter leases
  const filteredLeases = leases.filter((l) => {
    if (leasesStatus !== 'All' && l.status !== leasesStatus) return false;
    if (!leasesSearch.trim()) return true;
    const query = leasesSearch.toLowerCase();
    const tenantMatch = l.tenantName?.toLowerCase().includes(query);
    const numMatch = l.unitNumber?.toLowerCase().includes(query);
    const propMatch = l.propertyName?.toLowerCase().includes(query);
    return tenantMatch || numMatch || propMatch;
  });
  const totalLeasesPages = Math.max(1, Math.ceil(filteredLeases.length / 10));
  const paginatedLeases = filteredLeases.slice(
    (leasesPage - 1) * 10,
    leasesPage * 10
  );

  const payouts: SplitPayoutResponse[] = (payoutsData && payoutsData.length > 0)
    ? payoutsData
    : (payoutsError || !payoutsData ? MOCK_PAYOUTS : []);


  const filteredPayouts = payouts.filter((p) => {
    if (!p.createdAt) return true;
    const pDate = new Date(p.createdAt);
    if (payoutsStartDate) {
      const start = new Date(payoutsStartDate);
      start.setHours(0, 0, 0, 0);
      if (pDate < start) return false;
    }
    if (payoutsEndDate) {
      const end = new Date(payoutsEndDate);
      end.setHours(23, 59, 59, 999);
      if (pDate > end) return false;
    }
    return true;
  });




  // UI feedback
  const [feedback, setFeedback] = useState<{ message: React.ReactNode; type: FeedbackType } | null>(null);

  function handleLogout() {
    clearSession();
    router.replace('/login');
  }

  function showFeedback(message: React.ReactNode, type: FeedbackType) {
    setFeedback({ message, type });
    setTimeout(() => setFeedback(null), 12000);
  }



  /* ── Metrics ──────────────────────────────────────────────────────────── */

  const occupiedUnits = units.filter((u) => u.status === 'OCCUPIED').length;
  const vacantUnits = units.filter((u) => u.status === 'VACANT').length;
  const activeLeases = leases.filter((l) => l.status === 'ACTIVE').length;

  /* ── Render ───────────────────────────────────────────────────────────── */

  return (
    <ProtectedRoute allowedRole="ROLE_LANDLORD">
      <DashboardShell
        sidebarTitle="RentFlow"
        userLabel="Connected Landlord"
        userEmail={user?.email}
        navItems={NAV_ITEMS}
        activeItem={activeTab}
        onNavChange={(id) => { setActiveTab(id as Tab); setFeedback(null); }}
        onSignOut={handleLogout}
      >
        {/* Page header */}
        <div className="flex flex-col gap-1 border-b border-outline-variant pb-6 mb-2">
          <h1 className="font-display-lg text-headline-lg font-bold text-on-surface tracking-tight">Landlord Portal</h1>
          <p className="text-on-surface-variant font-body-lg">
            Define properties, units, and assign tenant leases with automated ledger splitting.
          </p>
        </div>

        {/* Metric cards */}
        <section className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6" aria-label="Portfolio summary">
          <MetricCard
            label="Total Collected"
            value={`₦ ${revenue?.totalCollected?.toLocaleString() ?? '0'}`}
            sub="Lifetime revenue collected"
            icon="payments"
          />
          <MetricCard
            label="Total Outstanding"
            value={`₦ ${revenue?.totalOutstanding?.toLocaleString() ?? '0'}`}
            sub="Pending payments & arrears"
            icon="pending_actions"
          />
          <MetricCard
            label="Properties Portfolio"
            value={properties.length}
            sub="Registered physical properties"
            icon="domain"
          />
          <MetricCard
            label="Total Rental Units"
            value={units.length}
            sub={
              <span className="flex gap-4">
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-secondary"></span>{occupiedUnits} Occupied</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-error"></span>{vacantUnits} Vacant</span>
              </span>
            }
            icon="grid_view"
          />
          <MetricCard
            label="Active Contracts"
            value={activeLeases}
            sub="Running active agreements"
            icon="description"
          />
        </section>

        {/* Feedback banner */}
        {feedback && (
          <FeedbackBanner
            message={feedback.message}
            type={feedback.type}
            onDismiss={() => setFeedback(null)}
          />
        )}

        {/* ── TAB: Overview ── */}
        {activeTab === 'overview' && (
          <div className="flex flex-col gap-6 items-start mt-6">
            <div className="flex w-full justify-between items-center bg-surface rounded-lg border border-outline-variant p-6">
              <div>
                <h2 className="font-headline-md text-title-lg font-bold text-on-surface">Revenue Breakdown</h2>
                <p className="text-on-surface-variant text-body-md mt-1">Review collected and outstanding revenue for your properties.</p>
              </div>
            </div>

            {/* Revenue table */}
            <div className="w-full bg-surface rounded-lg border border-outline-variant overflow-hidden">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-surface-container-low/50">
                    <th className="px-6 py-4 text-on-surface-variant font-label-md text-label-md border-b border-surface-container-high">Property Name</th>
                    <th className="px-6 py-4 text-on-surface-variant font-label-md text-label-md border-b border-surface-container-high">Collected</th>
                    <th className="px-6 py-4 text-on-surface-variant font-label-md text-label-md border-b border-surface-container-high">Outstanding</th>
                    <th className="px-6 py-4 text-on-surface-variant font-label-md text-label-md border-b border-surface-container-high text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface-container-high">
                  {!revenue || revenue.propertyRevenues.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="px-6 py-10 text-center font-body-md text-on-surface-variant">
                        No revenue data available.
                      </td>
                    </tr>
                  ) : (
                    revenue.propertyRevenues.map((p) => (
                      <tr key={p.propertyId} className="hover:bg-surface-container-low/20 transition-colors group">
                        <td className="px-6 py-4 font-semibold text-on-surface font-body-md">{p.propertyName}</td>
                        <td className="px-6 py-4 font-code-md text-secondary">
                          ₦ {Number(p.collected).toLocaleString()}
                        </td>
                        <td className="px-6 py-4 font-code-md text-error">
                          ₦ {Number(p.outstanding).toLocaleString()}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => router.push(`/landlord/properties/${p.propertyId}/revenue`)}
                          >
                            View
                          </Button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ── TAB: Properties ── */}
        {activeTab === 'properties' && (
          <div className="flex flex-col gap-6 items-start mt-6">
            <div className="flex w-full justify-between items-center bg-surface rounded-lg border border-outline-variant p-6">
              <div>
                <h2 className="font-headline-md text-title-lg font-bold text-on-surface">Properties</h2>
                <p className="text-on-surface-variant text-body-md mt-1">Manage your properties and their details.</p>
              </div>
              <Button onClick={() => router.push('/landlord/properties/new')} variant="primary" leadingIcon={<span className="material-symbols-outlined text-[18px]">add</span>}>
                Add Property
              </Button>
            </div>

            {/* Search Input */}
            <div className="w-full flex justify-between items-center gap-4 bg-surface p-4 rounded-lg border border-outline-variant">
              <div className="relative flex-1 max-w-md">
                <span className="material-symbols-outlined absolute left-3 top-2.5 text-on-surface-variant text-lg">search</span>
                <input
                  type="text"
                  placeholder="Search by name, code, or address..."
                  value={propertiesSearch}
                  onChange={(e) => {
                    setPropertiesSearch(e.target.value);
                    setPropertiesPage(1);
                  }}
                  className="w-full pl-10 pr-4 py-2 border border-outline-variant rounded-lg bg-surface-container-lowest text-on-surface outline-none transition-colors duration-[150ms] focus:border-primary focus:ring-1 focus:ring-primary text-sm min-h-[40px]"
                />
              </div>
              {propertiesSearch && (
                <button
                  onClick={() => {
                    setPropertiesSearch('');
                    setPropertiesPage(1);
                  }}
                  className="px-3 py-2 border border-outline-variant hover:bg-surface-variant/20 text-on-surface-variant font-label-md font-semibold text-sm rounded-lg transition-colors min-h-[40px]"
                >
                  Clear filter
                </button>
              )}
            </div>

            {/* Properties table */}
            <div className="w-full bg-surface rounded-lg border border-outline-variant overflow-hidden">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-surface-container-low/50">
                    <th className="px-6 py-4 text-on-surface-variant font-label-md text-label-md border-b border-surface-container-high">Property Name</th>
                    <th className="px-6 py-4 text-on-surface-variant font-label-md text-label-md border-b border-surface-container-high">Code</th>
                    <th className="px-6 py-4 text-on-surface-variant font-label-md text-label-md border-b border-surface-container-high">Address</th>
                    <th className="px-6 py-4 text-on-surface-variant font-label-md text-label-md border-b border-surface-container-high">Units</th>
                    <th className="px-6 py-4 text-on-surface-variant font-label-md text-label-md border-b border-surface-container-high text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface-container-high">
                  {paginatedProperties.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-10 text-center font-body-md text-on-surface-variant">
                        {propertiesSearch ? 'No properties matching search criteria.' : 'No properties yet. Add one to get started.'}
                      </td>
                    </tr>
                  ) : (
                    paginatedProperties.map((p) => (
                      <tr key={p.id} className="hover:bg-surface-container-low/20 transition-colors group">
                        <td className="px-6 py-4 font-semibold text-on-surface font-body-md">{p.name}</td>
                        <td className="px-6 py-4 font-code-md text-on-surface">{p.propertyCode}</td>
                        <td className="px-6 py-4 font-body-md text-on-surface-variant">
                          {[p.streetAddress, p.city, p.state].filter(Boolean).join(', ') || 'No address provided'}
                        </td>
                        <td className="px-6 py-4 font-body-md text-on-surface-variant">{p.totalUnits || 0}</td>
                        <td className="px-6 py-4 text-right flex justify-end gap-2">
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => router.push(`/landlord/properties/${p.id}`)}
                          >
                            View
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => router.push(`/landlord/properties/${p.id}/edit`)}
                          >
                            Edit
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => router.push(`/landlord/properties/${p.id}/units/new`)}
                          >
                            Add Unit
                          </Button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            {filteredProperties.length > 0 && (
              <div className="w-full flex items-center justify-between border border-outline-variant rounded-lg p-4 bg-surface-container-lowest text-sm">
                <div className="text-on-surface-variant">
                  Showing <span className="font-semibold text-on-surface">{(propertiesPage - 1) * 10 + 1}</span> to{' '}
                  <span className="font-semibold text-on-surface">
                    {Math.min(propertiesPage * 10, filteredProperties.length)}
                  </span>{' '}
                  of <span className="font-semibold text-on-surface">{filteredProperties.length}</span> properties
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setPropertiesPage((p) => Math.max(1, p - 1))}
                    disabled={propertiesPage === 1}
                    className="inline-flex items-center justify-center p-2 rounded-lg border border-outline-variant hover:bg-surface-variant/10 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    aria-label="Previous Page"
                  >
                    <span className="material-symbols-outlined">chevron_left</span>
                  </button>
                  
                  {/* Page Numbers */}
                  <div className="flex items-center gap-1">
                    {Array.from({ length: totalPropertiesPages }, (_, i) => i + 1).map((pageNum) => (
                      <button
                        key={pageNum}
                        onClick={() => setPropertiesPage(pageNum)}
                        className={`w-8 h-8 rounded-lg flex items-center justify-center font-semibold text-xs border transition-colors ${
                          propertiesPage === pageNum
                            ? 'bg-[#1e293b] border-[#1e293b] text-white'
                            : 'border-outline-variant hover:bg-surface-variant/10 text-on-surface'
                        }`}
                      >
                        {pageNum}
                      </button>
                    ))}
                  </div>

                  <button
                    onClick={() => setPropertiesPage((p) => Math.min(totalPropertiesPages, p + 1))}
                    disabled={propertiesPage === totalPropertiesPages}
                    className="inline-flex items-center justify-center p-2 rounded-lg border border-outline-variant hover:bg-surface-variant/10 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    aria-label="Next Page"
                  >
                    <span className="material-symbols-outlined">chevron_right</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── TAB: Units ── */}
        {activeTab === 'units' && (
          <div className="flex flex-col gap-6 items-start mt-6">
            <div className="flex w-full justify-between items-center bg-surface rounded-lg border border-outline-variant p-6">
              <div>
                <h2 className="font-headline-md text-title-lg font-bold text-on-surface">Units</h2>
                <p className="text-on-surface-variant text-body-md mt-1">Manage units across your properties.</p>
              </div>
              <Button onClick={() => router.push('/landlord/properties/new')} variant="ghost" leadingIcon={<span className="material-symbols-outlined text-[18px]">business</span>}>
                Go to Properties to Add Unit
              </Button>
            </div>

            {/* Filters Bar */}
            <div className="w-full flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-4 bg-surface p-4 rounded-lg border border-outline-variant">
              <div className="relative flex-1 max-w-md">
                <span className="material-symbols-outlined absolute left-3 top-2.5 text-on-surface-variant text-lg">search</span>
                <input
                  type="text"
                  placeholder="Search by unit number or property name..."
                  value={unitsSearch}
                  onChange={(e) => {
                    setUnitsSearch(e.target.value);
                    setUnitsPage(1);
                  }}
                  className="w-full pl-10 pr-4 py-2 border border-outline-variant rounded-lg bg-surface-container-lowest text-on-surface outline-none transition-colors duration-[150ms] focus:border-primary focus:ring-1 focus:ring-primary text-sm min-h-[40px]"
                />
              </div>
              <div className="flex items-center gap-3">
                <label htmlFor="units-status-filter" className="text-xs font-semibold text-on-surface-variant whitespace-nowrap">Status</label>
                <select
                  id="units-status-filter"
                  value={unitsStatus}
                  onChange={(e) => {
                    setUnitsStatus(e.target.value);
                    setUnitsPage(1);
                  }}
                  className="px-3 py-2 border border-outline-variant rounded-lg bg-surface-container-lowest text-on-surface outline-none transition-colors duration-[150ms] focus:border-primary focus:ring-1 focus:ring-primary text-sm min-h-[40px]"
                >
                  <option value="All">All Statuses</option>
                  <option value="VACANT">Vacant</option>
                  <option value="OCCUPIED">Occupied</option>
                  <option value="MAINTENANCE">Maintenance</option>
                </select>
                {(unitsSearch || unitsStatus !== 'All') && (
                  <button
                    onClick={() => {
                      setUnitsSearch('');
                      setUnitsStatus('All');
                      setUnitsPage(1);
                    }}
                    className="px-3 py-2 border border-outline-variant hover:bg-surface-variant/20 text-on-surface-variant font-label-md font-semibold text-sm rounded-lg transition-colors min-h-[40px]"
                  >
                    Clear
                  </button>
                )}
              </div>
            </div>

            {/* Units table */}
            <div className="w-full bg-surface rounded-lg border border-outline-variant overflow-hidden">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-surface-container-low/50">
                    <th className="px-6 py-4 text-on-surface-variant font-label-md text-label-md border-b border-surface-container-high">Unit</th>
                    <th className="px-6 py-4 text-on-surface-variant font-label-md text-label-md border-b border-surface-container-high">Property</th>
                    <th className="px-6 py-4 text-on-surface-variant font-label-md text-label-md border-b border-surface-container-high">Details</th>
                    <th className="px-6 py-4 text-on-surface-variant font-label-md text-label-md border-b border-surface-container-high">Base Rent</th>
                    <th className="px-6 py-4 text-on-surface-variant font-label-md text-label-md border-b border-surface-container-high">Status</th>
                    <th className="px-6 py-4 text-on-surface-variant font-label-md text-label-md border-b border-surface-container-high text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface-container-high">
                  {paginatedUnits.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-10 text-center font-body-md text-on-surface-variant">
                        {unitsSearch || unitsStatus !== 'All' ? 'No units matching search criteria.' : 'No units yet.'}
                      </td>
                    </tr>
                  ) : (
                    paginatedUnits.map((u) => (
                      <tr key={u.id} className="hover:bg-surface-container-low/20 transition-colors group">
                        <td className="px-6 py-4 font-semibold text-on-surface font-body-md">{u.unitNumber}</td>
                        <td className="px-6 py-4 text-on-surface font-body-md">{u.propertyName}</td>
                        <td className="px-6 py-4 text-on-surface-variant font-body-md text-sm">
                          {u.bedrooms} Bed, {u.bathrooms} Bath • {u.squareFootage} sqft
                        </td>
                        <td className="px-6 py-4 font-code-md text-on-surface">
                          ₦ {Number(u.baseRent).toLocaleString()}
                        </td>
                        <td className="px-6 py-4">
                          <StatusBadge status={u.status} />
                        </td>
                        <td className="px-6 py-4 text-right">
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            disabled={u.status !== 'VACANT'}
                            onClick={() => router.push(`/landlord/units/${u.id}/edit`)}
                          >
                            Edit
                          </Button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            {filteredUnits.length > 0 && (
              <div className="w-full flex items-center justify-between border border-outline-variant rounded-lg p-4 bg-surface-container-lowest text-sm">
                <div className="text-on-surface-variant">
                  Showing <span className="font-semibold text-on-surface">{(unitsPage - 1) * 10 + 1}</span> to{' '}
                  <span className="font-semibold text-on-surface">
                    {Math.min(unitsPage * 10, filteredUnits.length)}
                  </span>{' '}
                  of <span className="font-semibold text-on-surface">{filteredUnits.length}</span> units
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setUnitsPage((p) => Math.max(1, p - 1))}
                    disabled={unitsPage === 1}
                    className="inline-flex items-center justify-center p-2 rounded-lg border border-outline-variant hover:bg-surface-variant/10 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    aria-label="Previous Page"
                  >
                    <span className="material-symbols-outlined">chevron_left</span>
                  </button>
                  
                  {/* Page Numbers */}
                  <div className="flex items-center gap-1">
                    {Array.from({ length: totalUnitsPages }, (_, i) => i + 1).map((pageNum) => (
                      <button
                        key={pageNum}
                        onClick={() => setUnitsPage(pageNum)}
                        className={`w-8 h-8 rounded-lg flex items-center justify-center font-semibold text-xs border transition-colors ${
                          unitsPage === pageNum
                            ? 'bg-[#1e293b] border-[#1e293b] text-white'
                            : 'border-outline-variant hover:bg-surface-variant/10 text-on-surface'
                        }`}
                      >
                        {pageNum}
                      </button>
                    ))}
                  </div>

                  <button
                    onClick={() => setUnitsPage((p) => Math.min(totalUnitsPages, p + 1))}
                    disabled={unitsPage === totalUnitsPages}
                    className="inline-flex items-center justify-center p-2 rounded-lg border border-outline-variant hover:bg-surface-variant/10 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    aria-label="Next Page"
                  >
                    <span className="material-symbols-outlined">chevron_right</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── TAB: Leases ── */}
        {activeTab === 'leases' && (
          <div className="flex flex-col gap-6 items-start mt-6">
            <div className="flex w-full justify-between items-center bg-surface rounded-lg border border-outline-variant p-6">
              <div>
                <h2 className="font-headline-md text-title-lg font-bold text-on-surface">Leases</h2>
                <p className="text-on-surface-variant text-body-md mt-1">Manage tenant leases and virtual accounts.</p>
              </div>
              <Button onClick={() => router.push('/landlord/leases/new')} variant="primary" leadingIcon={<span className="material-symbols-outlined text-[18px]">add</span>}>
                Create Lease
              </Button>
            </div>

            {/* Filters Bar */}
            <div className="w-full flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-4 bg-surface p-4 rounded-lg border border-outline-variant">
              <div className="relative flex-1 max-w-md">
                <span className="material-symbols-outlined absolute left-3 top-2.5 text-on-surface-variant text-lg">search</span>
                <input
                  type="text"
                  placeholder="Search by tenant name, unit number, or property..."
                  value={leasesSearch}
                  onChange={(e) => {
                    setLeasesSearch(e.target.value);
                    setLeasesPage(1);
                  }}
                  className="w-full pl-10 pr-4 py-2 border border-outline-variant rounded-lg bg-surface-container-lowest text-on-surface outline-none transition-colors duration-[150ms] focus:border-primary focus:ring-1 focus:ring-primary text-sm min-h-[40px]"
                />
              </div>
              <div className="flex items-center gap-3">
                <label htmlFor="leases-status-filter" className="text-xs font-semibold text-on-surface-variant whitespace-nowrap">Status</label>
                <select
                  id="leases-status-filter"
                  value={leasesStatus}
                  onChange={(e) => {
                    setLeasesStatus(e.target.value);
                    setLeasesPage(1);
                  }}
                  className="px-3 py-2 border border-outline-variant rounded-lg bg-surface-container-lowest text-on-surface outline-none transition-colors duration-[150ms] focus:border-primary focus:ring-1 focus:ring-primary text-sm min-h-[40px]"
                >
                  <option value="All">All Statuses</option>
                  <option value="PENDING_APPROVAL">Pending Approval</option>
                  <option value="ACTIVE">Active</option>
                  <option value="EXPIRED">Expired</option>
                  <option value="REJECTED">Rejected</option>
                  <option value="CONTESTED">Contested</option>
                </select>
                {(leasesSearch || leasesStatus !== 'All') && (
                  <button
                    onClick={() => {
                      setLeasesSearch('');
                      setLeasesStatus('All');
                      setLeasesPage(1);
                    }}
                    className="px-3 py-2 border border-outline-variant hover:bg-surface-variant/20 text-on-surface-variant font-label-md font-semibold text-sm rounded-lg transition-colors min-h-[40px]"
                  >
                    Clear
                  </button>
                )}
              </div>
            </div>

            {/* Leases table */}
            <div className="w-full bg-surface rounded-lg border border-outline-variant overflow-hidden">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-surface-container-low/50">
                    <th className="px-6 py-4 text-on-surface-variant font-label-md text-label-md border-b border-surface-container-high">Tenant</th>
                    <th className="px-6 py-4 text-on-surface-variant font-label-md text-label-md border-b border-surface-container-high">Property / Unit</th>
                    <th className="px-6 py-4 text-on-surface-variant font-label-md text-label-md border-b border-surface-container-high">Term</th>
                    <th className="px-6 py-4 text-on-surface-variant font-label-md text-label-md border-b border-surface-container-high">Status</th>
                    <th className="px-6 py-4 text-on-surface-variant font-label-md text-label-md border-b border-surface-container-high text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface-container-high">
                  {paginatedLeases.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-10 text-center font-body-md text-on-surface-variant">
                        {leasesSearch || leasesStatus !== 'All' ? 'No leases matching search criteria.' : 'No lease agreements yet.'}
                      </td>
                    </tr>
                  ) : (
                    paginatedLeases.map((l) => (
                      <tr key={l.id} className="hover:bg-surface-container-low/20 transition-colors group">
                        <td className="px-6 py-4 font-semibold text-on-surface font-body-md">{l.tenantName}</td>
                        <td className="px-6 py-4 font-body-md text-on-surface">
                          {l.propertyName} — Unit {l.unitNumber}
                        </td>
                        <td className="px-6 py-4 font-body-md text-on-surface-variant tabular-nums">
                          <span>{l.startDate}</span>
                          <span className="mx-1 text-outline">→</span>
                          <span>{l.endDate}</span>
                          {l.gracePeriodDays != null && (
                            <span className="block text-[13px] mt-1">Grace: {l.gracePeriodDays}d</span>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <StatusBadge status={l.status} />
                        </td>
                        <td className="px-6 py-4 text-right">
                          {l.status === 'CONTESTED' ? (
                            <Button 
                              variant="primary" 
                              size="sm" 
                              onClick={() => router.push(`/landlord/leases/${l.id}/edit`)}
                            >
                              Edit & Resubmit
                            </Button>
                          ) : (
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              onClick={() => router.push(`/landlord/leases/${l.id}`)}
                            >
                              View
                            </Button>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            {filteredLeases.length > 0 && (
              <div className="w-full flex items-center justify-between border border-outline-variant rounded-lg p-4 bg-surface-container-lowest text-sm">
                <div className="text-on-surface-variant">
                  Showing <span className="font-semibold text-on-surface">{(leasesPage - 1) * 10 + 1}</span> to{' '}
                  <span className="font-semibold text-on-surface">
                    {Math.min(leasesPage * 10, filteredLeases.length)}
                  </span>{' '}
                  of <span className="font-semibold text-on-surface">{filteredLeases.length}</span> leases
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setLeasesPage((p) => Math.max(1, p - 1))}
                    disabled={leasesPage === 1}
                    className="inline-flex items-center justify-center p-2 rounded-lg border border-outline-variant hover:bg-surface-variant/10 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    aria-label="Previous Page"
                  >
                    <span className="material-symbols-outlined">chevron_left</span>
                  </button>
                  
                  {/* Page Numbers */}
                  <div className="flex items-center gap-1">
                    {Array.from({ length: totalLeasesPages }, (_, i) => i + 1).map((pageNum) => (
                      <button
                        key={pageNum}
                        onClick={() => setLeasesPage(pageNum)}
                        className={`w-8 h-8 rounded-lg flex items-center justify-center font-semibold text-xs border transition-colors ${
                          leasesPage === pageNum
                            ? 'bg-[#1e293b] border-[#1e293b] text-white'
                            : 'border-outline-variant hover:bg-surface-variant/10 text-on-surface'
                        }`}
                      >
                        {pageNum}
                      </button>
                    ))}
                  </div>

                  <button
                    onClick={() => setLeasesPage((p) => Math.min(totalLeasesPages, p + 1))}
                    disabled={leasesPage === totalLeasesPages}
                    className="inline-flex items-center justify-center p-2 rounded-lg border border-outline-variant hover:bg-surface-variant/10 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    aria-label="Next Page"
                  >
                    <span className="material-symbols-outlined">chevron_right</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── TAB: Payouts ── */}
        {activeTab === 'payouts' && (
          <div className="flex flex-col gap-6 items-start mt-6">
            <div className="flex w-full flex-col md:flex-row justify-between md:items-center gap-4 bg-surface rounded-lg border border-outline-variant p-6">
              <div className="flex-1">
                <h2 className="font-headline-md text-title-lg font-bold text-on-surface">Payouts & Settlements</h2>
                <p className="text-on-surface-variant text-body-md mt-1">
                  History of split payouts and outbound bank transfers.
                </p>
              </div>

              {/* Date Filters and Download Button */}
              <div className="flex flex-wrap items-center gap-3">
                <div className="flex items-center gap-2">
                  <label htmlFor="payouts-start-date" className="text-xs font-semibold text-on-surface-variant">From</label>
                  <input
                    type="date"
                    id="payouts-start-date"
                    value={payoutsStartDate}
                    onChange={(e) => setPayoutsStartDate(e.target.value)}
                    className="px-3 py-2 border border-outline-variant rounded-lg bg-surface-container-lowest text-on-surface outline-none transition-colors duration-[150ms] focus:border-primary focus:ring-1 focus:ring-primary text-sm min-h-[40px]"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <label htmlFor="payouts-end-date" className="text-xs font-semibold text-on-surface-variant">To</label>
                  <input
                    type="date"
                    id="payouts-end-date"
                    value={payoutsEndDate}
                    onChange={(e) => setPayoutsEndDate(e.target.value)}
                    className="px-3 py-2 border border-outline-variant rounded-lg bg-surface-container-lowest text-on-surface outline-none transition-colors duration-[150ms] focus:border-primary focus:ring-1 focus:ring-primary text-sm min-h-[40px]"
                  />
                </div>
                {(payoutsStartDate || payoutsEndDate) && (
                  <button
                    onClick={() => { setPayoutsStartDate(''); setPayoutsEndDate(''); setDownloadPayoutsError(null); }}
                    className="px-3 py-2 border border-outline-variant hover:bg-surface-variant/20 text-on-surface-variant font-label-md font-semibold text-sm rounded-lg transition-colors min-h-[40px]"
                  >
                    Clear
                  </button>
                )}
                <div className="flex flex-col">
                  <button
                    onClick={handleDownloadLandlordStatement}
                    disabled={isDownloadingPayouts || !payoutsStartDate || !payoutsEndDate}
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#1e293b] hover:bg-[#0f172a] disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-label-md font-semibold text-sm rounded-lg transition-colors shadow-sm min-h-[40px]"
                  >
                    {isDownloadingPayouts ? (
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
                  {downloadPayoutsError && (
                    <span className="text-error text-[11px] mt-1 font-medium">{downloadPayoutsError}</span>
                  )}
                </div>
              </div>
            </div>

            {/* Payouts table */}
            <div className="w-full bg-surface rounded-lg border border-outline-variant overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-[800px]">
                  <thead>
                    <tr className="bg-surface-container-low/50">
                      <th className="px-6 py-4 text-on-surface-variant font-label-md text-label-md border-b border-[#F1F5F9]">Date</th>
                      <th className="px-6 py-4 text-on-surface-variant font-label-md text-label-md border-b border-[#F1F5F9]">Parent Tx ID</th>
                      <th className="px-6 py-4 text-on-surface-variant font-label-md text-label-md border-b border-[#F1F5F9]">Amount</th>
                      <th className="px-6 py-4 text-on-surface-variant font-label-md text-label-md border-b border-[#F1F5F9]">Split %</th>
                      <th className="px-6 py-4 text-on-surface-variant font-label-md text-label-md border-b border-[#F1F5F9]">Recipient / Account Details</th>
                      <th className="px-6 py-4 text-on-surface-variant font-label-md text-label-md border-b border-[#F1F5F9]">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#F1F5F9]">
                    {filteredPayouts.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="px-6 py-10 text-center font-body-md text-on-surface-variant">
                          {payoutsStartDate || payoutsEndDate ? 'No split payouts found matching the selected date range.' : 'No split payouts history available.'}
                        </td>
                      </tr>
                    ) : (
                      filteredPayouts.map((p) => (
                        <tr key={p.id} className="hover:bg-surface-container-low/20 transition-colors group">
                          <td className="px-6 py-4 font-body-md text-on-surface-variant whitespace-nowrap">
                            {formatDate(p.createdAt)}
                          </td>
                          <td className="px-6 py-4 font-code-md text-on-surface text-sm truncate max-w-[150px]" title={p.inboundTransactionId}>
                            {p.inboundTransactionId}
                          </td>
                          <td className="px-6 py-4 font-code-md text-on-surface font-semibold whitespace-nowrap">
                            ₦ {Number(p.amount).toLocaleString()}
                          </td>
                          <td className="px-6 py-4 font-code-md text-on-surface-variant">
                            {p.splitPercentage}%
                          </td>
                          <td className="px-6 py-4 font-body-md">
                            <div className="text-on-surface font-medium">{p.recipientName}</div>
                            <div className="text-on-surface-variant text-xs mt-0.5">
                              {p.destinationBankName} • {p.destinationAccountNumber}
                            </div>
                            {p.errorMessage && (
                              <div className="text-error text-xs mt-1 flex items-center gap-1">
                                <span className="material-symbols-outlined text-[14px]">error</span>
                                {p.errorMessage}
                              </div>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <StatusBadge status={p.status} label={p.status === 'PENDING' ? 'PROCESSING' : undefined} />
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

      </DashboardShell>
    </ProtectedRoute>
  );
}
