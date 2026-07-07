"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { DashboardShell } from '@/components/layout/DashboardShell';
import { Button } from '@/components/ui/Button';
import { getLandlordProfile, updateLandlordProfile } from '@/lib/api/landlords';
import { getBanks, lookupBankAccount } from '@/lib/api/banks';
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
    <div className="flex flex-col gap-1.5 w-full">
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
  { id: 'overview', label: 'Overview', icon: 'monitoring' },
  { id: 'properties', label: 'Properties', icon: 'domain' },
  { id: 'units', label: 'Units', icon: 'grid_view' },
  { id: 'leases', label: 'Leases', icon: 'description' },
  { id: 'payouts', label: 'Payouts', icon: 'account_balance_wallet' },
  { id: 'profile', label: 'Profile', icon: 'person' },
];

export default function LandlordProfilePage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const user = useAuthStore(s => s.user);

  const { data: profile, isLoading } = useQuery({
    queryKey: ['landlordProfile'],
    queryFn: getLandlordProfile,
  });

  const { data: banks, isLoading: isBanksLoading } = useQuery({
    queryKey: ['banks'],
    queryFn: getBanks,
  });

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phoneNumber: '',
    bankCode: '',
    bankAccountNumber: '',
    bankAccountName: ''
  });

  useEffect(() => {
    if (profile) {
      setFormData({
        firstName: profile.firstName || '',
        lastName: profile.lastName || '',
        phoneNumber: profile.phoneNumber || '',
        bankCode: profile.bankCode || '',
        bankAccountNumber: profile.bankAccountNumber || '',
        bankAccountName: profile.bankAccountName || ''
      });
    }
  }, [profile]);

  const [errors, setErrors] = useState<Partial<Record<keyof typeof formData, string>>>({});
  const [globalError, setGlobalError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isLookingUp, setIsLookingUp] = useState(false);

  useEffect(() => {
    async function verifyAccount() {
      if (formData.bankAccountNumber.length === 10 && formData.bankCode) {
        setIsLookingUp(true);
        setErrors(prev => ({ ...prev, bankAccountName: undefined, bankAccountNumber: undefined }));
        try {
          const res = await lookupBankAccount(formData.bankAccountNumber, formData.bankCode);
          setFormData(prev => ({ ...prev, bankAccountName: res.data.accountName }));
        } catch (err) {
          setErrors(prev => ({ ...prev, bankAccountNumber: 'Could not verify account details.' }));
          setFormData(prev => ({ ...prev, bankAccountName: '' }));
        } finally {
          setIsLookingUp(false);
        }
      }
    }
    // Only run if we actually have data typed by user or changed
    verifyAccount();
  }, [formData.bankAccountNumber, formData.bankCode]);

  const mutation = useMutation({
    mutationFn: (data: Parameters<typeof updateLandlordProfile>[0]) => updateLandlordProfile(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['landlordProfile'] });
      setSuccessMessage('Profile details updated successfully.');
      setTimeout(() => {
        setSuccessMessage(null);
      }, 5000);
    },
    onError: (error: unknown) => {
      const err = error as ApiErrorResponse;
      if (err.errors) {
        setErrors(err.errors as any);
      }
      setGlobalError(err.message || 'Failed to update profile. Please try again.');
    }
  });

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  }

  function handleAccountNumberChange(e: React.ChangeEvent<HTMLInputElement>) {
    const numericValue = e.target.value.replace(/\D/g, '');
    setFormData(prev => ({ ...prev, bankAccountNumber: numericValue }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrors({});
    setGlobalError(null);
    setSuccessMessage(null);

    const newErrors: Partial<typeof errors> = {};
    if (!formData.firstName.trim()) newErrors.firstName = 'First name is required.';
    if (!formData.lastName.trim()) newErrors.lastName = 'Last name is required.';
    if (!formData.phoneNumber.trim()) newErrors.phoneNumber = 'Phone number is required.';

    // Settlement Bank details validation: either all empty or all valid
    const hasBankCode = !!formData.bankCode;
    const hasAccountNum = !!formData.bankAccountNumber;
    const hasAccountName = !!formData.bankAccountName.trim();

    if (hasBankCode || hasAccountNum || hasAccountName) {
      if (!formData.bankCode) {
        newErrors.bankCode = 'Please select a settlement bank.';
      }
      if (!formData.bankAccountNumber) {
        newErrors.bankAccountNumber = 'Account number is required.';
      } else if (!/^\d{10}$/.test(formData.bankAccountNumber)) {
        newErrors.bankAccountNumber = 'Account number must be exactly 10 digits.';
      }
      if (!formData.bankAccountName.trim()) {
        newErrors.bankAccountName = 'Account name is required.';
      }
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    mutation.mutate(formData);
  }

  if (isLoading) {
    return (
      <ProtectedRoute allowedRole="ROLE_LANDLORD">
        <DashboardShell
          sidebarTitle="RentFlow"
          userLabel="Connected Landlord"
          userEmail={user?.email}
          navItems={NAV_ITEMS}
          activeItem="profile"
          onNavChange={(id) => {
            if (id !== 'profile') {
              router.push(`/landlord/dashboard?tab=${id}`);
            }
          }}
          onSignOut={() => {
            clearSession();
            router.replace('/login');
          }}
        >
          <div className="flex items-center justify-center h-64">
            <p className="text-on-surface-variant font-body-md animate-pulse">Loading profile...</p>
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
        navItems={NAV_ITEMS}
        activeItem="profile"
        onNavChange={(id) => {
          if (id !== 'profile') {
            router.push(`/landlord/dashboard?tab=${id}`);
          }
        }}
        onSignOut={() => {
          clearSession();
          router.replace('/login');
        }}
      >
        <div className="flex flex-col gap-6 max-w-4xl mx-auto mt-6">
          <div className="flex items-center gap-4 border-b border-outline-variant pb-6">
            <div>
              <h1 className="font-display-md text-headline-lg font-bold text-on-surface tracking-tight">Landlord Profile Settings</h1>
              <p className="text-on-surface-variant font-body-lg mt-1">
                Manage your personal information and payout settlement bank details.
              </p>
            </div>
          </div>

          {globalError && (
            <div className="bg-error-container/50 border border-error/20 text-on-error-container p-4 rounded-lg flex items-start gap-3 animate-[fadeIn_150ms_ease-out]">
              <span className="material-symbols-outlined text-error">error</span>
              <div className="flex-1 font-body-md">{globalError}</div>
            </div>
          )}

          {successMessage && (
            <div className="bg-secondary-fixed/20 border border-secondary-fixed-dim/20 text-on-secondary-fixed-variant p-4 rounded-lg flex items-start gap-3 animate-[fadeIn_150ms_ease-out]">
              <span className="material-symbols-outlined text-on-secondary-fixed-variant">check_circle</span>
              <div className="flex-1 font-body-md text-on-secondary-fixed-variant">{successMessage}</div>
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate className="bg-surface rounded-lg border border-outline-variant p-6 flex flex-col gap-8">
            
            {/* Personal Details Section */}
            <div>
              <h3 className="font-label-lg text-title-lg font-bold text-on-surface mb-4 flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-[22px]">person</span>
                Personal Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Field label="First Name *" htmlFor="firstName" error={errors.firstName}>
                  <input
                    id="firstName"
                    name="firstName"
                    type="text"
                    className={INPUT_CLS}
                    value={formData.firstName}
                    onChange={handleChange}
                    required
                    disabled={mutation.isPending}
                  />
                </Field>
                
                <Field label="Last Name *" htmlFor="lastName" error={errors.lastName}>
                  <input
                    id="lastName"
                    name="lastName"
                    type="text"
                    className={INPUT_CLS}
                    value={formData.lastName}
                    onChange={handleChange}
                    required
                    disabled={mutation.isPending}
                  />
                </Field>

                <div className="md:col-span-2">
                  <Field label="Phone Number *" htmlFor="phoneNumber" error={errors.phoneNumber}>
                    <input
                      id="phoneNumber"
                      name="phoneNumber"
                      type="text"
                      className={INPUT_CLS}
                      value={formData.phoneNumber}
                      onChange={handleChange}
                      required
                      disabled={mutation.isPending}
                    />
                  </Field>
                </div>
              </div>
            </div>

            {/* Payout Settlement Bank Details Section */}
            <div className="border-t border-outline-variant pt-6">
              <div className="mb-4">
                <h3 className="font-label-lg text-title-lg font-bold text-on-surface flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary text-[22px]">account_balance</span>
                  Settlement Bank Account
                </h3>
                <p className="text-sm text-on-surface-variant mt-1">
                  Configure the bank account where your share of the split rental income disbursements will be dispatched.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Field label="Settlement Bank" htmlFor="bankCode" error={errors.bankCode}>
                  <select
                    id="bankCode"
                    name="bankCode"
                    className={`${INPUT_CLS} cursor-pointer`}
                    value={formData.bankCode}
                    onChange={handleChange}
                    disabled={mutation.isPending || isBanksLoading}
                  >
                    <option value="">— Select Bank —</option>
                    {banks?.map((bank) => (
                      <option key={bank.code} value={bank.code}>{bank.name}</option>
                    ))}
                  </select>
                </Field>

                <Field label="Account Number" htmlFor="bankAccountNumber" error={errors.bankAccountNumber}>
                  <input
                    id="bankAccountNumber"
                    name="bankAccountNumber"
                    type="text"
                    maxLength={10}
                    placeholder="10-digit account number"
                    className={INPUT_CLS}
                    value={formData.bankAccountNumber}
                    onChange={handleAccountNumberChange}
                    disabled={mutation.isPending}
                  />
                </Field>

                <div className="md:col-span-2">
                  <Field label="Account Name" htmlFor="bankAccountName" error={errors.bankAccountName}>
                    <input
                      id="bankAccountName"
                      name="bankAccountName"
                      type="text"
                      placeholder="e.g. Dave Landlord Properties Ltd"
                      className={INPUT_CLS}
                      value={formData.bankAccountName}
                      onChange={handleChange}
                      disabled={mutation.isPending || isLookingUp}
                    />
                    {isLookingUp && <p className="text-xs text-primary mt-1">Verifying account...</p>}
                  </Field>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-4 mt-4 pt-6 border-t border-outline-variant">
              <Button
                type="button"
                variant="ghost"
                onClick={() => router.push('/landlord/dashboard')}
                disabled={mutation.isPending}
              >
                Cancel
              </Button>
              <Button type="submit" variant="primary" loading={mutation.isPending} disabled={mutation.isPending}>
                {mutation.isPending ? 'Saving Details...' : 'Save Settings'}
              </Button>
            </div>

          </form>
        </div>
      </DashboardShell>
    </ProtectedRoute>
  );
}
