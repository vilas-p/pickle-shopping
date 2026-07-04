import { http } from "@/shared/lib/http";
import type { PageResponse } from "@/shared/types/api";
import type { AdminContact, ContactHandledFilter } from "./types";

export const adminContactsApi = {
  list: (params?: { handled?: ContactHandledFilter; page?: number; size?: number }) => {
    const search = new URLSearchParams();
    search.set("page", String(params?.page ?? 0));
    search.set("size", String(params?.size ?? 10));
    search.set("sort", "createdAt,desc");

    if (params?.handled === "HANDLED") {
      search.set("handled", "true");
    }

    if (params?.handled === "UNHANDLED") {
      search.set("handled", "false");
    }

    return http<PageResponse<AdminContact>>(`/contacts?${search.toString()}`, {
      auth: "admin",
      cache: "no-store",
    });
  },

  markHandled: (contactId: number, handled: boolean) =>
    http<AdminContact>(`/contacts/${contactId}/handled?handled=${handled}`, {
      method: "PATCH",
      auth: "admin",
      cache: "no-store",
    }),
};