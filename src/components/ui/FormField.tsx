/**
 * components/ui/FormField.tsx
 *
 * Label + input/select/textarea wrapper with error state per design.md:
 *   - Labels positioned above, body-md bold
 *   - 1px border (outline-variant) → tertiary on focus
 *   - Error: red border + icon (never color alone, for a11y)
 *   - Min touch target 44px
 */

import React from 'react';

interface FormFieldProps {
  id: string;
  label: string;
  error?: string;
  /** Optional helper text shown below the input when no error. */
  hint?: string;
  required?: boolean;
  className?: string;
  children: React.ReactElement<React.InputHTMLAttributes<HTMLInputElement> | React.SelectHTMLAttributes<HTMLSelectElement> | React.TextareaHTMLAttributes<HTMLTextAreaElement>>;
}

/** Error icon (inline SVG, 16×16, red) */
function ErrorIcon() {
  return (
    <svg
      className="w-4 h-4 flex-shrink-0 text-error"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"
      />
    </svg>
  );
}

export function FormField({ id, label, error, hint, required, className = '', children }: FormFieldProps) {
  // Clone child to inject error class and aria attributes
  const childWithProps = React.cloneElement(children, {
    id,
    'aria-describedby': error ? `${id}-error` : hint ? `${id}-hint` : undefined,
    'aria-invalid': error ? 'true' : undefined,
    className: [
      'w-full min-h-[44px] px-3.5 py-2.5 text-base border rounded',
      'bg-surface-container-lowest text-on-surface outline-none',
      'transition-colors duration-[150ms]',
      error
        ? 'border-error focus:border-error focus:ring-2 focus:ring-error/30 focus:ring-offset-2'
        : 'border-outline-variant focus:border-tertiary focus:ring-2 focus:ring-focus-ring focus:ring-offset-2',
      'disabled:opacity-50 disabled:cursor-not-allowed',
      (children.props as any).className ?? '',
    ]
      .filter(Boolean)
      .join(' '),
  } as any);

  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      <label htmlFor={id} className="text-sm font-semibold text-on-surface">
        {label}
        {required && <span className="text-error ml-0.5" aria-hidden="true">*</span>}
      </label>

      {childWithProps}

      {error && (
        <div
          id={`${id}-error`}
          role="alert"
          className="flex items-center gap-1.5 text-sm text-on-error-container"
        >
          <ErrorIcon />
          <span>{error}</span>
        </div>
      )}

      {!error && hint && (
        <p id={`${id}-hint`} className="text-xs text-on-surface-variant">
          {hint}
        </p>
      )}
    </div>
  );
}
