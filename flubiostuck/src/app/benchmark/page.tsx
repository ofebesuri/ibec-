'use client';

import { Fragment, useState, useEffect } from 'react';
import {
  Container,
  Download,
  GitBranch,
  Play,
  HardDrive,
  Cpu,
  Award,
  ExternalLink,
  Copy,
  Check,
  BarChart3,
  Clock,
  Gauge,
  Terminal,
  Trophy,
  Layers,
  Server,
  ChevronRight,
  ChevronDown,
  Sparkles,
  Loader2,
  Database,
  ArrowDownToLine,
  X
} from 'lucide-react';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { DeepChart, getFluBenchChartOption } from '@/components/visualization/DeepChart';
import { DEMO_BENCHMARKS } from '@/lib/demoData';
import { SITE_LINKS } from '@/lib/siteLinks';

const dockerImages = [
  {
    name: 'flubiostack/web',
    tag: 'v1.2.0',
    size: '1.2 GB',
    pulls: 1834,
    description: 'Web 平台 + 数据库 + LLM 智能体一体化镜像',
    lastUpdate: '2026-07-15',
    accent: 'from-compute-500 to-bio-500'
  },
  {
    name: 'flubiostack/analysis',
    tag: 'v1.2.0',
    size: '3.5 GB',
    pulls: 892,
    description: '多组学 · scFv · 回路 · SEIR 四大分析工具集',
    lastUpdate: '2026-07-15',
    accent: 'from-bio-500 to-glow-500'
  },
  {
    name: 'flubiostack/triomeflow',
    tag: 'v2.3.1',
    size: '890 MB',
    pulls: 567,
    description: 'TriOmeFlow 多组学整合流程 (Python/R/C++)',
    lastUpdate: '2026-06-28',
    accent: 'from-glow-500 to-compute-500'
  },
  {
    name: 'flubiostack/molstar',
    tag: 'v3.42.0',
    size: '450 MB',
    pulls: 423,
    description: '3D 蛋白结构可视化服务',
    lastUpdate: '2026-06-10',
    accent: 'from-compute-500 to-ip-400'
  }
];

const versionHistory = [
  {
    version: 'v1.2.0',
    date: '2026-07-15',
    improvements: ['新增 LLM 智能体', '优化 scFv 预测速度 3x', '支持 12 种流感亚型'],
    status: 'current'
  },
  {
    version: 'v1.1.0',
    date: '2026-04-20',
    improvements: ['增加 IP 风险评估模块', '社区数据上传功能'],
    status: 'archived'
  },
  {
    version: 'v1.0.0',
    date: '2026-01-10',
    improvements: ['首发版本', '核心四大分析模块', '元件数据库'],
    status: 'archived'
  }
];

const algorithms = [
  { name: 'FluBioStack-AI', accuracy: 94.2, runtime: 12.3, memory: 256, f1Score: 0.93, useCase: '通用预测', group: 'core' },
  { name: 'Baseline-v2', accuracy: 87.5, runtime: 18.7, memory: 384, f1Score: 0.86, useCase: '基线对照', group: 'core' },
  { name: 'DeepSeq-3', accuracy: 91.3, runtime: 24.5, memory: 512, f1Score: 0.9, useCase: '深度序列分析', group: 'seq' },
  { name: 'BioBERT-Large', accuracy: 88.9, runtime: 32.1, memory: 768, f1Score: 0.88, useCase: '文本挖掘', group: 'nlp' },
  { name: 'ESM-2 (650M)', accuracy: 89.7, runtime: 45.2, memory: 1024, f1Score: 0.89, useCase: '蛋白语言模型', group: 'protein' },
  { name: 'AlphaFold-Multimer', accuracy: 92.1, runtime: 58.3, memory: 2048, f1Score: 0.91, useCase: '复合体预测', group: 'structure' },
  { name: 'RoseTTAFold', accuracy: 90.5, runtime: 41.7, memory: 1536, f1Score: 0.89, useCase: '蛋白结构', group: 'structure' },
  { name: 'ProtBERT', accuracy: 86.2, runtime: 28.9, memory: 640, f1Score: 0.85, useCase: '蛋白功能', group: 'protein' },
  { name: 'DNABERT-2', accuracy: 89.4, runtime: 19.8, memory: 512, f1Score: 0.88, useCase: 'DNA 序列', group: 'nlp' },
  { name: 'HyenaDNA', accuracy: 87.8, runtime: 22.4, memory: 448, f1Score: 0.87, useCase: '长序列建模', group: 'seq' },
  { name: 'Evo-2', accuracy: 91.7, runtime: 38.6, memory: 1280, f1Score: 0.9, useCase: '基因组建模', group: 'genome' },
  { name: 'ScFv-Specialist', accuracy: 93.5, runtime: 15.2, memory: 320, f1Score: 0.92, useCase: '抗体专项', group: 'core' }
];

