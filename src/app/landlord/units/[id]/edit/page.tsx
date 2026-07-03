"use client";

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { DashboardShell } from '@/components/layout/DashboardShell';
import { Button } from '@/components/ui/Button';
import { getUnit, updateUnit } from '@/lib/api/properties';
import { useAuthStore } from '@/store/authStore';
import { clearSession } from '@/lib/auth/session';
import type { ApiErrorResponse } from '@/lib/api/client';
import { UnitResponse } from '@/types/api';

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

export default function EditUnitPage() {
  const router = useRouter();
  const params = useParams();
  const unitId = params.id as string;
  
  const queryClient = useQueryClient();
  const user = useAuthStore(s => s.user);

  const { data: unit, isLoading, error: fetchError } = useQuery({
    queryKey: ['units', unitId],
    queryFn: () => getUnit(unitId),
    enabled: !!unitId,
  });

  const [formData, setFormData] = useState({
    unitNumber: '',
    baseRent: '',
    bedrooms: '',
    bathrooms: '',
    squareFootage: '',
    floorNumber: '',
    isFurnished: false,
    amenities: ''
  });

  const [errors, setErrors] = useState<Partial<Record<keyof typeof formData, string>>>({});
  const [globalError, setGlobalError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    if (unit) {
      setFormData({
        unitNumber: unit.unitNumber || '',
        baseRent: unit.baseRent?.toString() || '',
        bedrooms: unit.bedrooms?.toString() || '',
        bathrooms: unit.bathrooms?.toString() || '',
        squareFootage: unit.squareFootage?.toString() || '',
        floorNumber: unit.floorNumber?.toString() || '',
        isFurnished: unit.isFurnished || false,
        amenities: unit.amenities || ''
      });
    }
  }, [unit]);

  const mutation = useMutation({
    mutationFn: (data: any) => updateUnit(unitId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['units'] });
      setSuccessMessage('Unit updated successfully. Redirecting to dashboard...');
      setTimeout(() => {
        router.push('/landlord/dashboard');
      }, 1500);
    },
    onError: (error: unknown) => {
      const err = error as ApiErrorResponse;
      if (err.errors) {
        setErrors(err.errors as any);
      }
      setGlobalError(err.message || 'Failed to update unit. Please try again.');
    }
  });

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    const { name, value, type } = e.target as HTMLInputElement;
    const checked = (e.target as HTMLInputElement).checked;
    setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrors({});
    setGlobalError(null);
    
    // Basic validation
    const newErrors: Partial<typeof errors> = {};
    if (!formData.unitNumber.trim()) newErrors.unitNumber = 'Unit number is required';
    
    const rent = parseFloat(formData.baseRent);
    if (isNaN(rent) || rent <= 0) newErrors.baseRent = 'Enter a valid base rent';
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    mutation.mutate({
      ...formData,
      status: unit?.status, // preserve status
      baseRent: rent,
      bedrooms: formData.bedrooms ? parseInt(formData.bedrooms) : undefined,
      bathrooms: formData.bathrooms ? parseInt(formData.bathrooms) : undefined,
      squareFootage: formData.squareFootage ? parseFloat(formData.squareFootage) : undefined,
      floorNumber: formData.floorNumber ? parseInt(formData.floorNumber) : undefined,
    });
  }

  const isEditable = unit?.status === 'VACANT';

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
        activeItem="units"
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
              <h1 className="font-display-md text-headline-md font-bold text-on-surface tracking-tight">Edit Unit</h1>
              <p className="text-on-surface-variant font-body-md mt-1">
                {unit ? `Update details for ${unit.propertyName} — ${unit.unitNumber}` : 'Loading...'}
              </p>
            </div>
          </div>

          {isLoading ? (
            <div className="p-10 text-center font-body-lg text-on-surface-variant">Loading unit details...</div>
          ) : fetchError ? (
            <div className="bg-error-container/50 border border-error/20 text-on-error-container p-4 rounded-lg flex items-start gap-3">
              <span className="material-symbols-outlined text-error">error</span>
              <div className="flex-1 font-body-md">Failed to load unit.</div>
            </div>
          ) : (
            <>
              {!isEditable && (
                <div className="bg-error-container/50 border border-error/20 text-on-error-container p-4 rounded-lg flex items-start gap-3">
                  <span className="material-symbols-outlined text-error">lock</span>
                  <div className="flex-1 font-body-md">
                    <strong>Editing Disabled.</strong> This unit is currently {unit?.status}. Only vacant units can be edited.
                  </div>
                </div>
              )}

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
                  <Field label="Unit Number / Identifier *" htmlFor="unitNumber" error={errors.unitNumber}>
                    <input id="unitNumber" name="unitNumber" type="text" className={INPUT_CLS}
                      placeholder="e.g. Suite 3B" value={formData.unitNumber} onChange={handleChange} required disabled={!isEditable || mutation.isPending} />
                  </Field>
                  <Field label="Base Rent (₦ per annum) *" htmlFor="baseRent" error={errors.baseRent}>
                    <input id="baseRent" name="baseRent" type="number" min="1" className={INPUT_CLS}
                      placeholder="e.g. 1500000" value={formData.baseRent} onChange={handleChange} required disabled={!isEditable || mutation.isPending} />
                  </Field>
                </div>

                <div className="border-t border-outline-variant pt-6">
                  <h3 className="font-label-lg text-title-md font-semibold text-on-surface mb-4">Layout & Size</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <Field label="Bedrooms" htmlFor="bedrooms" error={errors.bedrooms}>
                      <input id="bedrooms" name="bedrooms" type="number" min="0" className={INPUT_CLS}
                        placeholder="e.g. 2" value={formData.bedrooms} onChange={handleChange} disabled={!isEditable || mutation.isPending} />
                    </Field>
                    <Field label="Bathrooms" htmlFor="bathrooms" error={errors.bathrooms}>
                      <input id="bathrooms" name="bathrooms" type="number" min="0" className={INPUT_CLS}
                        placeholder="e.g. 1" value={formData.bathrooms} onChange={handleChange} disabled={!isEditable || mutation.isPending} />
                    </Field>
                    <Field label="Square Footage" htmlFor="squareFootage" error={errors.squareFootage}>
                      <input id="squareFootage" name="squareFootage" type="number" min="0" className={INPUT_CLS}
                        placeholder="e.g. 1200" value={formData.squareFootage} onChange={handleChange} disabled={!isEditable || mutation.isPending} />
                    </Field>
                  </div>
                </div>

                <div className="border-t border-outline-variant pt-6">
                  <h3 className="font-label-lg text-title-md font-semibold text-on-surface mb-4">Features</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Field label="Floor Number" htmlFor="floorNumber" error={errors.floorNumber}>
                      <input id="floorNumber" name="floorNumber" type="number" className={INPUT_CLS}
                        placeholder="e.g. 3" value={formData.floorNumber} onChange={handleChange} disabled={!isEditable || mutation.isPending} />
                    </Field>
                    <Field label="Amenities" htmlFor="amenities" error={errors.amenities}>
                      <input id="amenities" name="amenities" type="text" className={INPUT_CLS}
                        placeholder="e.g. Balcony, AC, Pool access" value={formData.amenities} onChange={handleChange} disabled={!isEditable || mutation.isPending} />
                    </Field>
                    <div className="flex items-center gap-3 mt-2">
                      <input id="isFurnished" name="isFurnished" type="checkbox" className="w-5 h-5 rounded border-outline-variant text-primary focus:ring-primary"
                        checked={formData.isFurnished} onChange={handleChange} disabled={!isEditable || mutation.isPending} />
                      <label htmlFor="isFurnished" className="font-body-md text-on-surface cursor-pointer">
                        This unit is furnished
                      </label>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end gap-4 mt-4">
                  <Button type="button" variant="ghost" onClick={() => router.back()}>
                    Cancel
                  </Button>
                  <Button type="submit" variant="primary" disabled={!isEditable || mutation.isPending}>
                    {mutation.isPending ? 'Saving...' : 'Save Changes'}
                  </Button>
                </div>
              </form>
            </>
          )}
        </div>
      </DashboardShell>
    </ProtectedRoute>
  );
}
