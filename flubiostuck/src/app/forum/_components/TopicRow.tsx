'use client';

import Link from 'next/link';
import { Pin, Lock, CheckCircle2, MessageCircle, Eye, Heart } from 'lucide-react';
import { ForumTopic, ForumUser, ForumCategory } from '../_data/mockForum';

interface Props {
  topic: ForumTopic;
  author: ForumUser;
  category: ForumCategory;
  lastReplier?: ForumUser;
  variant?: 'default' | 'compact';
}

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return '刚刚';
  if (mins < 60) return `${mins} 分钟前`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} 小时前`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days} 天前`;
  return new Date(iso).toLocaleDateString('zh-CN');
}

export function TopicRow({ topic, author, category, lastReplier, variant = 'default' }: Props) {
  return (
    <div className="flex items-start gap-3 p-3 panel hover:border-compute-500/40 transition group min-w-0">
      {/* Avatar */}
      <Link
        href={`/forum/users/${encodeURIComponent(author.id)}`}
        className="w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-semibold flex-shrink-0 hover:ring-2 hover:ring-compute-500/40 transition"
        style={{ background: author.avatarColor }}
        title={author.displayName}
      >
        {author.displayName.charAt(0)}
      </Link>

      {/* Main content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5 flex-wrap min-w-0">
          {topic.pinned && <Pin className="w-3.5 h-3.5 text-compute-300 flex-shrink-0" />}
          {topic.closed && <Lock className="w-3.5 h-3.5 text-text-tertiary flex-shrink-0" />}
          {topic.solved && <CheckCircle2 className="w-3.5 h-3.5 text-glow-400 flex-shrink-0" />}
          <Link
            href={`/forum/c/${category.slug}`}
            className="text-[10px] font-mono px-1.5 py-0.5 rounded whitespace-nowrap hover:opacity-80 transition"
            style={{ background: `${category.color}20`, color: category.color }}
          >
            {category.iconEmoji} {category.name}
          </Link>
          <Link
            href={`/forum/t/${topic.id}`}
            className="text-sm font-medium text-white group-hover:text-bio-300 transition truncate min-w-0 hover:text-bio-300"
          >
            {topic.title}
          </Link>
        </div>

        {variant === 'default' && (
          <div className="flex items-center gap-3 mt-1.5 text-[11px] text-text-tertiary flex-wrap min-w-0">
            <Link
              href={`/forum/users/${encodeURIComponent(author.id)}`}
              className="truncate hover:text-bio-200 transition"
            >
              <span className="text-text-secondary">{author.displayName}</span>
              <span className="ml-1.5 font-mono">L{author.trustLevel}</span>
            </Link>
            <span>·</span>
            <span>{timeAgo(topic.createdAt)}</span>
            {topic.tags.length > 0 && (
              <>
                <span>·</span>
                <span className="flex gap-1 flex-wrap truncate">
                  {topic.tags.slice(0, 3).map((t) => (
                    <Link
                      key={t}
                      href={`/forum/tags/${encodeURIComponent(t)}`}
                      className="badge badge-neutral text-[9px] px-1.5 py-0 hover:bg-ink-800 transition"
                    >
                      {t}
                    </Link>
                  ))}
                </span>
              </>
            )}
          </div>
        )}
      </div>

      {/* Metrics */}
      <div className="flex flex-col items-end gap-0.5 text-[11px] text-text-tertiary flex-shrink-0 whitespace-nowrap">
        <div className="flex items-center gap-1">
          <MessageCircle className="w-3 h-3" />
          <span className="font-mono">{topic.repliesCount}</span>
        </div>
        <div className="flex items-center gap-1">
          <Eye className="w-3 h-3" />
          <span className="font-mono">{topic.viewsCount}</span>
        </div>
        {variant === 'default' && lastReplier && (
          <div className="flex items-center gap-1 mt-1">
            <Link
              href={`/forum/users/${encodeURIComponent(lastReplier.id)}`}
              className="w-4 h-4 rounded-full text-[9px] flex items-center justify-center text-white font-semibold hover:ring-2 hover:ring-compute-500/40 transition"
              style={{ background: lastReplier.avatarColor }}
              title={lastReplier.displayName}
            >
              {lastReplier.displayName.charAt(0)}
            </Link>
            <span className="text-[10px] truncate max-w-[80px]">{timeAgo(topic.lastActivityAt)}</span>
          </div>
        )}
      </div>
    </div>
  );
}
