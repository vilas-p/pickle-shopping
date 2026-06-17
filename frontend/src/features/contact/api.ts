import { http } from "@/shared/lib/http";
import type { ContactPayload } from "./types";

export const contactsApi = {
  submit: (payload: ContactPayload) =>
    http<unknown>("/contacts", {
      method: "POST",
      body: JSON.stringify(payload),
      cache: "no-store",
    }),
};
