import { create } from 'zustand';
import { persist } from 'zustand/middleware';

/**
 * 跨页面/跨组件共享的 UI 状态。
 *  - 部分状态（favorites / forumPosts / chatHistory / datasets / lastDataset）持久化到 localStorage
 *  - 临时状态（drawer / 命令面板 / 当前选中）不持久化
 */

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
  agent?: string;
  tools?: string[];
}

export interface ForumPost {
  id: string;
  title: string;
  body: string;
  author: string;
  category: string;
  createdAt: string;
  replies: number;
  views: number;
  pinned?: boolean;
  liked?: boolean;
}

export interface UserDataset {
  id: string;
  title: string;
  description: string;
  category: string;
  size: string;
  uploadedBy: string;
  uploadedAt: string;
  tags: string[];
}

export interface UiState {
  /** 首页右侧抽屉中显示哪个元件详情 */
  detailComponentId: string | null;
  setDetailComponentId: (id: string | null) => void;

  /** 首页 3D 主舞台当前高亮的科研模块（scFv / circuit / epidemic / multiomics / ip） */
  heroFocus: 'scfv' | 'circuit' | 'epidemic' | 'multiomics' | 'ip' | 'overview';
  setHeroFocus: (f: UiState['heroFocus']) => void;

  /** 首页工作区当前激活的标签 */
  workspaceTab: 'db' | 'runs' | 'ip' | 'bench';
  setWorkspaceTab: (t: UiState['workspaceTab']) => void;

  /** Copilot 抽屉 */
  copilotOpen: boolean;
  setCopilotOpen: (v: boolean) => void;
  toggleCopilot: () => void;

  /** 命令面板（与 AppShell.searchOpen 等价，但允许外部触发） */
  commandOpen: boolean;
  setCommandOpen: (v: boolean) => void;
  toggleCommand: () => void;

  /** 移动端侧栏 */
  mobileNavOpen: boolean;
  setMobileNavOpen: (v: boolean) => void;

  /** ====== v2026.09 主舞台升级 ====== */

  /** 首页 3D 主舞台是否已挂载（用于 loader 隐藏） */
  stageReady: boolean;
  setStageReady: (v: boolean) => void;

  /** 当前悬浮卡片的高亮（联动 stage focus） */
  heroSectionFocus: 'telemetry' | 'commitments' | 'metrics' | 'actions' | null;
  setHeroSectionFocus: (s: UiState['heroSectionFocus']) => void;

  /** 全局错误提示 */
  lastError: string | null;
  setLastError: (e: string | null) => void;

  /** ====== v2026.09.20 产品化新增 ====== */

  /** 收藏的元件 ID 列表（持久化） */
  favorites: string[];
  toggleFavorite: (id: string) => void;
  isFavorite: (id: string) => boolean;

  /** 论坛帖子（持久化，新发表的帖子会插入到顶部） */
  forumPosts: ForumPost[];
  addForumPost: (post: Omit<ForumPost, 'id' | 'createdAt' | 'replies' | 'views' | 'liked'>) => void;
  togglePostLike: (id: string) => void;

  /** Copilot 聊天历史（持久化，最多保留 50 条） */
  chatHistory: ChatMessage[];
  appendChat: (msg: ChatMessage) => void;
  clearChat: () => void;

  /** 用户上传的数据集（持久化） */
  userDatasets: UserDataset[];
  addUserDataset: (ds: Omit<UserDataset, 'id' | 'uploadedAt'>) => void;

  /** 数据源模式（前端模拟切换） */
  dataSourceMode: 'api' | 'offline';
  setDataSourceMode: (m: 'api' | 'offline') => void;
}

const STORAGE_KEY = 'flubiostack-ui-state-v1';
const MAX_FORUM = 30;
const MAX_CHAT = 50;
const MAX_DATASETS = 20;

export const useUiStore = create<UiState>()(
  persist(
    (set, get) => ({
      detailComponentId: null,
      setDetailComponentId: (id) => set({ detailComponentId: id }),

      heroFocus: 'overview',
      setHeroFocus: (f) => set({ heroFocus: f }),

      workspaceTab: 'db',
      setWorkspaceTab: (t) => set({ workspaceTab: t }),

      copilotOpen: false,
      setCopilotOpen: (v) => set({ copilotOpen: v }),
      toggleCopilot: () => set((s) => ({ copilotOpen: !s.copilotOpen })),

      commandOpen: false,
      setCommandOpen: (v) => set({ commandOpen: v }),
      toggleCommand: () => set((s) => ({ commandOpen: !s.commandOpen })),

      mobileNavOpen: false,
      setMobileNavOpen: (v) => set({ mobileNavOpen: v }),

      stageReady: false,
      setStageReady: (v) => set({ stageReady: v }),

      heroSectionFocus: null,
      setHeroSectionFocus: (s) => set({ heroSectionFocus: s }),

      lastError: null,
      setLastError: (e) => set({ lastError: e }),

      // ===== 持久化字段 =====
      favorites: [],
      toggleFavorite: (id) =>
        set((s) => ({
          favorites: s.favorites.includes(id)
            ? s.favorites.filter((x) => x !== id)
            : [...s.favorites, id]
        })),
      isFavorite: (id) => get().favorites.includes(id),

      forumPosts: [],
      addForumPost: (post) =>
        set((s) => {
          const newPost: ForumPost = {
            ...post,
            id: `P-USER-${Date.now().toString(36).toUpperCase()}`,
            createdAt: new Date().toISOString().slice(0, 10),
            replies: 0,
            views: 1,
            liked: false
          };
          return { forumPosts: [newPost, ...s.forumPosts].slice(0, MAX_FORUM) };
        }),
      togglePostLike: (id) =>
        set((s) => ({
          forumPosts: s.forumPosts.map((p) =>
            p.id === id ? { ...p, liked: !p.liked } : p
          )
        })),

      chatHistory: [],
      appendChat: (msg) =>
        set((s) => ({
          chatHistory: [...s.chatHistory, msg].slice(-MAX_CHAT)
        })),
      clearChat: () => set({ chatHistory: [] }),

      userDatasets: [],
      addUserDataset: (ds) =>
        set((s) => {
          const newDs: UserDataset = {
            ...ds,
            id: `DS-USER-${Date.now().toString(36).toUpperCase()}`,
            uploadedAt: new Date().toISOString().slice(0, 10)
          };
          return { userDatasets: [newDs, ...s.userDatasets].slice(0, MAX_DATASETS) };
        }),

      dataSourceMode: 'api',
      setDataSourceMode: (m) => set({ dataSourceMode: m })
    }),
    {
      name: STORAGE_KEY,
      // 仅持久化需要跨会话恢复的字段
      partialize: (s) => ({
        favorites: s.favorites,
        forumPosts: s.forumPosts,
        chatHistory: s.chatHistory,
        userDatasets: s.userDatasets,
        dataSourceMode: s.dataSourceMode,
        workspaceTab: s.workspaceTab,
        heroFocus: s.heroFocus
      }),
      // SSR 兼容：跳过 hydration 时的状态恢复（避免客户端重读 storage 触发全树 rerender）
      skipHydration: true
    }
  )
);
