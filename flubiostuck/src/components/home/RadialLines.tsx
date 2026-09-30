'use client';

import { useEffect, useState } from 'react';

/**
 * RadialLines - 从中心放射至 5 个卫星节点的辐射光线
 * 借鉴模板示例的 .line2-line6 mm-mm6 keyframes 思路
 *
 * 使用方式：在 stage 中按相对于中心点的坐标绝对定位 5 条线
 * 通过 CSS class 控制颜色与动画时长
 */

export interface RadialLinesProps {
  /** 中心节点 DOM ref 元素，用于测量位置 */
  centerRef: React.RefObject<HTMLElement>;
  /** 5 个卫星 DOM ref */
  satelliteRefs: React.RefObject<HTMLElement>[];
}

export function RadialLines({ centerRef, satelliteRefs }: RadialLinesProps) {
  const [lines, setLines] = useState<
    Array<{
      id: string;
      x: number;
      y: number;
      width: number;
      length: number;
      angle: number;
      colorClass: string;
      delay: number;
      duration: number;
    }>
  >([]);

  useEffect(() => {
    function recompute() {
      const center = centerRef.current;
      if (!center) return;
      const cr = center.getBoundingClientRect();
      const cx = cr.left + cr.width / 2;
      const cy = cr.top + cr.height / 2;
      const next: typeof lines = [];
      satelliteRefs.forEach((ref, idx) => {
        const el = ref.current;
        if (!el) return;
        const r = el.getBoundingClientRect();
        const tx = r.left + r.width / 2;
        const ty = r.top + r.height / 2;
        const dx = tx - cx;
        const dy = ty - cy;
        const length = Math.hypot(dx, dy);
        const angle = Math.atan2(dy, dx) * (180 / Math.PI);
        const colors = ['--cyan', '--violet', '--green', '--amber', '--red'];
        next.push({
          id: `radial-${idx}`,
          x: cx,
          y: cy,
          width: length,
          length,
          angle,
          colorClass: `stage-radial-line${colors[idx % colors.length]}`,
          delay: idx * 0.7,
          duration: 4 + idx * 0.4
        });
      });
      setLines(next);
    }

    recompute();
    window.addEventListener('resize', recompute);
    // 60Hz 轻量级重测（卫星 ref 位置可能因 3D 旋转/动画变化）
    const interval = window.setInterval(recompute, 1500);
    return () => {
      window.removeEventListener('resize', recompute);
      window.clearInterval(interval);
    };
  }, [centerRef, satelliteRefs]);

  return (
    <div className="absolute inset-0 pointer-events-none overflow-visible z-[1]">
      {lines.map((l) => (
        <span
          key={l.id}
          className={`stage-radial-line ${l.colorClass}`}
          style={{
            left: `${l.x}px`,
            top: `${l.y}px`,
            width: `${l.length}px`,
            transform: `rotate(${l.angle}deg)`,
            animationDelay: `${l.delay}s`,
            animationDuration: `${l.duration}s`
          }}
        />
      ))}
    </div>
  );
}
