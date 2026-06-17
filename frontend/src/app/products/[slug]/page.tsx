import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { productsApi } from "@/features/product/api";
import { reviewsApi } from "@/features/review/api";
import { config } from "@/shared/lib/config";
import { formatPrice } from "@/shared/lib/format";
import { primaryImage } from "@/features/product/utils";
import { ProductActions } from "@/features/product/components/ProductActions";
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
    <article className="container-page py-12">
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

      <div className="grid gap-10 md:grid-cols-2">
        <div>
          <div className="relative aspect-square w-full overflow-hidden rounded-3xl bg-brand-cream-100 shadow-card">
            <Image
              src={primaryImage(product)}
              alt={product.images?.[0]?.altText ?? product.name}
              fill
              sizes="(min-width: 768px) 50vw, 100vw"
              priority
              className="object-cover"
            />
          </div>
          {product.images && product.images.length > 1 && (
            <div className="mt-3 grid grid-cols-4 gap-2">
              {product.images.slice(0, 4).map((img) => (
                <div key={img.id} className="relative aspect-square overflow-hidden rounded-xl bg-brand-cream-100">
                  <Image src={img.url} alt={img.altText ?? product.name} fill sizes="20vw" className="object-cover" />
                </div>
              ))}
            </div>
          )}
        </div>

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

      {reviews.length > 0 && (
        <section className="mt-16">
          <h2 className="font-display text-2xl font-bold text-brand-earth-900">
            What customers are saying
          </h2>
          <div className="mt-6 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {reviews.map((r) => <ReviewCard key={r.id} review={r} />)}
          </div>
        </section>
      )}
    </article>
  );
}
