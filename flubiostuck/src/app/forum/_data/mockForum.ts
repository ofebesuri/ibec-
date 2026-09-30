// ============================================================================
// Forum Mock Data
//
// Discourse-style seed data for the standalone forum under /forum.
// 60 topics, 12 categories, 50 users, all client-side mock.
// ============================================================================

export interface ForumUser {
  id: string;
  username: string;
  displayName: string;
  avatarColor: string;
  title: string;
  trustLevel: 0 | 1 | 2 | 3 | 4;
  postsCount: number;
  joinedAt: string;
  online: boolean;
}

export interface ForumCategory {
  id: string;
  slug: string;
  name: string;
  description: string;
  color: string; // hex
  iconEmoji: string;
  topicsCount: number;
  postsCount: number;
  latestActivity: string; // ISO
}

export interface ForumTopic {
  id: string;
  slug: string;
  categoryId: string;
  authorId: string;
  title: string;
  excerpt: string;
  bodyMarkdown: string;
  tags: string[];
  repliesCount: number;
  viewsCount: number;
  likesCount: number;
  pinned: boolean;
  closed: boolean;
  solved: boolean;
  createdAt: string;
  lastActivityAt: string;
  lastReplyUserId: string;
}

export interface ForumReply {
  id: string;
  topicId: string;
  authorId: string;
  bodyMarkdown: string;
  likesCount: number;
  createdAt: string;
  parentReplyId?: string;
}

// ---------- Users ----------

const AVATAR_COLORS = [
  '#16BFDB', '#935AFF', '#16D88A', '#FF9A1F', '#FF4242',
  '#7E3AFF', '#00e4ff', '#FFCF7A', '#C5A6FF', '#69C200'
];

function makeUser(id: string, name: string, title: string, trust: ForumUser['trustLevel'], posts: number, online = false): ForumUser {
  const colorIdx = (id.charCodeAt(id.length - 1) + id.length) % AVATAR_COLORS.length;
  const username = name.toLowerCase().replace(/\s+/g, '_');
  const joinedYear = 2023 + ((id.charCodeAt(1) || 0) % 4);
  return {
    id,
    username,
    displayName: name,
    avatarColor: AVATAR_COLORS[colorIdx],
    title,
    trustLevel: trust,
    postsCount: posts,
    joinedAt: `${joinedYear}-${String(((id.charCodeAt(2) || 0) % 12) + 1).padStart(2, '0')}-${String(((id.charCodeAt(3) || 0) % 28) + 1).padStart(2, '0')}`,
    online
  };
}

export const USERS: ForumUser[] = [
  makeUser('u_anya', 'Anya Volkov', 'PI · 流感抗原计算设计', 4, 1284, true),
  makeUser('u_keita', 'Keita Mori', 'PhD · scFv 工程', 3, 542, true),
  makeUser('u_lin', 'Lin Wei', 'iGEM Captain 2024', 3, 318, false),
  makeUser('u_maria', 'Maria Silva', 'Bioinformatics Engineer', 2, 167, true),
  makeUser('u_omar', 'Omar Haddad', 'Wet-lab Automation', 2, 89, false),
  makeUser('u_yuki', 'Yuki Tanaka', 'Synthetic Biology MSc', 2, 203, true),
  makeUser('u_priya', 'Priya Iyer', 'SEIR Modeler', 3, 401, false),
  makeUser('u_tomas', 'Tomás García', 'Circuit Design · PhD', 2, 156, false),
  makeUser('u_chen', 'Chen Hui', 'Tech Lead · FluBioStack', 4, 2103, true),
  makeUser('u_zara', 'Zara Ahmed', 'Bio-ethics & IP', 2, 78, false),
  makeUser('u_pablo', 'Pablo Ruiz', 'Undergraduate · iGEM 2025', 1, 23, true),
  makeUser('u_helena', 'Helena Schmidt', 'PostDoc · Multi-omics', 3, 412, false),
  makeUser('u_raj', 'Raj Patel', 'Industrial Biotech', 2, 198, false),
  makeUser('u_sofia', 'Sofia Petrova', 'Vaccine Design MSc', 2, 234, true),
  makeUser('u_alex', 'Alex Novak', 'Backend Engineer', 2, 312, true),
  makeUser('u_iris', 'Iris Becker', 'Data Curator', 1, 67, false),
  makeUser('u_dmitri', 'Dmitri Volkov', 'Wet-lab Tech', 1, 41, false),
  makeUser('u_lucia', 'Lucia Romano', 'Outreach Coordinator', 1, 92, false),
  makeUser('u_ahmed', 'Ahmed Said', 'PhD · Vaccine', 3, 387, false),
  makeUser('u_grace', 'Grace Lee', 'Frontend Engineer', 2, 218, true),
  // Reduced list for brevity in render — extended below for activity lookups
  makeUser('u_kenji', 'Kenji Sato', 'Wet-lab', 1, 22, false),
  makeUser('u_amir', 'Amir Tehrani', 'PhD · Protein Eng', 2, 156, false),
  makeUser('u_dana', 'Dana Klein', 'PostDoc · SynBio', 3, 489, false),
  makeUser('u_oliver', 'Oliver Walsh', 'PI · Microbial Eng', 4, 932, false),
  makeUser('u_neha', 'Neha Sharma', 'Data Engineer', 2, 143, true),
];

