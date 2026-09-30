'use client';

import { useEffect, useState, useMemo } from 'react';
import dynamic from 'next/dynamic';

const ReactECharts = dynamic(() => import('echarts-for-react').then((m) => m.default), {
  ssr: false,
  loading: () => (
    <div
      style={{
        width: '100%',
        height: 300,
        background: 'linear-gradient(180deg, rgba(11,16,32,0.6), rgba(8,11,23,0.6))',
        borderRadius: 12
      }}
    />
  )
});

export interface PredictionPoint {
  candidateId: string;
  mutation: string;
  predictedAffinity: number;
  predictedStability: number;
  measuredIC50?: number;
  measuredKD?: number;
}

export interface PredictionVsRealityProps {
  data: PredictionPoint[];
  xMetric?: 'affinity' | 'stability';
  title?: string;
  height?: number;
}

/**
 * Prediction vs Reality Comparison Chart
 * X-axis: Predicted score, Y-axis: Measured value
 * Shows regression line, R², and highlights outliers
 */
export function PredictionVsRealityChart({
  data,
  xMetric = 'affinity',
  title = 'In-silico 预测 vs In-vitro 实测',
  height = 320
}: PredictionVsRealityProps) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  // Filter to only points with measured data
  const validatedPoints = useMemo(() => {
    return data.filter(p => p.measuredIC50 !== undefined || p.measuredKD !== undefined);
  }, [data]);

  // Calculate regression line
  const { slope, intercept, rSquared, rmse, mape } = useMemo(() => {
    if (validatedPoints.length < 2) return { slope: 1, intercept: 0, rSquared: 0, rmse: 0, mape: 0 };

    const xValues = validatedPoints.map(p => xMetric === 'affinity' ? p.predictedAffinity : p.predictedStability);
    const yValues = validatedPoints.map(p => {
      const measured = p.measuredKD !== undefined ? p.measuredKD : (p.measuredIC50 || 1);
      // Convert to log scale for better visualization
      return Math.log10(measured);
    });

    const n = xValues.length;
    const sumX = xValues.reduce((a, b) => a + b, 0);
    const sumY = yValues.reduce((a, b) => a + b, 0);
    const sumXY = xValues.reduce((acc, x, i) => acc + x * yValues[i], 0);
    const sumX2 = xValues.reduce((acc, x) => acc + x * x, 0);
    const sumY2 = yValues.reduce((acc, y) => acc + y * y, 0);

    slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX) || 1;
    intercept = (sumY - slope * sumX) / n || 0;

    // R²
    const yMean = sumY / n;
    const ssTot = yValues.reduce((acc, y) => acc + Math.pow(y - yMean, 2), 0);
    const ssRes = yValues.reduce((acc, y, i) => {
      const predicted = slope * xValues[i] + intercept;
      return acc + Math.pow(y - predicted, 2);
    }, 0);
    rSquared = 1 - ssRes / ssTot;

    // RMSE
    rmse = Math.sqrt(ssRes / n);

    // MAPE (Mean Absolute Percentage Error)
    mape = yValues.reduce((acc, y, i) => {
      const predicted = slope * xValues[i] + intercept;
      return acc + Math.abs((y - predicted) / y) * 100;
    }, 0) / n;

    return { slope, intercept, rSquared, rmse, mape };
  }, [validatedPoints, xMetric]);

  // Identify outliers (points > 2σ from regression line)
  const { outliers, inliers } = useMemo(() => {
    if (validatedPoints.length < 3) return { outliers: [], inliers: validatedPoints };

    const xValues = validatedPoints.map(p => xMetric === 'affinity' ? p.predictedAffinity : p.predictedStability);
    const yValues = validatedPoints.map(p => Math.log10(p.measuredKD || p.measuredIC50 || 1));

    const predicted = xValues.map(x => slope * x + intercept);
    const residuals = yValues.map((y, i) => y - predicted[i]);
    const stdDev = Math.sqrt(residuals.reduce((acc, r) => acc + r * r, 0) / residuals.length);

    const outliers = validatedPoints.filter((_, i) => Math.abs(residuals[i]) > 2 * stdDev);
    const inliers = validatedPoints.filter((_, i) => Math.abs(residuals[i]) <= 2 * stdDev);

    return { outliers, inliers };
  }, [validatedPoints, slope, intercept, xMetric]);

  const chartOption = useMemo(() => {
    if (validatedPoints.length === 0) return null;

    const xLabel = xMetric === 'affinity' ? 'Predicted Affinity Score' : 'Predicted Stability Score';
    const yLabel = 'Measured log₁₀(IC50/KD)';

    // Generate regression line
    const xMin = Math.min(...validatedPoints.map(p => xMetric === 'affinity' ? p.predictedAffinity : p.predictedStability)) * 0.9;
    const xMax = Math.max(...validatedPoints.map(p => xMetric === 'affinity' ? p.predictedAffinity : p.predictedStability)) * 1.1;
    const regressionLine = [
      [xMin, slope * xMin + intercept],
      [xMax, slope * xMax + intercept]
    ];

    // Perfect prediction line (y = x in log scale, so no perfect line)
    // Ideal correlation line through data range
    const idealLine = [[xMin, xMin], [xMax, xMax]];

    const series: any[] = [
      // Inliers
      {
        name: '验证数据点',
        type: 'scatter',
        data: inliers.map(p => {
          const x = xMetric === 'affinity' ? p.predictedAffinity : p.predictedStability;
          const y = Math.log10(p.measuredKD || p.measuredIC50 || 1);
          return [x, y, p.mutation];
        }),
        symbolSize: 14,
        itemStyle: {
          color: '#16BFDB',
          borderColor: '#7E3AFF',
          borderWidth: 2
        },
        z: 3
      },
      // Outliers (highlighted)
      {
        name: '异常点 (±2σ)',
        type: 'scatter',
        data: outliers.map(p => {
          const x = xMetric === 'affinity' ? p.predictedAffinity : p.predictedStability;
          const y = Math.log10(p.measuredKD || p.measuredIC50 || 1);
          return [x, y, p.mutation];
        }),
        symbolSize: 18,
        symbol: 'triangle',
        itemStyle: {
          color: '#FF4242',
          borderColor: '#FF9A1F',
          borderWidth: 3
        },
        z: 4
      },
      // Regression line
      {
        name: `回归线 (R²=${rSquared.toFixed(3)})`,
        type: 'line',
        data: regressionLine,
        lineStyle: { color: '#16D88A', width: 2, type: 'solid' },
        showSymbol: false,
        z: 2
      },
      // Ideal correlation line
      {
        name: '理想相关',
        type: 'line',
        data: idealLine,
        lineStyle: { color: '#FF9A1F', width: 1.5, type: 'dashed', opacity: 0.6 },
        showSymbol: false,
        z: 1
      }
    ];

    // Confidence interval (±2σ)
    const residuals = validatedPoints.map(p => {
      const x = xMetric === 'affinity' ? p.predictedAffinity : p.predictedStability;
      const y = Math.log10(p.measuredKD || p.measuredIC50 || 1);
      const predicted = slope * x + intercept;
      return Math.abs(y - predicted);
    });
    const avgResidual = residuals.reduce((a, b) => a + b, 0) / residuals.length;

    const upperBound = regressionLine.map(([x]) => [x, slope * x + intercept + 2 * avgResidual]);
    const lowerBound = regressionLine.map(([x]) => [x, slope * x + intercept - 2 * avgResidual]);

    series.push({
      name: '95% 置信区间',
      type: 'line',
      data: [...upperBound, ...[...lowerBound].reverse()],
      lineStyle: { opacity: 0 },
      areaStyle: {
        color: 'rgba(22, 216, 138, 0.15)'
      },
      showSymbol: false,
      stack: 'confidence',
      z: 1
    });

    return {
      grid: { top: 30, right: 20, bottom: 60, left: 70 },
      tooltip: {
        trigger: 'item',
        backgroundColor: 'rgba(8, 11, 23, 0.95)',
        borderColor: 'rgba(147, 90, 255, 0.5)',
        borderWidth: 1,
        textStyle: { color: '#E8EEFF' },
        formatter: (p: any) => {
          if (p.seriesType !== 'scatter') return '';
          const mutation = p.data[2] || '';
          const x = p.data[0].toFixed(3);
          const y = p.data[1].toFixed(2);
          const value = Math.pow(10, y).toExponential(2);
          return `<b>${mutation}</b><br/>Predicted: ${x}<br/>Measured: ${value} nM<br/>log₁₀: ${y}`;
        }
      },
      legend: {
        data: ['验证数据点', '异常点 (±2σ)', `回归线 (R²=${rSquared.toFixed(3)})`, '理想相关'],
        textStyle: { color: '#9BA8D0' },
        top: 0
      },
      xAxis: {
        type: 'value',
        name: xLabel,
        nameTextStyle: { color: '#9BA8D0', fontSize: 11 },
        nameLocation: 'middle',
        nameGap: 32,
        axisLabel: { color: '#6A77A8', fontSize: 10 },
        axisLine: { lineStyle: { color: 'rgba(155,168,208,0.18)' } },
        splitLine: { lineStyle: { color: 'rgba(155,168,208,0.08)' } }
      },
      yAxis: {
        type: 'value',
        name: yLabel,
        nameTextStyle: { color: '#9BA8D0', fontSize: 11 },
        nameLocation: 'middle',
        nameGap: 45,
        axisLabel: {
          color: '#6A77A8',
          fontSize: 10,
          formatter: (v: number) => `10^${v.toFixed(0)}`
        },
        axisLine: { lineStyle: { color: 'rgba(155,168,208,0.18)' } },
        splitLine: { lineStyle: { color: 'rgba(155,168,208,0.08)' } }
      },
      series
    };
  }, [validatedPoints, inliers, outliers, slope, intercept, rSquared, xMetric]);

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
      {/* Stats Summary */}
      <div className="grid grid-cols-4 gap-3">
        <div className="panel px-3 py-2 text-center">
          <div className="text-[10px] font-mono text-text-tertiary uppercase tracking-wider">R²</div>
          <div className="text-lg font-semibold" style={{ color: rSquared > 0.7 ? '#16D88A' : rSquared > 0.4 ? '#FF9A1F' : '#FF4242' }}>
            {rSquared.toFixed(3)}
          </div>
        </div>
        <div className="panel px-3 py-2 text-center">
          <div className="text-[10px] font-mono text-text-tertiary uppercase tracking-wider">RMSE</div>
          <div className="text-lg font-semibold text-white">
            {rmse.toFixed(2)}
          </div>
        </div>
        <div className="panel px-3 py-2 text-center">
          <div className="text-[10px] font-mono text-text-tertiary uppercase tracking-wider">MAPE</div>
          <div className="text-lg font-semibold text-white">
            {mape.toFixed(1)}%
          </div>
        </div>
        <div className="panel px-3 py-2 text-center">
          <div className="text-[10px] font-mono text-text-tertiary uppercase tracking-wider">验证样本</div>
          <div className="text-lg font-semibold text-white">
            {validatedPoints.length}/{data.length}
          </div>
        </div>
      </div>

      {/* Interpretation */}
      <div className="panel px-4 py-3 text-xs">
        <div className="flex items-start gap-2">
          <span className="text-bio-300 font-mono mt-0.5">ℹ</span>
          <div className="text-text-secondary">
            <span className="text-white font-medium">解读：</span>
            {rSquared > 0.7 ? (
              <span className="text-bio-200"> 预测模型与实测数据高度相关（R² &gt; 0.7），预测可靠性较高。</span>
            ) : rSquared > 0.4 ? (
              <span className="text-alert-200"> 预测模型与实测数据中等相关（0.4 &lt; R² &lt; 0.7），建议结合湿实验验证。</span>
            ) : (
              <span className="text-red-300"> 预测模型与实测数据相关性较弱（R² &lt; 0.4），需要优化模型或重新设计实验。</span>
            )}
            {outliers.length > 0 && (
              <span className="text-alert-200"> 检测到 {outliers.length} 个异常点（红色三角），建议重点验证。</span>
            )}
          </div>
        </div>
      </div>

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

export default PredictionVsRealityChart;
