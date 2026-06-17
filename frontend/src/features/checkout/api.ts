import { http } from "@/shared/lib/http";
import type { PaymentOrderResponse, VerifyPaymentPayload } from "./types";

export const paymentsApi = {
  createOrder: (orderId: number) =>
    http<PaymentOrderResponse>("/payments/create-order", {
      method: "POST",
      body: JSON.stringify({ orderId }),
      cache: "no-store",
    }),
  verify: (payload: VerifyPaymentPayload) =>
    http<void>("/payments/verify", {
      method: "POST",
      body: JSON.stringify(payload),
      cache: "no-store",
    }),
};