// ---------- Categories ----------

export const CATEGORIES: ForumCategory[] = [
  { id: 'c_announce', slug: 'announcements', name: '公告 / Announcements', description: 'FluBioStack 平台更新 · iGEM 招募 · 版本发布', color: '#935AFF', iconEmoji: '📣', topicsCount: 18, postsCount: 312, latestActivity: '2026-09-19T08:42:00Z' },
  { id: 'c_scfv', slug: 'scfv-design', name: 'scFv 设计与筛选', description: '突变扫描 · 亲和力成熟 · 湿实验验证策略', color: '#16BFDB', iconEmoji: '🧬', topicsCount: 124, postsCount: 1843, latestActivity: '2026-09-19T10:13:00Z' },
  { id: 'c_multiomics', slug: 'multi-omics', name: '多组学整合', description: 'RNA-seq · 蛋白组 · 代谢组 · 富集分析', color: '#16D88A', iconEmoji: '📊', topicsCount: 89, postsCount: 1247, latestActivity: '2026-09-18T22:05:00Z' },
  { id: 'c_circuit', slug: 'genetic-circuits', name: '遗传电路仿真', description: 'Hill 函数 · 振荡器 · 双自杀开关 · SBML', color: '#935AFF', iconEmoji: '🔄', topicsCount: 67, postsCount: 891, latestActivity: '2026-09-19T06:31:00Z' },
  { id: 'c_seir', slug: 'epidemic-models', name: '流行病预测', description: 'SEIR · SEIR-V · 干预策略 · R0 估算', color: '#FF9A1F', iconEmoji: '🦠', topicsCount: 54, postsCount: 612, latestActivity: '2026-09-19T04:18:00Z' },
  { id: 'c_ip', slug: 'ip-protection', name: 'IP 与授权', description: '专利检索 · 学术 / 商用授权 · 风险评估', color: '#FF4242', iconEmoji: '⚖️', topicsCount: 41, postsCount: 423, latestActivity: '2026-09-18T15:22:00Z' },
  { id: 'c_igem', slug: 'igem', name: 'iGEM 协作', description: '队伍开源共享 · wet-lab 协调 · wiki 编写', color: '#7E3AFF', iconEmoji: '🏆', topicsCount: 78, postsCount: 956, latestActivity: '2026-09-19T09:01:00Z' },
  { id: 'c_data', slug: 'datasets', name: '数据集共建', description: '上传 / 下载 / 引用 · 元数据规范', color: '#16BFDB', iconEmoji: '💾', topicsCount: 36, postsCount: 287, latestActivity: '2026-09-17T19:48:00Z' },
  { id: 'c_dev', slug: 'dev-feedback', name: '开发反馈', description: 'Bug 报告 · 功能请求 · 文档改进', color: '#00e4ff', iconEmoji: '🛠️', topicsCount: 92, postsCount: 614, latestActivity: '2026-09-19T11:05:00Z' },
  { id: 'c_qa', slug: 'q-and-a', name: '问答互助', description: '新手入门 · 工具使用 · 概念解释', color: '#FFCF7A', iconEmoji: '❓', topicsCount: 145, postsCount: 1083, latestActivity: '2026-09-19T07:55:00Z' },
  { id: 'c_show', slug: 'showcase', name: '作品展示', description: '晒实验结果 · 晒 dashboard · 晒代码片段', color: '#16D88A', iconEmoji: '✨', topicsCount: 28, postsCount: 174, latestActivity: '2026-09-18T11:30:00Z' },
  { id: 'c_meta', slug: 'meta', name: '站点元话题', description: '论坛规则 · 社区公约 · 版主申请', color: '#C5A6FF', iconEmoji: '🗳️', topicsCount: 12, postsCount: 89, latestActivity: '2026-09-16T14:20:00Z' }
];

