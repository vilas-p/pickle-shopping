import type { Metadata } from "next";
import { ShipmentDetail } from "@/features/admin/shipments/components/ShipmentDetail";

export const metadata: Metadata = {
  title: "Shipment detail",
  robots: { index: false, follow: false },
};

export default function AdminShipmentDetailPage({
  params,
}: {
  params: { id: string };
}) {
  return <ShipmentDetail shipmentId={Number(params.id)} />;
}
