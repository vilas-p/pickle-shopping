# Appa & Amma's Pickles - Smaller Implementation Prompts

Use these prompts one at a time. Do not run all phases in one request. Each prompt is scoped so the project can be audited, improved, tested, and reviewed incrementally without breaking existing behavior.

---

## Prompt 1: Complete Project Audit Only

Analyze the existing Appa & Amma's Pickles codebase without making any file changes.

Project context:
- Frontend: Next.js, TypeScript, Tailwind CSS
- Backend: Spring Boot, Java, MySQL
- Existing project is functional and must not be broken
- Brand identity: premium homemade South Indian pickles, village-made, family recipes, no preservatives

Audit the full project and produce a report covering:
1. Current frontend architecture
2. Current backend architecture
3. Current page structure and navigation
4. UI issues
5. UX issues
6. SEO issues
7. Performance issues
8. Mobile responsiveness issues
9. Conversion issues
10. Missing features
11. Technical risks
12. Recommended implementation order

Do not implement anything. Do not edit files. Do not create files.

Deliverable:
- A prioritized audit report
- A phase-by-phase roadmap
- Clear notes on what should be frontend-only, backend-required, or content-required

---

## Prompt 2: Navigation And Header Optimization

Using the audit report, improve only the site navigation and header.

Requirements:
- Preserve all existing routes and behavior
- Add or align navigation with this structure:
  - Home
  - Shop
  - Veg Pickles
  - Non Veg Pickles
  - Instant Mixes
  - Oils
  - Specials
  - About Us
  - Blog
  - Contact
  - Track Order
  - Cart
  - Account
  - Wishlist
- Desktop header should include logo, shop dropdown, about, blog, contact, search, wishlist, account, and cart
- Mobile header should include hamburger menu, search, and cart
- Header should be sticky
- Header should support smooth open/close interactions
- Use the existing design system and component patterns where possible
- Do not redesign unrelated pages

Before editing:
- Identify existing header, layout, route, and navigation files
- Explain the planned changes and affected files

After editing:
- Run the appropriate frontend checks
- Summarize changed files and behavior

---

## Prompt 3: Design System Foundation

Create or improve the reusable frontend design foundation without redesigning every page.

Brand style:
- Premium homemade South Indian pickle brand
- Traditional, warm, trustworthy, handmade, family-oriented

Design tokens:
- Primary: #B45A2A
- Secondary: #D97706
- Accent: #F4E1C1
- Background: #FFF8F0
- Text: #2C1810
- Success: #4D7C0F
- Border: #E7D6C4
- Headings: Playfair Display
- Body: Inter

Scope:
- Tailwind theme or global CSS tokens
- Button variants: primary, secondary, ghost
- Reusable section heading pattern
- Product card base styling if already present
- Review/story card base styling if already present
- Form field states if already present
- Accessibility focus states

Do not rebuild the full homepage yet. Keep the change foundational and low-risk.

After editing:
- Verify TypeScript/build/lint checks where available
- Summarize the updated design primitives

---

## Prompt 4: Homepage Structure And Storytelling

Improve only the homepage.

Goal:
Create a premium, conversion-focused homepage while preserving the Appa & Amma's Pickles brand identity.

Sections must appear in this order:
1. Hero section
2. Trust bar
3. Best sellers
4. Category showcase
5. Why choose us
6. Story section
7. Product preparation journey
8. Customer reviews
9. Instagram feed or graceful placeholder if no integration exists
10. FAQ
11. Newsletter

Hero requirements:
- Headline: Homemade Pickles Crafted by Appa & Amma
- Subheadline: Traditional recipes. Village ingredients. Authentic taste.
- Buttons: Shop Now and Our Story
- Emotional storytelling tone
- Mobile optimized

Important constraints:
- Do not copy the reference website directly
- Do not change backend APIs unless absolutely required
- Use existing product/review data fetching patterns
- If a required data source does not exist, create a graceful static or placeholder section and clearly mention it
- Keep the page accessible and responsive

After editing:
- Run frontend checks
- Provide a changed-file summary
- Note any follow-up backend/content needs

---

## Prompt 5: Product Listing And Collection Pages

Improve product listing and collection experiences only.

Target collections:
- Veg Pickles
- Non Veg Pickles
- Instant Mixes
- Specials
- Oils if supported by existing data

Requirements:
- Improve product grid layout
- Add or improve filters where supported:
  - Price
  - Availability
  - Best Seller
  - Spice Level
  - Weight
