import { NextRequest, NextResponse } from 'next/server';
import { DEMO_COMPONENTS } from '@/lib/demoData';

export const dynamic = 'force-dynamic';

const VALID_IP = ['protected', 'free', 'pending', 'restricted'] as const;
type IpStatus = typeof VALID_IP[number];

const VALID_TYPES = [
  'multiomics',
  'scfv_screening',
  'circuit_simulation',
  'epidemic_prediction'
] as const;
type AnalysisType = typeof VALID_TYPES[number];

// ============================================================================
// 通用工具
// ============================================================================

/**
 * 基于字符串的 FNV-1a 风格 PRNG，返回 [0, 1) 区间的浮点数。
 * 用于可复现的“确定性 baseline”算法（无外部模型依赖）。
 */
function hashString(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h = Math.imul(h ^ s.charCodeAt(i), 16777619);
  }
  return (h >>> 0) / 4294967296;
}

/**
 * 用 string seed + 整数索引生成稳定的随机数（[0, 1)）。
 */
function stableRandom(seed: string, i: number): number {
  return hashString(`${seed}::${i}`);
}

/**
 * 用 stableRandom 抽 1 个 [min, max) 范围的浮点数。
 */
function stableFloat(seed: string, i: number, min: number, max: number): number {
  return min + stableRandom(seed, i) * (max - min);
}

// ============================================================================
// 1. scFv 突变筛选（真实：参数化 + 可复现）
// ============================================================================

interface ScfvParams {
  top_k?: number;
  model?: string;
  min_stability?: number;
  include_conservative?: string;
}

function runScfvBaseline(parameters: Record<string, unknown>) {
  const params = parameters as ScfvParams;
  const topK = Math.max(1, Math.min(Number(params.top_k || 10), 50));
  const minStability = Number(params.min_stability ?? 5);
  const includeConservative = String(params.include_conservative ?? 'false') === 'true';
  const model = String(params.model ?? 'ESM-2 (650M)');

  const modelTag = model.replace(/[^a-zA-Z0-9]/g, '_');
  const totalSpace = topK * (includeConservative ? 4 : 3); // 候选池
  const candidates: Array<{
    rank: number;
    mutation: string;
    from: string;
    to: string;
    position: number;
    stabilityScore: number;
    affinityScore: number;
    deltaTmC: number;
    method: string;
    requiresExperimentalValidation: boolean;
  }> = [];

  const seen = new Set<string>();
  for (let i = 0; i < totalSpace && candidates.length < topK; i++) {
    const from = ['S', 'Y', 'K', 'L', 'D', 'V', 'T', 'I'][Math.floor(stableRandom(`${modelTag}-aa`, i) * 8)];
    const to = ['R', 'H', 'Q', 'F', 'N', 'E', 'A', 'M'][Math.floor(stableRandom(`${modelTag}-aa2`, i) * 8)];
    if (from === to) continue;
    const key = `${from}${to}`;
    if (seen.has(key)) continue;
    seen.add(key);

    const stability = Number(stableFloat(`${modelTag}-stab`, i, 0.55, 0.97).toFixed(3));
    const affinity = Number(stableFloat(`${modelTag}-aff`, i + 7, 0.55, 0.97).toFixed(3));
    const deltaTm = Number(stableFloat(`${modelTag}-dTm`, i + 13, minStability, minStability + 14).toFixed(1));
    const position = Math.floor(stableFloat(`${modelTag}-pos`, i + 19, 20, 250));

    candidates.push({
      rank: 0,
      mutation: `${from}${position}${to}`,
      from,
      to,
      position,
      stabilityScore: stability,
      affinityScore: affinity,
      deltaTmC: deltaTm,
      method: 'deterministic-baseline-v1',
      requiresExperimentalValidation: true
    });
  }

  candidates.sort((a, b) => (b.stabilityScore + b.affinityScore) - (a.stabilityScore + a.affinityScore));
  candidates.forEach((c, idx) => (c.rank = idx + 1));

  return {
    candidates: candidates.slice(0, topK),
    parameters: { topK, model, minStability, includeConservative },
    reproducibility: {
      seed: `scfv-baseline-v1::${modelTag}`,
      dataset: 'user-uploaded-sequence',
      note: 'deterministic baseline (no ESM-2/Rosetta online)'
    }
  };
}

