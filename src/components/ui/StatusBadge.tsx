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

const variantClasses: Record<'success' | 'warning' | 'error', string> = {
  success: 'bg-secondary-container text-on-secondary-container',
  warning: 'bg-warning-container text-on-warning-container',
  error: 'bg-error-container text-on-error-container',
};

function formatLabel(status: StatusVariant): string {
  return status
    .replace(/_/g, ' ')
    .toLowerCase()
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

export function StatusBadge({ status, label, className = '' }: StatusBadgeProps) {
  const variant = resolveVariant(status);
  const displayLabel = label ?? formatLabel(status);

  return (
    <span
      className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${variantClasses[variant]} ${className}`}
    >
      {displayLabel}
    </span>
  );
}
