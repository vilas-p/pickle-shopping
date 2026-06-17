"use client";

import { useEffect } from "react";
import { bindAuthTokenGetter } from "@/shared/lib/http";
import { useAuthStore } from "./store";

/**
 * Mount-once bridge that lets the framework-agnostic {@code http} helper read the auth
 * token from the Zustand store. Without it, requests with {@code auth: true} send no token.
 *
 * Rendered globally from the root layout so it survives across pages on the client.
 */
export function AuthBridge() {
  useEffect(() => {
    bindAuthTokenGetter(() => {
      const { token, expiresAt } = useAuthStore.getState();
      if (!token || !expiresAt || Date.now() >= expiresAt) return null;
      return token;
    });
  }, []);
  return null;
}
