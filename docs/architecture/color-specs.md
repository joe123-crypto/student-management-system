# Color Specifications

## Overview

This application uses a warm academic palette built around deep green, burnt orange, and soft parchment neutrals. The system is intentionally light-first and uses color semantically rather than decoratively.

The source of truth for these colors is [`app/globals.css`](/Users/Joe/Documents/workspace/Student Platform ui/app/globals.css).

## Core Palette

| Token | Hex / Formula | Role | Notes |
| --- | --- | --- | --- |
| `--theme-primary` | `#254F22` | Primary brand color | Deep green used for primary actions, icons, active states, and headings. |
| `--theme-primary-strong` | `#1B3B19` | Primary hover / depth | Darker green used for hover and media framing. |
| `--theme-primary-soft` | `#A03A13` | Warm accent | Burnt orange-brown used for links, emphasis, focus rings, and warm highlights. |
| `--theme-secondary` | `#F5824A` | Secondary accent | Bright orange used sparingly in glow, chips, and scrollbar thumb. |
| `--theme-danger` | `#B74C2D` | Error / destructive | Used for destructive actions and danger messaging. |
| `--theme-danger-strong` | `#963820` | Error hover | Darker destructive hover state. |
| `--theme-surface` | `#EDE4C2` | Warm neutral surface | Base neutral for softened fills and selected states. |
| `--theme-surface-strong` | `#E5D8A9` | Strong surface | Slightly denser neutral for hover or raised surface moments. |
| `--theme-page-start` | `#FBF7EC` | Page gradient start | Top of the page background. |
| `--theme-page` | `#F7F1DD` | Page gradient end | Main page background. |
| `--theme-card` | `#FCF8EA` | Card background | Main container color. |
| `--theme-text` | `#254F22` | Primary text | Same hue family as primary brand for a cohesive reading tone. |
| `--theme-text-muted` | `#6F6247` | Secondary text | For metadata, labels, and supporting text. |
| `--theme-border` | `#DCCDA6` | Border neutral | Soft parchment border color. |
| `--theme-scrollbar-track` | `#F6EFD7` | Scrollbar track | Low-contrast utility surface. |
| `--theme-overlay` | `rgba(27, 59, 25, 0.22)` | Overlay / scrim | Used for modal/image overlays. |

## Derived Semantic Colors

These states are generated from the core palette instead of introducing unrelated colors.

| Token | Formula | Purpose |
| --- | --- | --- |
| `--theme-success-bg` | `color-mix(in srgb, var(--theme-primary) 14%, white)` | Success background |
| `--theme-success-text` | `var(--theme-primary)` | Success foreground |
| `--theme-warning-bg` | `color-mix(in srgb, var(--theme-secondary) 24%, white)` | Warning background |
| `--theme-warning-text` | `var(--theme-primary-soft)` | Warning foreground |
| `--theme-info-bg` | `color-mix(in srgb, var(--theme-primary-soft) 14%, white)` | Info background |
| `--theme-info-text` | `var(--theme-primary-soft)` | Info foreground |
| `--theme-danger-bg` | `color-mix(in srgb, var(--theme-danger) 14%, white)` | Danger background |
| `--theme-danger-text` | `var(--theme-danger)` | Danger foreground |

## Composition Ratio

The app follows a light-surface dominant composition. Based on the token system and repeated usage in layout and UI primitives, the practical palette ratio is:

- `70%` light neutrals: `--theme-page-start`, `--theme-page`, `--theme-card`, `--theme-surface`
- `20%` structural/supporting neutrals: `--theme-border`, `--theme-text-muted`, translucent white/parchment mixes
- `8%` primary brand color: `--theme-primary`, `--theme-primary-strong`
- `2%` accents and alerts: `--theme-primary-soft`, `--theme-secondary`, `--theme-danger`

This ratio keeps the interface calm and readable while making interactive and semantic states immediately noticeable.

## Application Rules

### 1. Color is token-driven

Use CSS variables from [`app/globals.css`](/Users/Joe/Documents/workspace/Student Platform ui/app/globals.css) instead of introducing ad hoc hex values in components. Most components already follow this pattern through utility classes such as `theme-card`, `theme-input`, `theme-success`, and `theme-danger`.

### 2. Neutrals carry the layout

- Page backgrounds use parchment gradients, not flat white.
- Cards and panels stay inside the warm neutral family.
- Borders remain soft and low-contrast.

This keeps the interface visually warm without competing with content.

### 3. Green is the main action color

Use `--theme-primary` and `--theme-primary-strong` for:

- Primary buttons
- Active navigation
- Brand marks and key icons
- Main chart strokes
- Strong headings and anchors

