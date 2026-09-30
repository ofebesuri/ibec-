'use client';

import { ReactNode, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Activity,
  Atom,
  Beaker,
  ChevronRight,
  Clock,
  Command,
  Compass,
  Database,
  Globe,
  Layers,
  LineChart,
  Menu,
  MessageSquareText,
  Search,
  ShieldCheck,
  Sparkles,
  Users,
  X
} from 'lucide-react';
import { ChatWidget } from '@/components/chat/ChatWidget';
import { Footer } from '@/components/layout/Footer';
import { BrandLogo } from '@/components/layout/BrandLogo';
import { useUiStore } from '@/lib/store/uiStore';

type NavItem = {
  href: string;
  label: string;
  icon: any;
  hint: string;
  section: 'workspace' | 'science' | 'community';
};

const navItems: NavItem[] = [
  { href: '/', label: '控制台总览', icon: Compass, hint: 'CORE', section: 'workspace' },
  { href: '/database', label: '元件数据库', icon: Database, hint: 'DATA', section: 'workspace' },
  { href: '/analysis', label: '在线分析', icon: Beaker, hint: 'AI · ODE', section: 'science' },
  { href: '/benchmark', label: 'FluBench', icon: Activity, hint: 'BENCH', section: 'science' },
  { href: '/community', label: '资源中心', icon: Users, hint: 'TEAM', section: 'community' },
  { href: '/forum', label: '社区论坛', icon: MessageSquareText, hint: 'FORUM', section: 'community' }
];

const tickerItems = [
  { module: 'SCFV', text: 'H5N1-HA · 候选 #127 亲和力 ΔG = -11.4 kcal/mol · 待实验验证' },
  { module: 'EPI', text: 'R0=1.42 · 疫苗覆盖 38% · 峰值推迟 5.8 周' },
  { module: 'OMICS', text: 'DESeq2 基线 · 1,284 DEG · FC>1.5 · FDR<0.05' },
  { module: 'CIRCUIT', text: 'Notch-NFκB 振荡周期 6.2h · 振幅稳定' },
  { module: 'IP', text: 'PRV/US2025/018842 · 风险等级 HIGH · 待法务复核' },
  { module: 'BENCH', text: 'FluBench baseline run · 12 算法 · runtime 482s' },
  { module: 'STAGE', text: '3D 主舞台 · 中央 CORE · 5 卫星 · 5 辐射线 · WebGL/CSS 自适应' }
];

function sectionLabel(section: NavItem['section']) {
  if (section === 'workspace') return '工作区';
  if (section === 'science') return '科研计算';
  return '社区与协作';
}

