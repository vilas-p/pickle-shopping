"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/features/auth/store";
import { ROUTES } from "@/shared/constants/routes";

/**
 * Client-side auth guard. If the customer is not authenticated, redirects to login.
 * Shows a loading skeleton while hydrating from localStorage.
 */
export function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const hasHydrated = useAuthStore((s) => s.hasHydrated);
  const isAuth = useAuthStore((s) => s.isAuthenticated());
  const token = useAuthStore((s) => s.token);

  useEffect(() => {
    if (hasHydrated && !isAuth) {
      router.replace(ROUTES.authLogin);
    }
  }, [hasHydrated, isAuth, router]);

  if (!hasHydrated) {
    return (
      <div className="container-page py-12">
        <div className="h-64 animate-pulse rounded-2xl bg-brand-cream-100" />
      </div>
    );
  }

  if (!token) return null;

  return <>{children}</>;
}
