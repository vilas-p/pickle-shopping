import type { Metadata } from "next";
import { AdminMediaLibrary } from "@/features/admin/media/components/AdminMediaLibraryV2";

export const metadata: Metadata = {
  title: "Admin media",
  description: "Manage all site media — banners, product images, hero images, and more.",
  robots: { index: false, follow: false },
};

export default function AdminMediaPage() {
  return <AdminMediaLibrary />;
}