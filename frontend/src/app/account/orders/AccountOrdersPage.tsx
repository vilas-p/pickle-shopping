"use client";

import { AuthGuard } from "@/features/auth/components/AuthGuard";
import { MyOrdersList } from "@/features/order/components/MyOrdersList";

export function AccountOrdersPage() {
  return (
    <AuthGuard>
      <section className="container-page py-12">
        <header className="mb-8">
          <h1 className="font-display text-3xl font-bold text-brand-earth-900 sm:text-4xl">
            My orders
          </h1>
          <p className="mt-2 text-brand-earth-700/80">
            Track the status of your recent orders.
          </p>
        </header>
        <MyOrdersList />
      </section>
    </AuthGuard>
  );
}
