"use client";

import Link from "next/link";
import { ROUTES } from "@/shared/constants/routes";

export function CartEmpty() {
  return (
    <div className="card-warm mx-auto max-w-xl text-center">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-brand-cream-100 text-brand-primary-700">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={1.6}
          strokeLinecap="round"
          strokeLinejoin="round"
          className="h-8 w-8"
        >
          <circle cx="9" cy="20" r="1.4" />
          <circle cx="17" cy="20" r="1.4" />
          <path d="M3 4h2l2.2 11.2a2 2 0 0 0 2 1.6h7.6a2 2 0 0 0 2-1.5L20.5 8H6" />
        </svg>
      </div>
      <h1 className="mt-4 font-display text-2xl font-bold text-brand-earth-900">
        Your cart is empty
      </h1>
      <p className="mt-2 text-brand-earth-700/80">
        Looks like you haven&apos;t added any pickles yet. Explore our handcrafted jars and
        bring a taste of home to your table.
      </p>
      <Link href={ROUTES.products} className="btn-primary mt-6 inline-flex">
        Browse pickles
      </Link>
    </div>
  );
}
