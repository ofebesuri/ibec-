import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, MessageCircle, Eye, Heart, Pin, Award } from 'lucide-react';
import {
  USERS,
  TOPICS,
  REPLIES,
  CATEGORIES,
  ForumUser,
  ForumCategory
} from '../../_data/mockForum';
import { TopicList } from '../../_components/TopicList';

// Discourse-style user profile (v2026.09.20-Final)
// Header card (avatar, trust, title, stats) + tabs (活动 / 主题 / 回复)

type Tab = 'activity' | 'topics' | 'replies';

export default function UserProfilePage({
  params,
  searchParams
}: {
  params: { id: string };
  searchParams?: { tab?: string };
}) {
  const user = USERS.find((u) => u.id === decodeURIComponent(params.id));
  if (!user) return notFound();

  const tab: Tab = searchParams?.tab === 'topics' || searchParams?.tab === 'replies' ? searchParams.tab : 'activity';

  const usersMap = Object.fromEntries(USERS.map((u) => [u.id, u])) as Record<string, ForumUser>;
  const categoryMap = Object.fromEntries(CATEGORIES.map((c) => [c.id, c])) as Record<string, ForumCategory>;

  const userTopics = TOPICS.filter((t) => t.authorId === user.id);
  const userReplies = REPLIES.filter((r) => r.authorId === user.id);
  const recentActivity = [
    ...userTopics.map((t) => ({ kind: 'topic' as const, at: t.lastActivityAt, t })),
    ...userReplies.map((r) => {
      const topic = TOPICS.find((t) => t.id === r.topicId);
      return topic ? { kind: 'reply' as const, at: r.createdAt, t: topic } : null;
    })
  ]
    .filter(Boolean)
    .sort((a, b) => b!.at.localeCompare(a!.at))
    .slice(0, 15);

  const trustLabels = ['新成员', '基础', '成员', '常规', '核心'];
  const trustColors = ['#9CA3AF', '#16BFDB', '#16D88A', '#935AFF', '#FF9A1F'];

  return (
    <div className="space-y-5">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-xs text-text-tertiary font-mono uppercase tracking-[0.16em]">
        <Link href="/forum" className="hover:text-white flex items-center gap-1">
          <ArrowLeft className="w-3 h-3" />论坛
        </Link>
        <span>›</span>
        <Link href="/forum/users" className="hover:text-white">用户</Link>
        <span>›</span>
        <span className="text-white truncate">{user.displayName}</span>
      </div>

      {/* Profile header */}
      <section className="panel-strong panel-shine overflow-hidden relative">
        <div
          className="absolute -top-24 -right-24 w-72 h-72 rounded-full opacity-20 blur-3xl pointer-events-none"
          style={{ background: user.avatarColor }}
        />
        <div className="relative p-5 lg:p-6 flex flex-col md:flex-row md:items-start gap-5">
          <div className="relative flex-shrink-0">
            <div
              className="w-24 h-24 rounded-2xl flex items-center justify-center text-white text-4xl font-bold shadow-glow-md"
              style={{ background: user.avatarColor }}
            >
              {user.displayName.charAt(0)}
            </div>
            {user.online && (
              <span
                className="absolute -bottom-1 -right-1 w-5 h-5 bg-glow-400 rounded-full border-4 border-ink-900"
                title="在线"
              />
            )}
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 mb-1.5 flex-wrap">
              <h1 className="text-2xl font-bold text-white">{user.displayName}</h1>
              <span
                className="badge text-[10px]"
                style={{
                  background: `${trustColors[user.trustLevel]}20`,
                  color: trustColors[user.trustLevel],
                  border: `1px solid ${trustColors[user.trustLevel]}40`
                }}
              >
                <Award className="w-3 h-3" />
                TL{user.trustLevel} · {trustLabels[user.trustLevel]}
              </span>
              {user.online && (
                <span className="badge badge-success text-[10px]">在线</span>
              )}
            </div>
            <div className="text-sm text-text-secondary">{user.title}</div>
            <div className="text-xs text-text-tertiary font-mono mt-1">
              @{user.username} · 加入 {user.joinedAt}
            </div>

            {/* Stats grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-4">
              <StatBox label="发帖" value={user.postsCount.toLocaleString()} />
              <StatBox label="主题" value={userTopics.length.toString()} />
              <StatBox label="回复" value={userReplies.length.toString()} />
              <StatBox
                label="感谢"
                value={userReplies.reduce((acc, r) => acc + r.likesCount, 0).toLocaleString()}
                accent
              />
            </div>
          </div>

          <div className="flex flex-col gap-2 flex-shrink-0 md:items-end">
            <button type="button" className="btn-primary text-sm whitespace-nowrap">
              关注
            </button>
            <button type="button" className="btn-secondary text-sm whitespace-nowrap">
              私信
            </button>
          </div>
        </div>
      </section>

      {/* Tabs */}
      <div className="panel p-1 flex flex-wrap gap-1" role="tablist">
        <TabLink href={`/forum/users/${encodeURIComponent(user.id)}`} active={tab === 'activity'} label="活动" />
        <TabLink href={`/forum/users/${encodeURIComponent(user.id)}?tab=topics`} active={tab === 'topics'} label={`主题 · ${userTopics.length}`} />
        <TabLink href={`/forum/users/${encodeURIComponent(user.id)}?tab=replies`} active={tab === 'replies'} label={`回复 · ${userReplies.length}`} />
      </div>

      {/* Tab content */}
      {tab === 'topics' && (
        <section>
          {userTopics.length === 0 ? (
            <div className="panel p-10 text-center text-text-tertiary">该用户还没有发表主题</div>
          ) : (
            <TopicList topics={userTopics} users={usersMap} categoryMap={categoryMap} />
          )}
        </section>
      )}

      {tab === 'replies' && (
        <section className="space-y-2">
          {userReplies.length === 0 ? (
            <div className="panel p-10 text-center text-text-tertiary">该用户还没有发表回复</div>
          ) : (
            userReplies.map((r) => {
              const topic = TOPICS.find((t) => t.id === r.topicId);
              if (!topic) return null;
              return (
                <Link
                  key={r.id}
                  href={`/forum/t/${topic.id}`}
                  className="block panel p-4 hover:border-compute-500/40 transition group"
                >
                  <div className="flex items-center gap-2 text-[11px] text-text-tertiary font-mono mb-2">
                    <span className="text-text-secondary">回复了</span>
                    <span className="text-white group-hover:text-bio-200 truncate">{topic.title}</span>
                  </div>
                  <pre className="whitespace-pre-wrap text-xs text-text-secondary font-sans leading-relaxed line-clamp-3">
                    {r.bodyMarkdown}
                  </pre>
                  <div className="flex items-center gap-3 mt-2 text-[10px] text-text-tertiary font-mono">
                    <span>{new Date(r.createdAt).toLocaleString('zh-CN', { hour12: false })}</span>
                    <span>·</span>
                    <span className="flex items-center gap-0.5">
                      <Heart className="w-3 h-3" /> {r.likesCount}
                    </span>
                  </div>
                </Link>
              );
            })
          )}
        </section>
      )}

      {tab === 'activity' && (
        <section className="space-y-3">
          <div className="text-xs font-mono tracking-[0.18em] uppercase text-text-tertiary px-1">
            最近动态 · {recentActivity.length} 条
          </div>
          {recentActivity.length === 0 ? (
            <div className="panel p-10 text-center text-text-tertiary">暂无活动</div>
          ) : (
            <div className="panel divide-y divide-white/5">
              {recentActivity.map((entry, idx) => {
                if (!entry) return null;
                const t = entry.t;
                const cat = categoryMap[t.categoryId];
                return (
                  <Link
                    key={`${entry.kind}-${entry.at}-${idx}`}
                    href={`/forum/t/${t.id}`}
                    className="flex items-start gap-3 p-3 hover:bg-ink-800/40 transition group min-w-0"
                  >
                    <div
                      className="w-7 h-7 rounded-md flex items-center justify-center text-base flex-shrink-0"
                      style={{
                        background: cat ? `${cat.color}20` : 'rgba(255,255,255,0.05)',
                        border: cat ? `1px solid ${cat.color}40` : '1px solid rgba(255,255,255,0.05)'
                      }}
                      aria-hidden
                    >
                      {entry.kind === 'topic' ? <Pin className="w-3.5 h-3.5 text-compute-300" /> : <MessageCircle className="w-3.5 h-3.5 text-bio-300" />}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-sm text-white truncate group-hover:text-bio-200">{t.title}</div>
                      <div className="text-[11px] text-text-tertiary font-mono mt-0.5 flex items-center gap-2 flex-wrap">
                        <span className="badge badge-neutral text-[9px]">{cat?.iconEmoji} {cat?.name}</span>
                        <span>·</span>
                        <span>{new Date(entry.at).toLocaleString('zh-CN', { hour12: false })}</span>
                        <span>·</span>
                        <span className="flex items-center gap-0.5">
                          <MessageCircle className="w-3 h-3" /> {t.repliesCount}
                        </span>
                        <span className="flex items-center gap-0.5">
                          <Eye className="w-3 h-3" /> {t.viewsCount}
                        </span>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </section>
      )}
    </div>
  );
}

function StatBox({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className="panel px-3 py-2">
      <div className="text-[10px] font-mono tracking-[0.18em] uppercase text-text-tertiary">{label}</div>
      <div className={`text-base font-semibold font-mono ${accent ? 'text-glow-400' : 'text-white'}`}>
        {value}
      </div>
    </div>
  );
}

function TabLink({ href, active, label }: { href: string; active: boolean; label: string }) {
  return (
    <Link
      href={href}
      role="tab"
      aria-selected={active}
      className={`px-3 py-2 rounded-md text-xs font-medium transition ${
        active
          ? 'bg-gradient-to-r from-compute-700/40 to-bio-700/30 text-white shadow-glow-sm'
          : 'text-text-secondary hover:text-white hover:bg-ink-800/70'
      }`}
    >
      {label}
    </Link>
  );
}
