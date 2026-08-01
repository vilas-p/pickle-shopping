export type ShipmentStatus =
  | "CREATED"
  | "AWB_ASSIGNED"
  | "LABEL_GENERATED"
  | "PICKUP_SCHEDULED"
  | "PICKED_UP"
  | "IN_TRANSIT"
  | "OUT_FOR_DELIVERY"
  | "DELIVERED"
  | "CANCELLED"
  | "RTO_INITIATED"
  | "RTO_DELIVERED"
  | "CREATION_FAILED";

export interface Shipment {
  id: number;
  orderId: number;
  orderNumber: string;
  shiprocketOrderId: number | null;
  shiprocketShipmentId: number | null;
  awbNumber: string | null;
  courierName: string | null;
  courierId: number | null;
  status: ShipmentStatus;
  pickupScheduledDate: string | null;
  labelUrl: string | null;
  manifestUrl: string | null;
  invoiceUrl: string | null;
  estimatedDeliveryDate: string | null;
  actualDeliveryDate: string | null;
  shippingCharge: number | null;
  weight: number | null;
  createdAt: string;
  updatedAt: string;
}

export interface ServiceabilityRequest {
  deliveryPincode: string;
  weight: number;
  cod: boolean;
}

export interface CourierOption {
  courierId: number;
  courierName: string;
  rate: number;
  estimatedDays: number;
  cod: boolean;
}

export interface ServiceabilityResponse {
  serviceable: boolean;
  availableCouriers: CourierOption[];
}

export interface TrackingEvent {
  status: string;
  description: string;
  location: string;
  timestamp: string;
}

export interface TrackingResponse {
  orderNumber: string;
  awbNumber: string;
  courierName: string;
  currentStatus: string;
  estimatedDelivery: string | null;
  trackingUrl: string | null;
  events: TrackingEvent[];
}
