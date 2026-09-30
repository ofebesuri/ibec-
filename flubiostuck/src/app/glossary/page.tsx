'use client';

import { useState, useMemo } from 'react';
import { Search, BookOpen, ChevronRight } from 'lucide-react';
import Link from 'next/link';

interface GlossaryTerm {
  term: string;
  englishTerm: string;
  category: 'molecular_biology' | 'engineering' | 'computation' | 'ethics';
  definition: string;
  example?: string;
  relatedTerms?: string[];
}

const GLOSSARY_TERMS: GlossaryTerm[] = [
  {
    term: '启动子',
    englishTerm: 'Promoter',
    category: 'molecular_biology',
    definition: '位于基因上游的 DNA 序列，是 RNA 聚合酶识别并启动转录的区域。启动子决定基因表达的强度和时机。',
    example: '常用的组成型启动子：pTac、pLac、pCMV',
    relatedTerms: ['操纵子', '增强子']
  },
  {
    term: '终止子',
    englishTerm: 'Terminator',
    category: 'molecular_biology',
    definition: '位于基因 3\' 端的 DNA 序列，导致 RNA 聚合酶停止转录，终止 mRNA 合成。',
    example: 'T7 终止子、rrnB T1 终止子'
  },
  {
    term: 'RBS',
    englishTerm: 'Ribosome Binding Site',
    category: 'molecular_biology',
    definition: '核糖体结合位点，位于 mRNA 起始密码子上游约 5-10 个核苷酸处，帮助招募核糖体启动翻译。',
    example: 'Shine-Dalgarno 序列（SD 序列）是大肠杆菌中最强的 RBS'
  },
  {
    term: 'CDS',
    englishTerm: 'Coding Sequence',
    category: 'molecular_biology',
    definition: '编码序列，从起始密码子（ATG）到终止密码子的连续 DNA 序列，被翻译成蛋白质。'
  },
  {
    term: '质粒',
    englishTerm: 'Plasmid',
    category: 'molecular_biology',
    definition: '独立于染色体复制的环状 DNA 分子，常用于携带外源基因并转化细菌。',
    example: 'pUC19、pET-28a、pSB1C3 是常用的克隆质粒'
  },
  {
    term: '底盘细胞',
    englishTerm: 'Chassis',
    category: 'engineering',
    definition: '用于承载合成生物学线路的标准化生物体。常用底盘包括大肠杆菌（E. coli）、酿酒酵母（S. cerevisiae）、毕赤酵母（P. pastoris）等。',
    example: 'E. coli BL21(DE3) 是常用的蛋白表达底盘'
  },
  {
    term: '基因线路',
    englishTerm: 'Genetic Circuit',
    category: 'engineering',
    definition: '由多个基因和调控元件组成的工程化系统，可实现特定逻辑功能（如开关、振荡器、滤波器等）。',
    example: '双自杀开关（Toggle Switch）是经典的基因线路'
  },
  {
    term: '双自杀开关',
    englishTerm: 'Toggle Switch',
    category: 'engineering',
    definition: '两种相互抑制的蛋白（A 抑制 B，B 抑制 A）构成的基因线路，具有两个稳定状态（双稳态），可通过外界信号切换。',
    relatedTerms: ['双稳态', 'Hill 函数']
  },
  {
    term: 'DBTL 循环',
    englishTerm: 'Design-Build-Test-Learn Cycle',
    category: 'engineering',
    definition: '合成生物学的核心工程方法学：通过迭代的"设计-构建-测试-学习"循环不断优化生物系统。',
    relatedTerms: ['实验迭代']
  },
  {
    term: 'BLOSUM62',
    englishTerm: 'Blocks Substitution Matrix 62',
    category: 'computation',
    definition: '蛋白质序列比对中常用的氨基酸替换打分矩阵，基于 62% 序列相似度的局部比对块构建。',
    relatedTerms: ['PAM', 'PAM250']
  },
  {
    term: 'Hill 函数',
    englishTerm: 'Hill Function',
    category: 'computation',
    definition: '描述协同结合过程的数学函数，f(x) = x^n / (K^n + x^n)，其中 n 为 Hill 系数（协同度），K 为半激活浓度。',
    example: 'Hill 系数 n=1 为非协同，n>1 为正协同，n<1 为负协同'
  },
  {
    term: 'IC50',
    englishTerm: 'Half Maximal Inhibitory Concentration',
    category: 'computation',
    definition: '半数抑制浓度，使生物反应抑制 50% 所需的抑制剂浓度。是评估药物/抗体效力的关键指标。',
    example: 'IC50 值越小，表明抗体对靶标的结合力越强'
  },
  {
    term: 'FDR',
    englishTerm: 'False Discovery Rate',
    category: 'computation',
    definition: '假发现率，在多重假设检验中错误拒绝（假阳性）的比例。Benjamini-Hochberg 法是常用的 FDR 控制方法。'
  },
  {
    term: 'BSL',
    englishTerm: 'Biosafety Level',
    category: 'ethics',
    definition: '生物安全等级，根据病原体危害程度分为 BSL-1（最低）至 BSL-4（最高），对应不同的实验室设施和操作规范。',
    example: 'E. coli K12 属于 BSL-1，SARS-CoV-2 属于 BSL-3'
  },
  {
    term: 'DURC',
    englishTerm: 'Dual Use Research of Concern',
    category: 'ethics',
    definition: '双用途研究关注，指同时具有合法科学用途和潜在危害（可能被滥用）的生物研究。',
    relatedTerms: ['生物安全']
  },
  {
    term: 'SBOL',
    englishTerm: 'Synthetic Biology Open Language',
    category: 'engineering',
    definition: '合成生物学开放语言，用于标准化描述基因线路和生物元件的数据交换格式（当前版本 SBOL 2.0）。'
  },
  {
    term: 'Gibson 组装',
    englishTerm: 'Gibson Assembly',
    category: 'molecular_biology',
    definition: '一种高效的 DNA 组装方法，利用 5\' 核酸外切酶产生互补粘性末端，在单步等温反应中拼接多个 DNA 片段。'
  },
  {
    term: 'Golden Gate',
    englishTerm: 'Golden Gate Assembly',
    category: 'molecular_biology',
    definition: '基于 IIS 型限制酶（如 BsaI）的高效模块化 DNA 组装方法，可在单管反应中按预设顺序连接多个片段。'
  },
  {
    term: 'SEIR 模型',
    englishTerm: 'Susceptible-Exposed-Infected-Recovered',
    category: 'computation',
    definition: '流行病学的经典仓室模型，将人群分为易感（S）、暴露（E）、感染（I）、恢复（R）四个状态，用于预测传染病传播动态。',
    relatedTerms: ['R0', '基本再生数']
  },
  {
    term: 'scFv',
    englishTerm: 'Single-Chain Variable Fragment',
    category: 'molecular_biology',
    definition: '单链可变区片段，由抗体重链可变区（VH）和轻链可变区（VL）通过柔性连接肽串联而成的重组蛋白，保留完整抗原结合能力。',
    example: '分子量约 27 kDa，是完整抗体分子量（150 kDa）的 1/6'
  }
];

