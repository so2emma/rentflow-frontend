"use client";

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { login, signUp } from '@/lib/api/auth';
import { setSession, getDashboardPath } from '@/lib/auth/session';
import { Button } from '@/components/ui/Button';
import type { ApiErrorResponse } from '@/lib/api/client';

/* ── Eye icon (show / hide password) ───────────────────────────────────── */
function EyeIcon({ open }: { open: boolean }) {
  return open ? (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round"
        d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18" />
    </svg>
  ) : (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      <path strokeLinecap="round" strokeLinejoin="round"
        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
    </svg>
  );
}

/* ── Input styling ──────────────────────────────────────────────────────── */
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
    <div className="flex flex-col gap-1.5 w-full">
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

function LandlordLoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [activeTab, setActiveTab] = useState<'login' | 'signup'>('login');

  // Login state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);

  // Signup state
  const [signUpFirstName, setSignUpFirstName] = useState('');
  const [signUpLastName, setSignUpLastName] = useState('');
  const [signUpEmail, setSignUpEmail] = useState('');
  const [signUpPassword, setSignUpPassword] = useState('');
  const [signUpPhoneNumber, setSignUpPhoneNumber] = useState('');

  // UI state
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [globalError, setGlobalError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    if (searchParams.get('expired') === 'true') {
      setGlobalError('Your session has expired. Please sign in again.');
    }
    if (searchParams.get('signup_success') === 'true') {
      setSuccessMessage('Account created successfully! Please sign in.');
    }
    const mode = searchParams.get('mode');
    if (mode === 'signup') {
      setActiveTab('signup');
    }
  }, [searchParams]);

  // Validate Login
  function validateLogin(): boolean {
    const errs: Record<string, string> = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(loginEmail)) errs.loginEmail = 'Enter a valid email address.';
    if (!loginPassword) errs.loginPassword = 'Password is required.';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  // Validate Signup
  function validateSignup(): boolean {
    const errs: Record<string, string> = {};
    if (!signUpFirstName.trim()) errs.signUpFirstName = 'First name is required.';
    if (!signUpLastName.trim()) errs.signUpLastName = 'Last name is required.';

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(signUpEmail)) errs.signUpEmail = 'Enter a valid email address.';

    if (signUpPassword.length < 6) errs.signUpPassword = 'Password must be at least 6 characters.';
    if (!signUpPhoneNumber.trim()) errs.signUpPhoneNumber = 'Phone number is required.';

    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  // Handle Login Submit
  async function handleLoginSubmit(e: React.FormEvent) {
    e.preventDefault();
    setGlobalError(null);
    setSuccessMessage(null);
    if (!validateLogin()) return;

    setIsLoading(true);
    try {
      const response = await login({ email: loginEmail, password: loginPassword, role: 'LANDLORD' });
      setSession(response.token, { email: response.email, roles: response.roles });
      router.replace(getDashboardPath());
    } catch (err: unknown) {
      const apiErr = err as ApiErrorResponse;
      setGlobalError(apiErr.message ?? 'Sign in failed. Check your credentials and try again.');
    } finally {
      setIsLoading(false);
    }
  }

  // Handle Signup Submit
  async function handleSignupSubmit(e: React.FormEvent) {
    e.preventDefault();
    setGlobalError(null);
    setSuccessMessage(null);
    if (!validateSignup()) return;

    setIsLoading(true);
    try {
      await signUp({
        email: signUpEmail,
        password: signUpPassword,
        role: 'LANDLORD',
        firstName: signUpFirstName,
        lastName: signUpLastName,
        phoneNumber: signUpPhoneNumber,
      });
      setSuccessMessage('Account created successfully! Please sign in using your credentials.');
      setActiveTab('login');
      // Reset signup fields
      setSignUpFirstName('');
      setSignUpLastName('');
      setSignUpEmail('');
      setSignUpPassword('');
      setSignUpPhoneNumber('');
    } catch (err: unknown) {
      const apiErr = err as ApiErrorResponse;
      if (apiErr.errors) {
        setErrors(apiErr.errors as any);
      } else {
        setGlobalError(apiErr.message ?? 'Registration failed. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="w-full min-h-screen flex bg-background">
      
      {/* LEFT COLUMN: BRAND SPLIT-SCREEN (DESIGN 1) */}
      <div className="hidden md:flex md:w-1/2 bg-[#0b0f19] text-white flex-col justify-between p-12 relative overflow-hidden">
        {/* Decorative Grid Overlays */}
        <div
          className="absolute inset-0 opacity-10 pointer-events-none"
          style={{
            backgroundImage: "radial-gradient(white 1px, transparent 1px)",
            backgroundSize: "24px 24px",
          }}
        ></div>
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-secondary-container/10 rounded-full blur-[100px] translate-x-1/4 -translate-y-1/4 pointer-events-none"></div>

        {/* Brand Header */}
        <div className="flex items-center gap-2 select-none relative z-10">
          <span className="material-symbols-outlined text-secondary text-[32px] leading-none" aria-hidden="true">
            real_estate_agent
          </span>
          <span className="text-2xl font-bold tracking-tight">RentFlow</span>
        </div>

        {/* Brand Core Messaging */}
        <div className="max-w-md relative z-10 my-auto flex flex-col gap-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 w-fit">
            <span className="w-2 h-2 rounded-full bg-secondary" aria-hidden="true"></span>
            <span className="text-xs text-secondary-container font-semibold tracking-wider uppercase">Landlord Portal</span>
          </div>
          <h2 className="text-display-lg text-4xl font-extrabold leading-tight text-white">
            Maximized Returns. <br />
            Zero Settlement Friction.
          </h2>
          <p className="text-body-lg text-on-primary-container text-gray-300">
            Automated rental ledgers, real-time split payouts, maintenance reserve configuration, and seamless tenant onboarding in a single unified dashboard.
          </p>

          <div className="flex flex-col gap-4 mt-4 text-sm text-gray-400">
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-secondary text-[20px]" aria-hidden="true">payments</span>
              <span>Instant split payout settlement to arbitrary bank accounts</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-secondary text-[20px]" aria-hidden="true">account_balance_wallet</span>
              <span>Automated virtual accounts for touchless reconciliation</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-secondary text-[20px]" aria-hidden="true">analytics</span>
              <span>Granular financial ledger statements and metrics exports</span>
            </div>
          </div>
        </div>

        {/* Brand Footer */}
        <div className="relative z-10 text-xs text-gray-500 font-mono">
          &copy; {new Date().getFullYear()} RentFlow Inc. Institutional-Grade Property Ledger Engine.
        </div>
      </div>

      {/* RIGHT COLUMN: AUTHENTICATION FORM */}
      <div className="w-full md:w-1/2 flex items-center justify-center p-8 sm:p-12 md:p-16">
        <div className="w-full max-w-[460px] flex flex-col gap-6">
          
          {/* Logo on mobile only */}
          <div className="flex md:hidden items-center gap-2 mb-2 justify-center select-none">
            <span className="material-symbols-outlined text-secondary text-[32px] leading-none" aria-hidden="true">
              real_estate_agent
            </span>
            <span className="text-2xl font-bold tracking-tight text-primary">RentFlow</span>
          </div>

          <div className="flex flex-col gap-1 text-center md:text-left">
            <h1 className="text-3xl font-bold tracking-tight text-on-surface">Landlord Access</h1>
            <p className="text-sm text-on-surface-variant">Sign in or register your properties dashboard</p>
          </div>

          {/* Toggle Tabs */}
          <div className="grid grid-cols-2 p-1 bg-surface-container rounded-lg border border-outline-variant/60">
            <button
              type="button"
              onClick={() => { setActiveTab('login'); setErrors({}); setGlobalError(null); }}
              className={`py-2 text-sm font-semibold rounded transition-all outline-none ${
                activeTab === 'login'
                  ? 'bg-surface-container-lowest text-primary shadow-sm'
                  : 'text-on-surface-variant hover:text-primary'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => { setActiveTab('signup'); setErrors({}); setGlobalError(null); }}
              className={`py-2 text-sm font-semibold rounded transition-all outline-none ${
                activeTab === 'signup'
                  ? 'bg-surface-container-lowest text-primary shadow-sm'
                  : 'text-on-surface-variant hover:text-primary'
              }`}
            >
              Create Account
            </button>
          </div>

          {/* Error Banner */}
          {globalError && (
            <div role="alert"
              className="bg-error-container border border-error/20 rounded p-3.5 text-sm text-on-error-container flex items-start gap-2.5 animate-[fadeIn_150ms_ease-out]">
              <span className="material-symbols-outlined text-error text-[20px] flex-shrink-0">error</span>
              <div className="flex-1 leading-normal font-medium">{globalError}</div>
            </div>
          )}

          {/* Success Banner */}
          {successMessage && (
            <div role="alert"
              className="bg-secondary-container border border-secondary/20 rounded p-3.5 text-sm text-on-secondary-container flex items-start gap-2.5 animate-[fadeIn_150ms_ease-out]">
              <span className="material-symbols-outlined text-on-secondary-container text-[20px] flex-shrink-0">check_circle</span>
              <div className="flex-1 leading-normal font-medium">{successMessage}</div>
            </div>
          )}

          {/* SIGN IN FORM */}
          {activeTab === 'login' && (
            <form onSubmit={handleLoginSubmit} className="flex flex-col gap-4" noValidate>
              <Field label="Email Address" htmlFor="loginEmail" error={errors.loginEmail}>
                <input
                  id="loginEmail"
                  type="email"
                  className={INPUT_CLS}
                  placeholder="name@company.com"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  disabled={isLoading}
                  autoComplete="username"
                  required
                />
              </Field>

              <Field label="Password" htmlFor="loginPassword" error={errors.loginPassword}>
                <div className="relative">
                  <input
                    id="loginPassword"
                    type={showLoginPassword ? 'text' : 'password'}
                    className={`${INPUT_CLS} pr-11`}
                    placeholder="Enter account password"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    disabled={isLoading}
                    autoComplete="current-password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowLoginPassword((v) => !v)}
                    aria-label={showLoginPassword ? 'Hide password' : 'Show password'}
                    disabled={isLoading}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-on-surface-variant hover:text-primary transition-colors rounded outline-none"
                  >
                    <EyeIcon open={showLoginPassword} />
                  </button>
                </div>
              </Field>

              <Button type="submit" variant="primary" loading={isLoading} className="w-full mt-2 min-h-[44px]">
                {isLoading ? 'Verifying credentials…' : 'Sign In'}
              </Button>
            </form>
          )}

          {/* SIGN UP FORM */}
          {activeTab === 'signup' && (
            <form onSubmit={handleSignupSubmit} className="flex flex-col gap-4" noValidate>
              <div className="grid grid-cols-2 gap-4">
                <Field label="First Name" htmlFor="signUpFirstName" error={errors.signUpFirstName}>
                  <input
                    id="signUpFirstName"
                    type="text"
                    className={INPUT_CLS}
                    placeholder="John"
                    value={signUpFirstName}
                    onChange={(e) => setSignUpFirstName(e.target.value)}
                    disabled={isLoading}
                    required
                  />
                </Field>
                <Field label="Last Name" htmlFor="signUpLastName" error={errors.signUpLastName}>
                  <input
                    id="signUpLastName"
                    type="text"
                    className={INPUT_CLS}
                    placeholder="Doe"
                    value={signUpLastName}
                    onChange={(e) => setSignUpLastName(e.target.value)}
                    disabled={isLoading}
                    required
                  />
                </Field>
              </div>

              <Field label="Email Address" htmlFor="signUpEmail" error={errors.signUpEmail}>
                <input
                  id="signUpEmail"
                  type="email"
                  className={INPUT_CLS}
                  placeholder="name@example.com"
                  value={signUpEmail}
                  onChange={(e) => setSignUpEmail(e.target.value)}
                  disabled={isLoading}
                  required
                />
              </Field>

              <Field label="Password" htmlFor="signUpPassword" error={errors.signUpPassword} hint="Minimum 6 characters">
                <input
                  id="signUpPassword"
                  type="password"
                  className={INPUT_CLS}
                  placeholder="••••••••"
                  value={signUpPassword}
                  onChange={(e) => setSignUpPassword(e.target.value)}
                  disabled={isLoading}
                  required
                />
              </Field>

              <Field label="Phone Number" htmlFor="signUpPhoneNumber" error={errors.signUpPhoneNumber}>
                <input
                  id="signUpPhoneNumber"
                  type="tel"
                  className={INPUT_CLS}
                  placeholder="+23480…"
                  value={signUpPhoneNumber}
                  onChange={(e) => setSignUpPhoneNumber(e.target.value)}
                  disabled={isLoading}
                  required
                />
              </Field>

              <div className="text-xs text-on-surface-variant/80 border-t border-outline-variant/60 pt-3 mt-1 leading-relaxed">
                Settlement bank account details are not required for registration. You will be prompted to configure your payout settings inside the dashboard.
              </div>

              <Button type="submit" variant="primary" loading={isLoading} className="w-full mt-2 min-h-[44px]">
                {isLoading ? 'Creating Account…' : 'Sign Up'}
              </Button>
            </form>
          )}

          <div className="text-center mt-2">
            <Link
              href="/"
              className="text-xs text-brand-blue font-semibold hover:underline inline-flex items-center gap-1"
            >
              <span className="material-symbols-outlined text-[14px]">arrow_back</span>
              Back to Portal selection
            </Link>
          </div>

        </div>
      </div>

    </div>
  );
}

export default function LandlordLoginPage() {
  return (
    <Suspense fallback={
      <div className="w-full min-h-screen flex items-center justify-center bg-[#0b0f19]">
        <h2 className="text-xl font-semibold text-emerald-400 animate-pulse">Loading Landlord Portal…</h2>
      </div>
    }>
      <LandlordLoginContent />
    </Suspense>
  );
}
