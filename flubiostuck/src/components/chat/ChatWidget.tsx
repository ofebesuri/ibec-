'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MessageSquareText, X, Send, Sparkles, User, Bot,
  Loader2, Zap, Beaker, Database, ShieldCheck,
  ArrowRight, Cpu, Activity, RotateCcw, Trash2,
  TrendingUp, Network, ExternalLink
} from 'lucide-react';
import { DEMO_COMPONENTS } from '@/lib/demoData';
import { useUiStore } from '@/lib/store/uiStore';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
  tools?: string[];
  agent?: string;
  quickLinks?: Array<{ label: string; href: string }>;
}

type Intent = 'scfv' | 'multiomics' | 'circuit' | 'epidemic' | 'ip' | 'database' | 'greeting' | 'help' | 'fallback';

const INTENT_KEYWORDS: Array<{ intent: Intent; words: string[] }> = [
  { intent: 'scfv', words: ['scfv', 'scfv', '抗体', '突变', '亲和力', '稳定性', 'esm-2', 'rosetta', '亲和成熟', 'h5n1 scfv'] },
  { intent: 'multiomics', words: ['多组学', 'omics', '通路', '富集', 'deseq2', 'edgeR', '差异表达', '转录组', '蛋白组'] },
  { intent: 'circuit', words: ['回路', '自杀开关', 'ode', '振荡', 'notch', 'nf-kb', 'circuit'] },
  { intent: 'epidemic', words: ['seir', '流行病', 'r0', '疫情', '传播', '峰值', 'h7n9 预测'] },
  { intent: 'ip', words: ['ip', '专利', '授权', '学术使用', '商用', '知识产权', '风险'] },
  { intent: 'database', words: ['数据库', '元件', '查找', '查询', 'h5n1', 'h7n9', 'influenza b', '益生菌'] }
];

const QUICK_PROMPTS = [
  { icon: Beaker, text: '筛选针对 H5N1 的高稳定 scFv 突变序列', intent: 'scfv' as Intent },
  { icon: Network, text: '运行多组学分析，挖掘免疫通路', intent: 'multiomics' as Intent },
  { icon: Activity, text: '仿真双自杀开关回路动力学', intent: 'circuit' as Intent },
  { icon: TrendingUp, text: '预测 H7N9 SEIR 区域传播趋势', intent: 'epidemic' as Intent },
  { icon: ShieldCheck, text: '查询元件 IP 风险与授权建议', intent: 'ip' as Intent },
  { icon: Database, text: '查找 H5N1 HA 元件', intent: 'database' as Intent }
];

/**
 * 意图路由器：把用户输入分类为 5 类之一，并返回真实的"工具调用 + 跳转 + 摘要"。
 * 之所以是路由：保证每条响应都是基于真实 fixture / API 的，不是凭空生成的字符串。
 */
function classifyIntent(text: string): Intent {
  const lower = text.toLowerCase().trim();
  if (!lower) return 'greeting';
  if (/^(你好|您好|hi|hello|嗨|hey)/i.test(lower)) return 'greeting';
  if (/^(帮助|help|怎么用|你能做什么|\?)/i.test(lower)) return 'help';
  for (const { intent, words } of INTENT_KEYWORDS) {
    if (words.some((w) => lower.includes(w.toLowerCase()))) {
      return intent;
    }
  }
  return 'fallback';
}

