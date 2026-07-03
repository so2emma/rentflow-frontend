/**
 * components/ui/MetricCard.tsx
 *
 * "At-a-glance" metric card per design.md:
 *   - label-md title (uppercase, tracked)
 *   - headline-lg numeric value
 *   - Optional sub-line (delta indicator, badge, or helper text)
 *   - Level 1 → Level 2 hover shadow
 */

import React from 'react';

interface MetricCardProps {
  label: string;
  value: React.ReactNode;
  /** Optional secondary content below the value (badge, percentage, helper text). */
  sub?: React.ReactNode;
  /** Material Symbol Icon name for background decoration */
  icon?: string;
  className?: string;
}

export function MetricCard({ label, value, sub, icon, className = '' }: MetricCardProps) {
  return (
    <div className={`bg-surface rounded-lg border border-outline-variant p-6 relative overflow-hidden group ${className}`}>
      {icon && (
        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
          <span className="material-symbols-outlined text-[64px]" style={{ fontVariationSettings: "'FILL' 1" }}>
            {icon}
          </span>
        </div>
      )}
      <div className="text-on-surface-variant font-label-md text-label-md mb-2">{label}</div>
      <div className="font-display-lg text-headline-lg font-bold text-on-surface tracking-tight">{value}</div>
      {sub && (
        <div className="mt-4 text-on-surface-variant font-label-md text-label-md">
          {sub}
        </div>
      )}
    </div>
  );
}
