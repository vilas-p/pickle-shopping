import type { ShipmentStatus } from "../types";

const STATUS_LABELS: Record<ShipmentStatus, string> = {
  CREATED: "Created",
  AWB_ASSIGNED: "AWB Assigned",
  LABEL_GENERATED: "Label Generated",
  PICKUP_SCHEDULED: "Pickup Scheduled",
  PICKED_UP: "Picked Up",
  IN_TRANSIT: "In Transit",
  OUT_FOR_DELIVERY: "Out for Delivery",
  DELIVERED: "Delivered",
  CANCELLED: "Cancelled",
  RTO_INITIATED: "RTO Initiated",
  RTO_DELIVERED: "RTO Delivered",
  CREATION_FAILED: "Failed",
};

const STATUS_COLORS: Record<ShipmentStatus, string> = {
  CREATED: "bg-gray-100 text-gray-800",
  AWB_ASSIGNED: "bg-blue-100 text-blue-800",
  LABEL_GENERATED: "bg-blue-100 text-blue-800",
  PICKUP_SCHEDULED: "bg-indigo-100 text-indigo-800",
  PICKED_UP: "bg-indigo-100 text-indigo-800",
  IN_TRANSIT: "bg-yellow-100 text-yellow-800",
  OUT_FOR_DELIVERY: "bg-orange-100 text-orange-800",
  DELIVERED: "bg-green-100 text-green-800",
  CANCELLED: "bg-red-100 text-red-800",
  RTO_INITIATED: "bg-red-100 text-red-800",
  RTO_DELIVERED: "bg-red-100 text-red-800",
  CREATION_FAILED: "bg-red-100 text-red-800",
};

interface ShipmentStatusBadgeProps {
  status: ShipmentStatus;
}

export function ShipmentStatusBadge({ status }: ShipmentStatusBadgeProps) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${STATUS_COLORS[status] ?? "bg-gray-100 text-gray-800"}`}
    >
      {STATUS_LABELS[status] ?? status}
    </span>
  );
}