- Add or improve sorting where supported:
  - Best Selling
  - Featured
  - Newest
  - Price Low To High
  - Price High To Low
- Improve product cards:
  - Product image
  - Hover image if data exists
  - Add to cart
  - Wishlist if supported or local-only if explicitly acceptable
  - Ratings
  - Badges
  - Stock status

Constraints:
- Do not invent backend fields without checking existing DTOs/API responses
- If filters cannot be backed by existing data, document what backend support is missing
- Preserve existing product route structure and slugs

After editing:
- Run frontend checks
- Summarize supported vs deferred filters/features

---

## Prompt 6: Product Detail Page Optimization

Improve only product detail pages.

Requirements:
- Premium product gallery with thumbnails if multiple images exist
- Product title, price, ratings, reviews, and weight selector where data supports it
- CTA area with Add To Cart, Buy Now, Wishlist, and Share
- Trust badges:
  - No Preservatives
  - Homemade
  - Fresh Batch
  - Secure Checkout
- Product story section covering ingredients, recipe, and preparation method if data exists
- Nutrition information table if data exists, otherwise a clearly marked content gap
- FAQ accordion
- Reviews section with photo/video support only if existing data supports it
- Related products carousel
- Recently viewed section using local browser storage if no backend support exists

Constraints:
- Preserve existing backend integration
- Do not alter database schema in this phase
- Keep SEO metadata and product JSON-LD working

After editing:
- Run frontend checks
- Summarize implemented features and data gaps

---

## Prompt 7: Cart And Checkout Conversion Improvements

Improve only cart and checkout-related frontend behavior.

Requirements:
- Mini cart drawer if compatible with current cart architecture
- Quantity controls
- Remove item
- Subtotal
- Sticky checkout button on mobile
- Free shipping progress bar if a threshold is configured or can be added safely as a frontend constant
- Discount threshold messaging if supported
- Upsell/recommended products if product data is available
- Coupon field only if backend support exists; otherwise show as deferred

Constraints:
- Do not fake coupon validation
- Do not change order placement APIs unless required and approved
- Preserve existing checkout flow
- Keep WhatsApp/order behavior intact if present

After editing:
- Run frontend checks
- Test cart add, update, remove, and checkout navigation paths
- Summarize any backend gaps

---

## Prompt 8: Account, Wishlist, And Recently Viewed

Analyze and improve account-related user flows in a scoped way.

Requirements:
- Login
- Register if backend supports it
- Forgot password only if backend supports it; otherwise document missing API support
- Profile page
- Address management if backend supports it
- Order history if backend supports it
- Track orders
- Wishlist
- Recently viewed

Implementation rules:
- First inspect existing auth, account, order, cart, and API code
- Do not change authentication flow without explaining why
- If wishlist has no backend support, implement local-only wishlist only if it fits existing app patterns; otherwise document as a backend-required feature
- Recently viewed may use local storage if there is no backend dependency

After editing:
- Run frontend checks
- Verify login/account route behavior as much as possible
- Summarize implemented and deferred features

---

## Prompt 9: Blog And Content SEO

Add or improve blog/content pages in a way that matches the existing project architecture.

Requirements:
- Blog listing page
- Blog detail page
- Related posts
- Categories
- SEO metadata
- Blog schema where appropriate

Before editing:
- Determine whether blog data should be static files, hardcoded content, CMS-backed, or backend-backed
- Prefer the simplest production-ready option consistent with the existing project

Content themes:
- Homemade pickles
- Andhra pickles
- Village pickles
- Traditional pickle preparation
- Mango pickle
- Lemon pickle
- South Indian food culture

Constraints:
- Do not add a CMS unless explicitly requested
- Do not create low-quality placeholder blog spam
- Keep content authentic and brand-aligned

After editing:
- Run frontend checks
- Confirm routes and metadata generation

---

## Prompt 10: SEO And Structured Data Pass

Perform a focused SEO pass across existing public pages.

Requirements:
- Page titles and descriptions
- Open Graph metadata
- Twitter card metadata where appropriate
- Canonical URLs
- Product schema
- Breadcrumb schema
- FAQ schema
- Review schema if review data supports it
- Blog schema if blog exists
- Sitemap
- Robots.txt

Target keyword themes:
- Homemade Pickles
- Andhra Pickles
- Village Pickles
- Traditional Pickles
- Mango Pickle
- Lemon Pickle

