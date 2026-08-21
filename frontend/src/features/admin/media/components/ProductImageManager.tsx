"use client";

import { useCallback, useEffect, useState } from "react";
import { adminMediaApi } from "../api";
import type { ProductImageItem } from "../types";

interface Props {
  productId: number;
  productName?: string;
}

function formatBytes(size: number): string {
  if (size < 1024) return `${size} B`;
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
  return `${(size / (1024 * 1024)).toFixed(1)} MB`;
}

export function ProductImageManager({ productId, productName }: Props) {
  const [images, setImages] = useState<ProductImageItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [altText, setAltText] = useState("");
  const [uploading, setUploading] = useState(false);

  const fetchImages = useCallback(async () => {
    setLoading(true);
    try {
      const data = await adminMediaApi.listProductImages(productId);
      setImages(data);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to load images");
    } finally {
      setLoading(false);
    }
  }, [productId]);

  useEffect(() => {
    void fetchImages();
  }, [fetchImages]);

  const handleUpload = async () => {
    if (!file) return;
    setUploading(true);
    setError(null);
    try {
      await adminMediaApi.uploadProductImage(productId, file, {
        altText: altText || undefined,
        primary: images.length === 0,
      });
      setFile(null);
      setAltText("");
      await fetchImages();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (imageId: number) => {
    if (!confirm("Delete this image? This will remove it from S3 permanently.")) return;
    try {
      await adminMediaApi.deleteProductImage(productId, imageId);
      setImages((prev) => prev.filter((img) => img.id !== imageId));
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Delete failed");
    }
  };

  const handleSetPrimary = async (imageId: number) => {
    try {
      await adminMediaApi.setPrimaryImage(productId, imageId);
      await fetchImages();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to set primary");
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h3 className="font-display text-xl font-bold text-brand-earth-900">
          {productName ? `Images — ${productName}` : "Product Images"}
        </h3>
        <span className="text-sm text-brand-earth-700/70">{images.length} image(s)</span>
      </div>

      {/* Upload */}
      <div className="flex flex-wrap items-end gap-3 rounded-xl border border-brand-cream-200 bg-brand-cream-50 p-4">
        <div className="flex-1">
          <input
            type="file"
            accept="image/*,video/mp4,video/webm"
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            className="text-sm file:mr-3 file:rounded-full file:border-0 file:bg-brand-primary-700 file:px-3 file:py-1.5 file:text-sm file:font-semibold file:text-white"
          />
        </div>
        <input
          value={altText}
          onChange={(e) => setAltText(e.target.value)}
          placeholder="Alt text (optional)"
          className="w-48 rounded-lg border border-brand-cream-300 bg-white px-3 py-1.5 text-sm"
        />
        <button
          onClick={() => void handleUpload()}
          disabled={!file || uploading}
          className="rounded-lg bg-brand-primary-700 px-4 py-1.5 text-sm font-semibold text-white disabled:opacity-50"
        >
          {uploading ? "Uploading..." : "Upload"}
        </button>
      </div>

      {error && (
        <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>
      )}

      {/* Image Grid */}
      {loading ? (
        <p className="text-sm text-brand-earth-700/70">Loading images...</p>
      ) : images.length === 0 ? (
        <p className="text-sm text-brand-earth-700/70">No images yet. Upload one above.</p>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {images.map((img) => (
            <div
              key={img.id}
              className={`relative overflow-hidden rounded-xl border bg-white shadow-sm ${
                img.primary ? "border-brand-primary-400 ring-2 ring-brand-primary-200" : "border-brand-cream-200"
              }`}
            >
              <div className="relative aspect-square bg-brand-cream-100">
                {img.mediaType === "VIDEO" ? (
                  <video src={img.url} className="h-full w-full object-cover" preload="metadata" />
                ) : (
                  <img src={img.url} alt={img.altText || ""} className="h-full w-full object-cover" />
                )}
                {img.primary && (
                  <span className="absolute left-2 top-2 rounded-full bg-brand-primary-700 px-2 py-0.5 text-xs font-semibold text-white">
                    Primary
                  </span>
                )}
              </div>
              <div className="flex items-center justify-between gap-2 px-3 py-2">
                <span className="truncate text-xs text-brand-earth-700/70">
                  #{img.displayOrder} · {img.mediaType}
                </span>
                <div className="flex gap-1.5">
                  {!img.primary && (
                    <button
                      onClick={() => void handleSetPrimary(img.id)}
                      className="rounded border border-brand-cream-300 px-2 py-0.5 text-xs hover:bg-brand-cream-50"
                      title="Set as primary"
                    >
                      ★
                    </button>
                  )}
                  <button
                    onClick={() => void handleDelete(img.id)}
                    className="rounded border border-red-200 px-2 py-0.5 text-xs text-red-700 hover:bg-red-50"
                    title="Delete"
                  >
                    ✕
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
