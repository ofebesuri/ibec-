'use client';

import { ForumUser } from '../_data/mockForum';

interface Props {
  user: ForumUser;
  showTitle?: boolean;
}

export function OnlineUsers({ users }: { users: ForumUser[] }) {
  return (
    <div className="panel p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-xs font-mono tracking-[0.18em] uppercase text-text-tertiary">
          在线用户
        </h3>
        <span className="text-[10px] font-mono text-glow-400">{users.length} 人</span>
      </div>
      <div className="space-y-2">
        {users.map((u) => <OnlineUserRow key={u.id} user={u} />)}
      </div>
    </div>
  );
}

function OnlineUserRow({ user, showTitle = true }: Props) {
  return (
    <div className="flex items-center gap-2.5 min-w-0">
      <div className="relative flex-shrink-0">
        <div
          className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-semibold"
          style={{ background: user.avatarColor }}
        >
          {user.displayName.charAt(0)}
        </div>
        <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-glow-400 rounded-full border border-ink-900" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5">
          <span className="text-xs text-white truncate">{user.displayName}</span>
          <span className="text-[10px] font-mono text-text-tertiary">L{user.trustLevel}</span>
        </div>
        {showTitle && (
          <div className="text-[10px] text-text-tertiary truncate">{user.title}</div>
        )}
      </div>
    </div>
  );
}

export { OnlineUserRow };
