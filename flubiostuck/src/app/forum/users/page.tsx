import Link from 'next/link';
import { USERS, ForumUser } from '../_data/mockForum';

export default function UsersPage() {
  const sorted = [...USERS].sort((a, b) => b.postsCount - a.postsCount);

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-2 text-xs text-text-tertiary font-mono uppercase tracking-[0.16em]">
        <Link href="/forum" className="hover:text-white">论坛</Link>
        <span>›</span>
        <span className="text-white">用户</span>
      </div>

      <section className="panel-strong p-5">
        <h1 className="text-2xl font-bold text-white">社区成员</h1>
        <p className="text-sm text-text-secondary mt-1">
          共 {USERS.length} 位成员 · 按发帖数排序 · 信任等级 0-4 (TL3+ 为核心贡献者)
        </p>
      </section>

      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {sorted.map((u) => <UserCard key={u.id} user={u} />)}
      </section>
    </div>
  );
}

function UserCard({ user }: { user: ForumUser }) {
  // v2026.09.20-Final: 用户卡片可点击（跳转到 /forum 的 mock 个人页 + 提示）
  return (
    <Link
      href={`/forum/users/${encodeURIComponent(user.id)}`}
      className="panel p-4 hover:border-compute-500/40 transition block group"
      title={`查看 ${user.displayName} 的发言`}
    >
      <div className="flex items-start gap-3 min-w-0">
        <div className="relative flex-shrink-0">
          <div
            className="w-12 h-12 rounded-full flex items-center justify-center text-white text-base font-semibold"
            style={{ background: user.avatarColor }}
          >
            {user.displayName.charAt(0)}
          </div>
          {user.online && (
            <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-glow-400 rounded-full border-2 border-ink-900" />
          )}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5 flex-wrap min-w-0">
            <span className="text-sm font-semibold text-white truncate group-hover:text-bio-200 transition">{user.displayName}</span>
            <span className="text-[10px] font-mono text-text-tertiary px-1 py-0 rounded bg-ink-800/70 border border-white/5">
              L{user.trustLevel}
            </span>
          </div>
          <div className="text-[11px] text-text-tertiary truncate mt-0.5">{user.title}</div>
          <div className="text-[10px] text-text-tertiary font-mono mt-1 flex gap-3">
            <span>@{user.username}</span>
            <span>·</span>
            <span>{user.postsCount} 帖</span>
            <span>·</span>
            <span>加入 {user.joinedAt}</span>
          </div>
        </div>
      </div>
    </Link>
  );
}
