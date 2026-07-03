/**
 * components/ui/Button.tsx
 *
 * Design-system button with:
 *   - primary   — Deep Slate background (main CTA)
 *   - secondary — Emerald (positive/confirm actions)
 *   - ghost     — transparent with border (cancel/secondary)
 *   - danger    — Error red (destructive actions)
 *
 * All variants have the standard 2px focus ring and show loading state.
 * Min height 44px to meet touch target accessibility requirements.
 */

import React from 'react';

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  /** Icon to render before the label (should be 16×16 or 20×20 SVG). */
  leadingIcon?: React.ReactNode;
}

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    'bg-brand-deep-slate text-on-primary hover:bg-slate-800 disabled:bg-surface-dim disabled:text-on-surface-variant',
  secondary:
    'bg-secondary text-on-secondary hover:bg-emerald-600 disabled:bg-surface-dim disabled:text-on-surface-variant',
  ghost:
    'bg-transparent border border-outline-variant text-on-surface hover:bg-surface-container disabled:opacity-50',
  danger:
    'bg-error text-on-error hover:bg-red-700 disabled:bg-surface-dim disabled:text-on-surface-variant',
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: 'min-h-[36px] px-3 text-xs',
  md: 'min-h-[44px] px-4 text-sm',
  lg: 'min-h-[52px] px-6 text-base',
};

export function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  leadingIcon,
  children,
  disabled,
  className = '',
  ...rest
}: ButtonProps) {
  return (
    <button
      disabled={disabled || loading}
      className={`
        inline-flex items-center justify-center gap-2 font-semibold rounded cursor-pointer
        transition-colors duration-[150ms] ease-[cubic-bezier(0.4,0,0.2,1)]
        outline-none focus-visible:ring-2 focus-visible:ring-focus-ring focus-visible:ring-offset-2
        disabled:cursor-not-allowed
        ${variantClasses[variant]}
        ${sizeClasses[size]}
        ${className}
      `.trim().replace(/\s+/g, ' ')}
      {...rest}
    >
      {loading ? (
        <>
          {/* Spinner */}
          <svg
            className="animate-spin h-4 w-4 flex-shrink-0"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
            />
          </svg>
          {children}
        </>
      ) : (
        <>
          {leadingIcon && <span className="flex-shrink-0">{leadingIcon}</span>}
          {children}
        </>
      )}
    </button>
  );
}
