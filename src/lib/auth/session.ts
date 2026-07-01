/**
 * lib/auth/session.ts
 *
 * Centralized client-side session helper.
 * All reads and writes to the JWT token and user object go through
 * this module — no scattered localStorage calls across pages.
 *
 * Note: This is the client-side implementation. A future migration to
 * Next.js middleware (middleware.ts) + HttpOnly cookies would replace
 * this module with a server-side session handler.
 */

export const SESSION_KEYS = {
  token: 'rentflow_token',
  user: 'rentflow_user',
} as const;

export interface SessionUser {
  email: string;
  roles: string[];
}

/** Returns the JWT bearer token, or null if not authenticated. */
export function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(SESSION_KEYS.token);
}

/** Returns the parsed user object, or null if not set / parse error. */
export function getUser(): SessionUser | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(SESSION_KEYS.user);
    if (!raw) return null;
    return JSON.parse(raw) as SessionUser;
  } catch {
    return null;
  }
}

/** Persists the JWT token and user object after a successful login. */
export function setSession(token: string, user: SessionUser): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(SESSION_KEYS.token, token);
  localStorage.setItem(SESSION_KEYS.user, JSON.stringify(user));
}

/** Removes the session (logout). */
export function clearSession(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(SESSION_KEYS.token);
  localStorage.removeItem(SESSION_KEYS.user);
}

/** Returns true when a token is present. Does NOT validate expiry. */
export function isAuthenticated(): boolean {
  return getToken() !== null;
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
