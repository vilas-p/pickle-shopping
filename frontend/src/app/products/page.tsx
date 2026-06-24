import type { Metadata } from "next";
import { Suspense } from "react";
import { productsApi } from "@/features/product/api";
import { categoriesApi } from "@/features/category/api";
import { ProductCard } from "@/features/product/components/ProductCard";
import { ProductFilters } from "@/features/product/components/ProductFilters";
import { SectionHeading } from "@/shared/ui/SectionHeading";

export const metadata: Metadata = {
  title: "Our Pickles",
  description:
    "Browse our hand-made traditional pickles — mango, lemon and bitter gourd — made in cold-pressed oils and shipped across India.",
  alternates: { canonical: "/products" },
};

interface PageProps {
  searchParams: Promise<{ search?: string; category?: string; page?: string }>;
}

export default async function ProductsPage({ searchParams }: PageProps) {
  const sp = await searchParams;
  const page = sp.page ? Number.parseInt(sp.page, 10) : 0;

  const [{ value: categories = [] }, productsResult] = await Promise.all([
    safe(categoriesApi.list()),
    safe(productsApi.list({ search: sp.search, category: sp.category, page, size: 12 })),
  ]);

  const products = productsResult.value?.content ?? [];
  const totalPages = productsResult.value?.totalPages ?? 0;
  const currentPage = productsResult.value?.page ?? 0;

  return (
    <div className="container-page py-12">
      <SectionHeading
        eyebrow="Shop"
        title="Our Pickles"
        description="Three timeless recipes — made in small batches, packed in glass jars, shipped pan-India."
      />

      <div className="mt-10">
        <Suspense fallback={<div className="card-warm h-24 animate-pulse" />}>
          <ProductFilters categories={categories} />
        </Suspense>
      </div>

      {products.length === 0 ? (
        <div className="card-warm mt-10 text-center">
          <p className="font-display text-xl text-brand-earth-900">No pickles match your search</p>
          <p className="mt-1 text-sm text-brand-earth-700/70">Try clearing the filters above.</p>
        </div>
      ) : (
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((p) => <ProductCard key={p.id} product={p} />)}
        </div>
      )}

      {totalPages > 1 && <Pagination currentPage={currentPage} totalPages={totalPages} sp={sp} />}
    </div>
  );
}

function Pagination({
  currentPage,
  totalPages,
  sp,
}: {
  currentPage: number;
  totalPages: number;
  sp: { search?: string; category?: string; page?: string };
}) {
  const buildUrl = (p: number) => {
    const params = new URLSearchParams();
    if (sp.search) params.set("search", sp.search);
    if (sp.category) params.set("category", sp.category);
    params.set("page", String(p));
    return `/products?${params.toString()}`;
  };

  return (
    <nav className="mt-10 flex items-center justify-center gap-2" aria-label="Pagination">
      {Array.from({ length: totalPages }).map((_, idx) => (
        <a
          key={idx}
          href={buildUrl(idx)}
          aria-current={idx === currentPage ? "page" : undefined}
          className={
            idx === currentPage
              ? "rounded-full bg-brand-primary-600 px-4 py-2 text-sm font-semibold text-white"
              : "rounded-full bg-white px-4 py-2 text-sm text-brand-earth-700 ring-1 ring-brand-cream-200 hover:bg-brand-cream-100"
          }
        >
          {idx + 1}
        </a>
      ))}
    </nav>
  );
}

async function safe<T>(p: Promise<T>): Promise<{ value?: T; error?: unknown }> {
  try {
    return { value: await p };
  } catch (error) {
    return { error };
  }
}
