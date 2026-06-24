"use client";

import { useEffect } from "react";
import { bindAuthTokenGetter } from "@/shared/lib/http";
import { useAuthStore } from "./store";
import { useCartStore } from "@/features/cart/store";

/**
 * Mount-once bridge that lets the framework-agnostic {@code http} helper read the auth
 * token from the Zustand store. Without it, requests with {@code auth: true} send no token.
 *
 * Rendered globally from the root layout so it survives across pages on the client.
 */
export function AuthBridge() {
  useEffect(() => {
    const syncCartOwner = () => {
      const authState = useAuthStore.getState();
      const ownerKey = authState.customer?.id != null && authState.isAuthenticated()
        ? `customer:${authState.customer.id}`
        : "guest";
      useCartStore.getState().setOwnerKey(ownerKey);
    };

    bindAuthTokenGetter("customer", () => {
      const { token, expiresAt } = useAuthStore.getState();
      if (!token || !expiresAt || Date.now() >= expiresAt) return null;
      return token;
    });

    syncCartOwner();

    const unsubscribe = useAuthStore.subscribe(() => {
      syncCartOwner();
    });

    return () => {
      unsubscribe();
    };
  }, []);
  return null;
}
