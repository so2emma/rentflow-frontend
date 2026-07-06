"use client";

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { DashboardShell } from '@/components/layout/DashboardShell';
import { Button } from '@/components/ui/Button';
import { getProperty, updateProperty, getUnits } from '@/lib/api/properties';
import { useAuthStore } from '@/store/authStore';
import { clearSession } from '@/lib/auth/session';
import type { ApiErrorResponse } from '@/lib/api/client';

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

export default function EditPropertyPage() {
  const router = useRouter();
  const params = useParams();
  const propertyId = params.id as string;
  
  const queryClient = useQueryClient();
  const user = useAuthStore(s => s.user);

  const [formData, setFormData] = useState({
    name: '',
    streetAddress: '',
    city: '',
    state: '',
    zipCode: '',
    propertyType: 'RESIDENTIAL',
    totalUnits: '',
    propertyManagerName: '',
    emergencyContactNumber: '',
    propertyCode: ''
  });

  const [errors, setErrors] = useState<Partial<Record<keyof typeof formData, string>>>({});
  const [globalError, setGlobalError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const { data: property, isLoading: isPropertyLoading } = useQuery({
    queryKey: ['property', propertyId],
    queryFn: () => getProperty(propertyId)
  });

  const { data: unitsData } = useQuery({
    queryKey: ['units'],
    queryFn: () => getUnits()
  });

  const existingUnitsCount = unitsData?.filter((u: any) => u.propertyId === propertyId)?.length || 0;

  useEffect(() => {
    if (property) {
      setFormData({
        name: property.name || '',
        streetAddress: property.streetAddress || '',
        city: property.city || '',
        state: property.state || '',
        zipCode: property.zipCode || '',
        propertyType: property.propertyType || 'RESIDENTIAL',
        totalUnits: property.totalUnits?.toString() || '',
        propertyManagerName: property.propertyManagerName || '',
        emergencyContactNumber: property.emergencyContactNumber || '',
        propertyCode: property.propertyCode || ''
      });
    }
  }, [property]);

  const mutation = useMutation({
    mutationFn: (data: Parameters<typeof updateProperty>[1]) => updateProperty(propertyId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['properties'] });
      queryClient.invalidateQueries({ queryKey: ['property', propertyId] });
      setSuccessMessage('Property updated successfully. Redirecting to dashboard...');
      setTimeout(() => {
        router.push('/landlord/dashboard');
      }, 1500);
    },
    onError: (error: unknown) => {
      const err = error as ApiErrorResponse;
      if (err.errors) {
        setErrors(err.errors as any);
      }
      setGlobalError(err.message || 'Failed to update property. Please try again.');
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
    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.streetAddress.trim()) newErrors.streetAddress = 'Street address is required';
    if (!formData.city.trim()) newErrors.city = 'City is required';
    if (!formData.state.trim()) newErrors.state = 'State is required';
    if (!formData.propertyCode.trim()) newErrors.propertyCode = 'Property code is required';
    
    // Frontend capacity check
    const requestedTotalUnits = formData.totalUnits ? parseInt(formData.totalUnits) : null;
    if (requestedTotalUnits !== null && requestedTotalUnits < existingUnitsCount) {
      newErrors.totalUnits = `Cannot downsize below ${existingUnitsCount} existing units.`;
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    mutation.mutate({
      ...formData,
      totalUnits: requestedTotalUnits || undefined
    } as any);
  }

  if (isPropertyLoading) {
    return (
      <ProtectedRoute allowedRole="ROLE_LANDLORD">
        <DashboardShell
          sidebarTitle="RentFlow"
          userLabel="Connected Landlord"
          userEmail={user?.email}
          navItems={[{ id: 'dashboard', label: 'Dashboard', icon: 'dashboard' }, { id: 'properties', label: 'Properties', icon: 'domain' }, { id: 'units', label: 'Units', icon: 'grid_view' }, { id: 'leases', label: 'Leases', icon: 'description' }]}
          activeItem="properties"
          onNavChange={(id) => { if (id === 'dashboard') router.push('/landlord/dashboard'); }}
          onSignOut={() => { clearSession(); router.replace('/login'); }}
        >
          <div className="flex items-center justify-center h-64">
            <p className="text-on-surface-variant font-body-md">Loading property data...</p>
          </div>
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
        navItems={[
          { id: 'dashboard', label: 'Dashboard', icon: 'dashboard' },
          { id: 'properties', label: 'Properties', icon: 'domain' },
          { id: 'units', label: 'Units', icon: 'grid_view' },
          { id: 'leases', label: 'Leases', icon: 'description' },
        ]}
        activeItem="properties"
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
              <h1 className="font-display-md text-headline-md font-bold text-on-surface tracking-tight">Edit Property</h1>
              <p className="text-on-surface-variant font-body-md mt-1">Update your property portfolio details.</p>
            </div>
          </div>

          {globalError && (
            <div className="bg-error-container/50 border border-error/20 text-on-error-container p-4 rounded-lg flex items-start gap-3">
              <span className="material-symbols-outlined text-error">error</span>
              <div className="flex-1 font-body-md">{globalError}</div>
            </div>
          )}

          {successMessage && (
            <div className="bg-secondary-fixed/20 border border-secondary-fixed-dim/20 text-on-secondary-fixed-variant p-4 rounded-lg flex items-start gap-3">
              <span className="material-symbols-outlined text-on-secondary-fixed-variant">check_circle</span>
              <div className="flex-1 font-body-md text-on-secondary-fixed-variant">{successMessage}</div>
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate className="bg-surface rounded-lg border border-outline-variant p-6 flex flex-col gap-6">
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Field label="Property Name *" htmlFor="name" error={errors.name}>
                <input id="name" name="name" type="text" className={INPUT_CLS}
                  placeholder="e.g. Oakwood Apartments" value={formData.name} onChange={handleChange} required disabled={mutation.isPending} />
              </Field>
              <Field label="Property Code (Unique) *" htmlFor="propertyCode" error={errors.propertyCode}>
                <input id="propertyCode" name="propertyCode" type="text" className={INPUT_CLS}
                  placeholder="e.g. OAK-01" value={formData.propertyCode} onChange={(e) => setFormData(p => ({...p, propertyCode: e.target.value.toUpperCase()}))} required disabled={mutation.isPending} />
              </Field>
            </div>

            <div className="border-t border-outline-variant pt-6">
              <h3 className="font-label-lg text-title-md font-semibold text-on-surface mb-4">Location</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <Field label="Street Address *" htmlFor="streetAddress" error={errors.streetAddress}>
                    <input id="streetAddress" name="streetAddress" type="text" className={INPUT_CLS}
                      placeholder="e.g. 14 Broad Street" value={formData.streetAddress} onChange={handleChange} required disabled={mutation.isPending} />
                  </Field>
                </div>
                <Field label="City *" htmlFor="city" error={errors.city}>
                  <input id="city" name="city" type="text" className={INPUT_CLS}
                    placeholder="e.g. Lagos Island" value={formData.city} onChange={handleChange} required disabled={mutation.isPending} />
                </Field>
                <div className="grid grid-cols-2 gap-4">
                  <Field label="State *" htmlFor="state" error={errors.state}>
                    <input id="state" name="state" type="text" className={INPUT_CLS}
                      placeholder="e.g. Lagos" value={formData.state} onChange={handleChange} required disabled={mutation.isPending} />
                  </Field>
                  <Field label="Zip Code" htmlFor="zipCode" error={errors.zipCode}>
                    <input id="zipCode" name="zipCode" type="text" className={INPUT_CLS}
                      placeholder="e.g. 100241" value={formData.zipCode} onChange={handleChange} disabled={mutation.isPending} />
                  </Field>
                </div>
              </div>
            </div>

            <div className="border-t border-outline-variant pt-6">
              <h3 className="font-label-lg text-title-md font-semibold text-on-surface mb-4">Characteristics</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Field label="Property Type" htmlFor="propertyType" error={errors.propertyType}>
                  <select id="propertyType" name="propertyType" className={INPUT_CLS} value={formData.propertyType} onChange={handleChange} disabled={mutation.isPending}>
                    <option value="RESIDENTIAL">Residential</option>
                    <option value="COMMERCIAL">Commercial</option>
                    <option value="MULTI_FAMILY">Multi-Family</option>
                  </select>
                </Field>
                <Field label="Total Units" htmlFor="totalUnits" error={errors.totalUnits}>
                  <input id="totalUnits" name="totalUnits" type="number" min={existingUnitsCount || 1} className={INPUT_CLS}
                    placeholder="e.g. 10" value={formData.totalUnits} onChange={handleChange} disabled={mutation.isPending} />
                  {existingUnitsCount > 0 && (
                    <p className="text-[12px] text-on-surface-variant mt-1">This property currently has {existingUnitsCount} unit(s). You cannot set total units below this number.</p>
                  )}
                </Field>
              </div>
            </div>

            <div className="border-t border-outline-variant pt-6">
              <h3 className="font-label-lg text-title-md font-semibold text-on-surface mb-4">Operations</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Field label="Property Manager Name" htmlFor="propertyManagerName" error={errors.propertyManagerName}>
                  <input id="propertyManagerName" name="propertyManagerName" type="text" className={INPUT_CLS}
                    placeholder="e.g. John Doe" value={formData.propertyManagerName} onChange={handleChange} disabled={mutation.isPending} />
                </Field>
                <Field label="Emergency Contact Number" htmlFor="emergencyContactNumber" error={errors.emergencyContactNumber}>
                  <input id="emergencyContactNumber" name="emergencyContactNumber" type="text" className={INPUT_CLS}
                    placeholder="e.g. +2348000000000" value={formData.emergencyContactNumber} onChange={handleChange} disabled={mutation.isPending} />
                </Field>
              </div>
            </div>

            <div className="flex justify-end gap-4 mt-4">
              <Button type="button" variant="ghost" onClick={() => router.back()} disabled={mutation.isPending}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" disabled={mutation.isPending}>
                {mutation.isPending ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </form>
        </div>
      </DashboardShell>
    </ProtectedRoute>
  );
}
