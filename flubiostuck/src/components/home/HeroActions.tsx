'use client';

import Link from 'next/link';
import { Activity, Database, Rocket, Users } from 'lucide-react';

/**
 * HeroActions - 右下角快捷入口（图标按钮横排）
 * 替代之前的 4 文字按钮列堆叠
 */
export function HeroActions() {
  return (
    <div className="flex items-center gap-1.5 z-[5] pointer-events-auto">
      <Link
        href="/analysis"
        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-[11px] font-mono text-white border border-compute-500/50 bg-compute-500/15 hover:bg-compute-500/30 transition btn-shine"
        title="启动分析"
      >
        <Rocket className="w-3.5 h-3.5" />
        启动分析
      </Link>
      <div className="flex items-center gap-1 px-2 py-1 rounded-md border border-white/10 bg-ink-900/95">
        <Link href="/database" className="hero-action-icon" title="元件数据库">
          <Database className="w-3.5 h-3.5" />
        </Link>
        <Link href="/benchmark" className="hero-action-icon" title="FluBench">
          <Activity className="w-3.5 h-3.5" />
        </Link>
        <Link href="/community" className="hero-action-icon" title="iGEM 社区">
          <Users className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
}
