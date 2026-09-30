'use client';

import { useEffect, useMemo, useState } from 'react';
import dynamic from 'next/dynamic';

// v2026.09.20-Final: dynamic import 替代 require，避免 Next 14 ESM 环境偶发的模块解析问题
const ReactECharts = dynamic(() => import('echarts-for-react').then((m) => m.default), {
  ssr: false,
  loading: () => (
    <div
      style={{
        width: '100%',
        height: 200,
        background: 'linear-gradient(180deg, rgba(11,16,32,0.6), rgba(8,11,23,0.6))',
        borderRadius: 12
      }}
    />
  )
});

interface ChartProps {
  option: any;
  style?: React.CSSProperties;
  className?: string;
  height?: number | string;
  group?: string;
}

const deepBase = {
  backgroundColor: 'transparent',
  textStyle: {
    color: '#9BA8D0',
    fontFamily: 'JetBrains Mono, Inter, system-ui, sans-serif'
  },
  tooltip: {
    backgroundColor: 'rgba(8, 11, 23, 0.95)',
    borderColor: 'rgba(147, 90, 255, 0.5)',
    borderWidth: 1,
    textStyle: { color: '#E8EEFF' },
    extraCssText:
      'border-radius: 10px; box-shadow: 0 18px 40px rgba(2,4,18,0.7); padding: 10px 12px;'
  }
};

export function DeepChart({
  option,
  style,
  className,
  height = 280
}: ChartProps) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const merged = useMemo(() => deepMerge(deepBase, option), [option]);

  if (!mounted) {
    return (
      <div
        className={className}
        style={{
          width: '100%',
          height,
          ...style,
          background:
            'linear-gradient(180deg, rgba(11,16,32,0.6), rgba(8,11,23,0.6))',
          borderRadius: 12
        }}
      />
    );
  }

  return <ChartImpl option={merged} className={className} style={style} height={height} />;
}

function ChartImpl({
  option,
  style,
  className,
  height
}: {
  option: any;
  style?: React.CSSProperties;
  className?: string;
  height: number | string;
}) {
  return (
    <ReactECharts
      option={option}
      notMerge
      lazyUpdate
      className={className}
      style={{ width: '100%', height, ...style }}
      opts={{ renderer: 'canvas' }}
      theme="dark"
    />
  );
}

function deepMerge(target: any, source: any): any {
  if (Array.isArray(source)) return source.slice();
  if (source && typeof source === 'object') {
    const out: Record<string, any> = { ...(target || {}) };
    Object.keys(source).forEach((key) => {
      const sv = source[key];
      const tv = out[key];
      if (sv && typeof sv === 'object' && !Array.isArray(sv) && tv && typeof tv === 'object') {
        out[key] = deepMerge(tv, sv);
      } else {
        out[key] = sv;
      }
    });
    return out;
  }
  return source ?? target;
}

export function getFluBenchChartOption() {
  const algos = ['FluBioStack-AI', 'Baseline-v2', 'DeepSeq-3', 'BioBERT-Large', 'ESM-2 (650M)'];
  const accuracy = [94.2, 87.5, 91.3, 88.9, 89.7];
  const runtime = [12.3, 18.7, 24.5, 32.1, 45.2];
  return {
    grid: { top: 30, right: 30, bottom: 40, left: 50 },
    legend: {
      data: [
        { name: '准确率 %', icon: 'roundRect' },
        { name: '运行时长 s', icon: 'circle' }
      ],
      textStyle: { color: '#9BA8D0' },
      top: 0,
      itemWidth: 10,
      itemHeight: 10
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow', shadowStyle: { color: 'rgba(147,90,255,0.08)' } }
    },
    xAxis: {
      type: 'category',
      data: algos,
      axisLine: { lineStyle: { color: 'rgba(155,168,208,0.18)' } },
      axisLabel: { color: '#9BA8D0', fontSize: 10, interval: 0, rotate: 18 }
    },
    yAxis: [
      {
        type: 'value',
        max: 100,
        name: '准确率 %',
        nameTextStyle: { color: '#16BFDB' },
        axisLabel: { color: '#6A77A8' },
        splitLine: { lineStyle: { color: 'rgba(155,168,208,0.08)' } }
      },
      {
        type: 'value',
        name: '运行时长 s',
        nameTextStyle: { color: '#FF9A1F' },
        axisLabel: { color: '#6A77A8' },
        splitLine: { show: false }
      }
    ],
    series: [
      {
        name: '准确率 %',
        type: 'bar',
        data: accuracy,
        barWidth: 18,
        itemStyle: {
          borderRadius: [6, 6, 0, 0],
          color: {
            type: 'linear',
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              { offset: 0, color: '#7E3AFF' },
              { offset: 1, color: '#16BFDB' }
            ]
          }
        }
      },
      {
        name: '运行时长 s',
        type: 'line',
        yAxisIndex: 1,
        smooth: true,
        symbol: 'circle',
        symbolSize: 8,
        lineStyle: { color: '#FF9A1F', width: 2 },
        itemStyle: { color: '#FF9A1F' },
        data: runtime
      }
    ]
  };
}

