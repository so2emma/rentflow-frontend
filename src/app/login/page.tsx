"use client";

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { login } from '@/lib/api/auth';
import { setSession, getDashboardPath } from '@/lib/auth/session';
import { Button } from '@/components/ui/Button';

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

/* ── Inline field styles ────────────────────────────────────────────────── */
const INPUT_CLS =
  'w-full min-h-[44px] px-3.5 py-2.5 text-base border border-outline-variant rounded ' +
  'bg-surface-container-lowest text-on-surface outline-none ' +
  'transition-colors duration-[150ms] ' +
  'focus:border-tertiary focus:ring-2 focus:ring-focus-ring focus:ring-offset-2 ' +
  'disabled:opacity-50 disabled:cursor-not-allowed';

/* ═══════════════════════════════════════════════════════════════════════ */

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sessionExpired, setSessionExpired] = useState(false);
  const [signupSuccess, setSignupSuccess] = useState(false);

  useEffect(() => {
    if (searchParams.get('expired') === 'true') setSessionExpired(true);
    if (searchParams.get('signup_success') === 'true') setSignupSuccess(true);
  }, [searchParams]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSessionExpired(false);
    setSignupSuccess(false);

    try {
      const response = await login({ email, password });
      setSession(response.token, { email: response.email, roles: response.roles });
      router.replace(getDashboardPath());
    } catch (err: unknown) {
      const apiErr = err as { message?: string };
      setError(apiErr.message ?? 'An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4 py-8">
      <div
        className="w-full max-w-[440px] bg-surface-container-lowest border border-outline-variant
                   rounded-md p-8 shadow-sm transition-[box-shadow] duration-[150ms] ease-[cubic-bezier(0.4,0,0.2,1)]
                   hover:[box-shadow:0px_4px_12px_rgba(15,23,42,0.05)]"
      >
        {/* Brand header */}
        <div className="mb-7 text-center">
          <h1 className="text-2xl font-bold tracking-tight text-brand-deep-slate mb-1">RentFlow</h1>
          <p className="text-sm text-on-surface-variant">Sign in to manage your property operations</p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5" noValidate>
          {/* Banners */}
          {signupSuccess && (
            <div role="alert"
              className="bg-secondary-container border border-secondary/20 rounded-md p-3 text-sm text-on-secondary-container flex items-start gap-2">
              <svg className="w-4 h-4 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Account created successfully! Please sign in.
            </div>
          )}

          {sessionExpired && (
            <div role="alert"
              className="bg-warning-container border border-warning/20 rounded-md p-3 text-sm text-on-warning-container flex items-start gap-2">
              <svg className="w-4 h-4 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round"
                  d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
              </svg>
              Your session has expired. Please sign in again.
            </div>
          )}

          {error && (
            <div role="alert"
              className="bg-error-container border border-error/20 rounded-md p-3 text-sm text-on-error-container flex items-start gap-2">
              <svg className="w-4 h-4 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round"
                  d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {error}
            </div>
          )}

          {/* Email */}
          <div className="flex flex-col gap-1.5">
            <label htmlFor="login-email" className="text-sm font-semibold text-on-surface">
              Email Address
            </label>
            <input
              id="login-email"
              type="email"
              className={INPUT_CLS}
              placeholder="name@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="username"
              disabled={isLoading}
            />
          </div>

          {/* Password */}
          <div className="flex flex-col gap-1.5">
            <label htmlFor="login-password" className="text-sm font-semibold text-on-surface">
              Password
            </label>
            <div className="relative">
              <input
                id="login-password"
                type={showPassword ? 'text' : 'password'}
                className={INPUT_CLS + ' pr-11'}
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
                disabled={isLoading}
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                disabled={isLoading}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-on-surface-variant
                           hover:text-on-surface transition-colors rounded
                           outline-none focus-visible:ring-2 focus-visible:ring-focus-ring focus-visible:ring-offset-1"
              >
                <EyeIcon open={showPassword} />
              </button>
            </div>
          </div>

          <Button type="submit" variant="primary" loading={isLoading} className="w-full mt-1">
            {isLoading ? 'Verifying credentials…' : 'Sign In'}
          </Button>
        </form>

        <p className="text-center mt-5 text-sm text-on-surface-variant">
          Don't have an account?{' '}
          <Link
            href="/signup"
            className="text-brand-blue font-semibold hover:underline
                       outline-none focus-visible:underline focus-visible:ring-2
                       focus-visible:ring-focus-ring focus-visible:ring-offset-2 rounded px-0.5"
          >
            Sign Up
          </Link>
        </p>

        <p className="text-center mt-5 text-xs text-on-surface-variant/60">
          RentFlow Property &amp; Ledger Automation Engine
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-background">
        <h2 className="text-xl font-semibold text-brand-deep-slate animate-pulse">Loading…</h2>
      </div>
    }>
      <LoginContent />
    </Suspense>
  );
}
