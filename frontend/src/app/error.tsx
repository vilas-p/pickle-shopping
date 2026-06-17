"use client";

import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="container-page py-24 text-center">
      <h2 className="font-display text-3xl text-brand-earth-900">Something went wrong</h2>
      <p className="mt-2 text-brand-earth-700/80">We&apos;re sorry — please try again.</p>
      <button onClick={reset} className="btn-primary mt-6">Try again</button>
    </div>
  );
}
