/**
 * lib/auth/session.ts
 *
 * Centralized client-side session helper.
 */

import { useAuthStore, SessionUser } from '@/store/authStore';
import { logout } from '@/lib/api/auth';

export type { SessionUser };

/** Returns the parsed user object, or null if not set / parse error. */
export function getUser(): SessionUser | null {
  return useAuthStore.getState().user;
}

/** Persists the user object after a successful login. */
export function setSession(user: SessionUser): void {
  useAuthStore.getState().setSession(user);
}

/** Removes the session locally (clears zustand store). */
export function clearSession(): void {
  useAuthStore.getState().clearSession();
}

/** 
 * Fully logs out the user. 
 * Calls the backend to invalidate the session, clears local state,
 * and forces a hard navigation to /login to clear all React state 
 * and prevent the back button from rendering cached data.
 */
export async function logoutUser(): Promise<void> {
  try {
    await logout();
  } catch (err) {
    // Ignore backend errors on logout, we still want to log them out locally
  }
  clearSession();
  
  if (typeof window !== 'undefined') {
    window.location.href = '/login';
  }
}

/** Returns true when a user is present. */
export function isAuthenticated(): boolean {
  return getUser() !== null;
}

/** Returns true when the user has the given role string. */
export function hasRole(role: string): boolean {
  return getUser()?.roles?.includes(role) ?? false;
}

/**
 * Returns the primary dashboard path for the current user's role.
 * Defaults to '/login' when not authenticated.
 */
export function getDashboardPath(): string {
  const user = getUser();
  if (!user) return '/login';
  if (user.roles.includes('ROLE_ADMIN')) return '/admin/dashboard';
  if (user.roles.includes('ROLE_LANDLORD')) return '/landlord/dashboard';
  if (user.roles.includes('ROLE_TENANT')) return '/tenant/dashboard';
  return '/login';
}
