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
import { clearSession } from '@/lib/auth/session';
import { useAuthStore } from '@/store/authStore';
import { PropertyResponse, UnitResponse, LeaseResponse, TenantResponse } from '@/types/api';
import type { ApiErrorResponse } from '@/lib/api/client';

type Tab = 'properties' | 'units' | 'leases';

const NAV_ITEMS = [
  { id: 'properties', label: 'Properties', icon: 'domain' },
  { id: 'units', label: 'Units', icon: 'grid_view' },
  { id: 'leases', label: 'Leases', icon: 'description' },
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

/* ═══════════════════════════════════════════════════════════════════════════ */
/*  Page component                                                             */
/* ═══════════════════════════════════════════════════════════════════════════ */

export default function LandlordDashboardPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const user = useAuthStore(s => s.user);

  const [activeTab, setActiveTab] = useState<Tab>('properties');

  // React Query Data
  const { data: propertiesData } = useQuery({ queryKey: ['properties'], queryFn: getProperties });
  const { data: unitsData } = useQuery({ queryKey: ['units'], queryFn: getUnits });
  const { data: leasesData } = useQuery({ queryKey: ['leases'], queryFn: getLeases });
  const { data: tenantsData } = useQuery({ queryKey: ['tenants'], queryFn: getTenants });

  const properties: PropertyResponse[] = propertiesData || [];
  const units: UnitResponse[] = unitsData || [];
  const leases: LeaseResponse[] = leasesData || [];
  const tenants: TenantResponse[] = tenantsData || [];



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
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6" aria-label="Portfolio summary">
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
            sub="Running active tenant agreements"
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
                  {properties.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-10 text-center font-body-md text-on-surface-variant">
                        No properties yet. Add one to get started.
                      </td>
                    </tr>
                  ) : (
                    properties.map((p) => (
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
                  {units.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-10 text-center font-body-md text-on-surface-variant">
                        No units yet.
                      </td>
                    </tr>
                  ) : (
                    units.map((u) => (
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
                  {leases.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-10 text-center font-body-md text-on-surface-variant">
                        No lease agreements yet.
                      </td>
                    </tr>
                  ) : (
                    leases.map((l) => (
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
          </div>
        )}
      </DashboardShell>
    </ProtectedRoute>
  );
}
