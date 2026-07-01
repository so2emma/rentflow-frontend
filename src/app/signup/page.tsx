"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { signUp } from '@/lib/api/auth';
import { Button } from '@/components/ui/Button';
import type { ApiErrorResponse } from '@/lib/api/client';

/* ── Inline field styles ────────────────────────────────────────────────── */
const INPUT_CLS =
  'w-full min-h-[44px] px-3.5 py-2.5 text-base border border-outline-variant rounded ' +
  'bg-surface-container-lowest text-on-surface outline-none ' +
  'transition-colors duration-[150ms] ' +
  'focus:border-tertiary focus:ring-2 focus:ring-focus-ring focus:ring-offset-2 ' +
  'disabled:opacity-50 disabled:cursor-not-allowed';

function Field({
  label,
  htmlFor,
  error,
  hint,
  children,
}: {
  label: string;
  htmlFor: string;
  error?: string;
  hint?: string;
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
      {!error && hint && (
        <p className="text-xs text-on-surface-variant">{hint}</p>
      )}
    </div>
  );
}

type Role = 'ADMIN' | 'LANDLORD' | 'TENANT';

export default function SignUpPage() {
  const router = useRouter();

  // Basic details
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [role, setRole] = useState<Role>('TENANT');

  // Landlord details
  const [bankCode, setBankCode] = useState('');
  const [bankAccountNumber, setBankAccountNumber] = useState('');
  const [bankAccountName, setBankAccountName] = useState('');

  // Tenant details
  const [bvn, setBvn] = useState('');

  // Field-level errors
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [globalError, setGlobalError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  function validate(): boolean {
    const errs: Record<string, string> = {};

    if (!firstName.trim()) errs.firstName = 'First name is required.';
    if (!lastName.trim()) errs.lastName = 'Last name is required.';

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) errs.email = 'Enter a valid email address.';

    if (password.length < 6) errs.password = 'Password must be at least 6 characters.';

    if (!phoneNumber.trim()) errs.phoneNumber = 'Phone number is required.';

    if (role === 'LANDLORD') {
      if (!bankCode) errs.bankCode = 'Please select your settlement bank.';
      if (!/^\d{10}$/.test(bankAccountNumber)) errs.bankAccountNumber = 'Account number must be exactly 10 digits.';
      if (!bankAccountName.trim()) errs.bankAccountName = 'Account name is required.';
    }

    if (role === 'TENANT') {
      if (!/^\d{11}$/.test(bvn)) errs.bvn = 'BVN must be exactly 11 digits.';
    }

    setFieldErrors(errs);
    return Object.keys(errs).length === 0;
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setGlobalError(null);
    if (!validate()) return;

    setIsLoading(true);

    const payload: Record<string, unknown> = {
      email, password, role, firstName, lastName, phoneNumber,
    };

    if (role === 'LANDLORD') {
      payload.landlordDetails = { bankCode, bankAccountNumber, bankAccountName };
    } else if (role === 'TENANT') {
      payload.tenantDetails = { bvn };
    }

    try {
      await signUp(payload as any);
      router.push('/login?signup_success=true');
    } catch (error: unknown) {
      const err = error as ApiErrorResponse;
      // Surface field-level errors from backend if present
      if (err.errors) {
        setFieldErrors((prev) => ({ ...prev, ...err.errors }));
      } else {
        setGlobalError(err.message ?? 'Sign up failed. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4 py-8">
      <div
        className="w-full max-w-[520px] bg-surface-container-lowest border border-outline-variant
                   rounded-md p-8 shadow-sm transition-[box-shadow] duration-[150ms] ease-[cubic-bezier(0.4,0,0.2,1)]
                   hover:[box-shadow:0px_4px_12px_rgba(15,23,42,0.05)]"
      >
        <div className="mb-7 text-center">
          <h1 className="text-2xl font-bold tracking-tight text-brand-deep-slate mb-1">Create Account</h1>
          <p className="text-sm text-on-surface-variant">Register your RentFlow portal profile</p>
        </div>

        <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-5">
          {globalError && (
            <div role="alert"
              className="bg-error-container border border-error/20 rounded-md p-3 text-sm text-on-error-container flex items-start gap-2">
              <svg className="w-4 h-4 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round"
                  d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {globalError}
            </div>
          )}

          {/* Name row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="First Name" htmlFor="firstName" error={fieldErrors.firstName}>
              <input id="firstName" type="text" className={INPUT_CLS}
                placeholder="John" value={firstName}
                onChange={(e) => setFirstName(e.target.value)} required disabled={isLoading} />
            </Field>
            <Field label="Last Name" htmlFor="lastName" error={fieldErrors.lastName}>
              <input id="lastName" type="text" className={INPUT_CLS}
                placeholder="Doe" value={lastName}
                onChange={(e) => setLastName(e.target.value)} required disabled={isLoading} />
            </Field>
          </div>

          <Field label="Email Address" htmlFor="email" error={fieldErrors.email}>
            <input id="email" type="email" className={INPUT_CLS}
              placeholder="name@example.com" value={email}
              onChange={(e) => setEmail(e.target.value)} required disabled={isLoading} />
          </Field>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Password" htmlFor="password" error={fieldErrors.password}
              hint="At least 6 characters">
              <input id="password" type="password" className={INPUT_CLS}
                placeholder="••••••••" value={password}
                onChange={(e) => setPassword(e.target.value)} required disabled={isLoading} />
            </Field>
            <Field label="Phone Number" htmlFor="phone" error={fieldErrors.phoneNumber}>
              <input id="phone" type="tel" className={INPUT_CLS}
                placeholder="+23480…" value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)} required disabled={isLoading} />
            </Field>
          </div>

          {/* Role selector */}
          <Field label="Registering As" htmlFor="role">
            <select id="role" className={INPUT_CLS + ' cursor-pointer'}
              value={role}
              onChange={(e) => { setRole(e.target.value as Role); setFieldErrors({}); }}
              disabled={isLoading}>
              <option value="TENANT">Tenant (Rent Payer)</option>
              <option value="LANDLORD">Landlord (Property Owner)</option>
              <option value="ADMIN">Administrator</option>
            </select>
          </Field>

          {/* Landlord section */}
          {role === 'LANDLORD' && (
            <div className="flex flex-col gap-4 border-t border-outline-variant pt-4 mt-1">
              <h2 className="text-base font-bold text-brand-deep-slate">Landlord Payout Settlement Details</h2>

              <Field label="Settlement Bank" htmlFor="bankCode" error={fieldErrors.bankCode}>
                <select id="bankCode" className={INPUT_CLS + ' cursor-pointer'}
                  value={bankCode} onChange={(e) => setBankCode(e.target.value)}
                  required disabled={isLoading}>
                  <option value="">— Select Bank —</option>
                  <option value="058">GTBank (058)</option>
                  <option value="057">Zenith Bank (057)</option>
                  <option value="044">Access Bank (044)</option>
                  <option value="011">First Bank (011)</option>
                  <option value="033">United Bank for Africa (033)</option>
                </select>
              </Field>

              <Field label="Bank Account Number" htmlFor="accountNumber" error={fieldErrors.bankAccountNumber}>
                <input id="accountNumber" type="text" pattern="\d{10}" maxLength={10}
                  className={INPUT_CLS}
                  placeholder="10-digit Account Number"
                  value={bankAccountNumber}
                  onChange={(e) => setBankAccountNumber(e.target.value.replace(/\D/g, ''))}
                  required disabled={isLoading} />
              </Field>

              <Field label="Settlement Account Name" htmlFor="accountName" error={fieldErrors.bankAccountName}>
                <input id="accountName" type="text" className={INPUT_CLS}
                  placeholder="e.g. John Doe Enterprises"
                  value={bankAccountName} onChange={(e) => setBankAccountName(e.target.value)}
                  required disabled={isLoading} />
              </Field>
            </div>
          )}

          {/* Tenant section */}
          {role === 'TENANT' && (
            <div className="flex flex-col gap-4 border-t border-outline-variant pt-4 mt-1">
              <h2 className="text-base font-bold text-brand-deep-slate">Tenant Verification Details</h2>

              <Field label="Bank Verification Number (BVN)" htmlFor="bvn" error={fieldErrors.bvn}
                hint="Your 11-digit BVN is required for identity verification.">
                <input id="bvn" type="text" pattern="\d{11}" maxLength={11}
                  className={INPUT_CLS}
                  placeholder="11-digit BVN"
                  value={bvn}
                  onChange={(e) => setBvn(e.target.value.replace(/\D/g, ''))}
                  required disabled={isLoading} />
              </Field>
            </div>
          )}

          <Button type="submit" variant="primary" loading={isLoading} className="w-full mt-1">
            {isLoading ? 'Creating Account…' : 'Sign Up'}
          </Button>
        </form>

        <p className="text-center mt-5 text-sm text-on-surface-variant">
          Already have an account?{' '}
          <Link
            href="/login"
            className="text-brand-blue font-semibold hover:underline
                       outline-none focus-visible:underline focus-visible:ring-2
                       focus-visible:ring-focus-ring focus-visible:ring-offset-2 rounded px-0.5"
          >
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
}
