import Link from "next/link";
import Image from "next/image";
import { productsApi } from "@/features/product/api";
import { categoriesApi } from "@/features/category/api";
import { reviewsApi } from "@/features/review/api";
import { config } from "@/shared/lib/config";
import { ProductCard } from "@/features/product/components/ProductCard";
import { ReviewCard } from "@/features/review/components/ReviewCard";
import { SectionHeading } from "@/shared/ui/SectionHeading";

export default async function HomePage() {
  // Server-side parallel data fetch.
  const [featuredResult, latestReviewsResult, categoriesResult] =
    await Promise.allSettled([
      productsApi.featured(),
      reviewsApi.latest(),
      categoriesApi.list(),
    ]);

  const featured = featuredResult.status === "fulfilled" ? featuredResult.value : [];
  const latestReviews =
    latestReviewsResult.status === "fulfilled" ? latestReviewsResult.value : [];
  const categories =
    categoriesResult.status === "fulfilled" ? categoriesResult.value : [];

  return (
    <>
      {/* HERO */}
      <section className="relative overflow-hidden bg-warm-grain gradient-warm">
        <div className="container-page grid items-center gap-10 py-16 sm:py-24 md:grid-cols-2">
          <div>
            <p className="font-script text-2xl text-brand-primary-700">
              {config.brand.tagline}
            </p>
            <h1 className="mt-2 font-display text-4xl font-bold leading-tight text-brand-earth-900 sm:text-5xl lg:text-6xl">
              Pickles, the way <span className="text-brand-primary-600">Amma</span>{" "}
              has always made them.
            </h1>
            <p className="mt-5 max-w-xl text-lg text-brand-earth-700/85">
              Hand-picked produce. Cold-pressed oils. Sun-cured the slow way.
              Three timeless recipes, packed with love in our village kitchen and
              delivered to your dining table — anywhere in India.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/products" className="btn-primary">
                Shop Pickles
              </Link>
              <Link href="/about" className="btn-secondary">
                Our Story
              </Link>
            </div>

            <ul className="mt-8 grid grid-cols-3 gap-3 text-center text-sm">
              <li className="rounded-xl bg-white/70 px-3 py-2 ring-1 ring-brand-cream-200">
                <p className="font-bold text-brand-primary-700">100%</p>
                <p className="text-xs text-brand-earth-700/80">Hand-made</p>
              </li>
              <li className="rounded-xl bg-white/70 px-3 py-2 ring-1 ring-brand-cream-200">
                <p className="font-bold text-brand-primary-700">Cold-Pressed</p>
                <p className="text-xs text-brand-earth-700/80">Oils only</p>
              </li>
              <li className="rounded-xl bg-white/70 px-3 py-2 ring-1 ring-brand-cream-200">
                <p className="font-bold text-brand-primary-700">Pan-India</p>
                <p className="text-xs text-brand-earth-700/80">Shipping</p>
              </li>
            </ul>
          </div>

          <div className="relative">
            <div className="relative mx-auto aspect-square w-full max-w-md rotate-2 overflow-hidden rounded-[2.5rem] bg-brand-primary-100 shadow-warm ring-1 ring-brand-primary-200">
              <Image
                src="/images/hero-pickle-jar.png"
                alt="Traditional clay pickle jar with mango pickle"
                fill
                priority
                className="object-cover"
                sizes="(min-width: 768px) 50vw, 100vw"
              />
            </div>
            <div className="absolute -bottom-6 -left-6 rounded-2xl bg-white px-4 py-3 shadow-card ring-1 ring-brand-cream-200">
              <p className="font-script text-xl text-brand-primary-700">
                Made in our village
              </p>
              <p className="text-xs text-brand-earth-700/70">— Karnataka</p>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURED PRODUCTS */}
      <section className="bg-brand-cream-100/60 py-16">
        <div className="container-page">
          <SectionHeading
            eyebrow="Our Bestsellers"
            title="Made fresh, batch by batch"
            description="Each jar is hand-packed within 48 hours of being made — never sitting in a warehouse."
          />
          {featured.length > 0 ? (
            <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {featured.map((p) => <ProductCard key={p.id} product={p} />)}
            </div>
          ) : (
            <p className="mt-10 text-center text-brand-earth-700/70">
              Our pickles are loading… please check back shortly.
            </p>
          )}
          <div className="mt-8 text-center">
            <Link href="/products" className="btn-secondary">View All Pickles</Link>
          </div>
        </div>
      </section>

      {/* STORY STRIP */}
      <section className="container-page py-20">
        <div className="grid items-center gap-12 md:grid-cols-2">
          <div className="relative aspect-[4/5] overflow-hidden rounded-3xl shadow-warm">
            <Image
              src="/images/story-grandmother.png"
              alt="Amma preparing pickles in the village kitchen"
              fill
              className="object-cover"
              sizes="(min-width: 768px) 40vw, 100vw"
            />
          </div>
          <div>
            <p className="badge-tag">Our Story</p>
            <h2 className="section-heading mt-3 font-display">
              Three generations. One kitchen. One sun-soaked courtyard.
            </h2>
            <p className="mt-4 text-brand-earth-700/85">
              Our pickles come from a tiny kitchen in coastal Andhra Pradesh — the
              same kitchen where Amma learned from her mother, and her mother
              before her. Every jar is sun-cured on the same terracotta tiles,
              packed in the same way, with the same patience.
            </p>
            <p className="mt-4 text-brand-earth-700/85">
              We don&apos;t use preservatives, artificial colours, or refined oils.
              Just the ingredients we&apos;d use to feed our own children.
            </p>
            <Link href="/about" className="btn-primary mt-6">Read Our Story</Link>
          </div>
        </div>
      </section>

      {/* REVIEWS */}
      {latestReviews.length > 0 && (
        <section className="bg-brand-cream-100/60 py-16">
          <div className="container-page">
            <SectionHeading
              eyebrow="Kind Words"
              title="From our customers' kitchens"
            />
            <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {latestReviews.slice(0, 6).map((r) => (
                <ReviewCard key={r.id} review={r} />
              ))}
            </div>
            <div className="mt-8 text-center">
              <Link href="/reviews" className="btn-secondary">Read All Reviews</Link>
            </div>
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="container-page py-20">
        <div className="overflow-hidden rounded-3xl bg-brand-primary-600 px-6 py-16 text-center text-white shadow-warm sm:px-16">
          <p className="font-script text-2xl text-brand-secondary-200">
            From our village kitchen
          </p>
          <h2 className="mt-2 font-display text-3xl font-bold sm:text-4xl">
            Bring a jar of tradition home.
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-brand-cream-100/90">
            Order on the website, or send us a WhatsApp message — we&apos;ll take
            care of the rest.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link href="/order" className="btn-primary !bg-white !text-brand-primary-700 hover:!bg-brand-cream-100">
              Place an Order
            </Link>
            <Link href="/bulk-orders" className="btn-secondary !border-white !text-white hover:!bg-white/10">
              Bulk Order Enquiry
            </Link>
            <Link href="/contact" className="btn-secondary !border-white !text-white hover:!bg-white/10">
              Talk to Us
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
