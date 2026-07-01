"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRole: string;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, allowedRole }) => {
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('rentflow_token');
    const userString = localStorage.getItem('rentflow_user');

    if (!token || !userString) {
      router.replace('/login');
      return;
    }

    try {
      const user = JSON.parse(userString);
      if (!user.roles || !user.roles.includes(allowedRole)) {
        if (user.roles.includes('ROLE_ADMIN')) {
          router.replace('/admin/dashboard');
        } else if (user.roles.includes('ROLE_LANDLORD')) {
          router.replace('/landlord/dashboard');
        } else if (user.roles.includes('ROLE_TENANT')) {
          router.replace('/tenant/dashboard');
        } else {
          localStorage.removeItem('rentflow_token');
          localStorage.removeItem('rentflow_user');
          router.replace('/login');
        }
      } else {
        setIsAuthorized(true);
      }
    } catch {
      localStorage.removeItem('rentflow_token');
      localStorage.removeItem('rentflow_user');
      router.replace('/login');
    } finally {
      setLoading(false);
    }
  }, [router, allowedRole]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="text-center">
          <h2 className="text-xl font-semibold animate-pulse text-brand-deep-slate">Verifying session...</h2>
        </div>
      </div>
    );
  }

  return isAuthorized ? <>{children}</> : null;
};
