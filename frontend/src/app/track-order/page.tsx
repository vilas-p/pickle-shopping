import type { Metadata } from "next";
import { TrackOrderForm } from "@/features/order/components/TrackOrderForm";

export const metadata: Metadata = {
  title: "Track Your Order",
  description: "Enter your order number to track your pickle delivery.",
};

export default function TrackOrderPage() {
  return (
    <section className="container-page py-12">
      <header className="mb-8">
        <h1 className="font-display text-3xl font-bold text-brand-earth-900 sm:text-4xl">
          Track your order
        </h1>
        <p className="mt-2 text-brand-earth-700/80">
          Enter your order number to see the latest status.
        </p>
      </header>
      <div className="mx-auto max-w-xl">
        <TrackOrderForm />
      </div>
    </section>
  );
}
