"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { DashboardShell } from '@/components/layout/DashboardShell';
import { Button } from '@/components/ui/Button';
import { getTenantProfile, updateTenantProfile } from '@/lib/api/tenants';
import { useAuthStore } from '@/store/authStore';
import {logoutUser} from '@/lib/auth/session';
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

const NAV_ITEMS = [
  { id: 'dashboard', label: 'My Dashboard', icon: 'dashboard' },
  { id: 'lease', label: 'Lease Details', icon: 'description' },
  { id: 'history', label: 'Payment History', icon: 'receipt_long' },
];

export default function TenantProfilePage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const user = useAuthStore(s => s.user);

  const { data: profile, isLoading } = useQuery({
    queryKey: ['tenantProfile'],
    queryFn: getTenantProfile,
  });

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phoneNumber: '',
    bvn: '',
    employerName: '',
    jobTitle: '',
    monthlyIncome: '',
    emergencyContactName: '',
    emergencyContactPhone: '',
    emergencyContactRelation: '',
    dateOfBirth: ''
  });

  useEffect(() => {
    if (profile) {
      setFormData({
        firstName: profile.firstName || '',
        lastName: profile.lastName || '',
        phoneNumber: profile.phoneNumber || '',
        bvn: profile.bvn || '',
        employerName: profile.employerName || '',
        jobTitle: profile.jobTitle || '',
        monthlyIncome: profile.monthlyIncome ? String(profile.monthlyIncome) : '',
        emergencyContactName: profile.emergencyContactName || '',
        emergencyContactPhone: profile.emergencyContactPhone || '',
        emergencyContactRelation: profile.emergencyContactRelation || '',
        dateOfBirth: profile.dateOfBirth || ''
      });
    }
  }, [profile]);

  const [errors, setErrors] = useState<Partial<Record<keyof typeof formData, string>>>({});
  const [globalError, setGlobalError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const mutation = useMutation({
    mutationFn: (data: Parameters<typeof updateTenantProfile>[0]) => updateTenantProfile(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tenantProfile'] });
      setSuccessMessage('Profile updated successfully.');
      setTimeout(() => {
        setSuccessMessage(null);
      }, 4000);
    },
    onError: (error: unknown) => {
      const err = error as ApiErrorResponse;
      if (err.errors) {
        setErrors(err.errors as any);
      }
      setGlobalError(err.message || 'Failed to update profile. Please try again.');
    }
  });

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrors({});
    setGlobalError(null);
    setSuccessMessage(null);
    
    // Basic validation
    const newErrors: Partial<typeof errors> = {};
    if (!formData.firstName.trim()) newErrors.firstName = 'First name is required';
    if (!formData.lastName.trim()) newErrors.lastName = 'Last name is required';
    if (!formData.phoneNumber.trim()) newErrors.phoneNumber = 'Phone number is required';
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    mutation.mutate({
      ...formData,
      monthlyIncome: formData.monthlyIncome ? parseFloat(formData.monthlyIncome) : undefined
    });
  }

  if (isLoading) {
    return (
      <ProtectedRoute allowedRole="ROLE_TENANT">
        <DashboardShell
          sidebarTitle="RentFlow"
          userLabel="Connected Tenant"
          userEmail={user?.email}
          navItems={NAV_ITEMS}
          activeItem="profile"
          onNavChange={(id) => {
            if (id === 'history') {
              router.push('/tenant/history');
            } else if (id !== 'profile') {
              router.push('/tenant/dashboard');
            }
          }}
          onSignOut={() => {
            logoutUser();
          }}
        >
          <div className="flex items-center justify-center h-64">
            <p className="text-on-surface-variant font-body-md">Loading profile...</p>
          </div>
        </DashboardShell>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute allowedRole="ROLE_TENANT">
      <DashboardShell
        sidebarTitle="RentFlow"
        userLabel="Connected Tenant"
        userEmail={user?.email}
        navItems={NAV_ITEMS}
        activeItem="profile"
        onNavChange={(id) => {
          if (id === 'history') {
            router.push('/tenant/history');
          } else if (id !== 'profile') {
            router.push('/tenant/dashboard');
          }
        }}
        onSignOut={() => {
          logoutUser();
        }}
      >
        <div className="flex flex-col gap-6 max-w-4xl mx-auto mt-6">
          <div className="flex items-center gap-4 border-b border-outline-variant pb-6">
            <div>
              <h1 className="font-display-md text-headline-md font-bold text-on-surface tracking-tight">My Profile</h1>
              <p className="text-on-surface-variant font-body-md mt-1">Manage your personal, employment, and emergency contact details.</p>
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

          <form onSubmit={handleSubmit} noValidate className="bg-surface rounded-lg border border-outline-variant p-6 flex flex-col gap-8">
            
            {/* Personal Information */}
            <div>
              <h3 className="font-label-lg text-title-md font-semibold text-on-surface mb-4 flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-[20px]">person</span>
                Personal Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Field label="First Name *" htmlFor="firstName" error={errors.firstName}>
                  <input id="firstName" name="firstName" type="text" className={INPUT_CLS}
                    value={formData.firstName} onChange={handleChange} required disabled={mutation.isPending} />
                </Field>
                <Field label="Last Name *" htmlFor="lastName" error={errors.lastName}>
                  <input id="lastName" name="lastName" type="text" className={INPUT_CLS}
                    value={formData.lastName} onChange={handleChange} required disabled={mutation.isPending} />
                </Field>
                <Field label="Phone Number *" htmlFor="phoneNumber" error={errors.phoneNumber}>
                  <input id="phoneNumber" name="phoneNumber" type="text" className={INPUT_CLS}
                    value={formData.phoneNumber} onChange={handleChange} required disabled={mutation.isPending} />
                </Field>
                <Field label="Date of Birth" htmlFor="dateOfBirth" error={errors.dateOfBirth}>
                  <input id="dateOfBirth" name="dateOfBirth" type="date" className={INPUT_CLS}
                    value={formData.dateOfBirth} onChange={handleChange} disabled={mutation.isPending} />
                </Field>
                <div className="md:col-span-2">
                  <Field label="BVN" htmlFor="bvn" error={errors.bvn}>
                    <input id="bvn" name="bvn" type="text" className={INPUT_CLS}
                      value={formData.bvn} onChange={handleChange} disabled={mutation.isPending} />
                  </Field>
                </div>
              </div>
            </div>

            {/* Employment & Income */}
            <div className="border-t border-outline-variant pt-6">
              <h3 className="font-label-lg text-title-md font-semibold text-on-surface mb-4 flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-[20px]">work</span>
                Employment & Income
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <Field label="Employer Name" htmlFor="employerName" error={errors.employerName}>
                    <input id="employerName" name="employerName" type="text" className={INPUT_CLS}
                      placeholder="e.g. Acme Corp" value={formData.employerName} onChange={handleChange} disabled={mutation.isPending} />
                  </Field>
                </div>
                <Field label="Job Title" htmlFor="jobTitle" error={errors.jobTitle}>
                  <input id="jobTitle" name="jobTitle" type="text" className={INPUT_CLS}
                    placeholder="e.g. Software Engineer" value={formData.jobTitle} onChange={handleChange} disabled={mutation.isPending} />
                </Field>
                <Field label="Monthly Income (₦)" htmlFor="monthlyIncome" error={errors.monthlyIncome}>
                  <input id="monthlyIncome" name="monthlyIncome" type="number" min="0" step="0.01" className={INPUT_CLS}
                    placeholder="e.g. 500000" value={formData.monthlyIncome} onChange={handleChange} disabled={mutation.isPending} />
                </Field>
                {profile?.incomeVerified && (
                  <div className="md:col-span-2">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-secondary-fixed/20 text-on-secondary-fixed-variant font-label-md text-[13px]">
                      <span className="material-symbols-outlined text-[16px]">verified</span>
                      Income has been verified by landlord.
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Emergency Contact */}
            <div className="border-t border-outline-variant pt-6">
              <h3 className="font-label-lg text-title-md font-semibold text-on-surface mb-4 flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-[20px]">contact_emergency</span>
                Emergency Contact
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <Field label="Contact Name" htmlFor="emergencyContactName" error={errors.emergencyContactName}>
                    <input id="emergencyContactName" name="emergencyContactName" type="text" className={INPUT_CLS}
                      placeholder="e.g. Jane Doe" value={formData.emergencyContactName} onChange={handleChange} disabled={mutation.isPending} />
                  </Field>
                </div>
                <Field label="Contact Phone" htmlFor="emergencyContactPhone" error={errors.emergencyContactPhone}>
                  <input id="emergencyContactPhone" name="emergencyContactPhone" type="text" className={INPUT_CLS}
                    placeholder="e.g. +2348000000000" value={formData.emergencyContactPhone} onChange={handleChange} disabled={mutation.isPending} />
                </Field>
                <Field label="Relation" htmlFor="emergencyContactRelation" error={errors.emergencyContactRelation}>
                  <input id="emergencyContactRelation" name="emergencyContactRelation" type="text" className={INPUT_CLS}
                    placeholder="e.g. Sibling, Parent" value={formData.emergencyContactRelation} onChange={handleChange} disabled={mutation.isPending} />
                </Field>
              </div>
            </div>

            <div className="flex justify-end gap-4 mt-4 pt-6 border-t border-outline-variant">
              <Button type="button" variant="ghost" onClick={() => router.push('/tenant/dashboard')} disabled={mutation.isPending}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" disabled={mutation.isPending}>
                {mutation.isPending ? 'Saving...' : 'Save Profile'}
              </Button>
            </div>
          </form>
        </div>
      </DashboardShell>
    </ProtectedRoute>
  );
}
