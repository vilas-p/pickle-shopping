"use client";

import { useCallback, useEffect, useState } from "react";
import { ApiError } from "@/shared/lib/http";
import { http } from "@/shared/lib/http";
import { adminMediaApi } from "../api";
import type { MediaCategory, MediaItem } from "../types";

const CATEGORIES: MediaCategory[] = ["BANNER", "HERO", "ABOUT", "LOGO", "PRODUCT", "GENERAL"];

interface ProductSummary {
  id: number;
  name: string;
  slug: string;
  active: boolean;
}

interface ProductPageResponse {
  content: ProductSummary[];
}

function formatBytes(size: number): string {
  if (size < 1024) return `${size} B`;
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
  return `${(size / (1024 * 1024)).toFixed(1)} MB`;
}

export function AdminMediaLibrary() {
  const [items, setItems] = useState<MediaItem[]>([]);
  const [products, setProducts] = useState<ProductSummary[]>([]);
  const [productsLoading, setProductsLoading] = useState(true);
  const [loading, setLoading] = useState(true);
  const [filterCategory, setFilterCategory] = useState<MediaCategory | "">("");
  const [error, setError] = useState<string | null>(null);

  // Upload state
  const [file, setFile] = useState<File | null>(null);
  const [uploadCategory, setUploadCategory] = useState<MediaCategory>("BANNER");
  const [selectedProductId, setSelectedProductId] = useState("");
  const [altText, setAltText] = useState("");
  const [uploading, setUploading] = useState(false);

  const fetchMedia = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await adminMediaApi.listMedia(filterCategory || undefined);
      setItems(data);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to load media");
    } finally {
      setLoading(false);
    }
  }, [filterCategory]);

  useEffect(() => {
    void fetchMedia();
  }, [fetchMedia]);

  useEffect(() => {
    const fetchProducts = async () => {
      setProductsLoading(true);
      try {
        const data = await http<ProductPageResponse>("/products/admin?size=100", {
          auth: "admin",
          cache: "no-store",
        });
        setProducts(data.content);
      } catch {
        setProducts([]);
      } finally {
        setProductsLoading(false);
      }
    };

    void fetchProducts();
  }, []);

  useEffect(() => {
    if (uploadCategory !== "PRODUCT") {
      setSelectedProductId("");
    }
  }, [uploadCategory]);

  const handleUpload = async () => {
    if (!file) return;
    if (uploadCategory === "PRODUCT" && !selectedProductId) {
      setError("Select a product before uploading product media.");
      return;
    }

    setUploading(true);
    setError(null);
    try {
      await adminMediaApi.uploadMedia(file, uploadCategory, {
        productId: uploadCategory === "PRODUCT" ? Number(selectedProductId) : undefined,
        altText: altText || undefined,
      });
      setFile(null);
      setAltText("");
      setSelectedProductId("");
      await fetchMedia();
    } catch (e: unknown) {
      if (e instanceof ApiError && e.status === 401) {
        setError("Session expired. Please log in again.");
      } else {
        setError(e instanceof Error ? e.message : "Upload failed");
      }
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (item: MediaItem) => {
    if (!confirm(`Delete "${item.originalFilename}"? This will remove it from S3 permanently.`)) return;
    try {
      await adminMediaApi.deleteMedia(item.id);
      setItems((prev) => prev.filter((m) => m.id !== item.id));
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Delete failed");
    }
  };

  const handleToggleActive = async (item: MediaItem) => {
    try {
      const updated = await adminMediaApi.updateMedia(item.id, { active: !item.active });
      setItems((prev) => prev.map((m) => (m.id === updated.id ? updated : m)));
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Update failed");
    }
  };

  return (
    <div className="space-y-6">
      {/* Upload Section */}
      <section className="card-warm space-y-4">
        <h2 className="font-display text-2xl font-bold text-brand-earth-900">Upload Media</h2>
        <div className="grid gap-4 md:grid-cols-4">
          <div>
            <label htmlFor="uploadCategory" className="text-sm font-semibold text-brand-earth-900">
              Category
            </label>
            <select
              id="uploadCategory"
              value={uploadCategory}
              onChange={(e) => setUploadCategory(e.target.value as MediaCategory)}
              className="mt-1 w-full rounded-xl border border-brand-cream-300 bg-white px-3 py-2 text-sm"
            >
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
          {uploadCategory === "PRODUCT" && (
            <div>
              <label htmlFor="productId" className="text-sm font-semibold text-brand-earth-900">
                Product
              </label>
              <select
                id="productId"
                value={selectedProductId}
                onChange={(e) => setSelectedProductId(e.target.value)}
                disabled={productsLoading}
                className="mt-1 w-full rounded-xl border border-brand-cream-300 bg-white px-3 py-2 text-sm disabled:bg-brand-cream-100"
              >
                <option value="">{productsLoading ? "Loading products..." : "Select a product"}</option>
                {products.map((product) => (
                  <option key={product.id} value={String(product.id)}>
                    {product.name} ({product.slug})
                  </option>
                ))}
              </select>
            </div>
          )}
          <div>
            <label htmlFor="altText" className="text-sm font-semibold text-brand-earth-900">
              Alt text
            </label>
            <input
              id="altText"
              value={altText}
              onChange={(e) => setAltText(e.target.value)}
              placeholder="Descriptive alt text"
              className="mt-1 w-full rounded-xl border border-brand-cream-300 bg-white px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label htmlFor="mediaFile" className="text-sm font-semibold text-brand-earth-900">
              File
            </label>
            <input
              id="mediaFile"
              type="file"
              accept="image/*,video/mp4,video/webm"
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
              className="mt-1 block w-full text-sm file:mr-3 file:rounded-full file:border-0 file:bg-brand-primary-700 file:px-4 file:py-2 file:font-semibold file:text-white hover:file:bg-brand-primary-800"
            />
          </div>
        </div>
        <button
          type="button"
          onClick={() => void handleUpload()}
          disabled={!file || uploading}
          className="btn-primary disabled:cursor-not-allowed disabled:opacity-60"
        >
          {uploading ? "Uploading..." : "Upload"}
        </button>
      </section>

      {/* Filter & List */}
      <section className="card-warm space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-2xl font-bold text-brand-earth-900">Media Library</h2>
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value as MediaCategory | "")}
            className="rounded-xl border border-brand-cream-300 bg-white px-3 py-2 text-sm"
          >
            <option value="">All categories</option>
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>

        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {loading ? (
          <p className="text-brand-earth-700/70">Loading...</p>
        ) : items.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-brand-cream-300 px-6 py-10 text-center text-brand-earth-700/80">
            No media found. Upload some files above.
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {items.map((item) => (
              <MediaCard
                key={item.id}
                item={item}
                onDelete={() => void handleDelete(item)}
                onToggleActive={() => void handleToggleActive(item)}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function MediaCard({
  item,
  onDelete,
  onToggleActive,
}: {
  item: MediaItem;
  onDelete: () => void;
  onToggleActive: () => void;
}) {
  return (
    <div className="overflow-hidden rounded-2xl border border-brand-cream-200 bg-white shadow-sm">
      <div className="relative aspect-video bg-brand-cream-100">
        {item.mediaType === "VIDEO" ? (
          <video
            src={item.url}
            className="h-full w-full object-cover"
            preload="metadata"
          />
        ) : (
          <img
            src={item.url}
            alt={item.altText || item.originalFilename}
            className="h-full w-full object-cover"
          />
        )}
        <span
          className={`absolute right-2 top-2 rounded-full px-2 py-0.5 text-xs font-semibold ${
            item.active ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-600"
          }`}
        >
          {item.active ? "Active" : "Inactive"}
        </span>
      </div>
      <div className="space-y-2 px-3 py-3">
        <p className="truncate text-sm font-medium text-brand-earth-900" title={item.originalFilename}>
          {item.originalFilename}
        </p>
        <div className="flex items-center gap-2 text-xs text-brand-earth-700/70">
          <span className="rounded bg-brand-cream-100 px-1.5 py-0.5">{item.category}</span>
          <span>{formatBytes(item.fileSize)}</span>
          <span>{item.mediaType}</span>
        </div>
        <div className="flex gap-2 pt-1">
          <button
            onClick={onToggleActive}
            className="rounded-lg border border-brand-cream-300 px-2 py-1 text-xs font-medium text-brand-earth-700 hover:bg-brand-cream-50"
          >
            {item.active ? "Deactivate" : "Activate"}
          </button>
          <button
            onClick={onDelete}
            className="rounded-lg border border-red-200 px-2 py-1 text-xs font-medium text-red-700 hover:bg-red-50"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}
