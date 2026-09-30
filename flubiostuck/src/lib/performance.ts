'use client';

/**
 * Performance utilities for FluBioStack
 * - Debounce/throttle
 * - Local storage caching with TTL
 * - Memoization helpers
 * - Performance monitoring
 */

import React from 'react';

export function debounce<T extends (...args: any[]) => any>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timer: ReturnType<typeof setTimeout> | null = null;
  return (...args: Parameters<T>) => {
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
}

export function throttle<T extends (...args: any[]) => any>(
  fn: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle = false;
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      fn(...args);
      inThrottle = true;
      setTimeout(() => { inThrottle = false; }, limit);
    }
  };
}

/**
 * TTL cache using localStorage
 */
export class TTLCache<T> {
  private key: string;
  private ttl: number; // milliseconds

  constructor(key: string, ttl: number = 5 * 60 * 1000) {
    this.key = `flubiostack_cache_${key}`;
    this.ttl = ttl;
  }

  get(): T | null {
    if (typeof window === 'undefined') return null;
    try {
      const raw = localStorage.getItem(this.key);
      if (!raw) return null;
      const { value, expires } = JSON.parse(raw);
      if (Date.now() > expires) {
        localStorage.removeItem(this.key);
        return null;
      }
      return value;
    } catch {
      return null;
    }
  }

  set(value: T): void {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(this.key, JSON.stringify({
        value,
        expires: Date.now() + this.ttl
      }));
    } catch (e) {
      // Quota exceeded; ignore
    }
  }

  clear(): void {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(this.key);
  }
}

/**
 * Memoize an expensive calculation
 */
export function memoize<Args extends any[], R>(fn: (...args: Args) => R): (...args: Args) => R {
  const cache = new Map<string, R>();
  return (...args: Args) => {
    const key = JSON.stringify(args);
    if (cache.has(key)) return cache.get(key)!;
    const result = fn(...args);
    cache.set(key, result);
    return result;
  };
}

/**
 * Performance monitoring in dev mode
 */
export function markPerformance(name: string) {
  if (typeof window !== 'undefined' && window.performance) {
    try {
      performance.mark(name);
    } catch {}
  }
}

export function measurePerformance(name: string, fn: () => void) {
  if (typeof window === 'undefined' || !window.performance) {
    fn();
    return;
  }
  const start = performance.now();
  fn();
  const elapsed = performance.now() - start;
  if (process.env.NODE_ENV === 'development') {
    console.log(`[perf] ${name}: ${elapsed.toFixed(2)}ms`);
  }
}

/**
 * Lazy load helper for code splitting
 */
export function lazyImport<T extends React.ComponentType<any>>(
  importFn: () => Promise<{ default: T }>
): React.LazyExoticComponent<T> {
  return React.lazy(importFn);
}
