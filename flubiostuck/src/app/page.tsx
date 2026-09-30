'use client';

import { Suspense, useEffect, useMemo, useState } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import {
  Activity,
  ArrowRight,
  Beaker,
  ChevronRight,
  Database,
  ExternalLink,
  FlaskConical,
  GitBranch,
  LineChart,
  Lock,
  Rocket,
  Satellite,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  Users,
  Workflow
} from 'lucide-react';
import { motion } from 'framer-motion';
import { DEMO_COMPONENTS, DEMO_BENCHMARKS } from '@/lib/demoData';
import { useUiStore } from '@/lib/store/uiStore';
import { CollapsiblePanel } from '@/components/layout/CollapsiblePanel';
import { RightDock } from '@/components/layout/RightDock';
import { ComponentQuickView } from '@/components/home/ComponentQuickView';
import { DeepChart, getCircuitChartOption, getEpidemicChartOption, getNetworkPulseOption } from '@/components/visualization/DeepChart';
import { LeftStageDrawer, RightStageDrawer } from '@/components/home/StageFloatingPanel';
import { Hometitlebox } from '@/components/home/Hometitlebox';
import { HeroActions } from '@/components/home/HeroActions';
import { StageLoader } from '@/components/home/StageLoader';

const HeroScene = dynamic(() => import('@/components/home/HeroScene').then((m) => m.HeroScene), {
  ssr: false,
  loading: () => null
});

const liveRuns = [
  { id: 'RUN-48217', name: 'H5N1-HA · 第二轮突变扫描', module: 'scfv', progress: 0.62, runtime: '02:47 / 04:30', seed: 42, ipFlag: 'protected' as const },
  { id: 'RUN-48218', name: '工程菌 NF-κB 多组学整合', module: 'OMICS', progress: 0.34, runtime: '01:18 / 03:45', seed: 12, ipFlag: 'free' as const },
  { id: 'RUN-48219', name: '双自杀开关 ODE 仿真', module: 'CIRCUIT', progress: 0.88, runtime: '00:42 / 00:48', seed: 7, ipFlag: 'pending' as const },
  { id: 'RUN-48220', name: 'H7N9 SEIR 区域传播预测', module: 'EPI', progress: 0.21, runtime: '00:14 / 01:05', seed: 101, ipFlag: 'restricted' as const }
];

const moduleShortcuts = [
  { title: '元件数据库', desc: '高密度数据表 · PDB/iGEM/WHO', href: '/database', icon: Database, accent: 'from-compute-500 to-bio-500', metrics: ['scFv · HA · NP · 启动子', '可复现元数据', 'IP 风险即查'] },
  { title: '在线分析', desc: 'scFv筛选 · 多组学 · 回路 · SEIR', href: '/analysis', icon: Beaker, accent: 'from-bio-500 to-glow-500', metrics: ['4大工作流', '可复现 Run ID', '导出 PDF/JSON'] },
  { title: 'FluBench', desc: '12算法横向对比基准', href: '/benchmark', icon: Activity, accent: 'from-glow-500 to-compute-500', metrics: ['H5N1-2023 / H7N9-2024', '可复现 seed', '一键 Docker'] },
  { title: '社区中心', desc: '教程 · 数据集 · 论坛 · iGEM', href: '/community', icon: Users, accent: 'from-compute-500 to-ip-400', metrics: ['iGEM 2023-2024', '上传下载数据', 'Demo 论坛'] }
];

const ipWatchlist = [
  { id: 'PRV-CN2024-018842', title: '工程菌双自杀开关', risk: 'HIGH', color: 'badge-danger', action: '法务复核' },
  { id: 'PRV-US2025-007721', title: '流感 B 通用 NP 表位', risk: 'MEDIUM', color: 'badge-warning', action: '授权洽谈' },
  { id: 'PRV-OPEN-IGEM-2024', title: 'iGEM 队伍开源元件', risk: 'FREE', color: 'badge-success', action: '学术可用' }
];

