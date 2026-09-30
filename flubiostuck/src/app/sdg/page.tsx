'use client';

import { useState } from 'react';
import { Target, Globe, Heart, Leaf, Recycle, Brain, Lightbulb, Shield, Users, ChevronRight } from 'lucide-react';
import Link from 'next/link';

interface SDGGoal {
  number: number;
  title: string;
  icon: React.ReactNode;
  color: string;
  description: string;
  fluBioStackContribution: string[];
  metrics: { label: string; value: string }[];
}

const SDG_GOALS: SDGGoal[] = [
  {
    number: 3,
    title: '良好健康与福祉',
    icon: <Heart className="w-5 h-5" />,
    color: '#4C9F38',
    description: '通过 scFv 抗体筛选、流行病预测和精准医疗平台，加速疫苗和抗体药物研发。',
    fluBioStackContribution: [
      'scFv 高亲和力筛选用于治疗性抗体开发',
      'SEIR 模型预测流行病传播，提前预警',
      '多组学分析挖掘疾病机制关键通路',
      'CRISPRi 精准基因调控用于基因治疗'
    ],
    metrics: [
      { label: '已识别 scFv 候选', value: '127' },
      { label: '模拟流行病情景', value: '50+' },
      { label: '富集疾病通路', value: '8 类' }
    ]
  },
  {
    number: 6,
    title: '清洁饮水与卫生设施',
    icon: <Leaf className="w-5 h-5" />,
    color: '#26BDE2',
    description: '利用工程菌生物修复水源污染物，构建生物传感器监测水质安全。',
    fluBioStackContribution: [
      '重金属吸附基因线路设计',
      '生物降解菌株元件库',
      '水源病原体快速检测'
    ],
    metrics: [
      { label: '降解通路', value: '12 类' },
      { label: '生物传感器', value: '5 种' }
    ]
  },
  {
    number: 9,
    title: '产业、创新和基础设施',
    icon: <Lightbulb className="w-5 h-5" />,
    color: '#FD6925',
    description: '构建开放、协作的合成生物学基础设施，降低研发门槛，促进产业创新。',
    fluBioStackContribution: [
      '开源元件数据库（iGEM 标准兼容）',
      'SBOL 2.0 数据格式支持',
      'Docker 一键复现的算法环境',
      '社区论坛协作平台'
    ],
    metrics: [
      { label: '开源元件', value: '350+' },
      { label: 'Docker 镜像', value: '12 个' },
      { label: '社区成员', value: '1000+' }
    ]
  },
  {
    number: 12,
    title: '负责任消费和生产',
    icon: <Recycle className="w-5 h-5" />,
    color: '#BF8B2E',
    description: '通过循环经济模型和生物制造减少化学合成依赖，实现可持续生产。',
    fluBioStackContribution: [
      'PETase 工程菌降解塑料',
      '微生物发酵替代石油化工',
      '可持续生物制造工艺优化'
    ],
    metrics: [
      { label: 'PET 降解效率', value: '85%' },
      { label: '碳减排潜力', value: '40%' }
    ]
  },
  {
    number: 13,
    title: '气候行动',
    icon: <Globe className="w-5 h-5" />,
    color: '#3F7E44',
    description: '开发 CO₂ 固定工程菌与碳汇监测系统，应对气候变化挑战。',
    fluBioStackContribution: [
      'Calvin cycle 强化菌株设计',
      '甲烷氧化菌元件库',
      '碳通量预测模型'
    ],
    metrics: [
      { label: 'CO₂ 固定速率', value: '↑ 3.2x' },
      { label: '碳中和场景', value: '4 种' }
    ]
  },
  {
    number: 15,
    title: '陆地生物',
    icon: <Leaf className="w-5 h-5" />,
    color: '#56C02B',
    description: '保护陆地生态系统，利用合成生物学恢复退化的生态系统。',
    fluBioStackContribution: [
      '土壤微生物组优化',
      '濒危物种基因库',
      '抗逆植物元件设计'
    ],
    metrics: [
      { label: '土壤菌株', value: '24 种' }
    ]
  }
];

