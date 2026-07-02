import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface SessionUser {
  email: string;
  roles: string[];
}

interface AuthState {
  token: string | null;
  user: SessionUser | null;
  setSession: (token: string, user: SessionUser) => void;
  clearSession: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      user: null,
      setSession: (token, user) => set({ token, user }),
      clearSession: () => set({ token: null, user: null }),
    }),
    {
      name: 'rentflow_auth', // key in localStorage
    }
  )
);
