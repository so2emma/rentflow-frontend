"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { clearSession, getDashboardPath, setSession } from '@/lib/auth/session';
import { useAuthStore } from '@/store/authStore';
import { api } from '@/services/api';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRole: string;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, allowedRole }) => {
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [loading, setLoading] = useState(true);

  const user = useAuthStore(s => s.user);

  useEffect(() => {
    const checkAuth = async () => {
      let currentUser = user;

      // If no user in store, try to fetch from /api/auth/me (in case of hard reload with cookies intact)
      if (!currentUser) {
        try {
          const res = await api.get('/api/auth/me');
          currentUser = { email: res.data.email, roles: res.data.roles };
          setSession(currentUser);
        } catch (e) {
          router.replace('/login');
          return;
        }
      }

      if (!currentUser) {
        router.replace('/login');
        return;
      }

      if (!currentUser.roles?.includes(allowedRole)) {
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
    };

    checkAuth();
  }, [router, allowedRole, user]);

  if (loading) {
    return (
      <div className="w-full flex items-center justify-center min-h-screen bg-background">
        <h2 className="text-xl font-semibold animate-pulse text-brand-deep-slate">
          Verifying session…
        </h2>
      </div>
    );
  }

  return isAuthorized ? <>{children}</> : null;
};