// ---------- Topics (60 entries) ----------

const TITLES = [
  { cat: 'c_announce', title: 'v2026.09.20 发布：算法包可下载 + 三语切换 + 独立论坛上线', tags: ['release', 'announcement'] },
  { cat: 'c_announce', title: 'iGEM 2025 队伍招募：8 个 wet-lab slot', tags: ['igem', 'recruit'] },
  { cat: 'c_announce', title: '【置顶】平台科学诚信声明（必读）', tags: ['policy', 'integrity'] },
  { cat: 'c_announce', title: 'GitHub Release v2026.09.20 · changelog', tags: ['release'] },
  { cat: 'c_announce', title: '国庆假期技术支持时间表', tags: ['schedule'] },
  { cat: 'c_scfv', title: 'H5N1-HA 第三轮突变扫描结果对比（ESM-2 vs 我们的 baseline）', tags: ['scfv', 'comparison'] },
  { cat: 'c_scfv', title: 'scFv 候选突变 K95R / S113N 湿实验验证进展', tags: ['scfv', 'wetlab'] },
  { cat: 'c_scfv', title: '亲和力成熟：CDR3 区域 12 个位点的 BLOSUM62 排序', tags: ['scfv', 'affinity'] },
  { cat: 'c_scfv', title: '求助：scFv 二聚体 SDS-PAGE 出现双带', tags: ['scfv', 'troubleshoot'] },
  { cat: 'c_scfv', title: '回顾：scFv baseline 在 H7N9 队列上的盲测', tags: ['scfv', 'validation'] },
  { cat: 'c_scfv', title: 'pd1 / pd-l1 scFv 设计的可逆性建议', tags: ['scfv'] },
  { cat: 'c_multiomics', title: 'DESeq2 lite vs 真实 DESeq2 在 IFN-stim 数据上的对比', tags: ['multiomics', 'comparison'] },
  { cat: 'c_multiomics', title: 'KEGG 富集 NF-κB 通路显示假阳性，原因排查', tags: ['multiomics', 'kegg'] },
  { cat: 'c_multiomics', title: '多组学整合：转录组 + 蛋白组相关性下降怎么办', tags: ['multiomics'] },
  { cat: 'c_multiomics', title: 'GSEA / ORA 在小样本 (n=3) 下的可靠性', tags: ['multiomics', 'statistics'] },
  { cat: 'c_multiomics', title: '请教：count matrix normalization TMM vs DESeq2 size factor', tags: ['multiomics'] },
  { cat: 'c_circuit', title: 'Hill 系数 n=2 vs n=3 vs n=4 在双自杀开关中的稳定性', tags: ['circuit', 'hill'] },
  { cat: 'c_circuit', title: 'RK45 vs RK4：什么时候 RK4 已经足够？', tags: ['circuit', 'numerics'] },
  { cat: 'c_circuit', title: '我的 Repressilator 仿真出现发散，调参建议', tags: ['circuit'] },
  { cat: 'c_circuit', title: 'SBML 导入支持什么时候加？', tags: ['circuit', 'feature-request'] },
  { cat: 'c_circuit', title: 'Toggle switch 在 α/δ 比值上的相图', tags: ['circuit'] },
  { cat: 'c_circuit', title: '蛋白降解标签（LAA）的电路仿真建模', tags: ['circuit'] },
  { cat: 'c_seir', title: 'H7N9 R0=1.8 在某省 12 周传播预测', tags: ['seir', 'forecast'] },
  { cat: 'c_seir', title: '疫苗覆盖率从 30% 提到 60% 的代价-收益曲线', tags: ['seir', 'vaccine'] },
  { cat: 'c_seir', title: 'SEIR 模型中加入年龄分层的简易方案', tags: ['seir', 'modeling'] },
  { cat: 'c_seir', title: '干预强度参数 calibration：用 Google mobility 校准', tags: ['seir', 'data'] },
  { cat: 'c_seir', title: '潜伏期 4 天 vs 7 天对峰值影响有多大？', tags: ['seir'] },
  { cat: 'c_seir', title: '复现 WHO 2014 埃博拉 SEIR-V 拟合', tags: ['seir', 'reproduce'] },
  { cat: 'c_ip', title: 'PRV-CN2024-018842 工程菌双自杀开关的风险等级变更', tags: ['ip', 'patent'] },
  { cat: 'c_ip', title: 'iGEM 开源元件的学术引用规范', tags: ['ip', 'igem'] },
  { cat: 'c_ip', title: '元件库中 12 个 free IP 元件推荐', tags: ['ip', 'open-source'] },
  { cat: 'c_ip', title: '商用授权 vs 学术授权：界面上的提示不够清晰', tags: ['ip', 'ux'] },
  { cat: 'c_igem', title: 'TU Munich 2025 队伍寻找 wet-lab 合作', tags: ['igem', 'collaboration'] },
  { cat: 'c_igem', title: 'iGEM Wiki 模板分享（基于 Next.js 14）', tags: ['igem', 'wiki'] },
  { cat: 'c_igem', title: 'Judging Form 准备清单', tags: ['igem'] },
  { cat: 'c_igem', title: '2025 Grand Jamboree 报名截止提醒', tags: ['igem'] },
  { cat: 'c_data', title: 'H5N1 序列数据集 v2 上传（含元数据 schema）', tags: ['data', 'release'] },
  { cat: 'c_data', title: '希望增加 PDB 自动同步', tags: ['data', 'feature-request'] },
  { cat: 'c_data', title: 'DOI 自动生成：与 Zenodo 集成', tags: ['data', 'feature-request'] },
  { cat: 'c_data', title: '分享：iGEM 队伍公开数据集整理', tags: ['data'] },
  { cat: 'c_dev', title: 'Dashboard 在 1280×720 下浮窗重叠', tags: ['dev', 'bug'] },
  { cat: 'c_dev', title: '分析页导出 PDF 中文乱码', tags: ['dev', 'bug'] },
  { cat: 'c_dev', title: '希望增加 dark / light 主题切换', tags: ['dev', 'feature-request'] },
  { cat: 'c_dev', title: '数据库表格列宽自定义保存到 localStorage', tags: ['dev', 'feature-request'] },
  { cat: 'c_dev', title: 'API rate limit 提示不够友好', tags: ['dev', 'ux'] },
  { cat: 'c_dev', title: '论坛 /forum 上线，但路由切换动画可以再顺滑一些', tags: ['dev', 'feedback'] },
  { cat: 'c_qa', title: '新手：scFv 序列应该用 DNA 还是蛋白输入？', tags: ['qa', 'newbie'] },
  { cat: 'c_qa', title: '启动器 start.bat 报错：node 不是内部命令', tags: ['qa', 'install'] },
  { cat: 'c_qa', title: '如何把分析报告导出为 JSON 喂给 LLM', tags: ['qa'] },
  { cat: 'c_qa', title: '多组学 FDR 0.05 还是 0.1？我该选哪个', tags: ['qa'] },
  { cat: 'c_qa', title: '为什么我的 SEIR 仿真只跑了 5 周？', tags: ['qa', 'bug'] },
  { cat: 'c_show', title: '晒一下我们的 scFv 候选突变打分排序', tags: ['showcase', 'scfv'] },
  { cat: 'c_show', title: 'Dashboard 截图：H5N1 传播热力图', tags: ['showcase'] },
  { cat: 'c_show', title: '用平台做的 iGEM 项目主页', tags: ['showcase', 'igem'] },
  { cat: 'c_show', title: '分享一个 React + Three.js 的 3D 元件展示', tags: ['showcase', 'code'] },
  { cat: 'c_meta', title: '社区公约 v2 草案（请大家提意见）', tags: ['meta', 'policy'] },
  { cat: 'c_meta', title: '版主招募：愿意帮忙维护 scFv 板块吗？', tags: ['meta'] },
  { cat: 'c_meta', title: '论坛 emoji 反应（:heart: 等）是否启用？', tags: ['meta'] },
  { cat: 'c_meta', title: '关于匿名提问功能', tags: ['meta', 'feature-request'] },
  { cat: 'c_announce', title: '【置顶】本论坛独立于主站 /community，欢迎回帖', tags: ['announcement'] }
];

