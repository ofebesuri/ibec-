import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Eye, MessageCircle, Heart, Clock } from 'lucide-react';
import {
  CATEGORIES,
  TOPICS,
  REPLIES,
  USERS,
  ForumUser,
  ForumCategory
} from '../../_data/mockForum';
import { PostBody } from '../../_components/PostBody';

export default function TopicPage({ params }: { params: { id: string } }) {
  const topic = TOPICS.find((t) => t.id === params.id);
  if (!topic) return notFound();

  const usersMap = Object.fromEntries(USERS.map((u) => [u.id, u])) as Record<string, ForumUser>;
  const category = CATEGORIES.find((c) => c.id === topic.categoryId);
  const topicReplies = REPLIES.filter((r) => r.topicId === topic.id);

  return (
    <div className="space-y-5">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-xs text-text-tertiary font-mono uppercase tracking-[0.16em]">
        <Link href="/forum" className="hover:text-white flex items-center gap-1">
          <ArrowLeft className="w-3 h-3" />论坛
        </Link>
        <span>›</span>
        {category && (
          <>
            <Link href={`/forum/c/${category.slug}`} className="hover:text-white">{category.name}</Link>
            <span>›</span>
          </>
        )}
        <span className="text-white truncate max-w-[60vw]">{topic.title}</span>
      </div>

      {/* Title bar */}
      <section className="panel-strong p-5">
        <h1 className="text-xl lg:text-2xl font-bold text-white">{topic.title}</h1>
        <div className="flex flex-wrap gap-3 mt-3 text-[11px] text-text-tertiary">
          <span className="flex items-center gap-1">
            <MessageCircle className="w-3 h-3" />
            <span className="font-mono">{topic.repliesCount}</span> 帖
          </span>
          <span className="flex items-center gap-1">
            <Eye className="w-3 h-3" />
            <span className="font-mono">{topic.viewsCount}</span> 浏览
          </span>
          <span className="flex items-center gap-1">
            <Heart className="w-3 h-3" />
            <span className="font-mono">{topic.likesCount}</span> 喜欢
          </span>
          <span className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            <span className="font-mono">{new Date(topic.createdAt).toLocaleString('zh-CN', { hour12: false })}</span>
          </span>
          {topic.solved && <span className="badge badge-success">已解决</span>}
          {topic.closed && <span className="badge badge-warning">已关闭</span>}
          {topic.pinned && <span className="badge badge-info">置顶</span>}
        </div>
      </section>

      {/* Post body */}
      <PostBody topic={topic} replies={topicReplies} users={usersMap} />

      {/* Reply box (UI only, mock) */}
      <section className="panel p-4">
        <div className="text-xs font-mono tracking-[0.18em] uppercase text-text-tertiary mb-2">
          添加回复
        </div>
        <textarea
          placeholder="支持 Markdown 语法..."
          className="w-full bg-ink-800/40 border border-white/10 rounded-lg p-3 text-sm placeholder:text-text-tertiary focus:outline-none focus:border-compute-500/50 resize-y min-h-[100px]"
          rows={4}
          disabled
        />
        <div className="flex justify-end mt-2">
          <button className="btn-primary text-xs" disabled>
            提交回复（演示模式）
          </button>
        </div>
      </section>
    </div>
  );
}
