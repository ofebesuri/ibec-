import Link from 'next/link';
import { ArrowLeft, MailOpen, Clock } from 'lucide-react';
import {
  TOPICS,
  USERS,
  CATEGORIES,
  ForumUser,
  ForumCategory
} from '@/app/forum/_data/mockForum';
import { TopicList } from '@/app/forum/_components/TopicList';

// Discourse-style "unread" page (v2026.09.20-Final)
// Demo: since there's no real user/auth, we simulate "unread" by listing the most recent
// 24h of topics that have new replies (repliesCount > 0) and aren't pinned.

export default function UnreadPage() {
  const usersMap = Object.fromEntries(USERS.map((u) => [u.id, u])) as Record<string, ForumUser>;
  const categoryMap = Object.fromEntries(CATEGORIES.map((c) => [c.id, c])) as Record<string, ForumCategory>;

  // Simulated unread = active topics with replies, sorted by recent activity
  const cutoff = Date.now() - 24 * 60 * 60 * 1000;
  const unread = [...TOPICS]
    .filter((t) => t.repliesCount > 0 && !t.closed)
    .filter((t) => new Date(t.lastActivityAt).getTime() >= cutoff)
    .sort((a, b) => b.lastActivityAt.localeCompare(a.lastActivityAt))
    .slice(0, 25);

  // Fallback: if no topics fall in the last 24h, show the latest 20 active topics
  const finalList = unread.length > 0 ? unread : [...TOPICS]
    .filter((t) => t.repliesCount > 0 && !t.closed)
    .sort((a, b) => b.lastActivityAt.localeCompare(a.lastActivityAt))
    .slice(0, 20);

  return (
    <div className="space-y-5">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-xs text-text-tertiary font-mono uppercase tracking-[0.16em]">
        <Link href="/forum" className="hover:text-white flex items-center gap-1">
          <ArrowLeft className="w-3 h-3" />论坛
        </Link>
        <span>›</span>
        <span className="text-white">未读</span>
      </div>

      {/* Hero */}
      <section className="panel-strong panel-shine p-5 lg:p-6 relative overflow-hidden">
        <div className="absolute -top-20 -right-20 w-64 h-64 rounded-full bg-bio-500/20 blur-3xl pointer-events-none" />
        <div className="relative flex flex-col md:flex-row md:items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-bio-500/40 to-compute-500/30 flex items-center justify-center flex-shrink-0 border border-white/10 shadow-glow-sm">
            <MailOpen className="w-7 h-7 text-bio-300" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 mb-1.5">
              <span className="chip">Unread · 演示模式</span>
              <span className="badge badge-info">Discourse 风格</span>
            </div>
            <h1 className="text-2xl lg:text-3xl font-bold text-white">未读话题</h1>
            <p className="text-sm text-text-secondary mt-1">
              演示模式：列出近 24 小时内有新回复的活跃话题。真实论坛需登录后追踪阅读位置。
            </p>
          </div>
          <div className="flex gap-2 flex-shrink-0">
            <button type="button" className="btn-secondary text-sm whitespace-nowrap">
              全部标已读
            </button>
          </div>
        </div>
      </section>

      {/* Hint banner */}
      <div className="panel p-3 flex items-center gap-2 border-l-4 border-l-bio-500">
        <Clock className="w-4 h-4 text-bio-300 flex-shrink-0" />
        <div className="text-xs text-text-secondary">
          当前展示 {finalList.length} 个有最新动态的话题 · 排序：最近活动优先
        </div>
      </div>

      {/* Topic list */}
      <TopicList topics={finalList} users={usersMap} categoryMap={categoryMap} />
    </div>
  );
}
