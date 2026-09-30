'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { Play, ChevronRight, Code2, Atom, Activity, TrendingUp } from 'lucide-react';

interface AlgorithmStep {
  id: string;
  title: string;
  titleEn: string;
  description: string;
  formula?: string;
  pseudoCode?: string;
  animation: 'scatter' | 'line' | 'heatmap' | 'seir' | 'circuit';
  module: 'scfv' | 'multiomics' | 'circuit' | 'epidemic';
}

const ALGORITHMS: AlgorithmStep[] = [
  {
    id: 'scfv-blosum',
    title: 'BLOSUM62 替换打分',
    titleEn: 'BLOSUM62 Substitution Scoring',
    module: 'scfv',
    description: '使用 BLOSUM62 矩阵对突变前后氨基酸替换进行打分，正分表示保守替换，负分表示不利替换。',
    formula: 'score = BLOSUM62[original][mutated]',
    pseudoCode: `// Pseudocode
function scoreMutation(original, mutated):
  return BLOSUM62[original][mutated]

// Example: S → R (serine to arginine)
scoreMutation('S', 'R')  // = -1`,
    animation: 'scatter'
  },
  {
    id: 'scfv-hydrophobicity',
    title: 'Kyte-Doolittle 疏水性',
    titleEn: 'Kyte-Doolittle Hydropathy',
    module: 'scfv',
    description: '计算蛋白序列中每个氨基酸的疏水性指数，用于评估突变对溶解度和稳定性的影响。',
    formula: 'GRAVY = Σ(hydropathy[i]) / N',
    pseudoCode: `// Kyte-Doolittle scale
hydropathy = {
  'A': 1.8, 'R': -4.5, 'N': -3.5, 'D': -3.5,
  'C': 2.5, 'Q': -3.5, 'E': -3.5, 'G': -0.4,
  'H': -3.2, 'I': 4.5, 'L': 3.8, 'K': -3.9,
  // ...
}

function GRAVY(sequence):
  return avg(hydropathy[aa] for aa in sequence)`,
    animation: 'scatter'
  },
  {
    id: 'scfv-sigmoid',
    title: 'Sigmoid 归一化打分',
    titleEn: 'Sigmoid Normalization',
    module: 'scfv',
    description: '使用 Sigmoid 函数将原始 BLOSUM62 分数和疏水性差异归一化到 [0, 1] 区间，得到稳定性分和亲和力分。',
    formula: 'score = 1 / (1 + exp(-k * x))',
    pseudoCode: `// Sigmoid normalization
function normalize(rawScore, k=1.0):
  return 1.0 / (1.0 + exp(-k * rawScore))

// Combine stability and affinity
stability = normalize(BLOSUM_score * 0.7 + hydropathy * 0.3)
affinity = normalize(BLOSUM_score * 0.5 + 0.5)`,
    animation: 'scatter'
  },
  {
    id: 'multiomics-mor',
    title: 'Median-of-Ratios 标准化',
    titleEn: 'Median-of-Ratios Normalization',
    module: 'multiomics',
    description: 'DESeq2 风格的大小因子标准化方法：计算每个样本基因表达的几何均值比值，取中位数作为归一化因子。',
    formula: 'size_factor[j] = median(reads[j,i] / geo_mean[i])',
    pseudoCode: `function normalizeCounts(counts):
  // Step 1: geometric mean per gene
  geoMeans = sqrt(prod(counts[gene, :]) for gene)
  
  // Step 2: ratios per sample
  for sample in samples:
    ratios = counts[:, sample] / geoMeans
    sizeFactors[sample] = median(ratios)
  
  // Step 3: normalize
  normalized = counts / sizeFactors
  return normalized`,
    animation: 'heatmap'
  },
  {
    id: 'multiomics-bh',
    title: 'Benjamini-Hochberg FDR',
    titleEn: 'Benjamini-Hochberg FDR Correction',
    module: 'multiomics',
    description: '多重假设检验的假发现率控制方法：从大到小排序 p 值，逐级调整阈值，确保错误发现率低于指定水平。',
    formula: 'p_adjusted[i] = min(p[i] * m / rank[i], 1)',
    pseudoCode: `function bhFDR(pValues, alpha=0.05):
  m = len(pValues)
  sortedIdx = argsort(pValues)
  
  // Adjust from largest to smallest
  for i in range(m - 1, -1, -1):
    rank = i + 1
    adjusted = pValues[sortedIdx[i]] * m / rank
    if i < m - 1:
      adjusted = min(adjusted, adjustedValues[i + 1])
    adjustedValues[i] = min(adjusted, 1)
  
  return adjustedValues`,
    animation: 'heatmap'
  },
  {
    id: 'circuit-ode',
    title: 'Hill 函数 ODE',
    titleEn: 'Hill Function ODE System',
    module: 'circuit',
    description: '使用 Hill 函数建模基因调控网络的微分方程系统，描述转录因子间的相互抑制动力学。',
    formula: 'dA/dt = α/(1+B^n) - δ·A',
    pseudoCode: `function hillRepression(repressor, K, n):
  return 1.0 / (1.0 + (repressor / K)**n)

// Toggle switch ODE
function dA_dt(A, B, alpha=12, delta=0.4, n=3):
  return alpha * hillRepression(B, 1, n) - delta * A

function dB_dt(A, B, alpha=12, delta=0.4, n=3):
  return alpha * hillRepression(A, 1, n) - delta * B`,
    animation: 'circuit'
  },
  {
    id: 'circuit-rk4',
    title: 'RK4 求解器',
    titleEn: 'Runge-Kutta 4th Order Solver',
    module: 'circuit',
    description: '四阶龙格-库塔方法是求解 ODE 的经典数值方法，通过四个斜率加权平均获得高精度的下一个时间步。',
    formula: 'y_{n+1} = y_n + h/6 * (k1 + 2k2 + 2k3 + k4)',
    pseudoCode: `function rk4Step(f, y, t, h):
  k1 = f(y, t)
  k2 = f(y + h/2 * k1, t + h/2)
  k3 = f(y + h/2 * k2, t + h/2)
  k4 = f(y + h * k3, t + h)
  return y + h/6 * (k1 + 2*k2 + 2*k3 + k4)

// Solve for toggle switch
for step in range(numSteps):
  A, B = rk4Step(circuitODE, [A, B], t, dt)
  record(A, B, t)
  t += dt`,
    animation: 'circuit'
  },
  {
    id: 'seir-model',
    title: 'SEIR 流行病模型',
    titleEn: 'SEIR Epidemic Model',
    module: 'epidemic',
    description: '经典流行病学仓室模型，将人群分为易感（S）、暴露（E）、感染（I）、恢复（R）四类，描述传染病传播动态。',
    formula: 'dI/dt = β·S·E/N - γ·I',
    pseudoCode: `// SEIR ODE system
function dS_dt(S, E, I, beta, N):
  return -beta * S * E / N

function dE_dt(S, E, I, beta, N, sigma):
  return beta * S * E / N - sigma * E

function dI_dt(E, I, sigma, gamma):
  return sigma * E - gamma * I

function dR_dt(I, gamma):
  return gamma * I`,
    animation: 'seir'
  }
];

