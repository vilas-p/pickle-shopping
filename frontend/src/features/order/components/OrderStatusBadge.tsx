import type { OrderStatus } from "@/features/order/types";

const statusConfig: Record<OrderStatus, { label: string; className: string }> = {
  PENDING: { label: "Pending", className: "bg-yellow-100 text-yellow-800" },
  CONFIRMED: { label: "Confirmed", className: "bg-blue-100 text-blue-800" },
  PACKED: { label: "Packed", className: "bg-indigo-100 text-indigo-800" },
  SHIPPED: { label: "Shipped", className: "bg-purple-100 text-purple-800" },
  DELIVERED: { label: "Delivered", className: "bg-green-100 text-green-800" },
  CANCELLED: { label: "Cancelled", className: "bg-red-100 text-red-800" },
};

export function OrderStatusBadge({ status }: { status: OrderStatus }) {
  const cfg = statusConfig[status] ?? { label: status, className: "bg-gray-100 text-gray-800" };
  return (
    <span className={`inline-block rounded-full px-3 py-0.5 text-xs font-semibold ${cfg.className}`}>
      {cfg.label}
    </span>
  );
}
