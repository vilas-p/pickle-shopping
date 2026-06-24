"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { adminAuthApi } from "../api";
import { useAdminAuthStore } from "../store";
import { ROUTES } from "@/shared/constants/routes";
import { useApiSubmit } from "@/shared/hooks/useApiSubmit";

export function AdminLoginForm() {
  const router = useRouter();
  const search = useSearchParams();
  const setSession = useAdminAuthStore((state) => state.setSession);
  const hasHydrated = useAdminAuthStore((state) => state.hasHydrated);
  const isAuthenticated = useAdminAuthStore((state) => state.isAuthenticated());

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const submit = useApiSubmit(adminAuthApi.login);

  useEffect(() => {
    if (!hasHydrated || !isAuthenticated) return;
    router.replace(search.get("redirect") ?? ROUTES.adminDashboard);
  }, [hasHydrated, isAuthenticated, router, search]);

  const onSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    const session = await submit.submit({
      email: email.trim().toLowerCase(),
      password,
    });

    if (!session) return;

    setSession(session);
    router.push(search.get("redirect") ?? ROUTES.adminDashboard);
  };

  return (
    <form onSubmit={onSubmit} className="card-warm space-y-5">
      <div>
        <label htmlFor="admin-email" className="label-field">Admin email</label>
        <input
          id="admin-email"
          type="email"
          autoComplete="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="admin@appaammas.in"
          required
          className="input-field"
        />
      </div>

      <div>
        <label htmlFor="admin-password" className="label-field">Password</label>
        <input
          id="admin-password"
          type="password"
          autoComplete="current-password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          placeholder="Enter your password"
          required
          className="input-field"
        />
      </div>

      {submit.status === "error" && (
        <p role="alert" className="text-sm text-red-700">{submit.message}</p>
      )}

      <button
        type="submit"
        disabled={submit.status === "submitting"}
        className="btn-primary w-full justify-center disabled:opacity-60"
      >
        {submit.status === "submitting" ? "Signing in…" : "Sign in to admin"}
      </button>
    </form>
  );
}