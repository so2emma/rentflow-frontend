/**
 * components/ui/StatusBadge.tsx
 *
 * Pill badge implementing the design.md token-pair table.
 * Use this everywhere a status needs visual representation — never
 * reach for ad-hoc color classes in page components.
 *
 * Token mapping (from design.md):
 *   Leased / Active / Paid    → secondary-container / on-secondary-container
 *   Maintenance / Pending     → warning-container / on-warning-container
 *   Vacant / Overdue / Failed → error-container / on-error-container
 */

import React from 'react';

export type StatusVariant =
  | 'ACTIVE'
  | 'LEASED'
  | 'PAID'
  | 'PARTIALLY_PAID'
  | 'OCCUPIED'
  | 'VACANT'
  | 'OVERDUE'
  | 'FAILED'
  | 'MAINTENANCE'
  | 'PENDING'
  | 'PENDING_VIRTUAL_ACCOUNT'
  | 'VERIFIED'
  | 'EXPIRED'
  | string; // allow backend status strings we haven't enumerated

interface StatusBadgeProps {
  status: StatusVariant;
  /** Override the display label (defaults to formatted status string). */
  label?: string;
  className?: string;
}

function resolveVariant(status: StatusVariant): 'success' | 'warning' | 'error' {
  const s = status?.toUpperCase() ?? '';

  if (
    s === 'ACTIVE' ||
    s === 'LEASED' ||
    s === 'PAID' ||
    s === 'OCCUPIED' ||
    s === 'VERIFIED'
  ) {
    return 'success';
  }

  if (
    s === 'MAINTENANCE' ||
    s === 'PENDING' ||
    s === 'PENDING_VIRTUAL_ACCOUNT' ||
    s === 'PARTIALLY_PAID'
  ) {
    return 'warning';
  }

  // VACANT, OVERDUE, FAILED, EXPIRED, anything else → error
  return 'error';
}

const variantClasses: Record<'success' | 'warning' | 'error' | 'draft', { container: string, dot: string }> = {
  success: {
    container: 'bg-secondary-fixed/20 text-on-secondary-fixed-variant',
    dot: 'bg-secondary-fixed-dim',
  },
  warning: {
    container: 'bg-tertiary-fixed/20 text-on-tertiary-fixed-variant',
    dot: 'bg-tertiary-fixed-dim animate-pulse',
  },
  error: {
    container: 'bg-error-container text-on-error-container',
    dot: 'bg-error',
  },
  draft: {
    container: 'bg-surface-container-high text-on-surface-variant',
    dot: 'bg-outline',
  }
};

function formatLabel(status: StatusVariant): string {
  return status
    .replace(/_/g, ' ')
    .toUpperCase(); // Design uses uppercase for badges
}

export function StatusBadge({ status, label, className = '' }: StatusBadgeProps) {
  const variant = resolveVariant(status);
  const displayLabel = label ?? formatLabel(status);
  const classes = variantClasses[variant] || variantClasses.draft;

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full font-label-md text-[11px] uppercase tracking-wider ${classes.container} ${className}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${classes.dot}`}></span>
      {displayLabel}
    </span>
  );
}
