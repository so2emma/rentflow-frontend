"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/services/api';

export default function SignUpPage() {
  const router = useRouter();

  // Basic Details
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [role, setRole] = useState<'ADMIN' | 'LANDLORD' | 'TENANT'>('TENANT');

  // Landlord Details
  const [bankCode, setBankCode] = useState('');
  const [bankAccountNumber, setBankAccountNumber] = useState('');
  const [bankAccountName, setBankAccountName] = useState('');

  // Tenant Details
  const [bvn, setBvn] = useState('');

  // UI state
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const validateForm = (): boolean => {
    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setErrorMessage('Please enter a valid email address.');
      return false;
    }

    if (password.length < 6) {
      setErrorMessage('Password must be at least 6 characters.');
      return false;
    }

    if (!firstName.trim() || !lastName.trim()) {
      setErrorMessage('First and Last Names are required.');
      return false;
    }

    if (!phoneNumber.trim()) {
      setErrorMessage('Phone number is required.');
      return false;
    }

    // Role-specific validation
    if (role === 'LANDLORD') {
      if (!bankCode) {
        setErrorMessage('Please select your settlement bank.');
        return false;
      }
      if (!/^\d{10}$/.test(bankAccountNumber)) {
        setErrorMessage('Bank Account Number must be exactly 10 digits.');
        return false;
      }
      if (!bankAccountName.trim()) {
        setErrorMessage('Settlement Account Name is required.');
        return false;
      }
    } else if (role === 'TENANT') {
      if (!/^\d{11}$/.test(bvn)) {
        setErrorMessage('BVN must be exactly 11 digits.');
        return false;
      }
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    // Build Payload
    const payload: any = {
      email,
      password,
      role,
      firstName,
      lastName,
      phoneNumber,
    };

    if (role === 'LANDLORD') {
      payload.landlordDetails = {
        bankCode,
        bankAccountNumber,
        bankAccountName,
      };
    } else if (role === 'TENANT') {
      payload.tenantDetails = {
        bvn,
      };
    }

    try {
      await api.post('/api/auth/signup', payload);
      // On success, redirect to login page with a success query param
      router.push('/login?signup_success=true');
    } catch (error: any) {
      if (error.response && error.response.data) {
        setErrorMessage(error.response.data.message || 'Signup failed. Please try again.');
      } else {
        setErrorMessage('Cannot connect to the server. Please check your internet connection.');
      }
      console.error('Signup error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-surface px-4 py-8">
      <div className="w-full max-w-[520px] bg-surface-container-lowest border border-outline-variant rounded-lg p-8 shadow-md">
        <div className="mb-7 text-center">
          <h1 className="text-2xl font-bold tracking-tight text-brand-deep-slate mb-2">Create Account</h1>
          <p className="text-sm text-on-surface-variant">Register your RentFlow portal profile</p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          {errorMessage && (
            <div className="bg-error-container border border-[#fda4af] rounded p-3 text-sm text-on-error-container flex items-start gap-2" role="alert">
              <svg className="w-4 h-4 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>{errorMessage}</span>
            </div>
          )}

          {/* First & Last Name row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <label htmlFor="firstName" className="text-sm font-semibold text-on-surface">First Name</label>
              <input
                id="firstName"
                type="text"
                className="w-full min-h-[44px] px-3.5 py-2.5 text-base border border-outline-variant rounded-[6px] bg-surface-container-lowest text-on-surface outline-none transition focus:border-brand-blue focus:ring-3 focus:ring-blue-500/15"
                placeholder="John"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>
            <div className="flex flex-col gap-2">
              <label htmlFor="lastName" className="text-sm font-semibold text-on-surface">Last Name</label>
              <input
                id="lastName"
                type="text"
                className="w-full min-h-[44px] px-3.5 py-2.5 text-base border border-outline-variant rounded-[6px] bg-surface-container-lowest text-on-surface outline-none transition focus:border-brand-blue focus:ring-3 focus:ring-blue-500/15"
                placeholder="Doe"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>
          </div>

          {/* Email Address */}
          <div className="flex flex-col gap-2">
            <label htmlFor="email" className="text-sm font-semibold text-on-surface">Email Address</label>
            <input
              id="email"
              type="email"
              className="w-full min-h-[44px] px-3.5 py-2.5 text-base border border-outline-variant rounded-[6px] bg-surface-container-lowest text-on-surface outline-none transition focus:border-brand-blue focus:ring-3 focus:ring-blue-500/15"
              placeholder="name@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={isLoading}
            />
          </div>

          {/* Password & Phone row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <label htmlFor="password" className="text-sm font-semibold text-on-surface">Password</label>
              <input
                id="password"
                type="password"
                className="w-full min-h-[44px] px-3.5 py-2.5 text-base border border-outline-variant rounded-[6px] bg-surface-container-lowest text-on-surface outline-none transition focus:border-brand-blue focus:ring-3 focus:ring-blue-500/15"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>
            <div className="flex flex-col gap-2">
              <label htmlFor="phone" className="text-sm font-semibold text-on-surface">Phone Number</label>
              <input
                id="phone"
                type="tel"
                className="w-full min-h-[44px] px-3.5 py-2.5 text-base border border-outline-variant rounded-[6px] bg-surface-container-lowest text-on-surface outline-none transition focus:border-brand-blue focus:ring-3 focus:ring-blue-500/15"
                placeholder="+23480..."
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>
          </div>

          {/* Role Dropdown */}
          <div className="flex flex-col gap-2">
            <label htmlFor="role" className="text-sm font-semibold text-on-surface">Registering As</label>
            <select
              id="role"
              className="w-full min-h-[44px] px-3.5 py-2.5 text-base border border-outline-variant rounded-[6px] bg-surface-container-lowest text-on-surface outline-none transition focus:border-brand-blue focus:ring-3 focus:ring-blue-500/15 cursor-pointer"
              value={role}
              onChange={(e) => {
                setRole(e.target.value as any);
                setErrorMessage(null);
              }}
              disabled={isLoading}
            >
              <option value="TENANT">Tenant (Rent Payer)</option>
              <option value="LANDLORD">Landlord (Property Owner)</option>
              <option value="ADMIN">Administrator</option>
            </select>
          </div>

          {/* Conditional Sections */}
          {role === 'LANDLORD' && (
            <div className="flex flex-col gap-4 border-t border-outline-variant pt-4 mt-2">
              <h2 className="text-base font-bold text-brand-deep-slate pb-1">Landlord Payout Settlement Details</h2>
              
              <div className="flex flex-col gap-2">
                <label htmlFor="bankCode" className="text-sm font-semibold text-on-surface">Settlement Bank</label>
                <select
                  id="bankCode"
                  className="w-full min-h-[44px] px-3.5 py-2.5 text-base border border-outline-variant rounded-[6px] bg-surface-container-lowest text-on-surface outline-none transition focus:border-brand-blue focus:ring-3 focus:ring-blue-500/15 cursor-pointer"
                  value={bankCode}
                  onChange={(e) => setBankCode(e.target.value)}
                  required
                  disabled={isLoading}
                >
                  <option value="">-- Select Bank --</option>
                  <option value="058">GTBank (058)</option>
                  <option value="057">Zenith Bank (057)</option>
                  <option value="044">Access Bank (044)</option>
                  <option value="011">First Bank (011)</option>
                  <option value="033">United Bank for Africa (033)</option>
                </select>
              </div>

              <div className="flex flex-col gap-2">
                <label htmlFor="accountNumber" className="text-sm font-semibold text-on-surface">Bank Account Number</label>
                <input
                  id="accountNumber"
                  type="text"
                  pattern="\d{10}"
                  maxLength={10}
                  className="w-full min-h-[44px] px-3.5 py-2.5 text-base border border-outline-variant rounded-[6px] bg-surface-container-lowest text-on-surface outline-none transition focus:border-brand-blue focus:ring-3 focus:ring-blue-500/15"
                  placeholder="10-digit Account Number"
                  value={bankAccountNumber}
                  onChange={(e) => setBankAccountNumber(e.target.value.replace(/\D/g, ''))}
                  required
                  disabled={isLoading}
                />
              </div>

              <div className="flex flex-col gap-2">
                <label htmlFor="accountName" className="text-sm font-semibold text-on-surface">Settlement Account Name</label>
                <input
                  id="accountName"
                  type="text"
                  className="w-full min-h-[44px] px-3.5 py-2.5 text-base border border-outline-variant rounded-[6px] bg-surface-container-lowest text-on-surface outline-none transition focus:border-brand-blue focus:ring-3 focus:ring-blue-500/15"
                  placeholder="Account Name (e.g. John Doe Enterprises)"
                  value={bankAccountName}
                  onChange={(e) => setBankAccountName(e.target.value)}
                  required
                  disabled={isLoading}
                />
              </div>
            </div>
          )}

          {role === 'TENANT' && (
            <div className="flex flex-col gap-4 border-t border-outline-variant pt-4 mt-2">
              <h2 className="text-base font-bold text-brand-deep-slate pb-1">Tenant Verification Details</h2>
              <div className="flex flex-col gap-2">
                <label htmlFor="bvn" className="text-sm font-semibold text-on-surface">Bank Verification Number (BVN)</label>
                <input
                  id="bvn"
                  type="text"
                  pattern="\d{11}"
                  maxLength={11}
                  className="w-full min-h-[44px] px-3.5 py-2.5 text-base border border-outline-variant rounded-[6px] bg-surface-container-lowest text-on-surface outline-none transition focus:border-brand-blue focus:ring-3 focus:ring-blue-500/15"
                  placeholder="11-digit BVN"
                  value={bvn}
                  onChange={(e) => setBvn(e.target.value.replace(/\D/g, ''))}
                  required
                  disabled={isLoading}
                />
              </div>
            </div>
          )}

          <button
            type="submit"
            className="mt-2 min-h-[44px] bg-brand-deep-slate text-on-primary text-sm font-semibold rounded-[6px] cursor-pointer transition hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-blue focus:ring-offset-2 disabled:bg-surface-dim disabled:text-on-surface-variant disabled:cursor-not-allowed flex items-center justify-center"
            disabled={isLoading}
          >
            {isLoading ? 'Creating Account...' : 'Sign Up'}
          </button>
        </form>

        <div className="text-center mt-6 text-sm text-on-surface-variant">
          Already have an account?{' '}
          <Link href="/login" className="text-brand-blue hover:underline font-semibold cursor-pointer">
            Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}
