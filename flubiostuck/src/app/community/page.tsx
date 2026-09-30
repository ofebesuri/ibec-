'use client';

import { Suspense, useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Users,
  BookOpen,
  Video,
  Upload,
  Download,
  MessageCircle,
  Play,
  FileText,
  Award,
  ExternalLink,
  Eye,
  Calendar,
  Code,
  GitBranch,
  Sparkles,
  Globe,
  ChevronRight,
  ChevronDown,
  Heart,
  MessageSquare,
  Pin,
  X,
  Github
} from 'lucide-react';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { DEMO_COMMUNITY_DATASETS, DEMO_TUTORIALS } from '@/lib/demoData';
import { useUiStore } from '@/lib/store/uiStore';
import { SITE_LINKS } from '@/lib/siteLinks';

type TabId = 'tutorials' | 'datasets' | 'forum' | 'docs' | 'igem';

const TAB_LABELS: Record<TabId, string> = {
  tutorials: '教学视频',
  datasets: '数据集',
  forum: '社区论坛',
  docs: '开发文档',
  igem: 'iGEM 项目'
};

export default function CommunityPage() {
  return (
    <Suspense fallback={<CommunitySkeleton />}>
      <CommunityHub />
    </Suspense>
  );
}

function CommunitySkeleton() {
  return (
    <div className="px-4 lg:px-8 py-5 lg:py-7">
      <div className="h-8 w-48 bg-ink-800/60 rounded animate-pulse mb-4" />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-24 panel animate-pulse" />
        ))}
      </div>
      <div className="h-12 panel-strong animate-pulse mb-5" />
      <div className="h-72 panel-strong animate-pulse" />
    </div>
  );
}

