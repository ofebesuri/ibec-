'use client';

import { useEffect, useState, useMemo } from 'react';
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

export interface DoseResponsePoint {
  concentration: number;
  inhibition: number;
  stdDev?: number;
}

export interface DoseResponseProps {
  data: DoseResponsePoint[];
  ic50?: number;
  title?: string;
  unit?: string;
  height?: number;
  predictedCurve?: boolean;
  predictedIc50?: number;
}

/**
 * Four-Parameter Logistic (4PL) Model
 * y = D + (A - D) / (1 + (x/C)^B)
 * A = min asymptote, D = max asymptote, C = IC50, B = hill slope
 */
function fit4PL(points: DoseResponsePoint[]): { a: number; b: number; c: number; d: number; r2: number } {
  const sorted = [...points].sort((a, b) => a.concentration - b.concentration);
  const A = Math.max(...sorted.map(p => p.inhibition));
  const D = Math.min(...sorted.map(p => p.inhibition));
  
  // Initial estimate for C (IC50)
  const midResponse = D + (A - D) / 2;
  const closest = sorted.reduce((prev, curr) => 
    Math.abs(curr.inhibition - midResponse) < Math.abs(prev.inhibition - midResponse) ? curr : prev
  );
  let C = closest.concentration || 1;
  
  // Initial estimate for B (hill slope)
  let B = 1;
  
  // Simple non-linear fitting using least squares iteration
  for (let iter = 0; iter < 100; iter++) {
    let sumA = 0, sumB = 0, sumC = 0, sumD = 0;
    
    for (const p of sorted) {
      const x = p.concentration;
      const y = p.inhibition;
      const denom = 1 + Math.pow(x / C, B);
      const pred = D + (A - D) / denom;
      const resid = y - pred;
      
      // Partial derivatives (simplified)
      const common = (A - D) * B * Math.pow(x / C, B) / (denom * denom * x);
      sumA += resid * (1 / denom);
      sumD += resid * (1 - 1 / denom);
      sumC += resid * common * x;
      sumB += resid * (A - D) * Math.log(x / C) * Math.pow(x / C, B) / (denom * denom);
    }
    
    // Update parameters (gradient descent)
    const lr = 0.01;
    const da = sumA / sorted.length * lr;
    const db = sumB / sorted.length * lr;
    const dc = sumC / sorted.length * lr * C;
    const dd = sumD / sorted.length * lr;
    
    B = Math.max(0.1, Math.min(10, B + db));
    C = Math.max(0.001, Math.min(10000, C + dc));
    A = Math.max(A + da, D + 0.1);
    D = Math.min(D + dd, A - 0.1);
  }
  
  // Calculate R²
  const predictions = sorted.map(p => D + (A - D) / (1 + Math.pow(p.concentration / C, B)));
  const mean = sorted.reduce((s, p) => s + p.inhibition, 0) / sorted.length;
  const ssTot = sorted.reduce((s, p) => s + Math.pow(p.inhibition - mean, 2), 0);
  const ssRes = sorted.reduce((s, p, i) => s + Math.pow(p.inhibition - predictions[i], 2), 0);
  const r2 = 1 - ssRes / ssTot;
  
  return { a: A, b: B, c: C, d: D, r2: Math.max(0, r2) };
}

function predict4PL(x: number, params: { a: number; b: number; c: number; d: number }): number {
  return params.d + (params.a - params.d) / (1 + Math.pow(x / params.c, params.b));
}

