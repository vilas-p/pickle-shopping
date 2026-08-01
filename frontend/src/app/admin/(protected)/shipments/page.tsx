import type { Metadata } from "next";
import { ShipmentList } from "@/features/admin/shipments/components/ShipmentList";

export const metadata: Metadata = {
  title: "Admin shipments",
  description: "Manage shipments, track deliveries, and handle Shiprocket integration.",
  robots: { index: false, follow: false },
};

export default function AdminShipmentsPage() {
  return <ShipmentList />;
}
