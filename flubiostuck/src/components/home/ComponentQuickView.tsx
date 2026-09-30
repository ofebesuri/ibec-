'use client';

import Link from 'next/link';
import {
  Activity,
  Box,
  Calendar,
  ChevronRight,
  Database,
  ExternalLink,
  Layers,
  ShieldCheck,
  Sparkles,
  Tag,
  TrendingUp
} from 'lucide-react';
import { Component } from '@/lib/demoData';
import { IPStatusBadge } from '@/components/ui/IPStatusBadge';
import { ProteinViewer3D } from '@/components/visualization/ProteinViewer3D';

interface ComponentQuickViewProps {
  component: Component;
  /** close drawer callback */
  onClose?: () => void;
}

/**
 * 右侧抽屉中的元件快览。从 demoData 渲染，避免再次请求详情 API。
 */
export function ComponentQuickView({ component, onClose }: ComponentQuickViewProps) {
  return (
    <div className="px-5 py-5 space-y-4">
      <div>
        <div className="flex flex-wrap items-center gap-2 mb-2">
          <span className="chip">
            <Database className="w-3 h-3" />
            {component.id}
          </span>
          {component.community && <span className="badge badge-success text-[10px]">社区贡献</span>}
          <span className="badge badge-info text-[10px]">{component.sequenceType}</span>
        </div>
        <h3 className="text-base font-semibold text-white leading-snug">{component.name}</h3>
        <p className="text-xs text-text-secondary mt-1.5 leading-relaxed">{component.description}</p>
      </div>

      <div className="grid grid-cols-2 gap-2 text-xs">
        <MetaPill icon={Tag} label="亚型" value={component.subtype} />
        <MetaPill icon={Activity} label="菌株" value={component.strain} truncate />
        <MetaPill icon={Calendar} label="更新" value={component.updatedAt} />
        <MetaPill icon={Layers} label="长度" value={`${component.sequence.length.toLocaleString()} bp/aa`} />
      </div>

      <div className="panel p-3">
        <IPStatusBadge
          status={component.ipStatus}
          riskLevel={component.riskLevel}
          ipNumber={component.ipNumber}
          size="md"
        />
      </div>

      <div className="h-56">
        <ProteinViewer3D pdbId={component.pdbId} height="220px" />
      </div>

      <div className="grid grid-cols-3 gap-2">
        <Stat label="分子量" value={component.molecularWeight ? `${(component.molecularWeight / 1000).toFixed(1)} kDa` : 'N/A'} />
        <Stat label="等电点" value={component.pi ? String(component.pi) : 'N/A'} />
        <Stat label="GC%" value={component.gcContent ? `${component.gcContent}%` : 'N/A'} />
      </div>

      <div className="flex flex-wrap gap-2">
        {component.tags.slice(0, 6).map((t) => (
          <span key={t} className="badge badge-neutral text-[10px]">
            #{t}
          </span>
        ))}
      </div>

      <div className="border-t border-white/5 pt-4 space-y-1.5">
        <DetailLinkRow
          icon={Sparkles}
          label="启动 scFv 突变筛选"
          href={`/analysis?module=scfv&component=${encodeURIComponent(component.id)}`}
          onClose={onClose}
        />
        <DetailLinkRow
          icon={Activity}
          label="BLAST 序列比对"
          href={`/analysis?module=multiomics&component=${encodeURIComponent(component.id)}`}
          onClose={onClose}
        />
        <DetailLinkRow
          icon={TrendingUp}
          label="查看完整详情"
          href={`/database/${component.id}`}
          onClose={onClose}
        />
      </div>
    </div>
  );
}

function MetaPill({
  icon: Icon,
  label,
  value,
  truncate
}: {
  icon: any;
  label: string;
  value: string;
  truncate?: boolean;
}) {
  return (
    <div className="panel px-3 py-2">
      <div className="text-[10px] font-mono tracking-[0.16em] uppercase text-text-tertiary flex items-center gap-1">
        <Icon className="w-3 h-3" />
        {label}
      </div>
      <div className={`mt-0.5 text-xs text-white ${truncate ? 'truncate' : ''}`}>{value}</div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="panel px-2 py-2 text-center">
      <div className="text-[10px] font-mono tracking-[0.16em] uppercase text-text-tertiary">{label}</div>
      <div className="mt-0.5 text-sm font-mono text-white">{value}</div>
    </div>
  );
}

function DetailLinkRow({
  icon: Icon,
  label,
  href,
  onClose
}: {
  icon: any;
  label: string;
  href: string;
  onClose?: () => void;
}) {
  return (
    <Link
      href={href}
      onClick={onClose}
      className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm text-text-secondary hover:text-white hover:bg-ink-800/70 border border-transparent hover:border-compute-500/40"
    >
      <Icon className="w-4 h-4 text-bio-300" />
      <span className="flex-1">{label}</span>
      <ChevronRight className="w-3.5 h-3.5" />
    </Link>
  );
}
