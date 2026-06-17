"use client";

import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore, selectCustomer } from "@/features/auth/store";
import { ROUTES } from "@/shared/constants/routes";

export function AccountButton() {
  const router = useRouter();
  const customer = useAuthStore(selectCustomer);
  const hasHydrated = useAuthStore((s) => s.hasHydrated);
  const clear = useAuthStore((s) => s.clear);
  const isAuthed = useAuthStore((s) => s.isAuthenticated());
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    window.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  if (!hasHydrated || !isAuthed) {
    return (
      <Link
        href={ROUTES.authLogin}
        className="hidden items-center rounded-full px-3 py-2 text-sm font-medium text-brand-earth-700 transition hover:bg-brand-cream-100 hover:text-brand-primary-700 sm:inline-flex"
      >
        Sign in
      </Link>
    );
  }

  const initial = (customer?.fullName ?? "?").charAt(0).toUpperCase();

  return (
    <div ref={menuRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label="Account menu"
        className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-primary-50 text-sm font-semibold text-brand-primary-700 transition hover:bg-brand-primary-100"
      >
        {initial}
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 top-full z-50 mt-2 w-56 rounded-2xl border border-brand-cream-200 bg-white p-2 shadow-warm-lg"
        >
          <div className="px-3 py-2">
            <p className="truncate text-sm font-semibold text-brand-earth-900">
              {customer?.fullName}
            </p>
            <p className="truncate text-xs text-brand-earth-700/70">
              {customer?.phone || customer?.email}
            </p>
          </div>
          <div className="my-1 border-t border-brand-cream-200" />
          <Link
            href={ROUTES.account}
            role="menuitem"
            onClick={() => setOpen(false)}
            className="block rounded-xl px-3 py-2 text-sm text-brand-earth-800 hover:bg-brand-cream-100"
          >
            My account
          </Link>
          <Link
            href={ROUTES.accountOrders}
            role="menuitem"
            onClick={() => setOpen(false)}
            className="block rounded-xl px-3 py-2 text-sm text-brand-earth-800 hover:bg-brand-cream-100"
          >
            My orders
          </Link>
          <button
            type="button"
            role="menuitem"
            onClick={() => {
              clear();
              setOpen(false);
              router.push(ROUTES.home);
            }}
            className="block w-full rounded-xl px-3 py-2 text-left text-sm text-brand-earth-800 hover:bg-brand-cream-100"
          >
            Sign out
          </button>
        </div>
      )}
    </div>
  );
}
