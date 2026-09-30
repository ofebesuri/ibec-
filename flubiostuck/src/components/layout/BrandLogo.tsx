'use client';

/**
 * BrandLogo - FluBioStack 品牌标志
 *
 * 设计思路：
 * - 六边形容器呼应"合成生物学元件"的分子结构感
 * - 内部交叉双螺旋线条（DNA）以描边路径呈现，而非直接堆图标，更具品牌识别度
 * - 三色渐变（cyan → violet → green）对应控制台的三大科研承诺配色
 * - 呼吸光晕 + 角标脉冲点，保留原设计的"在线/实时"信号语义
 */
export function BrandLogo({ size = 40 }: { size?: number }) {
  return (
    <div
      className="relative flex-shrink-0 brand-logo"
      style={{ width: size, height: size }}
      aria-hidden
    >
      <svg viewBox="0 0 40 40" width={size} height={size} className="brand-logo__svg">
        <defs>
          <linearGradient id="brandHex" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#16BFDB" />
            <stop offset="50%" stopColor="#935AFF" />
            <stop offset="100%" stopColor="#16D88A" />
          </linearGradient>
          <linearGradient id="brandHelix" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.95" />
            <stop offset="100%" stopColor="#E8FBFF" stopOpacity="0.75" />
          </linearGradient>
        </defs>

        {/* 六边形外壳 */}
        <polygon
          points="20,2 35.3,11 35.3,29 20,38 4.7,29 4.7,11"
          fill="url(#brandHex)"
          className="brand-logo__hex"
        />
        {/* 内层描边六边形，制造双层立体感 */}
        <polygon
          points="20,7 30.6,13.5 30.6,26.5 20,33 9.4,26.5 9.4,13.5"
          fill="none"
          stroke="rgba(5,7,15,0.35)"
          strokeWidth="0.75"
        />

        {/* 双螺旋 DNA 线条 */}
        <path
          d="M14 9 C 20 14, 20 18, 14 23 C 20 28, 20 32, 14 31"
          fill="none"
          stroke="url(#brandHelix)"
          strokeWidth="2"
          strokeLinecap="round"
          className="brand-logo__strand brand-logo__strand--a"
        />
        <path
          d="M26 9 C 20 14, 20 18, 26 23 C 20 28, 20 32, 26 31"
          fill="none"
          stroke="url(#brandHelix)"
          strokeWidth="2"
          strokeLinecap="round"
          className="brand-logo__strand brand-logo__strand--b"
        />
        {/* 螺旋横档 */}
        <line x1="15.5" y1="13" x2="24.5" y2="13" stroke="rgba(11,16,32,0.55)" strokeWidth="1" strokeLinecap="round" />
        <line x1="14" y1="19" x2="26" y2="19" stroke="rgba(11,16,32,0.55)" strokeWidth="1" strokeLinecap="round" />
        <line x1="15.5" y1="25" x2="24.5" y2="25" stroke="rgba(11,16,32,0.55)" strokeWidth="1" strokeLinecap="round" />
      </svg>

      <span className="brand-logo__glow" />
      <span className="absolute -bottom-1 -right-1 w-3 h-3 rounded-full bg-glow-400 ring-2 ring-ink-900 pulse-ring pulse-ring--green" />
    </div>
  );
}
