"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { AddToCartInput, CartLine } from "./types";

export const CART_STORAGE_KEY = "aap-cart-v1";
const MAX_QTY_PER_LINE = 99;
const GUEST_OWNER_KEY = "guest";

interface PersistedCartState {
  itemsByOwner: Record<string, CartLine[]>;
  activeOwnerKey: string;
}

function ownerItems(itemsByOwner: Record<string, CartLine[]>, ownerKey: string): CartLine[] {
  return itemsByOwner[ownerKey] ?? [];
}

function updateOwnerItems(
  itemsByOwner: Record<string, CartLine[]>,
  ownerKey: string,
  items: CartLine[]
): Record<string, CartLine[]> {
  if (items.length === 0) {
    const next = { ...itemsByOwner };
    delete next[ownerKey];
    return next;
  }
  return { ...itemsByOwner, [ownerKey]: items };
}

function matchesLine(l: CartLine, productId: number, variantId?: number) {
  return l.productId === productId && l.variantId === variantId;
}

interface CartState {
  items: CartLine[];
  itemsByOwner: Record<string, CartLine[]>;
  activeOwnerKey: string;
  hasHydrated: boolean;
  setHasHydrated: (v: boolean) => void;
  setOwnerKey: (ownerKey: string) => void;
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
      itemsByOwner: {},
      activeOwnerKey: GUEST_OWNER_KEY,
      hasHydrated: false,
      setHasHydrated: (v) => set({ hasHydrated: v }),
      setOwnerKey: (ownerKey) =>
        set((state) => ({
          activeOwnerKey: ownerKey,
          items: ownerItems(state.itemsByOwner, ownerKey),
        })),
      add: (input) =>
        set((state) => {
          const addQty = clampQty(input.quantity ?? 1);
          const currentItems = ownerItems(state.itemsByOwner, state.activeOwnerKey);
          const existing = currentItems.find((l) =>
            matchesLine(l, input.id, input.variantId)
          );
          if (existing) {
            const nextItems = currentItems.map((l) =>
              matchesLine(l, input.id, input.variantId)
                ? { ...l, quantity: clampQty(l.quantity + addQty) }
                : l
            );
            return {
              items: nextItems,
              itemsByOwner: updateOwnerItems(state.itemsByOwner, state.activeOwnerKey, nextItems),
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
          const nextItems = [...currentItems, line];
          return {
            items: nextItems,
            itemsByOwner: updateOwnerItems(state.itemsByOwner, state.activeOwnerKey, nextItems),
          };
        }),
      setQuantity: (productId, quantity, variantId) =>
        set((state) => {
          const nextItems = ownerItems(state.itemsByOwner, state.activeOwnerKey).map((l) =>
            matchesLine(l, productId, variantId)
              ? { ...l, quantity: clampQty(quantity) }
              : l
          );
          return {
            items: nextItems,
            itemsByOwner: updateOwnerItems(state.itemsByOwner, state.activeOwnerKey, nextItems),
          };
        }),
      increment: (productId, variantId) =>
        set((state) => {
          const nextItems = ownerItems(state.itemsByOwner, state.activeOwnerKey).map((l) =>
            matchesLine(l, productId, variantId)
              ? { ...l, quantity: clampQty(l.quantity + 1) }
              : l
          );
          return {
            items: nextItems,
            itemsByOwner: updateOwnerItems(state.itemsByOwner, state.activeOwnerKey, nextItems),
          };
        }),
      decrement: (productId, variantId) =>
        set((state) => {
          const nextItems = ownerItems(state.itemsByOwner, state.activeOwnerKey)
            .map((l) =>
              matchesLine(l, productId, variantId)
                ? { ...l, quantity: l.quantity - 1 }
                : l
            )
            .filter((l) => l.quantity > 0);
          return {
            items: nextItems,
            itemsByOwner: updateOwnerItems(state.itemsByOwner, state.activeOwnerKey, nextItems),
          };
        }),
      remove: (productId, variantId) =>
        set((state) => {
          const nextItems = ownerItems(state.itemsByOwner, state.activeOwnerKey)
            .filter((l) => !matchesLine(l, productId, variantId));
          return {
            items: nextItems,
            itemsByOwner: updateOwnerItems(state.itemsByOwner, state.activeOwnerKey, nextItems),
          };
        }),
      clear: () =>
        set((state) => ({
          items: [],
          itemsByOwner: updateOwnerItems(state.itemsByOwner, state.activeOwnerKey, []),
        })),
    }),
    {
      name: CART_STORAGE_KEY,
      storage: createJSONStorage(() => localStorage),
      version: 3,
      migrate: (persisted: unknown, version: number) => {
        const state = (persisted ?? {}) as Partial<CartState> & { items?: CartLine[] };
        if (version < 3) {
          return {
            itemsByOwner: state.itemsByOwner ?? (state.items ? { [GUEST_OWNER_KEY]: state.items } : {}),
            activeOwnerKey: GUEST_OWNER_KEY,
          } satisfies PersistedCartState;
        }
        return {
          itemsByOwner: state.itemsByOwner ?? {},
          activeOwnerKey: state.activeOwnerKey ?? GUEST_OWNER_KEY,
        } satisfies PersistedCartState;
      },
      partialize: (state) => ({
        itemsByOwner: state.itemsByOwner,
        activeOwnerKey: state.activeOwnerKey,
      }),
      onRehydrateStorage: () => (state) => {
        if (!state) return;
        const items = ownerItems(state.itemsByOwner, state.activeOwnerKey);
        state.items = items;
        state.setHasHydrated(true);
      },
    }
  )
);

export const selectItems = (s: CartState) => s.items;
export const selectCount = (s: CartState) =>
  s.items.reduce((n, l) => n + l.quantity, 0);
export const selectSubtotal = (s: CartState) =>
  s.items.reduce((sum, l) => sum + l.unitPrice * l.quantity, 0);