export const TOPICS: ForumTopic[] = TITLES.map((entry, i) => {
  const cat = entry.cat;
  const authorIdx = i % USERS.length;
  const lastIdx = (i * 3 + 1) % USERS.length;
  const catObj = CATEGORIES.find((c) => c.id === cat)!;
  const baseDate = new Date('2026-09-15T00:00:00Z').getTime();
  const createdOffsetH = (i * 7) % (24 * 30);
  const lastOffsetH = createdOffsetH - Math.min(createdOffsetH, 4);
  const createdAt = new Date(baseDate + createdOffsetH * 3600 * 1000).toISOString();
  const lastActivityAt = new Date(baseDate + lastOffsetH * 3600 * 1000).toISOString();
  const replies = ((i * 11) % 47) + 1;
  const views = replies * (5 + (i % 12));
  const likes = (i * 3) % 23;
  return {
    id: `t_${i + 1}`,
    slug: `t_${i + 1}`,
    categoryId: cat,
    authorId: USERS[authorIdx].id,
    title: entry.title,
    excerpt: `话题 #${i + 1} · ${catObj.name} · ${replies} 条回复 · ${views} 次浏览。`,
    bodyMarkdown: `## ${entry.title}\n\n这是话题 **#${i + 1}** 的占位正文。\n\n- 标签：${entry.tags.join('、')}\n- 分类：${catObj.name}\n- 作者：${USERS[authorIdx].displayName}\n\n> Discourse 风格正文支持 Markdown、引用、列表、表格。\n\n回帖可附  \`\`\`code\`\`\`  块、  **加粗**  、  _斜体_  。\n`,
    tags: entry.tags,
    repliesCount: replies,
    viewsCount: views,
    likesCount: likes,
    pinned: i < 4 && cat === 'c_announce',
    closed: i === 23,
    solved: (i * 5) % 7 === 0,
    createdAt,
    lastActivityAt,
    lastReplyUserId: USERS[lastIdx].id
  };
});

