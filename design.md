---
name: Executive Precision
colors:
  surface: '#f8fafc'
  surface-dim: '#d8dadc'
  surface-bright: '#f8fafc'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f2f4f6'
  surface-container: '#eceef0'
  surface-container-high: '#e6e8ea'
  surface-container-highest: '#e0e3e5'
  on-surface: '#191c1e'
  on-surface-variant: '#45464d'
  inverse-surface: '#2d3133'
  inverse-on-surface: '#eff1f3'
  outline: '#76777d'
  outline-variant: '#d1d5db'
  surface-tint: '#0f172a'

  primary: '#0f172a'
  on-primary: '#ffffff'
  primary-container: '#131b2e'
  on-primary-container: '#c9ccd6'
  inverse-primary: '#bec6e0'

  secondary: '#10b981'
  on-secondary: '#ffffff'
  secondary-container: '#d1fae5'
  on-secondary-container: '#047857'

  tertiary: '#3b82f6'
  on-tertiary: '#ffffff'
  tertiary-container: '#dbeafe'
  on-tertiary-container: '#1d4ed8'

  warning: '#f59e0b'
  on-warning: '#78350f'
  warning-container: '#fef3c7'
  on-warning-container: '#92400e'

  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'

  primary-fixed: '#dae2fd'
  primary-fixed-dim: '#bec6e0'
  on-primary-fixed: '#131b2e'
  on-primary-fixed-variant: '#3f465c'
  secondary-fixed: '#6ffbbe'
  secondary-fixed-dim: '#4edea3'
  on-secondary-fixed: '#002113'
  on-secondary-fixed-variant: '#005236'
  tertiary-fixed: '#d8e2ff'
  tertiary-fixed-dim: '#adc6ff'
  on-tertiary-fixed: '#001a42'
  on-tertiary-fixed-variant: '#004395'

  background: '#f8fafc'
  on-background: '#191c1e'
  surface-variant: '#e0e3e5'

  focus-ring: '#3b82f6'

typography:
  display-lg:
    fontFamily: Inter
    fontSize: 48px
    fontWeight: '700'
    lineHeight: 56px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Inter
    fontSize: 32px
    fontWeight: '600'
    lineHeight: 40px
    letterSpacing: -0.01em
  headline-lg-mobile:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  headline-md:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  title-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '600'
    lineHeight: 28px
  body-lg:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  label-md:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.05em
  code-md:
    fontFamily: JetBrains Mono
    fontSize: 13px
    fontWeight: '400'
    lineHeight: 20px

rounded:
  xs: 0.25rem
  sm: 0.375rem
  DEFAULT: 0.375rem
  md: 0.5rem
  lg: 0.75rem
  xl: 1rem
  full: 9999px

spacing:
  unit: 4px
  container-max: 1440px
  sidebar-width: 260px
  gutter: 24px
  margin-mobile: 16px
  margin-desktop: 32px
  stack-sm: 8px
  stack-md: 16px
  stack-lg: 24px

breakpoints:
  sm: 640px
  md: 768px
  lg: 1024px
  xl: 1280px
  2xl: 1536px

z-index:
  base: 0
  sticky-header: 10
  sidebar: 20
  dropdown: 30
  overlay-backdrop: 40
  modal: 50
  toast: 60
  tooltip: 70

motion:
  duration-fast: 100ms
  duration-base: 150ms
  duration-slow: 250ms
  easing-standard: cubic-bezier(0.4, 0, 0.2, 1)
  easing-emphasized: cubic-bezier(0.2, 0, 0, 1)
---

## Brand & Style
The design system is engineered for high-stakes property management and financial operations. It balances the authoritative weight of institutional finance with the agility of a modern SaaS platform. The aesthetic is rooted in **Modern Corporate Minimalism**, prioritizing clarity, data density, and functional elegance.

The emotional goal is to evoke **calculated confidence**. By utilizing generous whitespace (airiness) within a structured grid, the interface remains legible even when displaying complex financial ledgers or multi-unit property data. The style avoids unnecessary decoration, relying instead on precise alignment, subtle tonal shifts, and purposeful color application to guide the user's focus toward critical actions and financial insights.

