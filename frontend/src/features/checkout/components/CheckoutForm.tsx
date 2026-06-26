"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { useCartStore, selectItems, selectSubtotal, selectCount } from "@/features/cart/store";
import { authApi } from "@/features/auth/api";
import { useAuthStore, selectCustomer } from "@/features/auth/store";
import { addressBookApi } from "@/features/address/api";
import { deliveryApi } from "@/features/delivery/api";
import { ordersApi } from "@/features/order/api";
import { paymentsApi } from "@/features/checkout/api";
import { useApiSubmit } from "@/shared/hooks/useApiSubmit";
import { formatPrice } from "@/shared/lib/format";
import { ROUTES } from "@/shared/constants/routes";
import { INDIA_STATES } from "@/shared/constants/india-states";
import { config } from "@/shared/lib/config";
import type { AddressBookEntry } from "@/features/address/types";
import type { DeliveryEstimate } from "@/features/delivery/types";
import type { CreateOrderPayload } from "@/features/order/types";

const FREE_SHIPPING_THRESHOLD = 999;
const FLAT_SHIPPING = 60;

interface CheckoutFields {
  fullName: string;
  email: string;
  phone: string;
  line1: string;
  line2: string;
  city: string;
  state: string;
  pincode: string;
  landmark: string;
  notes: string;
}

const EMPTY_FIELDS: CheckoutFields = {
  fullName: "",
  email: "",
  phone: "",
  line1: "",
  line2: "",
  city: "",
  state: "",
  pincode: "",
  landmark: "",
  notes: "",
};

type DeliveryEstimateStatus = "idle" | "loading" | "ready" | "error";

function normalisePhone(value: string): string {
  return value.replace(/\D/g, "");
}

function isPlaceholderEmail(email: string): boolean {
  return email.endsWith("@appaamma.local");
}

function addressMatchesFields(address: AddressBookEntry, fields: CheckoutFields): boolean {
  return address.line1.trim().toLowerCase() === fields.line1.trim().toLowerCase()
    && (address.line2 ?? "").trim().toLowerCase() === fields.line2.trim().toLowerCase()
    && address.city.trim().toLowerCase() === fields.city.trim().toLowerCase()
    && address.state.trim().toLowerCase() === fields.state.trim().toLowerCase()
    && address.pincode.trim() === fields.pincode.trim()
    && (address.landmark ?? "").trim().toLowerCase() === fields.landmark.trim().toLowerCase();
}

