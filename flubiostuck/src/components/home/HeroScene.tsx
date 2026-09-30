'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Atom,
  Brain,
  CircuitBoard,
  Globe,
  ShieldAlert
} from 'lucide-react';
import { useUiStore } from '@/lib/store/uiStore';
import { SatelliteNode, SatelliteTheme } from './SatelliteNode';
import { StageLines, SatellitePos } from './StageLines';

/**
 * HeroScene - 实时遥测舞台（CSS/SVG，可降级）
 *
 * 实现：
 * - CORE 居于舞台中心（cx = w/2, cy = h/2）
 * - 5 颗卫星按黄金角 (137.5°) 分布在以 CORE 为圆心的轨道上
 * - 半径 = min(w, h) * 0.30，自适应不同尺寸
 * - 5 条光线从 CORE 流向每颗卫星（SVG line + stroke-dashoffset 动画）
 * - 文案与 /analysis、/database 真实模块对齐
 *
 * 注意：当前为 CSS/SVG 实现，不依赖 three.js / @react-three/fiber；
 *   提供 WebGL 能力检测与降级路径。
 */

interface HeroStageProps {
  className?: string;
}

interface SatelliteConfig {
  id: 'scfv' | 'circuit' | 'epidemic' | 'multiomics' | 'ip';
  title: string;
  subtitle: string;
  theme: SatelliteTheme;
  href: string;
  Icon: any;
  accent: string;
  description: string;
}

const SATELLITES: SatelliteConfig[] = [
  {
    id: 'scfv',
    title: 'scFv 筛选',
    subtitle: 'ESM-2 · ΔG',
    theme: 'scfv',
    href: '/analysis?module=scfv',
    Icon: Brain,
    accent: '#16BFDB',
    description: 'H5N1/H7N9 HA 突变扫描 · 亲和力 ΔG 预测'
  },
  {
    id: 'multiomics',
    title: '多组学整合',
    subtitle: 'DESeq2 · 通路',
    theme: 'omics',
    href: '/analysis?module=multiomics',
    Icon: Atom,
    accent: '#16D88A',
    description: '基因组/转录组/蛋白组整合 · 富集通路'
  },
  {
    id: 'circuit',
    title: '回路仿真',
    subtitle: 'ODE · 振荡',
    theme: 'circuit',
    href: '/analysis?module=circuit',
    Icon: CircuitBoard,
    accent: '#935AFF',
    description: 'Notch-NFκB 双自杀开关 · 振荡周期 6.2h'
  },
  {
    id: 'epidemic',
    title: 'SEIR 预测',
    subtitle: 'R0 · 峰值',
    theme: 'epidemic',
    href: '/analysis?module=epidemic',
    Icon: Globe,
    accent: '#FF9A1F',
    description: '区域传播预测 · 疫苗覆盖 38% · 峰值推迟 5.8 周'
  },
  {
    id: 'ip',
    title: 'IP 风控',
    subtitle: '专利 · 授权',
    theme: 'ip',
    href: '/database',
    Icon: ShieldAlert,
    accent: '#FF4242',
    description: '元件 → 风险 → 商用/学术双口径授权建议'
  }
];

const GOLDEN_ANGLE = Math.PI * (3 - Math.sqrt(5)); // ≈ 2.39996 rad ≈ 137.5°