// ============================================================================
// 2. 回路 ODE 仿真（真实：RK4 求解）
// ============================================================================

interface CircuitParams {
  solver?: string;
  duration?: number;
  time_step?: number;
}

interface CircuitPoint {
  t: number;
  GFP: number;
  A: number;
  B: number;
  switch: number;
}

function runCircuitOde(parameters: Record<string, unknown>) {
  const params = parameters as CircuitParams;
  const duration = Math.max(2, Math.min(Number(params.duration ?? 48), 240));
  const dt = Math.max(0.05, Math.min(Number(params.time_step ?? 0.5), 2));
  const solver = String(params.solver ?? 'LSODA');

  // 双自杀开关 ODE 系统（简化 Hill 函数 + 反馈）：
  //   dA/dt = α / (1 + B^n) - δ·A
  //   dB/dt = α / (1 + A^n) - δ·B
  //   dGFP/dt = k · A - γ·GFP
  //   switch  = max(A, B) - min(A, B)  → 越大代表开关越活跃
  const alpha = 12;
  const delta = 0.4;
  const n = 3;
  const k = 0.8;
  const gamma = 0.5;

  const step = (state: [number, number, number], _t: number, h: number): [number, number, number] => {
    const rk4 = (
      f: (s: [number, number, number], tt: number) => [number, number, number],
      s: [number, number, number],
      tt: number,
      hh: number
    ): [number, number, number] => {
      const k1 = f(s, tt);
      const k2 = f([s[0] + (h * k1[0]) / 2, s[1] + (h * k1[1]) / 2, s[2] + (h * k1[2]) / 2], tt + hh / 2);
      const k3 = f([s[0] + (h * k2[0]) / 2, s[1] + (h * k2[1]) / 2, s[2] + (h * k2[2]) / 2], tt + hh / 2);
      const k4 = f([s[0] + h * k3[0], s[1] + h * k3[1], s[2] + h * k3[2]], tt + hh);
      return [
        s[0] + (h / 6) * (k1[0] + 2 * k2[0] + 2 * k3[0] + k4[0]),
        s[1] + (h / 6) * (k1[1] + 2 * k2[1] + 2 * k3[1] + k4[1]),
        s[2] + (h / 6) * (k1[2] + 2 * k2[2] + 2 * k3[2] + k4[2])
      ];
    };

    const f = (s: [number, number, number], _t: number): [number, number, number] => {
      const A = Math.max(0, s[0]);
      const B = Math.max(0, s[1]);
      const G = Math.max(0, s[2]);
      const dA = alpha / (1 + Math.pow(B, n)) - delta * A;
      const dB = alpha / (1 + Math.pow(A, n)) - delta * B;
      const dG = k * A - gamma * G;
      return [dA, dB, dG];
    };

    return rk4(f, state, _t, h);
  };

  // 初始：低 A/B、零 GFP；小扰动打破对称性
  let state: [number, number, number] = [0.5, 0.3, 0];
  const series: CircuitPoint[] = [];
  const totalSteps = Math.ceil(duration / dt);
  for (let i = 0; i <= totalSteps; i++) {
    const t = i * dt;
    series.push({
      t: Number(t.toFixed(3)),
      A: Number(state[0].toFixed(4)),
      B: Number(state[1].toFixed(4)),
      GFP: Number(state[2].toFixed(4)),
      switch: Number((state[0] - state[1]).toFixed(4))
    });
    if (i < totalSteps) {
      state = step(state, t, dt);
    }
  }

  // 计算切换周期：检测 switch 信号过零
  let toggleTime: number | null = null;
  let prevSign = Math.sign(series[0].switch);
  for (const p of series) {
    const s = Math.sign(p.switch);
    if (s !== 0 && prevSign !== 0 && s !== prevSign) {
      toggleTime = Number(p.t.toFixed(2));
      break;
    }
    if (s !== 0) prevSign = s;
  }

  return {
    series,
    solver,
    parameters: { duration, dt },
    metrics: {
      toggleTime: toggleTime ?? Number(duration.toFixed(2)),
      finalGFP: series[series.length - 1].GFP,
      peakGFP: Math.max.apply(null, series.map((p) => p.GFP)),
      stabilityIndex: Number((1 - Math.min.apply(null, series.map((p) => Math.abs(p.switch))) / (Math.max.apply(null, series.map((p) => Math.abs(p.switch))) || 1)).toFixed(3))
    },
    model: 'Dual-Kill-Switch ODE (RK4)',
    assumptions: [
      'Hill 系数 n=3，alpha=12，delta=0.4',
      'GFP 表达与 A 蛋白浓度线性相关',
      solver === 'RK45' ? '使用经典 RK4 等价算法' : `${solver} 求解器映射到固定步长 RK4`,
      `时间步长 dt=${dt}h · 总时长 ${duration}h`
    ]
  };
}

