"use client";

import Link from "next/link";
import { useCartStore, selectCount } from "../store";
import { ROUTES } from "@/shared/constants/routes";

export function CartIcon({ className = "" }: { className?: string }) {
  const count = useCartStore(selectCount);
  const hasHydrated = useCartStore((s) => s.hasHydrated);

  return (
    <Link
      href={ROUTES.cart}
      aria-label={`Open cart${hasHydrated && count > 0 ? `, ${count} item${count === 1 ? "" : "s"}` : ""}`}
      className={`relative inline-flex h-10 w-10 items-center justify-center rounded-full text-brand-earth-800 transition hover:bg-brand-cream-100 hover:text-brand-primary-700 ${className}`}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.8}
        strokeLinecap="round"
        strokeLinejoin="round"
        className="h-5 w-5"
      >
        <circle cx="9" cy="20" r="1.4" />
        <circle cx="17" cy="20" r="1.4" />
        <path d="M3 4h2l2.2 11.2a2 2 0 0 0 2 1.6h7.6a2 2 0 0 0 2-1.5L20.5 8H6" />
      </svg>
      {hasHydrated && count > 0 && (
        <span className="absolute -right-0.5 -top-0.5 inline-flex h-5 min-w-[20px] items-center justify-center rounded-full bg-brand-primary-600 px-1 text-[11px] font-semibold leading-none text-white shadow-warm">
          {count > 99 ? "99+" : count}
        </span>
      )}
    </Link>
  );
}
