import Link from "next/link";
import Image from "next/image";
import { productsApi } from "@/features/product/api";
import { reviewsApi } from "@/features/review/api";
import { config } from "@/shared/lib/config";
import { ProductCard } from "@/features/product/components/ProductCard";
import { ReviewCard } from "@/features/review/components/ReviewCard";
import { SectionHeading } from "@/shared/ui/SectionHeading";
// import { config } from "@/lib/config";

export default async function HomePage() {
  // Server-side parallel data fetch.
  const [featuredResult, latestReviewsResult] =
    await Promise.allSettled([
      productsApi.featured(),
      reviewsApi.latest(),
    ]);

  const featured = featuredResult.status === "fulfilled" ? featuredResult.value : [];
  const latestReviews =
    latestReviewsResult.status === "fulfilled" ? latestReviewsResult.value : [];

  return (
    <>
     <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          background: "red",
          color: "white",
          zIndex: 99999,
          padding: "10px",
        }}
      >
        API: {config.apiBaseUrl}
      </div>

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
              Handmade near Our Village, in small batches, the way it has always been
              made. Never in a factory. Never in a hurry. Just the taste of a
              kitchen that knows how to make a meal feel like home.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/products" className="btn-primary">
                See What&apos;s In The Kitchen Today
              </Link>
              <Link href="/about" className="btn-secondary">
                Read The Story
              </Link>
            </div>

            <ul className="mt-8 grid grid-cols-3 gap-3 text-center text-sm">
              <li className="rounded-xl bg-white/70 px-3 py-2 ring-1 ring-brand-cream-200">
                <p className="font-bold text-brand-primary-700">Hand-cut</p>
                <p className="text-xs text-brand-earth-700/80">By Amma</p>
              </li>
              <li className="rounded-xl bg-white/70 px-3 py-2 ring-1 ring-brand-cream-200">
                <p className="font-bold text-brand-primary-700">Batch-tasted</p>
                <p className="text-xs text-brand-earth-700/80">Before it leaves</p>
              </li>
              <li className="rounded-xl bg-white/70 px-3 py-2 ring-1 ring-brand-cream-200">
                <p className="font-bold text-brand-primary-700">Village</p>
                <p className="text-xs text-brand-earth-700/80">Our home</p>
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
            eyebrow="From The Kitchen"
            title="Made the slow way, remembered instantly"
            description="Mango, lemon, and bitter gourd pickles prepared in small batches, because some jars should still feel like they came from family."
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
              There is a house in Our Village where the afternoon light still falls on a row of jars.
            </h2>
            <p className="mt-4 text-brand-earth-700/85">
              Long before there was a brand, there was only this: a kitchen, a
              woman with turmeric-stained fingers, and a man who tasted
              everything twice before he said it was ready.
            </p>
            <p className="mt-4 text-brand-earth-700/85">
              For years, these pickles travelled only in tins tucked into
              suitcases and carried to children living far from home. What they
              carried back was never just mango, lemon, or bitter gourd. It was
              the memory of the table they missed.
            </p>
            <Link href="/about" className="btn-primary mt-6">Read Our Story</Link>
          </div>
        </div>
      </section>

      <section className="bg-brand-cream-100/60 py-16">
        <div className="container-page grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          <div className="card-warm">
            <p className="badge-tag">The Kitchen</p>
            <p className="mt-3 text-brand-earth-800">
              Every jar begins in the same room. One stove. One window. One
              woman who learned all this by standing beside her own mother.
            </p>
          </div>
          <div className="card-warm">
            <p className="badge-tag">The Tasting</p>
            <p className="mt-3 text-brand-earth-800">
              Before a batch leaves, it is tasted. If it isn&apos;t ready, it
              waits another day. Some things cannot be rushed.
            </p>
          </div>
          <div className="card-warm">
            <p className="badge-tag">The Journey</p>
            <p className="mt-3 text-brand-earth-800">
              From Our Home kitchen to whatever table you call home today, even
              if that table is in a hostel room or a quiet city flat.
            </p>
          </div>
          <div className="card-warm">
            <p className="badge-tag">The Feeling</p>
            <p className="mt-3 text-brand-earth-800">
              This is about the first bite that makes you pause for a second and
              remember the people who used to serve you lunch.
            </p>
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
            For the table you miss
          </p>
          <h2 className="mt-2 font-display text-3xl font-bold sm:text-4xl">
            Bring a little of home back to your table.
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-brand-cream-100/90">
            Order a jar, or send us a WhatsApp message if you want help finding
            the pickle that tastes closest to the one you remember.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link href="/order" className="btn-primary !bg-white !text-brand-primary-700 hover:!bg-brand-cream-100">
              Order A Jar
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
