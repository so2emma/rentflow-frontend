"use client";

import React, { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { DashboardShell } from '@/components/layout/DashboardShell';
import { Button } from '@/components/ui/Button';
import { getLeaseById, resubmitLease } from '@/lib/api/leases';
import { getLedgersForLease } from '@/lib/api/ledgers';
import { useAuthStore } from '@/store/authStore';
import { clearSession } from '@/lib/auth/session';
import type { ApiErrorResponse } from '@/lib/api/client';
import { LedgerEntryRequest, LedgerEntryResponse } from '@/types/api';

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

export default function EditLeasePage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const user = useAuthStore(s => s.user);
  
  const { id } = use(params);

  const { data: lease, isLoading: isLeaseLoading } = useQuery({ 
    queryKey: ['lease', id], 
    queryFn: () => getLeaseById(id) 
  });
  
  const { data: initialLedgers, isLoading: isLedgersLoading } = useQuery({ 
    queryKey: ['ledgers', id], 
    queryFn: () => getLedgersForLease(id) 
  });

  const [ledgerEntries, setLedgerEntries] = useState<LedgerEntryRequest[]>([]);
  const [globalError, setGlobalError] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  useEffect(() => {
    if (initialLedgers) {
      setLedgerEntries(initialLedgers.map((l: LedgerEntryResponse) => ({
        entryType: l.entryType as any,
        amountDue: l.amountDue,
        dueDate: l.dueDate,
        periodStartDate: l.periodStartDate,
        periodEndDate: l.periodEndDate,
        description: l.description || ''
      })));
    }
  }, [initialLedgers]);

  const mutation = useMutation({
    mutationFn: (ledgers: LedgerEntryRequest[]) => resubmitLease(id, ledgers),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leases'] });
      queryClient.invalidateQueries({ queryKey: ['lease', id] });
      queryClient.invalidateQueries({ queryKey: ['ledgers', id] });
      router.push('/landlord/dashboard');
    },
    onError: (error: unknown) => {
      const err = error as ApiErrorResponse;
      setGlobalError(err.message || 'Failed to resubmit lease. Please try again.');
    }
  });

  function addLedgerEntry() {
    setLedgerEntries(prev => [
      ...prev,
      { entryType: 'RENT', amountDue: 0, dueDate: lease?.startDate || '', periodStartDate: '', periodEndDate: '', description: '' }
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
    
    mutation.mutate(
      ledgerEntries.map(le => ({
        ...le,
        amountDue: Number(le.amountDue)
      })).filter(le => le.amountDue > 0 && le.dueDate)
    );
  }

  if (isLeaseLoading || isLedgersLoading) {
    return (
      <ProtectedRoute allowedRole="ROLE_LANDLORD">
        <div className="w-full flex items-center justify-center min-h-screen bg-background">
          <div className="font-headline-md text-title-lg font-bold text-brand-deep-slate animate-pulse">
            Loading lease details…
          </div>
        </div>
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
              <h1 className="font-display-md text-headline-md font-bold text-on-surface tracking-tight">Edit & Resubmit Lease</h1>
              <p className="text-on-surface-variant font-body-md mt-1">Update the ledgers for this contested lease and resubmit to the tenant.</p>
            </div>
          </div>

          {globalError && (
            <div className="bg-error-container/50 border border-error/20 text-on-error-container p-4 rounded-lg flex items-start gap-3">
              <span className="material-symbols-outlined text-error">error</span>
              <div className="flex-1 font-body-md">{globalError}</div>
            </div>
          )}

          {lease?.contestedReason && (
            <div className="bg-error-container/20 border border-error/20 text-on-error-container p-6 rounded-lg flex flex-col gap-2">
              <h3 className="font-label-lg font-bold">Tenant's Contest Reason:</h3>
              <p className="font-body-md">{lease.contestedReason}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate className="bg-surface rounded-lg border border-outline-variant p-6 flex flex-col gap-6">
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4 bg-surface-container-lowest rounded-lg border border-outline-variant">
              <div>
                <p className="font-label-md text-on-surface-variant">Tenant</p>
                <p className="font-body-lg font-semibold text-on-surface">{lease?.tenantName}</p>
              </div>
              <div>
                <p className="font-label-md text-on-surface-variant">Unit</p>
                <p className="font-body-lg font-semibold text-on-surface">{lease?.propertyName} - Unit {lease?.unitNumber}</p>
              </div>
              <div>
                <p className="font-label-md text-on-surface-variant">Start Date</p>
                <p className="font-body-lg font-semibold text-on-surface">{lease?.startDate}</p>
              </div>
              <div>
                <p className="font-label-md text-on-surface-variant">End Date</p>
                <p className="font-body-lg font-semibold text-on-surface">{lease?.endDate}</p>
              </div>
            </div>

            <div className="border-t border-outline-variant pt-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-label-lg text-title-md font-semibold text-on-surface">Initial Ledger Entries</h3>
                <Button type="button" variant="ghost" size="sm" onClick={addLedgerEntry} leadingIcon={<span className="material-symbols-outlined text-[18px]">add</span>}>
                  Add Entry
                </Button>
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

            <div className="pt-4 flex justify-end gap-4 border-t border-outline-variant mt-4">
              <Button type="button" variant="ghost" onClick={() => router.back()} disabled={mutation.isPending}>Cancel</Button>
              <Button type="submit" variant="primary" disabled={mutation.isPending}>
                {mutation.isPending ? 'Resubmitting...' : 'Resubmit Lease'}
              </Button>
            </div>
          </form>
        </div>
      </DashboardShell>
    </ProtectedRoute>
  );
}
