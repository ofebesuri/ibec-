'use client';

import { useState } from 'react';
import { useParams, notFound } from 'next/navigation';
import Link from 'next/link';
import {
  ChevronRight,
  Database,
  Heart,
  Download,
  Share2,
  Copy,
  ExternalLink,
  FileText,
  Activity,
  Box,
  GitBranch,
  Calendar,
  Building2,
  Tag,
  Layers,
  TrendingUp,
  ShieldCheck,
  Sparkles,
  Play,
  AlertTriangle,
  Info
} from 'lucide-react';
import { IPStatusBadge } from '@/components/ui/IPStatusBadge';
import { SequenceViewer } from '@/components/ui/SequenceViewer';
import { DBTLTimeline } from '@/components/ui/DBTLTimeline';
import { ProteinViewer3D } from '@/components/visualization/ProteinViewer3D';
import { DeepChart } from '@/components/visualization/DeepChart';
import { DEMO_COMPONENTS, Component } from '@/lib/demoData';
import { useUiStore } from '@/lib/store/uiStore';
import toast from 'react-hot-toast';

type TabId = 'overview' | 'sequence' | 'structure' | 'dbtl' | 'references';

const tabs: { id: TabId; label: string; icon: any; sub: string }[] = [
  { id: 'overview', label: '概览', icon: FileText, sub: 'OVERVIEW' },
  { id: 'sequence', label: '序列信息', icon: Activity, sub: 'SEQUENCE' },
  { id: 'structure', label: '3D 结构', icon: Box, sub: 'STRUCTURE' },
  { id: 'dbtl', label: 'DBTL 历程', icon: GitBranch, sub: 'DBTL' },
  { id: 'references', label: '引用文献', icon: ExternalLink, sub: 'CITATIONS' }
];

