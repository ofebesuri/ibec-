import Link from 'next/link';
import {
  CATEGORIES,
  TOPICS,
  USERS,
  ONLINE_USERS,
  TOP_TAGS,
  ForumUser,
  ForumCategory
} from './_data/mockForum';
import { CategoryCard } from './_components/CategoryCard';
import { TopicList } from './_components/TopicList';
import { OnlineUsers } from './_components/OnlineUsers';

// v2026.09.20-Final: 接收 searchParams 以读取 ?filter=search&q=
export default function ForumHome({
  searchParams
}: {
  searchParams?: { filter?: string; q?: string };
}) {
  const usersMap = Object.fromEntries(USERS.map((u) => [u.id, u])) as Record<string, ForumUser>;
  const categoryMap = Object.fromEntries(CATEGORIES.map((c) => [c.id, c])) as Record<string, ForumCategory>;

  const filter = searchParams?.filter ?? '';
  const query = (searchParams?.q ?? '').trim().toLowerCase();

  const isSearching = filter === 'search' && query.length > 0;

  // 命中搜索：在标题 + tags + excerpt 中匹配（mock 数据上的简单模糊匹配）
  const searchResults = isSearching
    ? TOPICS.filter((t) => {
        const haystack = `${t.title} ${t.tags?.join(' ') ?? ''} ${t.excerpt ?? ''}`.toLowerCase();
        return haystack.includes(query);
      })
    : [];

  const pinned = TOPICS.filter((t) => t.pinned).slice(0, 5);
  const latest = [...TOPICS].sort((a, b) => b.lastActivityAt.localeCompare(a.lastActivityAt)).slice(0, 15);
  const hot = [...TOPICS].sort((a, b) => (b.repliesCount + b.viewsCount * 0.05) - (a.repliesCount + a.viewsCount * 0.05)).slice(0, 8);

  const totalPosts = CATEGORIES.reduce((acc, c) => acc + c.postsCount, 0);
  const totalTopics = CATEGORIES.reduce((acc, c) => acc + c.topicsCount, 0);
  const totalUsers = USERS.length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <section className="panel-strong panel-shine p-5">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
          <div className="min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <span className="chip chip-shine">Community Forum · v2.0</span>
              <span className="badge badge-info">Discourse 风格</span>
            </div>
            <h1 className="text-2xl lg:text-3xl font-bold text-white">
              {isSearching ? `搜索：${searchParams?.q}` : '社区论坛'}
            </h1>
            <p className="text-text-secondary text-sm mt-1 max-w-3xl">
              {isSearching
                ? `在 ${TOPICS.length} 个话题中找到 ${searchResults.length} 个匹配 “${searchParams?.q}”`
                : '独立论坛（不再依赖主站 /community 路由） · 60+ 真实话题 · 12 分类 · 50+ 用户'}
            </p>
          </div>
          <div className="flex gap-3 flex-wrap">
            <Stat label="话题" value={totalTopics.toLocaleString()} />
            <Stat label="帖子" value={totalPosts.toLocaleString()} />
            <Stat label="用户" value={totalUsers.toString()} />
            <Stat label="在线" value={ONLINE_USERS.length.toString()} accent />
          </div>
        </div>
      </section>

      {/* 搜索结果 */}
      {isSearching && (
        <section>
          <SectionTitle
            title={`搜索结果 · “${searchParams?.q}”`}
            hint={`${searchResults.length} 条匹配`}
            action={
              <Link href="/forum" className="text-xs text-text-tertiary hover:text-bio-300">
                ← 返回全部
              </Link>
            }
          />
          {searchResults.length > 0 ? (
            <TopicList topics={searchResults} users={usersMap} categoryMap={categoryMap} />
          ) : (
            <div className="panel p-6 text-center text-text-secondary text-sm">
              没有匹配的话题 · 试试更短的关键词，或 <Link href="/forum" className="text-bio-300 hover:text-white">返回全部</Link>
            </div>
          )}
        </section>
      )}

      {/* Categories grid */}
      {!isSearching && (
        <section>
          <SectionTitle title="分类导航" hint={`${CATEGORIES.length} 个分类`} />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {CATEGORIES.map((c) => <CategoryCard key={c.id} category={c} />)}
          </div>
        </section>
      )}

      {/* Pinned + Hot side by side */}
      {!isSearching && (
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2 space-y-4">
            {pinned.length > 0 && (
              <div>
                <SectionTitle title="置顶公告" hint={`${pinned.length} 条`} />
                <TopicList topics={pinned} users={usersMap} categoryMap={categoryMap} />
              </div>
            )}

            <div>
              <SectionTitle
                title="最新话题"
                hint={`${latest.length} 条`}
                action={<Link href="/forum/hot" className="text-xs text-text-tertiary hover:text-bio-300">查看全部 →</Link>}
              />
              <TopicList topics={latest} users={usersMap} categoryMap={categoryMap} />
            </div>
          </div>

          <aside className="space-y-4">
            <div>
              <SectionTitle title="热门话题" hint={`${hot.length} 条`} />
              <TopicList topics={hot} users={usersMap} categoryMap={categoryMap} />
            </div>
            <OnlineUsers users={ONLINE_USERS.slice(0, 8)} />
            <TopTags tags={TOP_TAGS.slice(0, 12)} />
          </aside>
        </section>
      )}
    </div>
  );
}

function Stat({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className="panel px-4 py-2 min-w-[90px]">
      <div className="text-[10px] font-mono tracking-[0.2em] uppercase text-text-tertiary">{label}</div>
      <div className={`text-xl font-semibold font-mono ${accent ? 'text-glow-400' : 'text-white'}`}>
        {value}
      </div>
    </div>
  );
}

function SectionTitle({ title, hint, action }: { title: string; hint?: string; action?: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between mb-2.5 px-1">
      <h2 className="text-xs font-mono tracking-[0.18em] uppercase text-text-tertiary flex items-center gap-2">
        <span>{title}</span>
        {hint && <span className="text-text-tertiary/60">· {hint}</span>}
      </h2>
      {action}
    </div>
  );
}

function TopTags({ tags }: { tags: { name: string; count: number }[] }) {
  return (
    <div className="panel p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-xs font-mono tracking-[0.18em] uppercase text-text-tertiary">热门标签</h3>
      </div>
      <div className="flex flex-wrap gap-1.5">
        {tags.map((t) => (
          <span key={t.name} className="badge badge-neutral text-[10px]">
            {t.name} <span className="ml-1 opacity-60">{t.count}</span>
          </span>
        ))}
      </div>
    </div>
  );
}
