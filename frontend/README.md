# Frontend — Appa & Amma's Pickles

Next.js 15 + React 19 + TypeScript + Tailwind CSS storefront.

## Quick Start

```bash
cp .env.example .env.local
npm install
npm run dev
# http://localhost:3000
```

## Scripts

| Command | Purpose |
|---------|---------|
| `npm run dev` | Start dev server with hot reload |
| `npm run build` | Production build |
| `npm run start` | Start production server (after build) |
| `npm run lint` | ESLint |
| `npm run type-check` | TypeScript check (no emit) |

## Pages

| Route | File | Notes |
|-------|------|-------|
| `/` | [src/app/page.tsx](src/app/page.tsx) | Hero, featured products, reviews |
| `/products` | [src/app/products/page.tsx](src/app/products/page.tsx) | Listing + filters + pagination |
| `/products/[slug]` | [src/app/products/[slug]/page.tsx](src/app/products/%5Bslug%5D/page.tsx) | Product detail + SEO JSON-LD |
| `/about` | [src/app/about/page.tsx](src/app/about/page.tsx) | Brand story |
| `/contact` | [src/app/contact/page.tsx](src/app/contact/page.tsx) | Contact form |
| `/order` | [src/app/order/page.tsx](src/app/order/page.tsx) | Cart + checkout |
| `/reviews` | [src/app/reviews/page.tsx](src/app/reviews/page.tsx) | Reviews + submission |
| `/faq` | [src/app/faq/page.tsx](src/app/faq/page.tsx) | FAQ + JSON-LD |

## Environment Variables

| Variable | Default | Purpose |
|----------|---------|---------|
| `NEXT_PUBLIC_API_BASE_URL` | `http://localhost:8001/api/v1` | Backend base URL |
| `NEXT_PUBLIC_ENABLE_PAYMENTS` | `true` | Shows UPI and other online payment methods in checkout |
| `NEXT_PUBLIC_WHATSAPP_NUMBER` | `919999999999` | WhatsApp number for deep links (no `+`) |
| `NEXT_PUBLIC_INSTAGRAM_HANDLE` | `appaammas.pickles` | Instagram username |
| `NEXT_PUBLIC_SITE_URL` | `http://localhost:3000` | Used for canonical URLs and sitemap |

## Theming

The brand palette and typography live in [tailwind.config.ts](tailwind.config.ts) and [src/app/globals.css](src/app/globals.css). The colour system is keyed off `brand.primary` (terracotta), `brand.accent` (turmeric/mustard), `brand.cream`, `brand.earth`, and `brand.leaf`.

## Replacing placeholder images

The seeded data references SVG placeholders in `public/images/`. Replace these with real photographs (JPEG / WEBP) and update the URLs in the database (or update [V2__seed_catalog.sql](../backend/src/main/resources/db/migration/V2__seed_catalog.sql) before first run).
