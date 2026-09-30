'use client';

import { useState, useMemo } from 'react';
import dynamic from 'next/dynamic';

const ReactECharts = dynamic(() => import('echarts-for-react').then((m) => m.default), {
  ssr: false,
  loading: () => (
    <div
      style={{
        width: '100%',
        height: 280,
        background: 'linear-gradient(180deg, rgba(11,16,32,0.6), rgba(8,11,23,0.6))',
        borderRadius: 12
      }}
    />
  )
});

export interface ParameterScanConfig {
  parameterName: string;
  parameterSymbol: string;
  range: [number, number];     // min, max
  stepCount: number;            // how many values to test
  baselineValue: number;        // current/control value
  unit: string;
}

export interface ScanResultPoint {
  paramValue: number;
  metrics: Record<string, number>;  // e.g., { toggleTime, peakGFP, stabilityIndex }
}

export interface ParameterScanChartProps {
  config: ParameterScanConfig;
  results: ScanResultPoint[];
  primaryMetric?: string;
  secondaryMetric?: string;
  title?: string;
  height?: number;
}

/**
 * Parameter Scan Visualization
 * Shows how circuit output metrics change as a parameter is swept
 * Includes tolerance analysis and optimal value identification
 */
export function ParameterScanChart({
  config,
  results,
  primaryMetric = 'toggleTime',
  secondaryMetric,
  title = 'Parameter Sensitivity Analysis',
  height = 320
}: ParameterScanChartProps) {
  const [mounted, setMounted] = useState(true);
  const [hoveredPoint, setHoveredPoint] = useState<ScanResultPoint | null>(null);

  const { optimal, sensitivity, robustnessScore } = useMemo(() => {
    if (results.length === 0) return { optimal: null, sensitivity: 0, robustnessScore: 0 };

    // Find optimal value (for toggleTime: minimum; for peakGFP/stabilityIndex: maximum)
    const isMinimization = primaryMetric === 'toggleTime';
    const optimalPoint = isMinimization
      ? results.reduce((min, p) => p.metrics[primaryMetric] < min.metrics[primaryMetric] ? p : min)
      : results.reduce((max, p) => p.metrics[primaryMetric] > max.metrics[primaryMetric] ? p : max);

    // Calculate sensitivity (normalized std dev)
    const values = results.map(r => r.metrics[primaryMetric]);
    const mean = values.reduce((a, b) => a + b, 0) / values.length;
    const stdDev = Math.sqrt(values.reduce((acc, v) => acc + Math.pow(v - mean, 2), 0) / values.length);
    const cv = stdDev / Math.abs(mean); // Coefficient of variation

    // Robustness: fraction of points within ±20% of optimal
    const optimalVal = optimalPoint.metrics[primaryMetric];
    const tolerance = Math.abs(optimalVal) * 0.2;
    const inTolerance = values.filter(v => Math.abs(v - optimalVal) <= tolerance).length;
    const robustness = inTolerance / values.length;

    return {
      optimal: optimalPoint,
      sensitivity: cv,
      robustnessScore: robustness
    };
  }, [results, primaryMetric]);

  const chartOption = useMemo(() => {
    const paramData = results.map(r => [r.paramValue, r.metrics[primaryMetric]]);
    
    const series: any[] = [
      {
        name: primaryMetric,
        type: 'line',
        smooth: true,
        showSymbol: true,
        symbolSize: 8,
        data: paramData,
        lineStyle: { color: '#16BFDB', width: 2.5 },
        itemStyle: { color: '#16BFDB', borderColor: '#fff', borderWidth: 1 },
        areaStyle: {
          color: {
            type: 'linear', x: 0, y: 0, x2: 0, y2: 1,
            colorStops: [
              { offset: 0, color: 'rgba(22, 191, 219, 0.3)' },
              { offset: 1, color: 'rgba(22, 191, 219, 0)' }
            ]
          }
        },
        markLine: {
          symbol: 'none',
          lineStyle: { color: '#16D88A', type: 'dashed', width: 1.5 },
          label: { color: '#16D88A', fontSize: 10 },
          data: [
            { 
              xAxis: config.baselineValue, 
              name: `Baseline (${config.baselineValue} ${config.unit})` 
            },
            ...(optimal ? [{ xAxis: optimal.paramValue, name: `Optimal` }] : [])
          ]
        },
        markPoint: optimal ? {
          symbol: 'pin',
          symbolSize: 50,
          itemStyle: { color: '#16D88A' },
          label: {
            color: '#0B1020',
            fontSize: 10,
            fontWeight: 700,
            formatter: () => `最优\n${optimal.paramValue.toFixed(2)}`
          },
          data: [{ coord: [optimal.paramValue, optimal.metrics[primaryMetric]] }]
        } : undefined
      }
    ];

    if (secondaryMetric) {
      const secondaryData = results.map(r => [r.paramValue, r.metrics[secondaryMetric]]);
      series.push({
        name: secondaryMetric,
        type: 'line',
        yAxisIndex: 1,
        smooth: true,
        showSymbol: false,
        data: secondaryData,
        lineStyle: { color: '#FF9A1F', width: 2, type: 'dashed' },
        itemStyle: { color: '#FF9A1F' }
      });
    }

    return {
      grid: { top: 30, right: secondaryMetric ? 50 : 16, bottom: 50, left: 60 },
      tooltip: {
        trigger: 'axis',
        backgroundColor: 'rgba(8, 11, 23, 0.95)',
        borderColor: 'rgba(147, 90, 255, 0.5)',
        borderWidth: 1,
        textStyle: { color: '#E8EEFF' },
        formatter: (params: any[]) => {
          const point = results[params[0].dataIndex];
          return `<b>${config.parameterSymbol} = ${point.paramValue.toFixed(2)} ${config.unit}</b><br/>` +
                 params.map(p => `${p.seriesName}: ${p.value[1].toFixed(3)}`).join('<br/>');
        }
      },
      legend: { 
        data: [primaryMetric, secondaryMetric].filter(Boolean),
        textStyle: { color: '#9BA8D0' },
        top: 0
      },
      xAxis: {
        type: 'value',
        name: `${config.parameterName} (${config.unit})`,
        nameTextStyle: { color: '#9BA8D0', fontSize: 11 },
        nameLocation: 'middle',
        nameGap: 32,
        axisLabel: { color: '#6A77A8', fontSize: 10 },
        axisLine: { lineStyle: { color: 'rgba(155,168,208,0.18)' } },
        splitLine: { lineStyle: { color: 'rgba(155,168,208,0.08)' } }
      },
      yAxis: [
        {
          type: 'value',
          name: primaryMetric,
          nameTextStyle: { color: '#16BFDB', fontSize: 11 },
          axisLabel: { color: '#6A77A8', fontSize: 10 },
          splitLine: { lineStyle: { color: 'rgba(155,168,208,0.08)' } }
        },
        ...(secondaryMetric ? [{
          type: 'value',
          name: secondaryMetric,
          nameTextStyle: { color: '#FF9A1F', fontSize: 11 },
          axisLabel: { color: '#6A77A8', fontSize: 10 },
          splitLine: { show: false }
        }] : [])
      ],
      series
    };
  }, [results, config, optimal, primaryMetric, secondaryMetric]);

  return (
    <div className="space-y-3">
      {/* Summary stats */}
      <div className="grid grid-cols-4 gap-2">
        <div className="panel px-3 py-2 text-center">
          <div className="text-[10px] font-mono text-text-tertiary uppercase tracking-wider">最优值</div>
          <div className="text-base font-bold text-glow-200">
            {optimal ? `${optimal.paramValue.toFixed(2)} ${config.unit}` : '—'}
          </div>
        </div>
        <div className="panel px-3 py-2 text-center">
          <div className="text-[10px] font-mono text-text-tertiary uppercase tracking-wider">{primaryMetric}</div>
          <div className="text-base font-bold text-bio-200">
            {optimal ? optimal.metrics[primaryMetric].toFixed(3) : '—'}
          </div>
        </div>
        <div className="panel px-3 py-2 text-center">
          <div className="text-[10px] font-mono text-text-tertiary uppercase tracking-wider">灵敏度 (CV)</div>
          <div className="text-base font-bold text-white">{(sensitivity * 100).toFixed(1)}%</div>
        </div>
        <div className="panel px-3 py-2 text-center">
          <div className="text-[10px] font-mono text-text-tertiary uppercase tracking-wider">鲁棒性</div>
          <div className="text-base font-bold" style={{ color: robustnessScore > 0.6 ? '#16D88A' : robustnessScore > 0.3 ? '#FF9A1F' : '#FF4242' }}>
            {(robustnessScore * 100).toFixed(0)}%
          </div>
        </div>
      </div>

      {/* Interpretation */}
      {optimal && (
        <div className="panel px-4 py-3 text-xs text-text-secondary">
          <div className="flex items-start gap-2">
            <span className="text-bio-300 mt-0.5">🔬</span>
            <div>
              <span className="font-semibold text-white">扫描结果：</span>
              在 <span className="font-mono text-bio-200">{config.parameterSymbol} = {optimal.paramValue.toFixed(2)} {config.unit}</span> 时，
              <span className="font-mono text-bio-200"> {primaryMetric} </span>
              达到最优值 {optimal.metrics[primaryMetric].toFixed(3)}。
              {sensitivity < 0.1 && <span className="text-bio-200">系统对{config.parameterName}变化不敏感（鲁棒性好）。</span>}
              {sensitivity >= 0.1 && sensitivity < 0.3 && <span className="text-alert-200">系统对{config.parameterName}变化中等敏感。</span>}
              {sensitivity >= 0.3 && <span className="text-red-300">系统对{config.parameterName}变化高度敏感，建议精确控制。</span>}
            </div>
          </div>
        </div>
      )}

      <ReactECharts
        option={chartOption}
        notMerge
        lazyUpdate
        style={{ width: '100%', height }}
        opts={{ renderer: 'canvas' }}
        theme="dark"
      />
    </div>
  );
}

/**
 * Generate parameter scan results by sweeping a parameter
 * and running a circuit simulation
 */
export function generateScanResults(
  config: ParameterScanConfig,
  simulate: (paramValue: number) => Record<string, number>
): ScanResultPoint[] {
  const { range, stepCount } = config;
  const [min, max] = range;
  const step = (max - min) / stepCount;
  
  const results: ScanResultPoint[] = [];
  for (let i = 0; i <= stepCount; i++) {
    const value = min + i * step;
    const metrics = simulate(value);
    results.push({ paramValue: value, metrics });
  }
  
  return results;
}

export default ParameterScanChart;
