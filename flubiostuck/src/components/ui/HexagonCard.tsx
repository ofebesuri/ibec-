'use client';

// @deprecated - 浅色主题组件，未被项目实际使用（项目全站使用暗色 .hex-card 自定义类）。
//                请勿在新增代码中引用。保留是为了不破坏潜在外部 import。
//                替代方案：直接使用 globals.css 中的 .hex-card + .hex-card-shine 暗色版本。

import { ReactNode } from 'react';

interface HexagonCardProps {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
  glow?: boolean;
  hoverable?: boolean;
}

export function HexagonCard({
  children,
  className = '',
  onClick,
  glow = false,
  hoverable = true
}: HexagonCardProps) {
  return (
    <div
      onClick={onClick}
      className={`
        relative bg-white border rounded-lg p-6
        ${glow ? 'border-cyan-200 shadow-card-hover' : 'border-slate-200'}
        ${hoverable ? 'transition-all duration-200 hover:border-slate-300 hover:shadow-card-hover hover:-translate-y-0.5' : ''}
        ${onClick ? 'cursor-pointer' : ''}
        ${className}
      `}
    >
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
}