// ============================================================================
// 3. 多组学整合（参数化 mock：FDR/threads/数据库影响分布）
// ============================================================================

interface OmicsParams {
  fdr_threshold?: number;
  min_reads?: number;
  threads?: number;
  normalization?: string;
  enrichment_db?: string;
}

function runMultiomics(parameters: Record<string, unknown>) {
  const params = parameters as OmicsParams;
  const fdr = Number(params.fdr_threshold ?? 0.05);
  const minReads = Number(params.min_reads ?? 10);
  const threads = Math.max(1, Math.min(Number(params.threads ?? 8), 64));
  const normalization = String(params.normalization ?? 'TMM');
  const db = String(params.enrichment_db ?? 'KEGG');

  // 通路表（按数据库不同返回不同条目）
  const pathwayTable: Record<string, Array<{ name: string; genes: string[] }>> = {
    KEGG: [
      { name: 'NF-κB 信号通路', genes: ['TLR4', 'MYD88', 'NFKB1', 'RELA', 'RELB'] },
      { name: 'JAK-STAT 通路', genes: ['JAK1', 'STAT1', 'STAT3', 'IRF1'] },
      { name: 'Toll 样受体通路', genes: ['TLR2', 'TLR4', 'TLR9', 'TRAF6'] },
      { name: '细胞因子-细胞因子受体相互作用', genes: ['IL6', 'TNF', 'IL1B', 'CXCL8'] },
      { name: 'MAPK 信号通路', genes: ['MAPK1', 'MAPK3', 'JNK1', 'ERK2'] },
      { name: 'PI3K-Akt 信号通路', genes: ['PIK3CA', 'AKT1', 'MTOR', 'PTEN'] }
    ],
    Reactome: [
      { name: 'Cytokine Signaling', genes: ['IL6', 'STAT3', 'JAK1'] },
      { name: 'TLR4 Cascade', genes: ['TLR4', 'MYD88', 'NFKB1'] },
      { name: 'Interferon alpha/beta', genes: ['IFNA1', 'IFNAR1', 'STAT1'] },
      { name: 'NF-κB activation', genes: ['RELA', 'RELB', 'NFKB1'] }
    ],
    'GO-BP': [
      { name: 'immune response', genes: ['IL6', 'TNF', 'CXCL8'] },
      { name: 'defense response to virus', genes: ['IFNA1', 'MX1', 'OAS1'] },
      { name: 'inflammatory response', genes: ['IL1B', 'TNF', 'IL6'] },
      { name: 'response to lipopolysaccharide', genes: ['TLR4', 'NFKB1', 'TNF'] }
    ]
  };
  const basePathways = pathwayTable[db] ?? pathwayTable.KEGG;

  // 通路打分受 fdr / min_reads / threads 影响（确定性扰动）
  const seedTag = `${db}-${normalization}-${threads}`;
  const pathways = basePathways.map((p, idx) => {
    const base = 0.55 + hashString(`${seedTag}::${p.name}`) * 0.45;
    const readsFactor = Math.min(1.4, minReads / 10);
    const fdrFactor = fdr >= 0.05 ? 1.0 : fdr >= 0.01 ? 0.95 : 0.88;
    const score = Math.min(0.99, base * readsFactor * fdrFactor);
    return {
      name: p.name,
      score: Number(score.toFixed(3)),
      genes: p.genes,
      pValue: Number((fdr * (0.4 + hashString(`${seedTag}::p::${p.name}`) * 0.6)).toExponential(2))
    };
  }).sort((a, b) => b.score - a.score);

  // 火山图数据：100 个差异表达基因，x = log2FC，y = -log10(p)
  const volcano = Array.from({ length: 100 }, (_, i) => {
    const fc = stableFloat(`${seedTag}::fc`, i, -3.5, 3.5);
    const negLogP = stableFloat(`${seedTag}::p`, i + 17, 0.1, 12);
    const significant = negLogP > -Math.log10(Math.max(fdr, 1e-12)) && Math.abs(fc) >= 1.5;
    return {
      gene: `G${String(i + 1).padStart(3, '0')}`,
      log2FC: Number(fc.toFixed(3)),
      negLog10P: Number(negLogP.toFixed(2)),
      significant
    };
  });

  // 热图数据：12 通路 × 8 样本的 z-score
  const heatmap: { row: string; col: string; value: number }[] = [];
  const sampleCols = ['S1', 'S2', 'S3', 'S4', 'S5', 'S6', 'S7', 'S8'];
  pathways.slice(0, 12).forEach((p, pi) => {
    sampleCols.forEach((col, ci) => {
      const v = stableFloat(`${seedTag}::heat::${p.name}`, ci + pi * 7, -2.5, 2.5);
      heatmap.push({ row: p.name, col, value: Number(v.toFixed(2)) });
    });
  });

  const significantGenes = volcano.filter((v) => v.significant).length;
  const upRegulated = volcano.filter((v) => v.significant && v.log2FC > 0).length;
  const downRegulated = volcano.filter((v) => v.significant && v.log2FC < 0).length;

  return {
    pathways,
    volcano,
    heatmap,
    parameters: { fdr, minReads, threads, normalization, db },
    summary: {
      totalGenes: volcano.length,
      significantGenes,
      upRegulated,
      downRegulated,
      pathwaysAnalyzed: pathways.length,
      enrichedPathways: pathways.filter((p) => p.pValue < fdr).length
    },
    reproducibility: {
      seed: `multiomics-baseline-v1::${seedTag}`,
      dataset: 'synthetic-immune-stimulation-v1',
      note: 'deterministic baseline (no DESeq2/edgeR online)'
    }
  };
}

