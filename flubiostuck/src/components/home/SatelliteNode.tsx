'use client';

import { forwardRef, ReactNode, useState } from 'react';
import { SatelliteDetailCard, getSatelliteAccent } from './SatelliteDetailCard';

/**
 * SatelliteNode - 单个卫星节点
 * - 圆形外壳带 1px 实线描边
 * - 内圈 background 双层脉冲
 * - 中心展示图标 + 文字标签（位于节点下方）
 * - hover 弹出详情卡（SatelliteDetailCard）
 */

export type SatelliteTheme = 'scfv' | 'omics' | 'circuit' | 'epidemic' | 'ip' | 'community';

export interface SatelliteNodeProps {
  id: string;
  title: string;
  subtitle: string;
  theme: SatelliteTheme;
  icon: ReactNode;
  onClick?: () => void;
  active?: boolean;
  className?: string;
}

const themeClasses: Record<SatelliteTheme, string> = {
  scfv: 'stage-satellite--scfv',
  omics: 'stage-satellite--omics',
  circuit: 'stage-satellite--circuit',
  epidemic: 'stage-satellite--epidemic',
  ip: 'stage-satellite--ip',
  community: 'stage-satellite--community'
};

export const SatelliteNode = forwardRef<HTMLDivElement, SatelliteNodeProps>(
  function SatelliteNode(
    { id, title, subtitle, theme, icon, onClick, active, className = '' },
    ref
  ) {
    const [hovered, setHovered] = useState(false);
    const accent = getSatelliteAccent(theme);
    return (
      <div
        ref={ref}
        data-satellite-id={id}
        className={`stage-satellite ${themeClasses[theme]} ${active ? 'is-active' : ''} ${className}`}
        onClick={onClick}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        onFocus={() => setHovered(true)}
        onBlur={() => setHovered(false)}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onClick?.();
          }
        }}
        aria-label={`${title} - ${subtitle}`}
        style={{
          ['--satellite-accent' as string]: accent
        }}
      >
        <div className="stage-satellite__icon">{icon}</div>
        <div className="stage-satellite__label">
          <div
            style={{
              fontSize: 11,
              fontWeight: 700,
              color: '#dfdede',
              letterSpacing: '0.02em',
              textAlign: 'center'
            }}
          >
            {title}
          </div>
          {subtitle && (
            <div
              style={{
                fontSize: 10,
                color: 'rgba(255,255,255,0.55)',
                textAlign: 'center',
                marginTop: 2,
                maxWidth: 110
              }}
            >
              {subtitle}
            </div>
          )}
        </div>
        <div
          style={{
            position: 'absolute',
            top: 'calc(100% + 14px)',
            left: '50%',
            transform: hovered ? 'translateX(-50%) translateY(0)' : 'translateX(-50%) translateY(-4px)',
            opacity: hovered ? 1 : 0,
            transition: 'opacity 0.2s ease, transform 0.2s ease',
            zIndex: 20,
            pointerEvents: 'none'
          }}
        >
          <SatelliteDetailCard id={id} theme={theme} />
        </div>
      </div>
    );
  }
);