Constraints:
- Do not keyword stuff
- Preserve natural brand voice
- Keep metadata accurate to page content
- Validate existing Next.js metadata patterns before changing them

After editing:
- Run frontend checks
- Summarize SEO coverage by route

---

## Prompt 11: Performance And Accessibility Pass

Perform a focused performance and accessibility pass.

Requirements:
- Next.js Image usage where appropriate
- Lazy loading for below-the-fold media
- Avoid unnecessary client components
- Use React Server Components where appropriate
- Dynamic imports for heavy client-only sections
- Basic bundle analysis if tooling exists
- Improve caching/prefetching only where safe
- Keyboard navigation
- Focus states
- Alt text
- Semantic headings
- Color contrast

Constraints:
- Do not add memoization everywhere blindly
- Do not optimize code before measuring or identifying a reason
- Do not change visual design unrelated to accessibility/performance

Target:
- Improve Lighthouse readiness, but do not claim a score unless tested

After editing:
- Run build/lint checks
- Report any measured improvements or remaining risks

---

## Prompt 12: Backend Support Gap Analysis

Analyze backend support for the features requested in the roadmap.

Do not implement anything unless explicitly asked after this analysis.

Check support for:
- Categories and collection filtering
- Spice level
- Weight variants
- Stock status
- Best seller/featured/newest flags
- Wishlist persistence
- Recently viewed persistence
- Coupons
- Free shipping thresholds
- Address management
- Order history
- Track order
- Forgot password
- Product reviews with photos/videos
- Blog/content system
- Nutrition information
- Product FAQs

Deliverable:
- Existing support matrix
- Missing API endpoints
- Missing DTO fields
- Missing database tables or columns
- Recommended backend implementation order
- Migration risk notes

---

## Prompt 13: Backend Feature Implementation - Only After Approval

Implement one approved backend feature from the backend gap analysis.

Feature to implement:
[INSERT ONE FEATURE ONLY]

Rules:
- Implement only this one feature
- Preserve existing database data
- Use Flyway migrations for schema changes
- Follow existing layered architecture
- Add DTOs, service logic, repository changes, validation, and tests as needed
- Maintain API versioning under /api/v1
- Do not alter unrelated endpoints

After editing:
- Run backend tests
- Summarize endpoints, migrations, and changed files

---

## Prompt 14: Final QA And Release Readiness

Perform final QA after all approved phases are complete.

Check:
- Home page
- Product listing
- Product detail
- Cart
- Checkout
- Account
- Track order
- Contact
- Blog if implemented
- Mobile responsiveness
- SEO metadata
- Structured data
- Sitemap and robots
- Build output
- TypeScript errors
- Backend tests
- Frontend tests or linting

Deliverable:
- Final QA report
- Known issues
- Launch blockers
- Non-blocking improvements
- Recommended production checklist

Do not implement new features during this QA pass unless they are small fixes for regressions introduced by the optimization work.
# Appa & Amma's Pickles — Smaller Implementation Prompts

Use these prompts one at a time. Start with Prompt 1 and do not move to the next prompt until the previous one is reviewed and accepted.

---

## Prompt 1: Complete Project Audit

Analyze the existing Appa & Amma's Pickles codebase.

Tech stack:
- Frontend: Next.js, TypeScript, Tailwind CSS
- Backend: Spring Boot
- Database: MySQL

Do not implement anything in this step.

Review the current frontend, backend integration, routing, components, UI structure, SEO setup, performance patterns, mobile responsiveness, and e-commerce flow.

Provide a report with:
1. Current architecture observations
2. UI issues
3. UX issues
4. SEO issues
5. Performance issues
6. Mobile responsiveness issues
7. Conversion issues
8. Missing e-commerce features
9. Risks or constraints in the current codebase
10. A prioritized roadmap split into small implementation phases

Rules:
- Do not change files.
- Do not replace existing functionality.
- Identify affected files where relevant.
- Be specific and practical.

---

## Prompt 2: Design System Foundation

Based on the audit, improve the frontend design foundation for Appa & Amma's Pickles.

Brand direction:
- Traditional homemade South Indian pickle brand
- Premium, trustworthy, emotional, family-oriented
- Village-made and preservative-free

Use this visual direction:
- Primary: #B45A2A
- Secondary: #D97706
- Accent: #F4E1C1
- Background: #FFF8F0
- Text: #2C1810
- Success: #4D7C0F
- Border: #E7D6C4
- Headings: Playfair Display
- Body: Inter

