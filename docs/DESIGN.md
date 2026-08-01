# Design Guide

## Design Intent

The website should feel like a modern ecommerce product with the emotional warmth of a family kitchen. It should avoid looking generic, overly corporate, or aggressively promotional.

## Brand Personality

- Warm
- Handmade
- Trustworthy
- Rooted
- Calm
- Premium without feeling luxury-for-luxury's-sake

## Visual Theme

The visual system should combine earthy warmth, spice-led accents, and clean editorial spacing. The end result should feel traditional in story and modern in execution.

## Color Direction

Use the existing brand palette as the default source of truth.

| Role | Color | Hex | Use |
| --- | --- | --- | --- |
| Primary | Terracotta / Mango | `#D97706` | Primary CTA, emphasis, price |
| Secondary | Turmeric Gold | `#EAB308` | Highlights, ratings, badges |
| Accent | Pickle Green | `#4D7C0F` | Success, freshness, category cues |
| Background | Warm Cream | `#FAF7F2` | Main surfaces and page sections |
| Text | Earth Brown | `#3F2D20` | Headings and body text |

## Typography

- Display font: Playfair Display
- Body font: Inter
- Accent script: Caveat

### Typography Usage

- Use Playfair Display for hero headlines and premium section headers.
- Use Inter for body copy, labels, forms, and utility text.
- Use Caveat sparingly for emotional or handwritten-style accents.

## Layout Principles

- Mobile-first spacing and composition.
- Strong visual hierarchy.
- Generous whitespace around key content.
- Avoid cluttered cards and overpacked product sections.
- Use editorial rhythms instead of dashboard-style density on customer pages.

## UI Direction By Area

### Homepage

- Emotional first impression.
- Strong hero with brand story and clear CTA.
- Blend product commerce with memory and trust signals.

### Product Pages

- Keep product image, pricing, variants, and CTA immediately clear.
- Support trust with copy, reviews, and operational details.

### Checkout

- Reduce distraction.
- Keep fields readable and sequential.
- Make status, totals, and action buttons obvious.

### Admin

- More functional than emotional.
- Reuse brand identity lightly.
- Prioritize clarity, speed, and low-friction task completion.

## Components And Styling Rules

- Prefer existing Tailwind utility patterns and shared classes.
- Reuse warm cards, button variants, and section themes already in the project.
- Keep border radius restrained.
- Use shadows and rings with moderation.
- Use motion only to support hierarchy and delight, not distraction.

## Motion

- Use gentle entrance and hover motion.
- Respect reduced motion settings.
- Avoid heavy parallax, excessive bounce, or busy continuous animation.

## Imagery

- Prioritize real product photography over illustration.
- Show texture, ingredients, jars, and human warmth.
- Avoid stock imagery that weakens trust.

## Content Tone In UI

- Calm and confident.
- Human, not salesy.
- Memory-led, not hype-led.
- Clear and practical during checkout and support flows.

## Accessibility

- Maintain strong text contrast.
- Keep interactive targets large enough for mobile.
- Ensure keyboard-visible focus states.
- Do not communicate meaning by color alone.
- Support readable text sizes across breakpoints.

## Design Guardrails

- Do not switch to cold corporate color palettes.
- Do not use trendy gradients that overpower the food brand.
- Do not rely on generic ecommerce templates.
- Do not make the UI look louder than the product story.