## Colors
The palette is dominated by **Deep Slate (`primary` / `#0F172A`)**, used for primary navigation, high-level headings, and primary buttons to establish a foundation of stability. **Emerald Green (`secondary` / `#10B981`)** is reserved strictly for positive financial flows, successful status indicators, and growth metrics, creating a psychological link between the color and platform health. **Blue (`tertiary` / `#3B82F6`)** is the dedicated utility color for links, info icons, and focus states — kept visually distinct from `primary` so navigation and interactive affordances never compete for attention.

**Amber (`warning` / `#F59E0B`)** is a new addition to cover intermediate states that are neither success nor error — e.g. a "Maintenance" property status, a pending payout, or an overdue-but-not-failed disbursement. Previously the system only defined green and red status colors, which would have forced ad hoc color choices for these common in-between states.

The background uses **Light Gray (`background` / `#F8FAFC`)** as a canvas to reduce eye strain during long working sessions, while pure white (`surface-container-lowest` / `#FFFFFF`) is used for "elevated" surfaces like cards and modals.

**Contrast note:** `primary`, `secondary`, `tertiary`, and `warning` are all used at full saturation as button/badge backgrounds. At those saturations, white text meets AA for large or bold text (3:1) but not always AA for small body text (4.5:1) — `secondary` (#10B981) and `tertiary` (#3B82F6) with white text land around 2.5:1–3.7:1. Use `on-*` colors only on buttons/labels set at 14px bold or larger; for smaller inline text, use the corresponding `*-container` / `on-*-container` pair, which is built for AA-normal contrast (e.g. `on-secondary-container` #047857 on `secondary-container` #D1FAE5 exceeds 7:1).

## Typography
**Inter** is the sole typeface for this design system, chosen for its exceptional legibility in data-heavy environments. To maintain a premium feel, headline levels utilize tighter letter spacing and semi-bold weights.

Numeric data—crucial for property management—should be rendered using `tabular-nums` OpenType features where possible to ensure that columns of figures align perfectly in tables and metric cards. The `label-md` style is used for table headers and secondary category descriptors, providing a clear hierarchy without occupying significant vertical space.

## Layout & Spacing
The layout employs a **12-column fluid grid** for the main content area, anchored by a **fixed sidebar** on the left. The sidebar remains visible on desktop to provide immediate access to core property and financial modules.

Spacing follows a strict 4px baseline shift, but primarily relies on an 8px stepping scale. "Airiness" is achieved through generous internal padding within cards (24px - 32px) and wide gutters (24px) between dashboard widgets. On mobile, the sidebar collapses into a bottom navigation bar or a hamburger menu, and horizontal margins shrink to 16px to maximize the utility of the smaller screen.

**Breakpoints** follow standard Tailwind defaults (`sm` 640px / `md` 768px / `lg` 1024px / `xl` 1280px / `2xl` 1536px). The sidebar-to-bottom-nav collapse happens at `md`; the 12-column grid should degrade to a single column below `md` and 6–8 columns between `md` and `lg`.

## Elevation, Depth & Layering
Depth is created through **Tonal Layering** and **Low-Contrast Outlines** rather than heavy shadows.

1.  **Level 0 (Base):** Light Gray (`#F8FAFC`) background.
2.  **Level 1 (Cards):** White (`#FFFFFF`) surfaces with a 1px border of `#E2E8F0`. No shadow is used for static cards.
3.  **Level 2 (Interactive/Hover):** When a user interacts with a card, apply a subtle, highly diffused shadow: `0px 4px 12px rgba(15, 23, 42, 0.05)`.
4.  **Level 3 (Overlays):** Modals and dropdowns use a slightly deeper shadow and a semi-transparent backdrop blur (12px) to focus the user's attention.

This approach keeps the UI feeling flat and fast, avoiding the "heavy" look of traditional enterprise software.

**Stacking order** is governed by an explicit z-index scale to prevent conflicts between the sidebar, dropdowns, modals, and toasts, which otherwise tend to be implemented ad hoc by whoever builds each component last:

| Layer | z-index |
|---|---|
| Base content | 0 |
| Sticky header | 10 |
| Sidebar | 20 |
| Dropdown / popover | 30 |
| Overlay backdrop | 40 |
| Modal | 50 |
| Toast / snackbar | 60 |
| Tooltip | 70 |

## Motion
Interactions use short, purposeful transitions rather than decorative animation, consistent with the "calculated confidence" tone:

- **Fast (100ms):** micro-interactions — checkbox toggles, icon state changes.
- **Base (150ms):** default for hover/focus transitions, the Level 1 → Level 2 shadow shift on card hover.
- **Slow (250ms):** modal/drawer enter-exit, backdrop fade.
- **Easing:** `cubic-bezier(0.4, 0, 0.2, 1)` (standard) for most transitions; `cubic-bezier(0.2, 0, 0, 1)` (emphasized) for modals and drawers entering the viewport.

## Shapes
This design system uses a **layered radius scale anchored on a 4px unit**, applied differently depending on the element's role rather than a single flat "standard":

- **Badges (pre-pill) / tags:** 4px (`xs`) — smallest radius in the system.
- **Buttons & Inputs:** 6px (`sm` / `DEFAULT`) — the most common interactive radius.
- **Cards & Modals:** 8px (`md`) — elevated containers get slightly more rounding to read as distinct surfaces.
- **Status Badges:** Fully rounded (`full` / pill) to distinguish them from interactive buttons.
- **Charts:** Bar charts should have slight rounding (2px) on the top caps to maintain the soft aesthetic without needing a token of their own.

## Focus & Accessibility States
All interactive elements — buttons, inputs, links, table rows with actions, sidebar items — must have a visible `focus-visible` state: a 2px solid ring in `focus-ring` (`#3B82F6`) with a 2px offset from the element edge. Never remove the default focus outline without supplying this replacement. This is non-negotiable given the platform handles financial disbursement actions where keyboard users need unambiguous confirmation of what's selected before submitting.

## Components

### Sidebar Navigation
The sidebar uses the Primary Deep Slate color (`#0F172A`) as its background. Active states are indicated by a subtle left-aligned accent border in Emerald Green (`secondary`) and a high-contrast white text label. Icons are thin-stroke (2px) and monochrome.

### Metric Cards
Designed for "at-a-glance" reporting. They feature a `label-md` title, a `headline-lg` numeric value, and a small sparkline or percentage indicator. Positive trends use `secondary` (Emerald); negative trends use `error` (Red).

### Data Tables
Tables are the backbone of the system. They use a "no-border" horizontal style, with rows separated by subtle 1px dividers (`#F1F5F9`). The header row uses a tinted background (`#F8FAFC`) and `label-md` typography.

### Status Badges
Used within tables to show property status. Each status maps to a specific token pair so agents don't need to invent colors per instance:

| Status | Background | Text |
|---|---|---|
| Leased / Active / Paid | `secondary-container` | `on-secondary-container` |
| Maintenance / Pending | `warning-container` | `on-warning-container` |
| Vacant / Overdue / Failed | `error-container` | `on-error-container` |

These use a low-opacity tint of the status color with high-contrast text of the same hue, kept within the pill (`full`) radius, for maximum accessibility.

### Progress Bars & Splits
For financial splits, use horizontal bars with a 4px height. Segmented bars use `secondary` and `tertiary` to show the distribution of funds (e.g. Reserve vs. Distribution), with `warning` reserved for a flagged/held-back portion if one exists.

### Input Fields
Inputs are minimalist: a 1px border (`outline-variant` / `#D1D5DB`) that shifts to `tertiary` (`#3B82F6`) on focus, paired with the standard focus ring. Labels are positioned above the field using `body-md` bold for clarity. Error states must include both a red (`error`) border and a small supporting icon — never color alone — for accessibility.
