'use client';

import Link from 'next/link';
import { ForumCategory } from '../_data/mockForum';

interface Props {
  category: ForumCategory;
  compact?: boolean;
}

export function CategoryCard({ category, compact }: Props) {
  return (
    <Link
      href={`/forum/c/${category.slug}`}
      className={`block panel hover:border-compute-500/50 transition group ${
        compact ? 'p-3' : 'p-4'
      }`}
    >
      <div className="flex items-start gap-3 min-w-0">
        <div
          className="w-10 h-10 rounded-lg flex items-center justify-center text-xl flex-shrink-0"
          style={{
            background: `linear-gradient(135deg, ${category.color}30, ${category.color}10)`,
            border: `1px solid ${category.color}50`
          }}
          aria-hidden
        >
          {category.iconEmoji}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-2">
            <h3 className="text-sm font-semibold text-white truncate group-hover:text-bio-300 transition">
              {category.name}
            </h3>
            <span
              className="text-[10px] font-mono px-1.5 py-0.5 rounded whitespace-nowrap"
              style={{
                background: `${category.color}15`,
                color: category.color,
                border: `1px solid ${category.color}30`
              }}
            >
              {category.topicsCount} 主题
            </span>
          </div>
          {!compact && (
            <p className="text-xs text-text-secondary mt-1 line-clamp-2 leading-relaxed">
              {category.description}
            </p>
          )}
          <div className="text-[10px] text-text-tertiary font-mono mt-1.5 truncate">
            {category.postsCount} 帖 · 最近活动 {new Date(category.latestActivity).toLocaleString('zh-CN', { hour12: false })}
          </div>
        </div>
      </div>
    </Link>
  );
}