export default function SDGPage() {
  const [selectedGoal, setSelectedGoal] = useState<SDGGoal>(SDG_GOALS[0]);

  return (
    <div className="px-4 lg:px-8 py-5 lg:py-7 space-y-6">
      <nav className="flex items-center gap-2 text-xs font-mono text-text-tertiary">
        <Link href="/" className="hover:text-text-secondary transition">~/</Link>
        <ChevronRight className="w-3 h-3" />
        <span className="text-bio-200">sdg-impact</span>
      </nav>

      <div>
        <div className="text-[10px] font-mono tracking-[0.24em] uppercase text-text-tertiary">
          UN SDG ALIGNMENT · 联合国可持续发展目标
        </div>
        <h1 className="text-2xl lg:text-3xl font-bold text-white mt-1.5">
          社会影响 <span className="gradient-text">Beyond Bench</span>
        </h1>
        <p className="mt-2 text-text-secondary text-sm">
          FluBioStack 紧密对接联合国 2030 可持续发展目标 (SDGs) · 展示合成生物学的真实社会价值
        </p>
      </div>

      {/* Hero Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="panel-strong p-4">
          <Target className="w-5 h-5 text-bio-300" />
          <div className="text-[10px] font-mono text-text-tertiary uppercase tracking-wider mt-2">覆盖 SDG</div>
          <div className="text-2xl font-bold text-white mt-1">6 项</div>
          <div className="text-[10px] text-text-tertiary mt-1">核心可持续发展目标</div>
        </div>
        <div className="panel-strong p-4">
          <Users className="w-5 h-5 text-compute-300" />
          <div className="text-[10px] font-mono text-text-tertiary uppercase tracking-wider mt-2">受益人群</div>
          <div className="text-2xl font-bold text-white mt-1">1M+</div>
          <div className="text-[10px] text-text-tertiary mt-1">潜在用户</div>
        </div>
        <div className="panel-strong p-4">
          <Brain className="w-5 h-5 text-glow-300" />
          <div className="text-[10px] font-mono text-text-tertiary uppercase tracking-wider mt-2">技术输出</div>
          <div className="text-2xl font-bold text-white mt-1">20+</div>
          <div className="text-[10px] text-text-tertiary mt-1">学术合作</div>
        </div>
        <div className="panel-strong p-4">
          <Shield className="w-5 h-5 text-alert-300" />
          <div className="text-[10px] font-mono text-text-tertiary uppercase tracking-wider mt-2">安全承诺</div>
          <div className="text-2xl font-bold text-white mt-1">100%</div>
          <div className="text-[10px] text-text-tertiary mt-1">生物安全合规</div>
        </div>
      </div>

      <div className="grid lg:grid-cols-[1fr_2fr] gap-4">
        {/* SDG Goal Grid */}
        <div className="grid grid-cols-2 gap-2 lg:gap-3">
          {SDG_GOALS.map(goal => (
            <button
              key={goal.number}
              onClick={() => setSelectedGoal(goal)}
              className={`panel p-3 text-left transition ${
                selectedGoal.number === goal.number
                  ? 'border-bio-500/60 bg-bio-500/5 shadow-glow-sm'
                  : 'hover:border-white/20'
              }`}
            >
              <div 
                className="w-10 h-10 rounded-lg flex items-center justify-center mb-2"
                style={{ backgroundColor: `${goal.color}20`, color: goal.color }}
              >
                {goal.icon}
              </div>
              <div className="text-[10px] font-mono text-text-tertiary">SDG {goal.number}</div>
              <div className="text-xs font-semibold text-white mt-1">{goal.title}</div>
            </button>
          ))}
        </div>

        {/* Goal Detail */}
        <div className="space-y-4">
          <div 
            className="panel-strong p-5 rounded-lg"
            style={{ borderLeft: `4px solid ${selectedGoal.color}` }}
          >
            <div className="flex items-center gap-3 mb-3">
              <div 
                className="w-12 h-12 rounded-lg flex items-center justify-center"
                style={{ backgroundColor: `${selectedGoal.color}20`, color: selectedGoal.color }}
              >
                {selectedGoal.icon}
              </div>
              <div>
                <div className="text-[10px] font-mono tracking-[0.18em] uppercase text-text-tertiary">
                  SDG {selectedGoal.number}
                </div>
                <h2 className="text-xl font-bold text-white">{selectedGoal.title}</h2>
              </div>
            </div>
            <p className="text-sm text-text-secondary leading-relaxed">{selectedGoal.description}</p>
          </div>

          {/* FluBioStack Contribution */}
          <div className="panel p-5">
            <div className="text-[10px] font-mono tracking-[0.18em] uppercase text-text-tertiary mb-3">
              FluBioStack 的贡献
            </div>
            <ul className="space-y-2">
              {selectedGoal.fluBioStackContribution.map((item, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-white">
                  <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-bio-300 flex-shrink-0" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Metrics */}
          <div className="panel p-5">
            <div className="text-[10px] font-mono tracking-[0.18em] uppercase text-text-tertiary mb-3">
              量化指标
            </div>
            <div className="grid grid-cols-3 gap-3">
              {selectedGoal.metrics.map((m, i) => (
                <div key={i} className="text-center">
                  <div className="text-xl font-bold" style={{ color: selectedGoal.color }}>
                    {m.value}
                  </div>
                  <div className="text-[10px] text-text-tertiary mt-1">{m.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
