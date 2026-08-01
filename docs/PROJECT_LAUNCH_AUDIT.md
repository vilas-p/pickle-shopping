# PROJECT LAUNCH AUDIT

Project: Appa & Amma's Pickles  
Audit date: 2026-07-22  
Scope: frontend, backend, database migrations, API controllers, auth/security, payment, shipping, notifications, Docker, deployment docs, SEO routes, test/config/dependency health, and repository structure.

# Executive Summary

### Production Readiness

**58 / 100**

### Status

**🔴 Not Ready**

### Summary of Major Issues

| Area | Verdict | Evidence |
|---|---:|---|
| Frontend production build | Blocker | `npm run build` fails in `frontend/src/app/admin/(protected)/shipments/[id]/page.tsx` because the generated Next.js type check expects promise-based `params`. |
| Dependency security | Blocker | `npm audit --omit=dev` reports 3 production vulnerabilities: critical `next`, high `sharp`, moderate transitive `postcss`. |
| Dependency drift | Blocker | `frontend/package.json` declares Next `15.5.20` and React `19.2.0`, but `frontend/package-lock.json` still pins Next `15.0.3` and React `19.0.0-rc`. The build output confirms Next `15.0.3`. |
| Backend tests | Blocker | `./gradlew.bat test` fails: `PicklesApplicationTests.contextLoads()` cannot bind required `app.shiprocket.email` and `app.shiprocket.password`. |
| Legal/compliance pages | Blocker | Dedicated Privacy Policy, Terms, Refund, Return, Cancellation, Shipping Policy, Cookie Policy, FSSAI, GST, and business information pages were not found in `frontend/src/app`. |
| CI/CD | High | No `.github` workflow files found. |
| Production env verification | High | Local `.env` files exist, but contents were not inspected. `.env.example` files exist but are blocked by editor ignore rules, so coverage is `⚠️ Cannot Verify`. |
| Monitoring/observability | High | Spring Actuator health/info exists, but no external monitoring, alerting, uptime checks, tracing, or error reporting config found. |
| E-commerce completeness | Mixed | Cart, checkout, orders, payments, inventory, shipping, tracking, reviews, admin orders/contacts/shipments exist. Wishlist, coupons, taxes, invoices, returns/refunds workflow, loyalty, gift cards, advanced search/recommendations are missing or incomplete. |

### Validation Commands Run

| Command | Result |
|---|---|
| `frontend: npm audit --omit=dev` | Failed: critical Next.js advisories plus high `sharp` and moderate `postcss`. |
| `frontend: npm run type-check` | Passed. |
| `frontend: npm run build` | Failed on Next generated type check for dynamic shipment page. |
| `backend: .\gradlew.bat compileJava` | Passed. |
| `backend: .\gradlew.bat test` | Failed: 16 tests run, 1 failed due missing Shiprocket test properties. |

---

# Architecture Review

### Current Architecture

| Layer | Current implementation |
|---|---|
| Frontend | Next.js App Router application under `frontend/src/app`, feature modules under `frontend/src/features`, shared UI/lib/layout under `frontend/src/shared`. |
| Backend | Spring Boot 3.3.5 REST API under `backend/src/main/java/com/appaamma/pickles/api/v1`, domain entities/repositories under `domain`, config/security/exception layers separated. |
| Database | MySQL 8 with Flyway migrations under `backend/src/main/resources/db/migration`. |
| Deployment | Dockerfiles for frontend/backend plus root `docker-compose.yml`; `DEPLOYMENT.md` describes Vercel/VPS/managed MySQL options. |
| Payments | Razorpay Java SDK and checkout integration. |
| Shipping | Shiprocket serviceability, shipment, tracking, webhook, and admin shipment UI present. |
| Notifications | Email, SMS, WhatsApp queue/template framework and providers present. |

### Strengths

- Clear frontend/backend separation.
- API versioning uses `/api/v1` consistently in controllers.
- Backend has layered service/repository/controller organization.
- Flyway migrations are used instead of ad hoc schema creation.
- Spring Security has stateless JWT, CORS config, security headers, method security, and rate limit filter for selected public endpoints.
- Frontend includes middleware route gating for `/account` and protected `/admin` paths.
- Payment verification is stronger than a basic implementation: Razorpay signature verification, gateway fetch/capture, amount/currency validation, duplicate payment constraints, webhook signature verification, and payment attempt persistence exist.
- Notification architecture is broader than MVP: templates, queues, logs, retry processor, and provider abstractions are present.
- Deployment docs and Dockerfiles exist.

### Weaknesses

- Production frontend build currently fails.
- Backend test suite currently fails.
- Frontend lockfile does not match package declarations.
- Production npm dependency audit fails.
- No CI/CD pipeline was found.
- No dedicated legal/compliance pages were found.
- Product image upload/storage is not actually implemented in backend code; product images are modeled as URLs.
- Monitoring, alerting, error tracking, and analytics are not configured.
- Public tracking by order number is available without secondary verification; this may expose order details depending on response shape.
- Rate limiting is in-memory only, so it will reset on restart and not coordinate across multiple backend instances.

### Scalability

| Area | Rating | Notes |
|---|---:|---|
| Frontend | Medium | Next.js can scale, but build fails and dependency drift must be fixed first. Static/dynamic route mix is reasonable. |
| Backend | Medium | Stateless auth and Hikari pool help. In-memory rate limiter and notification queues in MySQL are acceptable for early launch but limited for higher volume. |
| Database | Medium | MySQL + indexes/constraints exist. Needs production backup/restore testing and query monitoring. |
| Notifications | Medium | Queue tables exist, but external provider credentials and delivery SLAs require manual verification. |
| Payments | Medium-High | Payment validation is strong, but refund/reconciliation workflow is incomplete. |

### Maintainability

- Good: feature folders in frontend; controller/service/domain split in backend; DTO usage present; OpenAPI dependency configured.
- Needs work: stale generated/build artifacts exist in the workspace (`backend/build`, `backend/bin`, `frontend/tsconfig.tsbuildinfo`); lockfile drift; legacy checkout component remains under `frontend/src/features/checkout/components/_legacy/OrderForm.tsx`.

### Technical Debt

| Debt | Severity | Recommendation |
|---|---:|---|
| Stale lockfile and installed Next/React versions | Critical | Run a controlled dependency install/update, commit the regenerated lockfile, rerun audit/build. |
| Frontend build failure | Critical | Update dynamic route page props to the installed Next.js API or align Next version. |
| Backend tests missing Shiprocket properties | High | Add test properties or make Shiprocket client conditional when credentials are absent. |
| Legal pages missing | High | Add production-ready legal policy pages before launch. |
| In-memory rate limiter | Medium | Use Redis or gateway-level rate limiting for production scaling. |
| Product image storage missing | Medium | Add Cloudinary/S3/Supabase storage or admin upload endpoint with validation. |

### Folder Organization

| Folder/File | Review |
|---|---|
| `frontend/src/app` | Route-based pages are organized by user journey: products, cart, checkout, account, admin, contact, reviews, tracking. |
| `frontend/src/features` | Good modular feature grouping: auth, cart, checkout, order, product, review, admin, shipping, delivery, address. |
| `frontend/src/shared` | Common config, HTTP, layout, constants, UI are separated. |
| `backend/src/main/java/com/appaamma/pickles/api/v1` | Controllers and services are organized by domain. |
| `backend/src/main/java/com/appaamma/pickles/domain` | Entity/repository model is separated from API DTOs. |
| `backend/src/main/resources/db/migration` | 12 migrations cover base schema, seed catalog, auth, variants, payments, notification framework, hardening, Shiprocket. |
| `docs` | Shipping integration planning docs exist. |
| root docs | Architecture, deployment, Razorpay, brand, packaging, business docs exist. |

### Overall Architecture Rating

**7 / 10** as an application design.  
**5 / 10** for launch readiness because build/test/dependency/legal/ops blockers remain.

---

# Technology Stack

