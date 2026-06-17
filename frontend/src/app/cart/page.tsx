import type { Metadata } from "next";
import { CartContents } from "@/features/cart/components/CartContents";

export const metadata: Metadata = {
  title: "Your Cart",
  description: "Review the pickles in your cart before checkout.",
  robots: { index: false, follow: false },
};

export default function CartPage() {
  return (
    <section className="container-page py-12">
      <header className="mb-8">
        <h1 className="font-display text-3xl font-bold text-brand-earth-900 sm:text-4xl">
          Your cart
        </h1>
        <p className="mt-2 text-brand-earth-700/80">
          Adjust quantities or remove jars before you check out.
        </p>
      </header>
      <CartContents />
    </section>
  );
}
