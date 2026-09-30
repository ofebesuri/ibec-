'use client';

// @deprecated - 默认浅色配色 ECharts 封装，未被任何页面 import（首页与分析页全用 DeepChart）。
//                请勿在新增代码中引用。如需新 ECharts 组件请基于 DeepChart.tsx 扩展。

import { useEffect, useRef, useState } from 'react';

interface ChartProps {
  option: any;
  style?: React.CSSProperties;
  className?: string;
  theme?: 'light' | 'dark';
}

const defaultOption = {
  backgroundColor: 'transparent',
  textStyle: {
    color: '#475569',
    fontFamily: 'Inter, system-ui, sans-serif'
  },
  tooltip: {
    backgroundColor: 'rgba(255, 255, 255, 0.98)',
    borderColor: '#E2E8F0',
    borderWidth: 1,
    textStyle: { color: '#0F172A' },
    extraCssText: 'border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.08);'
  }
};

export function EChart({ option, style, className }: ChartProps) {
  const chartRef = useRef<HTMLDivElement>(null);
  const chartInstance = useRef<any>(null);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!isMounted || !chartRef.current) return;

    let disposed = false;

    import('echarts').then((echarts) => {
      if (disposed || !chartRef.current) return;

      chartInstance.current = echarts.init(chartRef.current, undefined, {
        renderer: 'canvas',
        useDirtyRect: true
      });

      chartInstance.current.setOption({ ...defaultOption, ...option });

      const handleResize = () => {
        chartInstance.current?.resize();
      };

      window.addEventListener('resize', handleResize);
    });

    return () => {
      disposed = true;
      if (chartInstance.current) {
        chartInstance.current.dispose();
      }
    };
  }, [option, isMounted]);

  if (!isMounted) {
    return <div className={className} style={{ width: '100%', height: '400px', ...style, background: '#F8FAFC', borderRadius: '8px' }} />;
  }

  return <div ref={chartRef} className={className} style={{ width: '100%', height: '400px', ...style }} />;
}

export function getNeutralizationChartOption(data: { concentration: number; inhibition: number; stdDev?: number }[]) {
  return {
    grid: { top: 40, right: 30, bottom: 50, left: 60 },
    legend: {
      data: ['抑制率'],
      textStyle: { color: '#475569' },
      top: 0
    },
    xAxis: {
      type: 'log',
      name: '浓度 (nM)',
      nameLocation: 'middle',
      nameGap: 30,
      axisLine: { lineStyle: { color: '#E2E8F0' } },
      axisLabel: { color: '#64748B' }
    },
    yAxis: {
      type: 'value',
      name: '抑制率 (%)',
      max: 100,
      nameTextStyle: { color: '#64748B', fontSize: 11 },
      axisLine: { lineStyle: { color: '#E2E8F0' } },
      axisLabel: { color: '#64748B' },
      splitLine: { lineStyle: { color: '#F1F5F9' } }
    },
    series: [
      {
        name: '抑制率',
        type: 'line',
        smooth: true,
        symbolSize: 8,
        lineStyle: {
          color: '#0891B2',
          width: 2
        },
        itemStyle: {
          color: '#0891B2'
        },
        areaStyle: {
          color: {
            type: 'linear',
            x: 0, y: 0, x2: 0, y2: 1,
            colorStops: [
              { offset: 0, color: 'rgba(8, 145, 178, 0.15)' },
              { offset: 1, color: 'rgba(8, 145, 178, 0)' }
            ]
          }
        },
        data: data.map(d => [d.concentration, d.inhibition])
      }
    ]
  };
}