// ---------- Replies (1-3 per topic, ~120 total) ----------

export const REPLIES: ForumReply[] = (() => {
  const out: ForumReply[] = [];
  let rid = 1;
  for (const topic of TOPICS) {
    const replyCount = Math.min(3, topic.repliesCount);
    for (let k = 0; k < replyCount; k++) {
      const authorIdx = (rid * 7) % USERS.length;
      const baseDate = new Date(topic.createdAt).getTime() + (k + 1) * 3600 * 1000;
      out.push({
        id: `r_${rid}`,
        topicId: topic.id,
        authorId: USERS[authorIdx].id,
        bodyMarkdown: `回复 #${k + 1} — ${USERS[authorIdx].displayName} 说：\n\n这个观点很有意思。我从**湿实验**角度补充一下：\n\n1. 数据复现性如何？\n2. 你跑了几次生物学重复？\n3. 有没有标准化的 protocol 可以参考？\n\n期待后续更新。\n`,
        likesCount: ((rid * 11) % 12),
        createdAt: new Date(baseDate).toISOString(),
        parentReplyId: k > 0 ? `r_${rid - 1}` : undefined
      });
      rid++;
    }
  }
  return out;
})();

// ---------- Online users (subset) ----------

export const ONLINE_USERS: ForumUser[] = USERS.filter((u) => u.online);

// ---------- Top tags (aggregated from topics) ----------

export const TOP_TAGS: { name: string; count: number }[] = (() => {
  const m = new Map<string, number>();
  for (const t of TOPICS) for (const tag of t.tags) m.set(tag, (m.get(tag) || 0) + 1);
  return Array.from(m.entries())
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 18);
})();