| Category | Technology / Version Found | Evidence |
|---|---|---|
| Frontend framework | Next.js declared `15.5.20`; lockfile installed `15.0.3` | `frontend/package.json`, `frontend/package-lock.json`, `npm run build` output |
| UI runtime | React declared `19.2.0`; lockfile pinned `19.0.0-rc-66855b96-20241106` | `frontend/package.json`, `frontend/package-lock.json` |
| Frontend state | Zustand `^5.0.14` | `frontend/package.json` |
| Styling | Tailwind CSS `^3.4.14`, PostCSS, Autoprefixer | `frontend/package.json`, `tailwind.config.ts`, `globals.css` |
| Backend framework | Spring Boot `3.3.5` | `backend/build.gradle.kts` |
| Backend language | Java 17 toolchain | `backend/build.gradle.kts` |
| Database | MySQL 8 | `docker-compose.yml`, Flyway migrations |
| ORM | Spring Data JPA / Hibernate | `backend/build.gradle.kts`, entities/repositories |
| Migrations | Flyway core + MySQL | `backend/build.gradle.kts`, `db/migration` |
| Security | Spring Security, BCrypt, JWT via JJWT `0.12.6` | `backend/build.gradle.kts`, `SecurityConfig.java` |
| API docs | springdoc OpenAPI `2.6.0` | `backend/build.gradle.kts`, `OpenApiConfig.java` |
| Payments | Razorpay Java SDK `1.4.6` + Razorpay Checkout script | `backend/build.gradle.kts`, `PaymentService.java`, `RazorpayScript.tsx` |
| Shipping | Custom Shiprocket integration | `api/v1/shipping`, `ShiprocketProperties.java` |
| Notifications | Resend, SES, MSG91, Twilio, WhatsApp Business API provider abstractions | `api/v1/notification/provider` |
| Build tools | npm, Gradle wrapper | `frontend/package.json`, `backend/gradlew.bat` |
| Containers | Docker, Docker Compose | root `docker-compose.yml`, frontend/backend Dockerfiles |
| Cloud | ⚠️ Not Found | Deployment guide recommends Vercel/VPS/managed MySQL, but no active cloud config found. |
| Storage | ⚠️ Not Found | Cloudinary/S3 patterns allowed in Next images, but no backend storage implementation found. |

### Outdated / Vulnerable Dependencies

| Dependency | Issue | Required action |
|---|---|---|
| `next` | Critical npm audit advisories; installed lockfile version is `15.0.3` despite package declaration `15.5.20`. | Regenerate lockfile, upgrade to a patched Next release, rerun `npm audit`, `npm run build`. |
| `sharp` | High libvips inherited vulnerabilities via Next image optimizer. | Upgrade via Next/sharp transitive resolution. |
| `postcss` | Moderate XSS advisory in transitive dependency. | Upgrade via `npm audit fix` or controlled dependency refresh. |
| React | Lockfile uses RC; package declares stable `19.2.0`. | Regenerate lockfile and verify runtime behavior. |
| Spring Boot 3.3.5 | Could be behind current patch line. | Run Gradle dependency vulnerability scan and upgrade patch line after testing. |

---

# Project Structure Review

### Inventory

PowerShell inventory excluding common generated/build folders reported:

| Metric | Count |
|---|---:|
| Non-build source/documentation files | 455 |
| Backend Java source files | 219 |
| Backend migrations | 12 |
| Backend test files | 5 |
| Frontend app files | 35 |
| Frontend feature files | 69 |

### Naming Conventions

- Backend Java package naming is consistent: `com.appaamma.pickles`.
- API folders are domain-based and versioned under `api/v1`.
- Frontend feature folders use clear business names.
- Route naming is readable and SEO-friendly for public pages: `/products`, `/about`, `/reviews`, `/contact`, `/faq`, `/track-order`.

### Unused / Generated / Dead Code Observations

| Finding | Severity | Evidence |
|---|---:|---|
| Generated/build outputs present in workspace | Low-Medium | `backend/build`, `backend/bin`, generated source folders appear in workspace structure. Should remain ignored and not committed. |
| Legacy checkout component remains | Low | `frontend/src/features/checkout/components/_legacy/OrderForm.tsx`. |
| Product image upload claims not matched by controller | Medium | Repository memory mentions admin image upload endpoint, but grep found no `MultipartFile` upload controller. Current product images are URL records. |
| No GitHub workflows | High | `.github/**` search returned no files. |

### Duplicate Code / Refactoring Opportunities

- Frontend auth and admin auth are intentionally separate, but both use similar session persistence patterns; keep separate for security but consider shared token lifecycle helpers.
- Notification provider abstractions are good; next refactor target should be operational dashboards and retry controls.
- Shipping integration needs clearer separation between Shiprocket API transport, business workflow, and webhook verification.

---

# Frontend Audit

### Implemented Pages / Routes

| Route | Status |
|---|---|
| `/` | Implemented homepage. |
| `/products` | Product listing implemented. |
| `/products/[slug]` | Product detail with metadata and product schema implemented. |
| `/cart` | Cart page implemented. |
| `/checkout` | Checkout flow implemented. |
| `/checkout/confirmation/[orderNumber]` | Confirmation page implemented. |
| `/auth/login` | Customer OTP login page implemented. |
| `/account` | Customer account page implemented. |
| `/account/orders` | Customer order history implemented. |
| `/account/orders/[orderNumber]` | Customer order detail implemented. |
| `/track-order` | Public tracking page implemented. |
| `/order` | Order CTA page implemented. |
| `/reviews` | Reviews page implemented. |
| `/contact` | Contact page implemented. |
| `/bulk-orders` | Bulk orders page implemented. |
| `/faq` | FAQ page implemented with structured data. |
| `/about` | Brand/about page implemented. |
| `/admin/login` | Admin login implemented. |
| `/admin/dashboard` | Admin dashboard implemented. |
| `/admin/orders` | Admin orders board implemented. |
| `/admin/contacts` | Admin contacts board implemented. |
| `/admin/shipments` | Admin shipment list implemented. |
| `/admin/shipments/[id]` | Implemented but currently causes production build type failure. |
| `/label-preview` | Internal label preview, noindex. |
| Custom 404/error | `not-found.tsx` and `error.tsx` exist. |

### Responsive Design

- Uses Tailwind utility classes and responsive grids in pages/components.
- `viewport` metadata is configured in `frontend/src/app/layout.tsx`.
- ⚠️ Requires Manual Verification: no Playwright, Lighthouse, or visual regression results found.

### Navigation

- Header, footer, mobile nav, WhatsApp FAB exist under `frontend/src/shared/layout`.
- Account/admin route gating exists in `frontend/middleware.ts` and client guards.

### Accessibility

| Item | Status |
|---|---|
| `html lang` | Present: `lang="en"`. |
| Image alt text | Present on major static/about/product images reviewed. |
| ARIA examples | Present in cart icon and review rating components. |
| Keyboard navigation | ⚠️ Requires Manual Verification. |
| Focus management | ⚠️ Not Found as a deliberate focus-management strategy. |
| Contrast | ⚠️ Requires Manual Verification with automated tooling. |
| Form labels/errors | Partially implemented; requires full page audit. |

### Forms and Validation

| Form | Status |
|---|---|
| Checkout | Client checks OTP verification, address completion, pincode format; backend validates DTOs and ownership. |
| OTP login | Implemented through `customer-auth` APIs. |
| Contact | Implemented. |
| Reviews | Implemented. |
| Admin login | Implemented. |
| Bulk orders | Static/CTA style page; full workflow ⚠️ Not Found. |

### Loading States / Error Handling

- Hydration skeletons exist for cart/checkout/account/admin guards.
- `error.tsx` and `not-found.tsx` exist.
- API helper throws typed `ApiError` from backend wrapped responses.
- ⚠️ Requires Manual Verification: user-facing error coverage for every API failure state.

### Images

- Product and about images exist in `frontend/public/images`.
- Next image remote patterns allow S3, Cloudinary, Unsplash.
- ⚠️ Not Found: backend upload/storage pipeline, image moderation/validation, CDN configuration.

### Typography / Buttons / Icons / Theme

- Tailwind theme and global CSS exist.
- Custom design docs exist: `frontend/DESIGN_SYSTEM.md`, `BRAND_BIBLE.md`.
- ⚠️ Requires Manual Verification: visual polish, contrast, text overflow, and mobile CTA layout via screenshots.

### Dark Mode

⚠️ Not Found. No explicit dark mode implementation found.

### Component Reuse

Good feature-level reuse is present: product cards/gallery/actions, cart line item/summary, shipping status/timeline, admin boards, auth guards.

### SEO