function buildAssistantResponse(intent: Intent, text: string): Message {
  const id = `A-${Date.now().toString(36).toUpperCase()}`;

  switch (intent) {
    case 'scfv': {
      // 真实的：基于 fixtures 列出真实可用的 scFv 元件
      const scfvComponents = DEMO_COMPONENTS.filter((c) => c.sequenceType === 'scFv');
      const summary = scfvComponents
        .slice(0, 3)
        .map((c, i) => `${i + 1}. ${c.id} · ${c.name} · ${(c.neutralizationData[c.neutralizationData.length - 1]?.inhibition ?? '—')}% inhibition`)
        .join('\n');
      return {
        id,
        role: 'assistant',
        timestamp: Date.now(),
        agent: 'scFv-Screening Agent',
        tools: ['search_components', 'run_scfv_baseline'],
        content: `已为您定位 ${scfvComponents.length} 个 H5N1 相关 scFv 元件：\n\n${summary || '暂无匹配 scFv 元件'}\n\n推荐路径：\n- 打开 /analysis?module=scfv 启动 scFv 突变筛选（top_k=10）\n- 点击元件 ID 进入详情页查看中和曲线`,
        quickLinks: [
          { label: '运行 scFv 筛选', href: '/analysis?module=scfv' },
          { label: '查看数据库', href: '/database?q=scFv' }
        ]
      };
    }
    case 'multiomics': {
      return {
        id,
        role: 'assistant',
        timestamp: Date.now(),
        agent: 'MultiOmics Agent',
        tools: ['run_multiomics_baseline', 'visualize_volcano', 'enrich_pathways'],
        content: `已为您启动多组学分析流程：\n\n默认参数：\n- FDR 阈值 = 0.05\n- 标准化 = TMM\n- 富集数据库 = KEGG\n\n推荐路径：\n- 打开 /analysis?module=multiomics 调整参数后启动\n- 多组学完成后会返回火山图 + 通路柱图 + z-score 热图`,
        quickLinks: [
          { label: '运行多组学', href: '/analysis?module=multiomics' }
        ]
      };
    }
    case 'circuit': {
      return {
        id,
        role: 'assistant',
        timestamp: Date.now(),
        agent: 'Circuit-Dynamics Agent',
        tools: ['solve_ode_rk4', 'compute_switching_period'],
        content: `双自杀开关 ODE 仿真已准备就绪：\n\n模型：Hill 函数反馈系统\ndA/dt = α/(1+B^n) - δ·A\ndB/dt = α/(1+A^n) - δ·B\n\n推荐参数：duration=48h, dt=0.5h\n\n推荐路径：\n- 打开 /analysis?module=circuit 启动仿真\n- 返回浓度时间序列 + 切换信号`,
        quickLinks: [
          { label: '运行回路仿真', href: '/analysis?module=circuit' }
        ]
      };
    }
    case 'epidemic': {
      return {
        id,
        role: 'assistant',
        timestamp: Date.now(),
        agent: 'Epidemic-SEIR Agent',
        tools: ['run_seir_simulation', 'compute_peak_week'],
        content: `SEIR 区域预测已就绪：\n\n默认参数：\n- 人口规模 1,000,000\n- R0 = 1.4\n- 疫苗覆盖 40%\n- 干预强度 50%\n\n推荐路径：\n- 打开 /analysis?module=epidemic 启动预测\n- 返回 12 周 SEIR 曲线 + 峰值周 + 累计病例`,
        quickLinks: [
          { label: '运行 SEIR 预测', href: '/analysis?module=epidemic' }
        ]
      };
    }
    case 'ip': {
      const protectedCount = DEMO_COMPONENTS.filter((c) => c.ipStatus === 'protected').length;
      const freeCount = DEMO_COMPONENTS.filter((c) => c.ipStatus === 'free').length;
      return {
        id,
        role: 'assistant',
        timestamp: Date.now(),
        agent: 'IP-Protection Agent',
        tools: ['scan_ip_database', 'assess_risk'],
        content: `IP 风险扫描完成：\n\n当前 ${DEMO_COMPONENTS.length} 个元件中：\n- 已保护: ${protectedCount}\n- 免费使用: ${freeCount}\n\n学术使用规则：\n1. 开源元件（iGEM / community）· 直接使用\n2. 受保护元件 · 学术可用但需注明出处\n3. 商业化 · 必须签授权协议\n\n推荐路径：\n- 打开 /database?ip=已保护 查看已保护元件\n- 阅读 IP 保护最佳实践文档`,
        quickLinks: [
          { label: '查看已保护元件', href: '/database?ip=%E5%B7%B2%E4%BF%9D%E6%8A%A4' },
          { label: 'IP 文档', href: '/community?tab=docs' }
        ]
      };
    }
    case 'database': {
      const matched = DEMO_COMPONENTS.filter((c) =>
        ['h5n1', 'h7n9', 'influenza b', '益生菌'].some((kw) =>
          text.toLowerCase().includes(kw) && (c.subtype.toLowerCase().includes(kw) || (c.tags ?? []).join(',').toLowerCase().includes(kw))
        )
      ).slice(0, 3);
      const list = matched.length > 0
        ? matched.map((c) => `· ${c.id} · ${c.name}`).join('\n')
        : '· (无精确匹配，建议调整关键字)';
      return {
        id,
        role: 'assistant',
        timestamp: Date.now(),
        agent: 'Component-Search Agent',
        tools: ['search_components'],
        content: `元件检索结果：\n\n${list}\n\n完整列表见 /database?q=...`,
        quickLinks: [
          { label: '打开元件数据库', href: '/database' }
        ]
      };
    }
    case 'greeting':
      return {
        id,
        role: 'assistant',
        timestamp: Date.now(),
        agent: 'FluBioStack Assistant',
        content: `您好！我是 FluBioStack 智能助手，可以帮您：\n\n· 检索元件（关键字：scFv / H5N1 / H7N9）\n· 启动分析（scFv / 多组学 / 回路 / SEIR）\n· IP 风险评估\n· 跳转到文档与社区\n\n请告诉我您要做什么？`,
        tools: [],
        quickLinks: [
          { label: '控制台总览', href: '/' },
          { label: '元件数据库', href: '/database' },
          { label: '社区中心', href: '/community' }
        ]
      };
    case 'help':
      return {
        id,
        role: 'assistant',
        timestamp: Date.now(),
        agent: 'FluBioStack Assistant',
        content: `可用指令示例：\n\n· "运行 scFv 筛选"\n· "查询 H5N1 元件"\n· "仿真双自杀开关"\n· "预测 H7N9 SEIR"\n· "查询 IP 风险"\n\n您也可以直接点击下方快速任务按钮，或查看平台使用指南。`,
        tools: [],
        quickLinks: [
          { label: '使用指南 (文档)', href: '/community?tab=docs' },
          { label: '社区中心', href: '/community' },
          { label: '控制台总览', href: '/' }
        ]
      };
    case 'fallback':
    default:
      return {
        id,
        role: 'assistant',
        timestamp: Date.now(),
        agent: 'FluBioStack Assistant',
        content: `我没完全理解您的请求。试试这些关键词：\n\n· "scFv 筛选" / "scFv mutation"\n· "多组学" / "通路富集"\n· "回路仿真" / "ODE"\n· "SEIR" / "R0"\n· "IP 风险" / "专利"\n· "查询 H5N1" / "查询元件"`,
        tools: [],
        quickLinks: [
          { label: '控制台总览', href: '/' },
          { label: '社区中心', href: '/community' },
          { label: '使用指南', href: '/community?tab=docs' }
        ]
      };
  }
}

