/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Surface scale
        surface: '#f8fafc',
        'surface-dim': '#d8dadc',
        'surface-bright': '#f8fafc',
        'surface-container-lowest': '#ffffff',
        'surface-container-low': '#f2f4f6',
        'surface-container': '#eceef0',
        'surface-container-high': '#e6e8ea',
        'surface-container-highest': '#e0e3e5',
        'on-surface': '#191c1e',
        'on-surface-variant': '#45464d',
        'inverse-surface': '#2d3133',
        'inverse-on-surface': '#eff1f3',
        outline: '#76777d',
        'outline-variant': '#d1d5db',
        'surface-tint': '#0f172a',

        // Primary — Deep Slate
        primary: '#0f172a',
        'on-primary': '#ffffff',
        'primary-container': '#131b2e',
        'on-primary-container': '#c9ccd6',
        'inverse-primary': '#bec6e0',

        // Secondary — Emerald (positive financial flows)
        secondary: '#10b981',
        'on-secondary': '#ffffff',
        'secondary-container': '#d1fae5',
        'on-secondary-container': '#047857',

        // Tertiary — Blue (links, info, focus utility)
        tertiary: '#3b82f6',
        'on-tertiary': '#ffffff',
        'tertiary-container': '#dbeafe',
        'on-tertiary-container': '#1d4ed8',

        // Warning — Amber (pending, maintenance, intermediate states)
        warning: '#f59e0b',
        'on-warning': '#78350f',
        'warning-container': '#fef3c7',
        'on-warning-container': '#92400e',

        // Error — Red (vacant, overdue, failed)
        error: '#ba1a1a',
        'on-error': '#ffffff',
        'error-container': '#ffdad6',
        'on-error-container': '#93000a',

        // Fixed colors for complex overlays
        'primary-fixed': '#dae2fd',
        'primary-fixed-dim': '#bec6e0',
        'on-primary-fixed': '#131b2e',
        'on-primary-fixed-variant': '#3f465c',
        'secondary-fixed': '#6ffbbe',
        'secondary-fixed-dim': '#4edea3',
        'on-secondary-fixed': '#002113',
        'on-secondary-fixed-variant': '#005236',
        'tertiary-fixed': '#d8e2ff',
        'tertiary-fixed-dim': '#adc6ff',
        'on-tertiary-fixed': '#001a42',
        'on-tertiary-fixed-variant': '#004395',

        // Background
        background: '#f8fafc',
        'on-background': '#191c1e',
        'surface-variant': '#e0e3e5',

        // Focus ring
        'focus-ring': '#3b82f6',

        // Brand aliases (kept for existing code compatibility)
        'brand-deep-slate': '#0F172A',
        'brand-emerald-green': '#10B981',
        'brand-blue': '#3B82F6',
      },

      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },

      fontSize: {
        // Typography scale from design.md
        'display-lg': ['48px', { lineHeight: '56px', letterSpacing: '-0.02em', fontWeight: '700' }],
        'headline-lg': ['32px', { lineHeight: '40px', letterSpacing: '-0.01em', fontWeight: '600' }],
        'headline-md': ['24px', { lineHeight: '32px', fontWeight: '600' }],
        'title-lg': ['18px', { lineHeight: '28px', fontWeight: '600' }],
        'body-lg': ['16px', { lineHeight: '24px', fontWeight: '400' }],
        'body-md': ['14px', { lineHeight: '20px', fontWeight: '400' }],
        'label-md': ['12px', { lineHeight: '16px', letterSpacing: '0.05em', fontWeight: '600' }],
        'code-md': ['13px', { lineHeight: '20px', fontWeight: '400' }],
      },

      borderRadius: {
        // Shape scale from design.md
        xs: '0.25rem',    // 4px — badge tags
        sm: '0.375rem',   // 6px — buttons & inputs (DEFAULT)
        DEFAULT: '0.375rem',
        md: '0.5rem',     // 8px — cards & modals
        lg: '0.75rem',
        xl: '1rem',
        full: '9999px',   // pill — status badges
      },

      spacing: {
        unit: '4px',
        'container-max': '1440px',
        'sidebar-width': '260px',
        gutter: '24px',
        'margin-mobile': '16px',
        'margin-desktop': '32px',
        'stack-sm': '8px',
        'stack-md': '16px',
        'stack-lg': '24px',
      },

      maxWidth: {
        'container-max': '1440px',
      },

      width: {
        'sidebar-width': '260px',
      },

      // Motion tokens from design.md
      transitionDuration: {
        fast: '100ms',
        base: '150ms',
        slow: '250ms',
      },
      transitionTimingFunction: {
        standard: 'cubic-bezier(0.4, 0, 0.2, 1)',
        emphasized: 'cubic-bezier(0.2, 0, 0, 1)',
      },

      // Z-index scale from design.md
      zIndex: {
        base: '0',
        'sticky-header': '10',
        sidebar: '20',
        dropdown: '30',
        'overlay-backdrop': '40',
        modal: '50',
        toast: '60',
        tooltip: '70',
      },

      // Box shadow — Level 2 interactive card shadow from design.md
      boxShadow: {
        'card-hover': '0px 4px 12px rgba(15, 23, 42, 0.05)',
        'modal': '0px 8px 32px rgba(15, 23, 42, 0.12)',
        'sm': '0px 1px 3px rgba(15, 23, 42, 0.06)',
      },
    },
  },
  plugins: [],
}
