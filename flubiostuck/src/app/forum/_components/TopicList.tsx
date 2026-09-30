'use client';

import { ForumTopic, ForumUser, ForumCategory } from '../_data/mockForum';
import { TopicRow } from './TopicRow';

interface Props {
  topics: ForumTopic[];
  users: Record<string, ForumUser>;
  categoryMap: Record<string, ForumCategory>;
  emptyHint?: string;
}

export function TopicList({ topics, users, categoryMap, emptyHint }: Props) {
  if (topics.length === 0) {
    return (
      <div className="panel p-10 text-center text-text-tertiary">
        {emptyHint || '暂无话题'}
      </div>
    );
  }
  return (
    <div className="space-y-2">
      {topics.map((t) => {
        const author = users[t.authorId];
        const lastReplier = t.lastReplyUserId ? users[t.lastReplyUserId] : undefined;
        const cat = categoryMap[t.categoryId];
        if (!author || !cat) return null;
        return <TopicRow key={t.id} topic={t} author={author} category={cat} lastReplier={lastReplier} />;
      })}
    </div>
  );
}
