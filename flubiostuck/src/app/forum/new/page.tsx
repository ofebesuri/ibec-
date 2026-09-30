import Link from 'next/link';
import { CATEGORIES } from '../_data/mockForum';

export default function NewTopicPage() {
  return (
    <div className="max-w-3xl mx-auto space-y-5">
      <div className="flex items-center gap-2 text-xs text-text-tertiary font-mono uppercase tracking-[0.16em]">
        <Link href="/forum" className="hover:text-white">论坛</Link>
        <span>›</span>
        <span className="text-white">发新话题</span>
      </div>

      <section className="panel-strong p-5">
        <h1 className="text-xl font-bold text-white">发新话题</h1>
        <p className="text-sm text-text-secondary mt-1">
          论坛当前处于<strong className="text-glow-400">演示模式</strong>，发布按钮未连接后端。
          完整功能需接入 Discourse / NodeBB 等真实论坛后端。
        </p>
      </section>

      <form className="panel p-5 space-y-4 opacity-70">
        <div>
          <label className="block text-xs font-mono tracking-[0.16em] uppercase text-text-tertiary mb-1.5">
            标题
          </label>
          <input
            type="text"
            placeholder="用一句话清晰描述你的问题或分享..."
            className="w-full bg-ink-800/40 border border-white/10 rounded-lg px-3 py-2 text-sm placeholder:text-text-tertiary focus:outline-none focus:border-compute-500/50"
          />
        </div>

        <div>
          <label className="block text-xs font-mono tracking-[0.16em] uppercase text-text-tertiary mb-1.5">
            分类
          </label>
          <select className="w-full bg-ink-800/40 border border-white/10 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-compute-500/50">
            {CATEGORIES.map((c) => (
              <option key={c.id} value={c.id}>{c.iconEmoji} {c.name}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-mono tracking-[0.16em] uppercase text-text-tertiary mb-1.5">
            正文（支持 Markdown）
          </label>
          <textarea
            placeholder="详细描述你的问题、思路、已尝试的方案..."
            className="w-full bg-ink-800/40 border border-white/10 rounded-lg p-3 text-sm placeholder:text-text-tertiary focus:outline-none focus:border-compute-500/50 resize-y min-h-[200px]"
            rows={8}
          />
        </div>

        <div>
          <label className="block text-xs font-mono tracking-[0.16em] uppercase text-text-tertiary mb-1.5">
            标签（逗号分隔）
          </label>
          <input
            type="text"
            placeholder="scfv, baseline, wetlab"
            className="w-full bg-ink-800/40 border border-white/10 rounded-lg px-3 py-2 text-sm placeholder:text-text-tertiary focus:outline-none focus:border-compute-500/50"
          />
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <Link href="/forum" className="btn-secondary text-xs">取消</Link>
          <button type="button" className="btn-primary text-xs" disabled>
            发布（演示模式）
          </button>
        </div>
      </form>
    </div>
  );
}