Implement only the reusable foundation needed for future phases:
1. Theme tokens or Tailwind configuration updates
2. Shared button variants
3. Shared section layout patterns
4. Shared card styling patterns
5. Typography hierarchy
6. Basic responsive spacing rules

Rules:
- Keep changes minimal and reusable.
- Do not redesign all pages yet.
- Preserve existing backend integration.
- Preserve existing routes.
- Update existing code instead of replacing everything.
- Verify the app still builds.

---

## Prompt 3: Header and Navigation Optimization

Optimize the site header and navigation.

Target desktop navigation:
- Logo
- Shop dropdown with Veg Pickles, Non Veg Pickles, Instant Mixes, Oils, Specials
- About
- Blog
- Contact
- Search
- Wishlist
- Account
- Cart

Target mobile navigation:
- Hamburger menu
- Search
- Cart
- Mobile drawer with navigation links

Behavior:
- Sticky header
- Shrinks subtly on scroll
- Smooth interactions
- Clear active and hover states
- Accessible keyboard navigation

Rules:
- Do not break existing routes.
- If a route does not exist yet, link only if the project already has an appropriate page or use a safe placeholder strategy agreed with the current codebase.
- Keep the header visually aligned with the design system.
- Test desktop and mobile layouts.

---

## Prompt 4: Homepage Optimization

Redesign and optimize the homepage only.

Create homepage sections in this order:
1. Hero section
2. Trust bar
3. Best sellers
4. Category showcase
5. Why choose us
6. Brand story
7. Product preparation journey
8. Customer reviews
9. Instagram or social proof section
10. FAQ
11. Newsletter

Hero content:
- Headline: Homemade Pickles Crafted by Appa & Amma
- Subheadline: Traditional recipes. Village ingredients. Authentic taste.
- CTAs: Shop Now, Our Story

Requirements:
- Premium homemade brand feel
- Strong product presentation
- Mobile-first layout
- Clear conversion paths
- Use existing product/review data if available
- Use graceful fallback content if data is missing

Rules:
- Work only on homepage-related files and shared components required by the homepage.
- Do not copy the reference website directly.
- Do not introduce backend changes.
- Preserve existing API calls.
- Verify desktop and mobile rendering.

---

## Prompt 5: Collection and Product Listing Optimization

Optimize product listing and collection pages.

Target collections:
- Veg Pickles
- Non Veg Pickles
- Instant Mixes
- Specials

Improve:
1. Category page structure
2. Product grid layout
3. Product cards
4. Filters
5. Sorting
6. Empty states
7. Loading states
8. Mobile filter experience

Filters to support where data exists:
- Price
- Availability
- Best Seller
- Spice Level
- Weight

Sorting options:
- Best Selling
- Featured
- Newest
- Price Low To High
- Price High To Low

Product card features:
- Optimized image
- Product name
- Price
- Ratings if available
- Badges if available
- Stock status if available
- Add to cart
- Wishlist if already supported or safely scoped locally

Rules:
- Use existing backend fields where possible.
- Do not invent backend fields without checking the API/data model first.
- If a requested filter is not supported by current data, document the gap and implement only safe UI/data behavior.
- Preserve SEO-friendly product links.

---

## Prompt 6: Product Detail Page Optimization

Optimize the product detail page.

Sections to include:
1. Product gallery
2. Product information
3. Weight or variant selector if supported by data
4. Add to cart / buy now CTAs
5. Wishlist/share actions where safely supported
6. Trust badges
7. Product story
8. Ingredients/preparation details where data exists
9. Nutrition table if data exists
10. FAQ
11. Reviews
12. Related products
13. Recently viewed if safely scoped

Requirements:
- Premium product presentation
- Strong mobile buying flow
- Sticky add-to-cart behavior on mobile if appropriate
- SEO metadata and Product JSON-LD where supported
- Accessible gallery and controls

Rules:
- Do not fake product data as if it came from the backend.
- Use fallback sections only when clearly labeled in code/data structure.
- Preserve existing product slug routing.
- Keep backend integration stable.

---

## Prompt 7: Cart and Checkout Conversion Optimization

Optimize the cart and checkout experience.

Cart features:
- Mini cart drawer if compatible with current architecture
- Quantity controls
- Remove item
- Subtotal
- Free shipping progress bar if business threshold is configured
- Discount threshold progress bar if configured
- Recommended products if data is available
- Coupon UI only if backend or frontend rules support it
- Sticky checkout button on mobile