const CATEGORIES = [
  { id: 'all', label: '全部', icon: '📚' },
  { id: 'molecular_biology', label: '分子生物学', icon: '🧬' },
  { id: 'engineering', label: '工程学', icon: '⚙️' },
  { id: 'computation', label: '计算', icon: '💻' },
  { id: 'ethics', label: '伦理安全', icon: '🛡️' }
];

export default function GlossaryPage() {
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [selectedTerm, setSelectedTerm] = useState<GlossaryTerm | null>(null);

  const filtered = useMemo(() => {
    let items = GLOSSARY_TERMS;
    if (activeCategory !== 'all') {
      items = items.filter(t => t.category === activeCategory);
    }
    if (search) {
      const q = search.toLowerCase();
      items = items.filter(t => 
        t.term.toLowerCase().includes(q) || 
        t.englishTerm.toLowerCase().includes(q) || 
        t.definition.toLowerCase().includes(q)
      );
    }
    return items;
  }, [search, activeCategory]);

  return (
    <div className="px-4 lg:px-8 py-5 lg:py-7 space-y-6">
      <nav className="flex items-center gap-2 text-xs font-mono text-text-tertiary">
        <Link href="/" className="hover:text-text-secondary transition">~/</Link>
        <ChevronRight className="w-3 h-3" />
        <span className="text-bio-200">glossary</span>
      </nav>

      <div>
        <div className="text-[10px] font-mono tracking-[0.24em] uppercase text-text-tertiary">
          GLOSSARY · 术语表
        </div>
        <h1 className="text-2xl lg:text-3xl font-bold text-white mt-1.5">
          合成生物学核心术语 <span className="gradient-text">中英双语 · 图解</span>
        </h1>
        <p className="mt-2 text-text-secondary text-sm">
          面向 iGEM 评委和教学场景 · {GLOSSARY_TERMS.length} 个核心术语 · 4 个分类
        </p>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-tertiary" />
        <input
          type="text"
          placeholder="搜索术语（中文或英文）..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-3 bg-ink-900/60 border border-white/10 rounded-lg text-white text-sm focus:border-bio-500/50 outline-none"
        />
      </div>

      {/* Category Filter */}
      <div className="flex flex-wrap gap-2">
        {CATEGORIES.map(cat => (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(cat.id)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition ${
              activeCategory === cat.id
                ? 'bg-bio-500/20 border border-bio-500/40 text-bio-200'
                : 'bg-white/5 border border-white/10 text-text-secondary hover:border-white/20'
            }`}
          >
            <span>{cat.icon}</span>
            <span>{cat.label}</span>
            {cat.id !== 'all' && (
              <span className="text-[10px] font-mono text-text-tertiary">
                {GLOSSARY_TERMS.filter(t => t.category === cat.id).length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Two-column Layout */}
      <div className="grid lg:grid-cols-[1.4fr_1fr] gap-4">
        {/* Term List */}
        <div className="space-y-2">
          {filtered.length === 0 ? (
            <div className="panel p-8 text-center text-text-tertiary">
              <BookOpen className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p>未找到匹配的术语</p>
            </div>
          ) : (
            filtered.map((term) => (
              <button
                key={term.term}
                onClick={() => setSelectedTerm(term)}
                className={`w-full text-left panel p-4 transition ${
                  selectedTerm?.term === term.term
                    ? 'border-bio-500/40 bg-bio-500/5'
                    : 'hover:border-white/20'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold text-white">{term.term}</span>
                      <span className="text-[10px] font-mono text-text-tertiary">·</span>
                      <span className="text-xs text-text-secondary font-mono">{term.englishTerm}</span>
                    </div>
                    <p className="text-xs text-text-secondary line-clamp-2">{term.definition}</p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-text-tertiary flex-shrink-0" />
                </div>
              </button>
            ))
          )}
        </div>

        {/* Detail Panel */}
        <div className="lg:sticky lg:top-4 lg:self-start">
          {selectedTerm ? (
            <div className="panel-strong p-5 space-y-4">
              <div>
                <div className="text-[10px] font-mono text-text-tertiary uppercase tracking-wider">术语详情</div>
                <h2 className="text-xl font-bold text-white mt-1">{selectedTerm.term}</h2>
                <p className="text-sm font-mono text-bio-200 mt-1">{selectedTerm.englishTerm}</p>
              </div>

              <div className="border-t border-white/5 pt-4">
                <div className="text-[10px] font-mono text-text-tertiary uppercase tracking-wider mb-2">定义</div>
                <p className="text-sm text-white leading-relaxed">{selectedTerm.definition}</p>
              </div>

              {selectedTerm.example && (
                <div className="border-t border-white/5 pt-4">
                  <div className="text-[10px] font-mono text-text-tertiary uppercase tracking-wider mb-2">示例</div>
                  <p className="text-sm text-text-secondary font-mono leading-relaxed">{selectedTerm.example}</p>
                </div>
              )}

              {selectedTerm.relatedTerms && selectedTerm.relatedTerms.length > 0 && (
                <div className="border-t border-white/5 pt-4">
                  <div className="text-[10px] font-mono text-text-tertiary uppercase tracking-wider mb-2">相关术语</div>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedTerm.relatedTerms.map(rt => (
                      <span key={rt} className="text-xs font-mono px-2 py-0.5 rounded bg-white/5 text-bio-200">
                        {rt}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="panel p-6 text-center">
              <BookOpen className="w-12 h-12 mx-auto mb-3 text-text-tertiary opacity-50" />
              <p className="text-sm text-text-tertiary">选择左侧术语查看详情</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
