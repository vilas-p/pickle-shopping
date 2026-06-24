"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import type { AdminSession, AdminUserSummary } from "./types";

export const ADMIN_AUTH_STORAGE_KEY = "aap-admin-auth-v1";

interface AdminAuthState {
  token: string | null;
  user: AdminUserSummary | null;
  expiresAt: number | null;
  hasHydrated: boolean;
  setHasHydrated: (value: boolean) => void;
  setSession: (session: AdminSession) => void;
  clear: () => void;
  isAuthenticated: () => boolean;
}

export const useAdminAuthStore = create<AdminAuthState>()(
  persist(
    (set, get) => ({
      token: null,
      user: null,
      expiresAt: null,
      hasHydrated: false,
      setHasHydrated: (value) => set({ hasHydrated: value }),
      setSession: (session) =>
        set({
          token: session.token,
          user: session.user,
          expiresAt: Date.now() + session.expiresInMs,
        }),
      clear: () => set({ token: null, user: null, expiresAt: null }),
      isAuthenticated: () => {
        const { token, expiresAt } = get();
        if (!token || !expiresAt) return false;
        return Date.now() < expiresAt;
      },
    }),
    {
      name: ADMIN_AUTH_STORAGE_KEY,
      storage: createJSONStorage(() => localStorage),
      version: 1,
      partialize: (state) => ({
        token: state.token,
        user: state.user,
        expiresAt: state.expiresAt,
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    },
  ),
);

export const selectAdminUser = (state: AdminAuthState) => state.user;