const pillars = [
  { title: '可复现', icon: GitBranch, points: ['每个分析任务返回 runId / seed / modelVersion / inputHash', 'PB 级历史快照可一键回放', '工程化数据集 + DOI 元数据'] },
  { title: '可解释', icon: Sparkles, points: ['scFv 突变 · 关键残基热图', '多组学 · 富集通路 · 调控网络', '回路 ODE · 振荡周期可视化'] },
  { title: '可保护', icon: ShieldCheck, points: ['元件 → IP 风险 → 授权建议', '商用 / 学术双口径建议', '一键生成引用与免责声明'] }
];

export default function HomePage() {
  return (
    <div className="relative">
      <Suspense fallback={null}>
        <Hero3DStage />
      </Suspense>
      <CapabilityBand />
      <CompactWorkspace />
      <PillarsRow />
      <PathwayRow />
      <ComponentDrawer />
    </div>
  );
}

/* ------------------------------ Hero ------------------------------ */

function Hero3DStage() {
  const setDetail = useUiStore((s) => s.setDetailComponentId);
  const [stageReady, setStageReady] = useState(false);

  useEffect(() => {
    // 给 HeroScene 一点时间挂载，但额外加 1.2s 安全保险确保永远会消失
    const t1 = window.setTimeout(() => setStageReady(true), 250);
    const t2 = window.setTimeout(() => setStageReady(true), 1200);
    return () => {
      window.clearTimeout(t1);
      window.clearTimeout(t2);
    };
  }, []);

  return (
    <section className="relative px-4 lg:px-8 mt-4 lg:mt-6">
      {/* 顶部 banner 686×69（仿模板 .Hometitlebox）*/}
      <div className="flex justify-center mb-3 lg:mb-4">
        <Hometitlebox />
      </div>

      {/* 主舞台 */}
      <div className="relative panel-strong overflow-hidden h-[460px] sm:h-[520px] lg:h-[560px]">
        {/* 3D 场景层 */}
        <div className="stage-3d">
          <div className="stage-grid-floor" aria-hidden />
          <div className="stage-scan-line" aria-hidden />
          <HeroScene className="absolute inset-0" />

          {/* 加载前的瞬态 loader（轻量遮罩，不阻塞阅读） */}
          {!stageReady && (
            <div
              className="hero-loader-mask"
              aria-hidden
            >
              <StageLoader label="实时遥测舞台装载中" size={96} />
            </div>
          )}
        </div>

        {/* 左 + 右抽屉（仿模板 fltoutbox，默认收起露出 peek） */}
        <LeftStageDrawer />
        <RightStageDrawer />

        {/* 右下角快捷入口（替代 HeroActions 4 按钮） */}
        <div className="absolute bottom-4 right-4 z-[5] pointer-events-none">
          <HeroActions />
        </div>

        {/* 抽屉 */}
        <ComponentDrawer />
      </div>
    </section>
  );
}

/* ------------------------------ Capability band ------------------------------ */

