# Font Specs

This document defines the active typography system for the frontend UI.

## Source Of Truth

- Font loading: `app/layout.tsx`
- Typography tokens: `app/globals.css`
- Shared button sizing: `components/ui/Button.tsx`
- Shared status pill styling: `components/ui/StatusBadge.tsx`

## Typeface

- Primary UI typeface: `Plus Jakarta Sans`
- Fallback stack: `sans-serif`
- The app uses a single-typeface system to keep the interface calm, simple, and consistent.

## Principles

- Use one font family across the app.
- Reserve stronger weight for hierarchy, not for decoration.
- Prefer sentence case over forced all-caps for labels and pills.
- Keep values at the same structural level visually consistent unless there is a clear product reason to emphasize one.
- Avoid `font-black` or oversized headline scales in data-dense screens.

## Typography Tokens

| Token | Purpose | Size | Weight | Tracking | Line Height |
| --- | --- | --- | --- | --- | --- |
| `body` | Global default text | inherited | inherited | normal | inherited |
| `font-rounded` | Legacy compatibility alias for the main typeface | inherited | inherited | inherited | inherited |
| `type-brand` | Brand wordmark and compact brand headings | inherited | `600` | `-0.02em` | `1.1` |
| `type-page-title` | Main page titles | `clamp(1.875rem, 3vw, 2.375rem)` | `700` | `-0.03em` | `1.08` |
| `type-section-title` | Section headers and major card titles | `clamp(1.25rem, 1.9vw, 1.5rem)` | `700` | `-0.025em` | `1.18` |
| `type-card-title` | Compact card titles and emphasized values | `clamp(1rem, 1.2vw, 1.125rem)` | `600` | `-0.015em` | `1.25` |
| `type-metric` | Key numeric values | `clamp(1.625rem, 2.6vw, 2.125rem)` | `700` | `-0.03em` | `1` |
| `type-label` | Labels, chips, table headings, small metadata headings | `0.6875rem` | `600` | `0.03em` | `1.3` |
| `type-meta` | Secondary metadata | `0.75rem` | `500` | normal | `1.45` |
| `type-body` | Standard paragraph copy | `0.9375rem` | inherited | normal | `1.6` |
| `type-body-sm` | Compact body copy | `0.875rem` | inherited | normal | `1.55` |
| `type-body-lg` | Larger supporting copy | `1rem` | `500` | normal | `1.6` |

## Button Sizing

Button sizes are intentionally restrained to keep the interface from feeling oversized.

| Button Size | Classes |
| --- | --- |
| `sm` | `px-3.5 py-2 text-sm rounded-xl` |
| `md` | `px-5 py-2.5 text-sm rounded-xl` |
| `lg` | `px-6 py-3 text-sm rounded-2xl` |

## Status Pills

- Status pills render in title case instead of raw all-caps backend values.
- Default badge text sizing is `11px` with `font-semibold`.
- Use status pills for state, not as primary headings.

## Usage Rules

- Use `type-page-title` once at the top of a page or route-level panel.
- Use `type-section-title` for major content sections.
- Use `type-card-title` for smaller headings, emphasized summary values, and compact prominent text.
- Use `type-label` for form labels, table headers, filter labels, chip labels, and small callouts.
- Use `type-body` or `type-body-sm` for descriptive copy.
- Use `type-metric` only for real metrics or summary numbers.
- Do not introduce additional font families unless there is a deliberate design-system change.
- Do not use arbitrary giant text sizes or `font-black` for normal product UI.
- Do not force uppercase unless the specific component truly benefits from it.

## Recommended Patterns

```tsx
<h1 className="theme-heading type-page-title">Student Dashboard</h1>
<h2 className="theme-heading type-section-title">University and program</h2>
<p className="theme-text-muted type-label">Program</p>
<p className="theme-heading type-card-title">Computer Science</p>
<p className="theme-text-muted type-body">
  Supporting details should stay readable and visually quiet.
</p>
```

## Maintenance Notes

- If typography needs to change, update the token definitions in `app/globals.css` first.
- Prefer changing shared tokens over one-off component overrides.
- If a component feels too loud, reduce size, weight, or tracking before introducing a new type style.
