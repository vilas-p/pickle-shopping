import type { Metadata } from "next";
import { Suspense } from "react";
import { LoginForm } from "@/features/auth/components/LoginForm";

export const metadata: Metadata = {
  title: "Sign in",
  description: "Sign in to Appa & Amma's Pickles with a one-time code.",
  robots: { index: false, follow: false },
};

export default function LoginPage() {
  return (
    <section className="container-page py-12">
      <div className="mx-auto max-w-md">
        <header className="mb-6 text-center">
          <h1 className="font-display text-3xl font-bold text-brand-earth-900">
            Welcome back
          </h1>
          <p className="mt-2 text-brand-earth-700/80">
            Sign in with a one-time code — no password needed.
          </p>
        </header>
        <Suspense fallback={<div className="card-warm h-48 animate-pulse" />}>
          <LoginForm />
        </Suspense>
      </div>
    </section>
  );
}
