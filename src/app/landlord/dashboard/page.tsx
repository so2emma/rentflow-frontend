"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { DashboardShell } from '@/components/layout/DashboardShell';
import {
  BuildingIcon,
  GridIcon,
  DocumentIcon,
} from '@/components/layout/Sidebar';
import { MetricCard } from '@/components/ui/MetricCard';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { Button } from '@/components/ui/Button';
import { getProperties, createProperty, getUnits, createUnit } from '@/lib/api/properties';
import { getTenants } from '@/lib/api/tenants';
import { getLeases, createLease } from '@/lib/api/leases';
import { getUser, clearSession } from '@/lib/auth/session';
import { PropertyResponse, UnitResponse, LeaseResponse, TenantResponse } from '@/types/api';
import type { ApiErrorResponse } from '@/lib/api/client';

type Tab = 'properties' | 'units' | 'leases';

const NAV_ITEMS = [
  { id: 'properties', label: 'Properties', icon: <BuildingIcon /> },
  { id: 'units', label: 'Units', icon: <GridIcon /> },
  { id: 'leases', label: 'Leases', icon: <DocumentIcon /> },
];

/* ── Inline form-input class (kept local, avoids globals.css @apply conflicts) ── */
const INPUT_CLS =
  'w-full min-h-[44px] px-3.5 py-2.5 text-base border border-outline-variant rounded ' +
  'bg-surface-container-lowest text-on-surface outline-none ' +
  'transition-colors duration-[150ms] ' +
  'focus:border-tertiary focus:ring-2 focus:ring-focus-ring focus:ring-offset-2 ' +
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
      <label htmlFor={htmlFor} className="text-sm font-semibold text-on-surface">
        {label}
      </label>
      {children}
      {error && (
        <p role="alert" className="flex items-center gap-1 text-sm text-on-error-container">
          <svg className="w-4 h-4 flex-shrink-0 text-error" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round"
              d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
          </svg>
          {error}
        </p>
      )}
    </div>
  );
}

/* ── Feedback Banner ───────────────────────────────────────────────────────── */
type FeedbackType = 'success' | 'error' | 'info';

