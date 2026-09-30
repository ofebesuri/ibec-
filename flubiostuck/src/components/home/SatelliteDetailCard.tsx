'use client';

import { ReactNode } from 'react';
import { SatelliteTheme } from './SatelliteNode';

export interface SatelliteDetail {
  /** 长描述 */
  description: string;
  /** 关键参数列表 */
  metrics: { label: string; value: string }[];
  /** 模型/工具栈 */
  stack?: string[];
}

const DETAILS: Record<string, SatelliteDetail> = {
  scfv: {
    description:
      '基于 ESM-2 蛋白语言模型对 H5N1/H7N9 HA 头部做突变扫描，预测亲和力 ΔG 与关键残基。',
    metrics: [
      { label: '亲和力 ΔG', value: '-11.4 kcal/mol' },
      { label: '候选 #127', value: '待实验验证' },
      { label: '模型', value: 'ESM-2 (650M)' },
      { label: '输出', value: 'runId + seed + 残基热图' }
    ],
    stack: ['ESM-2', 'PyRosetta', 'MD 模拟']
  },
  multiomics: {
    description:
      '基因组·转录组·蛋白组·代谢组整合，DESeq2 基线 + 富集通路 + 调控网络可视化。',
    metrics: [
      { label: 'DEG 数', value: '1,284' },
      { label: 'FC 阈值', value: '> 1.5' },
      { label: 'FDR', value: '< 0.05' },
      { label: '标准化', value: 'TMM / DESeq2' }
    ],
    stack: ['DESeq2', 'edgeR', 'clusterProfiler', 'Cytoscape']
  },
  circuit: {
    description:
      'ODE 数值仿真合成生物学回路，预测 Notch-NFκB 双自杀开关的振荡周期与振幅稳定性。',
    metrics: [
      { label: '振荡周期', value: '6.2 h' },
      { label: '振幅稳定', value: 'stable' },
      { label: '求解器', value: 'LSODA / RK45' },
      { label: '导出', value: 'PDF / JSON / CSV' }
    ],
    stack: ['SciPy ODE', 'Tellurium', 'Copasi']
  },
  epidemic: {
    description:
      'SEIR 区域传播预测，支持 R0 / 疫苗覆盖 / 干预策略敏感性分析，输出峰值周与拐点。',
    metrics: [
      { label: 'R0', value: '1.42' },
      { label: '疫苗覆盖', value: '38%' },
      { label: '峰值推迟', value: '5.8 周' },
      { label: '风险等级', value: 'MODERATE' }
    ],
    stack: ['SEIR', 'PyMC', 'NetworkX']
  },
  ip: {
    description:
      '元件 → 专利风险 → 授权建议；商用 / 学术双口径，自动生成引用与免责声明。',
    metrics: [
      { label: '风险等级', value: 'HIGH / MEDIUM / FREE' },
      { label: '覆盖专利库', value: '12,400+' },
      { label: '授权建议', value: '4 类' },
      { label: '导出', value: '引用 + 免责 PDF' }
    ],
    stack: ['USPTO', 'CNIPA', 'iGEM Registry']
  }
};

const themeColor: Record<SatelliteTheme, string> = {
  scfv: '#16BFDB',
  omics: '#16D88A',
  circuit: '#935AFF',
  epidemic: '#FF9A1F',
  ip: '#FF4242',
  community: '#C5A6FF'
};

export interface SatelliteDetailCardProps {
  /** 节点 id */
  id: string;
  theme: SatelliteTheme;
  children?: ReactNode;
}

export function SatelliteDetailCard({ id, theme }: SatelliteDetailCardProps) {
  const detail = DETAILS[id];
  const accent = themeColor[theme];
  if (!detail) return null;
  return (
    <div
      className="satellite-detail-card"
      style={{
        position: 'absolute',
        top: 'calc(100% + 14px)',
        left: '50%',
        transform: 'translateX(-50%)',
        width: 280,
        padding: '14px 16px',
        borderRadius: 12,
        background: 'rgba(11, 16, 32, 0.92)',
        backdropFilter: 'blur(14px)',
        border: `1px solid ${accent}55`,
        boxShadow: `0 0 24px ${accent}33, 0 12px 32px rgba(0,0,0,0.5)`,
        zIndex: 20,
        pointerEvents: 'none',
        opacity: 0,
        transition: 'opacity 0.2s ease, transform 0.2s ease'
      }}
      data-detail-for={id}
    >
      <div
        style={{
          fontSize: 11,
          color: accent,
          letterSpacing: '0.16em',
          textTransform: 'uppercase',
          fontFamily: 'var(--font-mono), monospace',
          marginBottom: 6
        }}
      >
        {id.toUpperCase()} · MODULE
      </div>
      <div
        style={{
          fontSize: 12,
          color: 'rgba(255,255,255,0.85)',
          lineHeight: 1.55,
          marginBottom: 10
        }}
      >
        {detail.description}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px 10px' }}>
        {detail.metrics.map((m) => (
          <div key={m.label} style={{ fontSize: 11 }}>
            <div
              style={{
                color: 'rgba(255,255,255,0.5)',
                fontFamily: 'var(--font-mono), monospace',
                letterSpacing: '0.06em'
              }}
            >
              {m.label}
            </div>
            <div
              style={{
                color: '#fff',
                fontWeight: 600,
                fontFamily: 'var(--font-mono), monospace',
                fontSize: 12,
                marginTop: 2
              }}
            >
              {m.value}
            </div>
          </div>
        ))}
      </div>
      {detail.stack && detail.stack.length > 0 && (
        <div
          style={{
            marginTop: 10,
            paddingTop: 8,
            borderTop: '1px solid rgba(255,255,255,0.08)',
            display: 'flex',
            flexWrap: 'wrap',
            gap: 4
          }}
        >
          {detail.stack.map((s) => (
            <span
              key={s}
              style={{
                fontSize: 10,
                fontFamily: 'var(--font-mono), monospace',
                padding: '2px 6px',
                borderRadius: 4,
                background: `${accent}1a`,
                border: `1px solid ${accent}33`,
                color: accent
              }}
            >
              {s}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

export function getSatelliteAccent(theme: SatelliteTheme): string {
  return themeColor[theme];
}