Reference: [`components/ui/Button.tsx`](/Users/Joe/Documents/workspace/Student Platform ui/components/ui/Button.tsx), [`components/layout/Layout.tsx`](/Users/Joe/Documents/workspace/Student Platform ui/components/layout/Layout.tsx), [`components/ui/AcademicStatusCard.tsx`](/Users/Joe/Documents/workspace/Student Platform ui/components/ui/AcademicStatusCard.tsx)

### 4. Warm orange is for emphasis, not for base structure

Use `--theme-primary-soft` and `--theme-secondary` for:

- Focus rings
- Links and subtle emphasis
- Accent bars and chips
- Warm glows, chart fills, and decorative highlights

Do not use these colors as dominant page backgrounds.

### 5. Destructive red-orange is isolated

Use `--theme-danger` and `--theme-danger-strong` only for:

- Destructive buttons
- Error text
- Danger badges and destructive hover states

They should not appear in normal success, navigation, or informational flows.

### 6. States are tinted, not saturated blocks

Status colors are softened with `color-mix(...)` so badges and alerts remain readable inside the warm UI. This rule is visible in the shared state classes and in [`components/ui/StatusBadge.tsx`](/Users/Joe/Documents/workspace/Student Platform ui/components/ui/StatusBadge.tsx).

### 7. Text contrast stays disciplined

- `--theme-text` is the default for headings and body copy.
- `--theme-text-muted` is for labels, metadata, and secondary explanations.
- White text is reserved for filled controls and dark backgrounds.

### 8. Transparency is used for depth

The system uses translucency, blur, and soft shadows instead of introducing more colors:

- Glass panels lighten `--theme-card`
- Headers and sidebars use translucent card tones
- Overlays reuse the dark green family at low opacity

### 9. Focus and hover stay inside the palette

- Primary hover darkens green to `--theme-primary-strong`
- Ghost/secondary hover surfaces lighten neutrals or warm accents
- Focus rings use a translucent `--theme-primary-soft`

This avoids blue default browser focus colors and keeps interaction feedback on-brand.

## Practical Usage Map

| UI area | Preferred colors |
| --- | --- |
| Page canvas | `--theme-page-start`, `--theme-page`, soft orange radial glow |
| Standard cards | `--theme-card`, mixed `--theme-border`, green-tinted shadow |
| Inputs | light surface mix, `--theme-border`, focus with `--theme-primary-soft` |
| Primary CTA | `--theme-primary` -> `--theme-primary-strong` on hover |
| Secondary CTA | translucent white/parchment with `--theme-text` |
| Ghost CTA | transparent base with `--theme-primary-soft` text |
| Destructive CTA | `--theme-danger` -> `--theme-danger-strong` on hover |
| Active nav | softened `--theme-surface` + `--theme-primary` text + `--theme-primary-soft` inset marker |
| Success state | lightened primary green |
| Warning state | lightened orange with warm text |
| Info state | lightened warm accent |
| Charts | `--theme-primary` strokes, `--theme-primary-soft` area fills |

## Do / Don't

### Do

- Reuse theme tokens and semantic helper classes first.
- Keep backgrounds mostly neutral and light.
- Let green communicate primary action and trusted status.
- Use orange accents in small, intentional doses.
- Use mixed and translucent surfaces for depth before adding new hues.

### Don't

- Add random Tailwind named colors that bypass the palette.
- Use pure white as the main surface everywhere.
- Turn secondary orange into the dominant layout color.
- Use danger tones for non-destructive actions.
- Create new status colors unless there is a real semantic need.

## Implementation Reference

Primary implementation points:

- [`app/globals.css`](/Users/Joe/Documents/workspace/Student Platform ui/app/globals.css)
- [`components/ui/Button.tsx`](/Users/Joe/Documents/workspace/Student Platform ui/components/ui/Button.tsx)
- [`components/ui/StatusBadge.tsx`](/Users/Joe/Documents/workspace/Student Platform ui/components/ui/StatusBadge.tsx)
- [`components/layout/Layout.tsx`](/Users/Joe/Documents/workspace/Student Platform ui/components/layout/Layout.tsx)
- [`components/ui/AcademicStatusCard.tsx`](/Users/Joe/Documents/workspace/Student Platform ui/components/ui/AcademicStatusCard.tsx)

## Maintenance Rule

If the palette changes, update the tokens in [`app/globals.css`](/Users/Joe/Documents/workspace/Student Platform ui/app/globals.css) first, then adjust any component-level exceptions. The documentation in this file should be updated immediately after any token change so design intent and implementation stay aligned.
