'use client';

import { useState, useMemo } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { ChevronRight, Recycle, Droplet, Beaker, TrendingUp, TreePine } from 'lucide-react';

const ReactECharts = dynamic(() => import('echarts-for-react').then((m) => m.default), {
  ssr: false,
  loading: () => <div style={{ width: '100%', height: 280, background: 'rgba(11,16,32,0.6)', borderRadius: 12 }} />
});

interface BioremediationPathway {
  id: string;
  name: string;
  substrate: string;
  organism: string;
  enzyme: string;
  efficiency: number; // %
  yearDiscovered: number;
  application: string;
}

const BIOREMEDIATION_PATHWAYS: BioremediationPathway[] = [
  {
    id: 'petase',
    name: 'PET 塑料降解',
    substrate: 'PET (聚对苯二甲酸乙二醇酯)',
    organism: 'Ideonella sakaiensis',
    enzyme: 'PETase + MHETase',
    efficiency: 85,
    yearDiscovered: 2016,
    application: '塑料废弃物生物降解 · 循环经济'
  },
  {
    id: 'laccase',
    name: '木质素降解',
    substrate: '木质素 / 木质纤维素',
    organism: 'Phanerochaete chrysosporium',
    enzyme: 'Laccase + LiP + MnP',
    efficiency: 70,
    yearDiscovered: 1983,
    application: '生物质能源转化 · 造纸工业'
  },
  {
    id: 'mercury',
    name: '汞离子还原',
    substrate: 'Hg²⁺ (甲基汞)',
    organism: 'Pseudomonas putida',
    enzyme: 'MerA (汞还原酶)',
    efficiency: 92,
    yearDiscovered: 1960,
    application: '重金属污染水体修复'
  },
  {
    id: 'petroleum',
    name: '石油烃降解',
    substrate: 'CₙH₂ₙ₊₂ (烷烃)',
    organism: 'Alcanivorax borkumensis',
    enzyme: 'AlkB (烷烃羟化酶)',
    efficiency: 78,
    yearDiscovered: 1998,
    application: '海洋石油泄漏处理'
  },
  {
    id: 'pfas',
    name: 'PFAS 降解 (前沿)',
    substrate: 'PFOA / PFOS (全氟化合物)',
    organism: 'Acidimicrobium sp. (候选)',
    enzyme: 'PPX + CmpF (假想酶)',
    efficiency: 45,
    yearDiscovered: 2023,
    application: '永久性化学品去除'
  }
];

