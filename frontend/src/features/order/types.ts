export type PaymentMethod = "COD" | "UPI" | "RAZORPAY";

export type OrderStatus =
  | "PENDING"
  | "CONFIRMED"
  | "PACKED"
  | "SHIPPED"
  | "DELIVERED"
  | "CANCELLED";

export type OrderChannel = "WEBSITE" | "WHATSAPP";

export interface OrderItem {
  id: number;
  productId: number;
  variantId?: number;
  productName: string;
  productWeight: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
}

export interface ShippingAddress {
  line1: string;
  line2?: string;
  city: string;
  state: string;
  pincode: string;
  landmark?: string;
}

export interface OrderCustomer {
  id: number;
  fullName: string;
  email: string;
  phone: string;
}

export interface Order {
  id: number;
  orderNumber: string;
  status: OrderStatus;
  channel: OrderChannel;
  paymentMethod?: PaymentMethod;
  subtotal: number;
  shippingFee: number;
  total: number;
  notes?: string;
  createdAt: string;
  customer: OrderCustomer;
  shippingAddress: ShippingAddress;
  items: OrderItem[];
}

export interface CreateOrderPayload {
  customer: { fullName: string; email: string; phone: string };
  shippingAddress: ShippingAddress;
  items: { productId: number; variantId?: number; quantity: number }[];
  channel?: OrderChannel;
  paymentMethod?: PaymentMethod;
  notes?: string;
}
