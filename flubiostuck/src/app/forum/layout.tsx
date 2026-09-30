'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, FormEvent } from 'react';
import { ArrowLeft, Search } from 'lucide-react';

export default function ForumLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [query, setQuery] = useState('');

  // v2026.09.20-Final: 修复搜索框回车无反应（包成 form + router.push）
  const handleSearchSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const trimmed = query.trim();
    if (!trimmed) {
      router.push('/forum');
      return;
    }
    router.push(`/forum?filter=search&q=${encodeURIComponent(trimmed)}`);
  };

  return (
    <div className="min-h-screen text-white">
      {/* Standalone top bar (no AppShell left nav) */}
      <header className="sticky top-0 z-30 bg-ink-900/95 border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 lg:px-8 h-14 flex items-center gap-4">
          <Link
            href="/"
            className="flex items-center gap-1.5 text-sm text-text-secondary hover:text-white transition"
            aria-label="返回主站"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">返回主站</span>
          </Link>
          <div className="w-px h-5 bg-white/10" />
          <Link href="/forum" className="flex items-center gap-2 group">
            <span className="w-7 h-7 rounded-lg bg-gradient-to-br from-compute-500 via-bio-400 to-glow-500 flex items-center justify-center text-base shadow-glow-sm">
              💬
            </span>
            <span className="font-semibold text-white">FluBioStack 论坛</span>
            <span className="text-[10px] font-mono text-text-tertiary px-1.5 py-0.5 rounded bg-ink-800/70 border border-white/5">
              v2.0
            </span>
          </Link>

          <form
            onSubmit={handleSearchSubmit}
            className="flex-1 max-w-md mx-4 hidden md:block"
            role="search"
          >
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary pointer-events-none" />
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="搜索话题、标签、用户...（按 Enter）"
                className="w-full bg-ink-800/60 border border-white/10 rounded-lg pl-9 pr-3 py-1.5 text-sm placeholder:text-text-tertiary focus:outline-none focus:border-compute-500/50"
                aria-label="搜索话题"
              />
            </div>
          </form>

          <nav className="flex items-center gap-2 ml-auto">
            <Link href="/forum" className="btn-ghost text-xs hidden sm:inline-flex">最新</Link>
            <Link href="/forum/hot" className="btn-ghost text-xs hidden sm:inline-flex">热门</Link>
            <Link href="/forum/unread" className="btn-ghost text-xs hidden sm:inline-flex">未读</Link>
            <Link href="/forum/users" className="btn-ghost text-xs hidden sm:inline-flex">用户</Link>
            <Link href="/forum/about" className="btn-ghost text-xs hidden md:inline-flex">关于</Link>
            <Link href="/forum/new" className="btn-primary text-xs">+ 发新话题</Link>
          </nav>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 lg:px-8 py-6 lg:py-8">
        {children}
      </main>
    </div>
  );
}
