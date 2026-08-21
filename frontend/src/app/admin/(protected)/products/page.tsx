"use client";

import { useCallback, useEffect, useState } from "react";
import type { Product, Category } from "@/features/product/types";
import { adminProductsApi, type ProductFormData } from "@/features/admin/products/api";
import { ProductForm } from "@/features/admin/products/components/ProductForm";
import { ProductImageManager } from "@/features/admin/media/components/ProductImageManager";

type View = "list" | "create" | "edit" | "images";

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<View>("list");
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const data = await adminProductsApi.list();
      setProducts(data.content);
    } catch {
      setError("Failed to load products");
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchCategories = useCallback(async () => {
    try {
      const data = await adminProductsApi.listCategories();
      setCategories(data);
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    void fetchProducts();
    void fetchCategories();
  }, [fetchProducts, fetchCategories]);

  const handleCreate = async (data: ProductFormData) => {
    setSubmitting(true);
    setError(null);
    try {
      await adminProductsApi.create(data);
      setView("list");
      await fetchProducts();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to create product");
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdate = async (data: ProductFormData) => {
    if (!selectedProduct) return;
    setSubmitting(true);
    setError(null);
    try {
      await adminProductsApi.update(selectedProduct.id, data, selectedProduct.images);
      setView("list");
      setSelectedProduct(null);
      await fetchProducts();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to update product");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (product: Product) => {
    if (!confirm(`Delete "${product.name}"? This cannot be undone.`)) return;
    try {
      await adminProductsApi.delete(product.id);
      await fetchProducts();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to delete product");
    }
  };

  const openEdit = async (product: Product) => {
    try {
      const full = await adminProductsApi.getById(product.id);
      setSelectedProduct(full);
      setView("edit");
    } catch {
      setError("Failed to load product details");
    }
  };

  const openImages = async (product: Product) => {
    try {
      const full = await adminProductsApi.getById(product.id);
      setSelectedProduct(full);
      setView("images");
    } catch {
      setError("Failed to load product");
    }
  };

  if (view === "create") {
    return (
      <div className="space-y-4">
        <h1 className="font-display text-3xl font-bold text-brand-earth-900">Add New Product</h1>
        {error && <ErrorBanner message={error} />}
        <div className="rounded-2xl border border-brand-cream-200 bg-white p-6">
          <ProductForm
            categories={categories}
            onSubmit={handleCreate}
            onCancel={() => { setView("list"); setError(null); }}
            submitting={submitting}
          />
        </div>
      </div>
    );
  }

  if (view === "edit" && selectedProduct) {
    return (
      <div className="space-y-4">
        <h1 className="font-display text-3xl font-bold text-brand-earth-900">
          Edit: {selectedProduct.name}
        </h1>
        {error && <ErrorBanner message={error} />}
        <div className="rounded-2xl border border-brand-cream-200 bg-white p-6">
          <ProductForm
            product={selectedProduct}
            categories={categories}
            onSubmit={handleUpdate}
            onCancel={() => { setView("list"); setSelectedProduct(null); setError(null); }}
            submitting={submitting}
          />
        </div>
      </div>
    );
  }

  if (view === "images" && selectedProduct) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="font-display text-3xl font-bold text-brand-earth-900">
            Images: {selectedProduct.name}
          </h1>
          <button onClick={() => { setView("list"); setSelectedProduct(null); }} className="btn-secondary">
            ← Back to Products
          </button>
        </div>
        <div className="rounded-2xl border border-brand-cream-200 bg-white p-6">
          <ProductImageManager productId={selectedProduct.id} productName={selectedProduct.name} />
        </div>
      </div>
    );
  }

  // List view
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-3xl font-bold text-brand-earth-900">Products</h1>
        <button onClick={() => { setView("create"); setError(null); }} className="btn-primary">
          + Add Product
        </button>
      </div>

      {error && <ErrorBanner message={error} />}

      {loading ? (
        <p className="text-sm text-brand-earth-700/70">Loading products...</p>
      ) : products.length === 0 ? (
        <p className="text-sm text-brand-earth-700/70">No products found. Create one above.</p>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-brand-cream-200 bg-white">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-brand-cream-200 bg-brand-cream-50">
              <tr>
                <th className="px-4 py-3 font-semibold text-brand-earth-900">Product</th>
                <th className="px-4 py-3 font-semibold text-brand-earth-900">Price</th>
                <th className="px-4 py-3 font-semibold text-brand-earth-900">Category</th>
                <th className="px-4 py-3 font-semibold text-brand-earth-900">Status</th>
                <th className="px-4 py-3 font-semibold text-brand-earth-900">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-cream-100">
              {products.map((p) => (
                <tr key={p.id} className="hover:bg-brand-cream-50/50">
                  <td className="px-4 py-3">
                    <p className="font-medium text-brand-earth-900">{p.name}</p>
                    <p className="text-xs text-brand-earth-700/70">{p.slug}</p>
                  </td>
                  <td className="px-4 py-3 text-brand-earth-900">₹{p.price}</td>
                  <td className="px-4 py-3 text-brand-earth-700">{p.category?.name}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-semibold ${
                      p.active ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-600"
                    }`}>
                      {p.active ? "Active" : "Inactive"}
                    </span>
                    {p.featured && (
                      <span className="ml-1 inline-flex rounded-full bg-yellow-100 px-2 py-0.5 text-xs font-semibold text-yellow-800">
                        Featured
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <button
                        onClick={() => void openEdit(p)}
                        className="rounded-lg border border-brand-cream-300 px-2.5 py-1 text-xs font-medium text-brand-earth-700 hover:bg-brand-cream-50"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => void openImages(p)}
                        className="rounded-lg border border-brand-cream-300 px-2.5 py-1 text-xs font-medium text-brand-earth-700 hover:bg-brand-cream-50"
                      >
                        Images
                      </button>
                      <button
                        onClick={() => void handleDelete(p)}
                        className="rounded-lg border border-red-200 px-2.5 py-1 text-xs font-medium text-red-700 hover:bg-red-50"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function ErrorBanner({ message }: { message: string }) {
  return (
    <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
      {message}
    </div>
  );
}