Checkout requirements:
- Reduce unnecessary friction
- Improve form hierarchy
- Improve error messages
- Preserve existing order placement flow
- Preserve backend API contracts

Rules:
- Do not change database schema unless explicitly approved.
- Do not break existing order creation.
- If coupon support is not implemented in backend, document that as a required backend feature instead of pretending it works.
- Verify cart state persists according to existing behavior.

---

## Prompt 8: Account, Wishlist, Orders, and Recently Viewed

Audit the existing authentication/account flow first, then improve only what is safely supported.

Target account features:
- Login
- Register if supported
- Forgot password if supported
- Profile
- Address management
- Order history
- Track orders
- Wishlist
- Recently viewed

Implementation rules:
- First identify which features already exist in frontend and backend.
- Implement frontend improvements only for supported flows.
- For missing backend features, produce a backend requirements list instead of building fake production UI.
- Preserve existing authentication flow.
- Preserve existing JWT/session behavior.
- Keep user data secure.

Deliverables:
1. Supported feature map
2. Missing backend/API requirements
3. Implemented UI/UX improvements
4. Verification notes

---

## Prompt 9: Blog and Content SEO

Add or improve blog/content pages only after deciding the content source.

First determine whether blog content should be:
- Static markdown/content files
- Backend-driven content
- CMS-driven content
- Placeholder route only for future work

If static content is acceptable, implement:
1. Blog listing page
2. Blog detail page
3. Categories
4. Related posts
5. SEO metadata
6. Blog Schema.org structured data

Suggested content categories:
- Homemade Pickles
- Andhra Pickles
- Traditional Recipes
- Village Food Stories
- Pickle Storage Tips

Rules:
- Do not create thin SEO spam pages.
- Use helpful, brand-aligned content.
- Preserve existing sitemap and robots behavior.
- Add canonical URLs where appropriate.

---

## Prompt 10: Technical SEO and Structured Data

Improve technical SEO across the existing site.

Focus areas:
1. Page metadata
2. Open Graph tags
3. Twitter cards
4. Canonical URLs
5. Sitemap coverage
6. Robots rules
7. Product schema
8. Breadcrumb schema
9. FAQ schema
10. Review schema where valid data exists

Rules:
- Use real available data from the app/API.
- Do not add misleading structured data.
- Keep metadata unique per page type.
- Verify generated sitemap and robots output.
- Preserve existing routes.

---

## Prompt 11: Performance and Core Web Vitals

Audit and improve frontend performance.

Focus areas:
- Next.js Image usage
- Image sizes and priority loading
- Lazy loading
- Bundle size
- Dynamic imports where useful
- Server Components where appropriate
- Avoid unnecessary client components
- Caching and fetch strategy
- Prefetching
- Memoization only where it solves real rerender issues

Target:
- Improve Lighthouse and Core Web Vitals as much as possible within the current architecture.
- Treat Lighthouse 95+ as an aspiration, not a guarantee unless measured conditions support it.

Rules:
- Measure before and after when possible.
- Do not add complexity for tiny gains.
- Do not break SEO rendering.
- Keep product images optimized and visually sharp.

---

## Prompt 12: Mobile Responsiveness and Accessibility Pass

Perform a focused mobile and accessibility pass.

Test viewports:
- iPhone-sized mobile
- Android-sized mobile
- Tablet
- Desktop

Improve:
1. Tap target sizes
2. Form usability
3. Header and navigation behavior
4. Product grid responsiveness
5. Cart and checkout usability
6. Text hierarchy
7. Contrast
8. Keyboard navigation
9. Focus states
10. Screen reader labels where needed

Rules:
- Do not redesign unrelated sections.
- Fix layout overflow and overlapping text.
- Keep the experience fast on mobile.
- Verify important shopping flows.

---

## Prompt 13: Final Code Quality and Production Readiness Review

Review the completed changes for production readiness.

Check:
1. Component structure
2. Reusable hooks/utilities
3. Type safety
4. API boundaries
5. Error handling
6. Loading and empty states
7. Accessibility
8. SEO validity
9. Performance regressions
10. Backend integration stability

Rules:
- Do not perform broad unrelated refactors.
- Fix only issues introduced by or directly related to the optimization work.
- Keep the existing backend and database contracts stable.
- Run available build, lint, and test commands.

Deliverables:
1. Summary of improvements
2. Files changed
3. Verification results
4. Remaining recommended backlog