function CommunityHub() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryTab = (searchParams?.get('tab') as TabId | null) || null;
  const queryPost = searchParams?.get('post') || '';
  const [activeTab, setActiveTab] = useState<TabId>(queryTab ?? 'tutorials');

  const switchTab = (next: TabId) => {
    setActiveTab(next);
    const params = new URLSearchParams();
    params.set('tab', next);
    router.replace(`/community?${params.toString()}`, { scroll: false });
  };

  useEffect(() => {
    if (queryTab && queryTab !== activeTab && (queryTab as TabId) in TAB_LABELS) {
      setActiveTab(queryTab as TabId);
    }
  }, [queryTab]); // eslint-disable-line react-hooks/exhaustive-deps

  const tabs: Array<{ id: TabId; label: string; icon: any; sub: string; count: number | string }> = [
    { id: 'tutorials', label: TAB_LABELS.tutorials, icon: Video, sub: 'TUTORIALS', count: DEMO_TUTORIALS.length },
    { id: 'datasets', label: TAB_LABELS.datasets, icon: FileText, sub: 'DATASETS', count: DEMO_COMMUNITY_DATASETS.length },
    { id: 'forum', label: TAB_LABELS.forum, icon: MessageCircle, sub: 'FORUM', count: '234' },
    { id: 'docs', label: TAB_LABELS.docs, icon: BookOpen, sub: 'DOCS', count: '56' },
    { id: 'igem', label: TAB_LABELS.igem, icon: Award, sub: 'iGEM', count: '18' }
  ];

  return (
    <div className="px-4 lg:px-8 py-5 lg:py-7">
      <div className="mb-6 flex flex-col lg:flex-row lg:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="chip">
              <Users className="w-3 h-3" />
              Community Hub
            </span>
            <span className="badge badge-info">
              <Globe className="w-3 h-3" />
              iGEM 2023-2024 · 招募中
            </span>
          </div>
          <h1 className="text-2xl lg:text-3xl font-bold text-white">社区与资源中心</h1>
          <p className="text-text-secondary text-sm mt-1 max-w-3xl">
            iGEM 队伍开源共享 · 教学视频 · 数据集共建 · 社区论坛 · 开发文档
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => switchTab('datasets')} className="btn-primary">
            <Upload className="w-4 h-4" />
            上传贡献
          </button>
          <Link href="/" className="btn-secondary">
            <Sparkles className="w-4 h-4" />
            查看演示路径
          </Link>
        </div>
      </div>

      {/* Migration banner — forum now lives at /forum */}
      <div className="panel p-3 mb-5 flex flex-col sm:flex-row items-start sm:items-center gap-2 border-l-4 border-l-compute-500">
        <div className="flex-1 min-w-0">
          <div className="text-sm font-semibold text-white">论坛已迁移到独立页面</div>
          <div className="text-xs text-text-secondary">
            本页保留 5 个 tab 的资源中心；论坛讨论请前往
            <Link href={SITE_LINKS.internal.forumHome} className="text-bio-300 hover:underline mx-1 font-semibold">/forum</Link>
            （Discourse 风格独立界面，60+ 话题、12 分类）
          </div>
        </div>
        <Link href={SITE_LINKS.internal.forumHome} className="btn-primary text-xs whitespace-nowrap">
          打开论坛 →
        </Link>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        {[
          { label: '注册成员', value: '1,238', sub: 'iGEM / 高校 / 工业' },
          { label: '论坛帖子', value: '3,542', sub: '活跃讨论' },
          { label: '共享数据集', value: '128', sub: '总 12.4 GB' },
          { label: '教学视频', value: '46', sub: '覆盖三大模块' }
        ].map((s) => (
          <div key={s.label} className="panel px-4 py-3">
            <div className="text-[10px] font-mono tracking-[0.24em] uppercase text-text-tertiary">
              {s.label}
            </div>
            <div className="text-2xl font-semibold text-white font-mono">{s.value}</div>
            <div className="text-[11px] text-text-secondary">{s.sub}</div>
          </div>
        ))}
      </div>

      <div className="panel-strong p-1.5 mb-5 flex flex-wrap gap-1" role="tablist">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const active = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => switchTab(tab.id)}
              role="tab"
              aria-selected={active}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition border ${
                active
                  ? 'bg-gradient-to-r from-compute-700/50 to-bio-700/40 text-white border-compute-500/50 shadow-glow-sm'
                  : 'text-text-secondary hover:text-white hover:bg-ink-800/60 border-transparent'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-ink-800/70 text-text-tertiary border border-white/5">
                {tab.sub}
              </span>
              <span
                className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${
                  active ? 'bg-white/15 text-white' : 'bg-ink-800/70 text-text-tertiary'
                }`}
              >
                {tab.count}
              </span>
            </button>
          );
        })}
      </div>

      <div role="tabpanel" aria-label={TAB_LABELS[activeTab]}>
        {activeTab === 'tutorials' && <TutorialsView />}
        {activeTab === 'datasets' && <DatasetsView />}
        {activeTab === 'forum' && <ForumView initialPostId={queryPost} />}
        {activeTab === 'docs' && <DocsView />}
        {activeTab === 'igem' && <IGEMView />}
      </div>

      <div className="panel-strong mt-6 p-8 text-center relative overflow-hidden">
        <div className="absolute -top-20 -right-20 w-72 h-72 rounded-full bg-compute-500/20 blur-3xl" />
        <Upload className="w-12 h-12 text-bio-300 mx-auto mb-3" />
        <h2 className="text-2xl font-bold text-white mb-2">共建开源合成生物学生态</h2>
        <p className="text-text-secondary mb-6 max-w-2xl mx-auto text-sm">
          上传元件序列、实验数据、教学资源，与全球研究者共享。当前上传功能为客户端演示，
          真实贡献请使用 GitHub PR 流程。
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3">
          <UploadDatasetButton />
          <Link
            href={SITE_LINKS.external.githubHome}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-secondary"
          >
            <Github className="w-4 h-4" />
            查看贡献指南
          </Link>
        </div>
      </div>
    </div>
  );
}

/**
 * 上传数据集：弹出客户端表单，提交后写入 useUiStore (持久化到 localStorage)。
 */
function UploadDatasetButton() {
  const addUserDataset = useUiStore((s) => s.addUserDataset);
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('基因组');
  const [size, setSize] = useState('100 MB');

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      toast.error('请填写数据集标题');
      return;
    }
    addUserDataset({
      title: title.trim(),
      description: description.trim() || '用户上传的数据集',
      category,
      size,
      uploadedBy: '当前用户',
      tags: ['用户上传']
    });
    toast.success(`数据集 "${title}" 已登记`);
    setTitle('');
    setDescription('');
    setCategory('基因组');
    setSize('100 MB');
    setOpen(false);
  };

  return (
    <>
      <button onClick={() => setOpen(true)} className="btn-primary">
        <Upload className="w-4 h-4" />
        上传数据
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[80] bg-ink-950/90 flex items-center justify-center p-4"
            onClick={() => setOpen(false)}
          >
            <motion.form
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onSubmit={submit}
              className="panel-strong w-full max-w-xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between p-5 border-b border-white/5">
                <div>
                  <div className="text-[10px] font-mono uppercase tracking-[0.24em] text-text-tertiary">
                    UPLOAD DATASET
                  </div>
                  <h3 className="text-base font-semibold text-white">登记新数据集</h3>
                </div>
                <button type="button" onClick={() => setOpen(false)} className="p-1.5 rounded text-text-tertiary hover:text-white hover:bg-white/5">
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="p-5 space-y-3">
                <div>
                  <label className="text-xs text-text-secondary mb-1 block">标题 *</label>
                  <input
                    autoFocus
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="数据集标题"
                    className="w-full px-3 py-2 text-sm bg-ink-900/70 border border-white/10 rounded text-white focus:border-compute-500/50 outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs text-text-secondary mb-1 block">描述</label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={3}
                    placeholder="数据集说明（可选）"
                    className="w-full px-3 py-2 text-sm bg-ink-900/70 border border-white/10 rounded text-white focus:border-compute-500/50 outline-none"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-text-secondary mb-1 block">分类</label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full px-3 py-2 text-sm bg-ink-900/70 border border-white/10 rounded text-white focus:border-compute-500/50 outline-none"
                    >
                      {['基因组', '转录组', '蛋白组', '代谢组', 'iGEM', '其他'].map((c) => (
                        <option key={c} value={c} className="bg-ink-900">{c}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs text-text-secondary mb-1 block">大小</label>
                    <input
                      value={size}
                      onChange={(e) => setSize(e.target.value)}
                      placeholder="例如 100 MB"
                      className="w-full px-3 py-2 text-sm bg-ink-900/70 border border-white/10 rounded text-white focus:border-compute-500/50 outline-none"
                    />
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-between gap-2 p-4 border-t border-white/5">
                <span className="text-[10px] text-text-tertiary">
                  登记后数据集会出现在下方的列表中（持久化到本地）
                </span>
                <div className="flex items-center gap-2">
                  <button type="button" onClick={() => setOpen(false)} className="btn-secondary text-xs">取消</button>
                  <button type="submit" className="btn-primary text-xs">登记</button>
                </div>
              </div>
            </motion.form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

/* ----------------------------- Tutorials ----------------------------- */

function TutorialsView() {
  const [level, setLevel] = useState<string>('all');
  const [activeTutorial, setActiveTutorial] = useState<typeof DEMO_TUTORIALS[number] | null>(null);

  return (
    <div className="panel-strong p-5 lg:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
        <div>
          <div className="text-[10px] font-mono tracking-[0.24em] uppercase text-text-tertiary">
            TUTORIALS · 教学视频库
          </div>
          <h2 className="text-lg font-semibold text-white">覆盖入门到高级</h2>
        </div>
        <select
          value={level}
          onChange={(e) => setLevel(e.target.value)}
          className="text-sm bg-ink-900/70 border border-white/10 rounded-md px-3 py-1.5 text-white focus:outline-none focus:border-compute-500/50"
          aria-label="按难度筛选"
        >
          <option value="all" className="bg-ink-900">全部难度</option>
          <option value="beginner" className="bg-ink-900">入门</option>
          <option value="intermediate" className="bg-ink-900">进阶</option>
          <option value="advanced" className="bg-ink-900">高级</option>
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {DEMO_TUTORIALS.filter((t) => level === 'all' || t.level === level).map((tutorial) => (
          <div key={tutorial.id} className="panel overflow-hidden hover:border-compute-500/40 group">
            <div className="relative aspect-video bg-gradient-to-br from-compute-700/40 via-bio-700/30 to-glow-700/30 overflow-hidden">
              <div className="absolute inset-0 grid-bg opacity-30" />
              <div className="absolute inset-0 flex items-center justify-center">
                <button
                  onClick={() => setActiveTutorial(tutorial)}
                  className="w-14 h-14 rounded-full bg-ink-900/95 flex items-center justify-center shadow-glow-md border border-white/20 group-hover:scale-105 transition-transform"
                  aria-label={`播放 ${tutorial.title}`}
                >
                  <Play className="w-5 h-5 text-bio-300 fill-current ml-0.5" />
                </button>
              </div>
              <div className="absolute bottom-2 right-2 px-2 py-1 rounded bg-ink-950/80 text-xs font-mono text-bio-200">
                {tutorial.duration}
              </div>
              <div className="absolute top-2 left-2">
                <span
                  className={`badge text-[10px] ${
                    tutorial.level === 'beginner'
                      ? 'badge-success'
                      : tutorial.level === 'intermediate'
                      ? 'badge-info'
                      : 'badge-warning'
                  }`}
                >
                  {tutorial.level === 'beginner'
                    ? '入门'
                    : tutorial.level === 'intermediate'
                    ? '进阶'
                    : '高级'}
                </span>
              </div>
            </div>
            <div className="p-4">
              <h3 className="text-sm font-semibold text-white mb-2 line-clamp-2 min-h-[40px]">
                {tutorial.title}
              </h3>
              <div className="flex items-center justify-between text-xs text-text-tertiary">
                <span className="flex items-center gap-1">
                  <Eye className="w-3 h-3" /> {tutorial.views.toLocaleString()} 次观看
                </span>
                <button
                  onClick={() => {
                    const ok = window.confirm(`下载教学视频 "${tutorial.title}"？\n（演示模式：会跳转到 YouTube 公开教学合集）`);
                    if (ok) {
                      window.open('https://www.youtube.com/playlist?list=PLrAXtmRdnEQy6nuLMfQ1y8vOcXA5jAdfk', '_blank', 'noopener');
                    }
                  }}
                  className="text-bio-200 hover:text-white flex items-center gap-1 font-medium"
                >
                  <Download className="w-3 h-3" />
                  下载
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <TutorialModal tutorial={activeTutorial} onClose={() => setActiveTutorial(null)} />
    </div>
  );
}

function TutorialModal({ tutorial, onClose }: { tutorial: any; onClose: () => void }) {
  useEffect(() => {
    if (!tutorial) return;
    const handler = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [tutorial, onClose]);

  return (
    <AnimatePresence>
      {tutorial && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[80] bg-ink-950/90 flex items-center justify-center p-4"
          onClick={onClose}
          role="dialog"
          aria-modal="true"
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="panel-strong w-full max-w-3xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-4 border-b border-white/5">
              <div>
                <div className="text-[10px] font-mono uppercase tracking-[0.24em] text-text-tertiary">
                  TUTORIAL · {tutorial.id}
                </div>
                <h3 className="text-base font-semibold text-white">{tutorial.title}</h3>
              </div>
              <button onClick={onClose} className="p-1.5 rounded text-text-tertiary hover:text-white hover:bg-white/5" aria-label="关闭">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="aspect-video bg-ink-950 relative">
              <iframe
                src={`https://www.youtube-nocookie.com/embed/videoseries?list=PLrAXtmRdnEQy6nuLMfQ1y8vOcXA5jAdfk&rel=0`}
                title={tutorial.title}
                className="absolute inset-0 w-full h-full"
                allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                sandbox="allow-scripts allow-same-origin allow-presentation"
              />
            </div>
            <div className="p-4 text-xs text-text-secondary">
              视频时长 {tutorial.duration} · 难度：{tutorial.level} · 观看 {tutorial.views.toLocaleString()} 次。
              视频源：YouTube 公开教学合集（合成生物学与生物信息）。完整课程大纲与字幕请联系教学团队。
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/* ----------------------------- Datasets ----------------------------- */

function DatasetsView() {
  const userDatasets = useUiStore((s) => s.userDatasets);
  const [selected, setSelected] = useState<any | null>(null);
  const allDatasets = useMemo(
    () => [...userDatasets, ...DEMO_COMMUNITY_DATASETS],
    [userDatasets]
  );

  const handleDownload = (ds: any) => {
    const csv =
      `id,${ds.id}\ntitle,${(ds.title || '').replace(/,/g, ' ')}\ncategory,${ds.category}\nsize,${ds.size}\nuploadedBy,${ds.uploadedBy}\nuploadedAt,${ds.uploadedAt}\n`;
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${ds.id}_${(ds.title || '').slice(0, 16)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success(`已下载 ${ds.title} 元数据 CSV`);
  };

  return (
    <div className="panel-strong p-5 lg:p-6">
      <div className="mb-5">
        <div className="text-[10px] font-mono tracking-[0.24em] uppercase text-text-tertiary">
          DATASETS · 开源数据集 {userDatasets.length > 0 && `· 含 ${userDatasets.length} 个用户上传`}
        </div>
        <h2 className="text-lg font-semibold text-white">共建数据集</h2>
      </div>

      <div className="space-y-3">
        {allDatasets.map((dataset: any) => (
          <div key={dataset.id} className="panel p-5 hover:border-compute-500/40">
            <div className="flex items-start gap-4">
              <span className="w-12 h-12 rounded-xl bg-gradient-to-br from-glow-500 to-bio-500 flex items-center justify-center text-ink-950 shadow-glow-sm flex-shrink-0">
                <FileText className="w-5 h-5" strokeWidth={2.4} />
              </span>

              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-3 mb-2 flex-wrap">
                  <h3 className="font-semibold text-white">{dataset.title}</h3>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {dataset.id.startsWith('DS-USER-') && (
                      <span className="badge badge-success text-[10px]">用户上传</span>
                    )}
                    <span className="badge badge-warning">{dataset.category}</span>
                  </div>
                </div>

                <p className="text-sm text-text-secondary mb-3">{dataset.description}</p>

                <div className="flex flex-wrap gap-1 mb-3">
                  {(dataset.tags ?? []).map((tag: string) => (
                    <span key={tag} className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-ink-800/70 text-bio-200 border border-white/5">
                      #{tag}
                    </span>
                  ))}
                </div>

                <div className="flex items-center justify-between text-xs text-text-tertiary flex-wrap gap-2">
                  <div className="flex items-center gap-4 flex-wrap">
                    <span className="font-mono">{dataset.size}</span>
                    {typeof dataset.downloads === 'number' && (
                      <span className="flex items-center gap-1">
                        <Download className="w-3 h-3" /> {dataset.downloads.toLocaleString()} 次下载
                      </span>
                    )}
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" /> {dataset.uploadedAt}
                    </span>
                    <span>by {dataset.uploadedBy}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => setSelected(dataset)} className="btn-secondary text-xs">
                      详情
                    </button>
                    <button onClick={() => handleDownload(dataset)} className="btn-primary text-xs">
                      <Download className="w-3 h-3" />
                      下载元数据
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <DatasetDetailModal dataset={selected} onClose={() => setSelected(null)} onDownload={handleDownload} />
    </div>
  );
}

function DatasetDetailModal({
  dataset,
  onClose,
  onDownload
}: {
  dataset: any;
  onClose: () => void;
  onDownload: (d: any) => void;
}) {
  useEffect(() => {
    if (!dataset) return;
    const handler = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [dataset, onClose]);

  return (
    <AnimatePresence>
      {dataset && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[80] bg-ink-950/90 flex items-center justify-center p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="panel-strong w-full max-w-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-5 border-b border-white/5">
              <div>
                <div className="text-[10px] font-mono uppercase tracking-[0.24em] text-text-tertiary">
                  DATASET · {dataset.id}
                </div>
                <h3 className="text-base font-semibold text-white">{dataset.title}</h3>
              </div>
              <button onClick={onClose} className="p-1.5 rounded text-text-tertiary hover:text-white hover:bg-white/5" aria-label="关闭">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-5 space-y-3 text-sm">
              <p className="text-text-secondary leading-relaxed">{dataset.description}</p>
              <dl className="grid grid-cols-2 gap-3">
                <Row label="分类" value={dataset.category} />
                <Row label="大小" value={dataset.size} />
                <Row label="下载次数" value={dataset.downloads.toLocaleString()} />
                <Row label="上传者" value={dataset.uploadedBy} />
                <Row label="上传日期" value={dataset.uploadedAt} />
                <Row label="许可证" value="CC-BY-4.0（学术）" />
              </dl>
              <div className="flex flex-wrap gap-1 pt-2">
                {dataset.tags.map((t: string) => (
                  <span key={t} className="badge badge-neutral text-[10px]">#{t}</span>
                ))}
              </div>
            </div>
            <div className="flex items-center justify-end gap-2 p-4 border-t border-white/5">
              <button onClick={onClose} className="btn-secondary text-xs">关闭</button>
              <button onClick={() => onDownload(dataset)} className="btn-primary text-xs">
                <Download className="w-3 h-3" />
                下载元数据 CSV
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="panel px-3 py-2">
      <div className="text-[10px] font-mono tracking-[0.16em] uppercase text-text-tertiary">{label}</div>
      <div className="text-white text-sm mt-0.5">{value}</div>
    </div>
  );
}

/* ----------------------------- Forum ----------------------------- */

const FORUM_POSTS = [
  {
    id: 'p-001',
    title: '如何优化 scFv 在低温下的稳定性？',
    author: '张同学',
    avatar: 'Z',
    replies: 23,
    views: 412,
    tag: 'scFv',
    excerpt: '我的 scFv 在 4°C 保存时活性下降很快，有什么推荐的稳定化策略吗？目前已经尝试过加入海藻糖和甘油。',
    time: '2 小时前',
    body: `目前常见的 scFv 低温稳定化策略有三种：\n\n1. **缓冲液优化**：PBS + 5% 海藻糖 + 0.05% Tween-20 可在 4°C 维持 6 周活性。\n2. **序列改造**：在 CDR 区外的 framework 引入 S31R / Y52H / K96Q（参考本平台 MUT-001~003）。\n3. **冻干工艺**：配合 0.5M 蔗糖 + 50mM 组氨酸，-20°C 可长期保存。\n\n建议先做 ΔTm 评估，再决定走序列还是工艺路线。`
  },
  {
    id: 'p-002',
    title: 'iGEM 2026 参赛队伍招募与元件共享',
    author: 'iGEM HQ',
    avatar: 'i',
    replies: 89,
    views: 1243,
    tag: 'iGEM',
    excerpt: '2026 iGEM 赛季即将开始，欢迎所有参赛队伍加入 FluBioStack 共建生态，本帖同步分享 2025 最佳实践。',
    time: '5 小时前',
    pinned: true,
    body: `2025 赛季共有 142 支队伍通过 FluBioStack 共享元件，平均 cycle time 缩短 38%。\n\n2026 关键节点：\n- 1 月 15 日：项目方向注册截止\n- 4 月 30 日：Wiki 与元件交付\n- 10 月底：Grand Jamboree\n\n请直接在本帖下方回复学校 + 队伍名 + 主题，我会拉群对接。`
  },
  {
    id: 'p-003',
    title: 'TriOmeFlow 多组学分析参数调优经验分享',
    author: 'Dr. Li',
    avatar: 'L',
    replies: 47,
    views: 892,
    tag: '教程',
    excerpt: '总结过去 6 个月使用 TriOmeFlow 的参数调优经验，希望对新用户有帮助。',
    time: '1 天前',
    body: `6 个月的实操踩坑记录：\n\n- DESeq2 在低样本量 (n<5) 时谨慎使用，p 值不稳定\n- 通路富集首选 KEGG + Reactome 双数据库，避免假阳性\n- 富集网络图阈值建议 |log2FC|>1.5 且 padj<0.01\n- 差异分析前先做 PCA 与样本相关性热图，确认没有离群样本`
  },
  {
    id: 'p-004',
    title: '关于 H5N1 scFv KD 值测定方法的讨论',
    author: '研究员 A',
    avatar: 'A',
    replies: 15,
    views: 234,
    tag: '讨论',
    excerpt: '目前常用的 BLI 与 SPR 测定方法在 scFv 应用中的对比分析。',
    time: '2 天前',
    body: `BLI（生物膜干涉）和 SPR（表面等离子体共振）在 scFv 测定中的对比：\n\n- BLI：通量高、成本低，适合初筛；动力学分辨率有限\n- SPR：精度高、可测弱亲和 (μM 级)，但样品消耗大\n\n建议先用 BLI 做 Top20 排序，再用 SPR 复核 Top3。`
  }
];

function ForumView({ initialPostId }: { initialPostId?: string }) {
  const router = useRouter();
  const userPosts = useUiStore((s) => s.forumPosts);
  const allPosts = useMemo(() => [...userPosts, ...FORUM_POSTS], [userPosts]);
  const [selected, setSelected] = useState<string | null>(initialPostId || null);
  const [composeOpen, setComposeOpen] = useState(false);

  const switchPost = (id: string | null) => {
    setSelected(id);
    const params = new URLSearchParams();
    params.set('tab', 'forum');
    if (id) params.set('post', id);
    router.replace(`/community?${params.toString()}`, { scroll: false });
  };

  const post = allPosts.find((p) => p.id === selected);

  return (
    <div className="panel-strong p-5 lg:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
        <div>
          <div className="text-[10px] font-mono tracking-[0.24em] uppercase text-text-tertiary">
            FORUM · 社区论坛 {userPosts.length > 0 && `· ${userPosts.length} 条新帖`}
          </div>
          <h2 className="text-lg font-semibold text-white">活跃讨论</h2>
        </div>
        <button onClick={() => setComposeOpen(true)} className="btn-primary">
          <MessageCircle className="w-4 h-4" />
          发起讨论
        </button>
      </div>

      <div className="space-y-3">
        {allPosts.map((p: any) => {
          const isUserPost = p.id?.startsWith?.('P-USER-');
          return (
            <button
              key={p.id}
              onClick={() => switchPost(p.id)}
              className={`block w-full text-left panel p-5 hover:border-compute-500/40 transition ${p.pinned ? 'border-ip-400/40' : ''}`}
            >
              <div className="flex items-start gap-4">
                <span className="w-10 h-10 rounded-full bg-gradient-to-br from-compute-500 to-bio-500 text-ink-950 font-semibold flex-shrink-0 flex items-center justify-center shadow-glow-sm">
                  {(p.author?.[0] ?? '?').toUpperCase()}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 mb-2 flex-wrap">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-semibold text-white">{p.title}</h3>
                      {p.pinned && (
                        <span className="badge badge-warning text-[10px]">
                          <Pin className="w-3 h-3" />
                          置顶
                        </span>
                      )}
                      {isUserPost && (
                        <span className="badge badge-success text-[10px]">我发的</span>
                      )}
                    </div>
                    <span className="badge badge-neutral text-[10px]">{p.category ?? p.tag ?? '讨论'}</span>
                  </div>
                  <p className="text-sm text-text-secondary mb-3 line-clamp-2">{p.excerpt ?? p.body?.slice(0, 120)}</p>
                  <div className="flex items-center justify-between text-xs text-text-tertiary flex-wrap gap-2">
                    <div className="flex items-center gap-3">
                      <span className="font-medium text-text-secondary">{p.author}</span>
                      <span>·</span>
                      <span>{p.time ?? p.createdAt}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="flex items-center gap-1">
                        <MessageSquare className="w-3 h-3" /> {p.replies ?? 0}
                      </span>
                      <span className="flex items-center gap-1">
                        <Eye className="w-3 h-3" /> {p.views ?? 0}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      <ForumPostModal post={post} onClose={() => switchPost(null)} />
      <ComposePostModal open={composeOpen} onClose={() => setComposeOpen(false)} />
    </div>
  );
}

function ForumPostModal({ post, onClose }: { post: any; onClose: () => void }) {
  useEffect(() => {
    if (!post) return;
    const handler = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [post, onClose]);

  return (
    <AnimatePresence>
      {post && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[80] bg-ink-950/90 flex items-center justify-center p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="panel-strong w-full max-w-2xl max-h-[85vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-5 border-b border-white/5 flex-shrink-0">
              <div className="min-w-0">
                <div className="text-[10px] font-mono uppercase tracking-[0.24em] text-text-tertiary">
                  POST · {post.id}
                </div>
                <h3 className="text-base font-semibold text-white truncate">{post.title}</h3>
                <div className="text-[11px] text-text-tertiary mt-0.5">
                  {post.author} · {post.time}
                </div>
              </div>
              <button onClick={onClose} className="p-1.5 rounded text-text-tertiary hover:text-white hover:bg-white/5" aria-label="关闭">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-5 overflow-y-auto flex-1">
              <p className="text-sm text-text-secondary mb-3 leading-relaxed">{post.excerpt}</p>
              <pre className="whitespace-pre-wrap text-sm text-text-primary font-sans leading-relaxed">
                {post.body}
              </pre>
            </div>
            <div className="flex items-center justify-between gap-2 p-4 border-t border-white/5 flex-shrink-0">
              <div className="flex items-center gap-3 text-xs text-text-tertiary">
                <span className="flex items-center gap-1">
                  <MessageSquare className="w-3 h-3" /> {post.replies} 回复
                </span>
                <span className="flex items-center gap-1">
                  <Eye className="w-3 h-3" /> {post.views} 浏览
                </span>
              </div>
              <button onClick={onClose} className="btn-secondary text-xs">关闭</button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function ComposePostModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const addForumPost = useUiStore((s) => s.addForumPost);
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [author, setAuthor] = useState('当前用户');
  const [category, setCategory] = useState('讨论');
  const submitRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [open, onClose]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !body.trim()) {
      toast.error('标题和正文不能为空');
      return;
    }
    addForumPost({
      title: title.trim(),
      body: body.trim(),
      author: author.trim() || '匿名',
      category
    });
    toast.success('帖子已发布（持久化到本地）');
    setTitle('');
    setBody('');
    setCategory('讨论');
    onClose();
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[80] bg-ink-950/90 flex items-center justify-center p-4"
          onClick={onClose}
        >
          <motion.form
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            onSubmit={handleSubmit}
            className="panel-strong w-full max-w-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-5 border-b border-white/5">
              <div>
                <div className="text-[10px] font-mono uppercase tracking-[0.24em] text-text-tertiary">
                  COMPOSE · 发起讨论
                </div>
                <h3 className="text-base font-semibold text-white">写新帖</h3>
              </div>
              <button type="button" onClick={onClose} className="p-1.5 rounded text-text-tertiary hover:text-white hover:bg-white/5" aria-label="关闭">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-5 space-y-3">
              <div>
                <label className="text-xs text-text-secondary mb-1 block">标题 *</label>
                <input
                  autoFocus
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="一句话描述你的问题或分享"
                  className="w-full px-3 py-2 text-sm bg-ink-900/70 border border-white/10 rounded text-white focus:border-compute-500/50 outline-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-text-secondary mb-1 block">作者</label>
                  <input
                    value={author}
                    onChange={(e) => setAuthor(e.target.value)}
                    placeholder="昵称"
                    className="w-full px-3 py-2 text-sm bg-ink-900/70 border border-white/10 rounded text-white focus:border-compute-500/50 outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs text-text-secondary mb-1 block">分类</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-ink-900/70 border border-white/10 rounded text-white focus:border-compute-500/50 outline-none"
                  >
                    {['讨论', '教程', 'scFv', 'iGEM', '多组学', 'IP', '回路', '其他'].map((c) => (
                      <option key={c} value={c} className="bg-ink-900">{c}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className="text-xs text-text-secondary mb-1 block">正文 *</label>
                <textarea
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  rows={6}
                  placeholder="详细描述上下文、已尝试方案、期望获得什么帮助…"
                  className="w-full px-3 py-2 text-sm bg-ink-900/70 border border-white/10 rounded text-white focus:border-compute-500/50 outline-none"
                />
              </div>
            </div>
            <div className="flex items-center justify-end gap-2 p-4 border-t border-white/5">
              <button type="button" onClick={onClose} className="btn-secondary text-xs">取消</button>
              <button ref={submitRef} type="submit" className="btn-primary text-xs">
                发布
              </button>
            </div>
          </motion.form>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/* ----------------------------- Docs ----------------------------- */

function DocsView() {
  const docCategories = [
    {
      title: 'API 参考',
      icon: Code,
      accent: 'from-compute-500 to-bio-500',
      docs: [
        { name: 'REST API 快速入门', time: '5 min', href: '/api/health' },
        { name: '数据库检索 API', time: '8 min', href: '/api/components' },
        { name: '分析任务 API', time: '12 min', href: '/api/analysis' },
        { name: '基准运行 API', time: '10 min', href: '/api/benchmark' }
      ]
    },
    {
      title: '开发者指南',
      icon: GitBranch,
      accent: 'from-bio-500 to-glow-500',
      docs: [
        { name: '本地开发环境搭建', time: '15 min', href: SITE_LINKS.external.githubHome },
        { name: 'Docker 入门', time: '20 min', href: SITE_LINKS.external.dockerHome },
        { name: '前端组件扩展', time: '18 min', href: SITE_LINKS.external.githubHome },
        { name: 'LLM 智能体集成', time: '25 min', href: SITE_LINKS.external.githubHome }
      ]
    },
    {
      title: '用户手册',
      icon: BookOpen,
      accent: 'from-glow-500 to-compute-500',
      docs: [
        { name: '平台使用指南', time: '10 min', href: '/community?tab=tutorials' },
        { name: '元件检索与导出', time: '6 min', href: '/database' },
        { name: '干实验 Protocol 模板', time: '8 min', href: SITE_LINKS.external.githubHome },
        { name: 'IP 保护最佳实践', time: '12 min', href: SITE_LINKS.external.githubHome }
      ]
    }
  ];

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {docCategories.map((cat) => {
          const Icon = cat.icon;
          return (
            <div key={cat.title} className="panel-strong p-5">
              <span className={`w-10 h-10 rounded-xl bg-gradient-to-br ${cat.accent} flex items-center justify-center text-ink-950 shadow-glow-sm mb-3`}>
                <Icon className="w-5 h-5" strokeWidth={2.4} />
              </span>
              <h3 className="text-base font-semibold text-white mb-4">{cat.title}</h3>
              <div className="space-y-2">
                {cat.docs.map((doc) => {
                  const isExternal = doc.href.startsWith('http') || doc.href.startsWith('mailto');
                  const cls = 'flex items-center justify-between p-2.5 rounded-lg hover:bg-ink-800/70 transition group';
                  return isExternal ? (
                    <a key={doc.name} href={doc.href} target="_blank" rel="noopener noreferrer" className={cls}>
                      <span className="text-sm text-text-secondary group-hover:text-white flex items-center gap-1">
                        {doc.name}
                        <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100" />
                      </span>
                      <span className="text-xs font-mono text-text-tertiary">{doc.time}</span>
                    </a>
                  ) : (
                    <Link key={doc.name} href={doc.href} className={cls}>
                      <span className="text-sm text-text-secondary group-hover:text-white">{doc.name}</span>
                      <span className="text-xs font-mono text-text-tertiary">{doc.time}</span>
                    </Link>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      <div className="panel-strong p-5">
        <div className="flex items-center gap-3 mb-4">
          <span className="w-10 h-10 rounded-xl bg-gradient-to-br from-compute-500 to-bio-500 flex items-center justify-center text-ink-950 shadow-glow-sm">
            <Globe className="w-5 h-5" strokeWidth={2.4} />
          </span>
          <h3 className="text-base font-semibold text-white">外部资源链接</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          {[
            { name: 'GitHub 官网', url: SITE_LINKS.external.githubHome },
            { name: 'Docker 官网', url: SITE_LINKS.external.dockerHome },
            { name: 'PyPI 官网', url: SITE_LINKS.external.pypiHome },
            { name: 'iGEM 官网', url: SITE_LINKS.external.igemHome }
          ].map((link) => (
            <a
              key={link.name}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 p-3 panel hover:border-compute-500/40 transition group"
            >
              <ExternalLink className="w-4 h-4 text-text-tertiary group-hover:text-bio-300" />
              <div className="min-w-0">
                <div className="text-sm font-medium text-white">{link.name}</div>
                <div className="text-xs text-text-tertiary font-mono truncate">
                  {link.url.replace(/^https?:\/\//, '')}
                </div>
              </div>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ----------------------------- iGEM ----------------------------- */

const IGEM_PROJECTS = [
  {
    id: 'igem-2023-tsinghua',
    team: 'Tsinghua 2023',
    title: '工程益生菌用于鼻黏膜免疫调控',
    medal: 'gold',
    medalText: '金牌',
    components: 12,
    year: 2023,
    track: 'Therapeutics'
  },
  {
    id: 'igem-2023-sjtu',
    team: 'SJTU-BioX 2023',
    title: '基于双自杀开关的安全基因回路',
    medal: 'silver',
    medalText: '银牌',
    components: 8,
    year: 2023,
    track: 'Foundational Advance'
  },
  {
    id: 'igem-2022-peking',
    team: 'Peking iGEM 2022',
    title: 'AI 辅助 scFv 亲和力成熟',
    medal: 'gold',
    medalText: '金牌',
    components: 15,
    year: 2022,
    track: 'Software'
  },
  {
    id: 'igem-2022-fudan',
    team: 'Fudan-SynBio 2022',
    title: '可诱导启动子文库构建',
    medal: 'bronze',
    medalText: '铜牌',
    components: 22,
    year: 2022,
    track: 'New Application'
  },
  {
    id: 'igem-2024-zju',
    team: 'ZJU-China 2024',
    title: '流感广谱中和抗体筛选平台',
    medal: 'gold',
    medalText: '金牌',
    components: 18,
    year: 2024,
    track: 'Therapeutics'
  },
  {
    id: 'igem-2024-whu',
    team: 'WHU-China 2024',
    title: '环境响应型工程菌传感器',
    medal: 'silver',
    medalText: '银牌',
    components: 9,
    year: 2024,
    track: 'Environment'
  }
];

function IGEMView() {
  const [selected, setSelected] = useState<typeof IGEM_PROJECTS[number] | null>(null);

  const medalAccent = {
    gold: 'from-ip-400 to-alert-400',
    silver: 'from-text-secondary to-text-tertiary',
    bronze: 'from-ip-500 to-alert-500'
  } as const;

  return (
    <div className="panel-strong p-5 lg:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
        <div>
          <div className="text-[10px] font-mono tracking-[0.24em] uppercase text-text-tertiary">
            iGEM PROJECT LIBRARY
          </div>
          <h2 className="text-lg font-semibold text-white">iGEM 项目库</h2>
        </div>
        <a
          href="https://igem.org"
          target="_blank"
          rel="noopener noreferrer"
          className="btn-secondary text-xs"
        >
          访问 iGEM 官网
          <ChevronRight className="w-3.5 h-3.5" />
        </a>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {IGEM_PROJECTS.map((project) => (
          <button
            key={project.id}
            onClick={() => setSelected(project)}
            className="panel p-5 hover:border-compute-500/40 relative overflow-hidden text-left"
          >
            <span
              className={`absolute -top-12 -right-12 w-32 h-32 rounded-full bg-gradient-to-br ${medalAccent[project.medal as keyof typeof medalAccent]} opacity-25 blur-2xl`}
            />
            <div className="relative flex items-start justify-between mb-3">
              <span className="badge badge-info">{project.year}</span>
              <span
                className={`badge ${
                  project.medal === 'gold' ? 'badge-warning' : 'badge-neutral'
                }`}
              >
                <Award className="w-3 h-3" />
                {project.medalText}
              </span>
            </div>

            <h3 className="relative font-semibold text-white mb-1">{project.team}</h3>
            <p className="relative text-sm text-text-secondary mb-3 line-clamp-2">
              {project.title}
            </p>

            <div className="relative flex items-center justify-between text-xs text-text-tertiary pt-3 border-t border-white/5">
              <span>Track: <span className="text-text-secondary">{project.track}</span></span>
              <span>
                <span className="font-mono text-bio-200">{project.components}</span> 个元件
              </span>
            </div>
          </button>
        ))}
      </div>

      <IGEMDetailModal project={selected} onClose={() => setSelected(null)} />
    </div>
  );
}

function IGEMDetailModal({ project, onClose }: { project: any; onClose: () => void }) {
  useEffect(() => {
    if (!project) return;
    const handler = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [project, onClose]);

  return (
    <AnimatePresence>
      {project && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[80] bg-ink-950/90 flex items-center justify-center p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="panel-strong w-full max-w-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-5 border-b border-white/5">
              <div>
                <div className="text-[10px] font-mono uppercase tracking-[0.24em] text-text-tertiary">
                  iGEM PROJECT · {project.id}
                </div>
                <h3 className="text-base font-semibold text-white">{project.team}</h3>
              </div>
              <button onClick={onClose} className="p-1.5 rounded text-text-tertiary hover:text-white hover:bg-white/5" aria-label="关闭">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-5 space-y-3">
              <p className="text-sm text-text-secondary leading-relaxed">{project.title}</p>
              <dl className="grid grid-cols-2 gap-3 text-sm">
                <Row label="年份" value={String(project.year)} />
                <Row label="奖牌" value={project.medalText} />
                <Row label="赛道" value={project.track} />
                <Row label="元件数" value={String(project.components)} />
              </dl>
            </div>
            <div className="flex items-center justify-end gap-2 p-4 border-t border-white/5">
              <button onClick={onClose} className="btn-secondary text-xs">关闭</button>
              <a
                href={`https://igem.org/Teams/Search?year=${project.year}&track=${encodeURIComponent(project.track)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-primary text-xs"
              >
                <ExternalLink className="w-3 h-3" />
                iGEM 官方项目搜索
              </a>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
