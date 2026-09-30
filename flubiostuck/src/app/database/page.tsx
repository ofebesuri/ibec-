'use client';

import { useState, useMemo, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { Suspense } from 'react';
import {
  ArrowUpDown,
  Database,
  Download,
  Heart,
  Search,
  SlidersHorizontal,
  Sparkles,
  X,
  Grid3x3,
  List as ListIcon,
  ChevronRight,
  FileText,
  Command,
  Server,
  Layers,
  ArrowDownAZ,
  ChevronDown
} from 'lucide-react';
import { IPStatusBadge } from '@/components/ui/IPStatusBadge';
import { DEMO_COMPONENTS, Component } from '@/lib/demoData';
import { useUiStore } from '@/lib/store/uiStore';
import { RightDock } from '@/components/layout/RightDock';
import { ComponentQuickView } from '@/components/home/ComponentQuickView';
import { PageHeader } from '@/components/layout/PageHeader';
import toast from 'react-hot-toast';

const subtypes = ['全部', 'H5N1', 'H7N9', 'Influenza B', 'Probiotic'];
const ipStatuses = ['全部', '已保护', '免费使用', '审核中', '限制使用'];
const sortOptions = ['最新更新', '亲和力', '稳定性', '风险等级'];
const PAGE_SIZE = 12;

const ipColorRing: Record<Component['ipStatus'], string> = {
  protected: 'before:bg-ip-400/60',
  free: 'before:bg-glow-400/70',
  pending: 'before:bg-bio-300/60',
  restricted: 'before:bg-alert-400/70'
};

const seqBadge: Record<Component['sequenceType'], { label: string; color: string }> = {
  DNA: { label: 'DNA', color: 'badge-info' },
  Protein: { label: 'Protein', color: 'badge-success' },
  scFv: { label: 'scFv', color: 'badge-warning' }
};

const ipStatusMap: Record<string, Component['ipStatus']> = {
  已保护: 'protected',
  免费使用: 'free',
  审核中: 'pending',
  限制使用: 'restricted'
};
const ipStatusReverseMap: Record<Component['ipStatus'], string> = {
  protected: '已保护',
  free: '免费使用',
  pending: '审核中',
  restricted: '限制使用'
};

export default function DatabasePage() {
  return (
    <Suspense fallback={<DatabaseSkeleton />}>
      <DatabaseWorkbench />
    </Suspense>
  );
}

function DatabaseSkeleton() {
  return (
    <div className="px-4 lg:px-8 py-6 lg:py-8">
      <div className="h-8 w-48 bg-ink-800/60 rounded animate-pulse mb-4" />
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 mb-6">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-20 panel animate-pulse" />
        ))}
      </div>
      <div className="h-14 panel-strong animate-pulse mb-5" />
      <div className="h-72 panel-strong animate-pulse" />
    </div>
  );
}

