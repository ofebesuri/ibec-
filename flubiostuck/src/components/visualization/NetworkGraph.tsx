'use client';

// @deprecated - D3 force simulation 调控网络可视化，未被任何页面 import（预留给未来"调控网络"图）。
//                请勿在新增代码中引用。

import { useEffect, useRef, useState } from 'react';

interface NetworkNode {
  id: string;
  name: string;
  group: number;
  score?: number;
}

interface NetworkLink {
  source: string;
  target: string;
  value: number;
}

interface NetworkGraphProps {
  nodes: NetworkNode[];
  links: NetworkLink[];
  width?: number;
  height?: number;
  className?: string;
}

const palette = ['#7E3AFF', '#16BFDB', '#16D88A', '#FF9A1F', '#FF4242'];

export function NetworkGraph({
  nodes,
  links,
  width,
  height = 400,
  className
}: NetworkGraphProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const [isMounted, setIsMounted] = useState(false);
  const [size, setSize] = useState<{ w: number; h: number }>({
    w: width ?? 800,
    h: height
  });

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (typeof width === 'number') {
      setSize((prev) => ({ ...prev, w: width }));
      return;
    }
    if (!containerRef.current) return;
    const el = containerRef.current;
    const ro = new ResizeObserver((entries) => {
      const cr = entries[0]?.contentRect;
      if (!cr) return;
      setSize((prev) => ({ ...prev, w: Math.max(280, Math.floor(cr.width)) }));
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, [width]);

  useEffect(() => {
    if (!isMounted || !svgRef.current) return;
    let disposed = false;

    import('d3').then((d3) => {
      if (disposed || !svgRef.current) return;

      const svgEl = svgRef.current;
      const svg = d3.select(svgEl);
      svg.selectAll('*').remove();

      const validNodes = nodes.filter((n) => n != null);
      const validLinks = links.filter((l) => l != null && l.source && l.target);

      svg
        .append('defs')
        .selectAll('marker')
        .data(['arrow'])
        .enter()
        .append('marker')
        .attr('id', (d) => d)
        .attr('viewBox', '0 -5 10 10')
        .attr('refX', 20)
        .attr('refY', 0)
        .attr('markerWidth', 6)
        .attr('markerHeight', 6)
        .attr('orient', 'auto')
        .append('path')
        .attr('d', 'M0,-5L10,0L0,5')
        .attr('fill', '#16BFDB')
        .attr('opacity', 0.6);

      const simulation = d3
        .forceSimulation(validNodes as any)
        .force(
          'link',
          d3
            .forceLink(validLinks)
            .id((d: any) => d.id)
            .distance(120)
        )
        .force('charge', d3.forceManyBody().strength(-300))
        .force('center', d3.forceCenter(size.w / 2, size.h / 2))
        .force('collision', d3.forceCollide().radius(30));

      const link = svg
        .append('g')
        .selectAll('line')
        .data(validLinks)
        .enter()
        .append('line')
        .attr('class', 'network-link')
        .attr('stroke', '#16BFDB')
        .attr('stroke-opacity', 0.55)
        .attr('stroke-width', (d: any) => Math.sqrt(d.value))
        .attr('marker-end', 'url(#arrow)');

      const node = svg
        .append('g')
        .selectAll('g')
        .data(validNodes)
        .enter()
        .append('g')
        .attr('class', 'network-node')
        .call(
          d3
            .drag<any, any>()
            .on('start', (event: any, d: any) => {
              if (!event.active) simulation.alphaTarget(0.3).restart();
              d.fx = d.x;
              d.fy = d.y;
            })
            .on('drag', (event: any, d: any) => {
              d.fx = event.x;
              d.fy = event.y;
            })
            .on('end', (event: any, d: any) => {
              if (!event.active) simulation.alphaTarget(0);
              d.fx = null;
              d.fy = null;
            })
        );

      const colorScale = d3
        .scaleOrdinal<string>()
        .domain(['0', '1', '2', '3', '4'])
        .range(palette);

      node
        .append('circle')
        .attr('r', (d: any) => 8 + (d.score || 0) * 12)
        .attr('fill', (d: any) => colorScale(String(d.group)))
        .attr('stroke', 'rgba(255,255,255,0.6)')
        .attr('stroke-width', 1.5);

      node
        .append('text')
        .text((d: any) => d.name)
        .attr('x', 0)
        .attr('y', (d: any) => 8 + (d.score || 0) * 12 + 14)
        .attr('text-anchor', 'middle')
        .attr('fill', '#E8EEFF')
        .style('font-size', '11px')
        .style('pointer-events', 'none')
        .style('font-family', 'var(--font-mono), monospace');

      node
        .append('title')
        .text((d: any) => `${d.name}\nScore: ${(d.score || 0).toFixed(2)}`);

      simulation.on('tick', () => {
        link
          .attr('x1', (d: any) => d.source.x)
          .attr('y1', (d: any) => d.source.y)
          .attr('x2', (d: any) => d.target.x)
          .attr('y2', (d: any) => d.target.y);

        node.attr('transform', (d: any) => `translate(${d.x},${d.y})`);
      });

      return () => simulation.stop();
    });

    return () => {
      disposed = true;
    };
  }, [nodes, links, size.w, size.h, isMounted]);

  if (!isMounted) {
    return (
      <div
        ref={containerRef}
        className={`rounded-xl border border-white/5 bg-ink-950/60 ${className ?? ''}`}
        style={{ width: '100%', height }}
      />
    );
  }

  return (
    <div ref={containerRef} className={`w-full ${className ?? ''}`}>
      <svg
        ref={svgRef}
        width={size.w}
        height={size.h}
        style={{
          background:
            'radial-gradient(circle at 50% 50%, rgba(126,58,255,0.12), rgba(5,7,15,0.6))',
          width: '100%',
          borderRadius: 12
        }}
      />
    </div>
  );
}
