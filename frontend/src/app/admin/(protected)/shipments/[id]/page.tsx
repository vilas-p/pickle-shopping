import type { Metadata } from "next";
import { ShipmentDetail } from "@/features/admin/shipments/components/ShipmentDetail";

export const metadata: Metadata = {
  title: "Shipment detail",
  robots: { index: false, follow: false },
};

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function AdminShipmentDetailPage({ params }: PageProps) {
  const { id } = await params;

  return <ShipmentDetail shipmentId={Number(id)} />;
}
