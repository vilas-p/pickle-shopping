import type { Metadata, Viewport } from "next";
import { Header } from "@/shared/layout/Header";
import { Footer } from "@/shared/layout/Footer";
import { WhatsAppFab } from "@/shared/layout/WhatsAppFab";
import { AdminAuthBridge } from "@/features/admin/auth/AdminAuthBridge";
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
    "From a small kitchen in Our Village, Appa & Amma's Pickles brings back the taste of home with small-batch jars made slowly, by hand, and never in a hurry.",
  keywords: [
    "homemade pickles",
    "mango pickle",
    "lemon pickle",
    "bitter gourd pickle",
    "Indian pickles",
    "Village Kitchen",
    "small batch pickles",
    "home style pickles",
    "Appa Amma pickles",
  ],
  openGraph: {
    title: `${config.brand.name} — ${config.brand.tagline}`,
    description:
      "A jar from home, wherever home is. Small-batch pickles from Our Home, made with patience, memory, and family care.",
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
        <AdminAuthBridge />
        <Header />
        <main className="min-h-screen">{children}</main>
        <Footer />
        <WhatsAppFab />
      </body>
    </html>
  );
}
