import { useEffect, useRef, useCallback } from 'react';

export function useDebounce<TArg, TReturn>(callback: (arg: TArg) => TReturn, delay: number): (arg: TArg) => void {
  const timeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);
  const callbackRef = useRef(callback);

  // Update callback ref when callback changes
  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  // Return memoized debounced function
  return useCallback(
    ((arg: TArg) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      timeoutRef.current = setTimeout(() => {
        if (callbackRef.current) {
          callbackRef.current(arg);
        }
      }, delay);
    }),
    [delay]
  );
}
