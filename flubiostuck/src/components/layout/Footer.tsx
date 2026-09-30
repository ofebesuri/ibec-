'use client';

import { Github, Mail, Globe, BookOpen, MessageCircle, Dna } from 'lucide-react';
import Link from 'next/link';
import { SITE_LINKS } from '@/lib/siteLinks';

const linkSections = [
  {
    title: '平台',
    links: [
      { label: '元件数据库', href: '/database' },
      { label: '在线分析', href: '/analysis' },
      { label: 'FluBench 基准', href: '/benchmark' },
      { label: '社区中心', href: '/community' }
    ]
  },
  {
    title: '资源',
    links: [
      { label: '教学视频', href: '/community?tab=tutorials' },
      { label: '数据集', href: '/community?tab=datasets' },
      { label: '论坛', href: SITE_LINKS.internal.forumHome },
      { label: '开发文档', href: '/community?tab=docs' },
      { label: 'iGEM 项目', href: '/community?tab=igem' }
    ]
  },
  {
    title: '支持',
    links: [
      { label: '贡献指南', href: '/community?tab=docs#contribute' },
      { label: '问题反馈', href: SITE_LINKS.external.githubHome },
      { label: 'Bug 报告', href: SITE_LINKS.external.githubHome },
      { label: '联系我们', href: SITE_LINKS.mail.contact }
    ]
  },
  {
    title: '关于',
    links: [
      { label: '项目简介', href: '/community?tab=docs#about' },
      { label: 'iGEM 协作', href: '/community?tab=igem' },
      { label: '开源协议', href: 'https://opensource.org/licenses/MIT' },
      { label: '科学诚信', href: '/community?tab=docs#integrity' }
    ]
  }
];

export function Footer() {
  return (
    <footer className="relative border-t border-white/5 bg-ink-900/95">
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-12">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 mb-10">
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="flex items-center gap-2.5 mb-4">
              <span className="w-9 h-9 rounded-xl bg-gradient-to-br from-compute-500 via-bio-400 to-glow-500 flex items-center justify-center shadow-glow-sm">
                <Dna className="w-4 h-4 text-ink-950" strokeWidth={2.4} />
              </span>
              <span className="text-base font-semibold text-white">FluBioStack</span>
            </Link>
            <p className="text-sm text-text-secondary leading-relaxed">
              面向合成生物学的科研级生物信息控制台：元件数据、scFv / 多组学 / 回路 / 流行病分析、IP 风险评估一体化。
            </p>
          </div>

          {linkSections.map((section) => (
            <div key={section.title}>
              <h4 className="text-sm font-semibold text-white mb-3 tracking-wide">{section.title}</h4>
              <ul className="space-y-2 text-sm text-text-secondary">
                {section.links.map((link) => {
                  const isExternal = link.href.startsWith('http') || link.href.startsWith('mailto');
                  return (
                    <li key={link.label}>
                      {isExternal ? (
                        <a
                          href={link.href}
                          target={link.href.startsWith('http') ? '_blank' : undefined}
                          rel="noopener noreferrer"
                          className="hover:text-bio-300 transition-colors"
                        >
                          {link.label}
                        </a>
                      ) : (
                        <Link href={link.href} className="hover:text-bio-300 transition-colors">
                          {link.label}
                        </Link>
                      )}
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </div>

        <div className="pt-6 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-sm text-text-tertiary">
            <span>FluBioStack © 2026 · 合成生物学智能平台 · MIT</span>
          </div>

          <div className="flex items-center gap-2">
            {[
              { icon: Github, label: 'GitHub', href: SITE_LINKS.external.githubHome },
              { icon: Globe, label: 'Wiki', href: SITE_LINKS.external.githubHome },
              { icon: MessageCircle, label: '论坛', href: SITE_LINKS.internal.forumHome },
              { icon: BookOpen, label: '文档', href: '/community?tab=docs' },
              { icon: Mail, label: '邮件', href: SITE_LINKS.mail.contact }
            ].map(({ icon: Icon, label, href }) => {
              const isExternal = href.startsWith('http') || href.startsWith('mailto');
              const cls = 'w-9 h-9 rounded-lg border border-white/10 bg-ink-800/60 flex items-center justify-center hover:border-compute-500/40 hover:text-white text-text-secondary transition';
              return isExternal ? (
                <a key={label} href={href} target="_blank" rel="noopener noreferrer" aria-label={label} className={cls}>
                  <Icon className="w-4 h-4" />
                </a>
              ) : (
                <Link key={label} href={href} aria-label={label} className={cls}>
                  <Icon className="w-4 h-4" />
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </footer>
  );
}