export function getEpidemicChartOption() {
  const data = [1240, 1380, 1520, 1690, 1850, 2100, 2380, 2650, 2890, 3120, 3300, 3420];
  return {
    grid: { top: 30, right: 16, bottom: 36, left: 50 },
    tooltip: { trigger: 'axis' },
    xAxis: {
      type: 'category',
      data: data.map((_, i) => `W${i + 1}`),
      axisLine: { lineStyle: { color: 'rgba(155,168,208,0.18)' } },
      axisLabel: { color: '#6A77A8', fontSize: 10 }
    },
    yAxis: {
      type: 'value',
      axisLabel: { color: '#6A77A8', fontSize: 10 },
      splitLine: { lineStyle: { color: 'rgba(155,168,208,0.08)' } }
    },
    series: [
      {
        type: 'line',
        smooth: true,
        symbolSize: 6,
        data,
        lineStyle: { color: '#FF4242', width: 2 },
        itemStyle: { color: '#FF4242' },
        areaStyle: {
          color: {
            type: 'linear',
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              { offset: 0, color: 'rgba(255,66,66,0.45)' },
              { offset: 1, color: 'rgba(255,66,66,0)' }
            ]
          }
        },
        markPoint: {
          symbol: 'pin',
          symbolSize: 42,
          itemStyle: { color: '#FF9A1F' },
          label: { color: '#0B1020', fontSize: 10, fontWeight: 700 },
          data: [{ type: 'max', name: '峰值' }]
        },
        markLine: {
          symbol: 'none',
          lineStyle: { color: 'rgba(255,154,31,0.45)', type: 'dashed' },
          label: { color: '#FF9A1F', fontSize: 10 },
          data: [{ name: '安全阈值', yAxis: 2800 }]
        }
      }
    ]
  };
}

export function getCircuitChartOption() {
  const series = Array.from({ length: 120 }, (_, i) => {
    const t = i / 12;
    const s =
      1 +
      0.45 * Math.sin(t) +
      0.18 * Math.sin(2.1 * t + 0.3) +
      0.08 * Math.sin(4.7 * t + 1.2);
    return [i, Math.max(0, s)];
  });
  return {
    grid: { top: 24, right: 18, bottom: 30, left: 46 },
    tooltip: { trigger: 'axis' },
    xAxis: {
      type: 'value',
      name: 'h',
      nameTextStyle: { color: '#6A77A8', fontSize: 10 },
      axisLine: { lineStyle: { color: 'rgba(155,168,208,0.18)' } },
      axisLabel: { color: '#6A77A8', fontSize: 10 }
    },
    yAxis: {
      type: 'value',
      min: 0,
      max: 2,
      name: 'concentration',
      nameTextStyle: { color: '#6A77A8', fontSize: 10 },
      axisLabel: { color: '#6A77A8', fontSize: 10 },
      splitLine: { lineStyle: { color: 'rgba(155,168,208,0.08)' } }
    },
    series: [
      {
        type: 'line',
        smooth: true,
        showSymbol: false,
        data: series,
        lineStyle: { color: '#7E3AFF', width: 2 },
        areaStyle: {
          color: {
            type: 'linear',
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              { offset: 0, color: 'rgba(126,58,255,0.45)' },
              { offset: 1, color: 'rgba(126,58,255,0)' }
            ]
          }
        }
      }
    ]
  };
}

export function getNetworkPulseOption() {
  return {
    grid: { top: 8, right: 8, bottom: 8, left: 8 },
    radar: {
      indicator: [
        { name: 'scFv', max: 100 },
        { name: '多组学', max: 100 },
        { name: '回路', max: 100 },
        { name: '流行病', max: 100 },
        { name: 'IP', max: 100 },
        { name: '社区', max: 100 }
      ],
      center: ['50%', '55%'],
      radius: '60%',
      splitArea: {
        areaStyle: { color: ['rgba(147,90,255,0.04)', 'rgba(22,191,219,0.04)'] }
      },
      axisLine: { lineStyle: { color: 'rgba(155,168,208,0.18)' } },
      splitLine: { lineStyle: { color: 'rgba(155,168,208,0.12)' } },
      name: { textStyle: { color: '#9BA8D0', fontSize: 11 } }
    },
    series: [
      {
        type: 'radar',
        symbol: 'circle',
        symbolSize: 4,
        lineStyle: { color: '#7E3AFF', width: 2 },
        itemStyle: { color: '#16BFDB' },
        areaStyle: { color: 'rgba(126,58,255,0.35)' },
        data: [
          {
            name: '当前运行',
            value: [88, 76, 64, 72, 81, 70]
          }
        ]
      }
    ]
  };
}
