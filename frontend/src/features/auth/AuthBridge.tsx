"use client";

import { useEffect } from "react";
import { bindAuthTokenGetter } from "@/shared/lib/http";
import { useAuthStore } from "./store";
import { useCartStore } from "@/features/cart/store";
import { syncSessionCookie } from "@/shared/lib/authSession";

/**
 * Mount-once bridge that lets the framework-agnostic {@code http} helper read the auth
 * token from the Zustand store. Without it, requests with {@code auth: true} send no token.
 *
 * Rendered globally from the root layout so it survives across pages on the client.
 */
export function AuthBridge() {
  useEffect(() => {
    const authState = useAuthStore.getState();
    if (!authState.isAuthenticated() && authState.token) {
      authState.clear();
    }

    const syncCartOwner = () => {
      const currentAuthState = useAuthStore.getState();
      const ownerKey = currentAuthState.customer?.id != null && currentAuthState.isAuthenticated()
        ? `customer:${currentAuthState.customer.id}`
        : "guest";
      useCartStore.getState().setOwnerKey(ownerKey);
    };

    bindAuthTokenGetter("customer", () => {
      const { token, expiresAt } = useAuthStore.getState();
      if (!token || !expiresAt || Date.now() >= expiresAt) return null;
      return token;
    });

    syncSessionCookie("customer", authState.expiresAt, authState.isAuthenticated());

    syncCartOwner();

    const unsubscribe = useAuthStore.subscribe(() => {
      const currentAuthState = useAuthStore.getState();
      syncSessionCookie("customer", currentAuthState.expiresAt, currentAuthState.isAuthenticated());
      syncCartOwner();
    });

    return () => {
      unsubscribe();
    };
  }, []);
  return null;
}
