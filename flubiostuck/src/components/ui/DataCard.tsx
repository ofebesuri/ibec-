'use client';

// @deprecated - 浅色主题组件，未被项目实际使用（项目全站使用暗色 .stat-card 自定义类）。
//                请勿在新增代码中引用。保留是为了不破坏潜在外部 import。
//                替代方案：直接使用 globals.css 中的 .panel + .stat-num 等暗色样式。

import { ReactNode } from 'react';

interface DataCardProps {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
  hoverable?: boolean;
  accentColor?: 'blue' | 'green' | 'purple' | 'amber' | 'red';
}

const accentColors = {
  blue: 'border-l-blue-500',
  green: 'border-l-emerald-500',
  purple: 'border-l-violet-500',
  amber: 'border-l-amber-500',
  red: 'border-l-red-500'
};

export function DataCard({
  children,
  className = '',
  onClick,
  hoverable = true,
  accentColor
}: DataCardProps) {
  return (
    <div
      onClick={onClick}
      className={`
        relative bg-white border border-slate-200 rounded-lg p-6
        ${hoverable ? 'transition-all duration-200 hover:border-slate-300 hover:shadow-card-hover hover:-translate-y-0.5' : ''}
        ${onClick ? 'cursor-pointer' : ''}
        ${accentColor ? `border-l-4 ${accentColors[accentColor]}` : ''}
        ${className}
      `}
    >
      {children}
    </div>
  );
}
