import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface SessionUser {
  email: string;
  roles: string[];
}

interface AuthState {
  user: SessionUser | null;
  setSession: (user: SessionUser) => void;
  clearSession: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      setSession: (user) => set({ user }),
      clearSession: () => set({ user: null }),
    }),
    {
      name: 'rentflow_auth', // key in localStorage
    }
  )
);