function DatabaseWorkbench() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const setDetail = useUiStore((s) => s.setDetailComponentId);
  const favorites = useUiStore((s) => s.favorites);
  const toggleFavorite = useUiStore((s) => s.toggleFavorite);
  const dataSourceMode = useUiStore((s) => s.dataSourceMode);
  const setDataSourceMode = useUiStore((s) => s.setDataSourceMode);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSubtype, setSelectedSubtype] = useState('全部');
  const [selectedIPStatus, setSelectedIPStatus] = useState('全部');
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');
  const [filtersOpen, setFiltersOpen] = useState(true);
  const [sortBy, setSortBy] = useState('最新更新');
  const [components, setComponents] = useState<Component[]>(DEMO_COMPONENTS);
  const [dataSource, setDataSource] = useState('离线精选数据');
  const [page, setPage] = useState(1);

  // 从 URL 同步初始筛选（仅运行一次）
  useEffect(() => {
    const q = searchParams?.get('q');
    const st = searchParams?.get('subtype');
    const ip = searchParams?.get('ip');
    if (q) setSearchQuery(q);
    if (st && subtypes.includes(st)) setSelectedSubtype(st);
    if (ip && ipStatuses.includes(ip)) setSelectedIPStatus(ip);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const writeUrl = useCallback(
    (next: { q?: string; subtype?: string; ip?: string }) => {
      const params = new URLSearchParams(searchParams?.toString());
      if (next.q !== undefined) {
        if (next.q) params.set('q', next.q); else params.delete('q');
      }
      if (next.subtype !== undefined) {
        if (next.subtype && next.subtype !== '全部') params.set('subtype', next.subtype); else params.delete('subtype');
      }
      if (next.ip !== undefined) {
        if (next.ip && next.ip !== '全部') params.set('ip', next.ip); else params.delete('ip');
      }
      router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    },
    [router, pathname, searchParams]
  );

  // 调用 API（含 ipStatus 参数）；API 失败时按 dataSourceMode 决定回退
  useEffect(() => {
    if (dataSourceMode === 'offline') {
      setComponents(DEMO_COMPONENTS);
      setDataSource('离线精选数据');
      return;
    }
    const params = new URLSearchParams({ query: searchQuery });
    if (selectedSubtype !== '全部') params.set('subtype', selectedSubtype);
    if (selectedIPStatus !== '全部') params.set('ipStatus', ipStatusMap[selectedIPStatus]);
    const controller = new AbortController();
    fetch(`/api/components?${params.toString()}`, { signal: controller.signal })
      .then((response) =>
        response.ok ? response.json() : Promise.reject(new Error('API unavailable'))
      )
      .then((payload) => {
        setComponents(payload.results);
        setDataSource(
          payload.source === 'curated-fixture-v1'
            ? 'API · 精选数据集 v1'
            : 'API · 生产数据库'
        );
      })
      .catch(() => {
        if (dataSourceMode === 'api') {
          setComponents(DEMO_COMPONENTS);
          setDataSource('API 失败 · 离线回退');
        } else {
          setComponents(DEMO_COMPONENTS);
          setDataSource('离线精选数据');
        }
      });
    return () => controller.abort();
  }, [searchQuery, selectedSubtype, selectedIPStatus, dataSourceMode]);

  // 同步搜索/筛选到 URL（200ms 防抖）
  useEffect(() => {
    const id = window.setTimeout(
      () => writeUrl({ q: searchQuery, subtype: selectedSubtype, ip: selectedIPStatus }),
      200
    );
    return () => window.clearTimeout(id);
  }, [searchQuery, selectedSubtype, selectedIPStatus, writeUrl]);

  const filteredComponents = useMemo(() => {
    const sorted = [...components];
    switch (sortBy) {
      case '最新更新':
        sorted.sort((a, b) => (a.updatedAt < b.updatedAt ? 1 : -1));
        break;
      case '亲和力':
        // 用 (长度 × GC含量 / 100) 作为亲和力代理（deterministic）
        sorted.sort((a, b) => {
          const score = (c: Component) => c.sequence.length * ((c.gcContent ?? 50) / 100);
          return score(b) - score(a);
        });
        break;
      case '稳定性':
        sorted.sort((a, b) => (b.pi ?? 0) - (a.pi ?? 0));
        break;
      case '风险等级':
        sorted.sort((a, b) => {
          const rank = { high: 0, medium: 1, low: 2 } as const;
          return rank[a.riskLevel] - rank[b.riskLevel];
        });
        break;
    }
    return sorted;
  }, [components, sortBy]);

  // 翻页
  useEffect(() => {
    setPage(1);
  }, [searchQuery, selectedSubtype, selectedIPStatus, sortBy, viewMode]);

  const totalPages = Math.max(1, Math.ceil(filteredComponents.length / PAGE_SIZE));
  const pagedComponents = filteredComponents.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const onToggleFavorite = (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    e.stopPropagation();
    toggleFavorite(id);
    const wasFavorite = favorites.includes(id);
    toast.success(wasFavorite ? '已取消收藏' : '已加入收藏');
  };

  const handleBatchExport = () => {
    const data = filteredComponents.map((c) => ({
      id: c.id,
      name: c.name,
      subtype: c.subtype,
      strain: c.strain,
      ipNumber: c.ipNumber,
      ipStatus: c.ipStatus,
      riskLevel: c.riskLevel,
      sequenceType: c.sequenceType,
      sequence: c.sequence,
      pdbId: c.pdbId,
      molecularWeight: c.molecularWeight,
      pi: c.pi,
      gcContent: c.gcContent,
      tags: c.tags,
      neutralizationData: c.neutralizationData,
      dbtlSteps: c.dbtlSteps,
      references: c.references,
      createdAt: c.createdAt,
      updatedAt: c.updatedAt,
      owner: c.owner,
      community: c.community
    }));
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `flubiostack_export_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success(`已导出 ${filteredComponents.length} 个元件（含完整元数据）`);
  };

  const stats = useMemo(() => {
    const total = filteredComponents.length;
    const protected_ = filteredComponents.filter((c) => c.ipStatus === 'protected').length;
    const free = filteredComponents.filter((c) => c.ipStatus === 'free').length;
    const highRisk = filteredComponents.filter((c) => c.riskLevel === 'high').length;
    const withPdb = filteredComponents.filter((c) => c.pdbId).length;
    return { total, protected: protected_, free, highRisk, withPdb };
  }, [filteredComponents]);

  return (
    <div className="px-4 lg:px-8 py-5 lg:py-7">
      <PageHeader
        breadcrumbs={[{ label: '工作区', href: '/' }, { label: '元件数据库' }]}
        title="元件数据库 · 工作台"
        description="高密度数据表视图 · 支持序列、IP、DBTL 字段检索 · API 失败自动回退到精选离线数据集。"
        badges={
          <>
            <span className="chip"><Database className="w-3 h-3" />Component Database · v2</span>
            <span className={`badge ${dataSource.includes('API') ? 'badge-success' : 'badge-warning'}`}>
              <Server className="w-3 h-3" />
              {dataSource}
            </span>
            {favorites.length > 0 && (
              <span className="badge badge-warning">
                <Heart className="w-3 h-3 fill-alert-400 text-alert-400" />
                收藏 {favorites.length}
              </span>
            )}
          </>
        }
        actions={
          <>
            <Link href="/analysis" className="btn-primary">
              <Sparkles className="w-4 h-4" />
              启动 scFv 筛选
            </Link>
            <button onClick={handleBatchExport} className="btn-secondary">
              <Download className="w-4 h-4" />
              批量导出
            </button>
          </>
        }
      />

      {/* Stats band */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 mb-6">
        {[
          { label: '可见元件', value: stats.total, sub: '已应用筛选' },
          { label: '已保护', value: stats.protected, sub: '需授权' },
          { label: '免费使用', value: stats.free, sub: '学术可用' },
          { label: '高风险', value: stats.highRisk, sub: '需法务复核' },
          { label: '含 PDB ID', value: stats.withPdb, sub: '可结构渲染' }
        ].map((s) => (
          <div key={s.label} className="panel px-4 py-3">
            <div className="text-[10px] font-mono tracking-[0.24em] uppercase text-text-tertiary">
              {s.label}
            </div>
            <div className="mt-1 text-2xl font-semibold text-white font-mono">{s.value}</div>
            <div className="text-[11px] text-text-secondary">{s.sub}</div>
          </div>
        ))}
      </div>

      {/* Command bar / search */}
      <div className="panel-strong p-4 mb-5">
        <div className="flex flex-col lg:flex-row items-stretch gap-3">
          <div className="flex-1 flex items-center gap-2 px-3 py-2 rounded-lg bg-ink-900/70 border border-white/10 focus-within:border-compute-500/50">
            <Search className="w-4 h-4 text-text-tertiary flex-shrink-0" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="搜索元件 ID · 流感亚型 · 菌株 · IP 编号 · 关键字"
              className="flex-1 bg-transparent outline-none text-sm placeholder:text-text-tertiary text-white"
            />
            <span className="hidden md:flex items-center gap-1 text-[10px] font-mono text-text-tertiary">
              <Command className="w-3 h-3" /> K
            </span>
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="p-1 rounded text-text-tertiary hover:text-white"
                aria-label="clear"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          <button
            onClick={() => setFiltersOpen((v) => !v)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg border text-sm font-medium transition ${
              filtersOpen
                ? 'bg-compute-700/30 border-compute-500/50 text-white'
                : 'bg-ink-800/60 border-white/10 text-text-secondary hover:text-white'
            }`}
          >
            <SlidersHorizontal className="w-4 h-4" />
            <span>筛选</span>
          </button>

          <div className="flex items-center gap-1 p-1 rounded-lg border border-white/10 bg-ink-800/60">
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded ${
                viewMode === 'table'
                  ? 'bg-compute-700/40 text-white'
                  : 'text-text-tertiary hover:text-white'
              }`}
              aria-label="Table view"
              title="数据表视图"
            >
              <ListIcon className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded ${
                viewMode === 'grid'
                  ? 'bg-compute-700/40 text-white'
                  : 'text-text-tertiary hover:text-white'
              }`}
              aria-label="Grid view"
              title="网格视图"
            >
              <Grid3x3 className="w-4 h-4" />
            </button>
          </div>

          <div className="flex items-center gap-2 px-3 py-2 rounded-lg border border-white/10 bg-ink-800/60 text-sm">
            <ArrowDownAZ className="w-4 h-4 text-text-tertiary" />
            <span className="text-text-tertiary">排序</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-transparent text-white text-sm outline-none"
            >
              {sortOptions.map((opt) => (
                <option key={opt} value={opt} className="bg-ink-900">
                  {opt}
                </option>
              ))}
            </select>
          </div>
        </div>

        {filtersOpen && (
          <div className="mt-4 pt-4 border-t border-white/5 grid grid-cols-1 md:grid-cols-3 gap-6">
            <FilterGroup
              title="流感亚型"
              options={subtypes}
              value={selectedSubtype}
              onChange={setSelectedSubtype}
            />
            <FilterGroup
              title="IP 状态"
              options={ipStatuses}
              value={selectedIPStatus}
              onChange={setSelectedIPStatus}
              accent="ip"
            />
            <div>
              <div className="text-xs font-medium text-text-tertiary mb-2 uppercase tracking-[0.18em]">
                数据来源
              </div>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: 'api' as const, label: 'API 在线', desc: '优先连接生产数据库', icon: Server },
                  { id: 'offline' as const, label: '离线精选', desc: '仅本地数据集', icon: Layers }
                ].map((it) => {
                  const Icon = it.icon;
                  const active = dataSourceMode === it.id;
                  return (
                    <button
                      key={it.id}
                      type="button"
                      onClick={() => setDataSourceMode(it.id)}
                      className={`panel px-3 py-2 text-left transition border ${
                        active
                          ? 'border-compute-500/60 ring-1 ring-compute-500/30'
                          : 'border-white/5 hover:border-compute-500/30'
                      }`}
                    >
                      <div className="flex items-center gap-2 text-[11px] text-white">
                        <Icon className="w-3 h-3 text-bio-300" />
                        {it.label}
                        {active && (
                          <span className="ml-auto w-1.5 h-1.5 rounded-full bg-bio-300 animate-glow-pulse" />
                        )}
                      </div>
                      <div className="text-[10px] text-text-tertiary">{it.desc}</div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Results */}
      <div className="panel-strong overflow-hidden">
        <div className="flex items-center justify-between px-4 lg:px-5 py-3 border-b border-white/5">
          <div className="text-[11px] font-mono tracking-[0.18em] uppercase text-text-tertiary">
            检索结果 · {filteredComponents.length} 条 · 第 {page}/{totalPages} 页 · 视图{' '}
            {viewMode === 'table' ? 'TABLE' : 'GRID'}
          </div>
          <div className="flex items-center gap-2 text-[11px] text-text-tertiary">
            <ArrowUpDown className="w-3 h-3" />
            {sortBy}
          </div>
        </div>

        {filteredComponents.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-ink-800 flex items-center justify-center">
              <Search className="w-6 h-6 text-text-tertiary" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">没有找到匹配的元件</h3>
            <p className="text-text-secondary mb-4 text-sm">尝试调整搜索关键词或筛选条件</p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedSubtype('全部');
                setSelectedIPStatus('全部');
              }}
              className="btn-primary"
            >
              重置筛选
            </button>
          </div>
        ) : viewMode === 'table' ? (
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th>元件 ID</th>
                  <th>名称</th>
                  <th>亚型 · 菌株</th>
                  <th>类型</th>
                  <th>序列长度</th>
                  <th>IP / 风险</th>
                  <th>DBTL</th>
                  <th>更新</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {pagedComponents.map((c) => {
                  const seq = seqBadge[c.sequenceType];
                  const isFav = favorites.includes(c.id);
                  return (
                    <tr
                      key={c.id}
                      className="group cursor-pointer"
                      onClick={() => setDetail(c.id)}
                    >
                      <td className="font-mono text-bio-200 whitespace-nowrap">
                        {c.id}
                      </td>
                      <td className="text-white">
                        <div className="font-medium line-clamp-1 group-hover:text-bio-200">
                          <Link href={`/database/${c.id}`} onClick={(e) => e.stopPropagation()}>{c.name}</Link>
                        </div>
                        <div className="text-[11px] text-text-tertiary line-clamp-1">
                          {c.tags.slice(0, 3).join(' · ')}
                        </div>
                      </td>
                      <td>
                        <div className="text-white text-xs">{c.subtype}</div>
                        <div className="text-[11px] font-mono text-text-tertiary line-clamp-1">
                          {c.strain}
                        </div>
                      </td>
                      <td>
                        <span className={`badge ${seq.color}`}>{seq.label}</span>
                      </td>
                      <td className="font-mono text-white text-xs">
                        {(c.sequence?.length ?? 0).toLocaleString()} bp/aa
                      </td>
                      <td>
                        <IPStatusBadge
                          status={c.ipStatus}
                          riskLevel={c.riskLevel}
                          size="sm"
                          compact
                        />
                      </td>
                      <td>
                        <DbtlProgress steps={c.dbtlSteps} />
                      </td>
                      <td className="text-[11px] font-mono text-text-tertiary whitespace-nowrap">
                        {c.updatedAt}
                      </td>
                      <td className="whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={(e) => onToggleFavorite(e, c.id)}
                            className="p-1 rounded text-text-tertiary hover:text-white"
                            aria-label={isFav ? '取消收藏' : '收藏'}
                            title={isFav ? '已收藏' : '收藏'}
                          >
                            <Heart
                              className={`w-4 h-4 ${
                                isFav
                                  ? 'fill-alert-400 text-alert-400'
                                  : ''
                              }`}
                            />
                          </button>
                          <Link
                            href={`/database/${c.id}`}
                            onClick={(e) => e.stopPropagation()}
                            className="text-bio-200 hover:text-white text-xs flex items-center gap-1"
                          >
                            详情 <ChevronRight className="w-3 h-3" />
                          </Link>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 p-4">
            {pagedComponents.map((c) => {
              const isFav = favorites.includes(c.id);
              return (
                <div
                  key={c.id}
                  role="button"
                  tabIndex={0}
                  onClick={() => setDetail(c.id)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      setDetail(c.id);
                    }
                  }}
                  className={`hex-card p-4 relative before:content-[''] before:absolute before:inset-x-0 before:top-0 before:h-0.5 ${ipColorRing[c.ipStatus]} cursor-pointer`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs text-bio-200">{c.id}</span>
                      <span className={`badge ${seqBadge[c.sequenceType].color} text-[10px]`}>
                        {seqBadge[c.sequenceType].label}
                      </span>
                    </div>
                    <button
                      onClick={(e) => onToggleFavorite(e, c.id)}
                      className="p-1 rounded text-text-tertiary hover:text-white"
                      aria-label={isFav ? '取消收藏' : '收藏'}
                    >
                      <Heart
                        className={`w-4 h-4 ${
                          isFav ? 'fill-alert-400 text-alert-400' : ''
                        }`}
                      />
                    </button>
                  </div>
                  <h3 className="text-sm font-semibold text-white line-clamp-2 min-h-[40px]">
                    <Link href={`/database/${c.id}`} onClick={(e) => e.stopPropagation()}>{c.name}</Link>
                  </h3>
                  <p className="text-[11px] text-text-tertiary line-clamp-2 min-h-[28px] mt-1">
                    {c.description}
                  </p>
                  <div className="mt-3 space-y-1 text-[11px] font-mono">
                    <Row k="亚型" v={c.subtype} />
                    <Row k="菌株" v={c.strain} truncate />
                  </div>
                  <div className="mt-3 flex items-center justify-between">
                    <IPStatusBadge
                      status={c.ipStatus}
                      riskLevel={c.riskLevel}
                      size="sm"
                      compact
                    />
                    <Link
                      href={`/database/${c.id}`}
                      onClick={(e) => e.stopPropagation()}
                      className="text-bio-200 hover:text-white text-xs flex items-center gap-1"
                    >
                      详情 <ChevronRight className="w-3 h-3" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* 分页 */}
        {filteredComponents.length > PAGE_SIZE && (
          <div className="flex items-center justify-between px-4 lg:px-5 py-3 border-t border-white/5 text-xs">
            <span className="text-text-tertiary font-mono">
              第 {(page - 1) * PAGE_SIZE + 1}-{Math.min(page * PAGE_SIZE, filteredComponents.length)} 条 / 共 {filteredComponents.length} 条
            </span>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-2.5 py-1 rounded border border-white/10 disabled:opacity-40 disabled:cursor-not-allowed hover:border-compute-500/40 text-text-secondary hover:text-white"
              >
                上一页
              </button>
              <span className="px-2.5 py-1 rounded bg-compute-700/30 border border-compute-500/40 text-white font-mono">
                {page} / {totalPages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="px-2.5 py-1 rounded border border-white/10 disabled:opacity-40 disabled:cursor-not-allowed hover:border-compute-500/40 text-text-secondary hover:text-white"
              >
                下一页
              </button>
            </div>
          </div>
        )}
      </div>

      {/* BLAST section */}
      <div className="panel-strong mt-6 p-6 lg:p-8">
        <div className="grid md:grid-cols-[1fr_auto] gap-6 items-center">
          <div>
            <div className="chip mb-3">
              <Sparkles className="w-3 h-3" />
              高级功能
            </div>
            <h2 className="text-xl lg:text-2xl font-bold text-white mb-2">
              BLAST 序列比对
            </h2>
            <p className="text-text-secondary text-sm leading-relaxed max-w-3xl">
              上传 FASTA 格式序列，在 {components.length.toLocaleString()} 条当前可检索元件里搜索同源序列，
              返回相似度、比对区域、进化关系等详细分析。
            </p>
            <div className="mt-4 flex flex-wrap items-center gap-2 text-[11px]">
              {[
                { label: 'BLASTN', desc: '核酸 vs 核酸库' },
                { label: 'BLASTP', desc: '蛋白 vs 蛋白库' },
                { label: 'BLASTX', desc: '核酸 vs 蛋白库' }
              ].map((b) => (
                <div
                  key={b.label}
                  className="panel px-3 py-2 flex items-center gap-2"
                >
                  <FileText className="w-3 h-3 text-bio-300" />
                  <span className="text-white font-mono">{b.label}</span>
                  <span className="text-text-tertiary">· {b.desc}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="flex flex-col gap-2 md:items-end">
            <Link href="/analysis?module=multiomics" className="btn-primary">
              运行 BLAST 比对 <ChevronRight className="w-4 h-4" />
            </Link>
            <span className="text-[10px] font-mono tracking-[0.16em] uppercase text-text-tertiary">
              当前 v2026.09.20 · 已集成至多组学模块
            </span>
          </div>
        </div>
      </div>

      <DatabaseDrawer />
    </div>
  );
}

function DatabaseDrawer() {
  const detailId = useUiStore((s) => s.detailComponentId);
  const setDetail = useUiStore((s) => s.setDetailComponentId);
  const component = useMemo(
    () => (detailId ? DEMO_COMPONENTS.find((c) => c.id === detailId) ?? null : null),
    [detailId]
  );
  return (
    <RightDock
      open={!!component}
      onClose={() => setDetail(null)}
      title={component?.name ?? ''}
      subtitle={component ? `${component.id} · ${component.sequenceType}` : ''}
      footer={
        component ? (
          <div className="flex items-center justify-between gap-2 text-xs">
            <span className="font-mono text-text-tertiary truncate">{component.ipNumber}</span>
            <Link
              href={`/database/${component.id}`}
              onClick={() => setDetail(null)}
              className="btn-primary text-xs"
            >
              完整详情
            </Link>
          </div>
        ) : null
      }
    >
      {component && <ComponentQuickView component={component} onClose={() => setDetail(null)} />}
    </RightDock>
  );
}

function FilterGroup({
  title,
  options,
  value,
  onChange,
  accent
}: {
  title: string;
  options: string[];
  value: string;
  onChange: (v: string) => void;
  accent?: 'ip';
}) {
  const colors = accent === 'ip'
    ? 'data-[active=true]:bg-ip-500/30 data-[active=true]:border-ip-400/60'
    : 'data-[active=true]:bg-compute-500/30 data-[active=true]:border-compute-400/60';
  return (
    <div>
      <div className="text-xs font-medium text-text-tertiary mb-2 uppercase tracking-[0.18em]">
        {title}
      </div>
      <div className="flex flex-wrap gap-2">
        {options.map((opt) => (
          <button
            key={opt}
            onClick={() => onChange(opt)}
            data-active={value === opt}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition border ${colors} ${
              value === opt
                ? 'border-transparent'
                : 'bg-ink-800/60 border-white/10 text-text-secondary hover:text-white'
            }`}
          >
            {opt}
          </button>
        ))}
      </div>
    </div>
  );
}

function Row({ k, v, truncate }: { k: string; v: string; truncate?: boolean }) {
  return (
    <div className="flex items-center justify-between text-text-secondary">
      <span className="text-text-tertiary">{k}</span>
      <span className={`text-white ${truncate ? 'truncate max-w-[160px]' : ''}`}>{v}</span>
    </div>
  );
}

function DbtlProgress({ steps }: { steps: Component['dbtlSteps'] }) {
  const completed = steps.filter((s) => s.status === 'completed').length;
  const total = steps.length;
  const phaseOrder: Component['dbtlSteps'][number]['phase'][] = [
    'Design',
    'Build',
    'Test',
    'Learn'
  ];
  return (
    <div className="flex items-center gap-1.5">
      {phaseOrder.map((p) => {
        const step = steps.find((s) => s.phase === p);
        const done = step?.status === 'completed';
        const progress = step?.status === 'in_progress';
        return (
          <div
            key={p}
            title={`${p} · ${step?.status ?? 'pending'}`}
            className={`w-2 h-6 rounded-sm ${
              done
                ? 'bg-gradient-to-b from-compute-500 to-glow-500'
                : progress
                ? 'bg-bio-500/60'
                : 'bg-white/10'
            }`}
          />
        );
      })}
      <span className="ml-2 text-[10px] font-mono text-text-tertiary">
        {completed}/{total}
      </span>
    </div>
  );
}
