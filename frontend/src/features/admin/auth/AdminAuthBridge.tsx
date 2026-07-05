"use client";

import { useEffect } from "react";
import { bindAuthTokenGetter } from "@/shared/lib/http";
import { useAdminAuthStore } from "./store";
import { syncSessionCookie } from "@/shared/lib/authSession";

export function AdminAuthBridge() {
  useEffect(() => {
    const authState = useAdminAuthStore.getState();
    if (!authState.isAuthenticated() && authState.token) {
      authState.clear();
    }

    bindAuthTokenGetter("admin", () => {
      const { token, expiresAt } = useAdminAuthStore.getState();
      if (!token || !expiresAt || Date.now() >= expiresAt) return null;
      return token;
    });

    syncSessionCookie("admin", authState.expiresAt, authState.isAuthenticated());

    const unsubscribe = useAdminAuthStore.subscribe(() => {
      const currentAuthState = useAdminAuthStore.getState();
      syncSessionCookie("admin", currentAuthState.expiresAt, currentAuthState.isAuthenticated());
    });

    return () => {
      unsubscribe();
    };
  }, []);

  return null;
}