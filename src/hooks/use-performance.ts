import { useCallback, useRef } from 'react';

/**
 * Hook for performance-optimized drag operations
 * Uses RAF and direct DOM manipulation for smooth 60fps movement
 */
export const useOptimizedDrag = () => {
  const rafIdRef = useRef<number | null>(null);
  const lastUpdateRef = useRef<number>(0);
  
  const throttledUpdate = useCallback((callback: () => void, fps: number = 60) => {
    const now = performance.now();
    const elapsed = now - lastUpdateRef.current;
    const targetInterval = 1000 / fps;
    
    if (elapsed >= targetInterval) {
      if (rafIdRef.current) {
        cancelAnimationFrame(rafIdRef.current);
      }
      
      rafIdRef.current = requestAnimationFrame(() => {
        callback();
        lastUpdateRef.current = now;
        rafIdRef.current = null;
      });
    }
  }, []);
  
  const cleanup = useCallback(() => {
    if (rafIdRef.current) {
      cancelAnimationFrame(rafIdRef.current);
      rafIdRef.current = null;
    }
  }, []);
  
  return { throttledUpdate, cleanup };
};

/**
 * Hook for debounced state updates
 * Prevents excessive React re-renders during drag operations
 */
export const useDebounced = <T>(callback: (value: T) => void, delay: number = 16) => {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  return useCallback((value: T) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    timeoutRef.current = setTimeout(() => {
      callback(value);
      timeoutRef.current = null;
    }, delay);
  }, [callback, delay]);
};