export default function EnvironmentPage() {
  const [selectedPathway, setSelectedPathway] = useState<BioremediationPathway>(BIOREMEDIATION_PATHWAYS[0]);

  // Carbon reduction chart data
  const carbonReductionData = useMemo(() => {
    return [
      { year: 2024, biotech: 5, chemical: 95 },
      { year: 2025, biotech: 12, chemical: 88 },
      { year: 2026, biotech: 22, chemical: 78 },
      { year: 2027, biotech: 35, chemical: 65 },
      { year: 2028, biotech: 48, chemical: 52 },
      { year: 2029, biotech: 62, chemical: 38 },
      { year: 2030, biotech: 75, chemical: 25 }
    ];
  }, []);

  return (
    <div className="px-4 lg:px-8 py-5 lg:py-7 space-y-6">
      <nav className="flex items-center gap-2 text-xs font-mono text-text-tertiary">
        <Link href="/" className="hover:text-text-secondary transition">~/</Link>
        <ChevronRight className="w-3 h-3" />
        <span className="text-bio-200">environment</span>
      </nav>

      <div>
        <div className="text-[10px] font-mono tracking-[0.24em] uppercase text-text-tertiary">
          ENVIRONMENTAL BIOREMEDIATION · 环境生物修复
        </div>
        <h1 className="text-2xl lg:text-3xl font-bold text-white mt-1.5">
          工程菌与环境修复 <span className="gradient-text">绿色合成生物学</span>
        </h1>
        <p className="mt-2 text-text-secondary text-sm">
          展示合成生物学在环境治理中的应用 · 5 类核心降解通路 · 碳中和场景模拟
        </p>
      </div>

      {/* Pathway Grid */}
      <div className="grid lg:grid-cols-3 gap-3">
        {BIOREMEDIATION_PATHWAYS.map(p => (
          <button
            key={p.id}
            onClick={() => setSelectedPathway(p)}
            className={`text-left panel p-4 transition ${
              selectedPathway.id === p.id
                ? 'border-bio-500/60 bg-bio-500/5'
                : 'hover:border-white/20'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <Recycle size={18} className="text-bio-300" />
              <span className="text-[10px] font-mono text-text-tertiary">{p.yearDiscovered}</span>
            </div>
            <h3 className="text-sm font-semibold text-white mb-1">{p.name}</h3>
            <p className="text-xs text-text-secondary">{p.substrate}</p>
            <div className="mt-3">
              <div className="flex items-center justify-between text-[10px] font-mono text-text-tertiary mb-1">
                <span>降解效率</span>
                <span className="text-bio-200">{p.efficiency}%</span>
              </div>
              <div className="h-1.5 rounded-full bg-white/5 overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-bio-500 to-glow-500"
                  style={{ width: `${p.efficiency}%` }}
                />
              </div>
            </div>
          </button>
        ))}
      </div>

      {/* Selected Pathway Detail */}
      <div className="panel-strong p-5">
        <div className="grid lg:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <div className="text-[10px] font-mono tracking-[0.18em] uppercase text-text-tertiary">PATHWAY DETAIL</div>
              <h2 className="text-xl font-bold text-white mt-1">{selectedPathway.name}</h2>
              <p className="text-sm text-text-secondary mt-2">{selectedPathway.application}</p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="panel p-3">
                <div className="text-[10px] font-mono text-text-tertiary uppercase tracking-wider">底物</div>
                <div className="text-sm text-white mt-1">{selectedPathway.substrate}</div>
              </div>
              <div className="panel p-3">
                <div className="text-[10px] font-mono text-text-tertiary uppercase tracking-wider">底盘菌</div>
                <div className="text-sm text-white mt-1 italic">{selectedPathway.organism}</div>
              </div>
              <div className="panel p-3">
                <div className="text-[10px] font-mono text-text-tertiary uppercase tracking-wider">关键酶</div>
                <div className="text-sm text-white mt-1 font-mono">{selectedPathway.enzyme}</div>
              </div>
              <div className="panel p-3">
                <div className="text-[10px] font-mono text-text-tertiary uppercase tracking-wider">发现年份</div>
                <div className="text-sm text-white mt-1">{selectedPathway.yearDiscovered}</div>
              </div>
            </div>
          </div>

          {/* Efficiency Chart */}
          <div className="panel p-4">
            <div className="text-[10px] font-mono tracking-[0.18em] uppercase text-text-tertiary mb-2">
              DEGRADATION EFFICIENCY
            </div>
            <ReactECharts
              option={{
                series: [{
                  type: 'gauge',
                  startAngle: 90,
                  endAngle: -270,
                  pointer: { show: false },
                  progress: { show: true, overlap: false, roundCap: true, clip: false },
                  axisLine: { lineStyle: { width: 20, color: [[1, '#16BFDB']] } },
                  splitLine: { show: false },
                  axisTick: { show: false },
                  axisLabel: { show: false },
                  data: [{ value: selectedPathway.efficiency, detail: { fontSize: 32, color: '#16D88A', formatter: '{value}%' } }],
                  detail: { show: true, offsetCenter: ['0', '0%'], formatter: '{value}%', fontSize: 32, color: '#16D88A' }
                }]
              }}
              style={{ width: '100%', height: 240 }}
              opts={{ renderer: 'canvas' }}
              theme="dark"
            />
          </div>
        </div>
      </div>

      {/* Carbon Neutrality Forecast */}
      <div className="panel-strong p-5">
        <div className="flex items-center gap-2 mb-3">
          <TreePine className="w-5 h-5 text-glow-300" />
          <h2 className="text-base font-semibold text-white">碳中和路线图 · 生物制造替代石油化工</h2>
        </div>
        <p className="text-xs text-text-secondary mb-4">
          基于 FluBioStack 工程菌的生物制造工艺，预计到 2030 年可替代 75% 的石油化工生产，减少碳排放 30% 以上。
        </p>
        <ReactECharts
          option={{
            grid: { top: 30, right: 16, bottom: 40, left: 60 },
            tooltip: { trigger: 'axis', backgroundColor: 'rgba(8,11,23,0.95)', borderColor: '#7E3AFF' },
            legend: { data: ['生物制造', '石油化工'], textStyle: { color: '#9BA8D0' }, top: 0 },
            xAxis: { type: 'category', data: carbonReductionData.map(d => d.year.toString()), axisLabel: { color: '#6A77A8' } },
            yAxis: { type: 'value', name: '占比 (%)', nameTextStyle: { color: '#9BA8D0' }, axisLabel: { color: '#6A77A8' }, splitLine: { lineStyle: { color: 'rgba(155,168,208,0.08)' } } },
            series: [
              { name: '生物制造', type: 'bar', stack: 'a', data: carbonReductionData.map(d => d.biotech), itemStyle: { color: '#16D88A' } },
              { name: '石油化工', type: 'bar', stack: 'a', data: carbonReductionData.map(d => d.chemical), itemStyle: { color: '#FF9A1F' } }
            ]
          }}
          style={{ width: '100%', height: 320 }}
          opts={{ renderer: 'canvas' }}
          theme="dark"
        />
      </div>
    </div>
  );
}