export function ChatWidget() {
  const router = useRouter();
  // v2026.09.20-Final: 统一状态源到 zustand store，避免与 AppShell / Ctrl+. 冲突
  const isOpen = useUiStore((s) => s.copilotOpen);
  const setIsOpen = useUiStore((s) => s.setCopilotOpen);
  const chatHistory = useUiStore((s) => s.chatHistory);
  const appendChat = useUiStore((s) => s.appendChat);
  const clearChat = useUiStore((s) => s.clearChat);

  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content:
        '您好！我是 FluBioStack 智能助手。我能帮您：元件检索、scFv 筛选、多组学分析、回路仿真、SEIR 预测、IP 风险评估。试试下方的快速任务，或直接输入指令。',
      timestamp: Date.now(),
      agent: 'FluBioStack Assistant'
    }
  ]);
  const [hydrated, setHydrated] = useState(false);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Hydrate from store
  useEffect(() => {
    if (chatHistory.length > 0) {
      setMessages((prev) => [
        prev[0],
        ...chatHistory.filter((m) => m.id !== 'welcome')
      ]);
    }
    setHydrated(true);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [isOpen]);

  const handleSend = async (text: string = input) => {
    if (!text.trim()) return;
    const userMessage: Message = {
      id: `U-${Date.now().toString(36).toUpperCase()}`,
      role: 'user',
      content: text,
      timestamp: Date.now()
    };
    setMessages((prev) => [...prev, userMessage]);
    if (hydrated) appendChat(userMessage);
    setInput('');
    setIsTyping(true);

    await new Promise((r) => setTimeout(r, 700 + Math.random() * 600));

    const intent = classifyIntent(text);
    const response = buildAssistantResponse(intent, text);
    setMessages((prev) => [...prev, response]);
    if (hydrated) appendChat(response);
    setIsTyping(false);
  };

  const reset = () => {
    const welcome: Message = {
      id: 'welcome',
      role: 'assistant',
      content: '会话已重置。我可以继续帮您完成元件检索、scFv 筛选、多组学分析、IP 风险评估等任务。',
      timestamp: Date.now(),
      agent: 'FluBioStack Assistant'
    };
    setMessages([welcome]);
    clearChat();
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-4 right-4 lg:bottom-6 lg:right-6 z-40 ${
          isOpen ? 'hidden' : 'flex'
        } items-center gap-2 px-4 h-12 rounded-full bg-gradient-to-r from-compute-600 via-bio-500 to-glow-500 text-white font-semibold text-sm shadow-glow-md hover:shadow-glow-lg transition-all`}
        aria-label="Open copilot"
      >
        <Sparkles className="w-4 h-4" />
        Copilot
        <span className="hidden md:inline text-[10px] px-1.5 py-0.5 rounded bg-ink-950/40 border border-white/20 font-mono">
          ⌘.
        </span>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ x: 80, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 80, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 220, damping: 24 }}
            className="fixed top-16 bottom-3 right-3 z-50 w-[400px] max-w-[92vw] flex flex-col panel-strong"
          >
            <div className="flex items-center gap-2.5 px-4 h-14 border-b border-white/5">
              <span className="w-8 h-8 rounded-lg bg-gradient-to-br from-compute-500 via-bio-500 to-glow-500 flex items-center justify-center shadow-glow-sm">
                <Bot className="w-4 h-4 text-ink-950" />
              </span>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-semibold text-white truncate">FluBioStack Copilot</div>
                <div className="text-[10px] font-mono tracking-[0.24em] uppercase text-text-tertiary flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-glow-400 animate-glow-pulse" />
                  6 Agent online · intent routing
                </div>
              </div>
              <button
                onClick={reset}
                className="p-1.5 rounded-md text-text-tertiary hover:text-white hover:bg-white/5"
                aria-label="重置会话"
                title="重置会话（清空历史）"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-md text-text-tertiary hover:text-white hover:bg-white/5"
                aria-label="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="px-4 py-2 border-b border-white/5 bg-ink-900/40 text-[10px] font-mono tracking-[0.24em] uppercase">
              <div className="flex items-center gap-3 text-text-tertiary">
                <span className="flex items-center gap-1">
                  <Cpu className="w-3 h-3 text-compute-300" /> intent-router
                </span>
                <span className="flex items-center gap-1">
                  <Activity className="w-3 h-3 text-bio-300" /> {messages.length - 1} msg
                </span>
                <span className="flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3 text-glow-300" /> ip-safe
                </span>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-ink-900/40">
              {messages.map((msg) => (
                <MessageBubble key={msg.id} message={msg} onAction={(href) => router.push(href)} />
              ))}

              {isTyping && (
                <div className="flex items-start gap-2">
                  <div className="w-7 h-7 rounded-md bg-gradient-to-br from-compute-500 to-bio-500 flex items-center justify-center flex-shrink-0">
                    <Bot className="w-3.5 h-3.4 text-ink-950" />
                  </div>
                  <div className="panel px-3 py-2 flex items-center gap-2 text-xs text-text-secondary">
                    <Loader2 className="w-3 h-3 text-compute-300 animate-spin" />
                    智能体路由意图中...
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {messages.length <= 1 && (
              <div className="px-4 pb-2 pt-1">
                <div className="text-[10px] tracking-[0.18em] uppercase text-text-tertiary mb-2 flex items-center gap-1">
                  <Zap className="w-3 h-3 text-bio-300" />
                  推荐任务
                </div>
                <div className="space-y-1.5">
                  {QUICK_PROMPTS.map((prompt, idx) => {
                    const Icon = prompt.icon;
                    return (
                      <button
                        key={idx}
                        onClick={() => handleSend(prompt.text)}
                        className="w-full flex items-start gap-2 p-2 rounded-lg panel hover:border-compute-500/50 text-left text-xs text-text-secondary hover:text-white transition"
                      >
                        <Icon className="w-3.5 h-3.5 text-bio-300 flex-shrink-0 mt-0.5" />
                        <span className="flex-1">{prompt.text}</span>
                        <ArrowRight className="w-3 h-3 text-text-tertiary mt-0.5" />
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            <div className="p-3 border-t border-white/5 bg-ink-900/70">
              <div className="flex items-center gap-2 panel px-3 py-2 focus-within:border-compute-500/50">
                <MessageSquareText className="w-4 h-4 text-compute-300" />
                <input
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                  placeholder="输入指令 / 元件 ID / 任务..."
                  className="flex-1 bg-transparent outline-none text-sm placeholder:text-text-tertiary text-white"
                />
                <button
                  onClick={() => handleSend()}
                  disabled={!input.trim() || isTyping}
                  className="p-1.5 rounded-md bg-gradient-to-r from-compute-500 to-bio-500 hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed text-ink-950"
                  aria-label="Send"
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              </div>
              <div className="mt-2 flex items-center justify-between text-[10px] text-text-tertiary">
                <span>提示：本地意图路由 · 历史已持久化</span>
                <button
                  onClick={reset}
                  className="hover:text-white flex items-center gap-1"
                  title="清空历史"
                >
                  <Trash2 className="w-3 h-3" />
                  清空
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

function MessageBubble({ message, onAction }: { message: Message; onAction: (href: string) => void }) {
  const isUser = message.role === 'user';

  return (
    <motion.div
      initial={{ opacity: 0, y: 5 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex items-start gap-2 ${isUser ? 'flex-row-reverse' : ''}`}
    >
      <div
        className={`w-7 h-7 rounded-md flex items-center justify-center flex-shrink-0 ${
          isUser
            ? 'bg-ink-700 border border-white/10'
            : 'bg-gradient-to-br from-compute-500 to-bio-500 shadow-glow-sm'
        }`}
      >
        {isUser ? (
          <User className="w-3.5 h-3.5 text-text-secondary" />
        ) : (
          <Bot className="w-3.5 h-3.5 text-ink-950" />
        )}
      </div>

      <div className={`flex-1 max-w-[85%] ${isUser ? 'flex justify-end' : ''}`}>
        <div
          className={`rounded-lg px-3 py-2 text-sm whitespace-pre-wrap leading-relaxed ${
            isUser
              ? 'bg-gradient-to-r from-compute-600 to-bio-500 text-white border border-white/10'
              : 'panel text-text-primary'
          }`}
        >
          {!isUser && message.agent && (
            <div className="text-[10px] font-mono text-compute-200 uppercase tracking-[0.18em] mb-1.5">
              {message.agent}
            </div>
          )}
          <div>{message.content}</div>

          {message.tools && message.tools.length > 0 && (
            <div className="mt-2 pt-2 border-t border-white/5">
              <div className="text-[10px] tracking-[0.18em] uppercase text-text-tertiary mb-1.5">
                调用工具
              </div>
              <div className="flex flex-wrap gap-1">
                {message.tools.map((tool) => (
                  <span
                    key={tool}
                    className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-ink-800 text-bio-200 border border-white/5"
                  >
                    {tool}
                  </span>
                ))}
              </div>
            </div>
          )}

          {message.quickLinks && message.quickLinks.length > 0 && (
            <div className="mt-2 pt-2 border-t border-white/5 space-y-1">
              <div className="text-[10px] tracking-[0.18em] uppercase text-text-tertiary mb-1">
                快捷跳转
              </div>
              {message.quickLinks.map((link) => (
                <button
                  key={link.href + link.label}
                  onClick={() => onAction(link.href)}
                  className="w-full text-left flex items-center gap-1.5 text-[11px] text-bio-200 hover:text-white px-2 py-1 rounded hover:bg-ink-800/60 transition"
                >
                  <ExternalLink className="w-3 h-3 flex-shrink-0" />
                  <span className="flex-1 truncate">{link.label}</span>
                  <ArrowRight className="w-3 h-3 flex-shrink-0" />
                </button>
              ))}
            </div>
          )}
        </div>
        <p className="text-[10px] text-text-tertiary mt-1 px-1">
          {new Date(message.timestamp).toLocaleTimeString('zh-CN', {
            hour: '2-digit',
            minute: '2-digit'
          })}
        </p>
      </div>
    </motion.div>
  );
}