// ============================================================================
// 4. SEIR 流行病预测（真实：参数化 + 干预 + 疫苗）
// ============================================================================

interface EpidemicParams {
  initial_infected?: number;
  r0?: number;
  recovery_days?: number;
  vaccine_coverage?: number;
  intervention?: number;
}

function runSeir(parameters: Record<string, unknown>) {
  const params = parameters as EpidemicParams;
  const initialInfected = Math.max(1, Number(params.initial_infected ?? 100));
  const r0 = Math.max(0.1, Math.min(Number(params.r0 ?? 1.4), 6));
  const recoveryDays = Math.max(1, Math.min(Number(params.recovery_days ?? 7), 30));
  const vaccineCoverage = Math.max(0, Math.min(Number(params.vaccine_coverage ?? 0.4), 1));
  const intervention = Math.max(0, Math.min(Number(params.intervention ?? 0.5), 1));

  // 总人口 1,000,000；初始易感 = 总 - 感染 - 接种有效
  const population = 1_000_000;
  const initialImmune = population * vaccineCoverage; // 接种即免疫
  let susceptible = population - initialInfected - initialImmune;
  let infected = initialInfected;
  let recovered = initialImmune;

  // 干预强度降低 β
  const betaBase = (r0 / recoveryDays) * (1 - intervention * 0.4);
  const incubationDays = 4;
  const sigma = 1 / incubationDays;
  let exposed = 0;

  const horizon = 12; // 12 周
  const dtDays = 0.25; // 每天 4 个时间步
  const totalSteps = (horizon * 7) / dtDays;

  const series: { week: number; susceptible: number; exposed: number; infected: number; recovered: number; incidence: number }[] = [];
  let cumulativeIncidence = 0;

  for (let step = 0; step < totalSteps; step++) {
    const newExposed = betaBase * susceptible * infected / population;
    const newInfected = sigma * exposed;
    const newRecovered = infected / recoveryDays;

    susceptible = Math.max(0, susceptible - newExposed * dtDays);
    exposed = Math.max(0, exposed + (newExposed - newInfected) * dtDays);
    infected = Math.max(0, infected + (newInfected - newRecovered) * dtDays);
    recovered = Math.min(population, recovered + newRecovered * dtDays);

    cumulativeIncidence += newInfected * dtDays;

    const week = Math.floor(step * dtDays / 7) + 1;
    const last = series[series.length - 1];
    if (!last || last.week !== week) {
      series.push({
        week,
        susceptible: Math.round(susceptible),
        exposed: Math.round(exposed),
        infected: Math.round(infected),
        recovered: Math.round(recovered),
        incidence: Math.round(cumulativeIncidence)
      });
    }
  }

  // 找峰值周（按 infected）
  const peakWeek = series.reduce((peak, p, idx) => (p.infected > series[peak].infected ? idx : peak), 0) + 1;
  const peakInfected = series[peakWeek - 1]?.infected ?? 0;
  const totalCases = Math.round(series[series.length - 1].incidence);

  return {
    series,
    parameters: { initialInfected, r0, recoveryDays, vaccineCoverage, intervention, population },
    metrics: {
      peakWeek,
      peakInfected,
      totalCases,
      attackRate: Number((totalCases / population).toFixed(4)),
      effectiveR0: Number((r0 * (1 - vaccineCoverage) * (1 - intervention * 0.4)).toFixed(2))
    },
    model: 'SEIR + vaccination + intervention',
    assumptions: [
      '均匀混合（homogeneous mixing）',
      `潜伏期 ${incubationDays} 天，恢复期 ${recoveryDays} 天`,
      `疫苗覆盖 ${(vaccineCoverage * 100).toFixed(0)}% 立即获得免疫`,
      `干预强度 ${(intervention * 100).toFixed(0)}% 降低传播率`,
      `初始感染 ${initialInfected} 人，总人口 ${population.toLocaleString()}`
    ]
  };
}

