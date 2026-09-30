'use client';

import { useEffect } from 'react';

interface KeyboardShortcut {
  key: string;
  meta?: boolean;
  ctrl?: boolean;
  shift?: boolean;
  description: string;
  action: () => void;
}

/**
 * SkipLink - A11y component that helps keyboard users skip to main content
 */
export function SkipLink() {
  return (
    <a
      href="#main-content"
      className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-50 focus:px-3 focus:py-1.5 focus:bg-bio-500 focus:text-white focus:rounded focus:outline-none"
    >
      跳转到主要内容
    </a>
  );
}

/**
 * Accessibility helper hook
 */
export function useKeyboardShortcuts(shortcuts: KeyboardShortcut[]) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      shortcuts.forEach(({ key, meta, ctrl, shift, action }) => {
        if (
          e.key.toLowerCase() === key.toLowerCase() &&
          (!meta || e.metaKey) &&
          (!ctrl || e.ctrlKey) &&
          (!shift || e.shiftKey)
        ) {
          e.preventDefault();
          action();
        }
      });
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [shortcuts]);
}

/**
 * High contrast mode toggle
 */
export function useHighContrast() {
  useEffect(() => {
    const stored = localStorage.getItem('flubiostack-high-contrast');
    if (stored === 'true') {
      document.documentElement.classList.add('high-contrast');
    }
  }, []);

  const toggle = () => {
    const isActive = document.documentElement.classList.toggle('high-contrast');
    localStorage.setItem('flubiostack-high-contrast', isActive.toString());
  };

  return { toggle };
}
