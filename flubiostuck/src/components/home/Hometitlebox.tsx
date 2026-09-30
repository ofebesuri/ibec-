'use client';

/**
 * Hometitlebox - 模板 .Hometitlebox 686×69 标题 banner 还原
 *
 * 模板原文：
 *   width: 686px; height: 69px;
 *   margin: auto;
 *   background-image: Hometitlebg.png;
 *   text-align: center; font-weight: bold; font-size: 18px;
 *   line-height: 69px;
 *
 * 落地：深色科研控制台风格，但保留 686 宽度与居中 banner 形态
 */

import { Sparkles } from 'lucide-react';

export interface HometitleboxProps {
  /** 主标题 */
  title?: string;
  /** 副标题/版本 */
  subtitle?: string;
  /** 是否显示 v 标识 */
  showBadge?: boolean;
}

export function Hometitlebox({
  title = 'FluBioStack · 科研控制中枢',
  subtitle = 'v2026.09.20 · 实时遥测舞台 (CSS/SVG)',
  showBadge = true
}: HometitleboxProps) {
  return (
    <div className="home-titlebox" role="banner">
      <span className="home-titlebox__signal" aria-hidden />
      <div className="home-titlebox__inner">
        <div className="home-titlebox__title">
          <span className="home-titlebox__title-cn">{title}</span>
          {showBadge && (
            <span className="home-titlebox__chip">
              <Sparkles className="w-2.5 h-2.5" />
              iGEM 2026
            </span>
          )}
        </div>
        <div className="home-titlebox__sub">
          {subtitle} · 元件数据库 / scFv 筛选 / 多组学 / 回路 / SEIR / IP 风控
        </div>
      </div>
      <span className="home-titlebox__signal home-titlebox__signal--right" aria-hidden />
    </div>
  );
}
