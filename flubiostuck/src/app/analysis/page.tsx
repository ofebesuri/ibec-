'use client';

import { useState, useEffect, useMemo, useRef, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import toast from 'react-hot-toast';
import {
  Activity,
  Atom,
  Beaker,
  ChevronRight,
  Clock,
  Cpu,
  Download,
  Loader2,
  Network,
  Play,
  TrendingUp,
  Zap
} from 'lucide-react';
import { DeepChart } from '@/components/visualization/DeepChart';

type ModuleId = 'multiomics' | 'scfv' | 'circuit' | 'epidemic';

interface ParamDef {
  key: string;
  label: string;
  value: string;
  type: 'number' | 'text' | 'select';
  options?: string[];
}

interface ModuleDef {
  id: ModuleId;
  title: string;
  subtitle: string;
  description: string;
  icon: any;
  accent: string;
  duration: string;
  inputTypes: string[];
  parameters: ParamDef[];
}

const ANALYSIS_TYPE_MAP: Record<ModuleId, string> = {
  multiomics: 'multiomics',
  scfv: 'scfv_screening',
  circuit: 'circuit_simulation',
  epidemic: 'epidemic_prediction'
};

const analysisModules: ModuleDef[] = [
  {
    id: 'multiomics',
    title: '多组学整合',
    subtitle: 'Multi-Omics Integration',
    description: '基因组·转录组·蛋白组·代谢组整合通路富集 · 参数化 mock（确定性 baseline）',
    icon: Activity,
    accent: 'from-bio-500 to-glow-500',
    duration: '~4 min',
    inputTypes: ['.csv', '.tsv', '.h5', '.fasta'],
    parameters: [
      { key: 'fdr_threshold', label: 'FDR 阈值', value: '0.05', type: 'number' },
      { key: 'min_reads', label: '最小读段数', value: '10', type: 'number' },
      { key: 'threads', label: '并行线程', value: '8', type: 'number' },
      {
        key: 'normalization',
        label: '标准化方法',
        value: 'TMM',
        type: 'select',
        options: ['TMM', 'DESeq2', 'FPKM', 'TPM']
      },
      {
        key: 'enrichment_db',
        label: '富集数据库',
        value: 'KEGG',
        type: 'select',
        options: ['KEGG', 'Reactome', 'GO-BP']
      }
    ]
  },
  {
    id: 'scfv',
    title: 'scFv 突变筛选',
    subtitle: 'scFv Mutation Screening',
    description: '基于确定性 baseline 的稳定性+亲和力打分，可复现 seed',
    icon: Zap,
    accent: 'from-compute-500 to-bio-500',
    duration: '~3 min',
    inputTypes: ['.fasta', '.csv', '.pdb'],
    parameters: [
      {
        key: 'model',
        label: '预测模型',
        value: 'ESM-2 (650M)',
        type: 'select',
        options: ['ESM-2 (650M)', 'FluBioStack-Base', 'RoseTTAFold-AA']
      },
      { key: 'top_k', label: '候选数量', value: '10', type: 'number' },
      { key: 'min_stability', label: '最低 ΔTm (°C)', value: '5', type: 'number' },
      {
        key: 'include_conservative',
        label: '包含保守突变',
        value: 'false',
        type: 'select',
        options: ['true', 'false']
      }
    ]
  },
  {
    id: 'circuit',
    title: '回路动力学仿真',
    subtitle: 'Circuit Dynamics Simulation',
    description: 'RK4 求解双自杀开关 Hill 函数反馈系统',
    icon: Network,
    accent: 'from-glow-500 to-compute-500',
    duration: '~2 min',
    inputTypes: ['.sbml', '.json', '.csv'],
    parameters: [
      {
        key: 'solver',
        label: 'ODE 求解器',
        value: 'LSODA',
        type: 'select',
        options: ['LSODA', 'RK45', 'BDF']
      },
      { key: 'duration', label: '仿真时长 (h)', value: '48', type: 'number' },
      { key: 'time_step', label: '时间步长 (h)', value: '0.5', type: 'number' }
    ]
  },
  {
    id: 'epidemic',
    title: 'SEIR 区域预测',
    subtitle: 'Epidemic SEIR Forecast',
    description: 'SEIR + 疫苗 + 干预的真实 ODE 仿真（参数化）',
    icon: TrendingUp,
    accent: 'from-ip-500 to-compute-500',
    duration: '~1 min',
    inputTypes: ['.csv', '.json'],
    parameters: [
      { key: 'initial_infected', label: '初始感染人数', value: '100', type: 'number' },
      { key: 'r0', label: '基本再生数 R0', value: '1.4', type: 'number' },
      { key: 'recovery_days', label: '恢复周期 (天)', value: '7', type: 'number' },
      { key: 'vaccine_coverage', label: '疫苗覆盖 (0-1)', value: '0.4', type: 'number' },
      { key: 'intervention', label: '干预强度 (0-1)', value: '0.5', type: 'number' }
    ]
  }
];

export default function AnalysisPage() {
  return (
    <Suspense fallback={<div className="p-10 text-text-secondary">载入分析控制台...</div>}>
      <AnalysisWorkbench />
    </Suspense>
  );
}

function AnalysisWorkbench() {
  const searchParams = useSearchParams();
  const initial = (searchParams?.get('module') as ModuleId) || 'multiomics';
  const [active, setActive] = useState<ModuleId>(initial);
  const [running, setRunning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [stage, setStage] = useState<'idle' | 'submitting' | 'computing' | 'finalizing'>('idle');
  const [logs, setLogs] = useState<string[]>([]);
  const [completed, setCompleted] = useState(false);
  const [paramState, setParamState] = useState<Record<string, string>>({});
  const [result, setResult] = useState<any | null>(null);
  const [runId, setRunId] = useState<string | null>(null);
  const resultsRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const mod = analysisModules.find((m) => m.id === active);
    if (mod) {
      const state: Record<string, string> = {};
      mod.parameters.forEach((p) => (state[p.key] = p.value));
      setParamState(state);
    }
    setLogs([]);
    setProgress(0);
    setCompleted(false);
    setResult(null);
    setRunId(null);
    setStage('idle');
  }, [active]);

  function appendLog(line: string) {
    setLogs((prev) => [...prev, `[${new Date().toLocaleTimeString('en-GB')}] ${line}`]);
  }

  async function runAnalysis() {
    if (running) return;
    setRunning(true);
    setProgress(0);
    setCompleted(false);
    setLogs([]);
    setResult(null);
    setRunId(null);
    setStage('submitting');
    appendLog(`▶ 提交任务 · 模块=${active} · type=${ANALYSIS_TYPE_MAP[active]}`);

    // 构造参数：number 类型转 number，select 保持字符串
    const mod = analysisModules.find((m) => m.id === active)!;
    const parameters: Record<string, unknown> = {};
    mod.parameters.forEach((p) => {
      const v = paramState[p.key] ?? p.value;
      parameters[p.key] = p.type === 'number' ? Number(v) : v;
    });
    appendLog(`▶ 参数: ${JSON.stringify(parameters)}`);

    setProgress(15);
    try {
      setStage('computing');
      appendLog('▶ 已发送请求至 /api/analysis · 等待计算…');
      const response = await fetch('/api/analysis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: ANALYSIS_TYPE_MAP[active], parameters })
      });
      setProgress(60);
      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.error || `HTTP ${response.status}`);
      }
      const data = await response.json();
      setProgress(85);
      setStage('finalizing');
      appendLog(`✓ 任务完成 · jobId=${data.jobId}`);

      if (active === 'scfv') {
        appendLog(`✓ 返回 ${data.results.candidates.length} 个候选突变`);
      } else if (active === 'circuit') {
        appendLog(`✓ ODE 求解完成 · ${data.results.series.length} 个时间点 · 切换时间 ${data.results.metrics.toggleTime}h`);
      } else if (active === 'multiomics') {
        appendLog(`✓ 多组学完成 · ${data.results.summary.significantGenes} 显著基因 · ${data.results.summary.enrichedPathways} 富集通路`);
      } else if (active === 'epidemic') {
        appendLog(`✓ SEIR 预测完成 · 峰值 W${data.results.metrics.peakWeek} · 累计 ${data.results.metrics.totalCases.toLocaleString()} 例`);
      }

      setProgress(100);
      setResult(data);
      setRunId(data.jobId);
      setCompleted(true);
      toast.success(`分析完成 · ${data.jobId}`);

      // 滚动到结果
      setTimeout(() => {
        resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
    } catch (err) {
      const msg = err instanceof Error ? err.message : '分析失败';
      appendLog(`✗ 错误: ${msg}`);
      toast.error(msg);
      setProgress(0);
    } finally {
      setRunning(false);
      setStage('idle');
    }
  }

  async function exportReport() {
    if (!result) return;
    try {
      const [{ default: jsPDF }, html2canvasModule] = await Promise.all([
        import('jspdf'),
        import('html2canvas')
      ]);
      const html2canvas = (html2canvasModule as any).default ?? html2canvasModule;
      const jsPDFCtor = (jsPDF as any).default ?? jsPDF;

      const target = resultsRef.current;
      if (!target) {
        toast.error('结果区域未渲染');
        return;
      }

      toast.loading('PDF 报告生成中…', { id: 'pdf' });
      const canvas = await html2canvas(target, {
        backgroundColor: '#05070F',
        scale: 2,
        logging: false
      });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDFCtor({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = pageWidth - 20;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      // 标题
      pdf.setFontSize(16);
      pdf.text(`FluBioStack Analysis Report`, 10, 14);
      pdf.setFontSize(10);
      pdf.text(`Module: ${active}`, 10, 20);
      pdf.text(`Job ID: ${result.jobId}`, 10, 25);
      pdf.text(`Generated: ${new Date().toISOString()}`, 10, 30);
      pdf.text(`Parameters: ${JSON.stringify(result.parameters ?? {})}`, 10, 35, { maxWidth: pageWidth - 20 });

      let y = 42;
      if (imgHeight < pageHeight - y - 10) {
        pdf.addImage(imgData, 'PNG', 10, y, imgWidth, imgHeight);
      } else {
        // 多页：按页切割
        let position = 0;
        const pageImgHeight = pageHeight - y - 10;
        const ratio = imgHeight / canvas.height;
        const sliceCanvas = document.createElement('canvas');
        sliceCanvas.width = canvas.width;
        const sliceHeightPx = pageImgHeight / ratio;
        while (position < canvas.height) {
          sliceCanvas.height = Math.min(sliceHeightPx, canvas.height - position);
          const ctx = sliceCanvas.getContext('2d')!;
          ctx.drawImage(
            canvas,
            0, position, canvas.width, sliceCanvas.height,
            0, 0, canvas.width, sliceCanvas.height
          );
          const sliceData = sliceCanvas.toDataURL('image/png');
          pdf.addImage(sliceData, 'PNG', 10, y, imgWidth, sliceCanvas.height * ratio);
          position += sliceCanvas.height;
          if (position < canvas.height) {
            pdf.addPage();
            y = 10;
          }
        }
      }

      pdf.save(`flubiostack_${active}_${result.jobId}.pdf`);
      toast.success('PDF 已生成', { id: 'pdf' });
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'PDF 生成失败';
      toast.error(msg, { id: 'pdf' });
    }
  }

  const mod = analysisModules.find((m) => m.id === active)!;

  return (
    <div className="px-4 lg:px-8 py-5 lg:py-7 space-y-6">
      <div>
        <div className="text-[10px] font-mono tracking-[0.24em] uppercase text-text-tertiary">
          ANALYSIS WORKBENCH · v2026.09.20
        </div>
        <h1 className="text-2xl lg:text-3xl font-bold text-white mt-1.5">
          在线分析 <span className="gradient-text">可复现 · 可解释 · 可保护</span>
        </h1>
        <p className="mt-2 text-text-secondary text-sm">
          四大科研工作流（多组学 · scFv · 回路 · SEIR）· 真实后端计算 · 参数生效 · 可导出 PDF 报告。
        </p>
      </div>

      {/* 模块选择 */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {analysisModules.map((m) => {
          const Icon = m.icon;
          const isActive = m.id === active;
          return (
            <button
              key={m.id}
              onClick={() => setActive(m.id)}
              className={`text-left p-4 rounded-lg border transition ${
                isActive
                  ? 'border-compute-500/60 bg-gradient-to-br from-compute-700/30 to-bio-700/20 shadow-glow-sm'
                  : 'border-white/10 bg-ink-900/40 hover:border-compute-500/40'
              }`}
              aria-pressed={isActive}
            >
              <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${m.accent} flex items-center justify-center text-ink-950 shadow-glow-sm`}>
                <Icon className="w-5 h-5" strokeWidth={2.4} />
              </div>
              <div className="mt-2 text-sm font-semibold text-white">{m.title}</div>
              <div className="text-[11px] text-text-tertiary mt-1">{m.subtitle}</div>
              <div className="mt-2 text-[10px] font-mono text-bio-200 tracking-wider">{m.duration}</div>
            </button>
          );
        })}
      </div>

      {/* 主区：参数 + 运行控制 */}
      <div className="grid lg:grid-cols-[1.1fr_1fr] gap-4">
        <div className="panel-strong p-5">
          <div className="flex items-center justify-between mb-3">
            <div>
              <div className="text-[10px] font-mono tracking-[0.2em] uppercase text-text-tertiary">PARAMETERS</div>
              <div className="text-base font-semibold text-white mt-1">{mod.title}</div>
            </div>
            <span className="badge badge-info text-[10px]">{mod.parameters.length} 参数</span>
          </div>
          <div className="space-y-3">
            {mod.parameters.map((p) => (
              <div key={p.key}>
                <label className="block text-[11px] font-mono tracking-[0.16em] uppercase text-text-tertiary mb-1">
                  {p.label}
                </label>
                {p.type === 'select' ? (
                  <select
                    className="input-base"
                    value={paramState[p.key] ?? p.value}
                    onChange={(e) => setParamState({ ...paramState, [p.key]: e.target.value })}
                  >
                    {p.options?.map((o) => (
                      <option key={o} value={o}>
                        {o}
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    type={p.type === 'number' ? 'number' : 'text'}
                    className="input-base"
                    value={paramState[p.key] ?? p.value}
                    onChange={(e) => setParamState({ ...paramState, [p.key]: e.target.value })}
                  />
                )}
              </div>
            ))}
          </div>
          <div className="mt-5 flex flex-wrap gap-2">
            <button
              onClick={runAnalysis}
              disabled={running}
              className="btn-primary"
            >
              {running ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
              {running ? '运行中...' : '启动运行'}
            </button>
            <button
              onClick={exportReport}
              disabled={!completed}
              className="btn-secondary"
            >
              <Download className="w-4 h-4" />
              导出 PDF
            </button>
          </div>
          {(running || progress > 0) && (
            <div className="mt-4">
              <div className="flex items-center justify-between text-[11px] font-mono text-text-tertiary mb-1">
                <span>进度 · {stageLabel(stage)}</span>
                <span className="text-bio-200">{progress}%</span>
              </div>
              <div className="progress-bar-war progress-bar-war--cyan">
                <div className="progress-bar-war__fill" style={{ width: `${progress}%` }} />
                <div className="progress-bar-war__label">
                  <span>{stage.toUpperCase()}</span>
                  <span>{progress}%</span>
                </div>
              </div>
              {runId && (
                <div className="mt-2 text-[10px] font-mono text-text-tertiary flex items-center gap-1.5">
                  <Clock className="w-3 h-3" />
                  jobId: <span className="text-bio-200">{runId}</span>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="panel-strong p-5">
          <div className="flex items-center justify-between mb-3">
            <div>
              <div className="text-[10px] font-mono tracking-[0.2em] uppercase text-text-tertiary">EXECUTION LOG</div>
              <div className="text-base font-semibold text-white mt-1">实时日志</div>
            </div>
            <span className="badge badge-info text-[10px]">tail -f</span>
          </div>
          <div className="bg-[rgba(1,202,217,0.06)] rounded-lg p-3 h-[280px] overflow-y-auto custom-scrollbar code-block">
            {logs.length === 0 ? (
              <span className="text-text-tertiary">点击「启动运行」开始记录日志...</span>
            ) : (
              logs.map((l, i) => (
                <div key={i} className="text-[12px] text-bio-200 whitespace-pre-wrap">
                  {l}
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* 结果区 */}
      {completed && result && (
        <div ref={resultsRef} className="space-y-4">
          <div className="panel-strong p-5">
            <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
              <div>
                <div className="text-[10px] font-mono tracking-[0.24em] uppercase text-text-tertiary">RESULTS · 真实后端输出</div>
                <div className="text-lg font-semibold text-white mt-1">
                  {mod.title} · 结果
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-2 text-[11px] font-mono text-text-tertiary">
                <span className="px-2 py-1 rounded bg-ink-800/70 border border-white/5 text-bio-200">
                  {result.jobId}
                </span>
                <span className="px-2 py-1 rounded bg-ink-800/70 border border-white/5">
                  {new Date(result.createdAt).toLocaleString('zh-CN')}
                </span>
                <span className="px-2 py-1 rounded bg-ink-800/70 border border-white/5">
                  {result.type}
                </span>
              </div>
            </div>

            <ResultRenderer module={active} data={result.results} />
          </div>
        </div>
      )}
    </div>
  );
}

function stageLabel(s: 'idle' | 'submitting' | 'computing' | 'finalizing'): string {
  switch (s) {
    case 'idle': return '就绪';
    case 'submitting': return '提交任务';
    case 'computing': return '后端计算';
    case 'finalizing': return '渲染结果';
  }
}

function ResultRenderer({ module, data }: { module: ModuleId; data: any }) {
  if (module === 'multiomics') return <MultiomicsResult data={data} />;
  if (module === 'scfv') return <ScfvResult data={data} />;
  if (module === 'circuit') return <CircuitResult data={data} />;
  return <EpidemicResult data={data} />;
}

// ============================================================================
// scFv 结果渲染
// ============================================================================
function ScfvResult({ data }: { data: any }) {
  const candidates: any[] = data.candidates ?? [];
  const reproducibility = data.reproducibility ?? {};
  const params = data.parameters ?? {};

  return (
    <div className="space-y-4">
      <div className="grid sm:grid-cols-4 gap-3">
        <Metric label="候选数量" value={candidates.length.toString()} sub={`top_k=${params.topK}`} />
        <Metric label="最低 ΔTm" value={`${params.minStability}°C`} sub="筛选阈值" />
        <Metric label="模型" value={params.model ?? '—'} sub="可切换" />
        <Metric label="Seed" value={(reproducibility.seed ?? '').slice(0, 18) + '…'} sub="可复现" />
      </div>

      <div className="grid lg:grid-cols-[1.4fr_1fr] gap-4">
        <Collapsible title="Top 候选突变" subtitle="STABILITY + AFFINITY" defaultOpen>
          <div className="overflow-x-auto rounded-lg border border-white/5">
            <table className="data-table">
              <thead>
                <tr>
                  <th>排名</th>
                  <th>突变</th>
                  <th>位置</th>
                  <th>稳定性分</th>
                  <th>亲和力分</th>
                  <th>ΔTm</th>
                </tr>
              </thead>
              <tbody>
                {candidates.map((c) => (
                  <tr key={c.rank}>
                    <td className="font-mono text-bio-200">#{c.rank}</td>
                    <td className="font-mono text-white">{c.mutation}</td>
                    <td className="font-mono text-text-secondary">{c.position}</td>
                    <td>
                      <ScoreBar value={c.stabilityScore} color="from-compute-500 to-bio-500" />
                    </td>
                    <td>
                      <ScoreBar value={c.affinityScore} color="from-bio-500 to-glow-500" />
                    </td>
                    <td className="font-mono text-glow-200">+{c.deltaTmC}°C</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Collapsible>

        <Collapsible title="候选打分分布" subtitle="STABILITY vs AFFINITY" defaultOpen>
          <DeepChart option={buildScfvScatterOption(candidates)} height={260} />
        </Collapsible>
      </div>

      <div className="panel px-4 py-3 text-xs text-text-secondary">
        <div className="text-[10px] font-mono tracking-[0.18em] uppercase text-text-tertiary mb-1">REPRODUCIBILITY</div>
        <div className="font-mono text-text-secondary">
          seed = {reproducibility.seed} · dataset = {reproducibility.dataset} · {reproducibility.note}
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// 回路结果渲染
// ============================================================================
function CircuitResult({ data }: { data: any }) {
  const series: any[] = data.series ?? [];
  const metrics = data.metrics ?? {};
  const assumptions: string[] = data.assumptions ?? [];

  return (
    <div className="space-y-4">
      <div className="grid sm:grid-cols-4 gap-3">
        <Metric label="切换时间" value={`${metrics.toggleTime}h`} sub="switch zero-cross" />
        <Metric label="峰值 GFP" value={metrics.peakGFP?.toFixed?.(3) ?? '—'} sub="max expression" />
        <Metric label="稳定指数" value={metrics.stabilityIndex?.toFixed?.(3) ?? '—'} sub="0~1" />
        <Metric label="时间点" value={series.length.toString()} sub={`dt=${data.parameters?.dt}h`} />
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        <Collapsible title="浓度时间序列" subtitle="A · B · GFP" defaultOpen>
          <DeepChart option={buildCircuitSeriesOption(series)} height={280} />
        </Collapsible>
        <Collapsible title="切换信号" subtitle="SWITCH = A - B" defaultOpen>
          <DeepChart option={buildCircuitSwitchOption(series)} height={280} />
        </Collapsible>
      </div>

      <Collapsible title="模型假设" subtitle="ASSUMPTIONS" defaultOpen>
        <ul className="space-y-1.5 text-xs text-text-secondary">
          {assumptions.map((a, i) => (
            <li key={i} className="flex items-start gap-2">
              <span className="mt-1 w-1.5 h-1.5 rounded-full bg-bio-300 flex-shrink-0" />
              <span className="font-mono">{a}</span>
            </li>
          ))}
        </ul>
      </Collapsible>
    </div>
  );
}

// ============================================================================
// 多组学结果渲染
// ============================================================================
function MultiomicsResult({ data }: { data: any }) {
  const pathways: any[] = data.pathways ?? [];
  const volcano: any[] = data.volcano ?? [];
  const heatmap: any[] = data.heatmap ?? [];
  const summary = data.summary ?? {};
  const params = data.parameters ?? {};

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <Metric label="总基因" value={summary.totalGenes?.toString() ?? '—'} />
        <Metric label="显著基因" value={summary.significantGenes?.toString() ?? '—'} sub="FDR+FC" />
        <Metric label="上调 / 下调" value={`${summary.upRegulated} / ${summary.downRegulated}`} sub="log2FC≥1.5" />
        <Metric label="富集通路" value={summary.enrichedPathways?.toString() ?? '—'} sub={`FDR=${params.fdr}`} />
        <Metric label="数据库" value={params.db ?? '—'} sub={params.normalization} />
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        <Collapsible title="火山图" subtitle="VOLCANO · log2FC × −log10(P)" defaultOpen>
          <DeepChart option={buildVolcanoOption(volcano)} height={300} />
        </Collapsible>
        <Collapsible title="富集通路打分" subtitle="PATHWAY SCORE" defaultOpen>
          <DeepChart option={buildPathwayBarOption(pathways)} height={300} />
        </Collapsible>
      </div>

      <Collapsible title="差异基因 × 样本热图" subtitle="HEATMAP · z-score" defaultOpen>
        <HeatmapView data={heatmap} />
      </Collapsible>
    </div>
  );
}

// ============================================================================
// SEIR 结果渲染
// ============================================================================
function EpidemicResult({ data }: { data: any }) {
  const series: any[] = data.series ?? [];
  const metrics = data.metrics ?? {};
  const assumptions: string[] = data.assumptions ?? [];

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <Metric label="峰值周" value={`W${metrics.peakWeek}`} sub="peak" />
        <Metric label="峰值感染" value={metrics.peakInfected?.toLocaleString() ?? '—'} sub="infected/day" />
        <Metric label="累计病例" value={metrics.totalCases?.toLocaleString() ?? '—'} sub="12 周" />
        <Metric label="发病率" value={`${(metrics.attackRate * 100).toFixed(2)}%`} sub="attack rate" />
        <Metric label="有效 R0" value={metrics.effectiveR0?.toFixed(2) ?? '—'} sub="after intervention" />
      </div>

      <Collapsible title="SEIR 12 周预测曲线" subtitle="EPIDEMIC FORECAST" defaultOpen>
        <DeepChart option={buildSeirOption(series)} height={320} />
      </Collapsible>

      <Collapsible title="模型假设" subtitle="ASSUMPTIONS" defaultOpen>
        <ul className="space-y-1.5 text-xs text-text-secondary">
          {assumptions.map((a, i) => (
            <li key={i} className="flex items-start gap-2">
              <span className="mt-1 w-1.5 h-1.5 rounded-full bg-bio-300 flex-shrink-0" />
              <span className="font-mono">{a}</span>
            </li>
          ))}
        </ul>
      </Collapsible>
    </div>
  );
}

// ============================================================================
// 子组件
// ============================================================================
function Metric({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="panel px-3 py-2.5">
      <div className="text-[10px] font-mono tracking-[0.18em] uppercase text-text-tertiary">{label}</div>
      <div className="mt-1 text-lg font-semibold text-white truncate">{value}</div>
      {sub && <div className="text-[10px] font-mono text-text-tertiary truncate">{sub}</div>}
    </div>
  );
}

function ScoreBar({ value, color }: { value: number; color: string }) {
  const pct = Math.round(value * 100);
  return (
    <div className="flex items-center gap-2">
      <div className="w-16 h-1.5 rounded bg-white/5 overflow-hidden">
        <div className={`h-full rounded bg-gradient-to-r ${color}`} style={{ width: `${pct}%` }} />
      </div>
      <span className="font-mono text-[11px] text-white">{value.toFixed(2)}</span>
    </div>
  );
}

function Collapsible({ title, subtitle, defaultOpen, children }: { title: string; subtitle?: string; defaultOpen?: boolean; children: React.ReactNode }) {
  const [open, setOpen] = useState(!!defaultOpen);
  return (
    <div className="panel">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full px-4 py-2.5 flex items-center justify-between text-left hover:bg-white/[0.02]"
      >
        <div>
          <div className="text-[10px] font-mono tracking-[0.18em] uppercase text-text-tertiary">{subtitle}</div>
          <div className="text-sm font-semibold text-white mt-0.5">{title}</div>
        </div>
        <ChevronRight className={`w-4 h-4 text-text-tertiary transition ${open ? 'rotate-90' : ''}`} />
      </button>
      {open && <div className="px-4 pb-4 pt-1">{children}</div>}
    </div>
  );
}

function HeatmapView({ data }: { data: { row: string; col: string; value: number }[] }) {
  const rows = Array.from(new Set(data.map((d) => d.row)));
  const cols = Array.from(new Set(data.map((d) => d.col)));
  const map = new Map<string, number>();
  data.forEach((d) => map.set(`${d.row}|${d.col}`, d.value));
  const min = Math.min(...data.map((d) => d.value));
  const max = Math.max(...data.map((d) => d.value));
  const color = (v: number) => {
    const t = (v - min) / (max - min || 1);
    if (t < 0.5) {
      const r = Math.round(11 + (1 - t * 2) * 30);
      const g = Math.round(16 + (1 - t * 2) * 30);
      const b = Math.round(32 + (1 - t * 2) * 60);
      return `rgb(${r},${g},${b})`;
    }
    const r = Math.round(63 - (t - 0.5) * 2 * 50);
    const g = Math.round(191 + (t - 0.5) * 2 * 30);
    const b = Math.round(219 - (t - 0.5) * 2 * 50);
    return `rgb(${Math.max(0,r)},${Math.min(255,g)},${Math.max(0,b)})`;
  };

  return (
    <div className="overflow-x-auto">
      <table className="text-[10px] font-mono">
        <thead>
          <tr>
            <th className="p-1.5 text-text-tertiary text-left">通路 \\ 样本</th>
            {cols.map((c) => (
              <th key={c} className="p-1.5 text-text-tertiary text-center">{c}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r}>
              <td className="p-1.5 text-text-secondary whitespace-nowrap">{r}</td>
              {cols.map((c) => {
                const v = map.get(`${r}|${c}`) ?? 0;
                return (
                  <td
                    key={c}
                    className="p-1.5 text-center text-white"
                    style={{ background: color(v), minWidth: 36 }}
                    title={`${r} · ${c} · ${v.toFixed(2)}`}
                  >
                    {v.toFixed(1)}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
      <div className="mt-3 flex items-center gap-2 text-[10px] font-mono text-text-tertiary">
        <span>z-score:</span>
        <span className="px-2 py-0.5 rounded" style={{ background: color(min) }}>{min.toFixed(1)}</span>
        <span className="flex-1 h-1.5 rounded" style={{ background: `linear-gradient(to right, ${color(min)}, ${color((min+max)/2)}, ${color(max)})` }} />
        <span className="px-2 py-0.5 rounded" style={{ background: color(max) }}>{max.toFixed(1)}</span>
      </div>
    </div>
  );
}

// ============================================================================
// ECharts option builders
// ============================================================================
function buildScfvScatterOption(candidates: any[]) {
  return {
    grid: { top: 24, right: 16, bottom: 40, left: 50 },
    tooltip: {
      trigger: 'item',
      formatter: (p: any) => `${p.data[2]}<br/>稳定性 ${p.data[0].toFixed(3)}<br/>亲和力 ${p.data[1].toFixed(3)}`
    },
    xAxis: { type: 'value', name: '稳定性', min: 0.5, max: 1, axisLabel: { color: '#6A77A8', fontSize: 10 } },
    yAxis: { type: 'value', name: '亲和力', min: 0.5, max: 1, axisLabel: { color: '#6A77A8', fontSize: 10 } },
    series: [{
      type: 'scatter',
      symbolSize: (v: any) => 6 + v[3] * 14,
      data: candidates.map((c) => [c.stabilityScore, c.affinityScore, c.mutation, c.deltaTmC / 20]),
      itemStyle: { color: '#16BFDB', opacity: 0.75, borderColor: '#7E3AFF', borderWidth: 1 }
    }]
  };
}

function buildCircuitSeriesOption(series: any[]) {
  return {
    grid: { top: 30, right: 16, bottom: 40, left: 50 },
    tooltip: { trigger: 'axis' },
    legend: { textStyle: { color: '#9BA8D0' }, top: 0 },
    xAxis: { type: 'category', name: '时间 (h)', data: series.map((p) => p.t), axisLabel: { color: '#6A77A8', fontSize: 9 } },
    yAxis: { type: 'value', axisLabel: { color: '#6A77A8', fontSize: 10 }, splitLine: { lineStyle: { color: 'rgba(155,168,208,0.08)' } } },
    series: [
      { name: 'A', type: 'line', smooth: true, showSymbol: false, data: series.map((p) => p.A), lineStyle: { color: '#16BFDB', width: 2 } },
      { name: 'B', type: 'line', smooth: true, showSymbol: false, data: series.map((p) => p.B), lineStyle: { color: '#935AFF', width: 2 } },
      { name: 'GFP', type: 'line', smooth: true, showSymbol: false, data: series.map((p) => p.GFP), lineStyle: { color: '#16D88A', width: 2 } }
    ]
  };
}

function buildCircuitSwitchOption(series: any[]) {
  return {
    grid: { top: 30, right: 16, bottom: 40, left: 50 },
    tooltip: { trigger: 'axis' },
    xAxis: { type: 'category', data: series.map((p) => p.t), axisLabel: { color: '#6A77A8', fontSize: 9 } },
    yAxis: { type: 'value', axisLabel: { color: '#6A77A8', fontSize: 10 }, splitLine: { lineStyle: { color: 'rgba(155,168,208,0.08)' } } },
    series: [{
      type: 'line',
      smooth: true,
      showSymbol: false,
      data: series.map((p) => p.switch),
      lineStyle: { color: '#FF9A1F', width: 2 },
      areaStyle: {
        color: {
          type: 'linear', x: 0, y: 0, x2: 0, y2: 1,
          colorStops: [
            { offset: 0, color: 'rgba(255,154,31,0.32)' },
            { offset: 1, color: 'rgba(255,154,31,0)' }
          ]
        }
      }
    }]
  };
}

function buildVolcanoOption(volcano: any[]) {
  const sig = volcano.filter((v) => v.significant);
  const ns = volcano.filter((v) => !v.significant);
  return {
    grid: { top: 24, right: 16, bottom: 40, left: 50 },
    tooltip: { trigger: 'item', formatter: (p: any) => `${p.data[2]}<br/>log2FC ${p.data[0].toFixed(2)}<br/>-log10(P) ${p.data[1].toFixed(2)}` },
    xAxis: { type: 'value', name: 'log2(FC)', nameTextStyle: { color: '#9BA8D0', fontSize: 10 }, axisLabel: { color: '#6A77A8', fontSize: 10 } },
    yAxis: { type: 'value', name: '-log10(P)', nameTextStyle: { color: '#9BA8D0', fontSize: 10 }, axisLabel: { color: '#6A77A8', fontSize: 10 }, splitLine: { lineStyle: { color: 'rgba(155,168,208,0.08)' } } },
    series: [
      {
        type: 'scatter',
        symbolSize: 8,
        data: ns.map((v) => [v.log2FC, v.negLog10P, v.gene]),
        itemStyle: { color: '#3F4A6B', opacity: 0.6 }
      },
      {
        type: 'scatter',
        symbolSize: 10,
        data: sig.map((v) => [v.log2FC, v.negLog10P, v.gene]),
        itemStyle: { color: '#16D88A', opacity: 0.85, borderColor: '#16BFDB', borderWidth: 1 }
      }
    ]
  };
}

function buildPathwayBarOption(pathways: any[]) {
  return {
    grid: { top: 20, right: 16, bottom: 70, left: 50 },
    tooltip: { trigger: 'axis' },
    xAxis: {
      type: 'category',
      data: pathways.map((p) => p.name),
      axisLabel: { color: '#6A77A8', fontSize: 10, rotate: 30, interval: 0 }
    },
    yAxis: { type: 'value', max: 1, axisLabel: { color: '#6A77A8', fontSize: 10 }, splitLine: { lineStyle: { color: 'rgba(155,168,208,0.08)' } } },
    series: [{
      type: 'bar',
      data: pathways.map((p) => p.score),
      itemStyle: {
        color: {
          type: 'linear', x: 0, y: 0, x2: 0, y2: 1,
          colorStops: [
            { offset: 0, color: '#16BFDB' },
            { offset: 1, color: '#7E3AFF' }
          ]
        },
        borderRadius: [4, 4, 0, 0]
      },
      label: { show: true, position: 'top', color: '#9BA8D0', fontSize: 10, formatter: (p: any) => p.value.toFixed(2) }
    }]
  };
}

function buildSeirOption(series: any[]) {
  return {
    grid: { top: 30, right: 16, bottom: 40, left: 50 },
    tooltip: { trigger: 'axis' },
    legend: { textStyle: { color: '#9BA8D0' }, top: 0 },
    xAxis: { type: 'category', name: '周', data: series.map((p) => `W${p.week}`), axisLabel: { color: '#6A77A8', fontSize: 10 } },
    yAxis: { type: 'value', axisLabel: { color: '#6A77A8', fontSize: 10 }, splitLine: { lineStyle: { color: 'rgba(155,168,208,0.08)' } } },
    series: [
      { name: '易感 S', type: 'line', smooth: true, showSymbol: false, data: series.map((p) => p.susceptible), lineStyle: { color: '#16BFDB', width: 2 } },
      { name: '暴露 E', type: 'line', smooth: true, showSymbol: false, data: series.map((p) => p.exposed), lineStyle: { color: '#FF9A1F', width: 2 } },
      { name: '感染 I', type: 'line', smooth: true, showSymbol: false, data: series.map((p) => p.infected), lineStyle: { color: '#FF4242', width: 2 } },
      { name: '恢复 R', type: 'line', smooth: true, showSymbol: false, data: series.map((p) => p.recovered), lineStyle: { color: '#16D88A', width: 2 } }
    ]
  };
}
