import type { Metadata } from "next";
import { AdminContactsBoard } from "@/features/admin/contacts/components/AdminContactsBoard";

export const metadata: Metadata = {
  title: "Admin contacts",
  description: "Review contact-us submissions and mark them handled from the admin console.",
  robots: { index: false, follow: false },
};

export default function AdminContactsPage() {
  return <AdminContactsBoard />;
}