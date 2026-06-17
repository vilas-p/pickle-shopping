"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import type { Category } from "@/features/product/types";

interface Props {
  categories: Category[];
}

export function ProductFilters({ categories }: Props) {
  const router = useRouter();
  const params = useSearchParams();
  const [search, setSearch] = useState(params.get("search") ?? "");
  const [category, setCategory] = useState(params.get("category") ?? "");
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    setSearch(params.get("search") ?? "");
    setCategory(params.get("category") ?? "");
  }, [params]);

  const apply = (next: { search?: string; category?: string }) => {
    const sp = new URLSearchParams(Array.from(params.entries()));
    if (next.search !== undefined) {
      if (next.search) sp.set("search", next.search);
      else sp.delete("search");
    }
    if (next.category !== undefined) {
      if (next.category) sp.set("category", next.category);
      else sp.delete("category");
    }
    sp.delete("page");
    startTransition(() => router.push(`/products?${sp.toString()}`));
  };

  return (
    <form
      className="card-warm flex flex-col gap-3 sm:flex-row sm:items-end"
      onSubmit={(e) => {
        e.preventDefault();
        apply({ search, category });
      }}
    >
      <div className="flex-1">
        <label htmlFor="search" className="label-field">Search pickles</label>
        <input
          id="search"
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="e.g. mango, lemon…"
          className="input-field"
        />
      </div>
      <div className="sm:w-56">
        <label htmlFor="category" className="label-field">Category</label>
        <select
          id="category"
          value={category}
          onChange={(e) => {
            setCategory(e.target.value);
            apply({ category: e.target.value });
          }}
          className="input-field"
        >
          <option value="">All categories</option>
          {categories.map((c) => (
            <option key={c.id} value={c.slug}>{c.name}</option>
          ))}
        </select>
      </div>
      <button type="submit" className="btn-primary sm:w-32" disabled={isPending}>
        {isPending ? "…" : "Search"}
      </button>
    </form>
  );
}
