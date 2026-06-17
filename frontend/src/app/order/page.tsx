import type { Metadata } from "next";
import { productsApi } from "@/features/product/api";
import { OrderForm } from "@/features/checkout/components/_legacy/OrderForm";
import { SectionHeading } from "@/shared/ui/SectionHeading";

export const metadata: Metadata = {
  title: "Place an Order",
  description: "Order homemade pickles online. We ship pan-India and offer WhatsApp ordering too.",
  alternates: { canonical: "/order" },
};

interface PageProps {
  searchParams: Promise<{ productId?: string }>;
}

export default async function OrderPage({ searchParams }: PageProps) {
  const sp = await searchParams;
  const products = await productsApi
    .list({ size: 50 })
    .then((p) => p.content)
    .catch(() => []);

  const preselectedId = sp.productId ? Number.parseInt(sp.productId, 10) : undefined;

  return (
    <div className="container-page py-12">
      <SectionHeading
        eyebrow="Place an Order"
        title="A jar from our kitchen, on its way to yours"
        description="We ship across India. Orders above ₹999 ship free."
      />
      <div className="mt-10">
        {products.length === 0 ? (
          <div className="card-warm text-center">
            <p>Products are temporarily unavailable. Please try again shortly.</p>
          </div>
        ) : (
          <OrderForm products={products} preselectedProductId={preselectedId} />
        )}
      </div>
    </div>
  );
}