const MODULE_INFO = {
  scfv: { name: 'scFv 筛选', color: '#16BFDB', icon: Atom },
  multiomics: { name: '多组学', color: '#7E3AFF', icon: Activity },
  circuit: { name: '回路仿真', color: '#16D88A', icon: Code2 },
  epidemic: { name: '流行病预测', color: '#FF9A1F', icon: TrendingUp }
};

export default function TutorialPage() {
  const [activeStep, setActiveStep] = useState<string>('scfv-blosum');
  const [isPlaying, setIsPlaying] = useState(false);

  const step = useMemo(() => ALGORITHMS.find(a => a.id === activeStep)!, [activeStep]);

  const algorithmGrouped = useMemo(() => {
    const groups: Record<string, AlgorithmStep[]> = {
      scfv: [],
      multiomics: [],
      circuit: [],
      epidemic: []
    };
    ALGORITHMS.forEach(a => groups[a.module].push(a));
    return groups;
  }, []);

  return (
    <div className="px-4 lg:px-8 py-5 lg:py-7 space-y-6">
      <nav className="flex items-center gap-2 text-xs font-mono text-text-tertiary">
        <Link href="/" className="hover:text-text-secondary transition">~/</Link>
        <ChevronRight className="w-3 h-3" />
        <span className="text-bio-200">tutorials</span>
      </nav>

      <div>
        <div className="text-[10px] font-mono tracking-[0.24em] uppercase text-text-tertiary">
          ALGORITHM TUTORIALS · 交互式算法教程
        </div>
        <h1 className="text-2xl lg:text-3xl font-bold text-white mt-1.5">
          算法原理 <span className="gradient-text">Step-by-Step</span>
        </h1>
        <p className="mt-2 text-text-secondary text-sm">
          通过伪代码、数学公式、动画演示理解 FluBioStack 核心算法 · 面向教学场景
        </p>
      </div>

      <div className="grid lg:grid-cols-[1fr_2fr] gap-6">
        {/* Algorithm List */}
        <div className="space-y-3">
          {Object.entries(algorithmGrouped).map(([moduleKey, steps]) => {
            const modInfo = MODULE_INFO[moduleKey as keyof typeof MODULE_INFO];
            const Icon = modInfo.icon;
            return (
              <div key={moduleKey} className="panel p-3">
                <div className="flex items-center gap-2 mb-2 px-2">
                  <Icon size={14} style={{ color: modInfo.color }} />
                  <span className="text-xs font-mono text-white">{modInfo.name}</span>
                  <span className="text-[10px] text-text-tertiary">({steps.length})</span>
                </div>
                <div className="space-y-1">
                  {steps.map(s => (
                    <button
                      key={s.id}
                      onClick={() => setActiveStep(s.id)}
                      className={`w-full text-left px-3 py-2 rounded text-xs transition ${
                        activeStep === s.id
                          ? 'bg-bio-500/20 text-bio-200 border border-bio-500/30'
                          : 'text-text-secondary hover:bg-white/5 border border-transparent'
                      }`}
                    >
                      <div className="font-medium">{s.title}</div>
                      <div className="text-[10px] text-text-tertiary font-mono">{s.titleEn}</div>
                    </button>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* Detail Panel */}
        <div className="space-y-4">
          <div className="panel-strong p-5">
            <div className="flex items-center justify-between mb-3">
              <div>
                <div className="text-[10px] font-mono tracking-[0.24em] uppercase text-text-tertiary">
                  {MODULE_INFO[step.module].name}
                </div>
                <h2 className="text-xl font-bold text-white mt-1">{step.title}</h2>
                <p className="text-xs text-text-secondary font-mono mt-1">{step.titleEn}</p>
              </div>
              <button
                onClick={() => setIsPlaying(!isPlaying)}
                className="btn-primary text-xs"
              >
                <Play className="w-3.5 h-3.5" />
                {isPlaying ? '暂停' : '演示'}
              </button>
            </div>
            <p className="text-sm text-text-secondary leading-relaxed">{step.description}</p>
          </div>

          {/* Formula */}
          {step.formula && (
            <div className="panel p-4">
              <div className="text-[10px] font-mono tracking-[0.18em] uppercase text-text-tertiary mb-2">
                MATHEMATICAL FORMULA
              </div>
              <div className="font-mono text-base text-bio-200 bg-ink-950/60 rounded p-3 text-center">
                {step.formula}
              </div>
            </div>
          )}

          {/* Pseudo Code */}
          {step.pseudoCode && (
            <div className="panel p-4">
              <div className="text-[10px] font-mono tracking-[0.18em] uppercase text-text-tertiary mb-2">
                PSEUDO CODE
              </div>
              <pre className="bg-ink-950/80 rounded p-3 text-xs font-mono text-text-secondary overflow-x-auto">
                {step.pseudoCode}
              </pre>
            </div>
          )}

          {/* Animation placeholder */}
          <div className="panel p-4">
            <div className="text-[10px] font-mono tracking-[0.18em] uppercase text-text-tertiary mb-2">
              ANIMATION PREVIEW
            </div>
            <div 
              className="bg-gradient-to-br from-compute-500/10 to-bio-500/10 rounded-lg border border-white/5 flex items-center justify-center text-text-tertiary"
              style={{ height: 200 }}
            >
              <div className="text-center">
                <div className="text-4xl mb-2">{isPlaying ? '▶' : '▶'}</div>
                <div className="text-xs">点击「演示」按钮运行算法动画</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
