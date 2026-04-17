# GooseNet Color & Motion Guidelines

This document defines the palette, surface tokens, motion vocabulary, and shared UI primitives used across the GooseNet app. These are consumed via `app/globals.css` tokens and `app/components/ui/*` primitives.

---

## 1. Brand Palette

### Primary

- **Brand blue**: `#3b82f6` (brand-500) / `#2563eb` (brand-600)
- **Brand purple**: `#a855f7` (purple-500) / `#9333ea` (purple-600)

Tailwind utilities: `bg-blue-600`, `text-blue-500`, `bg-purple-500`, etc. Gradient helper: `text-gradient-brand`.

### Data Accents

| Token   | Hex       | Meaning                                  | Tailwind stem |
| ------- | --------- | ---------------------------------------- | ------------- |
| Teal    | `#2dd4bf` | Positive data, improvements, "up" trends | `teal-*`      |
| Amber   | `#f59e0b` | Streaks, PRs, warnings                   | `amber-*`     |
| Rose    | `#f43f5e` | Errors, alerts, regressions              | `rose-*`      |
| Cyan    | `#06b6d4` | Informational                            | `cyan-*`      |

### Neutrals

Gray scale `gray-50 → gray-950`. Dark mode page background is `#0b0f17` (applied via `var(--background)`), cards typically use `dark:bg-gray-900/60` with glass blur.

---

## 2. Surface Tokens (CSS variables in `globals.css`)

| Variable              | Purpose                      |
| --------------------- | ---------------------------- |
| `--background`        | Page background              |
| `--foreground`        | Default text                 |
| `--surface-1`         | Default glass surface        |
| `--surface-2`         | Stronger glass surface       |
| `--surface-border`    | Subtle border on glass cards |
| `--ring-brand`        | Focus-visible ring color     |
| `--shadow-sm/md/lg`   | Elevation ramp               |
| `--shadow-glow-brand` | Brand glow for CTAs          |

All variables auto-flip between light and dark via `html.dark`.

---

## 3. Surfaces

- **Glass card**: `bg-white/70 dark:bg-gray-900/60 backdrop-blur-xl border border-white/60 dark:border-white/10` (or use `.glass-surface` utility)
- **Elevated card**: plain white/near-black with layered soft shadow
- **Gradient border card**: apply via `<Card variant="gradient-border">` — uses padding-box / border-box trick with a brand gradient.
- **Interactive cards** gain a 2px lift + shadow-md on hover.

---

## 4. Typography

- Font: `Geist Sans` (loaded in `layout.tsx`) via `--font-geist-sans`.
- Display headings: `.display-heading` utility → `font-semibold`/`bold`, `tracking-tight`, `letter-spacing: -0.02em`, `line-height: 1.05`.
- Stat numbers: `tabular-nums font-bold tracking-tight`.

---

## 5. Motion (framer-motion)

All shared variants live in `app/components/ui/MotionPresets.ts`.

| Preset                 | Use                                 |
| ---------------------- | ----------------------------------- |
| `fadeUp`               | Default scroll-in animation         |
| `fadeIn`               | Pure fade                           |
| `scaleIn`              | Modals, popovers                    |
| `slideInRight`         | Sheets, drawers                     |
| `slideInUp`            | Mobile sheets, toasts               |
| `stagger`              | Container for staggered children    |
| `staggerTight`         | Dense lists/grids                   |
| `hoverLift`/`tapScale` | Card/button micro-interactions      |
| `springSoft`/`Snappy`  | Shared spring transitions           |
| `inViewOnce`           | Default `viewport` for `whileInView`|

**Always** gate animation work on `useReducedMotion()` from framer-motion. The CSS already collapses durations at the `prefers-reduced-motion: reduce` media query for safety.

---

## 6. Utilities Added in `globals.css`

- `.bg-aurora` / `.bg-aurora-subtle` — animated brand radial backdrop.
- `.text-gradient-brand` — blue→purple→teal gradient text.
- `.text-gradient-warm` — amber→rose gradient text.
- `.shadow-glow-brand` — soft brand glow shadow for CTAs.
- `.ring-glow-brand` — brand focus/hover ring.
- `.glass-surface` — shorthand glass card.
- `.shimmer` — skeleton shimmer animation.
- `.animate-float`, `.animate-pulse-glow`, `.animate-gradient` — tasteful background animations.
- `.mask-fade-l|r|t|b` — edge fade masks.
- `.scrollbar-thin` — thin, branded scrollbar is applied globally. Hovering the track shows a blue→purple gradient thumb.
- `.display-heading` — display heading preset.

Focus-visible is styled globally with a 2px brand ring + offset.

---

## 7. Primitives (`app/components/ui/`)

All components are typed, accessible, dark-mode-aware, and import-friendly via:

```tsx
import { Button, Card, StatTile } from "../components/ui";
```

See `app/components/ui/index.ts` for the barrel. Key shape:

- `Button` — `primary | secondary | ghost | outline | danger | gradient`, sizes `sm | md | lg`, `loading`, `iconLeft/iconRight`, spring hover + tap.
- `Card` — `default | glass | gradient-border | elevated`, optional `interactive`.
- `Input`, `Textarea`, `Select` — labeled, helper/error support, brand focus ring.
- `Label`, `Badge`, `Divider`, `Spinner`, `Skeleton`.
- `StatTile` — animated count-up with framer-motion; accents `brand | teal | amber | rose | purple | neutral`, optional sparkline.
- `SectionHeading`, `PageHeader`, `PageContainer` — page structure.
- `Tabs` — animated underline or pill, uses `layoutId`.
- `Modal` — portal, focus trap lite, escape-to-close.
- `Toast` + `ToastProvider`/`useToast` — minimal toast system.
- `AppShell` — authenticated shell (top bar + nav + profile + aurora background + footer).

---

## 8. Migration Tips

- Prefer the new primitives over raw Tailwind class stacks where possible.
- Existing pages continue to work — these primitives are additive.
- When writing new pages, wrap with `<AppShell>` for authed views or `<PageContainer>` for marketing pages.
- Use data accents (teal/amber/rose) sparingly and intentionally.
- Never hard-code `#0b0f17`/`#111827` backgrounds — let `var(--background)` or Tailwind classes handle it.

---

## 9. Legacy Reference (still valid)

### Buttons

```tsx
// Primary
<Button variant="primary">Continue</Button>

// Secondary
<Button variant="secondary">Cancel</Button>

// Gradient CTA
<Button variant="gradient" size="lg">Start training</Button>
```

### Cards

```tsx
<Card variant="glass" interactive>
  <CardTitle>Weekly volume</CardTitle>
  <CardDescription>Compared to last week</CardDescription>
</Card>
```

### Stats

```tsx
<StatTile label="Distance" value={12.4} unit="km" trend="+8%" accent="teal" />
```