const feedbackClasses: Record<FeedbackType, string> = {
  success: 'bg-secondary-container border-secondary/20 text-on-secondary-container',
  error: 'bg-error-container border-error/20 text-on-error-container',
  info: 'bg-primary-fixed border-primary-fixed-dim/20 text-on-primary-fixed',
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
  return (
    <div
      role="alert"
      className={`p-3.5 rounded-md text-sm flex items-start gap-3 border ${feedbackClasses[type]}`}
    >
      <div className="flex-1">{message}</div>
      <button
        onClick={onDismiss}
        aria-label="Dismiss notification"
        className="flex-shrink-0 opacity-60 hover:opacity-100 transition-opacity outline-none
                   focus-visible:ring-2 focus-visible:ring-focus-ring rounded"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════ */
/*  Page component                                                             */
/* ═══════════════════════════════════════════════════════════════════════════ */

export default function LandlordDashboardPage() {
  const router = useRouter();
  const user = getUser();

  const [activeTab, setActiveTab] = useState<Tab>('properties');

  // Data
  const [properties, setProperties] = useState<PropertyResponse[]>([]);
  const [units, setUnits] = useState<UnitResponse[]>([]);
  const [leases, setLeases] = useState<LeaseResponse[]>([]);
  const [tenants, setTenants] = useState<TenantResponse[]>([]);

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
  const [isSubmitting, setIsSubmitting] = useState(false);

  /* ── Data loading ─────────────────────────────────────────────────────── */

  useEffect(() => {
    Promise.all([
      fetchProperties(),
      fetchTenants(),
      fetchUnits(),
      fetchLeases(),
    ]);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function fetchProperties() {
    try {
      const data = await getProperties();
      setProperties(data);
    } catch (e) {
      console.warn('Could not fetch properties:', e);
    }
  }

  async function fetchTenants() {
    try {
      const data = await getTenants();
      setTenants(data);
    } catch (e) {
      console.warn('Could not fetch tenants:', e);
    }
  }

  async function fetchUnits() {
    try {
      const data = await getUnits();
      setUnits(data);
    } catch (e) {
      console.warn('Could not fetch units:', e);
    }
  }

  async function fetchLeases() {
    try {
      const data = await getLeases();
      setLeases(data);
    } catch (e) {
      console.warn('Could not fetch leases:', e);
    }
  }

  /* ── Auth ─────────────────────────────────────────────────────────────── */

  function handleLogout() {
    clearSession();
    router.replace('/login');
  }

  /* ── Feedback helpers ─────────────────────────────────────────────────── */

  function showFeedback(message: React.ReactNode, type: FeedbackType) {
    setFeedback({ message, type });
    // Auto-dismiss after 12 seconds
    setTimeout(() => setFeedback(null), 12000);
  }

  /* ── Add Property ─────────────────────────────────────────────────────── */

  async function handleAddProperty(e: React.FormEvent) {
    e.preventDefault();
    const errs: typeof propErrors = {};
    if (!propName.trim()) errs.name = 'Property name is required.';
    if (!propAddress.trim()) errs.address = 'Address is required.';
    if (!propCode.trim()) errs.code = 'Property code is required.';
    if (Object.keys(errs).length) { setPropErrors(errs); return; }
    setPropErrors({});

    setIsSubmitting(true);
    try {
      const data = await createProperty({ name: propName, address: propAddress, propertyCode: propCode });
      setProperties((prev) => [...prev, data]);
      showFeedback('Property added successfully.', 'success');
      setPropName(''); setPropAddress(''); setPropCode('');
    } catch (error: unknown) {
      const err = error as ApiErrorResponse;
      // Surface field-level errors if backend returns them
      if (err.errors) {
        setPropErrors({
          name: err.errors.name,
          address: err.errors.address,
          code: err.errors.propertyCode,
        });
      }
      showFeedback(err.message || 'Failed to create property. Please try again.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  }

  /* ── Add Unit ─────────────────────────────────────────────────────────── */

  async function handleAddUnit(e: React.FormEvent) {
    e.preventDefault();
    const errs: typeof unitErrors = {};
    if (!unitPropId) errs.property = 'Please select a property.';
    if (!unitNumber.trim()) errs.number = 'Unit number is required.';
    const rent = parseFloat(unitBaseRent);
    if (isNaN(rent) || rent <= 0) errs.rent = 'Enter a valid base rent amount.';
    if (Object.keys(errs).length) { setUnitErrors(errs); return; }
    setUnitErrors({});

    setIsSubmitting(true);
    try {
      const data = await createUnit(unitPropId, { unitNumber, baseRent: rent });
      setUnits((prev) => [...prev, data]);
      showFeedback('Unit added successfully.', 'success');
      setUnitNumber(''); setUnitBaseRent('');
    } catch (error: unknown) {
      const err = error as ApiErrorResponse;
      if (err.errors) {
        setUnitErrors({
          number: err.errors.unitNumber,
          rent: err.errors.baseRent,
        });
      }
      showFeedback(err.message || 'Failed to create unit. Please try again.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  }

  /* ── Create Lease ─────────────────────────────────────────────────────── */

  async function handleCreateLease(e: React.FormEvent) {
    e.preventDefault();
    const errs: typeof leaseErrors = {};
    if (!leaseTenantId) errs.tenant = 'Please select a tenant.';
    if (!leaseUnitId) errs.unit = 'Please select a unit.';
    if (!leaseStartDate) errs.start = 'Start date is required.';
    if (!leaseEndDate) errs.end = 'End date is required.';
    if (Object.keys(errs).length) { setLeaseErrors(errs); return; }
    setLeaseErrors({});

    setIsSubmitting(true);
    const graceDays = parseInt(leaseGracePeriod) || 5;
    try {
      const data = await createLease({
        tenantId: leaseTenantId,
        unitId: leaseUnitId,
        startDate: leaseStartDate,
        endDate: leaseEndDate,
        gracePeriodDays: graceDays,
      });

      setLeases((prev) => [...prev, data]);
      setUnits((prev) =>
        prev.map((u) => (u.id === leaseUnitId ? { ...u, status: 'OCCUPIED' } : u))
      );

      const vactNum = data.nombaVactNumber || '—';
      const vactBank = data.nombaVactBank || '—';
      const vactRef = data.nombaVactRef || '—';

      showFeedback(
        <div className="flex flex-col gap-2">
          <span className="font-semibold">Lease created. Virtual account provisioned.</span>
          <div className="grid grid-cols-3 gap-4 text-xs border-t border-current/20 pt-2 mt-1">
            <div>
              <span className="block opacity-70 uppercase text-[10px] font-bold tracking-wider">Bank</span>
              <span className="font-semibold">{vactBank}</span>
            </div>
            <div>
              <span className="block opacity-70 uppercase text-[10px] font-bold tracking-wider">Account No.</span>
              <span className="font-mono font-bold">{vactNum}</span>
            </div>
            <div>
              <span className="block opacity-70 uppercase text-[10px] font-bold tracking-wider">Ref</span>
              <span className="font-mono">{vactRef}</span>
            </div>
          </div>
        </div>,
        'success'
      );

      setLeaseTenantId(''); setLeaseUnitId(''); setLeaseStartDate('');
      setLeaseEndDate(''); setLeaseGracePeriod('5');
    } catch (error: unknown) {
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
    } finally {
      setIsSubmitting(false);
    }
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
        <div className="flex flex-col gap-1 border-b border-outline-variant pb-4">
          <h1 className="text-2xl md:text-3xl font-semibold text-brand-deep-slate">Landlord Portal</h1>
          <p className="text-sm text-on-surface-variant">
            Define properties, units, and assign tenant leases with automated ledger splitting.
          </p>
        </div>

        {/* Metric cards */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-4" aria-label="Portfolio summary">
          <MetricCard
            label="Properties Portfolio"
            value={properties.length}
            sub="Registered physical properties"
          />
          <MetricCard
            label="Total Rental Units"
            value={units.length}
            sub={
              <span className="flex gap-3">
                <span>Occupied: <strong className="text-secondary">{occupiedUnits}</strong></span>
                <span>Vacant: <strong className="text-error">{vacantUnits}</strong></span>
              </span>
            }
          />
          <MetricCard
            label="Active Contracts"
            value={activeLeases}
            sub="Running active tenant agreements"
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
          <div className="grid grid-cols-1 lg:grid-cols-[360px_1fr] gap-6 items-start">
            {/* Add Property form */}
            <section
              className="bg-surface-container-lowest border border-outline-variant rounded-md p-6 shadow-sm"
              aria-labelledby="add-property-title"
            >
              <h2 id="add-property-title" className="text-lg font-semibold text-brand-deep-slate border-b border-surface-container-low pb-2 mb-5">
                Add Property
              </h2>
              <form onSubmit={handleAddProperty} noValidate className="flex flex-col gap-4">
                <Field label="Property Name" htmlFor="propName" error={propErrors.name}>
                  <input id="propName" type="text" className={INPUT_CLS}
                    placeholder="e.g. Oakwood Apartments" value={propName}
                    onChange={(e) => setPropName(e.target.value)} required disabled={isSubmitting} />
                </Field>
                <Field label="Property Address" htmlFor="propAddress" error={propErrors.address}>
                  <input id="propAddress" type="text" className={INPUT_CLS}
                    placeholder="e.g. 14 Broad Street, Lagos Island" value={propAddress}
                    onChange={(e) => setPropAddress(e.target.value)} required disabled={isSubmitting} />
                </Field>
                <Field label="Property Code (Unique)" htmlFor="propCode" error={propErrors.code}>
                  <input id="propCode" type="text" className={INPUT_CLS}
                    placeholder="e.g. OAK-01" value={propCode}
                    onChange={(e) => setPropCode(e.target.value.toUpperCase())} required disabled={isSubmitting} />
                </Field>
                <Button type="submit" variant="primary" loading={isSubmitting} className="w-full">
                  {isSubmitting ? 'Saving…' : 'Save Property'}
                </Button>
              </form>
            </section>

            {/* Properties table */}
            <div className="bg-surface-container-lowest border border-outline-variant rounded-md overflow-hidden shadow-sm">
              <table className="w-full text-left border-collapse font-sans">
                <thead>
                  <tr className="bg-surface-container-low border-b border-outline-variant">
                    <th className="p-3.5 text-xs font-semibold uppercase tracking-wider text-on-surface-variant">Property Name</th>
                    <th className="p-3.5 text-xs font-semibold uppercase tracking-wider text-on-surface-variant">Code</th>
                    <th className="p-3.5 text-xs font-semibold uppercase tracking-wider text-on-surface-variant">Address</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface-container-low">
                  {properties.length === 0 ? (
                    <tr>
                      <td colSpan={3} className="p-10 text-center text-sm text-on-surface-variant">
                        No properties yet. Add one using the form.
                      </td>
                    </tr>
                  ) : (
                    properties.map((p) => (
                      <tr key={p.id} className="hover:bg-surface-container-low/40 transition-colors duration-[150ms]">
                        <td className="p-3.5 text-sm font-semibold text-on-surface">{p.name}</td>
                        <td className="p-3.5 text-sm font-mono text-on-surface">{p.propertyCode}</td>
                        <td className="p-3.5 text-sm text-on-surface-variant">{p.address}</td>
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
          <div className="grid grid-cols-1 lg:grid-cols-[360px_1fr] gap-6 items-start">
            {/* Add Unit form */}
            <section
              className="bg-surface-container-lowest border border-outline-variant rounded-md p-6 shadow-sm"
              aria-labelledby="add-unit-title"
            >
              <h2 id="add-unit-title" className="text-lg font-semibold text-brand-deep-slate border-b border-surface-container-low pb-2 mb-5">
                Add Unit
              </h2>
              <form onSubmit={handleAddUnit} noValidate className="flex flex-col gap-4">
                <Field label="Select Property" htmlFor="unitProp" error={unitErrors.property}>
                  <select id="unitProp" className={INPUT_CLS + ' cursor-pointer'}
                    value={unitPropId} onChange={(e) => setUnitPropId(e.target.value)}
                    required disabled={isSubmitting}>
                    <option value="">— Select Property —</option>
                    {properties.map((p) => (
                      <option key={p.id} value={p.id}>{p.name} ({p.propertyCode})</option>
                    ))}
                  </select>
                </Field>
                <Field label="Unit Number" htmlFor="unitNumber" error={unitErrors.number}>
                  <input id="unitNumber" type="text" className={INPUT_CLS}
                    placeholder="e.g. Suite 3B" value={unitNumber}
                    onChange={(e) => setUnitNumber(e.target.value)} required disabled={isSubmitting} />
                </Field>
                <Field label="Base Rent (₦ per annum)" htmlFor="unitBaseRent" error={unitErrors.rent}>
                  <input id="unitBaseRent" type="number" min="1" className={INPUT_CLS}
                    placeholder="e.g. 1500000" value={unitBaseRent}
                    onChange={(e) => setUnitBaseRent(e.target.value)} required disabled={isSubmitting} />
                </Field>
                <Button type="submit" variant="primary" loading={isSubmitting} className="w-full">
                  {isSubmitting ? 'Saving…' : 'Save Unit'}
                </Button>
              </form>
            </section>

            {/* Units table */}
            <div className="bg-surface-container-lowest border border-outline-variant rounded-md overflow-hidden shadow-sm">
              <table className="w-full text-left border-collapse font-sans">
                <thead>
                  <tr className="bg-surface-container-low border-b border-outline-variant">
                    <th className="p-3.5 text-xs font-semibold uppercase tracking-wider text-on-surface-variant">Unit</th>
                    <th className="p-3.5 text-xs font-semibold uppercase tracking-wider text-on-surface-variant">Property</th>
                    <th className="p-3.5 text-xs font-semibold uppercase tracking-wider text-on-surface-variant">Base Rent</th>
                    <th className="p-3.5 text-xs font-semibold uppercase tracking-wider text-on-surface-variant">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface-container-low">
                  {units.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="p-10 text-center text-sm text-on-surface-variant">
                        No units yet. Add one using the form.
                      </td>
                    </tr>
                  ) : (
                    units.map((u) => (
                      <tr key={u.id} className="hover:bg-surface-container-low/40 transition-colors duration-[150ms]">
                        <td className="p-3.5 text-sm font-semibold text-on-surface">{u.unitNumber}</td>
                        <td className="p-3.5 text-sm text-on-surface">{u.propertyName}</td>
                        <td className="p-3.5 text-sm font-mono tabular-nums text-on-surface">
                          ₦ {Number(u.baseRent).toLocaleString()}
                        </td>
                        <td className="p-3.5">
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
          <div className="grid grid-cols-1 lg:grid-cols-[360px_1fr] gap-6 items-start">
            {/* Create Lease form */}
            <section
              className="bg-surface-container-lowest border border-outline-variant rounded-md p-6 shadow-sm"
              aria-labelledby="create-lease-title"
            >
              <h2 id="create-lease-title" className="text-lg font-semibold text-brand-deep-slate border-b border-surface-container-low pb-2 mb-5">
                Create Lease
              </h2>
              <form onSubmit={handleCreateLease} noValidate className="flex flex-col gap-4">
                <Field label="Select Tenant" htmlFor="leaseTenant" error={leaseErrors.tenant}>
                  <select id="leaseTenant" className={INPUT_CLS + ' cursor-pointer'}
                    value={leaseTenantId} onChange={(e) => setLeaseTenantId(e.target.value)}
                    required disabled={isSubmitting}>
                    <option value="">— Select Tenant —</option>
                    {tenants.map((t) => (
                      <option key={t.id} value={t.id}>{t.name} ({t.email})</option>
                    ))}
                  </select>
                </Field>

                <Field label="Select Vacant Unit" htmlFor="leaseUnit" error={leaseErrors.unit}>
                  <select id="leaseUnit" className={INPUT_CLS + ' cursor-pointer'}
                    value={leaseUnitId} onChange={(e) => setLeaseUnitId(e.target.value)}
                    required disabled={isSubmitting}>
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
                      required disabled={isSubmitting} />
                  </Field>
                  <Field label="End Date" htmlFor="endDate" error={leaseErrors.end}>
                    <input id="endDate" type="date" className={INPUT_CLS}
                      value={leaseEndDate} onChange={(e) => setLeaseEndDate(e.target.value)}
                      required disabled={isSubmitting} />
                  </Field>
                </div>

                <Field label="Grace Period (Days)" htmlFor="gracePeriod">
                  <input id="gracePeriod" type="number" min="0" className={INPUT_CLS}
                    value={leaseGracePeriod} onChange={(e) => setLeaseGracePeriod(e.target.value)}
                    disabled={isSubmitting} />
                </Field>

                <Button type="submit" variant="primary" loading={isSubmitting} className="w-full">
                  {isSubmitting ? 'Creating Lease…' : 'Create Lease'}
                </Button>
              </form>
            </section>

            {/* Leases table */}
            <div className="bg-surface-container-lowest border border-outline-variant rounded-md overflow-hidden shadow-sm">
              <table className="w-full text-left border-collapse font-sans">
                <thead>
                  <tr className="bg-surface-container-low border-b border-outline-variant">
                    <th className="p-3.5 text-xs font-semibold uppercase tracking-wider text-on-surface-variant">Tenant</th>
                    <th className="p-3.5 text-xs font-semibold uppercase tracking-wider text-on-surface-variant">Property / Unit</th>
                    <th className="p-3.5 text-xs font-semibold uppercase tracking-wider text-on-surface-variant">Term</th>
                    <th className="p-3.5 text-xs font-semibold uppercase tracking-wider text-on-surface-variant">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface-container-low">
                  {leases.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="p-10 text-center text-sm text-on-surface-variant">
                        No lease agreements yet.
                      </td>
                    </tr>
                  ) : (
                    leases.map((l) => (
                      <tr key={l.id} className="hover:bg-surface-container-low/40 transition-colors duration-[150ms]">
                        <td className="p-3.5 text-sm font-semibold text-on-surface">{l.tenantName}</td>
                        <td className="p-3.5 text-sm text-on-surface">
                          {l.propertyName} — Unit {l.unitNumber}
                        </td>
                        <td className="p-3.5 text-sm text-on-surface-variant tabular-nums">
                          <span>{l.startDate}</span>
                          <span className="mx-1 text-outline">→</span>
                          <span>{l.endDate}</span>
                          {l.gracePeriodDays != null && (
                            <span className="block text-xs mt-0.5">Grace: {l.gracePeriodDays}d</span>
                          )}
                        </td>
                        <td className="p-3.5">
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
