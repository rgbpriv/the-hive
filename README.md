# The Hive — Arcane Hive Corporate Website

> **Arcane Hive — Reliability · Optimization · Value**
> *We don't just build tech. We protect your profit.*

The official website for **Arcane Hive**, a Bangladeshi software, IoT, and AI development firm focused on operational efficiency for the businesses that power Bangladesh's economy.

From Bongshal's trade floors to Gulshan's tech hubs — we engineer digital infrastructure that transforms how Bangladesh does business.

## Live Preview

The site is fully static — no build step, no framework runtime.

```powershell
# from the repo root
python -m http.server 4173
# then open http://localhost:4173/site/
```

Any static file server works. The only external dependencies are Google Fonts (Noto Sans, Hind Siliguri) and Three.js, loaded via CDN.

## Project Structure

```
├── site/                        # the website
│   ├── index.html               # single-page site, all sections
│   ├── css/style.css            # design system + light/dark themes
│   ├── js/hive3d.js             # Three.js hero — instanced 3D honeycomb field
│   ├── js/main.js               # nav, theme toggle, scroll reveals, audit widget, form
│   └── assets/
│       ├── logo-mark.svg        # hexagon mark (V2), used for nav + favicon
│       └── logo-full.svg        # full logo lockup (V2)
├── AH Design Guideline.svg      # brand board (Inkscape) — source of truth for the identity
├── Logo2.svg                    # current logo (V2)
├── Arcane Hive Business Profile.md   # company profile — source of all site copy
└── website_structure.md         # legacy site spec (superseded; kept for reference)
```

## Design System

Derived directly from `AH Design Guideline.svg`:

| Token | Value |
|---|---|
| Orange (primary) | `#F97316` / `#E67113` |
| Navy (ink) | `#072239` / `#02253B` |
| Dark surfaces | `#1C1C2E` / `#2B2D42` / `#2E2E4A` |
| Neutrals | `#4B4B50` / `#888888` / `#A8A8AC` |
| Light base | `#F9F9F9` / `#FFFFFF` |

- **Typography:** Noto Sans (brand face) with Hind Siliguri for Bengali accents.
- **Theme:** light by default (mobile-first, outdoor-readability market preference) with a persistent dark mode toggle (`localStorage` key `ah-theme`).

## Features

- **3D hive hero** — ~480 instanced hexagonal prisms (Three.js) with a living wave animation, pointer ripples, and camera parallax. Recolors itself when the theme changes, pauses when off-screen, and respects `prefers-reduced-motion`.
- **Dark mode** — full semantic re-theme of every section; applied before first paint to avoid flashes.
- **Interactive margin-leak check** — a two-question flow (sector → concern, with Bengali sublabels) that maps the visitor's pain point to the matching Arcane Hive service.
- **Low-friction contact** — name + phone + sector only, validated client-side, handed off via `mailto:`.
- **Accessibility** — keyboard-navigable, visible focus states, ARIA labels on controls, 44px+ touch targets, reduced-motion support.

## Sections

Hero → Message to the Pillars → The Arcane Standard (Software / IoT / AI) → Proof of Reliability (Fanmire.com, Bongshal.com, Zabai.no) → The Digital AMC → Margin-Leak Check → Leadership → Partnership → Contact.

## Photography

Real industry imagery (per the brand guideline's "real industrial assets" direction), self-hosted under `site/assets/photos/`. All are free for commercial use under the [Unsplash License](https://unsplash.com/license) (no attribution required):

- `rmg-factory.jpg` — RMG production floor, Bangladesh (Ben Issac)
- `dhaka-skyline.jpg` — Aerial view of Dhaka (Andy Bridge)
- `software-dev.jpg` — Software development office, Dhaka, Bangladesh (Radowan Nakif Rehan)
- `warehouse.jpg` — Warehouse aisles (Phillip Flores)
- `ai-tech.jpg` — AI microchip on a circuit board (Omar Lopez-Rincon)
- `mechanic.jpg` — Motorcycle repair shop (Bernd Dittrich)
- `dhaka-night.jpg` — Dhaka at night (Radowan Nakif Rehan)

## Contact

- **Email:** contact@arcanehive.com
- **Phone:** +88 0173 7233 902

---

© 2026 Arcane Hive · Dhaka, Bangladesh
