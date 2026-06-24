import { http } from "@/shared/lib/http";
import type { AddressBookEntry } from "./types";

export const addressBookApi = {
  listMine: () =>
    http<AddressBookEntry[]>("/customer-addresses", {
      method: "GET",
      auth: true,
      cache: "no-store",
    }),
};