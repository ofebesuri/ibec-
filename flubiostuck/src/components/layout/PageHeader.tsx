'use client';

import Link from 'next/link';
import { ReactNode } from 'react';
import { ChevronRight } from 'lucide-react';

/**
 * PageHeader - 共享的页面顶部 chrome
 * 统一 60px 高度，含：面包屑 + 标题 + 描述 + actions
 *
 * 替代之前各页面内重复的 hero / KPI tiles
 */

export interface PageHeaderProps {
  /** 面包屑路径（不含最后一页） */
  breadcrumbs?: Array<{ label: string; href?: string }>;
  /** 主标题 */
  title: string;
  /** 副标题/描述 */
  description?: string;
  /** 标题旁的徽章 */
  badges?: ReactNode;
  /** 右侧 action 按钮组 */
  actions?: ReactNode;
}

export function PageHeader({
  breadcrumbs,
  title,
  description,
  badges,
  actions
}: PageHeaderProps) {
  return (
    <div className="page-header">
      <div className="page-header__main">
        <div className="page-header__title-row">
          {breadcrumbs && breadcrumbs.length > 0 && (
            <nav className="page-header__breadcrumbs" aria-label="breadcrumb">
              {breadcrumbs.map((b, idx) => (
                <span key={idx} className="flex items-center gap-1">
                  {b.href ? (
                    <Link href={b.href} className="hover:text-white transition">{b.label}</Link>
                  ) : (
                    <span className="text-text-secondary">{b.label}</span>
                  )}
                  {idx < breadcrumbs.length - 1 && (
                    <ChevronRight className="w-3 h-3 text-text-tertiary" />
                  )}
                </span>
              ))}
            </nav>
          )}
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="page-header__title">{title}</h1>
            {badges}
          </div>
          {description && <p className="page-header__desc">{description}</p>}
        </div>
        {actions && <div className="page-header__actions">{actions}</div>}
      </div>
    </div>
  );
}
