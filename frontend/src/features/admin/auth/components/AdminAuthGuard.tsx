"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { ROUTES } from "@/shared/constants/routes";
import { useAdminAuthStore } from "../store";

export function AdminAuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const hasHydrated = useAdminAuthStore((state) => state.hasHydrated);
  const isAuthenticated = useAdminAuthStore((state) => state.isAuthenticated());

  useEffect(() => {
    if (!hasHydrated || isAuthenticated) return;

    const redirect = pathname ? `?redirect=${encodeURIComponent(pathname)}` : "";
    router.replace(`${ROUTES.adminLogin}${redirect}`);
  }, [hasHydrated, isAuthenticated, pathname, router]);

  if (!hasHydrated) {
    return (
      <div className="container-page py-12">
        <div className="card-warm h-48 animate-pulse" />
      </div>
    );
  }

  if (!isAuthenticated) return null;

  return <>{children}</>;
}