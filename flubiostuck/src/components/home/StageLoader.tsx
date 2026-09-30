'use client';

/**
 * StageLoader - 8 span 环绕加载器
 * 完全对应模板示例 .loadEffect 样式
 *
 * 落地：用于 HeroScene 加载前的瞬态 fallback，以及页面首屏过渡
 */

export interface StageLoaderProps {
  /** 显示文字 */
  label?: string;
  /** 像素大小 */
  size?: number;
  /** class */
  className?: string;
}

export function StageLoader({
  label = 'STAGE LOADING',
  size = 100,
  className = ''
}: StageLoaderProps) {
  return (
    <div
      className={`flex flex-col items-center justify-center gap-3 ${className}`}
      role="status"
      aria-live="polite"
    >
      <div
        className="stage-orbital-loader"
        style={{ width: size, height: size }}
      >
        <span />
        <span />
        <span />
        <span />
        <span />
        <span />
        <span />
        <span />
      </div>
      {label && (
        <div
          style={{
            fontSize: 11,
            color: '#9BA8D0',
            letterSpacing: '0.24em',
            textTransform: 'uppercase',
            fontFamily: 'var(--font-mono), monospace'
          }}
        >
          {label}
        </div>
      )}
    </div>
  );
}
