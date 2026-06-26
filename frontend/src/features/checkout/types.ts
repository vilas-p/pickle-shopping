export type PaymentMethod = "COD" | "UPI" | "RAZORPAY";

export interface PaymentOrderResponse {
  razorpayOrderId: string;
  amount: number;
  currency: string;
  razorpayKeyId: string;
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
}

export interface VerifyPaymentPayload {
  razorpayOrderId: string;
  razorpayPaymentId: string;
  razorpaySignature: string;
}
