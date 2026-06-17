import { http } from "@/shared/lib/http";
import type { Category } from "@/features/product/types";

export const categoriesApi = {
  list: () =>
    http<Category[]>("/categories", { revalidate: 300, tags: ["categories"] }),
};