function CapabilityBand() {
  const metrics = [
    { label: '科研工作流', value: '4', sub: 'scFv · 多组学 · 回路 · SEIR', accent: 'from-compute-500 to-bio-500', icon: Workflow },
    { label: '分析 Agent', value: '5', sub: 'scFv · MultiOmics · Circuit · IP · Gen', accent: 'from-bio-500 to-glow-500', icon: Sparkles },
    { label: '可视化引擎', value: '8', sub: 'ECharts · Plotly · Cytoscape · IGV', accent: 'from-glow-500 to-compute-500', icon: LineChart },
    { label: '可复现元数据', value: '100%', sub: 'Run / Seed / Hash / Version', accent: 'from-compute-500 to-ip-400', icon: ShieldCheck }
  ];
  return (
    <section className="px-4 lg:px-8 mt-6 lg:mt-8">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map((m) => {
          const Icon = m.icon;
          return (
              <div key={m.label} className="stat-card stat-cap-glow px-5 py-4">
              <div className="flex items-center justify-between mb-3">
                <div className="text-[10px] font-mono tracking-[0.24em] uppercase text-text-tertiary">{m.label}</div>
                <span className={`w-9 h-9 rounded-lg bg-gradient-to-br ${m.accent} flex items-center justify-center text-ink-950 shadow-glow-sm rotate-node`}>
                  <Icon className="w-4 h-4 rotate-node__satellite" strokeWidth={2.5} />
                </span>
              </div>
              <div className="stat-num">{m.value}</div>
              <div className="text-xs text-text-secondary mt-1.5 leading-relaxed">{m.sub}</div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

/* ------------------------------ Compact workspace ------------------------------ */

function CompactWorkspace() {
  const tab = useUiStore((s) => s.workspaceTab);
  const setTab = useUiStore((s) => s.setWorkspaceTab);

  const tabs: Array<{ id: 'db' | 'runs' | 'ip' | 'bench'; label: string; icon: any; count: string }> = [
    { id: 'db', label: '元件表', icon: Database, count: `${DEMO_COMPONENTS.length}` },
    { id: 'runs', label: '图表', icon: LineChart, count: '4' },
    { id: 'ip', label: 'IP监控', icon: ShieldCheck, count: '3' },
    { id: 'bench', label: 'FluBench', icon: Activity, count: '12' }
  ];

  return (
    <section className="px-4 lg:px-8 mt-6 lg:mt-8">
      <div className="panel-strong panel-shine overflow-hidden">
        <div className="flex flex-wrap items-center gap-2 px-4 py-3 border-b border-white/5">
          {tabs.map((t) => {
            const Icon = t.icon;
            const active = tab === t.id;
            return (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition border ${
                  active
                    ? 'bg-gradient-to-r from-compute-700/40 to-bio-700/30 text-white border-compute-500/50 shadow-glow-sm'
                    : 'border-transparent text-text-secondary hover:text-white hover:bg-ink-800/60'
                }`}
                aria-pressed={active}
              >
                <Icon className="w-4 h-4" />
                <span className="whitespace-nowrap">{t.label}</span>
                <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded tabular-nums ${active ? 'bg-white/15 text-white' : 'bg-ink-800/70 text-text-tertiary'}`}>{t.count}</span>
              </button>
            );
          })}
        </div>

        <div className="p-4 lg:p-5">
          {tab === 'db' && <DbTab />}
          {tab === 'runs' && <ChartsTab />}
          {tab === 'ip' && <IpTab />}
          {tab === 'bench' && <BenchTab />}
        </div>
      </div>

      <div className="mt-4 grid md:grid-cols-2 lg:grid-cols-4 gap-4">
        {moduleShortcuts.map((m) => {
          const Icon = m.icon;
          return (
            <Link key={m.title} href={m.href} className="hex-card hex-card-shine p-5 flex flex-col gap-3 group">
              <div className="flex items-center justify-between">
                <span className={`w-11 h-11 rounded-xl bg-gradient-to-br ${m.accent} flex items-center justify-center text-ink-950 shadow-glow-sm`}>
                  <Icon className="w-5 h-5" strokeWidth={2.5} />
                </span>
                <ChevronRight className="w-4 h-4 text-text-tertiary group-hover:text-bio-300 transition" />
              </div>
              <div>
                <div className="text-base font-semibold text-white">{m.title}</div>
                <p className="text-xs text-text-secondary mt-1.5 leading-[1.6]">{m.desc}</p>
              </div>
              <div className="mt-auto space-y-1.5">
                {m.metrics.map((p) => (
                  <div key={p} className="flex items-center gap-2 text-[11px] text-text-secondary">
                    <span className="w-1 h-1 rounded-full bg-bio-300" />
                    {p}
                  </div>
                ))}
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}

function DbTab() {
  return (
    <div className="overflow-x-auto rounded-lg border border-[rgba(0,183,238,0.2)]">
      <table className="data-table">
        <thead>
          <tr className="bg-[rgba(1,202,217,0.08)]">
            <th>ID</th>
            <th>名称</th>
            <th>亚型</th>
            <th>序列长度</th>
            <th>IP</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {DEMO_COMPONENTS.map((c, idx) => (
            <tr key={c.id} className={`group tr-shine ${idx % 2 === 1 ? 'bg-[rgba(1,202,217,0.03)]' : ''} hover:bg-[rgba(0,183,238,0.1)] transition-colors`}>
              <td className="font-mono text-bio-200 whitespace-nowrap">
                <Link href={`/database/${c.id}`}>{c.id}</Link>
              </td>
              <td className="text-white">
                <div className="font-medium line-clamp-1 group-hover:text-bio-200 transition">
                  <Link href={`/database/${c.id}`}>{c.name}</Link>
                </div>
                <div className="text-[11px] text-text-tertiary line-clamp-1">{c.subtype} · {c.strain}</div>
              </td>
              <td className="text-white text-xs">{c.subtype}</td>
              <td className="font-mono text-white text-xs">{c.sequence.length.toLocaleString()}</td>
              <td>
                <span className={`badge text-[10px] ${c.ipStatus === 'protected' ? 'badge-warning' : c.ipStatus === 'free' ? 'badge-success' : c.ipStatus === 'pending' ? 'badge-info' : 'badge-danger'}`}>
                  {c.ipStatus}
                </span>
              </td>
              <td className="text-right">
                <Link href={`/database/${c.id}`} className="text-bio-200 hover:text-white text-xs flex items-center gap-1 justify-end transition">
                  详情 <ChevronRight className="w-3 h-3" />
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="px-3 py-2 text-[11px] font-mono text-text-tertiary flex items-center justify-between bg-[rgba(1,202,217,0.05)] border-t border-[rgba(0,183,238,0.15)]">
        <span>数据来源：精选数据集 v1 · API 回退</span>
        <Link href="/database" className="text-bio-200 hover:text-white">查看全部 →</Link>
      </div>
    </div>
  );
}

function ChartsTab() {
  return (
    <div className="grid lg:grid-cols-2 gap-4">
      <CollapsiblePanel title="回路动力学" subtitle="CIRCUIT · 双自杀开关" badge={<span className="badge badge-info text-[10px]">toggle 6.2h</span>} defaultOpen actions={<Link href="/analysis?module=circuit" className="text-[11px] text-bio-200 hover:text-white flex items-center gap-1">运行 <ArrowRight className="w-3 h-3" /></Link>}>
        <div className="bg-[rgba(1,202,217,0.08)] rounded-lg p-3 data-grid-texture">
          <DeepChart option={getCircuitChartOption()} height={200} />
        </div>
      </CollapsiblePanel>
      <CollapsiblePanel title="SEIR 预测" subtitle="EPIDEMIC · H7N9" badge={<span className="badge badge-warning text-[10px]">risk · MODERATE</span>} defaultOpen actions={<Link href="/analysis?module=epidemic" className="text-[11px] text-bio-200 hover:text-white flex items-center gap-1">运行 <ArrowRight className="w-3 h-3" /></Link>}>
        <div className="bg-[rgba(1,202,217,0.08)] rounded-lg p-3 data-grid-texture">
          <DeepChart option={getEpidemicChartOption()} height={200} />
        </div>
      </CollapsiblePanel>
      <CollapsiblePanel title="能力图谱" subtitle="CAPABILITY PULSE" badge={<span className="badge badge-success text-[10px]">live</span>} defaultOpen>
        <div className="bg-[rgba(1,202,217,0.08)] rounded-lg p-3 data-grid-texture">
          <DeepChart option={getNetworkPulseOption()} height={200} />
        </div>
      </CollapsiblePanel>
      <CollapsiblePanel title="DBTL 进度" subtitle="DESIGN · BUILD · TEST · LEARN" badge={<span className="badge badge-info text-[10px]">seed 42 · v3</span>} defaultOpen actions={<Link href="/database/FLU-scFv-001" className="text-[11px] text-bio-200 hover:text-white flex items-center gap-1">详情 <ArrowRight className="w-3 h-3" /></Link>}>
        <div className="bg-[rgba(1,202,217,0.08)] rounded-lg p-3 data-grid-texture">
          <DbtlMiniTimeline />
        </div>
      </CollapsiblePanel>
    </div>
  );
}

function IpTab() {
  return (
    <div className="grid md:grid-cols-2 gap-4">
      <div className="space-y-2">
        {ipWatchlist.map((ip) => (
          <div key={ip.id} className="panel px-3 py-2.5">
            <div className="flex items-center justify-between">
              <div className="text-[10px] font-mono tracking-[0.18em] uppercase text-text-tertiary">{ip.id}</div>
              <span className={`badge ${ip.color}`}>{ip.risk}</span>
            </div>
            <div className="mt-1 text-sm text-white">{ip.title}</div>
            <div className="mt-1 text-[11px] text-text-secondary flex items-center justify-between">
              <span>{ip.action}</span>
              <Link href="/database" className="text-bio-200 hover:text-white flex items-center gap-1">
                查看 <ChevronRight className="w-3 h-3" />
              </Link>
            </div>
          </div>
        ))}
      </div>
      <CollapsiblePanel title="授权建议" subtitle="LICENSE · 双口径" defaultOpen actions={<Link href="/community?tab=docs" className="text-[11px] text-bio-200 hover:text-white flex items-center gap-1">文档 <ArrowRight className="w-3 h-3" /></Link>}>
        <ul className="space-y-2 text-xs text-text-secondary">
          <li className="panel px-3 py-2">学术用途 · 开源元件 (iGEM) · 自由可用</li>
          <li className="panel px-3 py-2">学术用途 · 受保护元件 · 需引用 & 作者授权</li>
          <li className="panel px-3 py-2">商业用途 · 全部受保护元件 · 需签授权协议</li>
          <li className="panel px-3 py-2">跨境转移 · 高风险元件 · 法务复核 + 海关备案</li>
        </ul>
      </CollapsiblePanel>
    </div>
  );
}

function BenchTab() {
  return (
    <div className="grid lg:grid-cols-[1.6fr_1fr] gap-4">
      <CollapsiblePanel title="算法横向对比" subtitle="FLUBENCH · 12 算法" defaultOpen actions={<Link href="/benchmark" className="text-[11px] text-bio-200 hover:text-white flex items-center gap-1">全部 <ArrowRight className="w-3 h-3" /></Link>}>
        <div className="space-y-1.5">
          {DEMO_BENCHMARKS.slice(0, 5).map((b) => (
            <div key={b.algorithm} className="panel px-3 py-2 flex items-center gap-3">
              <span className="font-mono text-xs text-white flex-1 truncate">{b.algorithm}</span>
              <span className="font-mono text-[11px] text-bio-200">{b.accuracy}%</span>
              <div className="hidden md:block w-32 h-1.5 rounded bg-white/5 overflow-hidden">
                <div className="h-full bg-gradient-to-r from-compute-500 to-glow-500" style={{ width: `${b.accuracy}%` }} />
              </div>
              <span className="text-[11px] font-mono text-text-tertiary w-12 text-right">F1 {b.f1Score.toFixed(2)}</span>
            </div>
          ))}
        </div>
      </CollapsiblePanel>
      <CollapsiblePanel title="一键复现" subtitle="DOCKER · 30 秒拉起" defaultOpen actions={<Link href="/benchmark" className="text-[11px] text-bio-200 hover:text-white flex items-center gap-1">镜像库 <ArrowRight className="w-3 h-3" /></Link>}>
        <pre className="code-block overflow-x-auto text-xs">
{`docker pull flubiostack/web:v1.2.0
docker run -p 3000:3000 flubiostack/web:v1.2.0`}
        </pre>
        <div className="mt-3 flex flex-wrap gap-2 text-[11px]">
          <span className="px-2 py-1 rounded border border-white/10 bg-ink-900/60 font-mono">拉取 ~28s</span>
          <span className="px-2 py-1 rounded border border-white/10 bg-ink-900/60 font-mono">启动 ~12s</span>
          <span className="px-2 py-1 rounded border border-white/10 bg-ink-900/60 font-mono">首次分析 2:45</span>
        </div>
      </CollapsiblePanel>
    </div>
  );
}

function DbtlMiniTimeline() {
  const stages = [
    { phase: 'Design', desc: '序列 + 调控元件设计', value: 86, accent: 'from-compute-500 to-bio-500' },
    { phase: 'Build', desc: '自动化装配 + 验证', value: 72, accent: 'from-bio-500 to-glow-500' },
    { phase: 'Test', desc: '湿实验 + 仿真反馈', value: 54, accent: 'from-glow-500 to-compute-500' },
    { phase: 'Learn', desc: 'AI 辅助再设计', value: 38, accent: 'from-compute-500 to-ip-400' }
  ];
  return (
    <div className="grid grid-cols-4 gap-3">
      {stages.map((s) => (
        <div key={s.phase} className="text-center">
          <div className={`mx-auto w-10 h-10 rounded-xl bg-gradient-to-br ${s.accent} flex items-center justify-center text-ink-950 shadow-glow-sm`}>
            <FlaskConical className="w-4 h-4" strokeWidth={2.4} />
          </div>
          <div className="mt-1.5 text-xs font-semibold text-white">{s.phase}</div>
          <div className="text-[10px] text-text-tertiary line-clamp-2 min-h-[24px]">{s.desc}</div>
          <div className="mt-1.5 h-1.5 rounded bg-white/5 overflow-hidden">
            <div className={`h-full rounded bg-gradient-to-r ${s.accent}`} style={{ width: `${s.value}%` }} />
          </div>
          <div className="mt-1 text-[10px] font-mono text-text-secondary">{s.value}%</div>
        </div>
      ))}
    </div>
  );
}

/* ------------------------------ Pillars ------------------------------ */

function PillarsRow() {
  return (
    <section className="px-4 lg:px-8 mt-6 lg:mt-8">
      <CollapsiblePanel title="三大科研承诺" subtitle="PILLARS" defaultOpen actions={<Link href="/community?tab=docs" className="text-[11px] text-bio-200 hover:text-white flex items-center gap-1">阅读方法论 <ArrowRight className="w-3 h-3" /></Link>}>
        <div className="grid md:grid-cols-3 gap-4">
          {pillars.map((p) => {
            const Icon = p.icon;
            return (
              <div key={p.title} className="panel panel-shine p-5">
                <div className="flex items-center gap-3">
                  <span className="w-11 h-11 rounded-xl bg-gradient-to-br from-compute-500 to-bio-500 flex items-center justify-center text-ink-950 shadow-glow-sm">
                    <Icon className="w-5 h-5" strokeWidth={2.4} />
                  </span>
                  <h3 className="text-base font-semibold text-white">{p.title}</h3>
                </div>
                <ul className="mt-3 space-y-1.5 text-sm text-text-secondary">
                  {p.points.map((pt) => (
                    <li key={pt} className="flex items-start gap-2">
                      <span className="mt-1 w-1.5 h-1.5 rounded-full bg-bio-300" />
                      <span>{pt}</span>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      </CollapsiblePanel>
    </section>
  );
}

/* ------------------------------ Pathway ------------------------------ */

function PathwayRow() {
  const steps = [
    { tag: '01', title: '进入元件数据库', desc: '检索 H5N1 HA / scFv', icon: Database, href: '/database' },
    { tag: '02', title: '查看元件快览', desc: '3D结构 与 IP风险', icon: Workflow, href: '/database/FLU-scFv-001' },
    { tag: '03', title: 'scFv 筛选任务', desc: '指定参数 · 返回 runId', icon: Sparkles, href: '/analysis?module=scfv' },
    { tag: '04', title: '多组学 + 回路', desc: '参数面板 → 结果画布', icon: LineChart, href: '/analysis' },
    { tag: '05', title: 'FluBench 对比', desc: '12算法 · 一键复现', icon: Activity, href: '/benchmark' },
    { tag: '06', title: 'IP 风险复核', desc: '授权建议 / 免责声明', icon: Lock, href: '/database' }
  ];
  return (
    <section className="px-4 lg:px-8 mt-6 lg:mt-8 mb-10">
      <div className="panel-strong panel-shine p-6 lg:p-8">
        <div className="grid lg:grid-cols-[1.1fr_1fr] gap-6 items-center">
          <div>
            <div className="chip chip-shine">
              <TrendingUp className="w-3 h-3" />
              From sequence to insight · 90 sec
            </div>
            <h2 className="mt-3 text-2xl lg:text-3xl font-bold text-white leading-tight">
              评委展示路径：<span className="gradient-text">从元件到分析报告</span>
            </h2>
            <p className="mt-3 text-text-secondary text-sm lg:text-base leading-relaxed">
              按照 "检索元件 → 打开快览 → 触发分析 → 生成报告 → IP 风险复核" 的真实科研节奏，
              6 个步骤即可演示完整闭环。所有运行带 runId、seed、模型版本与输入哈希。
            </p>
            <div className="mt-5 flex flex-wrap gap-3">
              <Link href="/database" className="btn-primary btn-shine">
                <Rocket className="w-4 h-4" />
                开始演示
              </Link>
              <Link href="/benchmark" className="btn-secondary">
                <Activity className="w-4 h-4" />
                FluBench
              </Link>
              <Link href="/community" className="btn-secondary">
                <Users className="w-4 h-4" />
                教学资源
              </Link>
            </div>
          </div>
          <div className="panel p-4">
            <ol className="space-y-2.5">
              {steps.map((s) => {
                const Icon = s.icon;
                return (
                  <li key={s.tag}>
                    <Link href={s.href} className="flex items-center gap-3 px-3 py-2.5 panel hover:border-compute-500/50 transition group">
                      <span className="w-9 h-9 rounded-lg bg-ink-800/70 border border-white/10 flex items-center justify-center text-bio-200 font-mono text-xs group-hover:border-compute-500/50 transition">
                        {s.tag}
                      </span>
                      <span className="w-9 h-9 rounded-lg bg-gradient-to-br from-compute-500/40 to-bio-500/40 border border-white/10 flex items-center justify-center text-bio-200">
                        <Icon className="w-4 h-4" />
                      </span>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-white truncate group-hover:text-bio-100 transition">{s.title}</div>
                        <div className="text-[11px] text-text-secondary truncate">{s.desc}</div>
                      </div>
                      <ArrowRight className="w-4 h-4 text-text-tertiary group-hover:text-bio-300 transition" />
                    </Link>
                  </li>
                );
              })}
            </ol>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------ Drawer ------------------------------ */

function ComponentDrawer() {
  const detailId = useUiStore((s) => s.detailComponentId);
  const setDetail = useUiStore((s) => s.setDetailComponentId);
  const component = useMemo(
    () => (detailId ? DEMO_COMPONENTS.find((c) => c.id === detailId) ?? null : null),
    [detailId]
  );

  return (
    <RightDock
      open={!!component}
      onClose={() => setDetail(null)}
      title={component?.name ?? ''}
      subtitle={component ? `${component.id} · ${component.sequenceType}` : ''}
      footer={component ? (
        <div className="flex items-center justify-between gap-2 text-xs">
          <span className="font-mono text-text-tertiary truncate">{component.ipNumber}</span>
          <Link href={`/database/${component.id}`} onClick={() => setDetail(null)} className="btn-primary text-xs">
            <ExternalLink className="w-3 h-3" />
            完整详情
          </Link>
        </div>
      ) : null}
    >
      {component && <ComponentQuickView component={component} onClose={() => setDetail(null)} />}
    </RightDock>
  );
}