export function CheckoutForm() {
  const router = useRouter();
  const items = useCartStore(selectItems);
  const subtotal = useCartStore(selectSubtotal);
  const count = useCartStore(selectCount);
  const hasHydrated = useCartStore((s) => s.hasHydrated);
  const clearCart = useCartStore((s) => s.clear);
  const authHasHydrated = useAuthStore((s) => s.hasHydrated);
  const authCustomer = useAuthStore(selectCustomer);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated());
  const setSession = useAuthStore((s) => s.setSession);
  const setCustomer = useAuthStore((s) => s.setCustomer);

  const [paymentMethod, setPaymentMethod] = useState<"COD" | "UPI" | "RAZORPAY">("COD");
  const [localError, setLocalError] = useState("");
  const [fields, setFields] = useState<CheckoutFields>(EMPTY_FIELDS);
  const [otpStep, setOtpStep] = useState<"idle" | "sent" | "verified">("idle");
  const [otpCode, setOtpCode] = useState("");
  const [verifiedPhone, setVerifiedPhone] = useState<string | null>(null);
  const [savedAddresses, setSavedAddresses] = useState<AddressBookEntry[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<number | null>(null);
  const [showNewAddressForm, setShowNewAddressForm] = useState(true);
  const [isLoadingAddresses, setIsLoadingAddresses] = useState(false);
  const [deletingAddressId, setDeletingAddressId] = useState<number | null>(null);
  const [deliveryEstimate, setDeliveryEstimate] = useState<DeliveryEstimate | null>(null);
  const [deliveryEstimateStatus, setDeliveryEstimateStatus] = useState<DeliveryEstimateStatus>("idle");
  const [deliveryEstimateMessage, setDeliveryEstimateMessage] = useState("");
  const { status, message, submit } = useApiSubmit(ordersApi.create);
  const requestOtp = useApiSubmit(authApi.requestOtp, { successMessage: "OTP sent to your mobile number." });
  const verifyOtp = useApiSubmit(authApi.verifyOtp, { successMessage: "Phone verified." });

  const shippingFee = subtotal >= FREE_SHIPPING_THRESHOLD || subtotal === 0 ? 0 : FLAT_SHIPPING;
  const total = subtotal + shippingFee;
  const normalizedEnteredPhone = normalisePhone(fields.phone);
  const isPhoneVerified = verifiedPhone != null && verifiedPhone === normalizedEnteredPhone;
  const selectedSavedAddress = savedAddresses.find((address) => address.id === selectedAddressId) ?? null;
  const estimateCity = !showNewAddressForm && selectedSavedAddress
    ? selectedSavedAddress.city
    : fields.city;
  const estimateState = !showNewAddressForm && selectedSavedAddress
    ? selectedSavedAddress.state
    : fields.state;
  const estimatePincode = !showNewAddressForm && selectedSavedAddress
    ? selectedSavedAddress.pincode
    : fields.pincode;
  const canEstimateDelivery = Boolean(
    estimateCity.trim()
      && estimateState.trim()
      && /^[1-9][0-9]{5}$/.test(estimatePincode.trim())
  );

  useEffect(() => {
    if (!authHasHydrated || !isAuthenticated || !authCustomer) {
      return;
    }

    const customerPhone = normalisePhone(authCustomer.phone);
    setFields((prev) => ({
      ...prev,
      fullName: prev.fullName || authCustomer.fullName,
      email: prev.email || (isPlaceholderEmail(authCustomer.email) ? "" : authCustomer.email),
      phone: prev.phone || authCustomer.phone,
    }));
    setVerifiedPhone((prev) => prev ?? customerPhone);
    if (!fields.phone || normalisePhone(fields.phone) === customerPhone) {
      setOtpStep("verified");
    }
  }, [authHasHydrated, authCustomer, fields.phone, isAuthenticated]);

  useEffect(() => {
    if (!authHasHydrated || !isAuthenticated || !isPhoneVerified) {
      return;
    }

    let cancelled = false;

    const loadAddresses = async () => {
      setIsLoadingAddresses(true);
      try {
        const addresses = await addressBookApi.listMine();
        if (cancelled) {
          return;
        }

        setSavedAddresses(addresses);

        const matching = addresses.find((address) => addressMatchesFields(address, fields));
        if (matching) {
          setSelectedAddressId(matching.id);
          setShowNewAddressForm(false);
          return;
        }

        const hasTypedAddress = Boolean(fields.line1 || fields.city || fields.state || fields.pincode);
        if (!hasTypedAddress && addresses.length > 0) {
          const preferred = addresses.find((address) => address.defaultAddress) ?? addresses[0];
          setSelectedAddressId(preferred.id);
          setShowNewAddressForm(false);
          setFields((prev) => ({
            ...prev,
            line1: preferred.line1,
            line2: preferred.line2 ?? "",
            city: preferred.city,
            state: preferred.state,
            pincode: preferred.pincode,
            landmark: preferred.landmark ?? "",
          }));
        }
      } catch {
        if (!cancelled) {
          setSavedAddresses([]);
        }
      } finally {
        if (!cancelled) {
          setIsLoadingAddresses(false);
        }
      }
    };

    void loadAddresses();

    return () => {
      cancelled = true;
    };
  }, [authHasHydrated, fields, isAuthenticated, isPhoneVerified]);

  useEffect(() => {
    if (!canEstimateDelivery) {
      setDeliveryEstimate(null);
      setDeliveryEstimateStatus("idle");
      setDeliveryEstimateMessage("");
      return;
    }

    let cancelled = false;
    setDeliveryEstimateStatus("loading");
    setDeliveryEstimateMessage("");

    const timeoutId = window.setTimeout(() => {
      void deliveryApi.estimate({
        city: estimateCity.trim(),
        state: estimateState.trim(),
        pincode: estimatePincode.trim(),
      }).then((result) => {
        if (cancelled) {
          return;
        }
        setDeliveryEstimate(result);
        setDeliveryEstimateStatus("ready");
      }).catch((error: unknown) => {
        if (cancelled) {
          return;
        }
        setDeliveryEstimate(null);
        setDeliveryEstimateStatus("error");
        setDeliveryEstimateMessage(
          error instanceof Error ? error.message : "Unable to estimate delivery right now."
        );
      });
    }, 300);

    return () => {
      cancelled = true;
      window.clearTimeout(timeoutId);
    };
  }, [canEstimateDelivery, estimateCity, estimatePincode, estimateState]);

  if (!hasHydrated) {
    return (
      <div className="grid gap-8 lg:grid-cols-[1fr_400px]">
        <div className="h-96 animate-pulse rounded-2xl bg-brand-cream-100" />
        <div className="h-72 animate-pulse rounded-2xl bg-brand-cream-100" />
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="card-warm text-center py-12">
        <h2 className="font-display text-2xl text-brand-earth-900">Your cart is empty</h2>
        <p className="mt-2 text-brand-earth-700/70">Add some pickles before checking out!</p>
        <Link href={ROUTES.products} className="btn-primary mt-6 inline-block">
          Browse Pickles
        </Link>
      </div>
    );
  }

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLocalError("");

    if (!isPhoneVerified) {
      setLocalError("Verify your mobile number with OTP before placing the order.");
      return;
    }

    const payload: CreateOrderPayload = {
      customer: {
        fullName: fields.fullName.trim(),
        email: fields.email.trim(),
        phone: fields.phone.trim(),
      },
      shippingAddress: {
        line1: fields.line1.trim(),
        line2: fields.line2.trim() || undefined,
        city: fields.city.trim(),
        state: fields.state.trim(),
        pincode: fields.pincode.trim(),
        landmark: fields.landmark.trim() || undefined,
      },
      items: items.map((l) => ({
        productId: l.productId,
        variantId: l.variantId,
        quantity: l.quantity,
      })),
      channel: "WEBSITE",
      paymentMethod,
      notes: fields.notes.trim() || undefined,
    };

    const order = await submit(payload);
    if (!order) return; // error handled by useApiSubmit

    if (isAuthenticated && authCustomer && authCustomer.id === order.customer.id) {
      setCustomer(order.customer);
    }

    if (paymentMethod === "RAZORPAY" || paymentMethod === "UPI") {
      try {
        const rpData = await paymentsApi.createOrder(order.id);
        await openRazorpayCheckout(rpData, order.orderNumber, paymentMethod);
      } catch (err) {
        setLocalError(err instanceof Error ? err.message : "Payment initiation failed");
      }
    } else {
      // COD: go straight to confirmation
      clearCart();
      router.push(ROUTES.checkoutConfirmation(order.orderNumber));
    }
  };

  const openRazorpayCheckout = (
    rpData: { razorpayOrderId: string; amount: number; currency: string; razorpayKeyId: string; customerName: string; customerEmail: string; customerPhone: string },
    orderNumber: string,
    paymentMode: "UPI" | "RAZORPAY",
  ) => {
    return new Promise<void>((resolve, reject) => {
      const win = window as { Razorpay?: new (opts: Record<string, unknown>) => { open: () => void } };
      if (!win.Razorpay) {
        reject(new Error("Razorpay SDK not loaded. Please refresh and try again."));
        return;
      }

      const rp = new win.Razorpay({
        key: rpData.razorpayKeyId,
        amount: rpData.amount * 100, // paise
        currency: rpData.currency,
        name: config.brand.name,
        description: paymentMode === "UPI" ? `UPI payment for order ${orderNumber}` : `Order ${orderNumber}`,
        order_id: rpData.razorpayOrderId,
        method: paymentMode === "UPI"
          ? {
              upi: true,
              card: false,
              netbanking: false,
              wallet: false,
              emi: false,
              paylater: false,
            }
          : undefined,
        prefill: {
          name: rpData.customerName,
          email: rpData.customerEmail,
          contact: rpData.customerPhone,
        },
        theme: { color: "#b91c1c" }, // brand-primary-700
        handler: async (response: { razorpay_order_id: string; razorpay_payment_id: string; razorpay_signature: string }) => {
          try {
            await paymentsApi.verify({
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
            });
            clearCart();
            router.push(ROUTES.checkoutConfirmation(orderNumber));
            resolve();
          } catch (err) {
            reject(err);
          }
        },
        modal: {
          ondismiss: () => {
            setLocalError("Payment cancelled. Your order has been saved — you can retry payment.");
            resolve();
          },
        },
      });
      rp.open();
    });
  };

  const isSubmitting = status === "submitting";

  const updateField = (field: keyof CheckoutFields, value: string) => {
    setFields((prev) => ({ ...prev, [field]: value }));
  };

  const onPhoneChange = (value: string) => {
    updateField("phone", value);
    if (verifiedPhone != null && normalisePhone(value) !== verifiedPhone) {
      setOtpStep("idle");
      setOtpCode("");
      setVerifiedPhone(null);
      setSelectedAddressId(null);
      setShowNewAddressForm(true);
      requestOtp.reset();
      verifyOtp.reset();
    }
  };

  const requestPhoneOtp = async () => {
    setLocalError("");
    const res = await requestOtp.submit({ kind: "PHONE", identifier: fields.phone.trim() });
    if (res) {
      setOtpStep("sent");
      setOtpCode("");
    }
  };

  const verifyPhoneOtp = async () => {
    setLocalError("");
    const res = await verifyOtp.submit({
      kind: "PHONE",
      identifier: fields.phone.trim(),
      code: otpCode.trim(),
      fullName: fields.fullName.trim() || undefined,
    });
    if (!res) {
      return;
    }

    setSession(res);
    setVerifiedPhone(normalisePhone(fields.phone));
    setOtpStep("verified");
    setOtpCode("");
  };

  const selectSavedAddress = (address: AddressBookEntry) => {
    setSelectedAddressId(address.id);
    setShowNewAddressForm(false);
    setFields((prev) => ({
      ...prev,
      line1: address.line1,
      line2: address.line2 ?? "",
      city: address.city,
      state: address.state,
      pincode: address.pincode,
      landmark: address.landmark ?? "",
    }));
  };

  const chooseNewAddress = () => {
    setSelectedAddressId(null);
    setShowNewAddressForm(true);
  };

  const deleteSavedAddress = async (addressId: number) => {
    setLocalError("");
    setDeletingAddressId(addressId);

    try {
      await addressBookApi.deleteMine(addressId);

      const remaining = savedAddresses.filter((address) => address.id !== addressId);
      setSavedAddresses(remaining);

      if (selectedAddressId === addressId) {
        if (remaining.length > 0) {
          selectSavedAddress(remaining[0]);
        } else {
          setSelectedAddressId(null);
          setShowNewAddressForm(true);
          setFields((prev) => ({
            ...prev,
            line1: "",
            line2: "",
            city: "",
            state: "",
            pincode: "",
            landmark: "",
          }));
        }
      }
    } catch (err) {
      setLocalError(err instanceof Error ? err.message : "Failed to delete saved address");
    } finally {
      setDeletingAddressId(null);
    }
  };

  return (
    <form onSubmit={onSubmit} className="grid gap-8 lg:grid-cols-[1fr_400px]">
      <div className="space-y-8">
        {/* Contact details */}
        <fieldset className="card-warm" disabled={isSubmitting}>
          <legend className="font-display text-xl font-bold text-brand-earth-900 mb-4">
            Contact details
          </legend>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label htmlFor="fullName" className="label-field">Full name</label>
              <input
                id="fullName"
                name="fullName"
                required
                value={fields.fullName}
                onChange={(e) => updateField("fullName", e.target.value)}
                className="input-field"
              />
            </div>
            <div>
              <label htmlFor="email" className="label-field">Email</label>
              <input
                id="email"
                name="email"
                type="email"
                required
                value={fields.email}
                onChange={(e) => updateField("email", e.target.value)}
                className="input-field"
              />
            </div>
            <div>
              <label htmlFor="phone" className="label-field">Phone</label>
              <input
                id="phone"
                name="phone"
                type="tel"
                required
                pattern="^\+?[0-9]{10,15}$"
                placeholder="e.g. 9876543210"
                value={fields.phone}
                onChange={(e) => onPhoneChange(e.target.value)}
                className="input-field"
              />
            </div>
            <div className="sm:col-span-2 rounded-2xl border border-brand-cream-200 bg-brand-cream-50/60 p-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="font-medium text-brand-earth-900">Mobile verification</p>
                  <p className="text-sm text-brand-earth-700/75">
                    {isPhoneVerified
                      ? "This mobile number is verified. Saved addresses are now available below."
                      : "Send and verify an OTP before placing the order or saving this address."}
                  </p>
                </div>
                {isPhoneVerified ? (
                  <span className="inline-flex items-center rounded-full bg-green-100 px-3 py-1 text-sm font-medium text-green-700">
                    Verified
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={requestPhoneOtp}
                    disabled={requestOtp.status === "submitting" || normalizedEnteredPhone.length < 10}
                    className="btn-secondary justify-center disabled:opacity-60"
                  >
                    {requestOtp.status === "submitting"
                      ? "Sending..."
                      : otpStep === "sent"
                        ? "Resend OTP"
                        : "Send OTP"}
                  </button>
                )}
              </div>

              {!isPhoneVerified && otpStep === "sent" && (
                <div className="mt-4 flex flex-col gap-3 sm:flex-row">
                  <input
                    type="text"
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    maxLength={8}
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ""))}
                    placeholder="Enter OTP"
                    className="input-field sm:flex-1"
                  />
                  <button
                    type="button"
                    onClick={verifyPhoneOtp}
                    disabled={verifyOtp.status === "submitting" || otpCode.length < 4}
                    className="btn-primary justify-center disabled:opacity-60"
                  >
                    {verifyOtp.status === "submitting" ? "Verifying..." : "Verify OTP"}
                  </button>
                </div>
              )}

              {requestOtp.status === "success" && requestOtp.message && !isPhoneVerified && (
                <p className="mt-3 text-sm text-brand-earth-700">{requestOtp.message}</p>
              )}
              {requestOtp.status === "error" && (
                <p className="mt-3 text-sm text-red-600">{requestOtp.message}</p>
              )}
              {verifyOtp.status === "error" && (
                <p className="mt-3 text-sm text-red-600">{verifyOtp.message}</p>
              )}
            </div>
          </div>
        </fieldset>

        {/* Shipping address */}
        <fieldset className="card-warm" disabled={isSubmitting}>
          <legend className="font-display text-xl font-bold text-brand-earth-900 mb-4">
            Shipping address
          </legend>
          {isPhoneVerified && (
            <div className="mb-6 space-y-3">
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm font-medium text-brand-earth-900">Saved addresses</p>
                {isLoadingAddresses && (
                  <span className="text-xs text-brand-earth-700/70">Loading saved addresses...</span>
                )}
              </div>

              {savedAddresses.length > 0 ? (
                <div className="space-y-3">
                  {savedAddresses.map((address) => {
                    const selected = selectedAddressId === address.id && !showNewAddressForm;
                    return (
                      <div
                        key={address.id}
                        className={`w-full rounded-2xl border p-4 text-left transition ${
                          selected
                            ? "border-brand-primary-600 bg-brand-primary-50"
                            : "border-brand-cream-200 hover:border-brand-primary-300"
                        }`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="text-sm text-brand-earth-800">
                            <p className="font-medium text-brand-earth-900">{address.line1}</p>
                            {address.line2 && <p>{address.line2}</p>}
                            <p>{address.city}, {address.state} {address.pincode}</p>
                            {address.landmark && <p>Landmark: {address.landmark}</p>}
                          </div>
                          {address.defaultAddress && (
                            <span className="rounded-full bg-brand-cream-100 px-2.5 py-1 text-xs font-medium text-brand-earth-700">
                              Default
                            </span>
                          )}
                        </div>

                        <div className="mt-4 flex flex-wrap gap-3">
                          <button
                            type="button"
                            onClick={() => selectSavedAddress(address)}
                            className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                              selected
                                ? "bg-brand-primary-600 text-white"
                                : "bg-white text-brand-earth-700 ring-1 ring-brand-cream-200 hover:text-brand-primary-700"
                            }`}
                          >
                            {selected ? "Selected" : "Use this address"}
                          </button>
                          <button
                            type="button"
                            onClick={() => deleteSavedAddress(address.id)}
                            disabled={deletingAddressId === address.id}
                            className="rounded-full px-4 py-2 text-sm font-medium text-red-700 ring-1 ring-red-200 transition hover:bg-red-50 disabled:opacity-60"
                          >
                            {deletingAddressId === address.id ? "Deleting..." : "Delete"}
                          </button>
                        </div>
                      </div>
                    );
                  })}

                  <button
                    type="button"
                    onClick={chooseNewAddress}
                    className={`w-full rounded-2xl border border-dashed p-4 text-left text-sm font-medium transition ${
                      showNewAddressForm
                        ? "border-brand-primary-600 bg-brand-primary-50 text-brand-primary-700"
                        : "border-brand-earth-300 text-brand-earth-700 hover:border-brand-primary-300"
                    }`}
                  >
                    + Add new address
                  </button>
                </div>
              ) : (
                <p className="rounded-2xl bg-brand-cream-50 px-4 py-3 text-sm text-brand-earth-700/80">
                  This shipping address will be saved after you place the order.
                </p>
              )}
            </div>
          )}

          {!showNewAddressForm && selectedSavedAddress ? (
            <div className="rounded-2xl border border-brand-cream-200 bg-brand-cream-50/60 p-4">
              <p className="text-sm font-medium text-brand-earth-900">Deliver to</p>
              <address className="mt-2 not-italic text-sm leading-relaxed text-brand-earth-800">
                <div>{selectedSavedAddress.line1}</div>
                {selectedSavedAddress.line2 && <div>{selectedSavedAddress.line2}</div>}
                <div>{selectedSavedAddress.city}, {selectedSavedAddress.state} {selectedSavedAddress.pincode}</div>
                {selectedSavedAddress.landmark && <div>Landmark: {selectedSavedAddress.landmark}</div>}
              </address>
              <button
                type="button"
                onClick={chooseNewAddress}
                className="mt-4 text-sm font-medium text-brand-primary-700 hover:underline"
              >
                Use a different address
              </button>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label htmlFor="line1" className="label-field">Address line 1</label>
                <input
                  id="line1"
                  name="line1"
                  required
                  value={fields.line1}
                  onChange={(e) => updateField("line1", e.target.value)}
                  className="input-field"
                />
              </div>
              <div className="sm:col-span-2">
                <label htmlFor="line2" className="label-field">Address line 2 (optional)</label>
                <input
                  id="line2"
                  name="line2"
                  value={fields.line2}
                  onChange={(e) => updateField("line2", e.target.value)}
                  className="input-field"
                />
              </div>
              <div>
                <label htmlFor="city" className="label-field">City</label>
                <input
                  id="city"
                  name="city"
                  required
                  value={fields.city}
                  onChange={(e) => updateField("city", e.target.value)}
                  className="input-field"
                />
              </div>
              <div>
                <label htmlFor="state" className="label-field">State</label>
                <select
                  id="state"
                  name="state"
                  required
                  value={fields.state}
                  onChange={(e) => updateField("state", e.target.value)}
                  className="input-field"
                >
                  <option value="">Select state</option>
                  {INDIA_STATES.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="pincode" className="label-field">Pincode</label>
                <input
                  id="pincode"
                  name="pincode"
                  required
                  pattern="^[1-9][0-9]{5}$"
                  placeholder="e.g. 500001"
                  value={fields.pincode}
                  onChange={(e) => updateField("pincode", e.target.value)}
                  className="input-field"
                />
              </div>
              <div>
                <label htmlFor="landmark" className="label-field">Landmark (optional)</label>
                <input
                  id="landmark"
                  name="landmark"
                  value={fields.landmark}
                  onChange={(e) => updateField("landmark", e.target.value)}
                  className="input-field"
                />
              </div>
            </div>
          )}

          {deliveryEstimateStatus !== "idle" && (
            <div className="mt-6 rounded-2xl border border-brand-cream-200 bg-white/70 p-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-medium text-brand-earth-900">Estimated delivery route</p>
                  <p className="text-xs uppercase tracking-[0.16em] text-brand-earth-700/70">
                    {deliveryEstimate?.serviceLevel ?? "Calculating"}
                  </p>
                </div>
                {deliveryEstimateStatus === "loading" && (
                  <span className="text-sm text-brand-earth-700/70">Calculating...</span>
                )}
              </div>

              {deliveryEstimateStatus === "error" && (
                <p className="mt-3 text-sm text-red-600">{deliveryEstimateMessage}</p>
              )}

              {deliveryEstimate && (
                <>
                  <div className="mt-4 grid gap-3 sm:grid-cols-2">
                    <div className="rounded-2xl bg-brand-cream-50 px-4 py-3 text-sm text-brand-earth-800">
                      <p className="text-xs uppercase tracking-[0.16em] text-brand-earth-700/70">From</p>
                      <p className="mt-1 font-medium text-brand-earth-900">{deliveryEstimate.store.label}</p>
                      <p>{deliveryEstimate.store.city}, {deliveryEstimate.store.state} {deliveryEstimate.store.pincode}</p>
                    </div>
                    <div className="rounded-2xl bg-brand-cream-50 px-4 py-3 text-sm text-brand-earth-800">
                      <p className="text-xs uppercase tracking-[0.16em] text-brand-earth-700/70">To</p>
                      <p className="mt-1 font-medium text-brand-earth-900">Customer shipping address</p>
                      <p>{estimateCity.trim()}, {estimateState.trim()} {estimatePincode.trim()}</p>
                    </div>
                  </div>

                  <div className="mt-4 flex flex-wrap gap-3 text-sm">
                    <span className="rounded-full bg-brand-primary-50 px-3 py-1 font-medium text-brand-primary-700 ring-1 ring-brand-primary-100">
                      Distance: ~{deliveryEstimate.estimatedDistanceKm} km
                    </span>
                    <span className="rounded-full bg-brand-secondary-100 px-3 py-1 font-medium text-brand-earth-800 ring-1 ring-brand-secondary-200">
                      ETA: {deliveryEstimate.estimatedDeliveryWindow}
                    </span>
                  </div>

                  <p className="mt-3 text-xs text-brand-earth-700/70">
                    Estimate is based on the store dispatch location and shipping pincode zone. Final courier timing can vary slightly.
                  </p>
                </>
              )}
            </div>
          )}
        </fieldset>

        {/* Payment method */}
        <fieldset className="card-warm" disabled={isSubmitting}>
          <legend className="font-display text-xl font-bold text-brand-earth-900 mb-4">
            Payment method
          </legend>
          <div className="space-y-3">
            <label className={`flex cursor-pointer items-center gap-3 rounded-xl border p-4 transition ${
              paymentMethod === "COD" ? "border-brand-primary-600 bg-brand-primary-50" : "border-brand-earth-300"
            }`}>
              <input type="radio" name="paymentMethodRadio" value="COD"
                checked={paymentMethod === "COD"}
                onChange={() => setPaymentMethod("COD")}
                className="accent-brand-primary-700" />
              <div>
                <span className="font-medium text-brand-earth-900">Cash on Delivery</span>
                <p className="text-sm text-brand-earth-700/70">Pay when your order arrives</p>
              </div>
            </label>
            {config.features.enablePayments && (
              <label className={`flex cursor-pointer items-center gap-3 rounded-xl border p-4 transition ${
                paymentMethod === "UPI" ? "border-brand-primary-600 bg-brand-primary-50" : "border-brand-earth-300"
              }`}>
                <input type="radio" name="paymentMethodRadio" value="UPI"
                  checked={paymentMethod === "UPI"}
                  onChange={() => setPaymentMethod("UPI")}
                  className="accent-brand-primary-700" />
                <div>
                  <span className="font-medium text-brand-earth-900">UPI payment</span>
                  <p className="text-sm text-brand-earth-700/70">Pay online using any UPI app through Razorpay</p>
                </div>
              </label>
            )}
            {config.features.enablePayments && (
              <label className={`flex cursor-pointer items-center gap-3 rounded-xl border p-4 transition ${
                paymentMethod === "RAZORPAY" ? "border-brand-primary-600 bg-brand-primary-50" : "border-brand-earth-300"
              }`}>
                <input type="radio" name="paymentMethodRadio" value="RAZORPAY"
                  checked={paymentMethod === "RAZORPAY"}
                  onChange={() => setPaymentMethod("RAZORPAY")}
                  className="accent-brand-primary-700" />
                <div>
                  <span className="font-medium text-brand-earth-900">Cards / net banking / other online modes</span>
                  <p className="text-sm text-brand-earth-700/70">Use Razorpay for cards, net banking, and other online payment methods</p>
                </div>
              </label>
            )}
          </div>
        </fieldset>

        {/* Notes */}
        <fieldset className="card-warm" disabled={isSubmitting}>
          <legend className="font-display text-xl font-bold text-brand-earth-900 mb-4">
            Order notes (optional)
          </legend>
          <textarea
            id="notes"
            name="notes"
            rows={3}
            maxLength={1000}
            value={fields.notes}
            onChange={(e) => updateField("notes", e.target.value)}
            placeholder="Any special instructions…"
            className="input-field"
          />
        </fieldset>
      </div>

      {/* Order summary sidebar */}
      <div className="lg:sticky lg:top-24 h-fit space-y-6">
        <div className="card-warm">
          <h2 className="font-display text-xl font-bold text-brand-earth-900">Order summary</h2>
          <ul className="mt-4 divide-y divide-brand-cream-200">
            {items.map((line) => (
              <li key={`${line.productId}:${line.variantId ?? ""}`}
                className="flex items-center gap-3 py-3">
                <div className="relative h-14 w-14 flex-shrink-0 overflow-hidden rounded-lg bg-brand-cream-100">
                  <Image src={line.image} alt={line.name} fill sizes="56px" className="object-cover" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-brand-earth-900 truncate">{line.name}</p>
                  <p className="text-xs text-brand-earth-700/70">{line.weight} × {line.quantity}</p>
                </div>
                <p className="text-sm font-medium text-brand-earth-900">
                  {formatPrice(line.unitPrice * line.quantity)}
                </p>
              </li>
            ))}
          </ul>

          <dl className="mt-4 space-y-2 border-t border-brand-cream-200 pt-4 text-sm text-brand-earth-800">
            <div className="flex justify-between">
              <dt>Items ({count})</dt>
              <dd className="font-medium">{formatPrice(subtotal)}</dd>
            </div>
            <div className="flex justify-between">
              <dt>Shipping</dt>
              <dd className="font-medium">
                {shippingFee === 0 ? (
                  <span className="text-green-700">Free</span>
                ) : (
                  formatPrice(shippingFee)
                )}
              </dd>
            </div>
            {shippingFee > 0 && (
              <p className="text-xs text-brand-earth-700/70">
                Free shipping on orders above {formatPrice(FREE_SHIPPING_THRESHOLD)}
              </p>
            )}
          </dl>

          <div className="mt-4 flex items-baseline justify-between border-t border-brand-cream-200 pt-4">
            <span className="font-display text-lg font-semibold text-brand-earth-900">Total</span>
            <span className="font-display text-2xl font-bold text-brand-primary-700">
              {formatPrice(total)}
            </span>
          </div>
        </div>

        {(localError || (status === "error" && message)) && (
          <p className="text-sm text-red-600">{localError || message}</p>
        )}

        {!isPhoneVerified && (
          <p className="text-sm text-brand-earth-700/75">
            Verify your mobile number to enable saved addresses and place the order.
          </p>
        )}

        <button type="submit" disabled={isSubmitting}
          className="btn-primary w-full justify-center disabled:opacity-60">
          {isSubmitting
            ? "Placing order…"
            : !isPhoneVerified
              ? "Verify phone to continue"
              : paymentMethod === "COD"
                ? "Place order (COD)"
                : paymentMethod === "UPI"
                  ? "Place order & pay with UPI"
                  : "Place order & pay online"}
        </button>

        <Link href={ROUTES.cart}
          className="block text-center text-sm font-medium text-brand-earth-700 hover:text-brand-primary-700">
          ← Back to cart
        </Link>
      </div>
    </form>
  );
}
