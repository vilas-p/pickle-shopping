import type { Metadata } from "next";
import { AccountOrdersPage } from "./AccountOrdersPage";

export const metadata: Metadata = {
  title: "My Orders",
  description: "View your order history.",
  robots: { index: false, follow: false },
};

export default function Page() {
  return <AccountOrdersPage />;
}
