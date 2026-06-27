"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('rentflow_token');
    const userString = localStorage.getItem('rentflow_user');

    if (token && userString) {
      try {
        const user = JSON.parse(userString);
        if (user.roles?.includes('ROLE_ADMIN')) {
          router.replace('/admin/dashboard');
          return;
        }
        if (user.roles?.includes('ROLE_LANDLORD')) {
          router.replace('/landlord/dashboard');
          return;
        }
        if (user.roles?.includes('ROLE_TENANT')) {
          router.replace('/tenant/dashboard');
          return;
        }
      } catch (e) {
        // ignore
      }
    }
    router.replace('/login');
  }, [router]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <div className="text-center">
        <h2 className="text-xl font-semibold animate-pulse text-brand-deep-slate">Loading RentFlow...</h2>
      </div>
    </div>
  );
}
