import type { Metadata } from "next";
import { ContactForm } from "@/features/contact/components/ContactForm";
import { SectionHeading } from "@/shared/ui/SectionHeading";
import { config } from "@/shared/lib/config";
import { instagramLink, whatsappGenericLink } from "@/shared/lib/whatsapp";
import { ROUTES } from "@/shared/constants/routes";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Contact Us",
  description: "Get in touch with Appa & Amma's Pickles — we'd love to hear from you.",
  alternates: { canonical: "/contact" },
};

export default function ContactPage() {
  return (
    <div className="container-page py-12">
      <SectionHeading
        eyebrow="Talk to Us"
        title="We'd love to hear from you"
        description="Have a question about a recipe, an order, or a bulk request? Drop us a message and we'll get back within 24 hours."
      />

      <div className="mt-10 grid gap-8 md:grid-cols-3">
        <div className="space-y-4 md:col-span-1">
          <div className="card-warm">
            <p className="font-display text-lg font-semibold text-brand-earth-900">WhatsApp</p>
            <p className="mt-1 text-sm text-brand-earth-700/85">Fastest way to reach us.</p>
            <a href={whatsappGenericLink()} target="_blank" rel="noreferrer" className="btn-whatsapp mt-3 w-full">
              Chat on WhatsApp
            </a>
          </div>
          <div className="card-warm">
            <p className="font-display text-lg font-semibold text-brand-earth-900">Bulk Orders</p>
            <p className="mt-1 text-sm text-brand-earth-700/85">
              Planning a wedding, event, return gift, or reseller purchase?
            </p>
            <Link href={ROUTES.bulkOrders} className="btn-secondary mt-3 w-full justify-center">
              Open Bulk Order Options
            </Link>
          </div>
          <div className="card-warm">
            <p className="font-display text-lg font-semibold text-brand-earth-900">Email</p>
            <a href="mailto:appaammaspickles@gmail.com" className="mt-1 block text-brand-primary-700 hover:underline">
              appaammaspickles@gmail.com
            </a>
          </div>
          <div className="card-warm">
            <p className="font-display text-lg font-semibold text-brand-earth-900">Instagram</p>
            <a href={instagramLink()} target="_blank" rel="noreferrer" className="mt-1 block text-brand-primary-700 hover:underline">
              @{config.instagramHandle}
            </a>
          </div>
        </div>

        <div className="md:col-span-2">
          <ContactForm />
        </div>
      </div>
    </div>
  );
}
