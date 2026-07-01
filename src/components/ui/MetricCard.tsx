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
  className?: string;
}

export function MetricCard({ label, value, sub, className = '' }: MetricCardProps) {
  return (
    <div
      className={`bg-surface-container-lowest border border-outline-variant rounded-md p-5
                  flex flex-col gap-1.5 shadow-sm transition-shadow duration-[150ms] ease-[cubic-bezier(0.4,0,0.2,1)]
                  hover:[box-shadow:0px_4px_12px_rgba(15,23,42,0.05)] ${className}`}
    >
      <div className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider">
        {label}
      </div>
      <div className="text-3xl font-bold text-brand-deep-slate font-mono tabular-nums">
        {value}
      </div>
      {sub && (
        <div className="text-xs text-on-surface-variant mt-0.5">{sub}</div>
      )}
    </div>
  );
}
