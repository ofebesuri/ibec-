import Link from 'next/link';
import { ArrowLeft, Flame, TrendingUp } from 'lucide-react';
import {
  TOPICS,
  USERS,
  CATEGORIES,
  ForumUser,
  ForumCategory
} from '@/app/forum/_data/mockForum';
import { TopicList } from '@/app/forum/_components/TopicList';

// Discourse-style "hot" page (v2026.09.20-Final)
// Cross-forum hot topics sorted by repliesCount + viewsCount*0.05

export default function HotPage() {
  const usersMap = Object.fromEntries(USERS.map((u) => [u.id, u])) as Record<string, ForumUser>;
  const categoryMap = Object.fromEntries(CATEGORIES.map((c) => [c.id, c])) as Record<string, ForumCategory>;

  const hot = [...TOPICS]
    .sort((a, b) => (b.repliesCount + b.viewsCount * 0.05) - (a.repliesCount + a.viewsCount * 0.05))
    .slice(0, 30);

  const totalReplies = hot.reduce((acc, t) => acc + t.repliesCount, 0);
  const totalViews = hot.reduce((acc, t) => acc + t.viewsCount, 0);

  return (
    <div className="space-y-5">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-xs text-text-tertiary font-mono uppercase tracking-[0.16em]">
        <Link href="/forum" className="hover:text-white flex items-center gap-1">
          <ArrowLeft className="w-3 h-3" />论坛
        </Link>
        <span>›</span>
        <span className="text-white">热门</span>
      </div>

      {/* Hero */}
      <section className="panel-strong panel-shine p-5 lg:p-6 relative overflow-hidden">
        <div className="absolute -top-20 -right-20 w-64 h-64 rounded-full bg-glow-500/20 blur-3xl pointer-events-none" />
        <div className="relative flex flex-col md:flex-row md:items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-glow-500/40 to-alert-500/30 flex items-center justify-center flex-shrink-0 border border-white/10 shadow-glow-sm">
            <Flame className="w-7 h-7 text-glow-300" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 mb-1.5">
              <span className="chip">Trending · 30 天</span>
              <span className="badge badge-info">Discourse 风格</span>
            </div>
            <h1 className="text-2xl lg:text-3xl font-bold text-white">热门话题</h1>
            <p className="text-sm text-text-secondary mt-1">
              按 <code className="text-bio-300">回复数 + 浏览数 × 0.05</code> 排序的跨分类热度榜 · 前 {hot.length} 个
            </p>
          </div>
        </div>
      </section>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatBox label="入榜话题" value={hot.length.toString()} />
        <StatBox label="累计回复" value={totalReplies.toLocaleString()} />
        <StatBox label="累计浏览" value={totalViews.toLocaleString()} />
        <StatBox label="跨分类数" value={new Set(hot.map((t) => t.categoryId)).size.toString()} accent />
      </div>

      {/* Topic list */}
      <div className="space-y-3">
        <h2 className="text-xs font-mono tracking-[0.18em] uppercase text-text-tertiary px-1 flex items-center gap-2">
          <TrendingUp className="w-3.5 h-3.5" />
          热度排行
        </h2>
        <TopicList topics={hot} users={usersMap} categoryMap={categoryMap} />
      </div>
    </div>
  );
}

function StatBox({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className="panel px-3 py-3">
      <div className="text-[10px] font-mono tracking-[0.18em] uppercase text-text-tertiary">{label}</div>
      <div className={`text-xl font-semibold font-mono ${accent ? 'text-glow-400' : 'text-white'}`}>
        {value}
      </div>
    </div>
  );
}
