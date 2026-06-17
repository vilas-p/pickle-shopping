import Link from "next/link";
import Image from "next/image";
import { CartIcon } from "@/features/cart/components/CartIcon";
import { AccountButton } from "@/features/auth/components/AccountButton";
import { MobileNav } from "./MobileNav";
import { ROUTES } from "@/shared/constants/routes";

const NAV = [
  { href: ROUTES.home, label: "Home" },
  { href: ROUTES.products, label: "Products" },
  { href: ROUTES.about, label: "About" },
  { href: ROUTES.reviews, label: "Reviews" },
  { href: ROUTES.faq, label: "FAQ" },
  { href: ROUTES.contact, label: "Contact" },
] as const;

export function Header() {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-brand-cream-200 bg-brand-cream-50/85 backdrop-blur supports-[backdrop-filter]:bg-brand-cream-50/70">
      <div className="container-page flex h-16 items-center justify-between gap-4">
        <Link href={ROUTES.home} className="flex items-center gap-2">
          <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-full bg-white shadow-warm">
            <Image
              src="/images/products/logo.png"
              alt="Appa & Amma's Pickles Logo"
              width={40}
              height={40}
              className="object-contain"
            />
          </div>
          <span className="hidden flex-col leading-tight sm:flex">
            <span className="font-display text-lg font-bold text-brand-earth-900">
              Appa &amp; Amma&apos;s
            </span>
            <span className="font-script text-sm text-brand-primary-700">Pickles</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-full px-4 py-2 text-sm font-medium text-brand-earth-700 transition hover:bg-brand-cream-100 hover:text-brand-primary-700"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-1 sm:gap-2">
          <CartIcon />
          <AccountButton />
          <MobileNav items={NAV} />
        </div>
      </div>
    </header>
  );
}
