"use client";

import Link from "next/link";
import { AuthGuard } from "@/features/auth/components/AuthGuard";
import { useAuthStore, selectCustomer } from "@/features/auth/store";
import { ROUTES } from "@/shared/constants/routes";

export default function AccountPage() {
  return (
    <AuthGuard>
      <AccountContent />
    </AuthGuard>
  );
}

function AccountContent() {
  const customer = useAuthStore(selectCustomer);
  const clear = useAuthStore((s) => s.clear);

  return (
    <section className="container-page py-12">
      <header className="mb-8">
        <h1 className="font-display text-3xl font-bold text-brand-earth-900 sm:text-4xl">
          My account
        </h1>
        {customer && (
          <p className="mt-2 text-brand-earth-700/80">
            Welcome back, {customer.fullName}!
          </p>
        )}
      </header>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <Link
          href={ROUTES.accountOrders}
          className="card-warm transition hover:shadow-lg"
        >
          <h2 className="font-display text-xl font-bold text-brand-earth-900">My orders</h2>
          <p className="mt-2 text-sm text-brand-earth-700/70">
            View order history and track deliveries.
          </p>
        </Link>

        <Link
          href={ROUTES.trackOrder}
          className="card-warm transition hover:shadow-lg"
        >
          <h2 className="font-display text-xl font-bold text-brand-earth-900">Track order</h2>
          <p className="mt-2 text-sm text-brand-earth-700/70">
            Look up any order by its order number.
          </p>
        </Link>

        <button
          type="button"
          onClick={clear}
          className="card-warm text-left transition hover:shadow-lg"
        >
          <h2 className="font-display text-xl font-bold text-brand-earth-900">Sign out</h2>
          <p className="mt-2 text-sm text-brand-earth-700/70">
            Log out of your account.
          </p>
        </button>
      </div>
    </section>
  );
}
