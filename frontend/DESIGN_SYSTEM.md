# Appa & Amma's Pickles Design System

A premium Tailwind CSS system for a traditional homemade Indian pickle brand: warm, rustic, family-owned, village-rooted, and polished for modern ecommerce.

## Brand Tokens

| Role | Token | Hex | Use |
| --- | --- | --- | --- |
| Primary | `brand-primary` | `#D97706` | Primary CTAs, price, active states, mango-led brand moments |
| Secondary | `brand-secondary` | `#EAB308` | Turmeric badges, stars, highlights, festive accents |
| Accent | `brand-accent` | `#4D7C0F` | Pickle green, freshness cues, success states, category markers |
| Background | `brand-cream` | `#FAF7F2` | Page background, quiet sections, warm neutral surfaces |
| Text | `brand-earth` | `#3F2D20` | Body text, headings, dark premium sections |

CSS variables live in `src/app/globals.css` and mirror the same palette:

```css
--color-primary: 217 119 6;
--color-secondary: 234 179 8;
--color-accent: 77 124 15;
--color-background: 250 247 242;
--color-text: 63 45 32;
```

## Typography

Fonts are configured in `tailwind.config.ts`:

- `font-display`: Playfair Display for elegant headings.
- `font-sans`: Inter for clean modern UX and readability.
- `font-script`: Caveat for family-made, handwritten warmth.

Reusable classes:

- `text-kicker`: script-style brand line.
- `text-eyebrow`: small uppercase label.
- `text-display-xl`: hero title scale.
- `text-display-lg`: section heading scale.
- `text-display-md`: card and panel heading scale.
- `text-body-luxe`: readable premium body copy.

## Buttons

- `btn-primary`: mango orange filled CTA for buying and ordering.
- `btn-secondary`: bordered premium CTA for secondary actions.
- `btn-accent`: pickle green CTA for freshness, confirmation, and WhatsApp-like positive flows.
- `btn-ghost`: quiet navigation or low-emphasis action.
- `btn-whatsapp`: dedicated WhatsApp action.

All button classes include keyboard-visible focus rings, disabled states, hover lift, active press, and accessible contrast.

## Cards

- `card-warm`: basic white warm card.
- `card-premium`: interactive elevated card for repeated content.
- `card-heritage`: dark brown premium card for quotes or heritage content.

Cards use restrained `0.5rem` brand radius, warm shadows, and subtle rings instead of heavy borders.

## Sections

- `section-cream`: main warm cream page band.
- `section-muted`: softer alternate content band.
- `section-spice`: mango-orange premium CTA band.
- `section-earth`: dark heritage band.
- `section-bordered`: light editorial band with top and bottom rules.

Utility backgrounds:

- `gradient-warm`
- `gradient-premium`
- `heritage-texture`
- `bg-warm-grain`
- `bg-spice-wash`
- `bg-heritage-dark`

## Product Cards

Product cards are split into composable classes:

- `product-card`
- `product-card-media`
- `product-card-image`
- `product-card-badge`
- `product-card-body`
- `product-card-category`
- `product-card-title`
- `product-card-description`
- `product-card-price`
- `product-card-link`

The design emphasizes premium food ecommerce: stable square media, turmeric bestseller badge, pickle-green category label, mango price, smooth image zoom, and elevated hover state.

## Motion

Configured animations:

- `animate-fade-up`: gentle content entrance.
- `animate-soft-float`: slow premium product/hero floating motion.
- `animate-spice-shimmer`: subtle spice highlight shimmer.

Utilities:

- `animate-enter`
- `hover-lift`
- `shimmer-spice`

Motion respects `prefers-reduced-motion` and collapses animations/transitions for users who request reduced motion.

## Accessibility

- Color roles are distinct: orange for action, gold for highlight, green for freshness/status, brown for text.
- Global `focus-visible` rings are enabled for links, buttons, inputs, selects, textareas, and summaries.
- Buttons include `disabled` states.
- Product image alt text remains content-specific.
- Text sizes avoid viewport-based scaling and keep predictable responsive steps.
- Selection color is brand-aware and readable.
- Reduced-motion users get near-instant transitions and no repeated animation loops.
