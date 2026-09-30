'use client';

import { ReactNode, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';

interface CollapsiblePanelProps {
  title: ReactNode;
  subtitle?: ReactNode;
  badge?: ReactNode;
  defaultOpen?: boolean;
  children: ReactNode;
  /** 自定义 header 右侧 actions */
  actions?: ReactNode;
  /** panel class */
  panelClassName?: string;
  /** body class */
  bodyClassName?: string;
}

export function CollapsiblePanel({
  title,
  subtitle,
  badge,
  defaultOpen = true,
  children,
  actions,
  panelClassName = 'panel-strong',
  bodyClassName = 'p-4 lg:p-5'
}: CollapsiblePanelProps) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className={`${panelClassName} relative`}>
      {/* 4 角装饰（参考模板 .fltdecarround） */}
      <span className="absolute top-0 left-0 w-2 h-2 border-t-2 border-l-2 border-bio-400/60 pointer-events-none" />
      <span className="absolute top-0 right-0 w-2 h-2 border-t-2 border-r-2 border-compute-400/60 pointer-events-none" />
      <span className="absolute bottom-0 left-0 w-2 h-2 border-b-2 border-l-2 border-glow-400/60 pointer-events-none" />
      <span className="absolute bottom-0 right-0 w-2 h-2 border-b-2 border-r-2 border-ip-400/60 pointer-events-none" />
      <div className="flex items-start justify-between gap-3 px-4 lg:px-5 py-3 border-b border-white/5">
        <div className="min-w-0">
          {subtitle && (
            <div className="text-[10px] font-mono tracking-[0.24em] uppercase text-text-tertiary">
              {subtitle}
            </div>
          )}
          <div className="text-sm lg:text-base font-semibold text-white mt-0.5 truncate">
            {title}
          </div>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          {badge}
          {actions}
          <button
            onClick={() => setOpen((v) => !v)}
            aria-label={open ? '折叠面板' : '展开面板'}
            aria-expanded={open}
            className="p-1.5 rounded-md text-text-tertiary hover:text-white hover:bg-white/5"
          >
            <motion.span
              animate={{ rotate: open ? 0 : -90 }}
              transition={{ duration: 0.2 }}
              className="inline-flex"
            >
              <ChevronDown className="w-4 h-4" />
            </motion.span>
          </button>
        </div>
      </div>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            key="body"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className="overflow-hidden"
          >
            <div className={bodyClassName}>{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

interface CollapsiblePanelControlledProps extends CollapsiblePanelProps {
  open: boolean;
  onToggle: () => void;
}

export function CollapsiblePanelControlled({
  open,
  onToggle,
  title,
  subtitle,
  badge,
  children,
  actions,
  panelClassName = 'panel-strong',
  bodyClassName = 'p-4 lg:p-5'
}: CollapsiblePanelControlledProps) {
  return (
    <div className={`${panelClassName} relative`}>
      {/* 4 角装饰（参考模板 .fltdecarround） */}
      <span className="absolute top-0 left-0 w-2 h-2 border-t-2 border-l-2 border-bio-400/60 pointer-events-none" />
      <span className="absolute top-0 right-0 w-2 h-2 border-t-2 border-r-2 border-compute-400/60 pointer-events-none" />
      <span className="absolute bottom-0 left-0 w-2 h-2 border-b-2 border-l-2 border-glow-400/60 pointer-events-none" />
      <span className="absolute bottom-0 right-0 w-2 h-2 border-b-2 border-r-2 border-ip-400/60 pointer-events-none" />
      <div className="flex items-start justify-between gap-3 px-4 lg:px-5 py-3 border-b border-white/5">
        <div className="min-w-0">
          {subtitle && (
            <div className="text-[10px] font-mono tracking-[0.24em] uppercase text-text-tertiary">
              {subtitle}
            </div>
          )}
          <div className="text-sm lg:text-base font-semibold text-white mt-0.5 truncate">
            {title}
          </div>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          {badge}
          {actions}
          <button
            onClick={onToggle}
            aria-label={open ? '折叠面板' : '展开面板'}
            aria-expanded={open}
            className="p-1.5 rounded-md text-text-tertiary hover:text-white hover:bg-white/5"
          >
            <motion.span
              animate={{ rotate: open ? 0 : -90 }}
              transition={{ duration: 0.2 }}
              className="inline-flex"
            >
              <ChevronDown className="w-4 h-4" />
            </motion.span>
          </button>
        </div>
      </div>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            key="body"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className="overflow-hidden"
          >
            <div className={bodyClassName}>{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
