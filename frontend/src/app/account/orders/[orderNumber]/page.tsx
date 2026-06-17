import type { Metadata } from "next";
import { AccountOrderDetailPage } from "./AccountOrderDetailPage";

export const metadata: Metadata = {
  title: "Order Details",
  robots: { index: false, follow: false },
};

export default function Page() {
  return <AccountOrderDetailPage />;
}
