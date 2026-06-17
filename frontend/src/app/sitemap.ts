import type { MetadataRoute } from "next";
import { config } from "@/shared/lib/config";
import { productsApi } from "@/features/product/api";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = config.siteUrl;
  const now = new Date();

  const staticRoutes: MetadataRoute.Sitemap = [
    "", "/products", "/about", "/reviews", "/contact", "/order", "/faq",
  ].map((path) => ({
    url: `${base}${path}`,
    lastModified: now,
    changeFrequency: "weekly",
    priority: path === "" ? 1.0 : 0.7,
  }));

  let productRoutes: MetadataRoute.Sitemap = [];
  try {
    const products = await productsApi.list({ size: 100 });
    productRoutes = products.content.map((p) => ({
      url: `${base}/products/${p.slug}`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.8,
    }));
  } catch {
    /* ignore — sitemap should still build */
  }

  return [...staticRoutes, ...productRoutes];
}