| SEO item | Status |
|---|---|
| Root metadata | Present in `frontend/src/app/layout.tsx`. |
| Page metadata | Present on most public and private pages. |
| Product metadata | Dynamic metadata in `products/[slug]/page.tsx`. |
| Open Graph | Present in root and product detail. |
| Twitter cards | Present in root metadata. |
| Structured data | Present for FAQ and product detail. |
| robots.txt | Generated by `frontend/src/app/robots.ts`. |
| sitemap.xml | Generated by `frontend/src/app/sitemap.ts`, includes products from API with fallback. |
| Canonical URLs | ⚠️ Not Found explicitly. |
| Legal SEO pages | ⚠️ Not Found. |

### Performance

| Item | Status |
|---|---|
| Next production build | Fails currently. |
| Image optimization | Next Image used; remote patterns configured. Vulnerable Next/sharp versions must be upgraded. |
| Bundle size | ⚠️ Cannot Verify because production build fails. |
| Lazy loading | Next Image defaults likely help; no full audit run. |
| Caching | Public fetches use revalidate/tags in HTTP helper where provided; coverage requires route-by-route check. |
| Compression | Backend compression enabled. Frontend hosting compression depends on platform. |
| Lighthouse estimate | ⚠️ Cannot Verify. Do not launch until build passes and Lighthouse is run on production-like deployment. |

---

# Backend Audit

### API Design

- REST-like controllers are grouped by domain and versioned under `/api/v1`.
- Standard response wrapper `ApiResponse` and `PageResponse` exist.
- Pagination is used for product, order, review, contact, notification log/admin endpoints.
- DTOs are used for requests/responses.
- Global exception handler exists.

### REST Standards

| Strength | Concern |
|---|---|
| Uses GET/POST/PUT/PATCH/DELETE consistently for most resources. | Some action endpoints (`assign-awb`, `pickup`, `cancel`) are RPC-style; acceptable for operational commands but document them. |
| Public/admin separation is mostly clear through path and roles. | `GET /api/v1/orders/number/{orderNumber}` is public and should be privacy-reviewed. |

### Validation

- `spring-boot-starter-validation` is included.
- Controllers use `@Valid` on request bodies.
- Config properties use `@Validated` and `@NotBlank` for JWT/Razorpay/Shiprocket.
- Backend test failure proves validation is active for required Shiprocket fields.

### Exception Handling

- `GlobalExceptionHandler` and `ErrorResponse` exist.
- `application-prod.yml` suppresses stack traces/messages in server errors.
- Security auth entry point returns structured errors.

### Logging

- Logback config exists.
- Production log levels: root `WARN`, app `INFO`.
- Payment service logs important events and masks Razorpay key ID.
- ⚠️ Not Found: centralized log aggregation, correlation IDs, request IDs, PII redaction policy.

### Security

- Stateless Spring Security.
- JWT filters for admin and customer tokens.
- BCrypt password encoder.
- CSRF disabled because bearer tokens are used and CORS credentials are disabled.
- Security headers configured: content type, frame deny, referrer no-referrer, HSTS, cache control.
- CORS allowed origins configured by env.
- Method-level `@PreAuthorize` is used on admin/customer endpoints.

### Layer Separation

Good: controllers -> services -> repositories/domains. Payment/order/inventory/notification/shipping business logic is mainly in services.

### Transactions

- Transactional annotations are present in order, payment, shipping webhook, and other services.
- Inventory reservation happens inside order/payment flows.

### Business Logic

Implemented:
- COD order creation.
- Authenticated online payment order creation and verification.
- Customer OTP login.
- Address book.
- Admin order management.
- Inventory reservation/upsert.
- Product/category/review/contact management.
- Notification event publishing.
- Shiprocket shipment workflow.

Missing/incomplete:
- Full refunds workflow.
- Returns/cancellations workflow.
- Tax/GST calculation.
- Invoice generation.
- Coupon/discount engine.
- Wishlist.
- Bulk order workflow beyond marketing/contact.

### API Versioning

- Current API is versioned as `/api/v1`.
- ⚠️ Not Found: version deprecation policy.

### Rate Limiting

- Public API in-memory rate limit filter covers order tracking, order placement, contact/review/delivery estimate.
- OTP service has per-identifier rate limiting.
- Missing: distributed rate limiter for multi-instance deployment; admin login brute force lockout needs manual verification.

### Caching

- Backend no explicit response caching found.
- Frontend has fetch cache/revalidate support.

### File Uploads

⚠️ Not Found. No `MultipartFile` or real upload/storage endpoint found.

### Email / Notifications / Background Jobs

- Notification queue tables and providers exist.
- Async config and retry queue processor exist.
- Providers include mock/log/Resend/SES/MSG91/Twilio/WhatsApp Business API.
- ⚠️ Requires Manual Verification: real provider credentials, templates approved by WhatsApp, email domain authentication, bounce handling.

---

# Database Audit

### Schema

Flyway migrations found:

| Migration | Purpose |
|---|---|
| `V1__init_schema.sql` | Roles, users, categories, products, images, customers, addresses, orders, order items, reviews, contacts, inventory, audit logs. |
| `V2__seed_catalog.sql` | Seed catalog. |
| `V3__customer_auth.sql` | OTP/customer auth support. |
| `V4__product_variants.sql` | Product variants and inventory/order variant links. |
| `V5__payments.sql` | Payments and Razorpay fields. |
| `V6__notification_framework_schema.sql` | Notification templates/logs/queues. |
| `V7__payment_attempts.sql` | Payment attempts. |
| `V8__payment_security_hardening.sql` | Unique payment constraints. |
| `V9__db_security_hardening.sql` | Customer phone uniqueness and OTP index. |
| `V10__brand_voice_notification_templates.sql` | Notification templates. |
| `V11__shiprocket_integration.sql` | Shipments, shipment events, Shiprocket token/order fields. |
| `V12__shiprocket_notification_templates.sql` | Shipping notification templates. |

### Normalization

- Good separation: customers, addresses, orders, order_items, payments, payment_attempts, products, variants, inventory.
- Product images are separate child rows.
- Notification templates/logs/queues are separated.

### Indexes / Foreign Keys / Constraints

- Unique constraints exist on roles, users email, category name/slug, product slug, customer email/phone, order number, payment identifiers, product variant SKU.
- Foreign keys exist for user roles, products/categories, images/products, customer addresses, orders/customer/address, order items/order/product/variant, inventory/product/variant, shipments/order, shipment events/shipment.
- Cascade rules exist for child-owned records like user roles, product images, addresses, order items, inventory, shipment events.

### Performance

- Some indexes exist, but full query plan review was not performed.
- `OrderRepository` and `ProductRepository` use `@EntityGraph` to reduce N+1 risks.
- Hikari pool configured with max pool size 10.

### Backup Strategy

- `DEPLOYMENT.md` includes a `mysqldump` example.
- ⚠️ Not Found: automated scheduled backups, restore drills, retention policy, point-in-time recovery.

---

# Authentication & Authorization

### Login / Registration

| User type | Status |
|---|---|
| Customer | OTP request/resend/verify via `/api/v1/customer-auth`; customer profile `/me`. |
| Admin/staff | Email/password login via `/api/v1/auth/login`; default admin initializer exists. |

### Session Management

- Backend uses stateless JWT.
- Frontend stores customer/admin auth state in `sessionStorage` through Zustand and writes session marker cookies for middleware route gating.
- Cookies are `SameSite=Strict` and `Secure` in HTTPS contexts, but they are only expiry markers, not bearer tokens.

### JWT

- Separate admin and customer JWT secrets/properties exist.
- Secrets require at least 32 characters.
- Expiration values are configurable.
- ⚠️ Not Found: refresh tokens. Sessions expire and require login/OTP again.

### OAuth

⚠️ Not Found.

### Role-Based Access

- Roles include ADMIN, STAFF, CUSTOMER usage via `@PreAuthorize`.
- Admin/staff endpoints are protected at method level.
- Customer endpoints are protected at method level.

### Password Security

- BCrypt encoder is configured.
- Admin initializer hashes password.
- ⚠️ Requires Manual Verification: default admin password has been changed in production. `DEPLOYMENT.md` explicitly warns to change `admin@appaammas.in` / `Admin@123`.

### Account Recovery

