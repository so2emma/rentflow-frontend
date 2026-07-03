/**
 * hooks/useDebounce.ts
 *
 * Shared utility hook — delays updating the returned value until after
 * the specified wait period has passed since the last call.
 * Use for search inputs to avoid triggering API calls on every keystroke.
 */

import { useState, useEffect } from 'react';

export function useDebounce<T>(value: T, delayMs: number = 300): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delayMs);

    return () => {
      clearTimeout(timer);
    };
  }, [value, delayMs]);

  return debouncedValue;
}
