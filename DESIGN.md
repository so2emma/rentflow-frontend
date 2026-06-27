---
name: Executive Precision
colors:
  surface: '#f7f9fb'
  surface-dim: '#d8dadc'
  surface-bright: '#f7f9fb'
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
  outline-variant: '#c6c6cd'
  surface-tint: '#565e74'
  primary: '#000000'
  on-primary: '#ffffff'
  primary-container: '#131b2e'
  on-primary-container: '#7c839b'
  inverse-primary: '#bec6e0'
  secondary: '#006c49'
  on-secondary: '#ffffff'
  secondary-container: '#6cf8bb'
  on-secondary-container: '#00714d'
  tertiary: '#000000'
  on-tertiary: '#ffffff'
  tertiary-container: '#001a42'
  on-tertiary-container: '#3980f4'
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
  background: '#f7f9fb'
  on-background: '#191c1e'
  surface-variant: '#e0e3e5'
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
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
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
---

## Brand & Style
The design system is engineered for high-stakes property management and financial operations. It balances the authoritative weight of institutional finance with the agility of a modern SaaS platform. The aesthetic is rooted in **Modern Corporate Minimalism**, prioritizing clarity, data density, and functional elegance.

The emotional goal is to evoke **calculated confidence**. By utilizing generous whitespace (airiness) within a structured grid, the interface remains legible even when displaying complex financial ledgers or multi-unit property data. The style avoids unnecessary decoration, relying instead on precise alignment, subtle tonal shifts, and purposeful color application to guide the user's focus toward critical actions and financial insights.

## Colors
The palette is dominated by **Deep Slate (#0F172A)**, used for primary navigation and high-level headings to establish a foundation of stability. **Emerald Green (#10B981)** is reserved strictly for positive financial flows, successful status indicators, and growth metrics, creating a psychological link between the color and platform health.

The background uses **Light Gray (#F8FAFC)** as a canvas to reduce eye strain during long working sessions, while pure white (#FFFFFF) is used for "elevated" surfaces like cards and modals. High contrast is maintained across all states, ensuring that text meets or exceeds WCAG AA standards against any background. Blue (#3B82F6) serves as the primary utility color for links and information-gathering icons.

## Typography
**Inter** is the sole typeface for this design system, chosen for its exceptional legibility in data-heavy environments. To maintain a premium feel, headline levels utilize tighter letter spacing and semi-bold weights.

Numeric data—crucial for property management—should be rendered using `tabular-nums` OpenType features where possible to ensure that columns of figures align perfectly in tables and metric cards. The `label-md` style is used for table headers and secondary category descriptors, providing a clear hierarchy without occupying significant vertical space.

## Layout & Spacing
The layout employs a **12-column fluid grid** for the main content area, anchored by a **fixed sidebar** on the left. The sidebar remains visible on desktop to provide immediate access to core property and financial modules.

Spacing follows a strict 4px baseline shift, but primarily relies on an 8px stepping scale. "Airiness" is achieved through generous internal padding within cards (24px - 32px) and wide gutters (24px) between dashboard widgets. On mobile, the sidebar collapses into a bottom navigation bar or a hamburger menu, and horizontal margins shrink to 16px to maximize the utility of the smaller screen.

## Elevation & Depth
Depth is created through **Tonal Layering** and **Low-Contrast Outlines** rather than heavy shadows. 

1.  **Level 0 (Base):** Light Gray (#F8FAFC) background.
2.  **Level 1 (Cards):** White (#FFFFFF) surfaces with a 1px border of #E2E8F0. No shadow is used for static cards.
3.  **Level 2 (Interactive/Hover):** When a user interacts with a card, apply a subtle, highly diffused shadow: `0px 4px 12px rgba(15, 23, 42, 0.05)`.
4.  **Level 3 (Overlays):** Modals and dropdowns use a slightly deeper shadow and a semi-transparent backdrop blur (12px) to focus the user's attention.

This approach keeps the UI feeling flat and fast, avoiding the "heavy" look of traditional enterprise software.

## Shapes
This design system uses a **Soft (0.25rem / 4px)** corner radius as the standard for all primary UI elements. This subtle rounding softens the professional edges without appearing overly casual or "bubbly."

- **Buttons & Inputs:** 6px (Standard)
- **Cards & Modals:** 8px (Large)
- **Status Badges:** Fully rounded (Pill) to distinguish them from interactive buttons.
- **Charts:** Bar charts should have slight rounding (2px) on the top caps to maintain the "Soft" aesthetic.

## Components

### Sidebar Navigation
The sidebar uses the Primary Deep Slate color as its background. Active states are indicated by a subtle left-aligned accent border in Emerald Green and a high-contrast white text label. Icons are thin-stroke (2px) and monochrome.

### Metric Cards
Designed for "at-a-glance" reporting. They feature a `label-md` title, a `headline-lg` numeric value, and a small sparkline or percentage indicator. Positive trends use the Success Green; negative trends use Error Red.

### Data Tables
Tables are the backbone of the system. They use a "no-border" horizontal style, with rows separated by subtle 1px dividers (#F1F5F9). The header row uses a tinted background (#F8FAFC) and `label-md` typography.

### Status Badges
Used within tables to show property status (e.g., "Leased," "Maintenance"). These use a low-opacity background tint of the status color (e.g., 10% Emerald Green) with high-contrast text of the same hue for maximum accessibility.

### Progress Bars & Splits
For financial splits, use horizontal bars with a 4px height. Segmented bars use different colors from the Info and Success palettes to show the distribution of funds (e.g., Reserve vs. Distribution).

### Input Fields
Inputs are minimalist: a 1px border (#D1D5DB) that shifts to #3B82F6 (Info/Blue) on focus. Labels are positioned above the field using `body-md` bold for clarity. Error states must include both a red border and a small supporting icon for accessibility.
