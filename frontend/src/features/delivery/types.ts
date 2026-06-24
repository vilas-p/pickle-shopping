export interface DeliveryEstimateLocation {
  label: string;
  line1?: string | null;
  city: string;
  state: string;
  pincode: string;
}

export interface DeliveryEstimate {
  store: DeliveryEstimateLocation;
  destination: DeliveryEstimateLocation;
  estimatedDistanceKm: number;
  estimatedTransitDaysMin: number;
  estimatedTransitDaysMax: number;
  estimatedDeliveryWindow: string;
  serviceLevel: string;
}

export interface DeliveryEstimateRequest {
  city: string;
  state: string;
  pincode: string;
}