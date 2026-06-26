"use client";

import { useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import { addressBookApi } from "@/features/address/api";
import type { AddressBookEntry, AddressBookEntryInput } from "@/features/address/types";
import { authApi } from "@/features/auth/api";
import { AuthGuard } from "@/features/auth/components/AuthGuard";
import { useAuthStore, selectCustomer } from "@/features/auth/store";
import { useApiSubmit } from "@/shared/hooks/useApiSubmit";
import { ROUTES } from "@/shared/constants/routes";
import { INDIA_STATES } from "@/shared/constants/india-states";

interface ProfileFields {
  fullName: string;
  email: string;
  phone: string;
}

interface AddressFields {
  line1: string;
  line2: string;
  city: string;
  state: string;
  pincode: string;
  landmark: string;
  defaultAddress: boolean;
}

const EMPTY_PROFILE: ProfileFields = {
  fullName: "",
  email: "",
  phone: "",
};

const EMPTY_ADDRESS: AddressFields = {
  line1: "",
  line2: "",
  city: "",
  state: "",
  pincode: "",
  landmark: "",
  defaultAddress: false,
};

function isPlaceholderEmail(email: string): boolean {
  return email.endsWith("@appaamma.local");
}

function toAddressInput(fields: AddressFields): AddressBookEntryInput {
  return {
    line1: fields.line1.trim(),
    line2: fields.line2.trim() || undefined,
    city: fields.city.trim(),
    state: fields.state.trim(),
    pincode: fields.pincode.trim(),
    landmark: fields.landmark.trim() || undefined,
    defaultAddress: fields.defaultAddress,
  };
}

function fromAddress(address: AddressBookEntry): AddressFields {
  return {
    line1: address.line1,
    line2: address.line2 ?? "",
    city: address.city,
    state: address.state,
    pincode: address.pincode,
    landmark: address.landmark ?? "",
    defaultAddress: address.defaultAddress,
  };
}

export default function AccountPage() {
  return (
    <AuthGuard>
      <AccountContent />
    </AuthGuard>
  );
}

function AccountContent() {
  const customer = useAuthStore(selectCustomer);
  const hasHydrated = useAuthStore((s) => s.hasHydrated);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated());
  const setCustomer = useAuthStore((s) => s.setCustomer);
  const clear = useAuthStore((s) => s.clear);
  const [profileFields, setProfileFields] = useState<ProfileFields>(EMPTY_PROFILE);
  const [addressFields, setAddressFields] = useState<AddressFields>(EMPTY_ADDRESS);
  const [profileError, setProfileError] = useState("");
  const [addressError, setAddressError] = useState("");
  const [addresses, setAddresses] = useState<AddressBookEntry[]>([]);
  const [isLoadingAddresses, setIsLoadingAddresses] = useState(false);
  const [editingAddressId, setEditingAddressId] = useState<number | null>(null);
  const [deletingAddressId, setDeletingAddressId] = useState<number | null>(null);
  const profileSubmit = useApiSubmit(authApi.updateMe, { successMessage: "Account details updated." });
  const createAddressSubmit = useApiSubmit(addressBookApi.createMine, { successMessage: "Address saved." });
  const updateAddressSubmit = useApiSubmit(
    ({ addressId, input }: { addressId: number; input: AddressBookEntryInput }) =>
      addressBookApi.updateMine(addressId, input),
    { successMessage: "Address updated." }
  );

  useEffect(() => {
    if (!customer) {
      return;
    }

    setProfileFields({
      fullName: customer.fullName,
      email: isPlaceholderEmail(customer.email) ? "" : customer.email,
      phone: customer.phone,
    });
  }, [customer]);

  useEffect(() => {
    if (!hasHydrated || !isAuthenticated) {
      return;
    }

    let cancelled = false;
    setIsLoadingAddresses(true);

    void addressBookApi.listMine()
      .then((items) => {
        if (!cancelled) {
          setAddresses(items);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setAddresses([]);
        }
      })
      .finally(() => {
        if (!cancelled) {
          setIsLoadingAddresses(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [hasHydrated, isAuthenticated]);

  const onProfileSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setProfileError("");

    const fullName = profileFields.fullName.trim();
    const email = profileFields.email.trim();
    const phone = profileFields.phone.replace(/\D/g, "");

    if (!fullName) {
      setProfileError("Full name is required.");
      return;
    }

    if (!email) {
      setProfileError("Email is required.");
      return;
    }

    if (!/^[0-9]{10}$/.test(phone)) {
      setProfileError("Phone must be 10 digits.");
      return;
    }

    const updated = await profileSubmit.submit({ fullName, email, phone });
    if (updated) {
      setCustomer(updated);
    }
  };

  const resetAddressForm = () => {
    setEditingAddressId(null);
    setAddressFields(EMPTY_ADDRESS);
    setAddressError("");
    createAddressSubmit.reset();
    updateAddressSubmit.reset();
  };

  const onAddressSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setAddressError("");

    const input = toAddressInput(addressFields);
    if (!input.line1 || !input.city || !input.state || !input.pincode) {
      setAddressError("Line 1, city, state, and pincode are required.");
      return;
    }

    if (!/^[1-9][0-9]{5}$/.test(input.pincode)) {
      setAddressError("Pincode must be 6 digits.");
      return;
    }

    const saved = editingAddressId == null
      ? await createAddressSubmit.submit(input)
      : await updateAddressSubmit.submit({ addressId: editingAddressId, input });

    if (!saved) {
      return;
    }

    setAddresses((prev) => {
      const next = editingAddressId == null
        ? [...prev, saved]
        : prev.map((address) => (address.id === saved.id ? saved : address));

      return saved.defaultAddress
        ? next.map((address) => ({
            ...address,
            defaultAddress: address.id === saved.id,
          }))
        : next;
    });
    resetAddressForm();
  };

  const startEditingAddress = (address: AddressBookEntry) => {
    setEditingAddressId(address.id);
    setAddressFields(fromAddress(address));
    setAddressError("");
    createAddressSubmit.reset();
    updateAddressSubmit.reset();
  };

  const onDeleteAddress = async (addressId: number) => {
    setDeletingAddressId(addressId);
    setAddressError("");
    try {
      await addressBookApi.deleteMine(addressId);
      setAddresses((prev) => prev.filter((address) => address.id !== addressId));
      if (editingAddressId === addressId) {
        resetAddressForm();
      }
    } catch (error) {
      setAddressError(error instanceof Error ? error.message : "Unable to delete address.");
    } finally {
      setDeletingAddressId(null);
    }
  };

  const addressSubmitStatus = editingAddressId == null ? createAddressSubmit.status : updateAddressSubmit.status;
  const addressSubmitMessage = editingAddressId == null ? createAddressSubmit.message : updateAddressSubmit.message;

  return (
    <section className="container-page py-12">
      <header className="mb-8">
        <h1 className="font-display text-3xl font-bold text-brand-earth-900 sm:text-4xl">
          My account
        </h1>
        {customer && (
          <p className="mt-2 text-brand-earth-700/80">
            Welcome back, {customer.fullName}!
          </p>
        )}
      </header>

      <div className="grid gap-8 lg:grid-cols-[minmax(0,1.4fr)_minmax(320px,0.9fr)]">
        <div className="space-y-8">
          <form onSubmit={onProfileSubmit} className="card-warm space-y-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="font-display text-2xl font-bold text-brand-earth-900">Your details</h2>
                <p className="mt-1 text-sm text-brand-earth-700/70">
                  Update your name, email, and phone number used for orders.
                </p>
              </div>
              <button
                type="submit"
                disabled={profileSubmit.status === "submitting"}
                className="btn-primary"
              >
                {profileSubmit.status === "submitting" ? "Saving..." : "Save details"}
              </button>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <label>
                <span className="label-field">Full name</span>
                <input
                  value={profileFields.fullName}
                  onChange={(event) => setProfileFields((prev) => ({ ...prev, fullName: event.target.value }))}
                  className="input-field"
                  autoComplete="name"
                />
              </label>

              <label>
                <span className="label-field">Phone number</span>
                <input
                  value={profileFields.phone}
                  onChange={(event) => setProfileFields((prev) => ({ ...prev, phone: event.target.value }))}
                  className="input-field"
                  inputMode="numeric"
                  autoComplete="tel"
                />
              </label>
            </div>

            <label className="block">
              <span className="label-field">Email address</span>
              <input
                value={profileFields.email}
                onChange={(event) => setProfileFields((prev) => ({ ...prev, email: event.target.value }))}
                className="input-field"
                autoComplete="email"
              />
            </label>

            {profileError && <p className="text-sm text-red-700">{profileError}</p>}
            {profileSubmit.message && (
              <p className={`text-sm ${profileSubmit.status === "error" ? "text-red-700" : "text-brand-leaf-700"}`}>
                {profileSubmit.message}
              </p>
            )}
          </form>

          <div className="card-warm space-y-6">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <h2 className="font-display text-2xl font-bold text-brand-earth-900">Saved addresses</h2>
                <p className="mt-1 text-sm text-brand-earth-700/70">
                  Manage your shipping addresses for faster checkout.
                </p>
              </div>
              <button type="button" onClick={resetAddressForm} className="btn-secondary">
                Add new address
              </button>
            </div>

            {isLoadingAddresses ? (
              <div className="grid gap-3">
                <div className="h-24 animate-pulse rounded-brand bg-brand-cream-100" />
                <div className="h-24 animate-pulse rounded-brand bg-brand-cream-100" />
              </div>
            ) : addresses.length > 0 ? (
              <div className="grid gap-3">
                {addresses.map((address) => (
                  <article key={address.id} className="rounded-brand border border-brand-cream-200 bg-white p-4">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="text-sm text-brand-earth-700/85">
                        <p className="font-semibold text-brand-earth-900">
                          {address.defaultAddress ? "Default address" : "Saved address"}
                        </p>
                        <p>{address.line1}</p>
                        {address.line2 && <p>{address.line2}</p>}
                        <p>
                          {address.city}, {address.state} {address.pincode}
                        </p>
                        {address.landmark && <p>Landmark: {address.landmark}</p>}
                      </div>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => startEditingAddress(address)}
                          className="btn-ghost"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => void onDeleteAddress(address.id)}
                          disabled={deletingAddressId === address.id}
                          className="btn-ghost text-red-700 hover:bg-red-50 hover:text-red-800"
                        >
                          {deletingAddressId === address.id ? "Deleting..." : "Delete"}
                        </button>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            ) : (
              <p className="text-sm text-brand-earth-700/70">
                No saved addresses yet. Add one here and it will be available during checkout.
              </p>
            )}

            <form onSubmit={onAddressSubmit} className="rounded-brand border border-brand-cream-200 bg-brand-cream-50/70 p-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="font-display text-xl font-semibold text-brand-earth-900">
                    {editingAddressId == null ? "Add address" : "Edit address"}
                  </h3>
                  <p className="mt-1 text-sm text-brand-earth-700/70">
                    Store complete delivery details for future orders.
                  </p>
                </div>
                {editingAddressId != null && (
                  <button type="button" onClick={resetAddressForm} className="btn-ghost">
                    Cancel
                  </button>
                )}
              </div>

              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <label className="sm:col-span-2">
                  <span className="label-field">Address line 1</span>
                  <input
                    value={addressFields.line1}
                    onChange={(event) => setAddressFields((prev) => ({ ...prev, line1: event.target.value }))}
                    className="input-field"
                    autoComplete="address-line1"
                  />
                </label>

                <label className="sm:col-span-2">
                  <span className="label-field">Address line 2</span>
                  <input
                    value={addressFields.line2}
                    onChange={(event) => setAddressFields((prev) => ({ ...prev, line2: event.target.value }))}
                    className="input-field"
                    autoComplete="address-line2"
                  />
                </label>

                <label>
                  <span className="label-field">City</span>
                  <input
                    value={addressFields.city}
                    onChange={(event) => setAddressFields((prev) => ({ ...prev, city: event.target.value }))}
                    className="input-field"
                    autoComplete="address-level2"
                  />
                </label>

                <label>
                  <span className="label-field">State</span>
                  <select
                    value={addressFields.state}
                    onChange={(event) => setAddressFields((prev) => ({ ...prev, state: event.target.value }))}
                    className="input-field"
                    autoComplete="address-level1"
                  >
                    <option value="">Select a state</option>
                    {INDIA_STATES.map((state) => (
                      <option key={state} value={state}>{state}</option>
                    ))}
                  </select>
                </label>

                <label>
                  <span className="label-field">Pincode</span>
                  <input
                    value={addressFields.pincode}
                    onChange={(event) => setAddressFields((prev) => ({ ...prev, pincode: event.target.value }))}
                    className="input-field"
                    inputMode="numeric"
                    autoComplete="postal-code"
                  />
                </label>

                <label>
                  <span className="label-field">Landmark</span>
                  <input
                    value={addressFields.landmark}
                    onChange={(event) => setAddressFields((prev) => ({ ...prev, landmark: event.target.value }))}
                    className="input-field"
                  />
                </label>
              </div>

              <label className="mt-4 flex items-center gap-3 text-sm font-medium text-brand-earth-800">
                <input
                  type="checkbox"
                  checked={addressFields.defaultAddress}
                  onChange={(event) => setAddressFields((prev) => ({ ...prev, defaultAddress: event.target.checked }))}
                  className="h-4 w-4 rounded border-brand-cream-300 text-brand-primary-600 focus:ring-brand-primary-500"
                />
                Make this my default address
              </label>

              <div className="mt-5 flex flex-wrap items-center gap-3">
                <button type="submit" disabled={addressSubmitStatus === "submitting"} className="btn-primary">
                  {addressSubmitStatus === "submitting"
                    ? "Saving..."
                    : editingAddressId == null ? "Save address" : "Update address"}
                </button>
                {(addressError || addressSubmitMessage) && (
                  <p className={`text-sm ${(addressError || (editingAddressId == null ? createAddressSubmit.status : updateAddressSubmit.status) === "error") ? "text-red-700" : "text-brand-leaf-700"}`}>
                    {addressError || addressSubmitMessage}
                  </p>
                )}
              </div>
            </form>
          </div>
        </div>

        <aside className="space-y-6">
          <Link
            href={ROUTES.accountOrders}
            className="card-warm block transition hover:shadow-lg"
          >
            <h2 className="font-display text-xl font-bold text-brand-earth-900">My orders</h2>
            <p className="mt-2 text-sm text-brand-earth-700/70">
              View order history and track deliveries.
            </p>
          </Link>

          <Link
            href={ROUTES.trackOrder}
            className="card-warm block transition hover:shadow-lg"
          >
            <h2 className="font-display text-xl font-bold text-brand-earth-900">Track order</h2>
            <p className="mt-2 text-sm text-brand-earth-700/70">
              Look up any order by its order number.
            </p>
          </Link>

          <button
            type="button"
            onClick={clear}
            className="card-warm w-full text-left transition hover:shadow-lg"
          >
            <h2 className="font-display text-xl font-bold text-brand-earth-900">Sign out</h2>
            <p className="mt-2 text-sm text-brand-earth-700/70">
              Log out of your account.
            </p>
          </button>
        </aside>
      </div>
    </section>
  );
}
