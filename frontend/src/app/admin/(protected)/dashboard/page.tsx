import type { Metadata } from "next";
import { AdminDashboard } from "@/features/admin/dashboard/components/AdminDashboard";

export const metadata: Metadata = {
  title: "Admin dashboard",
  description: "Overview of store operations for admin and staff users.",
  robots: { index: false, follow: false },
};

export default function AdminDashboardPage() {
  return <AdminDashboard />;
}