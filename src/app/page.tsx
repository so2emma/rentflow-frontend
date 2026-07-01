"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getDashboardPath, isAuthenticated } from '@/lib/auth/session';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    if (isAuthenticated()) {
      router.replace(getDashboardPath());
    } else {
      router.replace('/login');
    }
  }, [router]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <h2 className="text-xl font-semibold animate-pulse text-brand-deep-slate">Loading RentFlow…</h2>
    </div>
  );
}