- Customer OTP login reduces password recovery needs.
- Admin account recovery/reset is documented as SQL manual operation.
- ⚠️ Not Found: secure self-service admin password reset.

### CSRF / XSS / SQL Injection Protection

- CSRF disabled due stateless bearer tokens and no credentialed CORS.
- React/Next escapes content by default.
- JPA repositories reduce SQL injection risk.
- ⚠️ Requires Manual Verification: any raw/native SQL usage and HTML injection points.

---

# Security Audit

### OWASP Top 10 Review

| Risk | Status | Notes |
|---|---|---|
| A01 Broken Access Control | Partial | Method security exists. Public order tracking endpoint needs privacy review. Admin route middleware is marker-cookie based and must not be treated as authorization; backend role checks are the source of truth. |
| A02 Cryptographic Failures | Partial | BCrypt/JWT secrets validated. HTTPS required in deployment. Local env files exist; secret storage requires manual verification. |
| A03 Injection | Good baseline | DTO validation/JPA used. Need SAST/manual review for raw SQL and JSON payload handling. |
| A04 Insecure Design | Partial | Good payment design. Missing formal threat model, refund/return workflows, monitoring, legal pages. |
| A05 Security Misconfiguration | High risk | Frontend dependency drift, vulnerable Next version, no CI security checks. Swagger exposed publicly; acceptable only if intentional. |
| A06 Vulnerable Components | Blocker | npm audit fails with critical/high vulnerabilities. |
| A07 Auth Failures | Partial | JWT/BCrypt/OTP implemented. Need distributed rate limiting and admin brute-force review. |
| A08 Integrity Failures | Partial | No CI/CD provenance, no lockfile integrity alignment. Razorpay webhook signed. Shiprocket webhook verification needs review. |
| A09 Logging/Monitoring Failures | High risk | App logs exist; no centralized monitoring/alerting/error tracking found. |
| A10 SSRF | Medium risk | Next critical advisories include SSRF/middleware issues. Shiprocket/notification outbound integrations need allowlist/timeouts review. |

### Dependency Vulnerabilities

`npm audit --omit=dev` is a launch blocker. Do not deploy until resolved.

### Secrets Exposure

- `.env`, `backend/.env`, `frontend/.env.local` exist locally.
- Root and subproject `.gitignore` ignore common env files.
- ⚠️ Cannot Verify: env values were not inspected.
- ⚠️ Cannot Verify: `.env.example` contents were blocked by ignore rules.

### Environment Variables

Key production variables referenced:

- Backend: `SPRING_PROFILES_ACTIVE`, datasource variables, `APP_JWT_SECRET`, `APP_CUSTOMER_JWT_SECRET`, `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`, `RAZORPAY_WEBHOOK_SECRET`, notification provider secrets, Shiprocket credentials, CORS origins.
- Frontend: `NEXT_PUBLIC_API_BASE_URL`, `NEXT_PUBLIC_WHATSAPP_NUMBER`, `NEXT_PUBLIC_INSTAGRAM_HANDLE`, `NEXT_PUBLIC_SITE_URL`.

### CORS / HTTPS / Headers

- Backend CORS restricts origins through config and disables credentials.
- Backend HSTS enabled.
- Frontend CSP/security headers configured in `next.config.ts`.
- CSP still allows `'unsafe-inline'` for scripts/styles due framework/payment needs; consider nonce/hashing later.

### Input Validation

- Bean validation present.
- Checkout has client validation.
- Public form spam protection is limited to in-memory rate limiting.

### Cookie Security

- Frontend marker cookies use `SameSite=Strict`; `Secure` added under HTTPS.
- JWTs are stored in sessionStorage, not HttpOnly cookies. This reduces CSRF but increases exposure if XSS occurs.

### File Upload Security

⚠️ Not Found because file upload is not implemented.

### Encryption

- Password/OTP hashes use BCrypt.
- TLS/HTTPS requires deployment config.
- ⚠️ Not Found: encryption at rest configuration for database/backups.

### Audit Logging

- `AuditLogService` and audit table exist.
- Payment/order status events are logged.
- ⚠️ Requires Manual Verification: audit log retention, admin viewer, tamper resistance.

### Security Score

**62 / 100**

Security is architecturally better than a basic MVP, but vulnerable frontend dependencies, build failure, missing CI security gates, incomplete monitoring, and legal/compliance gaps prevent launch.

---

# Performance Audit

| Area | Findings | Risk |
|---|---|---|
| Frontend build | Production build fails, so bundle size and runtime performance cannot be verified. | Critical |
| Frontend images | Uses Next Image and local assets; vulnerable image optimizer dependencies must be upgraded. | High |
| Backend | Compression enabled; Hikari pool configured; stateless API. | Medium |
| Database | EntityGraph usage reduces N+1 in key repositories; indexes/constraints exist. | Medium |
| API latency | ⚠️ Cannot Verify without running load tests. | Medium |
| Caching | Limited/partial. Public product/category fetches may use Next revalidation; backend caching not found. | Medium |
| CDN | ⚠️ Not Found. | Medium |
| Memory/CPU | ⚠️ Cannot Verify. Docker Java opts set `MaxRAMPercentage=75`. | Medium |
| Async operations | Notification queue async exists. | Low-Medium |
| Expected bottlenecks | MySQL notification queues, in-memory rate limiter, image delivery without CDN/storage pipeline, Shiprocket/payment external API calls. | Medium |

---

# API Audit

Authentication legend: Public = allowed in `SecurityConfig`; Customer = `ROLE_CUSTOMER`; Admin/Staff = `ROLE_ADMIN` or `ROLE_STAFF`; Admin = `ROLE_ADMIN`; Authenticated = any authenticated token unless method role narrows it.

