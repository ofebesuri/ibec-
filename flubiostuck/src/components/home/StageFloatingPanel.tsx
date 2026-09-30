'use client';

import {
  Activity,
  ChevronRight,
  Database,
  ShieldAlert,
  Sparkles,
  TrendingUp,
  Users
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';

/**
 * SidePanel - 仿模板 .fltoutbox 的 282px 浮动抽屉
 *
 * 模板原文：
 *   .fltoutbox{ width: 282px; position: absolute; }
 *   .leftbox{ left: 2%; top: 6%; }
 *   .rightbox{ right: 2%; top: 6%; }
 *   4 角 .fltdecarround 8×8 角框
 *
 * 落地：默认收起，右侧 16px peek，露出 toggle 按钮
 */

export interface StageFloatingPanelProps {
  title: string;
  icon: LucideIcon;
  children: React.ReactNode;
  badge?: React.ReactNode;
  accent?: 'cyan' | 'violet' | 'amber' | 'green' | 'mixed';
  className?: string;
}

function StageFloatingPanel({ title, icon: Icon, children, badge, accent = 'mixed', className = '' }: StageFloatingPanelProps) {
  return (
    <div className={`stage-flt-panel ${className}`}>
      <span className="deco-tl" />
      <span className="deco-tr" />
      <span className="deco-bl" />
      <span className="deco-br" />
      <div className="stage-flt-panel__title">
        <span className="stage-flt-panel__title-icon">
          <Icon className="w-3 h-3" />
        </span>
        <span className="stage-flt-panel__title-text">{title}</span>
        {badge && <span className="stage-flt-panel__title-badge">{badge}</span>}
      </div>
      <div className="stage-flt-panel__body">{children}</div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* SidePanelDrawer - 通用抽屉容器（默认收起，露出 16px peek）                    */
/* -------------------------------------------------------------------------- */

function SidePanelDrawer({
  side,
  title,
  icon: Icon,
  badge,
  accent,
  children,
  widthPx = 282
}: {
  side: 'left' | 'right';
  title: string;
  icon: LucideIcon;
  badge?: React.ReactNode;
  accent?: 'cyan' | 'violet' | 'amber' | 'green' | 'mixed';
  children: React.ReactNode;
  widthPx?: number;
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Toggle button (always visible) */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={`side-panel-toggle side-panel-toggle--${side}`}
        aria-label={open ? `收起 ${title}` : `展开 ${title}`}
        aria-expanded={open}
      >
        {open ? (
          <ChevronRight className={`w-3.5 h-3.5 ${side === 'right' ? '' : 'rotate-180'}`} />
        ) : (
          <span className="flex flex-col items-center gap-1">
            <Icon className="w-3.5 h-3.5" />
            <span className="text-[10px] font-mono tracking-[0.24em] uppercase">{title.slice(0, 2)}</span>
          </span>
        )}
      </button>

      {/* Drawer */}
      <aside
        className={`side-panel-drawer side-panel-drawer--${side} ${open ? 'is-open' : ''}`}
        style={{ width: open ? `${widthPx}px` : '0px' }}
        aria-hidden={!open}
      >
        <StageFloatingPanel title={title} icon={Icon} badge={badge} accent={accent}>
          {children}
        </StageFloatingPanel>
      </aside>
    </>
  );
}

/* -------------------------------------------------------------------------- */
/* 左侧抽屉：实时遥测 + 数据接入排行                                            */
/* -------------------------------------------------------------------------- */

const ingestItems = [
  { text: 'H5N1-HA 第二轮突变扫描完成 · 候选 #127', tag: 'SCFV' },
  { text: '工程菌 NF-κB 多组学整合 · seed 12', tag: 'OMIC' },
  { text: '双自杀开关 ODE 仿真 · 振荡周期 6.2h', tag: 'CIRCUIT' },
  { text: 'H7N9 SEIR 区域传播预测 · R0=1.42', tag: 'EPI' },
  { text: 'FluBench baseline 完成 · 12 算法', tag: 'BENCH' },
  { text: 'iGEM 2024 开源元件同步完成 · 12 项', tag: 'OPEN' },
  { text: 'scFv 任务队列 · 3/12 空闲', tag: 'OPS' },
  { text: 'NP 表位专利风险 · HIGH · 待复核', tag: 'RISK' }
];

export function LeftStageDrawer() {
  return (
    <SidePanelDrawer
      side="left"
      title="数据接入 · 实时遥测"
      icon={Activity}
      badge="LIVE"
      accent="cyan"
    >
      <div className="grid grid-cols-3 gap-1.5 mb-3">
        <MiniKPI label="GPU" value="67%" tone="cyan" />
        <MiniKPI label="存储" value="12.4TB" tone="violet" />
        <MiniKPI label="队列" value="3/9" tone="green" />
      </div>

      <div className="mb-3">
        <div className="flex justify-between text-[10px] text-text-tertiary font-mono tracking-[0.16em] uppercase mb-1">
          <span>API GATEWAY</span>
          <span className="text-glow-300">OPERATIONAL</span>
        </div>
        <div className="progress-bar-war progress-bar-war--green">
          <div className="progress-bar-war__fill" style={{ width: '94%', color: '#16D88A' }} />
          <div className="progress-bar-war__label">
            <span>SCFV PIPELINE</span>
            <span>94%</span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-1.5 text-[11px] font-mono tracking-[0.16em] uppercase text-text-tertiary mb-1.5">
        <span className="stage-signal stage-signal--cyan" />
        接入排行 · 滚动
      </div>
      <div className="stage-scroll-list">
        <div className="stage-scroll-list__viewport">
          {[...ingestItems, ...ingestItems].map((it, idx) => (
            <div key={idx} className="stage-scroll-list__item">
              <span className="truncate flex-1">{it.text}</span>
              <span className="stage-scroll-list__tag">{it.tag}</span>
            </div>
          ))}
        </div>
      </div>

      <Link href="/analysis" className="btn-secondary w-full justify-center mt-2.5 text-xs">
        打开分析控制台 <ChevronRight className="w-3.5 h-3.5" />
      </Link>
    </SidePanelDrawer>
  );
}

function MiniKPI({ label, value, tone }: { label: string; value: string; tone: 'cyan' | 'violet' | 'green' }) {
  const colorMap = { cyan: '#7DE9F4', violet: '#C5A6FF', green: '#7BF7C4' };
  return (
    <div
      style={{
        padding: '6px 8px',
        borderRadius: 6,
        background: 'rgba(1, 202, 217, 0.1)',
        border: '1px solid rgba(0, 183, 238, 0.2)',
        textAlign: 'center'
      }}
    >
      <div className="text-[9px] text-text-tertiary tracking-[0.18em] uppercase font-mono">{label}</div>
      <div className="text-[13px] font-bold font-mono mt-0.5" style={{ color: colorMap[tone] }}>
        {value}
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* 右侧抽屉：3 大科研承诺 + iGEM + FluBench                                    */
/* -------------------------------------------------------------------------- */

const pillars = [
  { icon: TrendingUp, title: '可复现', tone: 'cyan',   desc: 'runId / seed / hash / modelVersion 全链路追溯' },
  { icon: Sparkles,   title: '可解释', tone: 'green',  desc: 'scFv · 多组学 · 回路 · SEIR 全部带假设说明' },
  { icon: Database,   title: '可保护', tone: 'amber',  desc: '元件 → IP 风险 → 授权建议（学术 / 商用）' }
];

export function RightStageDrawer() {
  return (
    <SidePanelDrawer
      side="right"
      title="科研承诺 · 速览"
      icon={ShieldAlert}
      badge="v2026.09.20"
      accent="violet"
    >
      <div className="flex flex-col gap-1.5 mb-3">
        {pillars.map((p) => {
          const Icon = p.icon;
          return (
            <div
              key={p.title}
              className="flex items-start gap-2 p-2 rounded-lg border"
              style={{
                background: 'rgba(1, 202, 217, 0.08)',
                borderColor: 'rgba(0, 183, 238, 0.15)'
              }}
            >
              <span
                className="w-7 h-7 rounded-md flex items-center justify-center flex-shrink-0"
                style={{
                  background:
                    p.tone === 'cyan'
                      ? 'linear-gradient(135deg, #7E3AFF, #16BFDB)'
                      : p.tone === 'green'
                      ? 'linear-gradient(135deg, #16BFDB, #16D88A)'
                      : 'linear-gradient(135deg, #FF9A1F, #FF4242)'
                }}
              >
                <Icon className="w-3.5 h-3.5" style={{ color: '#0B1020' }} strokeWidth={2.4} />
              </span>
              <div className="flex-1 min-w-0">
                <div className="text-[13px] text-white font-semibold">{p.title}</div>
                <div className="text-[11px] text-text-secondary leading-snug mt-0.5">{p.desc}</div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-2 gap-1.5">
        <Link href="/community?tab=igem" className="side-panel-link">
          <Users className="w-4 h-4 text-compute-200" />
          <div className="flex-1 min-w-0">
            <div className="font-semibold">iGEM 协作</div>
            <div className="text-[10px] text-text-tertiary">48 队伍</div>
          </div>
        </Link>
        <Link href="/benchmark" className="side-panel-link">
          <Activity className="w-4 h-4 text-bio-200" />
          <div className="flex-1 min-w-0">
            <div className="font-semibold">FluBench</div>
            <div className="text-[10px] text-text-tertiary">12 算法</div>
          </div>
        </Link>
      </div>

      <Link href="/community?tab=docs" className="btn-primary w-full justify-center mt-3 text-xs">
        阅读方法论 <ChevronRight className="w-3.5 h-3.5" />
      </Link>
    </SidePanelDrawer>
  );
}
