import type { Metadata } from "next";
import { AdminOrdersBoard } from "@/features/admin/orders/components/AdminOrdersBoard";

export const metadata: Metadata = {
  title: "Admin orders",
  description: "Review customer orders, shipping addresses, and fulfill orders from the admin console.",
  robots: { index: false, follow: false },
};

export default function AdminOrdersPage() {
  return <AdminOrdersBoard />;
}