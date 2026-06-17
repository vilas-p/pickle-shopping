"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { AddToCartInput, CartLine } from "./types";

export const CART_STORAGE_KEY = "aap-cart-v1";
const MAX_QTY_PER_LINE = 99;

function lineKey(productId: number, variantId?: number) {
  return variantId ? `${productId}:${variantId}` : `${productId}`;
}

function matchesLine(l: CartLine, productId: number, variantId?: number) {
  return l.productId === productId && l.variantId === variantId;
}

interface CartState {
  items: CartLine[];
  hasHydrated: boolean;
  setHasHydrated: (v: boolean) => void;
  add: (input: AddToCartInput) => void;
  setQuantity: (productId: number, quantity: number, variantId?: number) => void;
  increment: (productId: number, variantId?: number) => void;
  decrement: (productId: number, variantId?: number) => void;
  remove: (productId: number, variantId?: number) => void;
  clear: () => void;
}

function clampQty(q: number): number {
  if (!Number.isFinite(q) || q < 1) return 1;
  if (q > MAX_QTY_PER_LINE) return MAX_QTY_PER_LINE;
  return Math.floor(q);
}

export const useCartStore = create<CartState>()(
  persist(
    (set) => ({
      items: [],
      hasHydrated: false,
      setHasHydrated: (v) => set({ hasHydrated: v }),
      add: (input) =>
        set((state) => {
          const addQty = clampQty(input.quantity ?? 1);
          const existing = state.items.find((l) =>
            matchesLine(l, input.id, input.variantId)
          );
          if (existing) {
            return {
              items: state.items.map((l) =>
                matchesLine(l, input.id, input.variantId)
                  ? { ...l, quantity: clampQty(l.quantity + addQty) }
                  : l
              ),
            };
          }
          const line: CartLine = {
            productId: input.id,
            variantId: input.variantId,
            slug: input.slug,
            name: input.name,
            unitPrice: input.price,
            weight: input.weight,
            image: input.image,
            quantity: addQty,
          };
          return { items: [...state.items, line] };
        }),
      setQuantity: (productId, quantity, variantId) =>
        set((state) => ({
          items: state.items.map((l) =>
            matchesLine(l, productId, variantId)
              ? { ...l, quantity: clampQty(quantity) }
              : l
          ),
        })),
      increment: (productId, variantId) =>
        set((state) => ({
          items: state.items.map((l) =>
            matchesLine(l, productId, variantId)
              ? { ...l, quantity: clampQty(l.quantity + 1) }
              : l
          ),
        })),
      decrement: (productId, variantId) =>
        set((state) => ({
          items: state.items
            .map((l) =>
              matchesLine(l, productId, variantId)
                ? { ...l, quantity: l.quantity - 1 }
                : l
            )
            .filter((l) => l.quantity > 0),
        })),
      remove: (productId, variantId) =>
        set((state) => ({
          items: state.items.filter((l) => !matchesLine(l, productId, variantId)),
        })),
      clear: () => set({ items: [] }),
    }),
    {
      name: CART_STORAGE_KEY,
      storage: createJSONStorage(() => localStorage),
      version: 2,
      migrate: (persisted: unknown, version: number) => {
        if (version < 2) {
          // v1 -> v2: CartLine gained optional variantId; existing lines are fine without it
          return persisted as CartState;
        }
        return persisted as CartState;
      },
      partialize: (state) => ({ items: state.items }),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    }
  )
);

export const selectItems = (s: CartState) => s.items;
export const selectCount = (s: CartState) =>
  s.items.reduce((n, l) => n + l.quantity, 0);
export const selectSubtotal = (s: CartState) =>
  s.items.reduce((sum, l) => sum + l.unitPrice * l.quantity, 0);
