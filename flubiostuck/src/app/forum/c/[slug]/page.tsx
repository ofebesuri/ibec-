import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Eye, MessageCircle, Heart, Clock, Pin, CheckCircle2, Flame, Clock4, MessageSquareOff, Users, Hash } from 'lucide-react';
import {
  CATEGORIES,
  TOPICS,
  USERS,
  ForumUser,
  ForumCategory,
  ForumTopic
} from '../../_data/mockForum';
import { TopicList } from '../../_components/TopicList';

// Discourse-style category page (v2026.09.20-Final)
// Hero + filter tabs (latest / top / hot / closed) + topic list + sidebar
// (subcategories, moderators, tags, related categories)

type Filter = 'latest' | 'top' | 'hot' | 'closed';

export default function CategoryPage({
  params,
  searchParams
}: {
  params: { slug: string };
  searchParams?: { filter?: string };
}) {
  const category = CATEGORIES.find((c) => c.slug === params.slug);
  if (!category) return notFound();

  const filter: Filter =
    searchParams?.filter === 'top' || searchParams?.filter === 'hot' || searchParams?.filter === 'closed'
      ? searchParams?.filter
      : 'latest';

  const usersMap = Object.fromEntries(USERS.map((u) => [u.id, u])) as Record<string, ForumUser>;
  const categoryMap = Object.fromEntries(CATEGORIES.map((c) => [c.id, c])) as Record<string, ForumCategory>;

  const categoryTopics = TOPICS.filter((t) => t.categoryId === category.id);

  // Sort / filter the topic list based on the URL filter
  const visibleTopics: ForumTopic[] = applyFilter(categoryTopics, filter);

  // Sidebar data
  const moderators = pickModerators(category, USERS);
  const topTagsInCat = aggregateTags(categoryTopics).slice(0, 12);
  const relatedCats = CATEGORIES.filter((c) => c.id !== category.id).slice(0, 5);
  const subcategories = CATEGORIES.filter((c) => c.id !== category.id).slice(0, 3); // mock subcategories for parent-style categories

  return (
    <div className="space-y-5">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-xs text-text-tertiary font-mono uppercase tracking-[0.16em]">
        <Link href="/forum" className="hover:text-white flex items-center gap-1">
          <ArrowLeft className="w-3 h-3" />论坛
        </Link>
        <span>›</span>
        <span className="text-white">{category.name}</span>
      </div>

      {/* Hero banner */}
      <section
        className="panel-strong panel-shine overflow-hidden relative"
        style={{
          background: `linear-gradient(135deg, ${category.color}26 0%, transparent 60%)`,
          borderColor: `${category.color}50`
        }}
      >
        <div className="absolute -top-24 -right-24 w-72 h-72 rounded-full opacity-30 blur-3xl pointer-events-none"
             style={{ background: category.color }} />
        <div className="relative flex flex-col md:flex-row md:items-start gap-4 p-5 lg:p-6">
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl flex-shrink-0 shadow-glow-sm"
            style={{
              background: `linear-gradient(135deg, ${category.color}40, ${category.color}10)`,
              border: `1px solid ${category.color}60`
            }}
          >
            {category.iconEmoji}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 mb-2">
              <span className="chip" style={{ borderColor: `${category.color}40`, color: category.color }}>
                Category · {category.topicsCount} 主题
              </span>
              <span className="badge badge-info">Discourse 风格</span>
            </div>
            <h1 className="text-2xl lg:text-3xl font-bold text-white">{category.name}</h1>
            <p className="text-sm text-text-secondary mt-2 max-w-3xl leading-relaxed">
              {category.description}
            </p>
            <div className="flex flex-wrap gap-x-4 gap-y-1 mt-3 text-[11px] text-text-tertiary font-mono">
              <span className="flex items-center gap-1">
                <MessageCircle className="w-3 h-3" />
                {category.postsCount.toLocaleString()} 帖
              </span>
              <span>·</span>
              <span className="flex items-center gap-1">
                <Clock4 className="w-3 h-3" />
                最近活动 {new Date(category.latestActivity).toLocaleString('zh-CN', { hour12: false })}
              </span>
              <span>·</span>
              <span className="flex items-center gap-1">
                <Users className="w-3 h-3" />
                {moderators.length} 位版主
              </span>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-2 flex-shrink-0">
            <Link href={`/forum/new?category=${category.id}`} className="btn-primary text-sm whitespace-nowrap">
              + 发新话题
            </Link>
            <button className="btn-secondary text-sm whitespace-nowrap" type="button">
              订阅分类
            </button>
          </div>
        </div>
      </section>

      {/* Subcategories (Discourse parent-style) */}
      {subcategories.length > 0 && (
        <section>
          <h2 className="text-xs font-mono tracking-[0.18em] uppercase text-text-tertiary mb-2.5 px-1">
            子分区
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {subcategories.map((sub) => (
              <Link
                key={sub.id}
                href={`/forum/c/${sub.slug}`}
                className="panel p-4 hover:border-compute-500/40 transition group"
              >
                <div className="flex items-start gap-3 min-w-0">
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center text-xl flex-shrink-0"
                    style={{
                      background: `linear-gradient(135deg, ${sub.color}30, ${sub.color}10)`,
                      border: `1px solid ${sub.color}50`
                    }}
                    aria-hidden
                  >
                    {sub.iconEmoji}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <h3 className="text-sm font-semibold text-white truncate group-hover:text-bio-300 transition">
                        {sub.name}
                      </h3>
                      <span className="text-[10px] font-mono text-text-tertiary whitespace-nowrap">
                        {sub.topicsCount} 主题
                      </span>
                    </div>
                    <p className="text-xs text-text-secondary mt-1 line-clamp-2 leading-relaxed">
                      {sub.description}
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Main grid: filter + list + sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 space-y-4">
          {/* Filter tabs (Discourse style) */}
          <div className="panel p-1 flex flex-wrap gap-1" role="tablist">
            <FilterTab href={`/forum/c/${category.slug}`} active={filter === 'latest'} icon={Clock4} label="最新" />
            <FilterTab href={`/forum/c/${category.slug}?filter=top`} active={filter === 'top'} icon={CheckCircle2} label="主题" />
            <FilterTab href={`/forum/c/${category.slug}?filter=hot`} active={filter === 'hot'} icon={Flame} label="热门" />
            <FilterTab href={`/forum/c/${category.slug}?filter=closed`} active={filter === 'closed'} icon={MessageSquareOff} label="已关闭" />
            <div className="ml-auto flex items-center gap-2 pr-2 text-[11px] text-text-tertiary font-mono">
              <span>共 {visibleTopics.length} 个话题</span>
            </div>
          </div>

          {/* Topic list */}
          {visibleTopics.length === 0 ? (
            <div className="panel p-10 text-center text-text-tertiary">
              {filter === 'closed' ? (
                <>该分类下没有已关闭的话题</>
              ) : (
                <>该筛选下还没有话题 · <Link href={`/forum/new`} className="text-bio-300 hover:underline">发第一个</Link></>
              )}
            </div>
          ) : (
            <TopicList topics={visibleTopics} users={usersMap} categoryMap={categoryMap} />
          )}
        </div>

        {/* Sidebar */}
        <aside className="space-y-4">
          {/* Moderators */}
          <section className="panel p-4">
            <h3 className="text-xs font-mono tracking-[0.18em] uppercase text-text-tertiary mb-3 flex items-center gap-2">
              <Users className="w-3 h-3" />
              版主 · {moderators.length}
            </h3>
            <div className="space-y-2">
              {moderators.map((m) => (
                <Link
                  key={m.id}
                  href={`/forum/users/${encodeURIComponent(m.id)}`}
                  className="flex items-center gap-2.5 group min-w-0"
                >
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-semibold flex-shrink-0"
                    style={{ background: m.avatarColor }}
                  >
                    {m.displayName.charAt(0)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-xs text-white truncate group-hover:text-bio-200">
                      {m.displayName}
                    </div>
                    <div className="text-[10px] text-text-tertiary truncate">
                      {m.title}
                    </div>
                  </div>
                  <span className="text-[10px] font-mono text-text-tertiary">L{m.trustLevel}</span>
                </Link>
              ))}
            </div>
          </section>

          {/* Tags in this category */}
          {topTagsInCat.length > 0 && (
            <section className="panel p-4">
              <h3 className="text-xs font-mono tracking-[0.18em] uppercase text-text-tertiary mb-3 flex items-center gap-2">
                <Hash className="w-3 h-3" />
                本分类标签
              </h3>
              <div className="flex flex-wrap gap-1.5">
                {topTagsInCat.map((t) => (
                  <Link
                    key={t.name}
                    href={`/forum/tags/${encodeURIComponent(t.name)}`}
                    className="badge badge-neutral text-[10px] hover:bg-ink-800 transition"
                  >
                    {t.name} <span className="ml-1 opacity-60">{t.count}</span>
                  </Link>
                ))}
              </div>
            </section>
          )}

          {/* Related categories */}
          <section className="panel p-4">
            <h3 className="text-xs font-mono tracking-[0.18em] uppercase text-text-tertiary mb-3">
              相关分类
            </h3>
            <div className="space-y-2">
              {relatedCats.map((rc) => (
                <Link
                  key={rc.id}
                  href={`/forum/c/${rc.slug}`}
                  className="flex items-center gap-2 p-2 rounded-lg hover:bg-ink-800/70 transition group min-w-0"
                >
                  <span
                    className="w-7 h-7 rounded-md flex items-center justify-center text-base flex-shrink-0"
                    style={{
                      background: `${rc.color}20`,
                      border: `1px solid ${rc.color}40`
                    }}
                  >
                    {rc.iconEmoji}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="text-xs text-white truncate group-hover:text-bio-200">
                      {rc.name}
                    </div>
                    <div className="text-[10px] text-text-tertiary font-mono">
                      {rc.topicsCount} 主题
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        </aside>
      </div>
    </div>
  );
}

function FilterTab({
  href,
  active,
  icon: Icon,
  label
}: {
  href: string;
  active: boolean;
  icon: any;
  label: string;
}) {
  return (
    <Link
      href={href}
      role="tab"
      aria-selected={active}
      className={`flex items-center gap-1.5 px-3 py-2 rounded-md text-xs font-medium transition ${
        active
          ? 'bg-gradient-to-r from-compute-700/40 to-bio-700/30 text-white shadow-glow-sm'
          : 'text-text-secondary hover:text-white hover:bg-ink-800/70'
      }`}
    >
      <Icon className="w-3.5 h-3.5" />
      {label}
    </Link>
  );
}

function applyFilter(topics: ForumTopic[], filter: Filter): ForumTopic[] {
  const arr = [...topics];
  if (filter === 'top') {
    return arr
      .filter((t) => t.pinned)
      .sort((a, b) => b.likesCount - a.likesCount);
  }
  if (filter === 'hot') {
    return arr
      .sort((a, b) => (b.repliesCount + b.viewsCount * 0.05) - (a.repliesCount + a.viewsCount * 0.05))
      .slice(0, 20);
  }
  if (filter === 'closed') {
    return arr.filter((t) => t.closed);
  }
  // 'latest'
  return arr.sort((a, b) => b.lastActivityAt.localeCompare(a.lastActivityAt));
}

function aggregateTags(topics: ForumTopic[]): { name: string; count: number }[] {
  const m = new Map<string, number>();
  for (const t of topics) for (const tag of t.tags) m.set(tag, (m.get(tag) || 0) + 1);
  return Array.from(m.entries())
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count);
}

function pickModerators(category: ForumCategory, users: ForumUser[]): ForumUser[] {
  // Deterministic: pick 3 users whose id hashes land near this category id.
  const seed = category.id.split('').reduce((acc, ch) => acc + ch.charCodeAt(0), 0);
  const shuffled = [...users].sort((a, b) => {
    const ah = (a.id.charCodeAt(2) || 0) + seed;
    const bh = (b.id.charCodeAt(2) || 0) + seed;
    return ah - bh;
  });
  // Prefer TL3+ users
  const trusted = shuffled.filter((u) => u.trustLevel >= 3);
  const pool = trusted.length >= 3 ? trusted : shuffled;
  return pool.slice(0, 3);
}
