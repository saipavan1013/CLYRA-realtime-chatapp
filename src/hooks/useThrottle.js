import { useRef, useCallback, useEffect } from 'react';

/**
 * Returns a throttled callback that fires at most once per intervalMs.
 * Resets after intervalMs from the last call. Uses a ref for callback
 * to avoid recreating the throttled function when callback identity changes.
 */
export function useThrottle(callback, intervalMs) {
  const timeoutRef = useRef(null);
  const callbackRef = useRef(callback);
  callbackRef.current = callback;

  const throttled = useCallback(
    (...args) => {
      if (timeoutRef.current) return;

      callbackRef.current(...args);
      timeoutRef.current = setTimeout(() => {
        timeoutRef.current = null;
      }, intervalMs);
    },
    [intervalMs]
  );

  useEffect(() => () => clearTimeout(timeoutRef.current), []);

  return throttled;
}