| Endpoint | Purpose | Method | Auth | Validation / Response / Error Handling | Potential Improvements |
|---|---|---:|---|---|---|
| `/api/v1/auth/login` | Admin/staff login | POST | Public | `LoginRequest`, returns JWT login response, global errors. | Add brute-force/account lockout verification. |
| `/api/v1/customer-auth/otp/request` | Request OTP | POST | Public | DTO validation, OTP rate limiting. | Verify production SMS/WhatsApp provider and abuse controls. |
| `/api/v1/customer-auth/otp/resend` | Resend OTP | POST | Public | DTO validation, OTP rate limiting. | Add CAPTCHA/risk controls if abused. |
| `/api/v1/customer-auth/otp/verify` | Verify OTP/login | POST | Public | BCrypt OTP hash verification, returns customer JWT. | Add device/session audit trail. |
| `/api/v1/customer-auth/me` | Current customer | GET | Customer | Principal based response. | Add profile completeness flags. |
| `/api/v1/customer-auth/me` | Update profile | PUT | Customer | `UpdateCustomerProfileRequest`. | Add email verification if email becomes important. |
| `/api/v1/categories` | List public categories | GET | Public | Wrapped response. | Add cache headers. |
| `/api/v1/categories/admin` | List admin categories | GET | Admin/Staff | Protected. | Add pagination if category count grows. |
| `/api/v1/categories/slug/{slug}` | Get category by slug | GET | Public | Resource not found handling. | Good. |
| `/api/v1/categories` | Create category | POST | Admin | `CategoryRequest`. | Add slug conflict UX. |
| `/api/v1/categories/{id}` | Update category | PUT | Admin | `CategoryRequest`. | Add audit logging if absent. |
| `/api/v1/categories/{id}` | Delete category | DELETE | Admin | Resource handling. | Soft delete may be safer if products exist. |
| `/api/v1/products` | List products | GET | Public | Pageable/filter response. | Add cache/revalidate strategy and search tuning. |
| `/api/v1/products/featured` | Featured products | GET | Public | Wrapped response. | Add cache headers. |
| `/api/v1/products/slug/{slug}` | Product detail | GET | Public | Resource not found handling. | Good. |
| `/api/v1/products/{id}` | Product by id | GET | Admin/Staff | Protected. | Clarify if public ID lookup should exist. |
| `/api/v1/products/admin` | Admin product list | GET | Admin/Staff | Protected, pageable. | Add export/search if needed. |
| `/api/v1/products` | Create product | POST | Admin | `ProductRequest`. | Add image upload/storage, audit logging. |
| `/api/v1/products/{id}` | Update product | PUT | Admin | `ProductRequest`. | Add optimistic locking for inventory/catalog changes. |
| `/api/v1/products/{id}` | Delete product | DELETE | Admin | Protected. | Prefer deactivate over hard delete. |
| `/api/v1/inventory` | List inventory | GET | Admin/Staff | Protected. | Add pagination/export. |
| `/api/v1/inventory/low-stock` | Low stock | GET | Admin/Staff | Protected. | Add threshold configuration/admin alerts. |
| `/api/v1/inventory/product/{productId}` | Upsert inventory | PUT | Admin/Staff | `InventoryUpdateRequest`. | Add audit log and variant-specific route clarity. |
| `/api/v1/orders` | Create COD order | POST | Public | `CreateOrderRequest`, inventory reserve, pricing, customer/address creation. | Consider customer auth requirement for all orders or guest anti-fraud checks. |
| `/api/v1/orders/number/{orderNumber}` | Public order lookup/tracking | GET | Public | Returns public order response. | Add phone/pincode verification to prevent enumeration. |
| `/api/v1/orders` | Admin list orders | GET | Admin/Staff | Pageable/status filter. | Add search/export. |
| `/api/v1/orders/{id}` | Admin order detail | GET | Admin/Staff | Protected. | Good. |
| `/api/v1/orders/{id}/status` | Update order status | PATCH | Admin/Staff | Validates state transition. | Add stronger audit and notification retry visibility. |
| `/api/v1/orders/my` | Customer order history | GET | Customer | Principal scoped. | Good. |
| `/api/v1/orders/my/{orderNumber}` | Customer order detail | GET | Customer | Ownership checked. | Good. |
| `/api/v1/payments/create-order` | Create Razorpay order | POST | Customer | Requires customer, validates checkout, stores attempt. | Add idempotency key usage; header allowed but service use not verified. |
| `/api/v1/payments/verify` | Verify Razorpay payment | POST | Customer | Signature, gateway fetch, capture, amount/currency validation. | Return order response for frontend reconciliation. |
| `/api/v1/payments/cancel-order` | Cancel unpaid attempt | POST | Customer | Ownership checked, releases reservation. | Add scheduled cleanup for abandoned attempts. |
| `/api/v1/payments/webhook` | Razorpay webhook | POST | Public signed | HMAC verification, captured/failed/refund handling. | Ensure empty webhook secret cannot pass in any env. |
| `/api/v1/shipping/serviceability` | Check serviceability | POST | Public | `ServiceabilityRequest`. | Rate limit exists only indirectly? Public form rule does not include this URI. Add rate limit. |
| `/api/v1/shipments` | Create shipment | POST | Admin | Shiprocket integration. | Add idempotency and manual retry UX. |
| `/api/v1/shipments` | List shipments | GET | Admin | Protected. | Add filters/pagination if not already in service. |
| `/api/v1/shipments/{id}` | Shipment detail | GET | Admin | Protected. | Good. |
| `/api/v1/shipments/order/{orderId}` | Shipment by order | GET | Admin | Protected. | Good. |
| `/api/v1/shipments/{id}/assign-awb` | Assign AWB | POST | Admin | Operational command. | Add audit log. |
| `/api/v1/shipments/{id}/pickup` | Schedule pickup | POST | Admin | Operational command. | Add failure retry UX. |
| `/api/v1/shipments/{id}/cancel` | Cancel shipment | POST | Admin | Requires reason. | Sync order status and audit reason. |
| `/api/v1/shipments/{id}/label` | Get label | GET | Admin | Returns label string/url. | Ensure signed/short-lived label URL if external. |
| `/api/v1/webhooks/shiprocket` | Shiprocket webhook | POST | Public | Processes status updates. | Verify webhook signature/secret. Current service read did not show verification. |
| `/api/v1/tracking/{orderNumber}` | Public tracking | GET | Public | Tracking response. | Add phone/pincode verification and rate limiting. |
| `/api/v1/delivery/estimate` | Estimate delivery | POST | Public | `DeliveryEstimateRequest`, rate limited as public form. | Replace heuristic with courier SLA where possible. |
| `/api/v1/reviews` | Create review | POST | Public | `ReviewRequest`. | Link to verified order/customer to prevent fake reviews. |
| `/api/v1/reviews` | List approved reviews | GET | Public | Pageable. | Good. |
| `/api/v1/reviews/latest` | Latest reviews | GET | Public | Public response. | Good. |
| `/api/v1/reviews/product/{productId}` | Product reviews | GET | Public | Pageable. | Good. |
| `/api/v1/reviews/admin` | Admin review list | GET | Admin/Staff | Protected. | Add moderation notes. |
| `/api/v1/reviews/{id}/approve` | Approve/unapprove review | PATCH | Admin/Staff | Protected. | Audit moderation. |
| `/api/v1/reviews/{id}` | Delete review | DELETE | Admin | Protected. | Soft-delete may be preferable. |
| `/api/v1/contacts` | Submit contact | POST | Public | `ContactRequest`, rate limited. | Add spam controls and email alert verification. |
| `/api/v1/contacts` | Admin contact list | GET | Admin/Staff | Pageable/filter. | Good. |
| `/api/v1/contacts/{id}/handled` | Mark contact handled | PATCH | Admin/Staff | Protected. | Add handled-by/notes. |
| `/api/v1/customers` | Admin list customers | GET | Admin/Staff | Protected. | Add pagination/privacy export controls. |
| `/api/v1/customers/{id}` | Admin customer detail | GET | Admin/Staff | Protected. | Mask sensitive fields where unnecessary. |
| `/api/v1/customer-addresses` | List own addresses | GET | Customer | Principal scoped. | Good. |
| `/api/v1/customer-addresses` | Save address | POST | Customer | `SaveAddressBookEntryRequest`. | Add max address limit. |
| `/api/v1/customer-addresses/{addressId}` | Update own address | PUT | Customer | Ownership should be service-enforced. | Good if ownership enforced. |
| `/api/v1/customer-addresses/{addressId}` | Delete own address | DELETE | Customer | Ownership should be service-enforced. | Prevent deleting address tied to active order? |
| `/api/v1/admin/dashboard/stats` | Admin dashboard stats | GET | Admin/Staff | Protected. | Add date filters and caching. |
| `/api/v1/admin/notifications/templates` | List templates | GET | Admin/Staff | Protected. | Good. |
| `/api/v1/admin/notifications/templates/{templateCode}` | Template detail | GET | Admin/Staff | Protected. | Good. |
| `/api/v1/admin/notifications/templates` | Create template | POST | Admin/Staff | `NotificationTemplateRequest`. | Consider ADMIN-only. |
| `/api/v1/admin/notifications/templates/{templateCode}` | Update template | PUT | Admin/Staff | `NotificationTemplateRequest`. | Version templates. |
| `/api/v1/admin/notifications/logs` | Notification logs | GET | Admin/Staff | Pageable/filter. | Add retry controls if not present. |
| `/api/v1/notifications/webhooks/msg91/whatsapp` | MSG91 WhatsApp webhook | POST | Public | Webhook DTO/service. | Verify source/signature if provider supports it. |
| `/actuator/health` | Health check | GET | Public | Spring actuator. | Add readiness/liveness split. |
| `/actuator/info` | Info | GET | Public | Spring actuator. | Avoid exposing sensitive build data. |
| `/swagger-ui.html`, `/v3/api-docs/**` | API docs | GET | Public | OpenAPI. | Consider protecting Swagger in production or restricting by IP. |

---

# UI / UX Audit

| Journey | Status | Notes |
|---|---|---|
| Homepage | Implemented | Brand/story/product CTAs exist. Needs production visual QA. |
| About page | Implemented | Strong story content and images. |
| Product listing | Implemented | Filters/components exist. Search depth requires verification. |
| Product detail | Implemented | Gallery/actions/schema exist. |
| Cart | Implemented | Persistent local cart with quantity controls. |
| Checkout | Implemented | OTP verification, address book, COD/UPI/Razorpay, delivery estimate. Complex flow needs E2E tests. |
| Contact | Implemented | Contact form and business CTA. |
| Navigation | Implemented | Header/footer/mobile nav/WhatsApp FAB. |
| Mobile UX | ⚠️ Requires Manual Verification | No screenshots/Lighthouse/Playwright results found. |
| Desktop UX | ⚠️ Requires Manual Verification | Needs manual QA. |
| Trust signals | Partial | Reviews, FAQ, brand story, WhatsApp. Missing legal pages, FSSAI/GST production data. |
| CTAs | Implemented | Browse/order/contact CTAs present. |
| Conversion optimization | Partial | Good checkout foundation; missing coupons, recommendations, abandoned cart, analytics. |

