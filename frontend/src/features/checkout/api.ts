import { http } from "@/shared/lib/http";
import type { CreateOrderPayload } from "@/features/order/types";
import type { PaymentOrderResponse, VerifyPaymentPayload } from "./types";

export const paymentsApi = {
  createOrder: (payload: CreateOrderPayload) =>
    http<PaymentOrderResponse>("/payments/create-order", {
      method: "POST",
      body: JSON.stringify(payload),
      auth: true,
      cache: "no-store",
    }),
  cancelOrder: (razorpayOrderId: string) =>
    http<void>("/payments/cancel-order", {
      method: "POST",
      body: JSON.stringify({ razorpayOrderId }),
      cache: "no-store",
    }),
  verify: (payload: VerifyPaymentPayload) =>
    http<void>("/payments/verify", {
      method: "POST",
      body: JSON.stringify(payload),
      cache: "no-store",
    }),
};
