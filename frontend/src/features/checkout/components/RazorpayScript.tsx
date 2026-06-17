"use client";

import Script from "next/script";
import { config } from "@/shared/lib/config";

/**
 * Lazily loads the Razorpay checkout.js script. Only rendered when
 * online payments are enabled. Loaded with `afterInteractive` so it
 * doesn't block the initial page paint.
 */
export function RazorpayScript() {
  if (!config.features.enablePayments) return null;

  return (
    <Script
      src="https://checkout.razorpay.com/v1/checkout.js"
      strategy="afterInteractive"
    />
  );
}
