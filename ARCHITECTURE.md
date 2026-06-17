# Architecture

## High-level

```
┌─────────────────────────────────────────────────────────────────────┐
│                          User (browser / mobile)                     │
└────────────────────────┬───────────────────────────┬─────────────────┘
                         │ HTTPS                      │ WhatsApp deep link
                         ▼                            ▼
            ┌─────────────────────────┐     ┌────────────────────┐
            │  Next.js 15 (Vercel)    │     │  WhatsApp Business │
            │  - App Router (RSC)     │     └────────────────────┘
            │  - SEO-friendly URLs    │
            │  - Server-side fetch    │
            └────────────┬────────────┘
                         │ REST /api/v1
                         ▼
            ┌─────────────────────────┐
            │  Spring Boot 3 / Java 21│
            │  ┌───────────────────┐  │
            │  │ Controller layer  │  │
            │  ├───────────────────┤  │
            │  │ Service layer     │  │
            │  ├───────────────────┤  │
            │  │ Repository (JPA)  │  │
            │  └───────────────────┘  │
            │  - JWT security         │
            │  - MapStruct mappers    │
            │  - Bean Validation      │
            │  - Global error handler │
            │  - OpenAPI / Swagger    │
            └────────────┬────────────┘
                         │ JDBC
                         ▼
            ┌─────────────────────────┐
            │  MySQL 8 + Flyway       │
            └─────────────────────────┘
```

## Backend layered architecture

```
api.v1.<domain>.controller   ← @RestController (only here)
        │
        ▼
api.v1.<domain>.service      ← @Service, business rules, @Transactional
        │
        ▼
domain.<domain>.repository   ← Spring Data JPA
        │
        ▼
domain.<domain>.<Entity>     ← JPA + Lombok
```

DTOs are immutable Java records under `api.v1.<domain>.dto`. MapStruct mappers (`<Domain>Mapper`) convert between entities and DTOs. Entities never leak across the controller boundary.

## Package layout

```
com.appaamma.pickles
├── PicklesApplication
├── common/                # ApiResponse, PageResponse, BaseEntity
├── config/                # Security, OpenAPI, properties, bootstrap
├── exception/             # Global handler + typed exceptions
├── security/              # JWT provider, filter, UserDetailsService
├── domain/
│   ├── user/              # User, Role, repositories
│   ├── product/           # Product, ProductImage, Category
│   ├── customer/          # Customer, Address
│   ├── order/             # Order, OrderItem, OrderStatus, OrderChannel
│   ├── review/            # Review
│   ├── contact/           # Contact
│   ├── inventory/         # Inventory
│   └── audit/             # AuditLog
└── api/v1/
    ├── auth/              # Login + JWT
    ├── product/           # Catalog + admin CRUD
    ├── category/          # Categories
    ├── order/             # Place + manage orders
    ├── customer/          # Admin customer search
    ├── review/            # Submit + moderate reviews
    ├── contact/           # Contact form
    ├── inventory/         # Stock tracking
    └── admin/             # Dashboard
```

## API conventions

- All endpoints prefixed `/api/v1/`
- Wrapper format: `ApiResponse<T>` with `success`, `message`, `data`, `timestamp`
- Pagination: `PageResponse<T>` (Spring `Pageable` query params: `page`, `size`, `sort`)
- Errors: typed `ErrorResponse` with HTTP status + machine-readable message + field errors for validation
- Auth: `Authorization: Bearer <jwt>` header for admin/staff endpoints
- Method-level security via `@PreAuthorize("hasRole('ADMIN')")`
- Public endpoints whitelisted in `SecurityConfig`

## Frontend architecture

```
frontend/src
├── app/                   # Next.js App Router (RSC by default)
│   ├── layout.tsx         # Root layout: Header, Footer, WhatsApp FAB
│   ├── page.tsx           # Home (server-fetched featured + reviews)
│   ├── products/
│   │   ├── page.tsx       # Listing + filters
│   │   └── [slug]/page.tsx# Product detail (SEO + JSON-LD)
│   ├── about/page.tsx
│   ├── contact/page.tsx
│   ├── reviews/page.tsx
│   ├── faq/page.tsx
│   ├── order/page.tsx
│   ├── robots.ts
│   ├── sitemap.ts
│   ├── error.tsx          # Error boundary
│   └── not-found.tsx
├── components/
│   ├── layout/            # Header, Footer, WhatsAppFab
│   ├── product/           # ProductCard, ProductFilters
│   ├── review/            # ReviewCard, ReviewForm
│   ├── contact/           # ContactForm
│   ├── order/             # OrderForm
│   └── ui/                # SectionHeading
└── lib/
    ├── api.ts             # Typed REST client (fetch, error handling)
    ├── config.ts          # Central env-driven config
    ├── types.ts           # TS mirror of backend DTOs
    └── utils.ts           # formatPrice, whatsappOrderLink, etc.
```

## SEO

- Per-page `Metadata` (title, description, OG, canonical)
- Dynamic `sitemap.ts` includes product slugs
- `robots.ts` is permissive
- JSON-LD `Product` and `FAQPage` structured data
- Mobile-first responsive Tailwind theme
- `next/image` for optimized images

## Security

- BCrypt for password hashing
- HS256 JWT (32+ char secret required)
- Stateless (no sessions)
- CORS configurable per environment
- CSP-friendly headers (`X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy`, `Permissions-Policy`)
- Input validation on every DTO via `jakarta.validation`
- Global exception handler — never leaks stack traces
