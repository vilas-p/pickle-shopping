import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { productsApi } from "@/features/product/api";
import { reviewsApi } from "@/features/review/api";
import { config } from "@/shared/lib/config";
import { formatPrice } from "@/shared/lib/format";
import { ProductActions } from "@/features/product/components/ProductActions";
import { ProductGallery } from "@/features/product/components/ProductGallery";
import { ReviewCard } from "@/features/review/components/ReviewCard";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  try {
    const product = await productsApi.bySlug(slug);
    return {
      title: product.name,
      description: product.shortDescription,
      alternates: { canonical: `/products/${slug}` },
      openGraph: {
        title: product.name,
        description: product.shortDescription,
        images: product.images?.[0]?.url ? [product.images[0].url] : undefined,
        type: "website",
      },
    };
  } catch {
    return { title: "Product" };
  }
}

export default async function ProductDetailPage({ params }: PageProps) {
  const { slug } = await params;

  let product;
  try {
    product = await productsApi.bySlug(slug);
  } catch {
    notFound();
  }

  const reviewsPage = await reviewsApi
    .forProduct(product.id, 0, 6)
    .catch(() => ({ content: [], totalElements: 0, page: 0, size: 0, totalPages: 0, first: true, last: true }));

  const reviews = reviewsPage.content ?? [];
  const avgRating =
    reviews.length > 0
      ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1)
      : null;

  const hasDiscount =
    product.compareAtPrice !== undefined &&
    product.compareAtPrice !== null &&
    product.compareAtPrice > product.price;

  const hasVariants = (product.variants?.filter((v) => v.active) ?? []).length > 0;

  // Product structured data for SEO
  const jsonLd = {
    "@context": "https://schema.org/",
    "@type": "Product",
    name: product.name,
    description: product.shortDescription,
    image: product.images?.map((i) => i.url),
    brand: { "@type": "Brand", name: config.brand.name },
    offers: {
      "@type": "Offer",
      priceCurrency: "INR",
      price: product.price,
      availability: "https://schema.org/InStock",
      url: `${config.siteUrl}/products/${product.slug}`,
    },
    ...(avgRating
      ? {
          aggregateRating: {
            "@type": "AggregateRating",
            ratingValue: avgRating,
            reviewCount: reviewsPage.totalElements,
          },
        }
      : {}),
  };

  return (
    <article className="bg-brand-cream-100/60 py-12 sm:py-16">
      <div className="container-page">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <nav className="mb-6 text-sm text-brand-earth-700/70">
        <Link href="/" className="hover:text-brand-primary-700">Home</Link>
        <span className="mx-2">/</span>
        <Link href="/products" className="hover:text-brand-primary-700">Pickles</Link>
        <span className="mx-2">/</span>
        <span className="text-brand-earth-800">{product.name}</span>
      </nav>

      <div className="rounded-[2rem] bg-white/85 p-6 shadow-card ring-1 ring-brand-cream-200 backdrop-blur-sm lg:p-8">
        <div className="grid gap-10 md:grid-cols-2">
          <ProductGallery product={product} />

          <div>
            <p className="badge-tag">{product.category.name}</p>
            <h1 className="mt-3 font-display text-3xl font-bold text-brand-earth-900 sm:text-4xl">
              {product.name}
            </h1>
            <p className="mt-3 text-lg text-brand-earth-700/85">
              {product.shortDescription}
            </p>

            <div className="mt-5 flex items-baseline gap-3">
              {hasVariants ? (
                <span className="text-sm text-brand-earth-700/70">Select a size below</span>
              ) : (
                <>
                  <span className="text-3xl font-bold text-brand-primary-700">
                    {formatPrice(product.price)}
                  </span>
                  {hasDiscount && (
                    <span className="price-strike text-lg">
                      {formatPrice(product.compareAtPrice!)}
                    </span>
                  )}
                  <span className="text-sm text-brand-earth-700/70">/ {product.weight}</span>
                </>
              )}
            </div>

            <ProductActions product={product} />

            <dl className="mt-8 grid gap-4 sm:grid-cols-2">
              {product.ingredients && (
                <div className="card-warm">
                  <dt className="font-display text-lg font-semibold text-brand-earth-900">Ingredients</dt>
                  <dd className="mt-1 text-sm text-brand-earth-700/85">{product.ingredients}</dd>
                </div>
              )}
              {product.shelfLife && (
                <div className="card-warm">
                  <dt className="font-display text-lg font-semibold text-brand-earth-900">Shelf Life</dt>
                  <dd className="mt-1 text-sm text-brand-earth-700/85">{product.shelfLife}</dd>
                </div>
              )}
            </dl>

            {product.description && (
              <div className="prose prose-sm mt-8 max-w-none text-brand-earth-800">
                <h2 className="font-display text-2xl">About this pickle</h2>
                <p>{product.description}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {reviews.length > 0 && (
        <section className="mt-16 rounded-[2rem] bg-white/80 p-6 shadow-card ring-1 ring-brand-cream-200 sm:p-8">
          <h2 className="font-display text-2xl font-bold text-brand-earth-900">
            What customers are saying
          </h2>
          <div className="mt-6 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {reviews.map((r) => <ReviewCard key={r.id} review={r} />)}
          </div>
        </section>
      )}
      </div>
    </article>
  );
}
