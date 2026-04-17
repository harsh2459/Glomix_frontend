'use client';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { IUser, IAdmin } from '../types';
import { apiGet, apiPost } from '../lib/api';

interface AuthStore {
  user: IUser | null;
  admin: IAdmin | null;
  isLoading: boolean;
  fetchUser: () => Promise<void>;
  fetchAdmin: () => Promise<void>;
  logout: () => Promise<void>;
  logoutAdmin: () => Promise<void>;
  setUser: (user: IUser | null) => void;
  setAdmin: (admin: IAdmin | null) => void;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      user: null,
      admin: null,
      isLoading: false,

      fetchUser: async () => {
        set({ isLoading: true });
        try {
          const data = await apiGet<{ user: IUser }>('/auth/me');
          set({ user: data.user });
        } catch {
          set({ user: null });
        } finally {
          set({ isLoading: false });
        }
      },

      fetchAdmin: async () => {
        set({ isLoading: true });
        try {
          const data = await apiGet<{ admin: IAdmin }>('/admin/auth/me');
          set({ admin: data.admin });
        } catch {
          set({ admin: null });
        } finally {
          set({ isLoading: false });
        }
      },

      logout: async () => {
        try {
          await apiPost('/auth/logout');
        } finally {
          set({ user: null });
        }
      },

      logoutAdmin: async () => {
        try {
          await apiPost('/admin/auth/logout');
        } finally {
          set({ admin: null });
        }
      },

      setUser: (user) => set({ user }),
      setAdmin: (admin) => set({ admin }),
    }),
    { name: 'glomix-auth', skipHydration: true }
  )
);
