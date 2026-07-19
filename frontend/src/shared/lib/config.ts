export const config = {
  apiBaseUrl: process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8002/api/v1",
  whatsappNumber: process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "919880193310",
  instagramHandle: process.env.NEXT_PUBLIC_INSTAGRAM_HANDLE ?? "appa_ammas_pickles",
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
  brand: {
    name: "Appa & Amma's Pickles",
    tagline: "Made with Love. Shared with Tradition.",
    shortName: "Appa & Amma's",
  },
  features: {
    // Reserved for upcoming phases (OTP auth, Razorpay, etc.).
    enableOtpAuth: process.env.NEXT_PUBLIC_ENABLE_OTP_AUTH === "true",
    enablePayments: process.env.NEXT_PUBLIC_ENABLE_PAYMENTS === "true",
  },
  razorpay: {
    keyId: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID ?? "",
  },
} as const;