---

# E-Commerce Audit

| Feature | Status | Evidence / Notes |
|---|---|---|
| Shopping cart | Implemented | Zustand cart store and cart components. |
| Wishlist | ⚠️ Not Found | No wishlist feature found. |
| Coupons | ⚠️ Not Found | No coupon/discount engine found. |
| Orders | Implemented | Public creation, admin management, customer history. |
| Payments | Implemented | Razorpay create/verify/webhook and COD. Needs launch fixes. |
| Invoices | ⚠️ Not Found | No invoice/PDF/GST invoice generation found. |
| Inventory | Implemented | Inventory domain/service/controller and reservation. |
| Shipping | Implemented | Shiprocket integration and tracking exist. Needs credential/webhook verification. |
| Taxes | ⚠️ Not Found | No GST/tax calculation found. |
| Notifications | Implemented foundation | Email/SMS/WhatsApp queues/providers/templates. Requires real provider verification. |
| Reviews | Implemented | Public submit/list/admin approval. Not verified-order-only. |
| Ratings | Implemented | Review ratings. |
| Product search | Partial | Product list API/front filters exist; full-text search not verified. |
| Filters | Implemented | Product filters component. |
| Sorting | ⚠️ Cannot Verify | Needs route/API parameter review. |
| Related products | ⚠️ Not Found | No explicit related product module found. |
| Recommendations | ⚠️ Not Found | No recommendation engine found. |
| Order history | Implemented | `/account/orders`. |
| Guest checkout | Implemented for COD | COD public order creation exists; online payment requires customer session. |
| Stock management | Implemented | Inventory and low-stock endpoint. |
| Returns | ⚠️ Not Found | FAQ mentions perishable no-return policy, but no workflow/page. |
| Refunds | Partial | Razorpay refund webhook status handling exists; no admin/customer refund initiation workflow found. |
| Cancellation | Partial | Payment attempt cancel; shipment cancel. Order cancellation workflow not found. |
| Tracking | Implemented | Public tracking endpoint/page and shipment events. |

---

# Business Features Audit

| Feature | Status |
|---|---|
| Product management | Implemented backend; admin product UI not present in current route list, though repo memory says `/admin/products` was added previously. Current file search did not show `/admin/products/page.tsx`. ⚠️ Requires verification. |
| Admin dashboard | Implemented. |
| Customer dashboard/account | Implemented. |
| Analytics | ⚠️ Not Found. |
| Reporting | Partial admin stats only. |
| Discounts/offers/promotions | ⚠️ Not Found. |
| Newsletter | ⚠️ Not Found. |
| Referral system | ⚠️ Not Found. |
| Loyalty program | ⚠️ Not Found. |
| Gift cards | ⚠️ Not Found. |
| Bulk orders | Partial: page/contact CTA exists; no full workflow found. |
| Customer support | Contact form, WhatsApp FAB, FAQ. |
| FAQ | Implemented. |
| Contact form | Implemented. |
| Testimonials/reviews | Implemented review pages/cards. |

---

# Payment Audit

| Requirement | Status | Notes |
|---|---|---|
| Payment gateway integration | Implemented | Razorpay SDK and checkout script. |
| Webhook verification | Implemented | HMAC SHA-256 verification using webhook secret. |
| Payment failure handling | Implemented | Marks attempt failed and releases inventory. |
| Refund handling | Partial | Webhook marks payment refunded; no operational refund initiation workflow found. |
| Duplicate payment prevention | Implemented | Unique DB constraints and service checks on Razorpay order/payment IDs. |
| Order reconciliation | Partial | Webhook reconciliation exists but capture webhook before API verification only warns; no scheduled reconciliation job found. |
| Gateway credential validation | Implemented | Placeholder/blank check for key ID/secret when creating payment order. |
| Idempotency | Partial | `Idempotency-Key` allowed in CORS, but service-level idempotency usage not verified. |

Launch blockers:

- Fix frontend build and npm audit before payment can be safely launched.
- Verify real Razorpay production keys and webhook secret manually.
- Run live Razorpay test mode E2E: success, failure, dismiss, duplicate callback, webhook replay, refund.

---

# Shipping Audit

| Requirement | Status | Notes |
|---|---|---|
| Shipping integration | Implemented | Shiprocket API client/auth/service/controllers exist. |
| Shipping rates/serviceability | Implemented | `/api/v1/shipping/serviceability`. |
| Tracking | Implemented | Tracking endpoint/page and shipment events. |
| Estimated delivery | Implemented | Delivery estimate endpoint and checkout integration. |
| Packaging workflow | Partial | Packaging label brief and label preview exist, but no fulfillment workflow checklist found. |
| Delivery notifications | Implemented foundation | Shipping notification templates/events exist. |
| Return shipment | ⚠️ Not Found | No return shipment workflow found. |
| Webhook verification | ⚠️ Requires Manual Verification | `ShiprocketWebhookService` read did not show signature verification; controller must be reviewed/fixed if absent. |
| Credentials | ⚠️ Requires Manual Verification | Required Shiprocket email/password are validated, but local values not inspected. |

---

# Notification Audit

| Channel | Status | Notes |
|---|---|---|
| Email | Implemented foundation | Resend/SES/mock/log providers. Requires DNS/domain setup verification. |
| WhatsApp | Implemented foundation | WhatsApp Business API and MSG91 providers. Requires template approval and token verification. |
| SMS | Implemented foundation | MSG91/Twilio/mock/log providers. Requires provider credentials. |
| Push notifications | ⚠️ Not Found | No browser push/mobile push found. |
| Order updates | Implemented events | Order placed/packed/shipped/out for delivery/delivered/review/payment events exist. |
| Admin alerts | Partial | Notification framework exists; specific admin alert coverage requires verification. |
| Customer notifications | Implemented foundation | Event listeners/templates/queues. |
| Retry/backoff | Implemented | Config includes max attempts/backoff and queue processor. |
| Delivery observability | Partial | Logs exist, but no admin retry UI/alerting verified. |

---

# Legal Compliance Audit

| Requirement | Status | Evidence / Action |
|---|---|---|
| Privacy Policy | ⚠️ Not Found | Add `/privacy-policy`. |
| Terms & Conditions | ⚠️ Not Found | Add `/terms`. |
| Shipping Policy | ⚠️ Not Found | Add `/shipping-policy`. |
| Return Policy | ⚠️ Not Found | FAQ has short return note, not enough. Add page. |
| Refund Policy | ⚠️ Not Found | Add page matching Razorpay/refund workflow. |
| Cancellation Policy | ⚠️ Not Found | Add page and operational workflow. |
| Cookie Policy | ⚠️ Not Found | Add if analytics/cookies are used. |
| Disclaimer | ⚠️ Not Found | Add food/allergen/storage disclaimer. |
| Contact page | Implemented | `/contact`. |
| FSSAI information | Partial | Label preview has placeholder `FSSAI No.: __________`; production value missing. |
| GST information | ⚠️ Not Found | Add if registered/required. |
| Business information | Partial | Contact/brand docs exist; formal legal entity/address not verified. |
| Copyright | ⚠️ Cannot Verify | Footer not fully audited for legal text. |
| Trademark | ⚠️ Not Found | Add if applicable. |
| Food labeling | Partial | `PACKAGING_LABEL_BRIEF.md` and `/label-preview` exist; production values require manual verification. |

This is a major launch blocker for a real food e-commerce business.

---

# SEO Audit

| SEO Requirement | Status | Notes |
|---|---|---|
| Meta titles/descriptions | Implemented on many pages. |
| Canonical URLs | ⚠️ Not Found explicitly. |
| Structured data | Product and FAQ schema found. |
| Schema.org organization/local business | ⚠️ Not Found. |
| Open Graph | Present in root and product pages. |
| Twitter cards | Present in root metadata. |
| robots.txt | Implemented. |
| sitemap.xml | Implemented and includes dynamic products with fallback. |
| Image alt text | Present on reviewed image usage. |
| Internal linking | Present in nav/pages; full crawl not run. |
| URL structure | Good for public pages. |
| Page speed | ⚠️ Cannot Verify because build fails. |
| Core Web Vitals | ⚠️ Cannot Verify. |
| Index control | Private/admin/cart/checkout pages mostly noindex. |

