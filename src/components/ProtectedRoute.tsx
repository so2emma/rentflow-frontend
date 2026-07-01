"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getToken, getUser, clearSession, getDashboardPath } from '@/lib/auth/session';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRole: string;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, allowedRole }) => {
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = getToken();
    const user = getUser();

    if (!token || !user) {
      router.replace('/login');
      return;
    }

    if (!user.roles?.includes(allowedRole)) {
      // Redirect to the user's correct dashboard rather than logging them out
      const correctPath = getDashboardPath();
      if (correctPath !== '/login') {
        router.replace(correctPath);
      } else {
        clearSession();
        router.replace('/login');
      }
    } else {
      setIsAuthorized(true);
    }

    setLoading(false);
  }, [router, allowedRole]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <h2 className="text-xl font-semibold animate-pulse text-brand-deep-slate">
          Verifying session…
        </h2>
      </div>
    );
  }

  return isAuthorized ? <>{children}</> : null;
};
