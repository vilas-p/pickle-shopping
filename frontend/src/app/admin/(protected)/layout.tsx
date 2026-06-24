import { AdminAuthGuard } from "@/features/admin/auth/components/AdminAuthGuard";
import { AdminShell } from "@/features/admin/components/AdminShell";

export default function AdminProtectedLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <AdminAuthGuard>
      <AdminShell>{children}</AdminShell>
    </AdminAuthGuard>
  );
}