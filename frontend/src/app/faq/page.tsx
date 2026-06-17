import type { Metadata } from "next";
import { SectionHeading } from "@/shared/ui/SectionHeading";

export const metadata: Metadata = {
  title: "FAQ",
  description: "Answers to common questions about ingredients, shipping, returns and care of our homemade pickles.",
  alternates: { canonical: "/faq" },
};

const FAQS: Array<{ q: string; a: string }> = [
  {
    q: "Are your pickles really made by hand?",
    a: "Yes. Every step — sourcing, cutting, salting, sun-curing, mixing, jarring and labelling — is done by our family in our village kitchen. We never outsource production.",
  },
  {
    q: "Do you use any preservatives or artificial colours?",
    a: "No. We rely on salt, cold-pressed oil and sunlight — the way pickles have been preserved in India for centuries.",
  },
  {
    q: "Where do you ship?",
    a: "We currently ship across India. Free shipping on orders above ₹999. Flat ₹60 shipping otherwise.",
  },
  {
    q: "How long do your pickles last?",
    a: "It varies by recipe — typically 6 to 12 months. Always use a clean, dry spoon. Refrigeration extends the shelf life.",
  },
  {
    q: "Can I place an order on WhatsApp?",
    a: "Absolutely — tap the WhatsApp button anywhere on the site and we'll take care of you personally.",
  },
  {
    q: "Do you accept bulk / wedding orders?",
    a: "Yes! Please reach out via WhatsApp or the contact form with your requirement and we'll send a custom quote.",
  },
  {
    q: "Can I return a jar if I don't like it?",
    a: "Because pickles are perishable food, we cannot accept returns. If anything is damaged in transit, send us a photo on WhatsApp within 48 hours and we'll make it right.",
  },
];

export default function FAQPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FAQS.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };

  return (
    <div className="container-page py-12">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <SectionHeading
        eyebrow="Frequently Asked Questions"
        title="Good to know"
      />
      <div className="mx-auto mt-10 max-w-3xl space-y-4">
        {FAQS.map((f) => (
          <details key={f.q} className="card-warm group">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-4">
              <span className="font-display text-lg font-semibold text-brand-earth-900">{f.q}</span>
              <span className="text-brand-primary-600 transition group-open:rotate-45 text-2xl">+</span>
            </summary>
            <p className="mt-3 text-sm leading-relaxed text-brand-earth-700/85">{f.a}</p>
          </details>
        ))}
      </div>
    </div>
  );
}