export function getHeatmapChartOption(rows: number, cols: number) {
  const data: [number, number, number][] = [];
  for (let i = 0; i < rows; i++) {
    for (let j = 0; j < cols; j++) {
      data.push([i, j, Math.random() * 100]);
    }
  }

  return {
    grid: { top: 40, right: 80, bottom: 40, left: 80 },
    xAxis: {
      type: 'category',
      data: Array.from({ length: cols }, (_, i) => `Sample ${i + 1}`),
      axisLabel: { color: '#64748B', rotate: 45, fontSize: 9 },
      splitArea: { show: true }
    },
    yAxis: {
      type: 'category',
      data: Array.from({ length: rows }, (_, i) => `Gene ${i + 1}`),
      axisLabel: { color: '#64748B', fontSize: 9 },
      splitArea: { show: true }
    },
    visualMap: {
      min: 0,
      max: 100,
      calculable: true,
      orient: 'vertical',
      right: 0,
      top: 'center',
      inRange: {
        color: ['#EFF6FF', '#0891B2', '#10B981', '#F59E0B', '#EF4444']
      },
      textStyle: { color: '#475569' }
    },
    series: [{
      name: '表达量',
      type: 'heatmap',
      data,
      label: { show: false },
      emphasis: {
        itemStyle: {
          shadowBlur: 10,
          shadowColor: 'rgba(8, 145, 178, 0.3)'
        }
      }
    }]
  };
}

export function getBenchmarkChartOption(data: { algorithm: string; accuracy: number; runtime: number }[]) {
  return {
    grid: { top: 60, right: 30, bottom: 60, left: 60 },
    legend: {
      data: ['准确率 (%)', '运行时长 (s)'],
      textStyle: { color: '#475569' },
      top: 0
    },
    xAxis: {
      type: 'category',
      data: data.map(d => d.algorithm),
      axisLabel: { color: '#64748B', rotate: 30, fontSize: 10 },
      axisLine: { lineStyle: { color: '#E2E8F0' } }
    },
    yAxis: [
      {
        type: 'value',
        name: '准确率 (%)',
        max: 100,
        position: 'left',
        nameTextStyle: { color: '#0891B2', fontSize: 11 },
        axisLabel: { color: '#64748B' },
        axisLine: { lineStyle: { color: '#0891B2' } },
        splitLine: { lineStyle: { color: '#F1F5F9' } }
      },
      {
        type: 'value',
        name: '运行时长 (s)',
        position: 'right',
        nameTextStyle: { color: '#F59E0B', fontSize: 11 },
        axisLabel: { color: '#64748B' },
        axisLine: { lineStyle: { color: '#F59E0B' } }
      }
    ],
    series: [
      {
        name: '准确率 (%)',
        type: 'bar',
        data: data.map(d => d.accuracy),
        itemStyle: {
          color: '#0891B2',
          borderRadius: [4, 4, 0, 0]
        },
        barWidth: '40%'
      },
      {
        name: '运行时长 (s)',
        type: 'line',
        yAxisIndex: 1,
        smooth: true,
        data: data.map(d => d.runtime),
        lineStyle: {
          color: '#F59E0B',
          width: 2
        },
        itemStyle: {
          color: '#F59E0B'
        }
      }
    ]
  };
}

export function getEpidemicChartOption(data: number[]) {
  return {
    grid: { top: 40, right: 30, bottom: 50, left: 60 },
    xAxis: {
      type: 'category',
      data: Array.from({ length: data.length }, (_, i) => `第 ${i + 1} 周`),
      axisLabel: { color: '#64748B', fontSize: 10 },
      axisLine: { lineStyle: { color: '#E2E8F0' } }
    },
    yAxis: {
      type: 'value',
      name: '预测病例数',
      nameTextStyle: { color: '#64748B', fontSize: 11 },
      axisLabel: { color: '#64748B' },
      axisLine: { lineStyle: { color: '#E2E8F0' } },
      splitLine: { lineStyle: { color: '#F1F5F9' } }
    },
    series: [{
      type: 'line',
      smooth: true,
      symbolSize: 8,
      data,
      lineStyle: {
        color: '#EF4444',
        width: 2
      },
      itemStyle: {
        color: '#EF4444'
      },
      areaStyle: {
        color: {
          type: 'linear', x: 0, y: 0, x2: 0, y2: 1,
          colorStops: [
            { offset: 0, color: 'rgba(239, 68, 68, 0.15)' },
            { offset: 1, color: 'rgba(239, 68, 68, 0)' }
          ]
        }
      },
      markPoint: {
        data: [
          { type: 'max', name: '峰值', itemStyle: { color: '#F59E0B' } }
        ],
        label: { color: '#fff', fontSize: 10 }
      }
    }]
  };
}
