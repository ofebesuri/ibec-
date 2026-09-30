'use client';

import { ReactNode, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

interface RightDockProps {
  open: boolean;
  onClose: () => void;
  title: ReactNode;
  subtitle?: ReactNode;
  children: ReactNode;
  /** width class for the dock */
  widthClassName?: string;
  /** optional footer / actions */
  footer?: ReactNode;
}

export function RightDock({
  open,
  onClose,
  title,
  subtitle,
  children,
  widthClassName = 'w-full max-w-[480px]',
  footer
}: RightDockProps) {
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            key="dock-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[70] bg-ink-950/85"
            onClick={onClose}
            aria-hidden="true"
          />
          <motion.aside
            key="dock-panel"
            initial={{ x: 60, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 60, opacity: 0 }}
            transition={{ duration: 0.28, ease: 'easeOut' }}
            className={`fixed top-16 right-0 bottom-0 z-[71] ${widthClassName} panel-strong border-l border-white/10 shadow-2xl flex flex-col`}
            role="dialog"
            aria-modal="true"
          >
            <div className="flex items-start justify-between gap-3 px-5 py-4 border-b border-white/5">
              <div className="min-w-0">
                {subtitle && (
                  <div className="text-[10px] font-mono tracking-[0.24em] uppercase text-text-tertiary">
                    {subtitle}
                  </div>
                )}
                <div className="text-base font-semibold text-white mt-0.5 truncate">{title}</div>
              </div>
              <button
                onClick={onClose}
                className="p-1.5 rounded-md text-text-tertiary hover:text-white hover:bg-white/5"
                aria-label="关闭抽屉"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto">{children}</div>
            {footer && (
              <div className="px-5 py-3 border-t border-white/5 bg-ink-900/40">{footer}</div>
            )}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
