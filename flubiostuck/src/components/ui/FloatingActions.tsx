'use client';

import { motion } from 'framer-motion';
import { ReactNode, useState, cloneElement, isValidElement } from 'react';
import { LucideIcon, X } from 'lucide-react';

interface FloatingActionButtonProps {
  icon: LucideIcon;
  label: string;
  onClick?: () => void;
  badge?: number;
  position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
  color?: 'blue' | 'green' | 'purple' | 'gold' | 'red';
}

const colorConfig = {
  blue: 'from-bio-blue to-cyan-500 shadow-bio-blue/50',
  green: 'from-bio-green to-emerald-500 shadow-bio-green/50',
  purple: 'from-space-purple to-electric-purple shadow-space-purple/50',
  gold: 'from-law-gold to-amber-500 shadow-law-gold/50',
  red: 'from-dna-red to-rose-500 shadow-dna-red/50'
};

const positionConfig = {
  'bottom-right': 'bottom-4 right-4 lg:bottom-6 lg:right-6',
  'bottom-left': 'bottom-4 left-4 lg:bottom-6 lg:left-6',
  'top-right': 'top-24 right-4 lg:right-6',
  'top-left': 'top-24 left-4 lg:left-6'
};

export function FloatingActionButton({
  icon: Icon,
  label,
  onClick,
  badge,
  position = 'bottom-right',
  color = 'blue'
}: FloatingActionButtonProps) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.button
      onClick={onClick}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      whileHover={{ scale: 1.08 }}
      whileTap={{ scale: 0.95 }}
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 260, damping: 20 }}
      className={`fixed ${positionConfig[position]} z-40 group fab-pulse-ring`}
      aria-label={label}
    >
      <div className={`relative w-14 h-14 rounded-2xl bg-gradient-to-br ${colorConfig[color]} flex items-center justify-center shadow-lg overflow-hidden`}>
        {/* Animated rings (overflow-hidden 包裹防止外溢遮挡) */}
        <span className="absolute inset-0 rounded-2xl bg-current opacity-30 animate-ping" />
        <span className="absolute inset-0 rounded-2xl border-2 border-white/20" />

        {/* Icon */}
        <Icon className="w-6 h-6 text-white relative z-10" />

        {/* Badge */}
        {badge !== undefined && badge > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-dna-red text-white text-[10px] font-bold flex items-center justify-center border-2 border-deep-space">
            {badge > 99 ? '99+' : badge}
          </span>
        )}

        {/* Tooltip */}
        <motion.div
          initial={{ opacity: 0, x: 10 }}
          animate={{ opacity: isHovered ? 1 : 0, x: isHovered ? 0 : 10 }}
          className="absolute right-full top-1/2 -translate-y-1/2 mr-3 px-3 py-1.5 rounded-lg bg-deep-space/95 border border-bio-blue/30 whitespace-nowrap text-sm text-white"
        >
          {label}
          <div className="absolute left-full top-1/2 -translate-y-1/2 border-4 border-transparent border-l-deep-space/95" />
        </motion.div>
      </div>
    </motion.button>
  );
}

export function FloatingPanel({
  title,
  children,
  onClose,
  position = 'bottom-right'
}: {
  title: string;
  children: ReactNode;
  onClose: () => void;
  position?: 'bottom-right' | 'bottom-left';
}) {
  const [isExpanded, setIsExpanded] = useState(true);

  if (!isExpanded) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 20, scale: 0.95 }}
      className={`fixed ${
        position === 'bottom-right' ? 'bottom-24 right-6' : 'bottom-24 left-6'
      } z-40 w-80 hologram-panel rounded-2xl overflow-hidden`}
    >
      <div className="flex items-center justify-between p-3 border-b border-bio-blue/20 bg-deep-space/95">
        <h4 className="text-sm font-semibold gradient-text">{title}</h4>
        <button
          onClick={onClose}
          className="p-1 rounded hover:bg-dna-red/20 transition-colors"
          aria-label="Close panel"
        >
          <X className="w-4 h-4 text-gray-400 hover:text-dna-red" />
        </button>
      </div>
      <div className="p-4 max-h-96 overflow-y-auto">{children}</div>
    </motion.div>
  );
}
