import type { Metadata } from "next";
import { CheckoutForm } from "@/features/checkout/components/CheckoutForm";
import { RazorpayScript } from "@/features/checkout/components/RazorpayScript";

export const metadata: Metadata = {
  title: "Checkout",
  description: "Complete your pickle order.",
  robots: { index: false, follow: false },
};

export default function CheckoutPage() {
  return (
    <section className="container-page py-12">
      <header className="mb-8">
        <h1 className="font-display text-3xl font-bold text-brand-earth-900 sm:text-4xl">
          Checkout
        </h1>
        <p className="mt-2 text-brand-earth-700/80">
          Fill in your details to complete your order.
        </p>
      </header>
      <CheckoutForm />
      <RazorpayScript />
    </section>
  );
}
