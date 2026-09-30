import Link from 'next/link';
import { ArrowLeft, BookOpen, Users, Sparkles, ShieldCheck, MessageCircle, Award, GitBranch } from 'lucide-react';

// Discourse-style "About" page (v2026.09.20-Final)
// Static content page describing the forum, its rules, and how to participate.

export default function AboutPage() {
  return (
    <div className="space-y-5">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-xs text-text-tertiary font-mono uppercase tracking-[0.16em]">
        <Link href="/forum" className="hover:text-white flex items-center gap-1">
          <ArrowLeft className="w-3 h-3" />论坛
        </Link>
        <span>›</span>
        <span className="text-white">关于</span>
      </div>

      {/* Hero */}
      <section className="panel-strong panel-shine p-5 lg:p-6 relative overflow-hidden">
        <div className="absolute -top-24 -right-24 w-72 h-72 rounded-full bg-compute-500/15 blur-3xl pointer-events-none" />
        <div className="relative">
          <div className="flex items-center gap-2 mb-2">
            <span className="chip">Community Forum · About</span>
            <span className="badge badge-info">Discourse 风格</span>
            <span className="badge badge-warning">v2.0</span>
          </div>
          <h1 className="text-2xl lg:text-3xl font-bold text-white">关于 FluBioStack 论坛</h1>
          <p className="text-sm text-text-secondary mt-2 max-w-3xl leading-relaxed">
            本论坛是 FluBioStack 平台的独立讨论空间，与主站（/community）的内嵌话题完全分离。
            旨在为合成生物学、iGEM、scFv 设计、SEIR 建模等方向的科研工作者提供一个干净、长期可归档的中文讨论环境。
          </p>
        </div>
      </section>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatBox icon={Users} label="成员" value="1,238" />
        <StatBox icon={MessageCircle} label="话题" value="860" />
        <StatBox icon={BookOpen} label="帖子" value="12,438" />
        <StatBox icon={Award} label="核心贡献者" value="38" accent />
      </div>

      {/* What you can do here */}
      <section>
        <h2 className="text-xs font-mono tracking-[0.18em] uppercase text-text-tertiary mb-3 px-1 flex items-center gap-2">
          <Sparkles className="w-3.5 h-3.5" />
          你可以在这里做什么
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          <FeatureCard
            icon={MessageCircle}
            title="发起讨论"
            desc="在 12 个分类下发起新话题，附 Markdown 正文、标签、来源链接。"
            href="/forum/new"
          />
          <FeatureCard
            icon={BookOpen}
            title="浏览分类"
            desc="公告、scFv 设计、多组学、遗传电路、流行病预测、IP 保护…"
            href="/forum"
          />
          <FeatureCard
            icon={Users}
            title="建立声誉"
            desc="从 TL0（新人）到 TL4（核心）四级信任体系；活跃贡献解锁版主权限。"
            href="/forum/users"
          />
          <FeatureCard
            icon={ShieldCheck}
            title="IP 与授权"
            desc="元件库使用、学术 / 商用授权边界、专利风险评估的专门板块。"
            href="/forum/c/ip-protection"
          />
          <FeatureCard
            icon={GitBranch}
            title="代码与数据"
            desc="分享可复现的脚本、上传数据集、请求 PDB 自动同步等基础设施。"
            href="/forum/c/datasets"
          />
          <FeatureCard
            icon={Award}
            title="iGEM 协作"
            desc="跨校队伍招募、湿实验 slot 共享、wiki 模板与 Judging Form 协作。"
            href="/forum/c/igem"
          />
        </div>
      </section>

      {/* Community covenant */}
      <section className="panel-strong p-5 lg:p-6">
        <h2 className="text-lg font-semibold text-white mb-3">社区公约 · 摘要</h2>
        <ol className="space-y-2 text-sm text-text-secondary list-decimal list-inside">
          <li>尊重他人：人身攻击、性别歧视、种族歧视、地域歧视零容忍。</li>
          <li>原创与引用：转载必须注明来源；湿实验数据需附原始 protocol 与至少 3 次生物学重复。</li>
          <li>IP 与授权：商业元件、专利菌株的讨论前请确认论坛的 IP 板块最新规则。</li>
          <li>代码可复现：分享脚本时附 GitHub 链接、依赖版本、随机种子。</li>
          <li>求助与回帖：提问前先搜索；回帖尽量附可执行方案、参考资料、复现步骤。</li>
          <li>广告与拉票：禁止纯营销贴；招聘信息请发到 <code className="text-bio-300">c_meta</code> 并标注 #job 标签。</li>
        </ol>
        <div className="mt-4 text-xs text-text-tertiary">
          详细规则见 <Link href="/forum/c/meta" className="text-bio-300 hover:underline">社区元话题</Link> · 违规举报请使用话题右下角旗帜按钮
        </div>
      </section>

      {/* Roadmap */}
      <section className="panel p-5">
        <h2 className="text-sm font-semibold text-white mb-3">论坛路线图</h2>
        <div className="space-y-2 text-xs text-text-secondary">
          <RoadmapItem label="v2.0（当前）" desc="独立路由 + Discourse 风格 hero / 子分区 / 标签页 / 用户主页 / 热门 & 未读" status="current" />
          <RoadmapItem label="v2.1" desc="真实登录、阅读位置追踪、邮件提醒" status="next" />
          <RoadmapItem label="v2.2" desc="Discourse SSO 对接 / 导出 BBCode / 移动端原生阅读模式" status="planned" />
        </div>
      </section>

      <div className="text-xs text-text-tertiary text-center py-4">
        FluBioStack · Community Forum v2.0 · 基于 Next.js 14 App Router
      </div>
    </div>
  );
}

