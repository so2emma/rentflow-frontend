/**
 * config/env.ts
 *
 * Single source of truth for all environment variables.
 * Validates required vars at import time — fails fast at build time
 * rather than silently falling back at runtime.
 *
 * Add new vars here; never call process.env.X directly elsewhere.
 */

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    // In the browser, NEXT_PUBLIC_ vars may not exist — only hard-fail on server.
    if (typeof window === 'undefined') {
      throw new Error(`[RentFlow] Missing required environment variable: ${name}`);
    }
  }
  return value ?? '';
}

export const env = {
  /**
   * Base URL of the backend API (Spring Cloud Gateway).
   * On the server this is the internal URL; on the client it is empty
   * (requests go to the Next.js server's relative paths or the gateway).
   */
  backendApiUrl:
    typeof window === 'undefined'
      ? process.env.BACKEND_API_URL ?? 'http://localhost:8080'
      : '',

  /**
   * App name — safe to expose to the client.
   */
  appName: process.env.NEXT_PUBLIC_APP_NAME ?? 'RentFlow',

  /**
   * Deployment environment (development | staging | production).
   */
  nodeEnv: process.env.NODE_ENV ?? 'development',
} as const;