function isItemActive(pathname: string, href: string) {
  if (href === '/') return pathname === '/';
  return pathname === href || pathname.startsWith(href + '/');
}

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const searchOpen = useUiStore((s) => s.commandOpen);
  const setSearchOpen = useUiStore((s) => s.setCommandOpen);
  const mobileOpen = useUiStore((s) => s.mobileNavOpen);
  const setMobileOpen = useUiStore((s) => s.setMobileNavOpen);
  const toggleCopilot = useUiStore((s) => s.toggleCopilot);
  const [time, setTime] = useState<string>('--:--:-- UTC');

  useEffect(() => {
    const fmt = new Intl.DateTimeFormat('en-GB', {
      timeZone: 'Asia/Shanghai',
      hour12: false,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
    const update = () => {
      setTime(fmt.format(new Date()).replace(',', '') + ' CST');
    };
    update();
    const id = window.setInterval(update, 30000);
    return () => window.clearInterval(id);
  }, []);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setSearchOpen(!searchOpen);
      }
      // ⌘. or Ctrl+. → 切换 Copilot
      if ((e.metaKey || e.ctrlKey) && e.key === '.') {
        e.preventDefault();
        toggleCopilot();
      }
      if (e.key === 'Escape') {
        setSearchOpen(false);
        setMobileOpen(false);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [searchOpen, toggleCopilot]);

  const grouped = useMemo(() => {
    const out: Record<NavItem['section'], NavItem[]> = {
      workspace: [],
      science: [],
      community: []
    };
    navItems.forEach((item) => out[item.section].push(item));
    return out;
  }, []);

  const sectionOrder: NavItem['section'][] = ['workspace', 'science', 'community'];

  return (
    <div className="app-shell app-shell-shine">
      <div className="relative z-10 flex min-h-screen">
        {/* Sidebar */}
        <aside className="hidden lg:flex flex-col w-[260px] flex-shrink-0 border-r border-white/5 bg-ink-900/95">
          <Link
            href="/"
            className="flex items-center gap-3 px-5 h-16 border-b border-white/5"
          >
            <BrandLogo size={40} />
            <div className="flex flex-col leading-tight">
              <span className="text-[15px] font-semibold text-white tracking-wide">FluBioStack</span>
              <span className="text-[10px] font-mono text-text-tertiary tracking-[0.32em] uppercase">
                v2026.09.20 · console
              </span>
            </div>
          </Link>

          <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-5">
            {sectionOrder.map((section) => (
              <div key={section}>
                <div className="px-3 mb-2 text-[10px] font-mono tracking-[0.32em] uppercase text-text-tertiary">
                  {sectionLabel(section)}
                </div>
                <div className="space-y-1">
                  {grouped[section].map((item) => {
                    const Icon = item.icon;
                    const active = isItemActive(pathname, item.href);
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        className={`group relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all ${
                          active
                            ? 'bg-gradient-to-r from-compute-700/40 to-bio-700/30 text-white shadow-glow-sm'
                            : 'text-text-secondary hover:text-white hover:bg-ink-800/60'
                        }`}
                      >
                        {active && (
                          <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 rounded-r bg-gradient-to-b from-compute-300 via-bio-300 to-glow-300" />
                        )}
                        <Icon className={`w-4 h-4 ${active ? 'text-bio-200' : 'text-text-tertiary group-hover:text-bio-300'}`} />
                        <span className="flex-1 font-medium">{item.label}</span>
                        <span className="text-[9px] font-mono tracking-[0.18em] text-text-tertiary/70">
                          {item.hint}
                        </span>
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))}

            <div className="pt-4 mt-2 border-t border-white/5">
              <div className="px-3 mb-2 text-[10px] font-mono tracking-[0.32em] uppercase text-text-tertiary">
                能力栈
              </div>
              <div className="grid grid-cols-2 gap-2 px-1">
                {[
                  { label: 'scFv 筛选', icon: Sparkles, accent: 'from-compute-500 to-bio-500', href: '/analysis?module=scfv' },
                  { label: '回路 ODE', icon: Atom, accent: 'from-bio-500 to-glow-500', href: '/analysis?module=circuit' },
                  { label: '多组学', icon: LineChart, accent: 'from-glow-500 to-ip-400', href: '/analysis?module=omics' },
                  { label: 'IP 扫描', icon: ShieldCheck, accent: 'from-ip-400 to-alert-400', href: '/database' }
                ].map((chip) => {
                  const Icon = chip.icon;
                  return (
                    <Link
                      key={chip.label}
                      href={chip.href}
                      className="flex items-center gap-2 px-2.5 py-2 rounded-lg bg-ink-800/60 border border-white/5 text-[11px] text-text-secondary hover:text-white hover:border-compute-500/40 transition-colors cursor-pointer"
                    >
                      <span
                        className={`w-6 h-6 rounded-md bg-gradient-to-br ${chip.accent} flex items-center justify-center text-ink-950`}
                      >
                        <Icon className="w-3 h-3" strokeWidth={2.4} />
                      </span>
                      {chip.label}
                    </Link>
                  );
                })}
              </div>
            </div>
          </nav>

          <div className="border-t border-white/5 px-4 py-4 space-y-3">
            <div className="text-[10px] font-mono tracking-[0.32em] uppercase text-text-tertiary">
              系统状态
            </div>
            <div className="grid grid-cols-3 gap-1.5">
              <span className="flex items-center justify-center gap-1 px-1.5 py-1 rounded-md border border-compute-500/30 text-compute-200 bg-compute-500/10 text-[10px] font-mono">
                <Sparkles className="w-2.5 h-2.5" />
                iGEM
              </span>
              <span className="flex items-center justify-center gap-1 px-1.5 py-1 rounded-md border border-glow-500/30 text-glow-200 bg-glow-500/10 text-[10px] font-mono">
                SEED 42
              </span>
              <span className="flex items-center justify-center gap-1 px-1.5 py-1 rounded-md border border-bio-500/30 text-bio-200 bg-bio-500/10 text-[10px] font-mono">
                <ShieldCheck className="w-2.5 h-2.5" />
                IP
              </span>
            </div>
            <div className="flex items-center gap-2 text-[11px] text-text-secondary">
              <span className="w-1.5 h-1.5 rounded-full bg-glow-400 animate-glow-pulse" />
              已连接 LLM Agent · gpt-mini
            </div>
            <Link
              href="/community"
              className="flex items-center justify-between gap-2 px-3 py-2 rounded-lg bg-ink-800/60 border border-white/5 hover:border-compute-500/40 text-xs text-text-secondary hover:text-white transition"
            >
              <span className="flex items-center gap-2">
                <Layers className="w-3.5 h-3.5 text-bio-300" />
                加入 iGEM 协作计划
              </span>
              <ChevronRight className="w-3 h-3" />
            </Link>
          </div>
        </aside>

        {/* Main column */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Top bar */}
          <header className="sticky top-0 z-30 h-12 border-b border-white/5 bg-ink-900/95">
            <div className="h-full px-4 lg:px-6 flex items-center gap-3">
              <button
                className="lg:hidden p-2 rounded-lg border border-white/10 text-text-secondary"
                onClick={() => setMobileOpen(true)}
                aria-label="menu"
              >
                <Menu className="w-5 h-5" />
              </button>

              <button
                onClick={() => setSearchOpen(true)}
                className="md:hidden flex-1 flex items-center gap-2 px-3 py-1.5 rounded-lg bg-ink-800/60 border border-white/5 text-sm text-text-tertiary"
              >
                <Search className="w-4 h-4" />
                <span className="flex-1 text-left">搜索</span>
              </button>

              <div className="hidden lg:flex flex-1 max-w-md mx-2">
                <button
                  onClick={() => setSearchOpen(true)}
                  className="command-bar command-bar-shine w-full flex items-center gap-2 px-3 py-1.5 text-sm text-text-tertiary hover:border-compute-500/40 hover:text-white transition"
                  title="搜索 (Ctrl+K)"
                >
                  <Search className="w-3.5 h-3.5 text-compute-300" />
                  <span className="flex-1 text-left">搜索</span>
                  <span className="inline-flex items-center gap-0.5 text-[10px] font-mono text-text-tertiary">
                    <kbd className="px-1 py-0.5 rounded bg-ink-700 border border-white/10 leading-none">Ctrl</kbd>
                    <kbd className="px-1 py-0.5 rounded bg-ink-700 border border-white/10 leading-none">K</kbd>
                  </span>
                </button>
              </div>

              <div className="ml-auto flex items-center gap-1.5 text-[11px]">
                <span className="hidden lg:inline-flex items-center gap-1 font-mono text-text-tertiary tabular-nums">
                  <Clock className="w-3 h-3" /> {time.split(' ')[1]?.replace(' CST', '') ?? time}
                </span>
                <button
                  onClick={toggleCopilot}
                  className="inline-flex items-center justify-center w-8 h-8 rounded-lg border border-white/10 text-text-secondary hover:text-white hover:border-compute-500/40"
                  aria-label="Copilot"
                  title="Copilot (Ctrl+.)"
                >
                  <MessageSquareText className="w-4 h-4" />
                </button>
              </div>
            </div>
            <div className="spectrum-bar" />
          </header>

          {/* Content */}
          <main className="flex-1 min-w-0">{children}</main>

          {/* Live ticker (horizontal scroll bar at bottom of page) */}
          <section className="border-t border-white/5 bg-ink-900/95">
            <div className="px-4 lg:px-6 py-2 flex items-center gap-3">
              <span className="flex items-center gap-1.5 text-[10px] font-mono tracking-[0.28em] uppercase text-text-tertiary whitespace-nowrap">
                <span className="w-1.5 h-1.5 rounded-full bg-bio-300 animate-glow-pulse" />
                Live Telemetry
              </span>
              <div className="overflow-hidden flex-1 relative h-7">
                <div className="ticker absolute inset-y-0 left-0 items-center">
                  {[...tickerItems, ...tickerItems].map((t, idx) => (
                    <div
                      key={idx}
                      className="flex items-center gap-2 text-xs text-text-secondary whitespace-nowrap ticker-shine"
                    >
                      <span className="px-1.5 py-0.5 rounded bg-ink-800/70 border border-white/5 font-mono text-bio-200">
                        {t.module}
                      </span>
                      <span>{t.text}</span>
                      <span className="text-text-tertiary mx-2">·</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>

          <Footer />
        </div>

        {/* Mobile drawer */}
        {mobileOpen && (
            <div className="lg:hidden fixed inset-0 z-50 bg-ink-950/95" onClick={() => setMobileOpen(false)}>
            <div
              className="absolute top-0 left-0 right-0 bg-ink-900 border-b border-white/5 p-4"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <span className="text-white font-semibold">导航</span>
                <button
                  onClick={() => setMobileOpen(false)}
                  className="p-1 rounded-md border border-white/10 text-text-secondary"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="space-y-1">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const active = isItemActive(pathname, item.href);
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setMobileOpen(false)}
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-lg ${
                        active
                          ? 'bg-gradient-to-r from-compute-700/40 to-bio-700/30 text-white'
                          : 'text-text-secondary hover:text-white hover:bg-ink-800/60'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      <span className="text-sm">{item.label}</span>
                    </Link>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Search palette */}
        {searchOpen && (
          <CommandPalette onClose={() => setSearchOpen(false)} pathname={pathname} />
        )}
      </div>

      <ChatWidget />
    </div>
  );
}

function CommandPalette({
  onClose,
  pathname
}: {
  onClose: () => void;
  pathname: string;
}) {
  const [query, setQuery] = useState('');
  const items = [
    ...navItems.map((n) => ({
      kind: 'navigation' as const,
      label: n.label,
      sub: sectionLabel(n.section),
      href: n.href,
      icon: n.icon
    })),
    {
      kind: 'shortcut' as const,
      label: '启动 scFv 筛选任务',
      sub: '在线分析 / scFv',
      href: '/analysis?module=scfv',
      icon: Sparkles
    },
    {
      kind: 'shortcut' as const,
      label: '运行 FluBench 基线',
      sub: '基准测试 / 自动',
      href: '/benchmark',
      icon: Activity
    },
    {
      kind: 'shortcut' as const,
      label: '浏览元件数据库',
      sub: '数据表视图',
      href: '/database',
      icon: Database
    },
    {
      kind: 'shortcut' as const,
      label: '进入社区中心',
      sub: '资源、教程、iGEM 协作',
      href: '/community',
      icon: Users
    }
  ];
  const filtered = query
    ? items.filter(
        (i) =>
          i.label.toLowerCase().includes(query.toLowerCase()) ||
          i.sub.toLowerCase().includes(query.toLowerCase())
      )
    : items.slice(0, 8);

  return (
    <div
      className="fixed inset-0 z-[80] bg-ink-950/90 flex items-start justify-center pt-24 px-4"
      onClick={onClose}
    >
      <div
        className="command-bar w-full max-w-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3 px-5 py-4 border-b border-white/5">
          <Command className="w-5 h-5 text-compute-300" />
          <input
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="输入指令：跳转、运行任务、查询元件..."
            className="flex-1 bg-transparent text-base outline-none text-white placeholder:text-text-tertiary"
          />
          <kbd className="px-2 py-1 text-[10px] font-mono rounded bg-ink-700 border border-white/10 text-text-tertiary">
            ESC
          </kbd>
        </div>
        <div className="max-h-80 overflow-y-auto p-2">
          {filtered.length === 0 ? (
            <div className="text-center text-text-tertiary py-8 text-sm">
              没有匹配的指令 · 试试 “scFv” 或 “FluBench”
            </div>
          ) : (
            filtered.map((it) => {
              const Icon = it.icon;
              return (
                <Link
                  key={it.label + it.href}
                  href={it.href}
                  onClick={onClose}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-ink-800/80 ${
                    pathname === it.href ? 'bg-ink-800/60' : ''
                  }`}
                >
                  <span className="w-8 h-8 rounded-lg bg-ink-800/80 border border-white/5 flex items-center justify-center text-bio-300">
                    <Icon className="w-4 h-4" />
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm text-white truncate">{it.label}</div>
                    <div className="text-[11px] text-text-tertiary truncate">{it.sub}</div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-text-tertiary" />
                </Link>
              );
            })
          )}
        </div>
        <div className="flex items-center justify-between px-5 py-3 border-t border-white/5 text-[11px] text-text-tertiary">
          <span>FluBioStack Command Palette · v2026.09.20</span>
          <span className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <Globe className="w-3 h-3" /> 全站快捷键 ⌘K
            </span>
            <span className="flex items-center gap-1">
              <MessageSquareText className="w-3 h-3" /> Copilot ⌘.
            </span>
          </span>
        </div>
      </div>
    </div>
  );
}
