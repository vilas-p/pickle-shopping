import type { Metadata, Viewport } from "next";
import { Header } from "@/shared/layout/Header";
import { Footer } from "@/shared/layout/Footer";
import { WhatsAppFab } from "@/shared/layout/WhatsAppFab";
import { AuthBridge } from "@/features/auth/AuthBridge";
import { config } from "@/shared/lib/config";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(config.siteUrl),
  title: {
    default: `${config.brand.name} — ${config.brand.tagline}`,
    template: `%s | ${config.brand.name}`,
  },
  description:
    "Traditional, hand-made Indian pickles from a family kitchen. Mango, lemon and bitter gourd pickles in cold-pressed oils. Shipping across India.",
  keywords: [
    "homemade pickles",
    "mango pickle",
    "lemon pickle",
    "bitter gourd pickle",
    "Indian pickles",
    "village kitchen",
    "Appa Amma pickles",
  ],
  openGraph: {
    title: `${config.brand.name} — ${config.brand.tagline}`,
    description:
      "Hand-made pickles using cold-pressed oils and traditional Indian recipes. Shipped across India.",
    url: config.siteUrl,
    siteName: config.brand.name,
    locale: "en_IN",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: config.brand.name,
    description: config.brand.tagline,
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: "#c8542f",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <AuthBridge />
        <Header />
        <main className="min-h-screen">{children}</main>
        <Footer />
        <WhatsAppFab />
      </body>
    </html>
  );
}
