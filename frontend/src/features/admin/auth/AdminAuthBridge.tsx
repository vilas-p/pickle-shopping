"use client";

import { useEffect } from "react";
import { bindAuthTokenGetter } from "@/shared/lib/http";
import { useAdminAuthStore } from "./store";

export function AdminAuthBridge() {
  useEffect(() => {
    bindAuthTokenGetter("admin", () => {
      const { token, expiresAt } = useAdminAuthStore.getState();
      if (!token || !expiresAt || Date.now() >= expiresAt) return null;
      return token;
    });
  }, []);

  return null;
}