Recommended additions before launch:

- Organization/LocalBusiness/FoodEstablishment schema.
- Product review aggregate rating schema only if review data is verified and compliant.
- Canonical URLs for product/listing pages.
- Real OG images.
- Legal pages linked in footer.

---

# Accessibility Audit

| WCAG Area | Status | Action |
|---|---|---|
| Semantic structure | Partial | Needs automated axe and manual screen reader checks. |
| Keyboard navigation | ⚠️ Requires Manual Verification | Test menus, cart, checkout, Razorpay return, admin tables. |
| Screen reader support | Partial | ARIA exists in some components, but not fully audited. |
| Contrast | ⚠️ Requires Manual Verification | Run Lighthouse/axe/Storybook checks. |
| ARIA labels | Partial | Cart/review examples found. |
| Focus management | ⚠️ Not Found | Add focus handling for errors, modals, route changes if needed. |
| Form accessibility | Partial | Checkout/contact/auth forms need label/error association verification. |
| Motion/reduced motion | ⚠️ Cannot Verify | Check animations respect `prefers-reduced-motion`. |

Do not claim WCAG compliance until automated and manual testing is completed.

---

# DevOps Audit

| Area | Status | Notes |
|---|---|---|
| Docker | Present | Frontend and backend Dockerfiles, root Compose. |
| Docker Compose | Present | MySQL/backend/frontend with health check for MySQL. |
| CI/CD | ⚠️ Not Found | No `.github` workflows found. |
| Secrets | Partial | Env files ignored; production secret manager not configured. |
| Environment variables | Partial | Many env references documented in `DEPLOYMENT.md` and configs; `.env.example` contents cannot be verified. |
| Monitoring | ⚠️ Not Found | Actuator health exists only. |
| Logging | Partial | Logback and levels exist; no centralized collection. |
| Health checks | Partial | MySQL Compose healthcheck and Spring actuator health. No app container healthchecks. |
| Backups | Partial | Manual mysqldump example in docs; no automation. |
| Deployment strategy | Partial | Docs recommend Vercel/VPS/managed DB. No IaC. |
| Rollback strategy | ⚠️ Not Found | Add deployment versioning and DB migration rollback plan. |
| Production config | Partial | `application-prod.yml` suppresses errors and sets provider defaults. Must verify all required envs. |

Critical DevOps work before launch:

- Add CI pipeline for frontend install/audit/type-check/build and backend compile/test.
- Add deployment pipeline or documented manual release checklist.
- Add uptime monitoring and alerting.
- Add database automated backups and restore test.
- Add production secret manager or platform env policy.

---

# Testing Audit

| Test Type | Status |
|---|---|
| Backend unit tests | Partial: 5 test files, mostly notification/webhook/provider plus context load. |
| Backend integration tests | Partial. Current full test run fails due Shiprocket config. |
| Frontend unit tests | ⚠️ Not Found. |
| Frontend E2E tests | ⚠️ Not Found. |
| API tests | Postman collection exists, but automated execution not verified. |
| Payment tests | ⚠️ Not Found as automated tests. |
| Shipping tests | ⚠️ Not Found as automated tests. |
| Security tests | npm audit run manually; no CI gate found. |
| Performance tests | ⚠️ Not Found. |
| Accessibility tests | ⚠️ Not Found. |
| Coverage reporting | ⚠️ Not Found. |

Required test coverage before launch:

- Checkout E2E: OTP, address, COD, Razorpay success/failure/cancel.
- Admin order status workflow.
- Inventory reservation/release concurrency.
- Payment webhook replay/duplicate/refund cases.
- Shiprocket webhook status mapping and signature validation.
- Public tracking privacy tests.
- Product listing/detail SEO smoke tests.
- Contact/review spam/rate limit tests.

---

# Dependency Audit

### Frontend

| Check | Result |
|---|---|
| `npm audit --omit=dev` | Fails with critical/high/moderate vulnerabilities. |
| Lockfile alignment | Fails: lockfile package root differs from `package.json`. |
| Build | Fails. |
| Type-check | Passes. |

### Backend

| Check | Result |
|---|---|
| Gradle compile | Passes. |
| Gradle tests | Fails due missing Shiprocket test properties. |
| Vulnerability scan | ⚠️ Not Run / Not Found. Add OWASP Dependency-Check, Snyk, Gradle dependency submission, or similar. |
| License scan | ⚠️ Not Found. |

### Unused Dependencies

⚠️ Cannot Verify without dependency usage tooling. Candidate review areas:

- Frontend dependency set is small and likely intentional.
- Backend dependency set is typical for the architecture.

---

# Documentation Audit

| Document | Status |
|---|---|
| Root README | Present. |
| Backend README | Present. |
| Frontend README | Present. |
| Architecture documentation | Present: `ARCHITECTURE.md`. |
| Deployment guide | Present: `DEPLOYMENT.md`. |
| Razorpay setup | Present: `RAZORPAY_SETUP.md`. |
| Notification architecture | Present: `backend/NOTIFICATION_ARCHITECTURE.md`. |
| Shiprocket docs | Present under `docs`. |
| Design system | Present: `frontend/DESIGN_SYSTEM.md`. |
| Brand/business docs | Present: `BRAND_BIBLE.md`, `BUSINESS_PLAN.md`, `INSTAGRAM_STRATEGY.md`, `PACKAGING_LABEL_BRIEF.md`. |
| API documentation | Partial: springdoc/OpenAPI dependency and Swagger route configured; static API docs not found. |
| Environment setup | Partial: env examples exist but contents could not be verified. |
| Contribution guide | ⚠️ Not Found. |
| Release notes/changelog | ⚠️ Not Found. |
| Runbook/incident response | ⚠️ Not Found. |

---

# Missing Features

### Critical

| Feature / Fix | Reason |
|---|---|
| Fix frontend production build | Site cannot be deployed reliably while `npm run build` fails. |
| Resolve npm production vulnerabilities | Critical/high advisories in frontend production dependencies. |
| Align `package-lock.json` with `package.json` | Current install/build uses stale vulnerable versions. |
| Fix backend test config | CI cannot pass while context load fails on Shiprocket properties. |
| Add legal policy pages | Required for real e-commerce/food business trust and compliance. |
| Verify production env/secrets | Payment/shipping/notifications depend on external credentials. |
| Add CI/CD checks | Prevents shipping broken builds/vulnerable dependencies. |

### High

| Feature / Fix | Reason |
|---|---|
| Add automated E2E checkout/payment tests | Highest revenue-risk workflow. |
| Add Shiprocket webhook signature verification if absent | Prevent forged shipment status changes. |
| Add order tracking secondary verification | Prevent public order-number enumeration/privacy leak. |
| Add monitoring/alerting/error tracking | Needed for real customers. |
| Add backup automation and restore runbook | Needed for order/customer data protection. |
| Add product image storage/upload pipeline | Needed for admin operations and scalable media management. |
| Add invoice/tax/GST handling if applicable | Needed for commerce compliance. |

### Medium

| Feature / Fix | Reason |
|---|---|
| Coupons/discount engine | Common e-commerce growth tool. |
| Wishlist | Common customer feature. |
| Returns/refunds/cancellation workflow | Operational clarity. |
| Analytics | Conversion and marketing measurement. |
| Newsletter | Retention. |
| Better admin reporting | Operations. |
| Redis/gateway rate limiting | Multi-instance readiness. |

### Low

| Feature / Fix | Reason |
|---|---|
| Loyalty/referrals/gift cards | Growth features after stable launch. |
| Advanced recommendations | Useful after catalog/order data grows. |
| Dark mode | Optional; not required for launch. |
| Full design QA polish | Important, but below build/security/compliance blockers. |

---

# Production Launch Checklist

### Build / Release

- [ ] Fix `frontend/src/app/admin/(protected)/shipments/[id]/page.tsx` dynamic params/build error.
- [ ] Regenerate `frontend/package-lock.json` so it matches `frontend/package.json`.
- [ ] Upgrade Next/sharp/postcss to patched versions.
- [ ] Run `npm audit --omit=dev` and confirm 0 critical/high production vulnerabilities.
- [ ] Run `npm run type-check`.
- [ ] Run `npm run build`.
- [ ] Run `.\gradlew.bat compileJava`.
- [ ] Fix Shiprocket test properties and run `.\gradlew.bat test` successfully.
- [ ] Add CI workflow for all checks above.
- [ ] Tag release and document rollback procedure.

