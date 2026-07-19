import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ordersApi } from "@/features/order/api";
import { formatPrice } from "@/shared/lib/format";
import { ROUTES } from "@/shared/constants/routes";
import { config } from "@/shared/lib/config";

interface PageProps {
  params: Promise<{ orderNumber: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { orderNumber } = await params;
  return {
    title: `Order ${orderNumber} — Confirmed`,
    robots: { index: false, follow: false },
  };
}

export default async function ConfirmationPage({ params }: PageProps) {
  const { orderNumber } = await params;

  let order;
  try {
    order = await ordersApi.byNumber(orderNumber);
  } catch {
    notFound();
  }

  const isPaidOnline = order.paymentMethod === "RAZORPAY" || order.paymentMethod === "UPI";
  const paymentLabel = order.paymentMethod === "UPI"
    ? "UPI"
    : order.paymentMethod === "RAZORPAY"
      ? "Paid online"
      : "Cash on Delivery";

  return (
    <section className="container-page py-12">
      <div className="mx-auto max-w-xl text-center">
        <p className="font-script text-3xl text-brand-primary-700">With warmth, from our kitchen</p>
        <h1 className="mt-2 font-display text-3xl font-bold text-brand-earth-900 sm:text-4xl">
          Your order is in
        </h1>
        <p className="mt-3 text-brand-earth-700/80">
          Your jar is being prepared with the same care it would receive on our
          own family&apos;s table. We&apos;ll let you know the moment it begins its
          journey to yours.
        </p>

        <div className="card-warm mt-8 text-left">
          <dl className="space-y-3 text-sm text-brand-earth-800">
            <div className="flex justify-between">
              <dt className="font-medium">Order number</dt>
              <dd className="font-mono font-bold text-brand-primary-700">{order.orderNumber}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="font-medium">Status</dt>
              <dd>
                <span className="badge-tag">{order.status}</span>
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="font-medium">Payment</dt>
              <dd>{paymentLabel}</dd>
            </div>
            <div className="flex justify-between border-t border-brand-cream-200 pt-3">
              <dt className="font-medium">Subtotal</dt>
              <dd>{formatPrice(order.subtotal)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="font-medium">Shipping</dt>
              <dd>{order.shippingFee === 0 ? "Free" : formatPrice(order.shippingFee)}</dd>
            </div>
            <div className="flex justify-between text-base font-bold text-brand-earth-900">
              <dt>Total</dt>
              <dd className="text-brand-primary-700">{formatPrice(order.total)}</dd>
            </div>
          </dl>
        </div>

        <div className="mt-6 space-y-3">
          {!isPaidOnline && (
            <p className="text-sm text-brand-earth-700/80">
              You&apos;ll pay on delivery or via UPI. We&apos;ll WhatsApp you shortly with the next details.
            </p>
          )}

          <div className="flex flex-wrap justify-center gap-3">
            <Link href={ROUTES.products} className="btn-primary">
              See what&apos;s in the kitchen today
            </Link>
            <a
              href={`https://wa.me/${config.whatsappNumber}?text=${encodeURIComponent(
                `Hello, I just placed order ${order.orderNumber}. Please confirm when you have a moment.`
              )}`}
              target="_blank"
              rel="noreferrer"
              className="btn-whatsapp"
            >
              Write to us on WhatsApp
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
