"use client";

import { useEffect, useState } from "react";
import type { Product, Category } from "@/features/product/types";
import type { ProductFormData, ProductVariantFormData } from "../api";

interface Props {
  product?: Product | null;
  categories: Category[];
  onSubmit: (data: ProductFormData) => Promise<void>;
  onCancel: () => void;
  submitting?: boolean;
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

let nextVariantKey = -1;

function toVariantRow(variant?: { id?: number; weight: string; price: number; compareAtPrice?: number; sku?: string; active: boolean }) {
  return {
    key: variant?.id ?? nextVariantKey--,
    id: variant?.id,
    weight: variant?.weight ?? "",
    price: variant?.price?.toString() ?? "",
    compareAtPrice: variant?.compareAtPrice?.toString() ?? "",
    sku: variant?.sku ?? "",
    active: variant?.active ?? true,
  };
}

export function ProductForm({ product, categories, onSubmit, onCancel, submitting }: Props) {
  const [name, setName] = useState(product?.name ?? "");
  const [slug, setSlug] = useState(product?.slug ?? "");
  const [shortDescription, setShortDescription] = useState(product?.shortDescription ?? "");
  const [description, setDescription] = useState(product?.description ?? "");
  const [ingredients, setIngredients] = useState(product?.ingredients ?? "");
  const [shelfLife, setShelfLife] = useState(product?.shelfLife ?? "");
  const [price, setPrice] = useState(product?.price?.toString() ?? "");
  const [compareAtPrice, setCompareAtPrice] = useState(product?.compareAtPrice?.toString() ?? "");
  const [weight, setWeight] = useState(product?.weight ?? "");
  const [categoryId, setCategoryId] = useState(product?.category?.id?.toString() ?? "");
  const [active, setActive] = useState(product?.active ?? true);
  const [featured, setFeatured] = useState(product?.featured ?? false);
  const [autoSlug, setAutoSlug] = useState(!product);
  const [variantRows, setVariantRows] = useState(() =>
    (product?.variants ?? []).map((v) => toVariantRow(v))
  );

  useEffect(() => {
    if (autoSlug) {
      setSlug(slugify(name));
    }
  }, [name, autoSlug]);

  const addVariantRow = () => {
    setVariantRows((rows) => [...rows, toVariantRow()]);
  };

  const removeVariantRow = (key: number) => {
    setVariantRows((rows) => rows.filter((r) => r.key !== key));
  };

  const updateVariantRow = (key: number, patch: Partial<ReturnType<typeof toVariantRow>>) => {
    setVariantRows((rows) => rows.map((r) => (r.key === key ? { ...r, ...patch } : r)));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const variants: ProductVariantFormData[] = variantRows.map((row) => ({
      id: row.id,
      weight: row.weight.trim(),
      sku: row.sku.trim() || undefined,
      price: parseFloat(row.price),
      compareAtPrice: row.compareAtPrice ? parseFloat(row.compareAtPrice) : undefined,
      active: row.active,
    }));
    await onSubmit({
      name: name.trim(),
      slug: slug.trim(),
      shortDescription: shortDescription.trim(),
      description: description.trim() || undefined,
      ingredients: ingredients.trim() || undefined,
      shelfLife: shelfLife.trim() || undefined,
      price: parseFloat(price),
      compareAtPrice: compareAtPrice ? parseFloat(compareAtPrice) : undefined,
      weight: weight.trim(),
      categoryId: Number(categoryId),
      active,
      featured,
      variants,
    });
  };

  return (
    <form onSubmit={(e) => void handleSubmit(e)} className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2">
        {/* Name */}
        <div>
          <label className="text-sm font-semibold text-brand-earth-900">Product Name *</label>
          <input
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Mango Pickle"
            className="mt-1 w-full rounded-xl border border-brand-cream-300 bg-white px-3 py-2 text-sm"
          />
        </div>

        {/* Slug */}
        <div>
          <label className="text-sm font-semibold text-brand-earth-900">
            Slug *
            {!product && (
              <button
                type="button"
                onClick={() => setAutoSlug(!autoSlug)}
                className="ml-2 text-xs text-brand-primary-600 underline"
              >
                {autoSlug ? "edit manually" : "auto-generate"}
              </button>
            )}
          </label>
          <input
            required
            value={slug}
            onChange={(e) => { setAutoSlug(false); setSlug(e.target.value); }}
            placeholder="mango-pickle"
            pattern="^[a-z0-9-]+$"
            className="mt-1 w-full rounded-xl border border-brand-cream-300 bg-white px-3 py-2 text-sm"
          />
        </div>

        {/* Price */}
        <div>
          <label className="text-sm font-semibold text-brand-earth-900">Price (₹) *</label>
          <input
            required
            type="number"
            step="0.01"
            min="0.01"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            placeholder="249.00"
            className="mt-1 w-full rounded-xl border border-brand-cream-300 bg-white px-3 py-2 text-sm"
          />
        </div>

        {/* Compare at Price */}
        <div>
          <label className="text-sm font-semibold text-brand-earth-900">Compare-at Price (₹)</label>
          <input
            type="number"
            step="0.01"
            min="0"
            value={compareAtPrice}
            onChange={(e) => setCompareAtPrice(e.target.value)}
            placeholder="299.00 (strikethrough price)"
            className="mt-1 w-full rounded-xl border border-brand-cream-300 bg-white px-3 py-2 text-sm"
          />
        </div>

        {/* Weight */}
        <div>
          <label className="text-sm font-semibold text-brand-earth-900">Weight *</label>
          <input
            required
            value={weight}
            onChange={(e) => setWeight(e.target.value)}
            placeholder="250g"
            className="mt-1 w-full rounded-xl border border-brand-cream-300 bg-white px-3 py-2 text-sm"
          />
        </div>

        {/* Category */}
        <div>
          <label className="text-sm font-semibold text-brand-earth-900">Category *</label>
          <select
            required
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            className="mt-1 w-full rounded-xl border border-brand-cream-300 bg-white px-3 py-2 text-sm"
          >
            <option value="">Select a category</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>

        {/* Shelf Life */}
        <div>
          <label className="text-sm font-semibold text-brand-earth-900">Shelf Life</label>
          <input
            value={shelfLife}
            onChange={(e) => setShelfLife(e.target.value)}
            placeholder="12 months refrigerated"
            className="mt-1 w-full rounded-xl border border-brand-cream-300 bg-white px-3 py-2 text-sm"
          />
        </div>

        {/* Toggles */}
        <div className="flex items-center gap-6 pt-5">
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={active}
              onChange={(e) => setActive(e.target.checked)}
              className="h-4 w-4 rounded border-brand-cream-300"
            />
            <span className="font-medium text-brand-earth-900">Active</span>
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={featured}
              onChange={(e) => setFeatured(e.target.checked)}
              className="h-4 w-4 rounded border-brand-cream-300"
            />
            <span className="font-medium text-brand-earth-900">Featured</span>
          </label>
        </div>
      </div>

      {/* Variants (weight options) */}
      <div>
        <div className="flex items-center justify-between">
          <label className="text-sm font-semibold text-brand-earth-900">
            Weight Options (Variants)
          </label>
          <button type="button" onClick={addVariantRow} className="text-xs font-medium text-brand-primary-600 underline">
            + Add Variant
          </button>
        </div>
        <p className="mt-1 text-xs text-brand-earth-700/70">
          Optional additional weight/price options shown to customers. The Weight and Price
          fields above are used when no variants are added.
        </p>
        {variantRows.length > 0 && (
          <div className="mt-3 space-y-2">
            {variantRows.map((row) => (
              <div key={row.key} className="flex items-center gap-2 rounded-xl border border-brand-cream-300 bg-white p-2">
                <input
                  required
                  value={row.weight}
                  onChange={(e) => updateVariantRow(row.key, { weight: e.target.value })}
                  placeholder="500g"
                  className="w-28 rounded-lg border border-brand-cream-300 px-2 py-1.5 text-sm"
                />
                <input
                  required
                  type="number"
                  step="0.01"
                  min="0.01"
                  value={row.price}
                  onChange={(e) => updateVariantRow(row.key, { price: e.target.value })}
                  placeholder="Price (₹)"
                  className="w-32 rounded-lg border border-brand-cream-300 px-2 py-1.5 text-sm"
                />
                <label className="flex items-center gap-1.5 text-xs whitespace-nowrap">
                  <input
                    type="checkbox"
                    checked={row.active}
                    onChange={(e) => updateVariantRow(row.key, { active: e.target.checked })}
                    className="h-4 w-4 rounded border-brand-cream-300"
                  />
                  Active
                </label>
                <button
                  type="button"
                  onClick={() => removeVariantRow(row.key)}
                  className="ml-auto text-xs font-medium text-red-600 underline"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Short Description */}
      <div>
        <label className="text-sm font-semibold text-brand-earth-900">Short Description *</label>
        <textarea
          required
          value={shortDescription}
          onChange={(e) => setShortDescription(e.target.value)}
          rows={2}
          placeholder="A brief summary shown in product cards"
          className="mt-1 w-full rounded-xl border border-brand-cream-300 bg-white px-3 py-2 text-sm"
        />
      </div>

      {/* Full Description */}
      <div>
        <label className="text-sm font-semibold text-brand-earth-900">Full Description</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={4}
          placeholder="Detailed product description shown on the product page"
          className="mt-1 w-full rounded-xl border border-brand-cream-300 bg-white px-3 py-2 text-sm"
        />
      </div>

      {/* Ingredients */}
      <div>
        <label className="text-sm font-semibold text-brand-earth-900">Ingredients</label>
        <textarea
          value={ingredients}
          onChange={(e) => setIngredients(e.target.value)}
          rows={2}
          placeholder="Raw mangoes, mustard oil, spices..."
          className="mt-1 w-full rounded-xl border border-brand-cream-300 bg-white px-3 py-2 text-sm"
        />
      </div>

      {/* Buttons */}
      <div className="flex gap-3 pt-2">
        <button
          type="submit"
          disabled={submitting}
          className="btn-primary disabled:opacity-60"
        >
          {submitting ? "Saving..." : product ? "Update Product" : "Create Product"}
        </button>
        <button type="button" onClick={onCancel} className="btn-secondary">
          Cancel
        </button>
      </div>
    </form>
  );
}