function StatBox({
  icon: Icon,
  label,
  value,
  accent
}: {
  icon: any;
  label: string;
  value: string;
  accent?: boolean;
}) {
  return (
    <div className="panel px-3 py-3 flex items-center gap-3">
      <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${
        accent ? 'bg-glow-500/20 text-glow-300' : 'bg-compute-500/15 text-compute-300'
      }`}>
        <Icon className="w-4 h-4" />
      </div>
      <div>
        <div className="text-[10px] font-mono tracking-[0.18em] uppercase text-text-tertiary">{label}</div>
        <div className={`text-base font-semibold font-mono ${accent ? 'text-glow-400' : 'text-white'}`}>
          {value}
        </div>
      </div>
    </div>
  );
}

function FeatureCard({
  icon: Icon,
  title,
  desc,
  href
}: {
  icon: any;
  title: string;
  desc: string;
  href: string;
}) {
  return (
    <Link
      href={href}
      className="panel p-4 hover:border-compute-500/40 transition group block"
    >
      <div className="w-9 h-9 rounded-lg bg-compute-500/15 flex items-center justify-center mb-2.5 group-hover:bg-compute-500/25 transition">
        <Icon className="w-4 h-4 text-compute-300" />
      </div>
      <h3 className="text-sm font-semibold text-white mb-1 group-hover:text-bio-200 transition">{title}</h3>
      <p className="text-xs text-text-secondary leading-relaxed">{desc}</p>
    </Link>
  );
}

function RoadmapItem({
  label,
  desc,
  status
}: {
  label: string;
  desc: string;
  status: 'current' | 'next' | 'planned';
}) {
  const colorMap = {
    current: 'border-l-glow-400',
    next: 'border-l-bio-400',
    planned: 'border-l-text-tertiary'
  };
  const badgeMap = {
    current: { label: '当前', class: 'badge badge-warning' },
    next: { label: '下一版', class: 'badge badge-info' },
    planned: { label: '规划中', class: 'badge badge-neutral' }
  };
  return (
    <div className={`panel p-3 border-l-4 ${colorMap[status]}`}>
      <div className="flex items-center gap-2 mb-0.5">
        <span className="text-sm font-mono font-semibold text-white">{label}</span>
        <span className={`${badgeMap[status].class} text-[10px]`}>{badgeMap[status].label}</span>
      </div>
      <div>{desc}</div>
    </div>
  );
}
