import type { Metadata } from "next";
import { Suspense } from "react";
import { AdminLoginForm } from "@/features/admin/auth/components/AdminLoginForm";

export const metadata: Metadata = {
  title: "Admin sign in",
  description: "Sign in to the Appa & Amma's Pickles admin dashboard.",
  robots: { index: false, follow: false },
};

export default function AdminLoginPage() {
  return (
    <section className="container-page py-12">
      <div className="mx-auto max-w-md">
        <header className="mb-6 text-center">
          <p className="eyebrow">Admin Console</p>
          <h1 className="font-display text-3xl font-bold text-brand-earth-900">
            Manage the store
          </h1>
          <p className="mt-2 text-brand-earth-700/80">
            Sign in with your admin or staff email and password.
          </p>
        </header>
        <Suspense fallback={<div className="card-warm h-48 animate-pulse" />}>
          <AdminLoginForm />
        </Suspense>
      </div>
    </section>
  );
}