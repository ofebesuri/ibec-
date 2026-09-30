import { NextResponse } from 'next/server';

/**
 * 一致性检查端点（real-time sanity），用于产品化的"启动器 6 端点健康检查"。
 */
export async function GET() {
  const startedAt = Date.now();
  const samples = Array.from({ length: 1000 }, (_, index) =>
    Math.sin(index / 17) * 0.5 + 0.5
  );
  const sum = samples.reduce((s, v) => s + v, 0);
  const mean = sum / samples.length;
  const variance =
    samples.reduce((s, v) => s + (v - mean) * (v - mean), 0) / samples.length;
  const stdev = Math.sqrt(variance);

  // 输出每个算法的确定性合成数据（受 seed 控制）
  const algorithms = [
    { algorithm: 'FluBioStack-AI', accuracy: 94.2, runtime: 12.3, f1Score: 0.93 },
    { algorithm: 'Baseline-v2', accuracy: 87.5, runtime: 18.7, f1Score: 0.86 },
    { algorithm: 'DeepSeq-3', accuracy: 91.3, runtime: 24.5, f1Score: 0.9 },
    { algorithm: 'BioBERT-Large', accuracy: 88.9, runtime: 32.1, f1Score: 0.88 },
    { algorithm: 'ESM-2 (650M)', accuracy: 89.7, runtime: 45.2, f1Score: 0.89 }
  ];

  return NextResponse.json({
    runId: `BENCH-${startedAt}`,
    status: 'completed',
    algorithm: 'flubiostack-baseline',
    dataset: 'synthetic-sanity-v1',
    metrics: {
      samples: samples.length,
      mean: Number(mean.toFixed(6)),
      stdev: Number(stdev.toFixed(6)),
      runtimeMs: Date.now() - startedAt
    },
    algorithms,
    reproducibility: {
      node: process.version,
      seed: 'deterministic-sanity-v1',
      note: 'synthetic sanity-check; not a real algorithm comparison'
    }
  });
}

export async function POST() {
  return GET();
}
