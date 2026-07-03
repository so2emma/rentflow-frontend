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

  // Add Property form
  const [propName, setPropName] = useState('');
  const [propAddress, setPropAddress] = useState('');
  const [propCode, setPropCode] = useState('');
  const [propErrors, setPropErrors] = useState<Partial<Record<'name' | 'address' | 'code', string>>>({});

  // Add Unit form
  const [unitPropId, setUnitPropId] = useState('');
  const [unitNumber, setUnitNumber] = useState('');
  const [unitBaseRent, setUnitBaseRent] = useState('');
  const [unitErrors, setUnitErrors] = useState<Partial<Record<'property' | 'number' | 'rent', string>>>({});

  // Create Lease form
  const [leaseTenantId, setLeaseTenantId] = useState('');
  const [leaseUnitId, setLeaseUnitId] = useState('');
  const [leaseStartDate, setLeaseStartDate] = useState('');
  const [leaseEndDate, setLeaseEndDate] = useState('');
  const [leaseGracePeriod, setLeaseGracePeriod] = useState('5');
  const [leaseErrors, setLeaseErrors] = useState<Partial<Record<'tenant' | 'unit' | 'start' | 'end', string>>>({});

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

  /* ── Add Property ─────────────────────────────────────────────────────── */

  const createPropertyMutation = useMutation({
    mutationFn: (data: Parameters<typeof createProperty>[0]) => createProperty(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['properties'] });
      showFeedback('Property added successfully.', 'success');
      setPropName(''); setPropAddress(''); setPropCode('');
    },
    onError: (error: unknown) => {
      const err = error as ApiErrorResponse;
      if (err.errors) {
        setPropErrors({
          name: err.errors.name,
          address: err.errors.address,
          code: err.errors.propertyCode,
        });
      }
      showFeedback(err.message || 'Failed to create property. Please try again.', 'error');
    }
  });

  async function handleAddProperty(e: React.FormEvent) {
    e.preventDefault();
    const errs: typeof propErrors = {};
    if (!propName.trim()) errs.name = 'Property name is required.';
    if (!propAddress.trim()) errs.address = 'Address is required.';
    if (!propCode.trim()) errs.code = 'Property code is required.';
    if (Object.keys(errs).length) { setPropErrors(errs); return; }
    setPropErrors({});

    createPropertyMutation.mutate({ name: propName, address: propAddress, propertyCode: propCode });
  }

  /* ── Add Unit ─────────────────────────────────────────────────────────── */

  const createUnitMutation = useMutation({
    mutationFn: (data: { propertyId: string, unit: { unitNumber: string, baseRent: number } }) => createUnit(data.propertyId, data.unit),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['units'] });
      showFeedback('Unit added successfully.', 'success');
      setUnitNumber(''); setUnitBaseRent('');
    },
    onError: (error: unknown) => {
      const err = error as ApiErrorResponse;
      if (err.errors) {
        setUnitErrors({
          number: err.errors.unitNumber,
          rent: err.errors.baseRent,
        });
      }
      showFeedback(err.message || 'Failed to create unit. Please try again.', 'error');
    }
  });

  async function handleAddUnit(e: React.FormEvent) {
    e.preventDefault();
    const errs: typeof unitErrors = {};
    if (!unitPropId) errs.property = 'Please select a property.';
    if (!unitNumber.trim()) errs.number = 'Unit number is required.';
    const rent = parseFloat(unitBaseRent);
    if (isNaN(rent) || rent <= 0) errs.rent = 'Enter a valid base rent amount.';
    if (Object.keys(errs).length) { setUnitErrors(errs); return; }
    setUnitErrors({});

    createUnitMutation.mutate({ propertyId: unitPropId, unit: { unitNumber, baseRent: rent } });
  }

  /* ── Create Lease ─────────────────────────────────────────────────────── */

  const createLeaseMutation = useMutation({
    mutationFn: (data: Parameters<typeof createLease>[0]) => createLease(data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['leases'] });
      queryClient.invalidateQueries({ queryKey: ['units'] });
      
      const vactNum = data.nombaVactNumber || '—';
      const vactBank = data.nombaVactBank || '—';
      const vactRef = data.nombaVactRef || '—';

      showFeedback(
        <div className="flex flex-col gap-2">
          <span className="font-semibold">Lease created. Virtual account provisioned.</span>
          <div className="grid grid-cols-3 gap-4 text-[13px] border-t border-current/20 pt-3 mt-1">
            <div>
              <span className="block opacity-70 font-label-md text-label-md uppercase tracking-wider mb-1">Bank</span>
              <span className="font-semibold">{vactBank}</span>
            </div>
            <div>
              <span className="block opacity-70 font-label-md text-label-md uppercase tracking-wider mb-1">Account No.</span>
              <span className="font-code-md font-bold">{vactNum}</span>
            </div>
            <div>
              <span className="block opacity-70 font-label-md text-label-md uppercase tracking-wider mb-1">Ref</span>
              <span className="font-code-md">{vactRef}</span>
            </div>
          </div>
        </div>,
        'success'
      );

      setLeaseTenantId(''); setLeaseUnitId(''); setLeaseStartDate('');
      setLeaseEndDate(''); setLeaseGracePeriod('5');
    },
    onError: (error: unknown) => {
      const err = error as ApiErrorResponse;
      if (err.errors) {
        setLeaseErrors({
          tenant: err.errors.tenantId,
          unit: err.errors.unitId,
          start: err.errors.startDate,
          end: err.errors.endDate,
        });
      }
      showFeedback(err.message || 'Failed to create lease. Please try again.', 'error');
    }
  });

  async function handleCreateLease(e: React.FormEvent) {
    e.preventDefault();
    const errs: typeof leaseErrors = {};
    if (!leaseTenantId) errs.tenant = 'Please select a tenant.';
    if (!leaseUnitId) errs.unit = 'Please select a unit.';
    if (!leaseStartDate) errs.start = 'Start date is required.';
    if (!leaseEndDate) errs.end = 'End date is required.';
    if (Object.keys(errs).length) { setLeaseErrors(errs); return; }
    setLeaseErrors({});

    const graceDays = parseInt(leaseGracePeriod) || 5;
    createLeaseMutation.mutate({
      tenantId: leaseTenantId,
      unitId: leaseUnitId,
      startDate: leaseStartDate,
      endDate: leaseEndDate,
      gracePeriodDays: graceDays,
    });
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
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start mt-6">
            {/* Add Property form */}
            <section
              className="xl:col-span-4 bg-surface rounded-lg border border-outline-variant p-6"
              aria-labelledby="add-property-title"
            >
              <h2 id="add-property-title" className="font-headline-md text-title-lg font-bold text-on-surface border-b border-outline-variant pb-3 mb-5">
                Add Property
              </h2>
              <form onSubmit={handleAddProperty} noValidate className="flex flex-col gap-4">
                <Field label="Property Name" htmlFor="propName" error={propErrors.name}>
                  <input id="propName" type="text" className={INPUT_CLS}
                    placeholder="e.g. Oakwood Apartments" value={propName}
                    onChange={(e) => setPropName(e.target.value)} required disabled={createPropertyMutation.isPending} />
                </Field>
                <Field label="Property Address" htmlFor="propAddress" error={propErrors.address}>
                  <input id="propAddress" type="text" className={INPUT_CLS}
                    placeholder="e.g. 14 Broad Street, Lagos Island" value={propAddress}
                    onChange={(e) => setPropAddress(e.target.value)} required disabled={createPropertyMutation.isPending} />
                </Field>
                <Field label="Property Code (Unique)" htmlFor="propCode" error={propErrors.code}>
                  <input id="propCode" type="text" className={INPUT_CLS}
                    placeholder="e.g. OAK-01" value={propCode}
                    onChange={(e) => setPropCode(e.target.value.toUpperCase())} required disabled={createPropertyMutation.isPending} />
                </Field>
                <button type="submit" disabled={createPropertyMutation.isPending} className="w-full bg-primary text-on-primary hover:bg-primary/90 px-6 py-2.5 rounded-lg font-label-md text-label-md transition-all active:scale-[0.98] mt-2 flex justify-center">
                  {createPropertyMutation.isPending ? 'Saving…' : 'Save Property'}
                </button>
              </form>
            </section>

            {/* Properties table */}
            <div className="xl:col-span-8 bg-surface rounded-lg border border-outline-variant overflow-hidden">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-surface-container-low/50">
                    <th className="px-6 py-4 text-on-surface-variant font-label-md text-label-md border-b border-surface-container-high">Property Name</th>
                    <th className="px-6 py-4 text-on-surface-variant font-label-md text-label-md border-b border-surface-container-high">Code</th>
                    <th className="px-6 py-4 text-on-surface-variant font-label-md text-label-md border-b border-surface-container-high">Address</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface-container-high">
                  {properties.length === 0 ? (
                    <tr>
                      <td colSpan={3} className="px-6 py-10 text-center font-body-md text-on-surface-variant">
                        No properties yet. Add one using the form.
                      </td>
                    </tr>
                  ) : (
                    properties.map((p) => (
                      <tr key={p.id} className="hover:bg-surface-container-low/20 transition-colors group">
                        <td className="px-6 py-4 font-semibold text-on-surface font-body-md">{p.name}</td>
                        <td className="px-6 py-4 font-code-md text-on-surface">{p.propertyCode}</td>
                        <td className="px-6 py-4 font-body-md text-on-surface-variant">{p.address}</td>
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
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start mt-6">
            {/* Add Unit form */}
            <section
              className="xl:col-span-4 bg-surface rounded-lg border border-outline-variant p-6"
              aria-labelledby="add-unit-title"
            >
              <h2 id="add-unit-title" className="font-headline-md text-title-lg font-bold text-on-surface border-b border-outline-variant pb-3 mb-5">
                Add Unit
              </h2>
              <form onSubmit={handleAddUnit} noValidate className="flex flex-col gap-4">
                <Field label="Select Property" htmlFor="unitProp" error={unitErrors.property}>
                  <select id="unitProp" className={INPUT_CLS + ' cursor-pointer'}
                    value={unitPropId} onChange={(e) => setUnitPropId(e.target.value)}
                    required disabled={createUnitMutation.isPending}>
                    <option value="">— Select Property —</option>
                    {properties.map((p) => (
                      <option key={p.id} value={p.id}>{p.name} ({p.propertyCode})</option>
                    ))}
                  </select>
                </Field>
                <Field label="Unit Number" htmlFor="unitNumber" error={unitErrors.number}>
                  <input id="unitNumber" type="text" className={INPUT_CLS}
                    placeholder="e.g. Suite 3B" value={unitNumber}
                    onChange={(e) => setUnitNumber(e.target.value)} required disabled={createUnitMutation.isPending} />
                </Field>
                <Field label="Base Rent (₦ per annum)" htmlFor="unitBaseRent" error={unitErrors.rent}>
                  <input id="unitBaseRent" type="number" min="1" className={INPUT_CLS}
                    placeholder="e.g. 1500000" value={unitBaseRent}
                    onChange={(e) => setUnitBaseRent(e.target.value)} required disabled={createUnitMutation.isPending} />
                </Field>
                <button type="submit" disabled={createUnitMutation.isPending} className="w-full bg-primary text-on-primary hover:bg-primary/90 px-6 py-2.5 rounded-lg font-label-md text-label-md transition-all active:scale-[0.98] mt-2 flex justify-center">
                  {createUnitMutation.isPending ? 'Saving…' : 'Save Unit'}
                </button>
              </form>
            </section>

            {/* Units table */}
            <div className="xl:col-span-8 bg-surface rounded-lg border border-outline-variant overflow-hidden">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-surface-container-low/50">
                    <th className="px-6 py-4 text-on-surface-variant font-label-md text-label-md border-b border-surface-container-high">Unit</th>
                    <th className="px-6 py-4 text-on-surface-variant font-label-md text-label-md border-b border-surface-container-high">Property</th>
                    <th className="px-6 py-4 text-on-surface-variant font-label-md text-label-md border-b border-surface-container-high">Base Rent</th>
                    <th className="px-6 py-4 text-on-surface-variant font-label-md text-label-md border-b border-surface-container-high">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface-container-high">
                  {units.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="px-6 py-10 text-center font-body-md text-on-surface-variant">
                        No units yet. Add one using the form.
                      </td>
                    </tr>
                  ) : (
                    units.map((u) => (
                      <tr key={u.id} className="hover:bg-surface-container-low/20 transition-colors group">
                        <td className="px-6 py-4 font-semibold text-on-surface font-body-md">{u.unitNumber}</td>
                        <td className="px-6 py-4 text-on-surface font-body-md">{u.propertyName}</td>
                        <td className="px-6 py-4 font-code-md text-on-surface">
                          ₦ {Number(u.baseRent).toLocaleString()}
                        </td>
                        <td className="px-6 py-4">
                          <StatusBadge status={u.status} />
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
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start mt-6">
            {/* Create Lease form */}
            <section
              className="xl:col-span-4 bg-surface rounded-lg border border-outline-variant p-6"
              aria-labelledby="create-lease-title"
            >
              <h2 id="create-lease-title" className="font-headline-md text-title-lg font-bold text-on-surface border-b border-outline-variant pb-3 mb-5">
                Create Lease
              </h2>
              <form onSubmit={handleCreateLease} noValidate className="flex flex-col gap-4">
                <Field label="Select Tenant" htmlFor="leaseTenant" error={leaseErrors.tenant}>
                  <select id="leaseTenant" className={INPUT_CLS + ' cursor-pointer'}
                    value={leaseTenantId} onChange={(e) => setLeaseTenantId(e.target.value)}
                    required disabled={createLeaseMutation.isPending}>
                    <option value="">— Select Tenant —</option>
                    {tenants.map((t) => (
                      <option key={t.id} value={t.id}>{t.name} ({t.email})</option>
                    ))}
                  </select>
                </Field>

                <Field label="Select Vacant Unit" htmlFor="leaseUnit" error={leaseErrors.unit}>
                  <select id="leaseUnit" className={INPUT_CLS + ' cursor-pointer'}
                    value={leaseUnitId} onChange={(e) => setLeaseUnitId(e.target.value)}
                    required disabled={createLeaseMutation.isPending}>
                    <option value="">— Select Unit —</option>
                    {units
                      .filter((u) => u.status === 'VACANT')
                      .map((u) => (
                        <option key={u.id} value={u.id}>
                          {u.propertyName} — Unit {u.unitNumber} (₦{Number(u.baseRent).toLocaleString()})
                        </option>
                      ))}
                  </select>
                </Field>

                <div className="grid grid-cols-2 gap-4">
                  <Field label="Start Date" htmlFor="startDate" error={leaseErrors.start}>
                    <input id="startDate" type="date" className={INPUT_CLS}
                      value={leaseStartDate} onChange={(e) => setLeaseStartDate(e.target.value)}
                      required disabled={createLeaseMutation.isPending} />
                  </Field>
                  <Field label="End Date" htmlFor="endDate" error={leaseErrors.end}>
                    <input id="endDate" type="date" className={INPUT_CLS}
                      value={leaseEndDate} onChange={(e) => setLeaseEndDate(e.target.value)}
                      required disabled={createLeaseMutation.isPending} />
                  </Field>
                </div>

                <Field label="Grace Period (Days)" htmlFor="gracePeriod">
                  <input id="gracePeriod" type="number" min="0" className={INPUT_CLS}
                    value={leaseGracePeriod} onChange={(e) => setLeaseGracePeriod(e.target.value)}
                    disabled={createLeaseMutation.isPending} />
                </Field>

                <button type="submit" disabled={createLeaseMutation.isPending} className="w-full bg-primary text-on-primary hover:bg-primary/90 px-6 py-2.5 rounded-lg font-label-md text-label-md transition-all active:scale-[0.98] mt-2 flex justify-center">
                  {createLeaseMutation.isPending ? 'Creating Lease…' : 'Create Lease'}
                </button>
              </form>
            </section>

            {/* Leases table */}
            <div className="xl:col-span-8 bg-surface rounded-lg border border-outline-variant overflow-hidden">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-surface-container-low/50">
                    <th className="px-6 py-4 text-on-surface-variant font-label-md text-label-md border-b border-surface-container-high">Tenant</th>
                    <th className="px-6 py-4 text-on-surface-variant font-label-md text-label-md border-b border-surface-container-high">Property / Unit</th>
                    <th className="px-6 py-4 text-on-surface-variant font-label-md text-label-md border-b border-surface-container-high">Term</th>
                    <th className="px-6 py-4 text-on-surface-variant font-label-md text-label-md border-b border-surface-container-high">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface-container-high">
                  {leases.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="px-6 py-10 text-center font-body-md text-on-surface-variant">
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
