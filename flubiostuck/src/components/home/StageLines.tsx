'use client';

/**
 * StageLines - CORE → 每颗卫星的动态光束
 *
 * 抛弃模板像素硬编码，按当前舞台尺寸自适应：
 * - 中心点 (cx, cy) 由调用方提供（默认舞台中心）
 * - 每个卫星位置由 props.satellites 传入 [{x, y, color}, ...]
 * - SVG line + stroke-dashoffset 动画模拟能量从 CORE 流到卫星
 */

export interface SatellitePos {
  id: string;
  x: number;
  y: number;
  color: string;
}

export interface StageLinesProps {
  frameWidth: number;
  frameHeight: number;
  centerX?: number;
  centerY?: number;
  satellites: SatellitePos[];
}

export function StageLines({
  frameWidth,
  frameHeight,
  centerX,
  centerY,
  satellites
}: StageLinesProps) {
  const cx = centerX ?? frameWidth / 2;
  const cy = centerY ?? frameHeight / 2;

  return (
    <svg
      className="stage-lines absolute inset-0 pointer-events-none"
      width={frameWidth}
      height={frameHeight}
      viewBox={`0 0 ${frameWidth} ${frameHeight}`}
      aria-hidden
    >
      <defs>
        {satellites.map((s) => (
          <linearGradient
            key={`grad-${s.id}`}
            id={`stage-line-grad-${s.id}`}
            gradientUnits="userSpaceOnUse"
            x1={cx}
            y1={cy}
            x2={s.x}
            y2={s.y}
          >
            <stop offset="0%" stopColor={s.color} stopOpacity="0.85" />
            <stop offset="55%" stopColor={s.color} stopOpacity="0.55" />
            <stop offset="100%" stopColor={s.color} stopOpacity="0.15" />
          </linearGradient>
        ))}
      </defs>

      {/* 底层：稳态虚线 */}
      {satellites.map((s) => (
        <line
          key={`static-${s.id}`}
          x1={cx}
          y1={cy}
          x2={s.x}
          y2={s.y}
          stroke={s.color}
          strokeWidth={1}
          strokeOpacity={0.18}
          strokeDasharray="3 5"
        />
      ))}

      {/* 上层：流动光束 */}
      {satellites.map((s, i) => (
        <line
          key={`flow-${s.id}`}
          x1={cx}
          y1={cy}
          x2={s.x}
          y2={s.y}
          stroke={`url(#stage-line-grad-${s.id})`}
          strokeWidth={1.5}
          strokeDasharray="6 14"
          strokeLinecap="round"
          style={{
            animation: `stageLineFlow ${3 + i * 0.5}s linear infinite`,
            animationDelay: `${i * 0.4}s`
          }}
        />
      ))}
    </svg>
  );
}
