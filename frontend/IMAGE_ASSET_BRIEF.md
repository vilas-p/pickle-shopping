# Realistic Image Replacement Brief

This project currently uses three SVG placeholder assets:

- `/images/story-grandmother.svg`
- `/images/about-mango-cutting.svg`
- `/images/hero-pickle-jar1.svg`

They are visually too abstract for the current brand direction. The existing product photography in `/public/images/products/*` and `/public/images/hero-pickle-jar.png` is warm, detailed, rustic, and close to photo-real. The replacements below should match that same look.

## Key findings

1. `story-grandmother.svg` is being reused for multiple different story beats.
   - Home page story strip: Amma preparing pickles in the village kitchen.
   - About page opening: wide establishing shot of the village kitchen at dawn.
   - About page scene four: Amma cutting mango on a low stool.
   - These should not be the same image.

2. `about-mango-cutting.svg` is also reused for unrelated scenes.
   - About page scene one alt text describes a village morning lane.
   - About page closing shot alt text describes a finished jar being sealed by hand at dusk.
   - These should be split into separate photos.

3. `hero-pickle-jar1.svg` is not aligned with the current photo style.
   - The home page already uses `/images/hero-pickle-jar.png`, which is much closer to the right direction.
   - The about page currently references `/images/hero-pickle-jar.svg`, which does not exist.

## Recommended replacements

Use the following realistic image set instead of trying to do one-for-one SVG swaps.

| Current use | Recommended file | Scene purpose | Notes |
| --- | --- | --- | --- |
| `/images/story-grandmother.svg` on home page story strip | `/images/story-grandmother.jpg` | Amma preparing pickle in a village kitchen | Close documentary-style portrait, not a poster layout |
| `/images/story-grandmother.svg` on about opening card | `/images/about/01-kitchen-dawn.jpg` | Wide establishing shot at dawn | Needs negative space for overlay text |
| `/images/story-grandmother.svg` on about scene four | `/images/about/02-amma-cutting-mango.jpg` | Amma hand-cutting raw mango | Tight action shot of hands, knife, stool, steel plate |
| `/images/about-mango-cutting.svg` on about scene one | `/images/about/03-village-lane-dawn.jpg` | Village wakes slowly | Mud lane, coconut trees, soft early light |
| `/images/about-mango-cutting.svg` on about closing shot | `/images/about/04-jar-sealed-dusk.jpg` | Jar sealed by lamp light | Evening warmth, hands sealing final jar |
| `/images/hero-pickle-jar1.svg` / missing `/images/hero-pickle-jar.svg` | `/images/about/05-kitchen-clay-jars.jpg` | Kitchen interior | Clay jars, brass vessels, sunlight through window |

## Visual direction to match existing assets

- Warm amber and terracotta lighting
- Rustic kitchen textures: clay jars, brass bowls, wood, stone, cotton cloth
- Documentary realism rather than ad poster composition
- Natural human expressions and aged hands
- Shallow depth of field where useful, but not extreme blur
- Food should look oily, textured, spicy, and believable
- Avoid visible typography or product labels inside story images unless the shot is explicitly product-led
- Prefer landscape for wide hero/establishing frames and portrait for scene cards

## Generation prompts

These prompts are written for realistic image generation or for briefing a photographer.

### 1. Home story strip

**Target file:** `/images/story-grandmother.jpg`

**Prompt:**

"Documentary-style photograph of an older South Indian woman in a rustic village kitchen preparing traditional pickle by hand, wearing a simple cotton sari, soft smile, clay jars and brass bowls around her, raw mango pieces and spice mixture on a wooden work surface, warm window light, earthy terracotta and turmeric tones, highly detailed hands and food texture, authentic lived-in kitchen, realistic photography, shallow depth of field, no text, no poster layout"

### 2. About opening hero

**Target file:** `/images/about/01-kitchen-dawn.jpg`

**Prompt:**

"Wide cinematic documentary photo of a small Indian village kitchen just before sunrise, low tiled roof, doorway open to a washed courtyard, faint oil lamp glow, soft blue-orange dawn light, clay jars and brass utensils visible inside, atmospheric, realistic, quiet rural mood, enough empty space for title text overlay, no people centered in frame, no text"

### 3. Amma cutting mango

**Target file:** `/images/about/02-amma-cutting-mango.jpg`

**Prompt:**

"Realistic close documentary photo of an older South Indian woman sitting on a low stool hand-cutting raw green mangoes for pickle with an old steel knife, wide steel plate beside her, pieces of tart mango, coarse salt, spice bowls, faded cotton sari, morning light from side window, detailed hands, humble kitchen floor setting, authentic textures, no text"

### 4. Village lane at dawn

**Target file:** `/images/about/03-village-lane-dawn.jpg`

**Prompt:**

"Realistic early morning village lane in South India, narrow mud road still damp from dew, coconut trees leaning over mud walls, white kolam patterns near doorways, tea stall in the distance, soft saffron sunrise light, quiet lived-in atmosphere, documentary photography, no people posing for camera, no text"

### 5. Jar sealed at dusk

**Target file:** `/images/about/04-jar-sealed-dusk.jpg`

**Prompt:**

"Realistic close photo of a finished jar of Indian pickle being sealed by hand at dusk, older couple's hands, warm oil lamp glow, glossy red pickle inside glass jar, cotton thread around neck, dark rustic kitchen background, intimate documentary framing, rich amber highlights, no text"

### 6. Kitchen interior with clay jars

**Target file:** `/images/about/05-kitchen-clay-jars.jpg`

**Prompt:**

"Realistic interior photograph of a traditional South Indian kitchen with clay pickle jars, brass vessels, stone grinder, wooden ladle, sunlight entering through a small window, terracotta and brown color palette, dust in the light beam, heritage atmosphere, beautifully arranged but believable, no people, no labels, no text"

## Existing local image references worth keeping

- `/public/images/hero-pickle-jar.png` works as a premium brand visual but is more like a promotional poster than a documentary still.
- `/public/images/products/mango-pickle-1.png` and `/public/images/products/mango-pickle-2.png` already match the texture, lighting, and realism level that the story images should aim for.

## Suggested implementation order

1. Replace the about page kitchen image first, because it currently points at a missing `/images/hero-pickle-jar.svg` asset.
2. Split the repeated `story-grandmother.svg` usages into separate files for opening hero and scene four.
3. Split the repeated `about-mango-cutting.svg` usages into separate village and closing-shot images.
4. Keep `hero-pickle-jar.png` for product-led sections and use documentary photos for editorial sections.