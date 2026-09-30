'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Home, Search, Database } from 'lucide-react';
import { useUiStore } from '@/lib/store/uiStore';

export default function NotFound() {
  return (
    <div className="px-4 lg:px-8 py-6 lg:py-8 min-h-[60vh] flex flex-col">
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center px-6 max-w-xl">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mb-4"
          >
            <div className="text-[10px] font-mono tracking-[0.32em] uppercase text-text-tertiary">
              404 · NOT FOUND
            </div>
            <h1 className="mt-2 text-6xl md:text-7xl font-bold gradient-text glow-text">页面不存在</h1>
          </motion.div>

          <p className="text-text-secondary mb-6 text-sm leading-relaxed">
            您访问的元件、任务或页面可能已被移除，或链接已过期。可回到首页、元件数据库，
            或使用命令面板（⌘K）搜索元件 ID / 流感亚型。
          </p>

          <div className="flex items-center justify-center gap-3 flex-wrap">
            <Link href="/" className="btn-primary btn-shine">
              <Home className="w-4 h-4" />
              返回首页
            </Link>
            <Link href="/database" className="btn-secondary">
              <Database className="w-4 h-4" />
              浏览数据库
            </Link>
            <button
              type="button"
              className="btn-ghost"
              onClick={() => {
                // v2026.09.20-Final: 通过 zustand store 触发命令面板（AppShell 已订阅 commandOpen）
                useUiStore.getState().setCommandOpen(true);
              }}
            >
              <Search className="w-4 h-4" />
              命令面板
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