export function HeroScene({ className }: HeroStageProps) {
  const router = useRouter();
  const [supported, setSupported] = useState<boolean | null>(null);
  const [mounted, setMounted] = useState(false);
  const stageRef = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ w: 1200, h: 560 });

  useEffect(() => {
    try {
      const canvas = document.createElement('canvas');
      const gl = canvas.getContext('webgl2') || canvas.getContext('webgl');
      setSupported(!!gl);
    } catch {
      setSupported(false);
    }
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!stageRef.current) return;
    const el = stageRef.current;
    const ro = new ResizeObserver(() => {
      const r = el.getBoundingClientRect();
      setSize({ w: Math.max(r.width, 320), h: Math.max(r.height, 320) });
    });
    ro.observe(el);
    const r = el.getBoundingClientRect();
    setSize({ w: Math.max(r.width, 320), h: Math.max(r.height, 320) });
    return () => ro.disconnect();
  }, []);

  // 舞台中心 + 黄金角排布
  const cx = size.w / 2;
  const cy = size.h / 2;
  const radius = Math.min(size.w, size.h) * 0.30;

  const positioned = SATELLITES.map((s, i) => {
    const angle = i * GOLDEN_ANGLE - Math.PI / 2; // 第一个放顶部
    return {
      ...s,
      x: cx + Math.cos(angle) * radius,
      y: cy + Math.sin(angle) * radius
    };
  });

  // CORE 真实居中尺寸
  const coreMain = 168;
  const coreInner = 132;
  const coreDot = 96;

  const satellitePositions: SatellitePos[] = positioned.map((p) => ({
    id: p.id,
    x: p.x,
    y: p.y,
    color: p.accent
  }));

  return (
    <div className={className}>
      {supported === false ? (
        <FallbackStage />
      ) : (
        <div ref={stageRef} className="stage-stage-bg absolute inset-0">
          <div className="stage-stage-bg__grid" aria-hidden />
          <div className="stage-stage-bg__aurora" aria-hidden />
          {/* v2026.09.20-Final 加法：升级极光（仅视觉，pointer-events:none） */}
          <div className="stage-stage-bg__aurora--v2" aria-hidden />
          {/* v2026.09.20-Final 加法：舞台星点 + 上下彩条 */}
          <div className="stage-stars" aria-hidden />
          <div className="stage-color-strip stage-color-strip--top" aria-hidden />
          <div className="stage-color-strip stage-color-strip--bottom" aria-hidden />
          {/* v2026.09.20-Final 加法：斜向扫描光带 */}
          <div className="stage-scan-line--sweep" aria-hidden />
          <StageCornerFrame />

          {/* 动态光束：中心 → 每颗卫星 */}
          <StageLines
            frameWidth={size.w}
            frameHeight={size.h}
            centerX={cx}
            centerY={cy}
            satellites={satellitePositions}
          />

          {/* 5 颗卫星（黄金角 + 自适应半径） */}
          {positioned.map((s) => {
            const Icon = s.Icon;
            const setHeroFocus = useUiStore.getState().setHeroFocus;
            return (
              <div
                key={s.id}
                className="stage-satellite-position"
                style={{
                  position: 'absolute',
                  left: `${s.x - 48}px`,
                  top: `${s.y - 48}px`,
                  zIndex: 3
                }}
              >
                {/* v2026.09.20-Final 加法：轨道环（纯视觉，无 pointer-events） */}
                <span className="stage-satellite-orbit-ring" aria-hidden />
                <SatelliteNode
                  id={s.id}
                  title={s.title}
                  subtitle={s.subtitle}
                  theme={s.theme}
                  active={false}
                  onClick={() => {
                    setHeroFocus(s.id);
                    // v2026.09.20-Final: SPA 跳转，不再触发整页刷新
                    router.push(s.href);
                  }}
                  icon={<Icon className="w-4 h-4" style={{ color: 'currentColor' }} strokeWidth={2.2} />}
                />
              </div>
            );
          })}

          {/* CORE 真正居中 */}
          <div
            className="stage-core-container"
            style={{
              position: 'absolute',
              left: `${cx - coreMain / 2}px`,
              top: `${cy - coreMain / 2}px`,
              width: `${coreMain}px`,
              height: `${coreMain}px`,
              zIndex: 4
            }}
          >
            {/* v2026.09.20-Final 加法：CORE 外层呼吸光晕（仅视觉） */}
            <div className="stage-core-aura" aria-hidden />
            <div className="stage-core stage-core--template">
              <div className="stage-core__ring" />
              <div
                className="stage-core__inner"
                style={{
                  width: `${coreInner}px`,
                  height: `${coreInner}px`,
                  position: 'absolute',
                  left: `${(coreMain - coreInner) / 2}px`,
                  top: `${(coreMain - coreInner) / 2}px`
                }}
              >
                <div
                  className="stage-core__core"
                  style={{
                    width: `${coreDot}px`,
                    height: `${coreDot}px`,
                    position: 'absolute',
                    left: `${(coreInner - coreDot) / 2}px`,
                    top: `${(coreInner - coreDot) / 2}px`
                  }}
                >
                  <span className="stage-core__core-label">CORE</span>
                </div>
              </div>
            </div>
            <div className="stage-core__title">CORE · FluBioStack</div>
          </div>
        </div>
      )}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* StageCornerFrame - 4 角装饰                                                  */
/* -------------------------------------------------------------------------- */

function StageCornerFrame() {
  return (
    <>
      <span className="stage-corner-deco stage-corner-deco--tl stage-corner-deco--cyan" />
      <span className="stage-corner-deco stage-corner-deco--tr stage-corner-deco--violet" />
      <span className="stage-corner-deco stage-corner-deco--bl stage-corner-deco--green" />
      <span className="stage-corner-deco stage-corner-deco--br stage-corner-deco--amber" />
    </>
  );
}

/* -------------------------------------------------------------------------- */
/* FallbackStage - 纯 CSS 降级                                                  */
/* -------------------------------------------------------------------------- */

function FallbackStage() {
  return (
    <div className="absolute inset-0">
      <div className="stage-stage-bg" aria-hidden />
      <div
        className="grid-bg"
        style={{
          position: 'absolute',
          inset: 0,
          opacity: 0.5,
          backgroundImage:
            'linear-gradient(rgba(155,168,208,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(155,168,208,0.08) 1px, transparent 1px)',
          backgroundSize: '32px 32px'
        }}
      />
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: 'radial-gradient(circle at 50% 50%, rgba(147,90,255,0.18), transparent 50%)'
        }}
      />
      <div className="stage-orbital-loader" style={{ position: 'absolute', inset: 0, margin: 'auto', top: '40%' }}>
        <span /><span /><span /><span /><span /><span /><span /><span />
      </div>
      <div
        style={{
          position: 'absolute',
          top: '60%',
          left: '50%',
          transform: 'translateX(-50%)',
          fontSize: 12,
          color: '#9BA8D0',
          fontFamily: 'var(--font-mono), monospace',
          letterSpacing: '0.18em',
          textTransform: 'uppercase',
          textAlign: 'center'
        }}
      >
        WebGL unavailable · 降级到 CSS 2.5D 舞台
      </div>
    </div>
  );
}
