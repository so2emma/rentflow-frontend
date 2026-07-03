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
import { UnitResponse, TenantResponse } from '@/types/api';

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
    tenantId: '',
    unitId: '',
    startDate: '',
    endDate: '',
    gracePeriodDays: '5'
  });

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
          tenantId: err.errors.tenantId,
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

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrors({});
    setGlobalError(null);
    
    // Basic validation
    const newErrors: Partial<typeof errors> = {};
    if (!formData.tenantId) newErrors.tenantId = 'Please select a tenant.';
    if (!formData.unitId) newErrors.unitId = 'Please select a unit.';
    if (!formData.startDate) newErrors.startDate = 'Start date is required.';
    if (!formData.endDate) newErrors.endDate = 'End date is required.';
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const graceDays = parseInt(formData.gracePeriodDays) || 5;
    mutation.mutate({
      tenantId: formData.tenantId,
      unitId: formData.unitId,
      startDate: formData.startDate,
      endDate: formData.endDate,
      gracePeriodDays: graceDays,
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
              <Field label="Select Tenant *" htmlFor="tenantId" error={errors.tenantId}>
                <select id="tenantId" name="tenantId" className={INPUT_CLS + ' cursor-pointer'}
                  value={formData.tenantId} onChange={handleChange} required disabled={mutation.isPending}>
                  <option value="">— Select Tenant —</option>
                  {tenants.map((t) => (
                    <option key={t.id} value={t.id}>{t.name} ({t.email})</option>
                  ))}
                </select>
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
