import Link from "next/link";
import { ROUTES } from "@/shared/constants/routes";

export function ReviewForm() {
  return (
    <div className="card-warm space-y-4">
      <h3 className="font-display text-2xl text-brand-earth-900">Write a review</h3>
      <p className="text-sm text-brand-earth-700/80">
        Reviews are available only for customers who have purchased the product.
        Open your order in your account and submit a product review there.
      </p>
      <Link href={ROUTES.accountOrders} className="btn-primary inline-flex">
        Go to my orders
      </Link>
    </div>
  );
}
