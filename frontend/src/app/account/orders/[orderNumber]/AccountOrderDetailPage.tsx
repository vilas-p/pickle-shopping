"use client";

import { AuthGuard } from "@/features/auth/components/AuthGuard";
import { OrderDetailView } from "@/features/order/components/OrderDetailView";

export function AccountOrderDetailPage() {
  return (
    <AuthGuard>
      <section className="container-page py-12">
        <OrderDetailView />
      </section>
    </AuthGuard>
  );
}