export function DoseResponseChart({
  data,
  ic50,
  title = 'Dose-Response Curve',
  unit = 'nM',
  height = 280,
  predictedCurve,
  predictedIc50
}: DoseResponseProps) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const { params, r2, effectiveIC50 } = useMemo(() => {
    if (data.length < 4) return { params: null, r2: 0, effectiveIC50: undefined };
    const fitted = fit4PL(data);
    return {
      params: fitted,
      r2: fitted.r2,
      effectiveIC50: fitted.c
    };
  }, [data]);

  const chartOption = useMemo(() => {
    if (!params || data.length === 0) return null;

    // Generate smooth curve points
    const minX = Math.log10(Math.max(0.001, Math.min(...data.map(d => d.concentration))));
    const maxX = Math.log10(Math.max(...data.map(d => d.concentration)) * 10);
    const curvePoints: [number, number][] = [];
    
    for (let i = 0; i <= 200; i++) {
      const logX = minX + (maxX - minX) * (i / 200);
      const x = Math.pow(10, logX);
      const y = predict4PL(x, params);
      curvePoints.push([logX, y]);
    }

    // Data points with error bars
    const scatterData = data.map(d => ({
      value: [Math.log10(d.concentration), d.inhibition],
      error: d.stdDev || 0
    }));

    const series: any[] = [
      // 4PL fitted curve
      {
        name: '4PL Fitted Curve',
        type: 'line',
        data: curvePoints,
        smooth: false,
        showSymbol: false,
        lineStyle: { color: '#16BFDB', width: 2.5 },
        areaStyle: {
          color: {
            type: 'linear', x: 0, y: 0, x2: 0, y2: 1,
            colorStops: [
              { offset: 0, color: 'rgba(22,191,219,0.25)' },
              { offset: 1, color: 'rgba(22,191,219,0)' }
            ]
          }
        },
        z: 2
      },
      // Data points
      {
        name: 'Experimental Data',
        type: 'scatter',
        data: scatterData.map(d => d.value),
        symbolSize: 12,
        itemStyle: {
          color: '#16BFDB',
          borderColor: '#7E3AFF',
          borderWidth: 2
        },
        z: 3,
        errorBar: {
          data: scatterData.map(d => [d.value[0], d.value[0], d.value[1] - d.error, d.value[1] + d.error]),
          barWidth: 6,
          lineStyle: { color: '#16BFDB', width: 1.5 }
        }
      }
    ];

    // Add predicted curve if available
    if (predictedCurve && predictedIc50) {
      const predParams = { a: params.a, b: params.b, c: predictedIc50, d: params.d };
      const predCurvePoints: [number, number][] = [];
      for (let i = 0; i <= 200; i++) {
        const logX = minX + (maxX - minX) * (i / 200);
        const x = Math.pow(10, logX);
        const y = predict4PL(x, predParams);
        predCurvePoints.push([logX, y]);
      }
      series.push({
        name: 'Predicted Curve',
        type: 'line',
        data: predCurvePoints,
        smooth: false,
        showSymbol: false,
        lineStyle: { color: '#FF9A1F', width: 2, type: 'dashed' },
        z: 1
      });
    }

    // IC50 marker
    const ic50Value = effectiveIC50 || ic50;
    if (ic50Value && ic50Value > 0) {
      series.push({
        name: 'IC50',
        type: 'line',
        markLine: {
          silent: true,
          symbol: 'none',
          lineStyle: { color: '#FF4242', type: 'solid', width: 1.5 },
          label: {
            formatter: `IC50 = ${ic50Value.toFixed(2)} ${unit}`,
            position: 'insideEndTop',
            color: '#FF4242',
            fontSize: 11,
            fontWeight: 600
          },
          data: [{ xAxis: Math.log10(ic50Value) }]
        },
        markPoint: {
          symbol: 'circle',
          symbolSize: 14,
          itemStyle: { color: '#FF4242', borderColor: '#fff', borderWidth: 2 },
          label: { show: false },
          data: [{ coord: [Math.log10(ic50Value), predict4PL(ic50Value, params)] }]
        }
      });
    }

    return {
      grid: { top: 24, right: 20, bottom: 50, left: 60 },
      tooltip: {
        trigger: 'item',
        backgroundColor: 'rgba(8, 11, 23, 0.95)',
        borderColor: 'rgba(147, 90, 255, 0.5)',
        borderWidth: 1,
        textStyle: { color: '#E8EEFF' },
        formatter: (p: any) => {
          if (p.seriesType === 'scatter') {
            const conc = Math.pow(10, p.data[0]);
            return `浓度: ${conc.toExponential(2)} ${unit}<br/>抑制率: ${p.data[1].toFixed(1)}%`;
          }
          const conc = Math.pow(10, p.data[0]);
          return `浓度: ${conc.toExponential(2)} ${unit}<br/>预测: ${p.data[1].toFixed(1)}%`;
        }
      },
      legend: {
        data: ['4PL Fitted Curve', 'Experimental Data', predictedCurve ? 'Predicted Curve' : ''].filter(Boolean),
        textStyle: { color: '#9BA8D0' },
        top: 0
      },
      xAxis: {
        type: 'value',
        name: `Concentration (${unit})`,
        nameTextStyle: { color: '#9BA8D0', fontSize: 11 },
        nameLocation: 'middle',
        nameGap: 32,
        axisLabel: {
          color: '#6A77A8',
          fontSize: 10,
          formatter: (v: number) => `10^${v.toFixed(0)}`
        },
        axisLine: { lineStyle: { color: 'rgba(155,168,208,0.18)' } },
        splitLine: { lineStyle: { color: 'rgba(155,168,208,0.08)' } }
      },
      yAxis: {
        type: 'value',
        name: 'Inhibition (%)',
        nameTextStyle: { color: '#9BA8D0', fontSize: 11 },
        max: 110,
        axisLabel: { color: '#6A77A8', fontSize: 10 },
        axisLine: { lineStyle: { color: 'rgba(155,168,208,0.18)' } },
        splitLine: { lineStyle: { color: 'rgba(155,168,208,0.08)' } }
      },
      series
    };
  }, [data, params, ic50, effectiveIC50, unit, predictedCurve, predictedIc50]);

  if (!mounted) {
    return (
      <div
        style={{
          width: '100%',
          height,
          background: 'linear-gradient(180deg, rgba(11,16,32,0.6), rgba(8,11,23,0.6))',
          borderRadius: 12
        }}
      />
    );
  }

  return (
    <div className="space-y-3">
      {params && (
        <div className="flex flex-wrap items-center gap-3 px-1">
          <div className="flex items-center gap-2">
            <span className="w-3 h-0.5 bg-bio-400 rounded" />
            <span className="text-xs text-text-secondary">
              <span className="font-mono text-bio-200">IC50 = {effectiveIC50?.toFixed(3)} {unit}</span>
            </span>
          </div>
          <div className="text-xs text-text-tertiary">
            Hill Slope <span className="font-mono text-white">b = {params.b.toFixed(2)}</span>
          </div>
          <div className="text-xs text-text-tertiary">
            R² <span className="font-mono text-glow-200">{r2.toFixed(4)}</span>
          </div>
          {predictedIc50 && (
            <div className="flex items-center gap-2">
              <span className="w-3 h-0.5 bg-alert-400 rounded" style={{ borderTop: '2px dashed #FF9A1F' }} />
              <span className="text-xs text-text-secondary">
                Predicted IC50 = <span className="font-mono text-alert-200">{predictedIc50.toFixed(3)} {unit}</span>
              </span>
            </div>
          )}
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

export default DoseResponseChart;
