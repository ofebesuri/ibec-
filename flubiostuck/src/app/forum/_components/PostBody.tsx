'use client';

import { Heart, MessageCircle, Eye } from 'lucide-react';
import { ForumTopic, ForumReply, ForumUser } from '../_data/mockForum';

interface Props {
  topic: ForumTopic;
  replies: ForumReply[];
  users: Record<string, ForumUser>;
}

function formatMarkdown(md: string): JSX.Element[] {
  // Very lightweight markdown renderer (handles headings, lists, bold, code, blockquote)
  const lines = md.split('\n');
  const out: JSX.Element[] = [];
  let listBuffer: string[] = [];
  let inCode = false;
  let codeBuffer: string[] = [];

  const flushList = () => {
    if (listBuffer.length === 0) return;
    out.push(
      <ul key={`ul-${out.length}`} className="list-disc list-inside space-y-1 text-sm text-text-secondary my-2">
        {listBuffer.map((item, i) => (
          <li key={i} dangerouslySetInnerHTML={{ __html: inlineMd(item) }} />
        ))}
      </ul>
    );
    listBuffer = [];
  };

  lines.forEach((line, idx) => {
    if (line.startsWith('```')) {
      if (inCode) {
        out.push(
          <pre key={`code-${idx}`} className="code-block my-2 text-xs">
            <code>{codeBuffer.join('\n')}</code>
          </pre>
        );
        codeBuffer = [];
        inCode = false;
      } else {
        flushList();
        inCode = true;
      }
      return;
    }
    if (inCode) {
      codeBuffer.push(line);
      return;
    }
    if (line.startsWith('## ')) {
      flushList();
      out.push(<h3 key={idx} className="text-base font-semibold text-white mt-3 mb-1">{line.slice(3)}</h3>);
    } else if (line.startsWith('- ')) {
      listBuffer.push(line.slice(2));
    } else if (line.startsWith('> ')) {
      flushList();
      out.push(
        <blockquote key={idx} className="border-l-2 border-compute-500 pl-3 my-2 text-sm text-text-secondary italic">
          {line.slice(2)}
        </blockquote>
      );
    } else if (line.trim() === '') {
      flushList();
    } else {
      flushList();
      out.push(<p key={idx} className="text-sm text-text-secondary leading-relaxed my-1" dangerouslySetInnerHTML={{ __html: inlineMd(line) }} />);
    }
  });
  flushList();
  return out;
}

function inlineMd(s: string): string {
  return s
    .replace(/\*\*(.+?)\*\*/g, '<strong class="text-white font-semibold">$1</strong>')
    .replace(/_(.+?)_/g, '<em>$1</em>')
    .replace(/`(.+?)`/g, '<code class="px-1 py-0.5 rounded bg-ink-800 text-bio-300 text-xs">$1</code>');
}

export function PostBody({ topic, replies, users }: Props) {
  const author = users[topic.authorId];

  return (
    <div className="space-y-3">
      {/* Original post */}
      <article className="panel p-4">
        <header className="flex items-start gap-3 mb-3 pb-3 border-b border-white/5">
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center text-white text-base font-semibold flex-shrink-0"
            style={{ background: author?.avatarColor }}
          >
            {author?.displayName.charAt(0)}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm font-semibold text-white">{author?.displayName}</span>
              <span className="text-[10px] font-mono text-text-tertiary px-1.5 py-0.5 rounded bg-ink-800/70 border border-white/5">
                L{author?.trustLevel}
              </span>
              <span className="text-[10px] text-text-tertiary">
                {author?.title}
              </span>
            </div>
            <div className="text-[11px] text-text-tertiary mt-0.5 font-mono">
              {new Date(topic.createdAt).toLocaleString('zh-CN', { hour12: false })}
            </div>
          </div>
          <div className="flex items-center gap-2 text-[11px] text-text-tertiary">
            <span className="flex items-center gap-0.5"><Heart className="w-3 h-3" />{topic.likesCount}</span>
          </div>
        </header>

        <div className="prose prose-invert max-w-none">
          {formatMarkdown(topic.bodyMarkdown)}
        </div>

        {topic.tags.length > 0 && (
          <footer className="mt-4 pt-3 border-t border-white/5 flex gap-1.5 flex-wrap">
            {topic.tags.map((t) => (
              <span key={t} className="badge badge-neutral text-[10px]">{t}</span>
            ))}
          </footer>
        )}
      </article>

      {/* Replies */}
      {replies.length > 0 && (
        <div className="space-y-2">
          <div className="text-xs font-mono tracking-[0.18em] uppercase text-text-tertiary px-2">
            {replies.length} 条回复
          </div>
          {replies.map((r) => {
            const u = users[r.authorId];
            return (
              <article key={r.id} className="panel p-4">
                <header className="flex items-start gap-3 mb-2">
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-semibold flex-shrink-0"
                    style={{ background: u?.avatarColor }}
                  >
                    {u?.displayName.charAt(0)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-semibold text-white">{u?.displayName}</span>
                      <span className="text-[10px] font-mono text-text-tertiary">L{u?.trustLevel}</span>
                      <span className="text-[10px] text-text-tertiary font-mono">
                        {new Date(r.createdAt).toLocaleString('zh-CN', { hour12: false })}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 text-[11px] text-text-tertiary">
                    <Heart className="w-3 h-3" />
                    <span className="font-mono">{r.likesCount}</span>
                  </div>
                </header>
                <div>{formatMarkdown(r.bodyMarkdown)}</div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
