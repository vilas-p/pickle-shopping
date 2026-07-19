import type { Metadata } from "next";
import { CheckoutForm } from "@/features/checkout/components/CheckoutForm";
import { RazorpayScript } from "@/features/checkout/components/RazorpayScript";

export const metadata: Metadata = {
  title: "Checkout",
  description: "Complete your order and send a jar from our kitchen to your table.",
  robots: { index: false, follow: false },
};

export default function CheckoutPage() {
  return (
    <section className="container-page py-12">
      <header className="mb-8">
        <h1 className="font-display text-3xl font-bold text-brand-earth-900 sm:text-4xl">
          A jar from our kitchen, on its way to yours
        </h1>
        <p className="mt-2 text-brand-earth-700/80">
          Fill in your details and we&apos;ll prepare the parcel with the same care we give our own table.
        </p>
      </header>
      <CheckoutForm />
      <RazorpayScript />
    </section>
  );
}
