"use client";

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { login } from '@/lib/api/auth';

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [sessionExpired, setSessionExpired] = useState(false);
  const [signupSuccess, setSignupSuccess] = useState(false);

  useEffect(() => {
    if (searchParams.get('expired') === 'true') {
      setSessionExpired(true);
    }
    if (searchParams.get('signup_success') === 'true') {
      setSignupSuccess(true);
    }
  }, [searchParams]);

  const togglePasswordVisibility = () => {
    setShowPassword((prev) => !prev);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage(null);
    setSessionExpired(false);
    setSignupSuccess(false);

    try {
      const response = await login({
        email,
        password,
      });

      const { token, email: userEmail, roles } = response;

      localStorage.setItem('rentflow_token', token);
      localStorage.setItem('rentflow_user', JSON.stringify({ email: userEmail, roles }));

      if (roles.includes('ROLE_ADMIN')) {
        router.replace('/admin/dashboard');
      } else if (roles.includes('ROLE_LANDLORD')) {
        router.replace('/landlord/dashboard');
      } else if (roles.includes('ROLE_TENANT')) {
        router.replace('/tenant/dashboard');
      } else {
        setErrorMessage('Access denied: Unauthorized role assignment.');
      }
    } catch (error: any) {
      // The error is normalized to ApiErrorResponse by the apiClient interceptor
      setErrorMessage(error.message || 'An unexpected error occurred. Please try again.');
      console.error('Login error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4 py-8">
      <div className="w-full max-w-[440px] bg-surface-container-lowest border border-outline-variant rounded-md p-8 shadow-sm transition-shadow duration-150 hover:shadow-md">
        <div className="mb-7 text-center">
          <h1 className="text-2xl font-bold tracking-tight text-brand-deep-slate mb-2 font-sans">RentFlow</h1>
          <p className="text-sm text-on-surface-variant">Sign in to manage your property operations</p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5" noValidate={false}>
          {signupSuccess && (
            <div className="bg-secondary-container border border-secondary/20 rounded p-3 text-sm text-on-secondary-container flex items-start gap-2" role="alert">
              <svg className="w-4 h-4 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>Account created successfully! Please sign in below.</span>
            </div>
          )}

          {sessionExpired && (
            <div className="bg-primary-fixed border border-primary-fixed-dim/20 rounded p-3 text-sm text-on-primary-fixed flex items-start gap-2" role="alert">
              <svg className="w-4 h-4 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <span>Your session has expired. Please sign in again.</span>
            </div>
          )}

          {errorMessage && (
            <div className="bg-error-container border border-error/20 rounded p-3 text-sm text-on-error-container flex items-start gap-2" role="alert">
              <svg className="w-4 h-4 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>{errorMessage}</span>
            </div>
          )}

          <div className="flex flex-col gap-2">
            <label htmlFor="email" className="text-sm font-semibold text-on-surface">Email Address</label>
            <div className="relative flex items-center">
              <input
                id="email"
                type="email"
                className="w-full min-h-[44px] px-3.5 py-2.5 text-base border border-outline-variant rounded bg-surface-container-lowest text-on-surface outline-none transition duration-150 focus:border-tertiary focus:ring-2 focus:ring-focus-ring focus:ring-offset-2"
                placeholder="name@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="username"
                disabled={isLoading}
              />
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="password" className="text-sm font-semibold text-on-surface">Password</label>
            <div className="relative flex items-center w-full">
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                className="w-full min-h-[44px] pl-3.5 pr-11 py-2.5 text-base border border-outline-variant rounded bg-surface-container-lowest text-on-surface outline-none transition duration-150 focus:border-tertiary focus:ring-2 focus:ring-focus-ring focus:ring-offset-2"
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
                disabled={isLoading}
              />
              <button
                type="button"
                className="absolute right-3 p-1 cursor-pointer flex items-center justify-center text-on-surface-variant rounded hover:bg-surface-container transition duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring focus-visible:ring-offset-2"
                onClick={togglePasswordVisibility}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                disabled={isLoading}
              >
                {showPassword ? (
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="mt-2 min-h-[44px] bg-brand-deep-slate text-on-primary text-sm font-semibold rounded cursor-pointer transition duration-150 hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-focus-ring focus:ring-offset-2 disabled:bg-surface-dim disabled:text-on-surface-variant disabled:cursor-not-allowed flex items-center justify-center gap-2"
            disabled={isLoading}
          >
            {isLoading ? 'Verifying Credentials...' : 'Sign In'}
          </button>
        </form>

        <div className="text-center mt-4 text-sm text-on-surface-variant">
          Don't have an account?{' '}
          <Link href="/signup" className="text-brand-blue hover:underline font-semibold cursor-pointer focus:outline-none focus-visible:underline focus-visible:ring-2 focus-visible:ring-focus-ring focus-visible:ring-offset-2 rounded px-1">
            Sign Up
          </Link>
        </div>

        <div className="text-center mt-6 text-xs text-on-surface-variant font-sans">
          RentFlow Property &amp; Ledger Automation Engine • Phase 2
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-background">
        <h2 className="text-xl font-semibold text-brand-deep-slate font-sans">Loading Sign In...</h2>
      </div>
    }>
      <LoginContent />
    </Suspense>
  );
}
