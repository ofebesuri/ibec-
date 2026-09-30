'use client';

import { useState } from 'react';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { ChevronRight, ShieldCheck, AlertTriangle, FileCheck, BookOpen, ExternalLink, Sparkles } from 'lucide-react';
import { SafetyChecklist, DualUseAlert, BioSafetyBadge } from '@/components/ui/BioSafetyBadge';
import { ExportPanel } from '@/components/ui/ExportPanel';

export default function SafetyReviewPage() {
  const [passed, setPassed] = useState(false);
  const [selectedDualUse, setSelectedDualUse] = useState<string | null>(null);

  const DURC_CATEGORIES = [
    {
      type: 'TOXIN',
      title: '毒素生成 (Toxins)',
      description: '可能增强或创造新型生物毒素的元件',
      risk: 'high',
      examples: ['肉毒杆菌毒素', '破伤风毒素', '蓖麻毒素']
    },
    {
      type: 'PATHOGENICITY',
      title: '致病性增强 (Enhanced Pathogenicity)',
      description: '增强现有病原体毒力或传播能力的基因改造',
      risk: 'high',
      examples: ['毒力因子表达上调', '宿主范围扩展']
    },
    {
      type: 'ANTIBIOTIC_RESISTANCE',
      title: '抗生素耐药性 (Antibiotic Resistance)',
      description: '可向其他微生物转移耐药性的元件',
      risk: 'medium',
      examples: ['NDM-1', 'MCR-1', 'ESBL']
    },
    {
      type: 'GENE_DRIVE',
      title: '基因驱动 (Gene Drive)',
      description: '可能改变野生种群遗传构成的基因驱动系统',
      risk: 'high',
      examples: ['CRISPR-based gene drive', 'Medea elements']
    }
  ];

  const GUIDELINES = [
    {
      title: 'iGEM Safety Policies',
      description: 'iGEM 2024 安全与责任政策',
      url: 'https://igem.org/safety',
      icon: '🛡️'
    },
    {
      title: 'WHO Laboratory Biosafety Manual',
      description: 'WHO 实验室生物安全手册 (4th ed.)',
      url: 'https://www.who.int/publications/i/item/9789240011311',
      icon: '📘'
    },
    {
      title: 'NIH Guidelines for Research Involving Recombinant DNA',
      description: '美国国立卫生研究院重组 DNA 研究指南',
      url: 'https://osp.od.nih.gov/policies/biosafety-and-biosecurity-policy/',
      icon: '📋'
    },
    {
      title: 'Chinese Biosafety Law (2021)',
      description: '中华人民共和国生物安全法',
      url: 'http://www.npc.gov.cn/npc/c30834/202101/df71af6a98dd43a4ba7e2e2c8c1d3f10.shtml',
      icon: '🇨🇳'
    }
  ];

  return (
    <div className="px-4 lg:px-8 py-5 lg:py-7 space-y-6">
      <nav className="flex items-center gap-2 text-xs font-mono text-text-tertiary">
        <Link href="/" className="hover:text-text-secondary transition">~/</Link>
        <ChevronRight className="w-3 h-3" />
        <span className="text-bio-200">safety-review</span>
      </nav>

      <div>
        <div className="text-[10px] font-mono tracking-[0.24em] uppercase text-text-tertiary">
          BIOSAFETY & ETHICS · v2026.09.20
        </div>
        <h1 className="text-2xl lg:text-3xl font-bold text-white mt-1.5">
          生物安全与伦理审查 <span className="gradient-text">Safe by Design</span>
        </h1>
        <p className="mt-2 text-text-secondary text-sm">
          FluBioStack 严格遵守国际生物安全标准 · 内置 DURC 警示 · 8 项强制自评估检查项
        </p>
      </div>

      {/* Key Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="panel-strong p-4">
          <ShieldCheck className="w-5 h-5 text-bio-300" />
          <div className="text-[10px] font-mono text-text-tertiary uppercase tracking-wider mt-2">安全评级</div>
          <div className="text-2xl font-bold text-white mt-1">BSL 1-3</div>
          <div className="text-[10px] text-text-tertiary mt-1">覆盖全等级</div>
        </div>
        <div className="panel-strong p-4">
          <AlertTriangle className="w-5 h-5 text-alert-300" />
          <div className="text-[10px] font-mono text-text-tertiary uppercase tracking-wider mt-2">DURC 监控</div>
          <div className="text-2xl font-bold text-white mt-1">4 类</div>
          <div className="text-[10px] text-text-tertiary mt-1">双用途研究类别</div>
        </div>
        <div className="panel-strong p-4">
          <FileCheck className="w-5 h-5 text-glow-300" />
          <div className="text-[10px] font-mono text-text-tertiary uppercase tracking-wider mt-2">自评估</div>
          <div className="text-2xl font-bold text-white mt-1">8 项</div>
          <div className="text-[10px] text-text-tertiary mt-1">强制检查项</div>
        </div>
        <div className="panel-strong p-4">
          <BookOpen className="w-5 h-5 text-compute-300" />
          <div className="text-[10px] font-mono text-text-tertiary uppercase tracking-wider mt-2">合规文档</div>
          <div className="text-2xl font-bold text-white mt-1">100%</div>
          <div className="text-[10px] text-text-tertiary mt-1">符合国际标准</div>
        </div>
      </div>

      {/* DURC Categories */}
      <div className="panel-strong p-5">
        <div className="flex items-center gap-2 mb-3">
          <Sparkles size={16} className="text-bio-300" />
          <h2 className="text-base font-semibold text-white">双用途研究关注 (DURC) 类别</h2>
        </div>
        <p className="text-xs text-text-secondary mb-4">
          Dual Use Research of Concern (DURC) 指同时具有合法科学用途和潜在危害的生物研究。以下四类会自动触发伦理审查警告。
        </p>
        <div className="grid lg:grid-cols-2 gap-3">
          {DURC_CATEGORIES.map((cat) => {
            const isSelected = selectedDualUse === cat.type;
            return (
              <button
                key={cat.type}
                onClick={() => setSelectedDualUse(isSelected ? null : cat.type)}
                className="text-left panel p-4 hover:border-alert-400/60 transition"
                style={{ borderColor: isSelected ? '#FF9A1F' : undefined }}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold text-white text-sm">{cat.title}</span>
                      <BioSafetyBadge level={cat.risk === 'high' ? 'BSL-3' : 'BSL-2'} showLabel={false} size="sm" />
                    </div>
                    <p className="text-xs text-text-secondary mb-2">{cat.description}</p>
                    <div className="flex flex-wrap gap-1">
                      {cat.examples.map(ex => (
                        <span key={ex} className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-white/5 text-text-tertiary">
                          {ex}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {selectedDualUse && (
          <div className="mt-4">
            <DualUseAlert
              geneName={`示例元件-${selectedDualUse}`}
              riskType={selectedDualUse}
              description={`检测到 ${selectedDualUse} 类型风险元件。请确保已获得伦理委员会批准，并采取相应的 BSL 防护措施。`}
              onAcknowledge={() => toast.success('已确认风险提示')}
              onReviewGuidelines={() => window.open('https://igem.org/safety', '_blank')}
            />
          </div>
        )}
      </div>

      {/* Pre-upload Checklist */}
      <div className="panel-strong p-5">
        <h2 className="text-base font-semibold text-white mb-3">上传前安全自评估</h2>
        <p className="text-xs text-text-secondary mb-4">
          所有 FluBioStack 用户在上传新元件前必须完成以下 8 项自评估。这是 iGEM 安全委员会和 WHO 推荐的尽职调查流程。
        </p>
        <SafetyChecklist onComplete={(p) => setPassed(p)} />
      </div>

      {/* International Guidelines */}
      <div className="panel-strong p-5">
        <h2 className="text-base font-semibold text-white mb-3">国际生物安全指南</h2>
        <p className="text-xs text-text-secondary mb-4">
          FluBioStack 安全框架参考以下国际权威指南设计。所有指南链接均为官方源。
        </p>
        <div className="grid md:grid-cols-2 gap-3">
          {GUIDELINES.map((g) => (
            <a
              key={g.title}
              href={g.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-start gap-3 panel p-4 hover:border-bio-500/40 transition"
            >
              <span className="text-2xl">{g.icon}</span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-semibold text-white text-sm">{g.title}</span>
                  <ExternalLink className="w-3.5 h-3.5 text-text-tertiary flex-shrink-0" />
                </div>
                <p className="text-xs text-text-secondary mt-1">{g.description}</p>
              </div>
            </a>
          ))}
        </div>
      </div>

      {/* Demo: Export safety report */}
      <ExportPanel 
        componentData={{
          id: 'SAFETY-REPORT-2024',
          name: 'FluBioStack 安全合规报告',
          description: '本报告展示 FluBioStack 生物安全与伦理审查系统的完整功能。包含 DURC 监控、自评估流程、合规文档。',
          sequence: 'DEMO'
        }}
      />
    </div>
  );
}
