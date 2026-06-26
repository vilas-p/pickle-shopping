import { http } from "@/shared/lib/http";
import type { AddressBookEntry, AddressBookEntryInput } from "./types";

export const addressBookApi = {
  listMine: () =>
    http<AddressBookEntry[]>("/customer-addresses", {
      method: "GET",
      auth: true,
      cache: "no-store",
    }),
  createMine: (input: AddressBookEntryInput) =>
    http<AddressBookEntry>("/customer-addresses", {
      method: "POST",
      auth: true,
      body: JSON.stringify(input),
      cache: "no-store",
    }),
  updateMine: (addressId: number, input: AddressBookEntryInput) =>
    http<AddressBookEntry>(`/customer-addresses/${addressId}`, {
      method: "PUT",
      auth: true,
      body: JSON.stringify(input),
      cache: "no-store",
    }),
  deleteMine: (addressId: number) =>
    http<void>(`/customer-addresses/${addressId}`, {
      method: "DELETE",
      auth: true,
      cache: "no-store",
    }),
};