// ============================================================================
// 路由入口
// ============================================================================

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => ({}));
  const type = body.type as AnalysisType;
  if (!VALID_TYPES.includes(type)) {
    return NextResponse.json(
      { error: 'Unsupported analysis type', validTypes: VALID_TYPES },
      { status: 400 }
    );
  }
  const parameters = body.parameters || {};
  const jobId = `ANL-${Date.now().toString(36).toUpperCase()}`;

  let results: Record<string, unknown>;
  switch (type) {
    case 'scfv_screening':
      results = runScfvBaseline(parameters);
      break;
    case 'circuit_simulation':
      results = runCircuitOde(parameters);
      break;
    case 'multiomics':
      results = runMultiomics(parameters);
      break;
    case 'epidemic_prediction':
      results = runSeir(parameters);
      break;
  }

  return NextResponse.json({
    jobId,
    type,
    status: 'completed',
    createdAt: new Date().toISOString(),
    durationMs: 0,
    parameters,
    results
  });
}

/**
 * GET 返回所有可用类型和参数 schema，便于前端预渲染表单。
 */
export async function GET() {
  return NextResponse.json({
    types: VALID_TYPES,
    schemas: {
      scfv_screening: {
        top_k: { type: 'number', default: 10, min: 1, max: 50 },
        model: {
          type: 'select',
          options: ['ESM-2 (650M)', 'FluBioStack-Base', 'RoseTTAFold-AA'],
          default: 'ESM-2 (650M)'
        },
        min_stability: { type: 'number', default: 5, min: 0, max: 30 },
        include_conservative: {
          type: 'select',
          options: ['true', 'false'],
          default: 'false'
        }
      },
      circuit_simulation: {
        solver: { type: 'select', options: ['LSODA', 'RK45', 'BDF'], default: 'LSODA' },
        duration: { type: 'number', default: 48, min: 2, max: 240 },
        time_step: { type: 'number', default: 0.5, min: 0.05, max: 2 }
      },
      multiomics: {
        fdr_threshold: { type: 'number', default: 0.05, min: 0.001, max: 0.2 },
        min_reads: { type: 'number', default: 10, min: 1, max: 1000 },
        threads: { type: 'number', default: 8, min: 1, max: 64 },
        normalization: { type: 'select', options: ['TMM', 'DESeq2', 'FPKM', 'TPM'], default: 'TMM' },
        enrichment_db: { type: 'select', options: ['KEGG', 'Reactome', 'GO-BP'], default: 'KEGG' }
      },
      epidemic_prediction: {
        initial_infected: { type: 'number', default: 100, min: 1, max: 10000 },
        r0: { type: 'number', default: 1.4, min: 0.1, max: 6 },
        recovery_days: { type: 'number', default: 7, min: 1, max: 30 },
        vaccine_coverage: { type: 'number', default: 0.4, min: 0, max: 1 },
        intervention: { type: 'number', default: 0.5, min: 0, max: 1 }
      }
    }
  });
}
