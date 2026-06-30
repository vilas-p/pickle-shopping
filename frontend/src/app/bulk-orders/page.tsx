import type { Metadata } from "next";
import Link from "next/link";
import { SectionHeading } from "@/shared/ui/SectionHeading";
import { ROUTES } from "@/shared/constants/routes";
import { whatsappGenericLink } from "@/shared/lib/whatsapp";

export const metadata: Metadata = {
  title: "Bulk Orders",
  description: "Request wedding, event, gifting, and wholesale pickle orders from Appa & Amma's Pickles.",
  alternates: { canonical: "/bulk-orders" },
};

const useCases = [
  "Wedding return gifts and festive hampers",
  "Corporate gifting and employee boxes",
  "Restaurant, cafe, and reseller supply",
  "Family events and large custom orders",
];

const steps = [
  "Share the quantity, product choices, delivery city, and required date.",
  "We confirm availability, packaging options, and a custom quote.",
  "Once approved, we schedule production and dispatch for your event or business.",
];

export default function BulkOrdersPage() {
  const whatsappHref = whatsappGenericLink(
    "Hi! I want to place a bulk order with Appa & Amma's Pickles. Please share pricing and packaging options.",
  );

  return (
    <div className="container-page py-12">
      <SectionHeading
        eyebrow="Bulk Orders"
        title="Wedding, gifting, and wholesale pickle orders"
        description="If you need a larger quantity than a normal household order, send us your requirement and we will prepare a custom quote."
      />

      <div className="mt-10 grid gap-8 lg:grid-cols-[1.1fr,0.9fr]">
        <section className="space-y-6">
          <div className="card-warm">
            <h2 className="font-display text-2xl font-semibold text-brand-earth-900">Best for</h2>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {useCases.map((item) => (
                <div key={item} className="rounded-2xl bg-brand-cream-50 px-4 py-4 ring-1 ring-brand-cream-200">
                  <p className="text-sm font-semibold text-brand-earth-900">{item}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="card-warm">
            <h2 className="font-display text-2xl font-semibold text-brand-earth-900">How it works</h2>
            <div className="mt-4 space-y-3">
              {steps.map((step, index) => (
                <div key={step} className="flex gap-4 rounded-2xl bg-brand-cream-50 px-4 py-4 ring-1 ring-brand-cream-200">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-primary-600 font-semibold text-white">
                    {index + 1}
                  </span>
                  <p className="text-sm text-brand-earth-800">{step}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <aside className="space-y-6">
          <div className="card-dark">
            <p className="eyebrow">Quickest option</p>
            <h2 className="mt-2 font-display text-3xl font-bold">Send your requirement on WhatsApp</h2>
            <p className="mt-3 text-sm text-brand-black-50/85">
              Include product names, approximate quantity, city, packaging needs, and delivery deadline.
            </p>
            <a href={whatsappHref} target="_blank" rel="noreferrer" className="btn-whatsapp mt-6 w-full justify-center">
              Start Bulk Order Chat
            </a>
          </div>

          <div className="card-warm">
            <h3 className="font-display text-xl font-semibold text-brand-earth-900">Prefer email or form?</h3>
            <p className="mt-2 text-sm text-brand-earth-700/85">
              Use the contact page if you want to send a detailed written request and we will reply with pricing and next steps.
            </p>
            <Link href={ROUTES.contact} className="btn-secondary mt-5 w-full justify-center">
              Send Bulk Enquiry
            </Link>
          </div>

          <div className="card-warm">
            <h3 className="font-display text-xl font-semibold text-brand-earth-900">Typical details to share</h3>
            <ul className="mt-3 space-y-2 text-sm text-brand-earth-700/85">
              <li>Quantity or budget range</li>
              <li>Preferred flavours and jar sizes</li>
              <li>Delivery city and target date</li>
              <li>Gift packing, custom notes, or branding needs</li>
            </ul>
          </div>
        </aside>
      </div>
    </div>
  );
}