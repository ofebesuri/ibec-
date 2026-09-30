'use client';

import { useEffect, useRef, useState } from 'react';
import { Box, Download, Loader2, Move3D, RotateCw, ZoomIn, ZoomOut, Atom, Layers } from 'lucide-react';
import toast from 'react-hot-toast';

interface ProteinViewer3DProps {
  pdbId?: string;
  pdbData?: string;
  height?: string;
}

export function ProteinViewer3D({ pdbId, height = '500px' }: ProteinViewer3DProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [viewerReady, setViewerReady] = useState(false);
  const [autoRotate, setAutoRotate] = useState(true);
  const [zoom, setZoom] = useState(1);
  const dragStateRef = useRef<{ dragging: boolean; startX: number; startY: number; rotX: number; rotY: number }>(
    { dragging: false, startX: 0, startY: 0, rotX: 0, rotY: 0 }
  );
  const [rotation, setRotation] = useState({ x: 0, y: 0 });
  const svgRef = useRef<SVGSVGElement | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
      setViewerReady(true);
    }, 600);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!viewerReady || !autoRotate) return;
    const interval = setInterval(() => {
      setRotation((r) => ({ x: r.x, y: (r.y + 1.2) % 360 }));
    }, 60);
    return () => clearInterval(interval);
  }, [viewerReady, autoRotate]);

  const handleResetView = () => {
    setRotation({ x: 0, y: 0 });
    setZoom(1);
    setAutoRotate(true);
  };

  const handleZoomIn = () => setZoom((z) => Math.min(2.5, +(z + 0.2).toFixed(2)));
  const handleZoomOut = () => setZoom((z) => Math.max(0.5, +(z - 0.2).toFixed(2)));

  const handleDownloadPdb = () => {
    if (!pdbId) {
      toast.error('当前元件未关联 PDB ID，无法导出');
      return;
    }
    const url = `https://files.rcsb.org/download/${pdbId.toUpperCase()}.pdb`;
    window.open(url, '_blank', 'noopener,noreferrer');
    toast.success(`已跳转 RCSB 下载 ${pdbId}`);
  };

  const onPointerDown = (e: React.PointerEvent) => {
    setAutoRotate(false);
    dragStateRef.current.dragging = true;
    dragStateRef.current.startX = e.clientX;
    dragStateRef.current.startY = e.clientY;
    dragStateRef.current.rotX = rotation.x;
    dragStateRef.current.rotY = rotation.y;
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (!dragStateRef.current.dragging) return;
    const dx = e.clientX - dragStateRef.current.startX;
    const dy = e.clientY - dragStateRef.current.startY;
    setRotation({
      x: dragStateRef.current.rotX + dy * 0.4,
      y: dragStateRef.current.rotY + dx * 0.4
    });
  };

  const onPointerUp = (e: React.PointerEvent) => {
    dragStateRef.current.dragging = false;
    try {
      (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
    } catch {
      /* ignore */
    }
  };

  return (
    <div
      className="relative panel-strong overflow-hidden"
      style={{ height }}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-ink-900 via-ink-850 to-ink-950" />
      <div className="absolute inset-0 grid-bg opacity-40" />
      <div className="absolute inset-0 conic-mask opacity-40" />

      <div className="absolute top-0 inset-x-0 z-20 flex items-center justify-between p-4 bg-ink-900/95 border-b border-white/5">
        <div className="flex items-center gap-2">
          <span className="w-8 h-8 rounded-lg bg-gradient-to-br from-compute-500 to-bio-500 flex items-center justify-center text-ink-950">
            <Move3D className="w-4 h-4" strokeWidth={2.4} />
          </span>
          <div>
            <h3 className="text-sm font-semibold text-white">三维蛋白结构</h3>
            <p className="text-xs text-text-tertiary font-mono">
              {pdbId ? `PDB · ${pdbId}` : '暂无 PDB · 等待接入 Mol*'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={() => setAutoRotate((v) => !v)}
            className={`p-1.5 rounded-md hover:bg-white/5 ${autoRotate ? 'text-bio-300' : 'text-text-tertiary hover:text-white'}`}
            title={autoRotate ? '暂停旋转' : '开始自动旋转'}
            aria-label="toggle auto-rotate"
          >
            <RotateCw className="w-4 h-4" />
          </button>
          <button
            onClick={handleZoomOut}
            className="p-1.5 rounded-md text-text-tertiary hover:text-white hover:bg-white/5"
            title="缩小"
            aria-label="zoom-out"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <button
            onClick={handleZoomIn}
            className="p-1.5 rounded-md text-text-tertiary hover:text-white hover:bg-white/5"
            title="放大"
            aria-label="zoom-in"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <button
            onClick={handleResetView}
            className="p-1.5 rounded-md text-text-tertiary hover:text-white hover:bg-white/5"
            title="复位视角"
            aria-label="reset"
          >
            <Box className="w-4 h-4" />
          </button>
          <button
            onClick={handleDownloadPdb}
            disabled={!pdbId}
            className="p-1.5 rounded-md text-text-tertiary hover:text-white hover:bg-white/5 disabled:opacity-40 disabled:cursor-not-allowed"
            title={pdbId ? `下载 ${pdbId} (RCSB)` : '当前无 PDB ID'}
            aria-label="download-pdb"
          >
            <Download className="w-4 h-4" />
          </button>
        </div>
      </div>

      {isLoading && (
        <div className="absolute inset-0 z-30 flex items-center justify-center bg-ink-950/85">
          <div className="text-center">
            <Loader2 className="w-8 h-8 mx-auto mb-3 text-compute-300 animate-spin" />
            <p className="text-sm text-text-secondary">正在准备三维视图...</p>
            <p className="text-xs text-text-tertiary mt-1 font-mono">
              {pdbId ? `准备载入 PDB ${pdbId}` : '演示结构'}
            </p>
          </div>
        </div>
      )}

      {viewerReady && (
        <div
          className="absolute inset-0 cursor-grab active:cursor-grabbing select-none"
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
        >
          <Demo3DProtein rotation={rotation} zoom={zoom} svgRef={svgRef} />
        </div>
      )}

      <div className="absolute bottom-0 inset-x-0 z-20 p-3 bg-ink-900/95 border-t border-white/5 flex flex-wrap items-center justify-center gap-4 text-xs text-text-secondary">
        <span className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-bio-300" /> α-helix
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-glow-300" /> β-sheet
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-ip-300" /> Loop
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-alert-400" /> Active site
        </span>
        <span className="hidden md:inline-flex items-center gap-1.5 text-text-tertiary">
          <Atom className="w-3 h-3" /> 60 atoms · 演示
        </span>
        <span className="hidden md:inline-flex items-center gap-1.5 text-text-tertiary font-mono">
          zoom ×{zoom.toFixed(2)} · rot {rotation.y.toFixed(0)}°
        </span>
      </div>

      {!pdbId && (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10 text-center max-w-sm pointer-events-none">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-ink-800/70 border border-white/10 text-[10px] font-mono tracking-[0.2em] uppercase text-text-tertiary">
            <Layers className="w-3 h-3" />
            演示模式 · SVG helix
          </div>
          <p className="mt-2 text-xs text-text-secondary">
            真实 PDB 集成规划中 · 现阶段可用{' '}
            <a
              href="https://www.rcsb.org"
              target="_blank"
              rel="noopener noreferrer"
              className="text-bio-200 hover:text-white underline-offset-2 hover:underline"
              onClick={(e) => e.stopPropagation()}
            >
              RCSB
            </a>{' '}
            链接查看真实结构
          </p>
        </div>
      )}
    </div>
  );
}

interface DemoProps {
  rotation: { x: number; y: number };
  zoom: number;
  svgRef: React.RefObject<SVGSVGElement>;
}

function Demo3DProtein({ rotation, zoom }: DemoProps) {
  // 将三维坐标 (x,y,z) 旋转后投影到二维平面
  const project = (idx: number, total: number) => {
    const t = idx / total;
    const angle = t * Math.PI * 6;
    const radius = 15 + t * 25;
    // 局部三维坐标
    const lx = Math.cos(angle) * radius;
    const ly = Math.sin(angle) * radius * 0.3 + t * 30 - 15;
    const lz = Math.sin(angle) * radius;

    // 应用 X 轴旋转
    const rx = (rotation.x * Math.PI) / 180;
    const ry = (rotation.y * Math.PI) / 180;
    const x1 = lx * Math.cos(ry) - lz * Math.sin(ry);
    const z1 = lx * Math.sin(ry) + lz * Math.cos(ry);
    const y1 = ly * Math.cos(rx) - z1 * Math.sin(rx);
    const z2 = ly * Math.sin(rx) + z1 * Math.cos(rx);

    return {
      x: 50 + x1 * zoom,
      y: 50 + y1 * zoom,
      z: z2 * zoom,
      depth: (z2 + 40) / 80
    };
  };

  const total = 60;
  const atoms = Array.from({ length: total }, (_, i) => {
    const p = project(i, total);
    const isHelix = i % 3 === 0;
    const isSheet = i % 3 === 1;
    const isActive = i > 50;
    return {
      ...p,
      color: isActive ? '#FF4242' : isHelix ? '#16BFDB' : isSheet ? '#16D88A' : '#FF9A1F',
      size: isActive ? 7 : 5,
      opacity: 0.55 + p.depth * 0.4
    };
  }).sort((a, b) => a.z - b.z); // 远到近排序，确保前景覆盖背景

  return (
    <div className="absolute inset-0">
      <svg
        viewBox="0 0 100 100"
        preserveAspectRatio="xMidYMid meet"
        className="w-full h-full"
      >
        <defs>
          <radialGradient id="centerGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#7E3AFF" stopOpacity="0.22" />
            <stop offset="100%" stopColor="#7E3AFF" stopOpacity="0" />
          </radialGradient>
        </defs>

        <circle cx="50" cy="50" r="38" fill="url(#centerGlow)" />

        {atoms.map((atom, i) => {
          if (i === atoms.length - 1) return null;
          const next = atoms[i + 1];
          return (
            <line
              key={`bond-${i}`}
              x1={atom.x}
              y1={atom.y}
              x2={next.x}
              y2={next.y}
              stroke="#16BFDB"
              strokeWidth="0.3"
              opacity={Math.min(atom.opacity, next.opacity) * 0.5}
            />
          );
        })}

        {atoms.map((atom, i) => (
          <g key={`atom-${i}`}>
            <circle
              cx={atom.x}
              cy={atom.y}
              r={atom.size / 3}
              fill={atom.color}
              opacity={atom.opacity}
            />
          </g>
        ))}
      </svg>
    </div>
  );
}
