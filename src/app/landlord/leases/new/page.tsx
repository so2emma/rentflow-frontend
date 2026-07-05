"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { DashboardShell } from '@/components/layout/DashboardShell';
import { Button } from '@/components/ui/Button';
import { getUnits } from '@/lib/api/properties';
import { getTenants } from '@/lib/api/tenants';
import { createLease } from '@/lib/api/leases';
import { useAuthStore } from '@/store/authStore';
import { clearSession } from '@/lib/auth/session';
import type { ApiErrorResponse } from '@/lib/api/client';
import { UnitResponse, TenantResponse, LedgerEntryRequest } from '@/types/api';

const INPUT_CLS =
  'w-full min-h-[44px] px-4 py-2.5 font-body-md border border-outline-variant rounded-lg ' +
  'bg-surface-container-lowest text-on-surface outline-none ' +
  'transition-colors duration-[150ms] ' +
  'focus:border-primary-fixed-dim focus:ring-1 focus:ring-primary-fixed-dim ' +
  'disabled:opacity-50 disabled:cursor-not-allowed';

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

export default function NewLeasePage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const user = useAuthStore(s => s.user);

  const { data: unitsData } = useQuery({ queryKey: ['units'], queryFn: getUnits });
  const { data: tenantsData } = useQuery({ queryKey: ['tenants'], queryFn: getTenants });

  const units: UnitResponse[] = unitsData || [];
  const tenants: TenantResponse[] = tenantsData || [];

  const [formData, setFormData] = useState({
    tenantEmail: '',
    unitId: '',
    startDate: '',
    endDate: '',
    gracePeriodDays: '5'
  });

  const [ledgerEntries, setLedgerEntries] = useState<LedgerEntryRequest[]>([]);

  const [errors, setErrors] = useState<Partial<Record<keyof typeof formData, string>>>({});
  const [globalError, setGlobalError] = useState<string | null>(null);

  const mutation = useMutation({
    mutationFn: (data: Parameters<typeof createLease>[0]) => createLease(data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['leases'] });
      queryClient.invalidateQueries({ queryKey: ['units'] });
      router.push('/landlord/dashboard');
    },
    onError: (error: unknown) => {
      const err = error as ApiErrorResponse;
      if (err.errors) {
        setErrors({
          tenantEmail: err.errors.tenantEmail,
          unitId: err.errors.unitId,
          startDate: err.errors.startDate,
          endDate: err.errors.endDate,
        });
      }
      setGlobalError(err.message || 'Failed to create lease. Please try again.');
    }
  });

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  }

  function addLedgerEntry() {
    setLedgerEntries(prev => [
      ...prev,
      { entryType: 'SECURITY_DEPOSIT', amountDue: 0, dueDate: formData.startDate || '', periodStartDate: '', periodEndDate: '', description: '' }
    ]);
  }

  function removeLedgerEntry(index: number) {
    setLedgerEntries(prev => prev.filter((_, i) => i !== index));
  }

  function updateLedgerEntry(index: number, field: keyof LedgerEntryRequest, value: string | number) {
    const updated = [...ledgerEntries];
    updated[index] = { ...updated[index], [field]: value };
    setLedgerEntries(updated);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrors({});
    setGlobalError(null);
    
    // Basic validation
    const newErrors: Partial<typeof errors> = {};
    if (!formData.tenantEmail) newErrors.tenantEmail = 'Please provide a tenant email.';
    if (!formData.unitId) newErrors.unitId = 'Please select a unit.';
    if (!formData.startDate) newErrors.startDate = 'Start date is required.';
    if (!formData.endDate) newErrors.endDate = 'End date is required.';
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const graceDays = parseInt(formData.gracePeriodDays) || 5;
    mutation.mutate({
      tenantEmail: formData.tenantEmail,
      unitId: formData.unitId,
      startDate: formData.startDate,
      endDate: formData.endDate,
      gracePeriodDays: graceDays,
      initialLedgerEntries: ledgerEntries.map(le => ({
        ...le,
        amountDue: Number(le.amountDue)
      })).filter(le => le.amountDue > 0 && le.dueDate),
    });
  }

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
        activeItem="leases"
        onNavChange={(id) => {
          if (id === 'dashboard') router.push('/landlord/dashboard');
        }}
        onSignOut={() => {
          clearSession();
          router.replace('/login');
        }}
      >
        <div className="flex flex-col gap-6 max-w-4xl mx-auto mt-6">
          <div className="flex items-center gap-4 border-b border-outline-variant pb-6">
            <button onClick={() => router.back()} className="text-on-surface-variant hover:text-on-surface transition-colors">
              <span className="material-symbols-outlined text-2xl">arrow_back</span>
            </button>
            <div>
              <h1 className="font-display-md text-headline-md font-bold text-on-surface tracking-tight">Create Lease Agreement</h1>
              <p className="text-on-surface-variant font-body-md mt-1">Assign a tenant to a unit and provision virtual accounts.</p>
            </div>
          </div>

          {globalError && (
            <div className="bg-error-container/50 border border-error/20 text-on-error-container p-4 rounded-lg flex items-start gap-3">
              <span className="material-symbols-outlined text-error">error</span>
              <div className="flex-1 font-body-md">{globalError}</div>
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate className="bg-surface rounded-lg border border-outline-variant p-6 flex flex-col gap-6">
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Field label="Tenant Email *" htmlFor="tenantEmail" error={errors.tenantEmail}>
                <input type="email" id="tenantEmail" name="tenantEmail" className={INPUT_CLS}
                  placeholder="tenant@example.com"
                  value={formData.tenantEmail} onChange={handleChange} required disabled={mutation.isPending} />
              </Field>

              <Field label="Select Vacant Unit *" htmlFor="unitId" error={errors.unitId}>
                <select id="unitId" name="unitId" className={INPUT_CLS + ' cursor-pointer'}
                  value={formData.unitId} onChange={handleChange} required disabled={mutation.isPending}>
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
            </div>

            <div className="border-t border-outline-variant pt-6">
              <h3 className="font-label-lg text-title-md font-semibold text-on-surface mb-4">Lease Term</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Field label="Start Date *" htmlFor="startDate" error={errors.startDate}>
                  <input id="startDate" name="startDate" type="date" className={INPUT_CLS}
                    value={formData.startDate} onChange={handleChange} required disabled={mutation.isPending} />
                </Field>
                <Field label="End Date *" htmlFor="endDate" error={errors.endDate}>
                  <input id="endDate" name="endDate" type="date" className={INPUT_CLS}
                    value={formData.endDate} onChange={handleChange} required disabled={mutation.isPending} />
                </Field>
                <Field label="Grace Period (Days)" htmlFor="gracePeriodDays" error={errors.gracePeriodDays}>
                  <input id="gracePeriodDays" name="gracePeriodDays" type="number" min="0" className={INPUT_CLS}
                    value={formData.gracePeriodDays} onChange={handleChange} disabled={mutation.isPending} />
                </Field>
              </div>
            </div>

            <div className="border-t border-outline-variant pt-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-label-lg text-title-md font-semibold text-on-surface">Initial Ledger Entries</h3>
                <Button type="button" variant="ghost" size="sm" onClick={addLedgerEntry} leadingIcon={<span className="material-symbols-outlined text-[18px]">add</span>}>
                  Add Entry
                </Button>
              </div>

              <div className="bg-primary-container/20 border border-primary/20 text-on-surface p-4 rounded-lg flex items-start gap-3 mb-6">
                <span className="material-symbols-outlined text-primary">info</span>
                <div className="flex-1 font-body-md">
                  <strong>Note:</strong> The base rent for the selected unit will be automatically added to the ledger on the lease start date. You can add additional charges (e.g. Security Deposit, Utilities) below.
                </div>
              </div>
              
              {ledgerEntries.length === 0 ? (
                <p className="text-body-sm text-on-surface-variant italic mb-6">No additional initial ledger entries added.</p>
              ) : (
                <div className="flex flex-col gap-4 mb-6">
                  {ledgerEntries.map((entry, index) => (
                    <div key={index} className="flex flex-col gap-4 p-4 border border-outline-variant rounded-lg bg-surface-container-lowest">
                      <div className="flex justify-between items-center">
                        <span className="font-label-md font-semibold">Entry #{index + 1}</span>
                        <button type="button" onClick={() => removeLedgerEntry(index)} className="text-error hover:bg-error-container/50 p-1 rounded-full transition-colors">
                          <span className="material-symbols-outlined text-[20px]">delete</span>
                        </button>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <Field label="Type *" htmlFor={`entryType-${index}`}>
                          <select id={`entryType-${index}`} className={INPUT_CLS} value={entry.entryType} onChange={e => updateLedgerEntry(index, 'entryType', e.target.value)}>
                            <option value="RENT">Rent</option>
                            <option value="UTILITY_WATER">Water Utility</option>
                            <option value="UTILITY_POWER">Power Utility</option>
                            <option value="SERVICE_CHARGE">Service Charge</option>
                            <option value="SECURITY_DEPOSIT">Security Deposit</option>
                            <option value="LATE_FEE">Late Fee</option>
                          </select>
                        </Field>
                        <Field label="Amount Due (₦) *" htmlFor={`amountDue-${index}`}>
                          <input type="number" id={`amountDue-${index}`} className={INPUT_CLS} value={entry.amountDue || ''} onChange={e => updateLedgerEntry(index, 'amountDue', parseFloat(e.target.value) || 0)} />
                        </Field>
                        <Field label="Due Date *" htmlFor={`dueDate-${index}`}>
                          <input type="date" id={`dueDate-${index}`} className={INPUT_CLS} value={entry.dueDate} onChange={e => updateLedgerEntry(index, 'dueDate', e.target.value)} />
                        </Field>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <Field label="Period Start (Optional)" htmlFor={`periodStart-${index}`}>
                          <input type="date" id={`periodStart-${index}`} className={INPUT_CLS} value={entry.periodStartDate || ''} onChange={e => updateLedgerEntry(index, 'periodStartDate', e.target.value)} />
                        </Field>
                        <Field label="Period End (Optional)" htmlFor={`periodEnd-${index}`}>
                          <input type="date" id={`periodEnd-${index}`} className={INPUT_CLS} value={entry.periodEndDate || ''} onChange={e => updateLedgerEntry(index, 'periodEndDate', e.target.value)} />
                        </Field>
                        <Field label="Description (Optional)" htmlFor={`desc-${index}`}>
                          <input type="text" id={`desc-${index}`} className={INPUT_CLS} placeholder="e.g. August Water Bill" value={entry.description || ''} onChange={e => updateLedgerEntry(index, 'description', e.target.value)} />
                        </Field>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex justify-end gap-4 mt-4">
              <Button type="button" variant="ghost" onClick={() => router.back()} disabled={mutation.isPending}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" disabled={mutation.isPending}>
                {mutation.isPending ? 'Creating Lease...' : 'Create Lease'}
              </Button>
            </div>
          </form>
        </div>
      </DashboardShell>
    </ProtectedRoute>
  );
}
