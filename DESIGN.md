# Design System: Solagracia

> Single source of truth for Solagracia (S Radio sub-brand) public UI.
> Admin/CMS may diverge (Mantine). This file governs the **public frontend**.

**Design read:** Premium industrial-studio landing for a lifestyle / hospitality sub-brand — dark architectural grid UI over warm photographic atmosphere, not SaaS, not radio-player chrome.

**Dials:** Variance `7` · Motion `5` · Density `3`

**Reference moodboards (in chat assets):**
1. Full-bleed loft hero + right service stack + left letter nav (“Style & Design” type layout)
2. Black canvas + square media + letter sidebar + ghost icon buttons (“Savoir Faire” type layout)

---

## 1. Visual Theme & Atmosphere

Industrial-chic architecture studio: raw materials in photography (brick, timber beams, leather, pendant light) paired with a precise white-on-dark UI grid — like a blueprint laid over a loft.

- Mood: calm luxury, structural, editorial, high contrast
- UI is monochrome; **color and warmth come only from photography**
- Thin 1px white rules define zones — blueprint / wireframe language
- Generous black negative space; never packed marketing strips
- First viewport = one composition: brand + one headline + short line + CTA group + cover photo plane

---

## 2. Hero / Cover Image (mandatory)

| Token | Value |
|-------|--------|
| **Asset** | [`/public/cover-image.png`](public/cover-image.png) |
| **Role** | Default full-bleed hero / atmospheric plane for the public site |
| **Subject** | Studio broadcast portrait: headphones + mic, navy / golden split backdrop |
| **Treatment** | Edge-to-edge background (or dominant photo plane). Soft dark vignette / gradient so white type stays legible. No inset cards, no floating media frames in the hero. |
| **Do not** | Crop into a rounded card, collage, or side-panel thumbnail on the first viewport |

Inner pages may use solid charcoal canvas (reference 2) with a large square photo block — still prefer `cover-image.png` or matching studio photography.

---

## 3. Color Palette & Roles

Photography supplies warmth (brick red, wood amber). UI tokens stay cool monochrome.

| Name | Value | Role |
|------|--------|------|
| **Void Canvas** | `#0a0a0b` | Page / section background (prefer over pure `#000`) |
| **Ink Overlay** | `rgba(10, 10, 11, 0.55–0.72)` | Right rail / panel washes over hero photo |
| **Glass Wash** | `rgba(10, 10, 11, 0.35)` | Lighter panel segments |
| **Line White** | `rgba(255, 255, 255, 0.92)` | 1px borders, grid rules, ghost button strokes |
| **Type White** | `#f4f4f6` | Primary headings & body on dark |
| **Type Mute** | `rgba(244, 244, 246, 0.55)` | Secondary copy, meta, giant watermark initials |
| **Active Invert** | fill `#f4f4f6` / text `#0a0a0b` | Active letter-nav cell only |
| **Accent Ember** | `#c45c26` (optional, ≤1 accent) | Rare: focus ring or single active mark — never purple/neon. Prefer photography as the “accent.” |

**CSS variables (align with `globals.css` when implementing):**

```css
--bg-void: #0a0a0b;
--text-main: #f4f4f6;
--text-dim: rgba(244, 244, 246, 0.55);
--line: rgba(255, 255, 255, 0.92);
--overlay: rgba(10, 10, 11, 0.62);
--accent: #c45c26; /* optional */
```

---

## 4. Typography Rules

| Role | Face | Specs |
|------|------|--------|
| **Display** | Montserrat (self-hosted) | Large, weight 700–800, tight tracking, period-ending statements OK (“Solagracia.”) |
| **UI / Nav letters** | Same family, weight 700 | Single uppercase letters in square cells (H / A / W / C pattern) |
| **Body** | Montserrat 400–500 | Relaxed leading, ~45–65ch max in text columns |
| **Meta / vertical labels** | Same family, 10–12px, uppercase tracking | Rotated −90° labels beside active nav (“About”) |
| **Watermark initials** | Same family, huge, muted | Two-letter codes behind panel rows (e.g. AR / HD) — decorative only |

**Self-hosted files** (no Google Fonts runtime fetch):

| Weight | File |
|--------|------|
| 400 | `src/fonts/montserrat/montserrat-latin-400-normal.woff2` |
| 500 | `src/fonts/montserrat/montserrat-latin-500-normal.woff2` |
| 600 | `src/fonts/montserrat/montserrat-latin-600-normal.woff2` |
| 700 | `src/fonts/montserrat/montserrat-latin-700-normal.woff2` |
| 800 | `src/fonts/montserrat/montserrat-latin-800-normal.woff2` |

Loaded via `next/font/local` in `src/app/layout.tsx` → CSS var `--font-montserrat`.

**Banned:** Inter, Roboto, Arial as primary; generic serif display; gradient/fill text on headlines; emoji; `next/font/google` for brand type.

---

## 5. Layout DNA

### 5.1 Desktop frame (from references)

```
┌────┬─────────────────────────────────────┬──┐
│Logo│         HERO PHOTO PLANE            │··│ social rail (optional)
│ H  │  brand / headline / CTAs            │  │
│ A  │                    ┌──────────────┐ │  │
│ W  │                    │ panel stack  │ │  │
│ C  │                    └──────────────┘ │▾ │ scroll / page chevrons
└────┴─────────────────────────────────────┴──┘
```