export default function ComponentDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const component = DEMO_COMPONENTS.find((c) => c.id === id);

  const [activeTab, setActiveTab] = useState<TabId>('overview');

  const favorites = useUiStore((s) => s.favorites);
  const toggleFavorite = useUiStore((s) => s.toggleFavorite);
  const favorited = component ? favorites.includes(component.id) : false;

  if (!component) {
    notFound();
    return null;
  }

  const componentId = component.id;

  const handleCopy = async (text: string, label: string) => {
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(text);
      } else {
        // Fallback for non-secure contexts
        const textarea = document.createElement('textarea');
        textarea.value = text;
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';
        document.body.appendChild(textarea);
        textarea.select();
        const ok = document.execCommand('copy');
        document.body.removeChild(textarea);
        if (!ok) throw new Error('execCommand copy failed');
      }
      toast.success(`${label}已复制`);
    } catch (err) {
      toast.error(`${label}复制失败：请手动选择复制`);
    }
  };

  const handleExport = () => {
    // 与列表批量导出一致：完整元数据
    const data = {
      id: component.id,
      name: component.name,
      subtype: component.subtype,
      strain: component.strain,
      ipNumber: component.ipNumber,
      ipStatus: component.ipStatus,
      riskLevel: component.riskLevel,
      sequenceType: component.sequenceType,
      sequence: component.sequence,
      pdbId: component.pdbId,
      molecularWeight: component.molecularWeight,
      pi: component.pi,
      gcContent: component.gcContent,
      tags: component.tags,
      neutralizationData: component.neutralizationData,
      dbtlSteps: component.dbtlSteps,
      references: component.references,
      createdAt: component.createdAt,
      updatedAt: component.updatedAt,
      owner: component.owner,
      community: component.community,
      // Gold Award Enhancement Fields
      biosafetyLevel: component.biosafetyLevel,
      license: component.license,
      dualUse: component.dualUse,
      dualUseType: component.dualUseType,
      ispVerified: component.ispVerified
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${component.id}_full_export.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('元件信息（含完整元数据）已导出');
  };

  const handleToggleFavorite = () => {
    toggleFavorite(component.id);
    toast.success(favorited ? '已取消收藏' : '已加入收藏');
  };

  const stats = [
    {
      icon: Layers,
      label: '分子量',
      value: component.molecularWeight
        ? `${(component.molecularWeight / 1000).toFixed(1)} kDa`
        : 'N/A'
    },
    {
      icon: TrendingUp,
      label: '等电点 pI',
      value: component.pi?.toString() || 'N/A'
    },
    {
      icon: Activity,
      label: 'GC 含量',
      value: component.gcContent ? `${component.gcContent}%` : 'N/A'
    },
    {
      icon: Box,
      label: 'PDB ID',
      value: component.pdbId || 'N/A',
      mono: true
    }
  ];

  return (
    <div className="px-4 lg:px-8 py-5 lg:py-7">
      <nav className="flex items-center gap-2 text-xs font-mono text-text-tertiary mb-5">
        <Link href="/" className="hover:text-text-secondary transition">~/</Link>
        <ChevronRight className="w-3 h-3" />
        <Link href="/database" className="hover:text-text-secondary transition">
          database
        </Link>
        <ChevronRight className="w-3 h-3" />
        <span className="text-bio-200">{component.id}</span>
      </nav>

      <div className="panel-strong p-6 lg:p-7 mb-6 relative overflow-hidden">
        <div className="absolute -top-20 -right-20 w-72 h-72 rounded-full bg-compute-500/20 blur-3xl pointer-events-none" />
        <div className="grid lg:grid-cols-[1.6fr_1fr] gap-6 relative">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-3">
              <span className="chip">
                <Database className="w-3 h-3" />
                {component.id}
              </span>
              {component.community && (
                <span className="badge badge-success">社区贡献</span>
              )}
              <span className="badge badge-info">{component.sequenceType}</span>
              {favorited && (
                <span className="badge badge-warning">
                  <Heart className="w-3 h-3 fill-alert-400 text-alert-400" />
                  已收藏
                </span>
              )}
            </div>
            <h1 className="text-2xl lg:text-3xl font-bold text-white mb-3">
              {component.name}
            </h1>
            <p className="text-text-secondary leading-relaxed">{component.description}</p>

            <div className="mt-5 grid grid-cols-2 md:grid-cols-4 gap-3">
              <MetaItem icon={Tag} label="亚型" value={component.subtype} />
              <MetaItem icon={Activity} label="菌株" value={component.strain} />
              <MetaItem icon={Building2} label="所有者" value={component.owner} />
              <MetaItem icon={Calendar} label="更新日期" value={component.updatedAt} />
            </div>
          </div>

          <div className="panel p-5">
            <IPStatusBadge
              status={component.ipStatus}
              riskLevel={component.riskLevel}
              ipNumber={component.ipNumber}
              size="lg"
            />
            <div className="mt-4 grid grid-cols-2 gap-2">
              <button
                onClick={handleToggleFavorite}
                className={`btn-secondary text-xs ${
                  favorited ? 'border-alert-400/60 text-alert-200' : ''
                }`}
              >
                <Heart className={`w-4 h-4 ${favorited ? 'fill-alert-400 text-alert-400' : ''}`} />
                {favorited ? '已收藏' : '收藏'}
              </button>
              <button onClick={handleExport} className="btn-primary text-xs">
                <Download className="w-4 h-4" />
                导出
              </button>
              <button
                onClick={() => handleCopy(component.id, '元件 ID')}
                className="btn-secondary text-xs col-span-2"
              >
                <Share2 className="w-4 h-4" />
                分享 / 复制 ID
              </button>
            </div>

            <div className="mt-4 pt-4 border-t border-white/5 space-y-2 text-xs">
              <Link
                href={`/analysis?module=scfv&component=${encodeURIComponent(componentId)}`}
                className="flex items-center justify-between text-text-secondary hover:text-white"
              >
                <span className="flex items-center gap-2">
                  <Sparkles className="w-3.5 h-3.5 text-bio-300" />
                  启动 scFv 突变筛选
                </span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
              <Link
                href={`/analysis?module=multiomics&component=${encodeURIComponent(componentId)}`}
                className="flex items-center justify-between text-text-secondary hover:text-white"
              >
                <span className="flex items-center gap-2">
                  <Activity className="w-3.5 h-3.5 text-compute-300" />
                  多组学 / BLAST
                </span>
                <Play className="w-3.5 h-3.5" />
              </Link>
              <Link
                href={`/analysis?module=circuit&component=${encodeURIComponent(componentId)}`}
                className="flex items-center justify-between text-text-secondary hover:text-white"
              >
                <span className="flex items-center gap-2">
                  <ShieldCheck className="w-3.5 h-3.5 text-glow-300" />
                  回路仿真 / IP 风险复核
                </span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        {stats.map((s) => {
          const Icon = s.icon;
          return (
            <div key={s.label} className="panel px-4 py-3">
              <div className="flex items-center gap-2 text-text-tertiary text-[10px] font-mono tracking-[0.24em] uppercase">
                <Icon className="w-3 h-3" />
                {s.label}
              </div>
              <div
                className={`mt-1 text-lg font-semibold text-white ${
                  s.mono ? 'font-mono' : ''
                }`}
              >
                {s.value}
              </div>
            </div>
          );
        })}
      </div>

      <div className="panel-strong overflow-hidden">
        <div className="border-b border-white/5 px-2 overflow-x-auto">
          <div className="flex">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const active = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`relative flex items-center gap-2 px-5 py-4 text-sm font-medium transition whitespace-nowrap ${
                    active
                      ? 'text-white'
                      : 'text-text-secondary hover:text-white'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                  <span className="text-[9px] font-mono tracking-[0.18em] uppercase text-text-tertiary">
                    {tab.sub}
                  </span>
                  {active && (
                    <span className="absolute left-3 right-3 -bottom-px h-0.5 rounded-full bg-gradient-to-r from-compute-500 via-bio-400 to-glow-400 shadow-glow-sm" />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        <div className="p-5 lg:p-7">
          {activeTab === 'overview' && <OverviewTab component={component} />}
          {activeTab === 'sequence' && (
            <SequenceTab
              component={component}
              onCopy={() => handleCopy(component.sequence, '序列')}
            />
          )}
          {activeTab === 'structure' && <StructureTab component={component} />}
          {activeTab === 'dbtl' && <DBTLTab component={component} />}
          {activeTab === 'references' && <ReferencesTab component={component} />}
        </div>
      </div>
    </div>
  );
}

function MetaItem({
  icon: Icon,
  label,
  value
}: {
  icon: any;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-2">
      <Icon className="w-4 h-4 text-text-tertiary mt-0.5 flex-shrink-0" />
      <div className="min-w-0">
        <div className="text-[10px] font-mono tracking-[0.18em] uppercase text-text-tertiary">
          {label}
        </div>
        <div className="text-sm font-medium text-white truncate">{value}</div>
      </div>
    </div>
  );
}

function OverviewTab({ component }: { component: Component }) {
  return (
    <div className="grid lg:grid-cols-[1.55fr_1fr] gap-6">
      <div className="space-y-5">
        {component.neutralizationData.length > 0 && (
          <div className="panel p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="text-[10px] font-mono tracking-[0.24em] uppercase text-text-tertiary">
                NEUTRALIZATION CURVE · 中和效价
              </div>
              <span className="badge badge-success">基础模型 · 待湿实验验证</span>
            </div>
            <DeepChart
              option={{
                grid: { top: 20, right: 16, bottom: 40, left: 50 },
                tooltip: { trigger: 'axis' },
                xAxis: {
                  type: 'log',
                  name: '浓度 (nM)',
                  nameLocation: 'middle',
                  nameGap: 28,
                  nameTextStyle: { color: '#9BA8D0', fontSize: 11 },
                  data: component.neutralizationData.map((d) => d.concentration),
                  axisLabel: { color: '#6A77A8', fontSize: 10 },
                  axisLine: { lineStyle: { color: 'rgba(155,168,208,0.18)' } }
                },
                yAxis: {
                  type: 'value',
                  max: 100,
                  name: '抑制率 (%)',
                  nameTextStyle: { color: '#9BA8D0', fontSize: 11 },
                  axisLabel: { color: '#6A77A8' },
                  splitLine: { lineStyle: { color: 'rgba(155,168,208,0.08)' } }
                },
                series: [
                  {
                    name: '抑制率',
                    type: 'line',
                    smooth: true,
                    data: component.neutralizationData.map((d) => d.inhibition),
                    lineStyle: { color: '#16BFDB', width: 2 },
                    itemStyle: { color: '#16BFDB' },
                    areaStyle: {
                      color: {
                        type: 'linear',
                        x: 0,
                        y: 0,
                        x2: 0,
                        y2: 1,
                        colorStops: [
                          { offset: 0, color: 'rgba(22,191,219,0.35)' },
                          { offset: 1, color: 'rgba(22,191,219,0)' }
                        ]
                      }
                    }
                  }
                ]
              }}
              height={260}
            />
          </div>
        )}

        <div className="panel p-4">
          <div className="text-[10px] font-mono tracking-[0.24em] uppercase text-text-tertiary mb-2">
            TAGS
          </div>
          <div className="flex flex-wrap gap-2">
            {component.tags.map((tag) => (
              <span key={tag} className="badge badge-neutral">
                {tag}
              </span>
            ))}
          </div>
        </div>

        <div className="panel p-4">
          <div className="text-[10px] font-mono tracking-[0.24em] uppercase text-text-tertiary mb-2">
            DESCRIPTION
          </div>
          <p className="text-text-secondary text-sm leading-relaxed">
            {component.description}
          </p>
        </div>
      </div>

      <div className="space-y-4">
        <div className="panel p-5">
          <div className="text-[10px] font-mono tracking-[0.24em] uppercase text-text-tertiary mb-3">
            KEY METRICS
          </div>
          <dl className="space-y-3 text-sm">
            {component.molecularWeight && (
              <div className="flex justify-between">
                <dt className="text-text-tertiary">分子量</dt>
                <dd className="font-mono text-white">
                  {(component.molecularWeight / 1000).toFixed(1)} kDa
                </dd>
              </div>
            )}
            {component.pi && (
              <div className="flex justify-between">
                <dt className="text-text-tertiary">等电点</dt>
                <dd className="font-mono text-white">{component.pi}</dd>
              </div>
            )}
            {component.gcContent && (
              <div className="flex justify-between">
                <dt className="text-text-tertiary">GC 含量</dt>
                <dd className="font-mono text-white">{component.gcContent}%</dd>
              </div>
            )}
            <div className="flex justify-between">
              <dt className="text-text-tertiary">序列长度</dt>
              <dd className="font-mono text-white">
                {component.sequence.length.toLocaleString()}
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-text-tertiary">创建日期</dt>
              <dd className="font-mono text-white">{component.createdAt}</dd>
            </div>
          </dl>
        </div>

        <div className="panel p-5">
          <div className="text-[10px] font-mono tracking-[0.24em] uppercase text-text-tertiary mb-3">
            RELATED ACTIONS
          </div>
          <div className="space-y-1.5">
            {[
              { label: '运行 scFv 突变筛选', icon: Sparkles, module: 'scfv' },
              { label: '多组学 / BLAST', icon: Activity, module: 'multiomics' },
              { label: '回路动力学仿真', icon: GitBranch, module: 'circuit' }
            ].map((it) => {
              const Icon = it.icon;
              return (
                <Link
                  key={it.label}
                  href={`/analysis?module=${it.module}&component=${encodeURIComponent(component.id)}`}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-text-secondary hover:text-white hover:bg-ink-800/70"
                >
                  <Icon className="w-4 h-4 text-bio-300" />
                  <span className="flex-1">{it.label}</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

function SequenceTab({
  component,
  onCopy
}: {
  component: Component;
  onCopy: () => void;
}) {
  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div>
          <div className="text-[10px] font-mono tracking-[0.24em] uppercase text-text-tertiary">
            SEQUENCE · {component.sequenceType}
          </div>
          <div className="text-sm text-text-secondary mt-1">
            长度:{' '}
            <span className="font-mono text-white">
              {component.sequence.length.toLocaleString()}
            </span>{' '}
            bp/aa · 复制即用
          </div>
        </div>
        <button onClick={onCopy} className="btn-secondary text-xs">
          <Copy className="w-4 h-4" />
          复制全部
        </button>
      </div>
      <SequenceViewer sequence={component.sequence} type={component.sequenceType as any} />
    </div>
  );
}

function StructureTab({ component }: { component: Component }) {
  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div>
          <div className="text-[10px] font-mono tracking-[0.24em] uppercase text-text-tertiary">
            3D STRUCTURE · PROTEIN VIEWER
          </div>
          <div className="text-sm text-text-secondary mt-1">
            {component.pdbId
              ? `PDB: ${component.pdbId} · 实验 / AlphaFold`
              : '暂无 PDB · 下阶段接入 Mol*'}
          </div>
        </div>
        <span className="badge badge-warning">
          <AlertTriangle className="w-3 h-3" />
          演示视图
        </span>
      </div>

      <div className="mb-4 panel px-4 py-2.5 text-[11px] text-text-secondary flex items-start gap-2">
        <Info className="w-3.5 h-3.5 text-compute-300 mt-0.5 flex-shrink-0" />
        <span>
          <span className="font-semibold text-white">演示模式</span>：当前为 SVG 演示视图（CSS/SVG 渲染）。
          真实 PDB 集成规划中 · 现阶段可用 RCSB 链接（右上角下载按钮）查看真实结构。
        </span>
      </div>

      <ProteinViewer3D pdbId={component.pdbId} height="520px" />
    </div>
  );
}

function DBTLTab({ component }: { component: Component }) {
  return (
    <div>
      <div className="mb-5">
        <div className="text-[10px] font-mono tracking-[0.24em] uppercase text-text-tertiary">
          DBTL CYCLE
        </div>
        <h2 className="text-lg font-semibold text-white mt-1">DBTL 完整周期</h2>
        <p className="text-sm text-text-secondary mt-1">
          设计 - 构建 - 测试 - 学习循环，记录本元件的迭代优化历史
        </p>
      </div>
      <DBTLTimeline steps={component.dbtlSteps} />
    </div>
  );
}

function ReferencesTab({ component }: { component: Component }) {
  return (
    <div>
      <div className="mb-4">
        <div className="text-[10px] font-mono tracking-[0.24em] uppercase text-text-tertiary">
          CITATIONS
        </div>
        <h2 className="text-lg font-semibold text-white mt-1">引用文献</h2>
      </div>
      <div className="space-y-3">
        {component.references.map((ref, idx) => (
          <div
            key={idx}
            className="panel p-4 hover:border-compute-500/40 transition"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <h3 className="font-medium text-white mb-1">{ref.title}</h3>
                <p className="text-sm text-text-secondary mb-2">
                  {ref.authors.join(', ')} ·{' '}
                  <span className="italic">{ref.journal}</span> · {ref.year}
                </p>
                <p className="text-xs font-mono text-bio-200">DOI: {ref.doi}</p>
              </div>
              <a
                href={`https://doi.org/${ref.doi}`}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-secondary text-xs"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                查看
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
