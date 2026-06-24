"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ROUTES } from "@/shared/constants/routes";
import { selectAdminUser, useAdminAuthStore } from "@/features/admin/auth/store";

const navItems = [
  { href: ROUTES.adminDashboard, label: "Dashboard" },
  { href: ROUTES.adminOrders, label: "Orders" },
];

export function AdminShell({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const user = useAdminAuthStore(selectAdminUser);
  const clear = useAdminAuthStore((state) => state.clear);

  return (
    <section className="min-h-screen bg-brand-cream-100/70 py-10">
      <div className="container-page space-y-6">
        <div className="card-dark flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="eyebrow">Admin Console</p>
            <h1 className="font-display text-3xl font-bold">Manage Appa & Amma&apos;s Pickles</h1>
            <p className="mt-2 text-sm text-brand-cream-50/80">
              Signed in as {user?.fullName ?? "Admin"}.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            {navItems.map((item) => {
              const active = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={active ? "btn-primary" : "btn-secondary !bg-white/10 !text-white hover:!bg-white/20"}
                >
                  {item.label}
                </Link>
              );
            })}
            <button
              type="button"
              onClick={() => {
                clear();
                router.push(ROUTES.adminLogin);
              }}
              className="rounded-full border border-white/20 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
            >
              Sign out
            </button>
          </div>
        </div>
        {children}
      </div>
    </section>
  );
}