1. **White box frame (mandatory)** — one continuous 1px rectangle (`--frame-line`) on all four sides of the hero shell. Built as a 3-column CSS grid: left rail · open stage · right panel. Far-right tagline gutter sits *outside* the frame. Corner crosshairs (`+`) mark key intersections.
2. **Left letter rail** — first grid column inside the frame: logo cell + square letter nav. Active = inverted fill. Optional vertical word label beside active cell.
3. **Hero plane** — `cover-image.png` full-bleed *behind* the frame; stage (center column) holds brand + short support + ghost CTA group, bottom-left.
4. **Right panel stack** — third grid column, **full frame height**, horizontal 1px dividers only inside this column; each row = watermark initials + title + one-line blurb.
5. **Top-right utilities** — Reservasi + hamburger sit on the top edge of the stage (inside the frame).
6. **Far-right micro rail** — outside the frame: vertical tagline + social icons.
7. **Bottom-right chevrons** — docked to the panel column corner.

### 5.2 Inner / content slides (reference 2)

- Void canvas background
- Large **square** photo left (or offset)
- Headline + body in an **L-bracket** (1px white poly-border on left + bottom or left + top)
- Row of ghost square buttons (icon / play / text `LABEL >>`)

### 5.3 Grid rules

- Visible hairline grid where it clarifies zones; do not clutter every cell
- Prefer CSS Grid for the shell; `min-h-[100dvh]` for full viewports
- Max content width ~1400px inside the frame if needed; shell can go full bleed
- **One job per section** — one headline, one short support line

### 5.4 Mobile (&lt; 768px)

- Collapse letter rail into top bar or drawer (keep square letter / hamburger language)
- Hero stays full-bleed cover; stack headline → CTAs → panel rows as accordion or vertical list
- No horizontal page scroll; tap targets ≥ 44px
- Scale display type with `clamp()`

---

## 6. Component Stylings

### Ghost buttons (primary control language)

- Transparent fill, `1px` `Line White` stroke, square or slightly rectangular
- Icon-only = equal square cells
- Text CTAs: uppercase / title case + `>>` chevrons when it fits the DNA
- Hover: soft fill `rgba(255,255,255,0.08)` or invert on strong CTAs
- Active: `translateY(1px)` — no glow, no shadow blobs

### Letter nav cells

- Equal squares, 1px border, bold single letter
- Active: inverted (white fill / void text)
- Inactive: transparent + white letter
- Optional tiny vertical label for current section only

### Panel rows (right stack)

- Shared outer 1px border; internal horizontal rules
- Giant muted two-letter watermark behind content
- Title bold; description one short line in Type Mute
- Entire row may be a link; hover lifts opacity of watermark or border

### L-bracket text block

- Thin white L (or corner) framing copy — architectural, not a card
- No drop shadow, no rounded “card” chrome

### Cards

- **Default: no cards** on the public site
- Allowed only for true interactive containers (forms, booking) — then prefer border + void fill over shadow

### Imagery

- Hero: cover asset edge-to-edge
- Supporting: square crops, sharp corners (0–2px radius max)
- No floating badges, stickers, or promo chips on photos

---

## 7. Motion & Interaction

- Restrained, architectural — not playful bounce
- Page / section enter: opacity + slight `translateY` (spring-ish ease, ~400–600ms)
- Panel rows / letter nav: short border/fill transitions (~150–200ms)
- Section paging via chevrons: scrub or snap between full-viewport sections
- Animate `transform` / `opacity` only
- Avoid perpetual bouncing “scroll” arrows; chevrons are functional controls

---

## 8. Brand & Content Guardrails

- Brand name **Solagracia** is a hero-level signal — not only in the nav logo
- Sub-brand of S Radio: quiet parent nod OK; do not paste radio player UI into the public shell
- Copy: short, confident, specific — no “Elevate / Seamless / Unleash / Next-Gen”
- Language: Indonesian-first (`lang="id"`) unless a section is explicitly bilingual

---

## 9. Anti-Patterns (Banned)

- Purple / indigo gradients, neon glows, glassmorphism blobs
- Warm cream + terracotta “AI default” editorial kitsch
- Broadsheet / dense newspaper columns
- Inter / Roboto / system UI as the brand face
- Three equal feature cards in a row
- Inset rounded hero cards or collage heroes
- Floating badges / chips / stickers on the cover
- Emoji in UI or marketing copy
- Fake stats strips in the first viewport
- Pure marketing “Scroll to explore” filler
- Admin Mantine look leaking into public pages

---

## 10. Implementation Checklist (for agents)

When building or changing public UI:

- [ ] Hero uses `/cover-image.png` as full-bleed (or equivalent studio photo)
- [ ] Left letter rail + 1px white structural language present (or mobile equivalent)
- [ ] Ghost outline buttons; no filled purple CTAs
- [ ] Montserrat (or agreed geometric sans) for display + UI
- [ ] Right panel stack or L-bracket content blocks — not card grids
- [ ] Colors from §3; accent optional and rare
- [ ] First viewport stays within hero budget (brand, one headline, one line, CTAs, cover)
- [ ] No banned patterns from §9

---

## 11. Asset Map

| Asset | Path | Use |
|-------|------|-----|
| Cover / hero | `public/cover-image.png` | Default atmospheric plane |
| Style refs | Chat attachments (Style & Design loft UI + Savoir Faire black UI) | Layout & component DNA only — do not copy their brand names/copy |

Update this file when the visual system changes; do not invent a second competing aesthetic in code.
