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
    <svg className="w-5 h-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round"
        d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18" />
    </svg>
  ) : (
    <svg className="w-5 h-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      <path strokeLinecap="round" strokeLinejoin="round"
        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
    </svg>
  );
}

/* ── Dark Input styling ─────────────────────────────────────────────────── */
const DARK_INPUT_CLS =
  'w-full min-h-[44px] px-4 py-2.5 text-base border border-slate-800 rounded-md ' +
  'bg-slate-950/80 text-white placeholder-slate-500 outline-none ' +
  'transition-colors duration-[150ms] ' +
  'focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 focus:ring-offset-0 ' +
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
      <label htmlFor={htmlFor} className="text-sm font-semibold text-slate-300">
        {label}
      </label>
      {children}
      {error && (
        <p role="alert" className="flex items-center gap-1 text-sm text-red-400">
          <svg className="w-4 h-4 flex-shrink-0 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round"
              d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
          </svg>
          {error}
        </p>
      )}
      {!error && hint && (
        <p className="text-xs text-slate-400">{hint}</p>
      )}
    </div>
  );
}

function TenantLoginContent() {
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
      const response = await login({ email: loginEmail, password: loginPassword, role: 'TENANT' });
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
        role: 'TENANT',
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
    <div className="w-full min-h-screen bg-[#070a13] text-white flex flex-col justify-center items-center p-4 relative overflow-hidden">
      
      {/* Dynamic Background Elements */}
      <div
        className="absolute inset-0 opacity-5 pointer-events-none"
        style={{
          backgroundImage: "radial-gradient(white 1px, transparent 1px)",
          backgroundSize: "32px 32px",
        }}
      ></div>
      <div className="absolute top-1/4 left-1/4 w-[400px] h-[400px] bg-emerald-500/10 rounded-full blur-[100px] pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 w-[350px] h-[350px] bg-blue-500/5 rounded-full blur-[80px] pointer-events-none"></div>

      {/* Main Single Column Card Container (DESIGN 2) */}
      <div className="w-full max-w-[480px] bg-slate-900/40 border border-slate-800/80 backdrop-blur-md rounded-xl p-8 md:p-10 shadow-2xl flex flex-col gap-6 relative z-10">
        
        {/* Brand Header */}
        <div className="flex flex-col items-center gap-2 text-center">
          <div className="flex items-center justify-center w-12 h-12 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 mb-2">
            <span className="material-symbols-outlined text-[28px] leading-none" aria-hidden="true">
              sensor_occupied
            </span>
          </div>
          <span className="text-sm text-emerald-400 font-semibold tracking-wider uppercase">Tenant Portal</span>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">RentFlow</h1>
          <p className="text-sm text-slate-400 mt-0.5">Pay rent easily and review your lease ledgers</p>
        </div>

        {/* Tab Selector */}
        <div className="grid grid-cols-2 p-1 bg-slate-950 border border-slate-800/60 rounded-lg">
          <button
            type="button"
            onClick={() => { setActiveTab('login'); setErrors({}); setGlobalError(null); }}
            className={`py-2 text-sm font-semibold rounded transition-all outline-none ${
              activeTab === 'login'
                ? 'bg-slate-900 text-white shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => { setActiveTab('signup'); setErrors({}); setGlobalError(null); }}
            className={`py-2 text-sm font-semibold rounded transition-all outline-none ${
              activeTab === 'signup'
                ? 'bg-slate-900 text-white shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Create Account
          </button>
        </div>

        {/* Banners */}
        {globalError && (
          <div role="alert"
            className="bg-red-950/40 border border-red-500/30 rounded p-3.5 text-sm text-red-200 flex items-start gap-2.5 animate-[fadeIn_150ms_ease-out]">
            <span className="material-symbols-outlined text-red-400 text-[20px] flex-shrink-0">error</span>
            <div className="flex-1 leading-normal">{globalError}</div>
          </div>
        )}

        {successMessage && (
          <div role="alert"
            className="bg-emerald-950/40 border border-emerald-500/30 rounded p-3.5 text-sm text-emerald-200 flex items-start gap-2.5 animate-[fadeIn_150ms_ease-out]">
            <span className="material-symbols-outlined text-emerald-400 text-[20px] flex-shrink-0">check_circle</span>
            <div className="flex-1 leading-normal">{successMessage}</div>
          </div>
        )}

        {/* SIGN IN FORM */}
        {activeTab === 'login' && (
          <form onSubmit={handleLoginSubmit} className="flex flex-col gap-4" noValidate>
            <Field label="Email Address" htmlFor="tenantLoginEmail" error={errors.loginEmail}>
              <input
                id="tenantLoginEmail"
                type="email"
                className={DARK_INPUT_CLS}
                placeholder="name@example.com"
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                disabled={isLoading}
                autoComplete="username"
                required
              />
            </Field>

            <Field label="Password" htmlFor="tenantLoginPassword" error={errors.loginPassword}>
              <div className="relative">
                <input
                  id="tenantLoginPassword"
                  type={showLoginPassword ? 'text' : 'password'}
                  className={`${DARK_INPUT_CLS} pr-11`}
                  placeholder="Enter your password"
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
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-white transition-colors rounded outline-none"
                >
                  <EyeIcon open={showLoginPassword} />
                </button>
              </div>
            </Field>

            <Button
              type="submit"
              variant="primary"
              loading={isLoading}
              className="w-full mt-2 bg-emerald-600 hover:bg-emerald-500 text-white min-h-[44px] border-none"
            >
              {isLoading ? 'Signing In…' : 'Sign In'}
            </Button>
          </form>
        )}

        {/* SIGN UP FORM */}
        {activeTab === 'signup' && (
          <form onSubmit={handleSignupSubmit} className="flex flex-col gap-4" noValidate>
            <div className="grid grid-cols-2 gap-4">
              <Field label="First Name" htmlFor="tenantSignUpFirstName" error={errors.signUpFirstName}>
                <input
                  id="tenantSignUpFirstName"
                  type="text"
                  className={DARK_INPUT_CLS}
                  placeholder="John"
                  value={signUpFirstName}
                  onChange={(e) => setSignUpFirstName(e.target.value)}
                  disabled={isLoading}
                  required
                />
              </Field>
              <Field label="Last Name" htmlFor="tenantSignUpLastName" error={errors.signUpLastName}>
                <input
                  id="tenantSignUpLastName"
                  type="text"
                  className={DARK_INPUT_CLS}
                  placeholder="Doe"
                  value={signUpLastName}
                  onChange={(e) => setSignUpLastName(e.target.value)}
                  disabled={isLoading}
                  required
                />
              </Field>
            </div>

            <Field label="Email Address" htmlFor="tenantSignUpEmail" error={errors.signUpEmail}>
              <input
                id="tenantSignUpEmail"
                type="email"
                className={DARK_INPUT_CLS}
                placeholder="name@example.com"
                value={signUpEmail}
                onChange={(e) => setSignUpEmail(e.target.value)}
                disabled={isLoading}
                required
              />
            </Field>

            <Field label="Password" htmlFor="tenantSignUpPassword" error={errors.signUpPassword} hint="Minimum 6 characters">
              <input
                id="tenantSignUpPassword"
                type="password"
                className={DARK_INPUT_CLS}
                placeholder="••••••••"
                value={signUpPassword}
                onChange={(e) => setSignUpPassword(e.target.value)}
                disabled={isLoading}
                required
              />
            </Field>

            <Field label="Phone Number" htmlFor="tenantSignUpPhoneNumber" error={errors.signUpPhoneNumber}>
              <input
                id="tenantSignUpPhoneNumber"
                type="tel"
                className={DARK_INPUT_CLS}
                placeholder="+23480…"
                value={signUpPhoneNumber}
                onChange={(e) => setSignUpPhoneNumber(e.target.value)}
                disabled={isLoading}
                required
              />
            </Field>

            <div className="text-xs text-slate-400 border-t border-slate-800/80 pt-3 mt-1 leading-relaxed">
              No BVN details are required for signup. You will be prompted to verify your identity before signing a rental agreement contract inside the dashboard.
            </div>

            <Button
              type="submit"
              variant="primary"
              loading={isLoading}
              className="w-full mt-2 bg-emerald-600 hover:bg-emerald-500 text-white min-h-[44px] border-none"
            >
              {isLoading ? 'Creating Account…' : 'Sign Up'}
            </Button>
          </form>
        )}

        <div className="text-center mt-2 flex flex-col gap-2">
          <Link
            href="/"
            className="text-xs text-emerald-400 hover:text-emerald-300 font-semibold hover:underline inline-flex items-center justify-center gap-1"
          >
            <span className="material-symbols-outlined text-[14px]">arrow_back</span>
            Back to Portal selection
          </Link>
        </div>

      </div>

      <div className="mt-8 text-center text-xs text-slate-500 font-mono relative z-10">
        &copy; {new Date().getFullYear()} RentFlow Inc. Secure Lease Payments Platform.
      </div>

    </div>
  );
}

export default function TenantLoginPage() {
  return (
    <Suspense fallback={
      <div className="w-full min-h-screen flex items-center justify-center bg-[#070a13]">
        <h2 className="text-xl font-semibold text-emerald-400 animate-pulse">Loading Tenant Portal…</h2>
      </div>
    }>
      <TenantLoginContent />
    </Suspense>
  );
}
