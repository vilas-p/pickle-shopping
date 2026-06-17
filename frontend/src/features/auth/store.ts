"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { AuthSession, CustomerSummary } from "./types";

export const AUTH_STORAGE_KEY = "aap-auth-v1";

interface AuthState {
  token: string | null;
  customer: CustomerSummary | null;
  expiresAt: number | null;
  hasHydrated: boolean;
  setHasHydrated: (v: boolean) => void;
  setSession: (session: AuthSession) => void;
  setCustomer: (customer: CustomerSummary) => void;
  clear: () => void;
  isAuthenticated: () => boolean;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      token: null,
      customer: null,
      expiresAt: null,
      hasHydrated: false,
      setHasHydrated: (v) => set({ hasHydrated: v }),
      setSession: (session) =>
        set({
          token: session.accessToken,
          customer: session.customer,
          expiresAt: Date.now() + session.expiresInMs,
        }),
      setCustomer: (customer) => set({ customer }),
      clear: () => set({ token: null, customer: null, expiresAt: null }),
      isAuthenticated: () => {
        const { token, expiresAt } = get();
        if (!token || !expiresAt) return false;
        return Date.now() < expiresAt;
      },
    }),
    {
      name: AUTH_STORAGE_KEY,
      storage: createJSONStorage(() => localStorage),
      version: 1,
      partialize: (state) => ({
        token: state.token,
        customer: state.customer,
        expiresAt: state.expiresAt,
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    }
  )
);

export const selectToken = (s: AuthState) => s.token;
export const selectCustomer = (s: AuthState) => s.customer;