export default function BenchmarkPage() {
  const [copiedCmd, setCopiedCmd] = useState<string | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [runOutput, setRunOutput] = useState<string>('');
  const [lastResult, setLastResult] = useState<any | null>(null);
  const [changelogFor, setChangelogFor] = useState<string | null>(null);
  const [expandedAlgo, setExpandedAlgo] = useState<string | null>(null);

  const copyCommand = async (cmd: string) => {
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(cmd);
      } else {
        const textarea = document.createElement('textarea');
        textarea.value = cmd;
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
      }
      setCopiedCmd(cmd);
      toast.success('命令已复制');
      setTimeout(() => setCopiedCmd(null), 2000);
    } catch (e) {
      toast.error('复制失败，请手动复制');
    }
  };

  const runBench = async () => {
    setIsRunning(true);
    setRunOutput('');
    try {
      const response = await fetch('/api/benchmark', { method: 'POST' });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || '基准测试失败');
      setLastResult(result);
      setRunOutput(
        `runId=${result.runId}\nstatus=${result.status}\nalgorithm=${result.algorithm}\ndataset=${result.dataset}\nsamples=${result.metrics.samples}\nmean=${result.metrics.mean}\nstdev=${result.metrics.stdev}\nruntime=${result.metrics.runtimeMs}ms\nseed=${result.reproducibility.seed}\nnode=${result.reproducibility.node}\nstatus=OK`
      );
      toast.success(
        `完成：${result.metrics.samples} 个样本 · mean=${result.metrics.mean} · ${result.metrics.runtimeMs} ms`,
        { id: 'benchmark' }
      );
    } catch (error) {
      setRunOutput(`ERROR: ${error instanceof Error ? error.message : '基准测试失败'}`);
      toast.error(error instanceof Error ? error.message : '基准测试失败', {
        id: 'benchmark'
      });
    } finally {
      setIsRunning(false);
    }
  };

  const downloadAlgorithmsCsv = () => {
    const header = 'algorithm,accuracy,runtime,memory,f1Score,useCase,group';
    const lines = algorithms.map(
      (a) => `${a.name},${a.accuracy},${a.runtime},${a.memory},${a.f1Score},${a.useCase},${a.group}`
    );
    const csv = [header, ...lines].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `flubiostack_algorithms_${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success(`已导出 ${algorithms.length} 个算法数据 CSV`);
  };

  const top = algorithms.slice().sort((a, b) => b.accuracy - a.accuracy);

  return (
    <div className="px-4 lg:px-8 py-5 lg:py-7">
      {/* Header */}
      <div className="mb-6 flex flex-col lg:flex-row lg:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="chip">
              <Cpu className="w-3 h-3" />
              FluBench Benchmark Suite
            </span>
            <span className="badge badge-success">
              <Server className="w-3 h-3" />
              可复现 · seed 锁定
            </span>
          </div>
          <h1 className="text-2xl lg:text-3xl font-bold text-white">
            FluBench · 基准与可复现流程
          </h1>
          <p className="text-text-secondary text-sm mt-1 max-w-3xl">
            12 个主流算法横向对比 · Docker 一键复现 · 流程版本回溯 · 现场 3 分钟可演示。
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button onClick={runBench} disabled={isRunning} className="btn-primary">
            {isRunning ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                运行中…
              </>
            ) : (
              <>
                <Play className="w-4 h-4" />
                运行基准
              </>
            )}
          </button>
          <button onClick={downloadAlgorithmsCsv} className="btn-secondary">
            <ArrowDownToLine className="w-4 h-4" />
            下载算法 CSV
          </button>
        </div>
      </div>

      {/* Stats band */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        {[
          { icon: Container, label: 'Docker 镜像', value: '4', sub: 'flubiostack/*' },
          { icon: Award, label: '基准算法', value: '12', sub: '5 个 group' },
          { icon: Download, label: '下载次数', value: '3.7K', sub: '近 30 天' },
          { icon: GitBranch, label: '版本数', value: '23', sub: '可回溯' }
        ].map((s) => {
          const Icon = s.icon;
          return (
            <div key={s.label} className="panel px-4 py-3 flex items-center gap-3 glow-enhance">
              <span className="w-10 h-10 rounded-xl bg-gradient-to-br from-compute-500 to-bio-500 flex items-center justify-center text-ink-950 shadow-glow-sm rotate-node">
                <Icon className="w-4 h-4 rotate-node__satellite" strokeWidth={2.4} />
              </span>
              <div className="min-w-0">
                <div className="text-[10px] font-mono tracking-[0.24em] uppercase text-text-tertiary">
                  {s.label}
                </div>
                <div className="text-2xl font-semibold text-white font-mono">{s.value}</div>
                <div className="text-[11px] text-text-secondary">{s.sub}</div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Docker */}
      <section className="panel-strong p-5 lg:p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="text-[10px] font-mono tracking-[0.24em] uppercase text-text-tertiary">
              DOCKER REGISTRY
            </div>
            <h2 className="text-lg font-semibold text-white">Docker 镜像库</h2>
          </div>
          <span className="badge badge-info">
            <ArrowDownToLine className="w-3 h-3" />
            Docker Hub
          </span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {dockerImages.map((image) => (
            <div
              key={image.name}
              className="panel p-5 hover:border-compute-500/40 glow-enhance glow-enhance--cyan group relative"
            >
              <div className="flex items-start gap-3 mb-3">
                <span
                  className={`w-10 h-10 rounded-xl bg-gradient-to-br ${image.accent} flex items-center justify-center text-ink-950 shadow-glow-sm rotate-node`}
                >
                  <Container className="w-5 h-5 rotate-node__satellite" strokeWidth={2.4} />
                </span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className="font-mono text-sm font-semibold text-white">
                      {image.name}
                    </span>
                    <span className="font-mono text-xs px-1.5 py-0.5 rounded bg-compute-700/30 text-bio-200 border border-compute-500/40">
                      {image.tag}
                    </span>
                  </div>
                  <p className="text-xs text-text-secondary">{image.description}</p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3 mb-3 text-xs">
                <Stat label="大小" value={image.size} icon={HardDrive} />
                <Stat label="拉取数" value={image.pulls.toLocaleString()} icon={Download} />
                <Stat label="更新" value={image.lastUpdate} icon={Clock} />
              </div>

              <div className="flex items-center gap-2 panel bg-ink-950/70 px-3 py-2">
                <Terminal className="w-3.5 h-3.5 text-glow-300 flex-shrink-0" />
                <code className="flex-1 text-xs font-mono text-glow-200 truncate">
                  docker pull {image.name}:{image.tag}
                </code>
                <button
                  onClick={() => copyCommand(`docker pull ${image.name}:${image.tag}`)}
                  className="p-1 rounded text-text-tertiary hover:text-white"
                  aria-label="Copy"
                >
                  {copiedCmd === `docker pull ${image.name}:${image.tag}` ? (
                    <Check className="w-3.5 h-3.5 text-glow-300" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 panel p-5">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="w-4 h-4 text-bio-300" />
            <h3 className="text-sm font-semibold text-white">一键复现完整平台</h3>
          </div>
          <p className="text-xs text-text-secondary mb-4">
            Docker Compose 一键启动完整 FluBioStack（含 Postgres + Redis）。
          </p>
          <div className="relative">
            <pre className="code-block overflow-x-auto">{`# 下载配置文件
curl -O https://flubiostack.io/docker-compose.yml

# 启动所有服务
docker-compose up -d

# 等待 30 秒后访问
open http://localhost:3000`}</pre>
            <button
              onClick={() => copyCommand('curl -O https://flubiostack.io/docker-compose.yml')}
              className="absolute top-2 right-2 p-1.5 rounded text-text-tertiary hover:text-white hover:bg-white/5"
              aria-label="Copy"
            >
              {copiedCmd === 'curl -O https://flubiostack.io/docker-compose.yml' ? (
                <Check className="w-3.5 h-3.5 text-glow-300" />
              ) : (
                <Copy className="w-3.5 h-3.5" />
              )}
            </button>
          </div>
        </div>
      </section>

      {/* Benchmark chart + leaderboard */}
      <section className="panel-strong p-5 lg:p-6 mb-6">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-3 mb-4">
          <div>
            <div className="text-[10px] font-mono tracking-[0.24em] uppercase text-text-tertiary">
              BENCHMARK CHART · H5N1-2023
            </div>
            <h2 className="text-lg font-semibold text-white">算法性能对比</h2>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="badge badge-info">数据集 H5N1-2023</span>
            <span className="badge badge-success">12 算法</span>
          </div>
        </div>
        <div className="grid lg:grid-cols-[2fr_1fr] gap-5">
          <div className="panel bg-ink-950/60 p-3">
            <DeepChart option={getFluBenchChartOption()} height={360} />
          </div>

          <div className="space-y-2 max-h-[400px] overflow-y-auto pr-1">
            {top.map((bench, idx) => (
              <div
                key={bench.name}
                className={`panel p-4 ${
                  idx === 0 ? 'border-glow-400/50 shadow-glow-sm glow-enhance glow-enhance--cyan' : ''
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-mono text-sm font-semibold text-white flex items-center gap-2">
                    {idx === 0 && <span className="pulse-ring pulse-ring--cyan" aria-hidden />}
                    {bench.name}
                  </span>
                  {idx === 0 && (
                    <span className="badge badge-success text-[10px]">
                      <Trophy className="w-3 h-3" />
                      BEST
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-3 gap-2 text-xs">
                  <MiniStat label="准确率" value={`${bench.accuracy}%`} color="text-bio-200" />
                  <MiniStat label="耗时" value={`${bench.runtime}s`} color="text-glow-200" />
                  <MiniStat label="F1" value={bench.f1Score.toFixed(2)} color="text-ip-200" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {runOutput && (
          <div className="mt-5 panel bg-ink-950/80 p-4">
            <div className="text-[10px] font-mono tracking-[0.18em] uppercase text-text-tertiary mb-2">
              LAST RUN OUTPUT
            </div>
            <pre className="font-mono text-xs text-glow-200 whitespace-pre-wrap">{runOutput}</pre>
          </div>
        )}
      </section>

      {/* Algorithm comparison table */}
      <section className="panel-strong overflow-hidden mb-6">
        <div className="px-5 lg:px-6 py-4 border-b border-white/5 flex items-center justify-between">
          <div>
            <div className="text-[10px] font-mono tracking-[0.24em] uppercase text-text-tertiary">
              ALGORITHM TABLE
            </div>
            <h2 className="text-lg font-semibold text-white">12 种算法详细对比</h2>
          </div>
          <button
            onClick={downloadAlgorithmsCsv}
            className="btn-secondary text-xs"
          >
            <ArrowDownToLine className="w-3 h-3" />
            导出 CSV
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th>算法</th>
                <th>适用场景</th>
                <th className="text-right">准确率</th>
                <th className="text-right">F1</th>
                <th className="text-right">耗时 (s)</th>
                <th className="text-right">内存 (MB)</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {algorithms.map((algo, idx) => {
                const expanded = expandedAlgo === algo.name;
                return (
                  <Fragment key={algo.name}>
                    <tr>
                      <td className="font-mono font-medium text-white">
                        <div className="flex items-center gap-2">
                          {idx === 0 && (
                            <span className="w-1.5 h-1.5 rounded-full bg-glow-400 animate-glow-pulse" />
                          )}
                          {algo.name}
                        </div>
                      </td>
                      <td className="text-text-secondary">{algo.useCase}</td>
                      <td className="text-right font-mono text-bio-200 font-semibold">
                        {algo.accuracy}%
                      </td>
                      <td className="text-right font-mono text-ip-200">
                        {algo.f1Score.toFixed(2)}
                      </td>
                      <td className="text-right font-mono text-glow-200">{algo.runtime}</td>
                      <td className="text-right font-mono text-text-secondary">{algo.memory}</td>
                      <td className="text-right">
                        <button
                          onClick={() => setExpandedAlgo(expanded ? null : algo.name)}
                          className="text-xs text-bio-200 hover:text-white flex items-center gap-1 justify-end"
                        >
                          {expanded ? '收起' : '详情'}
                          <ChevronDown className={`w-3 h-3 transition ${expanded ? 'rotate-180' : ''}`} />
                        </button>
                      </td>
                    </tr>
                    {expanded && (
                      <tr className="bg-ink-900/40">
                        <td colSpan={7} className="px-4 py-3">
                          <div className="grid sm:grid-cols-3 gap-3 text-xs">
                            <div className="panel px-3 py-2">
                              <div className="text-[10px] font-mono uppercase tracking-[0.16em] text-text-tertiary">准确率分布</div>
                              <div className="mt-1.5 h-2 rounded bg-white/5 overflow-hidden">
                                <div
                                  className="h-full bg-gradient-to-r from-compute-500 to-glow-500"
                                  style={{ width: `${algo.accuracy}%` }}
                                />
                              </div>
                              <div className="mt-1 font-mono text-white">{algo.accuracy}%</div>
                            </div>
                            <div className="panel px-3 py-2">
                              <div className="text-[10px] font-mono uppercase tracking-[0.16em] text-text-tertiary">运行时间</div>
                              <div className="mt-1.5 h-2 rounded bg-white/5 overflow-hidden">
                                <div
                                  className="h-full bg-gradient-to-r from-glow-500 to-bio-500"
                                  style={{ width: `${Math.min(100, (algo.runtime / 60) * 100)}%` }}
                                />
                              </div>
                              <div className="mt-1 font-mono text-white">{algo.runtime}s · 内存 {algo.memory}MB</div>
                            </div>
                            <div className="panel px-3 py-2">
                              <div className="text-[10px] font-mono uppercase tracking-[0.16em] text-text-tertiary">F1 Score</div>
                              <div className="mt-1.5 h-2 rounded bg-white/5 overflow-hidden">
                                <div
                                  className="h-full bg-gradient-to-r from-ip-400 to-alert-400"
                                  style={{ width: `${algo.f1Score * 100}%` }}
                                />
                              </div>
                              <div className="mt-1 font-mono text-white">{algo.f1Score.toFixed(3)} · group={algo.group}</div>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      {/* Version history */}
      <section className="panel-strong p-5 lg:p-6 mb-6">
        <div className="text-[10px] font-mono tracking-[0.24em] uppercase text-text-tertiary mb-3">
          VERSION HISTORY
        </div>
        <h2 className="text-lg font-semibold text-white mb-4">流程版本回溯</h2>
        <div className="space-y-3">
          {versionHistory.map((ver) => (
            <div key={ver.version} className="panel p-5">
              <div className="flex items-center gap-3 mb-3 flex-wrap">
                <span className="font-mono font-semibold text-bio-200 text-base">
                  {ver.version}
                </span>
                {ver.status === 'current' && (
                  <span className="badge badge-success">当前版本</span>
                )}
                <span className="text-xs font-mono text-text-tertiary">{ver.date}</span>
              </div>
              <ul className="space-y-1.5">
                {ver.improvements.map((imp, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-text-secondary">
                    <ChevronRight className="w-3.5 h-3.5 text-bio-300 mt-0.5" />
                    <span>{imp}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-3 pt-3 border-t border-white/5">
                <button
                  onClick={() => setChangelogFor(ver.version)}
                  className="inline-flex items-center gap-1 text-xs text-bio-200 hover:text-white font-medium"
                >
                  <ExternalLink className="w-3 h-3" />
                  查看完整 changelog
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Closing */}
      <section className="panel-strong p-8 text-center relative overflow-hidden glow-enhance glow-enhance--cyan">
        <div className="absolute -top-20 -right-20 w-72 h-72 rounded-full bg-compute-500/30 blur-3xl" />
        <div className="absolute -bottom-20 -left-20 w-72 h-72 rounded-full bg-bio-500/20 blur-3xl" />
        <div className="rotate-node mx-auto mb-3">
          <Gauge className="w-12 h-12 text-bio-300 rotate-node__core" />
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">
          现场拉取镜像 · 3 分钟完整复现
        </h2>
        <p className="text-text-secondary mb-6 max-w-2xl mx-auto text-sm">
          在答辩现场演示：从 Docker Hub 拉取镜像到运行多组学分析、生成可视化结果，
          全程不超过 3 分钟，证明平台的可复现性。
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 max-w-2xl mx-auto">
          {[
            { label: '拉取时间', value: '~28s' },
            { label: '启动时间', value: '~12s' },
            { label: '首次分析', value: '~2:45' }
          ].map((s) => (
            <div key={s.label} className="panel px-4 py-4 glow-enhance">
              <div className="text-[10px] font-mono tracking-[0.18em] uppercase text-text-tertiary flex items-center justify-center gap-1.5">
                <span className="pulse-ring pulse-ring--green" aria-hidden />
                {s.label}
              </div>
              <div className="text-2xl font-bold text-bio-200 font-mono mt-1">{s.value}</div>
            </div>
          ))}
        </div>
      </section>

      <ChangelogModal version={changelogFor} onClose={() => setChangelogFor(null)} />
    </div>
  );
}

function ChangelogModal({ version, onClose }: { version: string | null; onClose: () => void }) {
  useEffect(() => {
    if (!version) return;
    const handler = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [version, onClose]);

  const ver = versionHistory.find((v) => v.version === version);
  if (!ver) return null;

  return (
    <AnimatePresence>
      {version && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[80] bg-ink-950/90 flex items-center justify-center p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="panel-strong w-full max-w-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-5 border-b border-white/5">
              <div>
                <div className="text-[10px] font-mono uppercase tracking-[0.24em] text-text-tertiary">
                  CHANGELOG · {ver.version}
                </div>
                <h3 className="text-base font-semibold text-white">版本更新说明</h3>
                <div className="text-[11px] text-text-tertiary mt-0.5">发布于 {ver.date}</div>
              </div>
              <button onClick={onClose} className="p-1.5 rounded text-text-tertiary hover:text-white hover:bg-white/5" aria-label="关闭">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-5 space-y-2 max-h-[60vh] overflow-y-auto">
              <ul className="space-y-2 text-sm text-text-secondary">
                {ver.improvements.map((imp, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <ChevronRight className="w-3.5 h-3.5 text-bio-300 mt-0.5" />
                    <span>{imp}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-4 text-[11px] text-text-tertiary leading-relaxed panel bg-ink-950/60 px-3 py-2">
                完整 changelog 包括模型权重、Docker 镜像 tag、API 兼容性说明，
                发布在 GitHub Releases。点击下方按钮跳转查看。
              </div>
            </div>
            <div className="flex items-center justify-end gap-2 p-4 border-t border-white/5">
              <button onClick={onClose} className="btn-secondary text-xs">关闭</button>
              <a
                href={SITE_LINKS.external.githubHome}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-primary text-xs"
              >
                <ExternalLink className="w-3 h-3" />
                GitHub Release
              </a>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function Stat({
  label,
  value,
  icon: Icon
}: {
  label: string;
  value: string;
  icon: any;
}) {
  return (
    <div>
      <div className="text-text-tertiary text-[10px] uppercase tracking-[0.18em] font-mono">
        {label}
      </div>
      <div className="font-mono text-white text-sm flex items-center gap-1 mt-0.5">
        <Icon className="w-3 h-3 text-text-tertiary" />
        {value}
      </div>
    </div>
  );
}

function MiniStat({
  label,
  value,
  color
}: {
  label: string;
  value: string;
  color: string;
}) {
  return (
    <div>
      <div className="text-text-tertiary">{label}</div>
      <div className={`font-mono font-semibold ${color}`}>{value}</div>
    </div>
  );
}