### Security

- [ ] Generate strong `APP_JWT_SECRET` and `APP_CUSTOMER_JWT_SECRET`.
- [ ] Configure production `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`, `RAZORPAY_WEBHOOK_SECRET`.
- [ ] Configure production `SHIPROCKET_EMAIL`, `SHIPROCKET_PASSWORD`, `SHIPROCKET_WEBHOOK_SECRET`.
- [ ] Verify admin default password is changed before public deployment.
- [ ] Restrict Swagger in production or confirm public exposure is acceptable.
- [ ] Add distributed/API gateway rate limiting.
- [ ] Add brute-force controls for admin login.
- [ ] Add tracking endpoint secondary verification.
- [ ] Verify Shiprocket webhook signature validation.
- [ ] Configure HTTPS and HSTS end-to-end.
- [ ] Review CSP after Razorpay integration.
- [ ] Add dependency/security scan to CI.

### Payments

- [ ] Test Razorpay success flow.
- [ ] Test Razorpay failed payment.
- [ ] Test Razorpay modal dismiss/cancel flow.
- [ ] Test duplicate callback/payment replay.
- [ ] Test webhook signature failure.
- [ ] Test refund webhook.
- [ ] Add payment reconciliation runbook.
- [ ] Confirm settlement bank account and Razorpay live mode readiness.

### Shipping

- [ ] Test Shiprocket serviceability with real pickup pincode.
- [ ] Create shipment from an order.
- [ ] Assign AWB.
- [ ] Generate label.
- [ ] Schedule pickup.
- [ ] Receive webhook and update order status.
- [ ] Test cancellation.
- [ ] Confirm packaging dimensions/weight per SKU.
- [ ] Add return shipment process or documented policy.

### Notifications

- [ ] Verify WhatsApp Business/API or MSG91 credentials.
- [ ] Verify WhatsApp templates are approved.
- [ ] Verify SMS sender ID/templates.
- [ ] Verify email domain authentication: SPF, DKIM, DMARC.
- [ ] Test order placed/paid/shipped/delivered messages.
- [ ] Test provider failure/retry handling.
- [ ] Add alerting for notification queue failures.

### Legal / Compliance

- [ ] Add Privacy Policy page.
- [ ] Add Terms & Conditions page.
- [ ] Add Shipping Policy page.
- [ ] Add Return Policy page.
- [ ] Add Refund Policy page.
- [ ] Add Cancellation Policy page.
- [ ] Add Cookie Policy if analytics/cookies are used.
- [ ] Add food disclaimer/allergen/storage information.
- [ ] Add FSSAI license number.
- [ ] Add GST details if applicable.
- [ ] Add legal business name/address/contact.
- [ ] Link all legal pages in footer.
- [ ] Verify product labels meet food packaging requirements.

### SEO / Analytics

- [ ] Configure `NEXT_PUBLIC_SITE_URL` to production domain.
- [ ] Verify robots and sitemap in production.
- [ ] Add canonical URLs.
- [ ] Add Organization/LocalBusiness schema.
- [ ] Add real OG images.
- [ ] Add analytics with consent handling if required.
- [ ] Run Lighthouse on homepage/product/checkout/contact.
- [ ] Submit sitemap to Google Search Console.

### Operations

- [ ] Configure managed MySQL or hardened production MySQL.
- [ ] Enable automated backups.
- [ ] Perform restore drill.
- [ ] Add uptime monitoring.
- [ ] Add backend error monitoring/log aggregation.
- [ ] Add frontend error monitoring.
- [ ] Add alert contacts/escalation path.
- [ ] Document incident response runbook.
- [ ] Document order fulfillment runbook.

---

# Risk Assessment

| Risk | Type | Severity | Probability | Mitigation |
|---|---|---:|---:|---|
| Frontend cannot build | Technical | Critical | High | Fix dynamic route typing and dependency drift. |
| Critical vulnerable Next dependency | Security | Critical | High | Upgrade/regenerate lockfile and rerun audit. |
| Backend CI/test failure | Technical | High | High | Add Shiprocket test properties or conditional config. |
| Payment failure creates bad customer experience | Business/Technical | High | Medium | Complete payment E2E tests and reconciliation. |
| Public tracking leaks order details | Security/Privacy | High | Medium | Require phone/pincode verification. |
| Forged shipping webhook | Security/Operational | High | Medium | Verify Shiprocket signature/secret. |
| Missing legal policies | Legal | High | High | Add reviewed legal/compliance pages before launch. |
| No automated backups | Operational | High | Medium | Configure daily backups and restore tests. |
| Notification provider misconfiguration | Operational | High | Medium | Test real provider credentials/templates. |
| No monitoring/alerting | Operational | High | Medium | Add uptime, logs, error tracking. |
| Inventory race conditions | Technical/Business | Medium | Medium | Add concurrency tests and DB locking review. |
| Admin default password not changed | Security | Critical | Medium | Enforce env-provided admin password or first-login reset. |
| Image storage missing | Operational | Medium | High | Implement Cloudinary/S3 upload workflow. |
| No analytics | Business | Medium | Medium | Add privacy-compliant analytics. |

---

# Roadmap

### Week 1: Launch Blockers

- Fix frontend build error.
- Regenerate lockfile and resolve npm audit vulnerabilities.
- Fix backend test configuration and make tests pass.
- Add CI pipeline for frontend/backend checks.
- Add legal policy pages and footer links.
- Verify production env var matrix.

### Week 2: Payment, Shipping, Notifications Hardening

- Run Razorpay test-mode E2E matrix.
- Verify webhook secrets and replay behavior.
- Validate Shiprocket serviceability/shipment/AWB/label/pickup/webhook lifecycle.
- Confirm WhatsApp/SMS/email provider credentials and templates.
- Add payment/shipping integration tests for core paths.

### Week 3: Security and Operations

- Add distributed rate limiting or reverse proxy throttling.
- Add public tracking secondary verification.
- Protect/restrict Swagger in production if needed.
- Add monitoring, log aggregation, and frontend error tracking.
- Configure automated DB backups and run restore test.

### Week 4: UX, SEO, Accessibility, Compliance QA

- Run Lighthouse/axe/manual screen reader checks.
- Fix contrast/focus/form accessibility issues.
- Add canonical URLs and Organization/LocalBusiness schema.
- Verify sitemap/robots on staging.
- Run mobile checkout QA on real devices.

### Month 2: Commerce Completeness

- Add invoice/GST/tax workflow if applicable.
- Add admin product image upload/storage.
- Add refund/cancellation/return operational workflow.
- Add analytics dashboards and conversion tracking.
- Add coupons/promotions.

### Month 3: Growth and Scale

- Add wishlist.
- Add recommendations/related products.
- Add newsletter/referral/loyalty if business wants them.
- Move notification/rate limiting to more scalable infrastructure if traffic grows.
- Add performance/load testing and database query monitoring.

---

# Final Verdict

### Should this website go live?

**NO**

### Reasons

1. The frontend production build currently fails. A site that cannot build cleanly is not launch-ready.
2. The production frontend dependency audit reports critical/high vulnerabilities.
3. The lockfile is stale and installs different framework versions than `package.json` declares.
4. Backend tests fail due missing required Shiprocket test properties.
5. Required legal/compliance pages for a real food e-commerce business are missing.
6. CI/CD, monitoring, alerting, automated backups, and restore validation are missing or not verifiable.
7. Payment, shipping, and notification foundations are present but require production credential verification and end-to-end test evidence.
8. Several important e-commerce workflows are missing or partial: refunds, cancellations, returns, invoices, taxes/GST, coupons, wishlist, and product image storage.

### Launch Recommendation

Do not launch to real customers yet. The project is a strong functional foundation and is closer than a prototype, but it needs a focused hardening sprint before production. Once the critical build/security/test/legal issues are fixed and staging E2E payment/shipping/notification flows pass, the status can move to **YES WITH FIXES** or **READY WITH FIXES** depending on business tolerance for optional commerce features.
