import Link from "next/link";
import { config } from "@/shared/lib/config";
import { instagramLink, whatsappGenericLink } from "@/shared/lib/whatsapp";

export function Footer() {
  return (
    <footer className="mt-20 border-t border-brand-cream-200 bg-brand-earth-900 text-brand-cream-100">
      <div className="container-page grid gap-10 py-12 md:grid-cols-4">
        <div>
          <div className="flex items-center gap-3">
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-primary-500 font-bold text-white shadow-warm">
              अ
            </span>
            <div>
              <p className="font-display text-xl font-semibold text-white">
                {config.brand.name}
              </p>
              <p className="font-script text-brand-secondary-200">{config.brand.tagline}</p>
            </div>
          </div>
          <p className="mt-4 text-sm text-brand-cream-200/80">
            Hand-made pickles using cold-pressed oils, hand-picked produce, and
            recipes passed down through generations.
          </p>
        </div>

        <div>
          <h4 className="font-display text-lg text-white">Shop</h4>
          <ul className="mt-3 space-y-2 text-sm text-brand-cream-200/85">
            <li><Link href="/products" className="hover:text-brand-accent-300">All Pickles</Link></li>
            <li><Link href="/bulk-orders" className="hover:text-brand-accent-300">Bulk Orders</Link></li>
            <li><Link href="/products?category=mango" className="hover:text-brand-accent-300">Mango Pickle</Link></li>
            <li><Link href="/products?category=lemon" className="hover:text-brand-accent-300">Lemon Pickle</Link></li>
            <li><Link href="/products?category=bitter-gourd" className="hover:text-brand-accent-300">Bitter Gourd Pickle</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="font-display text-lg text-white">Company</h4>
          <ul className="mt-3 space-y-2 text-sm text-brand-cream-200/85">
            <li><Link href="/about" className="hover:text-brand-accent-300">About Us</Link></li>
            <li><Link href="/reviews" className="hover:text-brand-accent-300">Reviews</Link></li>
            <li><Link href="/faq" className="hover:text-brand-accent-300">FAQ</Link></li>
            <li><Link href="/contact" className="hover:text-brand-accent-300">Contact</Link></li>
            <li><Link href="/bulk-orders" className="hover:text-brand-accent-300">Wedding & Bulk Orders</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="font-display text-lg text-white">Connect</h4>
          <ul className="mt-3 space-y-2 text-sm text-brand-cream-200/85">
            <li>
              <a
                href={whatsappGenericLink()}
                target="_blank"
                rel="noreferrer"
                className="hover:text-brand-accent-300"
              >
                WhatsApp Us
              </a>
            </li>
            <li>
              <a
                href={instagramLink()}
                target="_blank"
                rel="noreferrer"
                className="hover:text-brand-accent-300"
              >
                @{config.instagramHandle}
              </a>
            </li>
            <li>
              <a href="mailto:hello@appaammas.in" className="hover:text-brand-accent-300">
                hello@appaammas.in
              </a>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="container-page flex flex-col items-center justify-between gap-2 py-4 text-xs text-brand-cream-200/70 md:flex-row">
          <p>© {new Date().getFullYear()} {config.brand.name}. All rights reserved.</p>
          <p>Made with ❤ in our village kitchen — shipping across India.</p>
        </div>
      </div>
    </footer>
  );
}
