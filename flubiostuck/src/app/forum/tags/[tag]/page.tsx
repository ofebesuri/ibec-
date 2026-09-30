import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Hash, MessageCircle, Eye, Users } from 'lucide-react';
import {
  TOPICS,
  USERS,
  CATEGORIES,
  ForumUser,
  ForumCategory
} from '../../_data/mockForum';
import { TopicList } from '../../_components/TopicList';

// Discourse-style tag page (v2026.09.20-Final)
// Tag hero + participating users + category breakdown + topic list

export default function TagPage({ params }: { params: { tag: string } }) {
  const tag = decodeURIComponent(params.tag);
  const taggedTopics = TOPICS.filter((t) => t.tags.includes(tag));

  if (taggedTopics.length === 0) {
    // Render "tag not found" rather than 404 — Discourse keeps the page so users can still discover
    // the canonical tag list. We use a 404 if the tag literally has zero data, but tag params here
    // are URL-encoded so this case is rare; we keep notFound() for clean dead links.
    return notFound();
  }

  const usersMap = Object.fromEntries(USERS.map((u) => [u.id, u])) as Record<string, ForumUser>;
  const categoryMap = Object.fromEntries(CATEGORIES.map((c) => [c.id, c])) as Record<string, ForumCategory>;

  const sorted = [...taggedTopics].sort((a, b) => b.lastActivityAt.localeCompare(a.lastActivityAt));
  const totalReplies = taggedTopics.reduce((acc, t) => acc + t.repliesCount, 0);
  const totalViews = taggedTopics.reduce((acc, t) => acc + t.viewsCount, 0);

  const authorIds = Array.from(new Set(taggedTopics.map((t) => t.authorId)));
  const topAuthors = authorIds
    .map((id) => usersMap[id])
    .filter(Boolean)
    .sort((a, b) => b.postsCount - a.postsCount)
    .slice(0, 6);

  const catBreakdown = aggregateCategoryBreakdown(taggedTopics, categoryMap);

  return (
    <div className="space-y-5">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-xs text-text-tertiary font-mono uppercase tracking-[0.16em]">
        <Link href="/forum" className="hover:text-white flex items-center gap-1">
          <ArrowLeft className="w-3 h-3" />论坛
        </Link>
        <span>›</span>
        <Link href="/forum" className="hover:text-white">标签</Link>
        <span>›</span>
        <span className="text-white">#{tag}</span>
      </div>

      {/* Tag hero */}
      <section className="panel-strong panel-shine p-5 lg:p-6 relative overflow-hidden">
        <div className="absolute -top-20 -right-20 w-64 h-64 rounded-full bg-compute-500/15 blur-3xl pointer-events-none" />
        <div className="relative flex flex-col md:flex-row md:items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-compute-500/30 via-bio-500/20 to-glow-500/30 flex items-center justify-center flex-shrink-0 border border-white/10">
            <Hash className="w-7 h-7 text-bio-300" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 mb-1.5">
              <span className="chip">Tag</span>
              <span className="badge badge-info">Discourse 风格</span>
            </div>
            <h1 className="text-2xl lg:text-3xl font-bold text-white">
              <span className="text-text-tertiary font-mono">#</span>{tag}
            </h1>
            <p className="text-sm text-text-secondary mt-1">
              包含此标签的 {taggedTopics.length} 个话题 · 累计 {totalReplies} 条回复 · {totalViews.toLocaleString()} 次浏览
            </p>
          </div>
          <div className="flex flex-wrap gap-2 flex-shrink-0">
            <Link href="/forum/new" className="btn-primary text-sm whitespace-nowrap">
              + 发起相关话题
            </Link>
            <button type="button" className="btn-secondary text-sm whitespace-nowrap">
              关注标签
            </button>
          </div>
        </div>
      </section>

      {/* Stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatBox label="话题" value={taggedTopics.length.toString()} />
        <StatBox label="回复" value={totalReplies.toLocaleString()} />
        <StatBox label="浏览" value={totalViews.toLocaleString()} />
        <StatBox label="参与者" value={authorIds.length.toString()} accent />
      </div>

      {/* Main grid: list + sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 space-y-3">
          <h2 className="text-xs font-mono tracking-[0.18em] uppercase text-text-tertiary px-1">
            话题列表 · 按最近活动排序
          </h2>
          <TopicList topics={sorted} users={usersMap} categoryMap={categoryMap} />
        </div>

        <aside className="space-y-4">
          {/* Top authors */}
          <section className="panel p-4">
            <h3 className="text-xs font-mono tracking-[0.18em] uppercase text-text-tertiary mb-3 flex items-center gap-2">
              <Users className="w-3 h-3" />
              活跃参与者
            </h3>
            <div className="space-y-2">
              {topAuthors.map((u) => (
                <Link
                  key={u.id}
                  href={`/forum/users/${encodeURIComponent(u.id)}`}
                  className="flex items-center gap-2.5 group min-w-0"
                >
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-semibold flex-shrink-0"
                    style={{ background: u.avatarColor }}
                  >
                    {u.displayName.charAt(0)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-xs text-white truncate group-hover:text-bio-200">
                      {u.displayName}
                    </div>
                    <div className="text-[10px] text-text-tertiary truncate">{u.title}</div>
                  </div>
                  <span className="text-[10px] font-mono text-text-tertiary">
                    {taggedTopics.filter((t) => t.authorId === u.id).length}
                  </span>
                </Link>
              ))}
            </div>
          </section>

          {/* Category breakdown */}
          <section className="panel p-4">
            <h3 className="text-xs font-mono tracking-[0.18em] uppercase text-text-tertiary mb-3">
              分类分布
            </h3>
            <div className="space-y-2">
              {catBreakdown.map(({ cat, count }) => (
                <Link
                  key={cat.id}
                  href={`/forum/c/${cat.slug}`}
                  className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-ink-800/70 transition group min-w-0"
                >
                  <span
                    className="w-7 h-7 rounded-md flex items-center justify-center text-base flex-shrink-0"
                    style={{
                      background: `${cat.color}20`,
                      border: `1px solid ${cat.color}40`
                    }}
                  >
                    {cat.iconEmoji}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="text-xs text-white truncate group-hover:text-bio-200">{cat.name}</div>
                  </div>
                  <span className="text-[10px] font-mono text-text-tertiary">{count}</span>
                </Link>
              ))}
            </div>
          </section>
        </aside>
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

function aggregateCategoryBreakdown(
  topics: { categoryId: string }[],
  categoryMap: Record<string, ForumCategory>
) {
  const m = new Map<string, number>();
  for (const t of topics) m.set(t.categoryId, (m.get(t.categoryId) || 0) + 1);
  return Array.from(m.entries())
    .map(([id, count]) => ({ cat: categoryMap[id], count }))
    .filter((entry) => entry.cat)
    .sort((a, b) => b.count - a.count);
}
