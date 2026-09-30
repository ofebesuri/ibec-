import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Login from './Login'
import BioScene from './BioScene'
import DeclarationForm from './components/DeclarationForm'
import DeclarationList from './components/DeclarationList'
import VerificationPanel from './components/VerificationPanel'
import ReportGenerator from './components/ReportGenerator'
import { App as CapacitorApp } from '@capacitor/app'
import {
  getDashboardStats,
  getProjects,
  getTeamMembers,
  getEvents,
  getNotifications,
  getUnreadCount,
  getFiles,
  getFileStats,
  getPatentStats,
  getUserStats,
  getUserSettings,
  getProfile,
  updateProfile,
  createProject,
  updateProject,
  createEvent,
  addTeamMember,
  removeTeamMember,
  markNotificationRead,
  uploadFile,
  deleteFile,
  recordAIUsage,
  getMonthlyStats,
  logout,
  getDeclarations,
  checkUserHasKeys,
  deleteUserKeys,
  getUserPublicKey,
  recoverUserKeys,
  removeStoredKeys
} from './api'
import { getMissingTables } from './lib/supabase'
import { getCozeAccessTokenWithUserId, getCozeAccessToken, getBotConfig, clearCozeTokenCache, getAnonymousUserId, isCozeModule } from './lib/coze-oauth'
import { getStoredUser } from './api'

// 类型定义
type ModuleData = {
  id: number
  name: string
  title: string
  icon: string
  color: string
  features: string[]
  description: string
  fullDescription: string
  usageGuide: string[]
  suitableScenarios: string[]
}

const MODULES: ModuleData[] = [
  {
    id: 1,
    name: '创新雷达',
    title: '技术前瞻与合规预警',
    icon: 'radar',
    color: '#00E5FF',
    features: ['多模态AI专利全景分析', '侵权风险初筛', '创新机会地图'],
    description: '利用多模态AI模型，支持基因序列、质谱图谱等生物数据与专利文献的智能比对',
    fullDescription: '创新雷达是BioGuardian的核心模块之一，利用先进的多模态AI技术，为合成生物学领域的研究者提供全方位的技术情报服务。支持基因序列分析、专利检索、侵权风险评估等功能。',
    usageGuide: ['输入您的技术关键词或上传基因序列文件', '系统自动进行专利检索和对比分析', '查看生成的创新机会地图和风险评估报告', '导出详细的分析报告用于决策支持'],
    suitableScenarios: ['研发初期技术调研', '竞品专利分析', '侵权风险排查', '成果申报前查新']
  },
  {
    id: 2,
    name: '数据锚点',
    title: '可信研发数据管理',
    icon: 'anchor',
    color: '#7C4DFF',
    features: ['区块链可信实验记录本', '数据关联与创新洞察', '司法可信存证'],
    description: '基于联盟链技术构建司法可信的电子实验记录本',
    fullDescription: '数据锚点是BioGuardian的区块链存证模块，采用SHA-256哈希算法确保每个数据文件的唯一性和不可篡改性。每次上传的文件都会生成唯一的区块链哈希值，可用于司法举证和知识产权保护。',
    usageGuide: ['上传实验数据文件（支持PDF、图片、Excel等格式）', '系统自动计算文件哈希值并加盖时间戳', '生成的数据存证可下载保存', '需要时可验证数据完整性和原始性'],
    suitableScenarios: ['实验记录存证留痕', '申报前数据固化', '合作研发数据溯源', '质量审计备查']
  },
  {
    id: 3,
    name: '策略魔方',
    title: '知识产权布局优化',
    icon: 'extension',
    color: '#FF4081',
    features: ['双轨策略模拟器', '全球化布局导航', 'AI撰稿助手'],
    description: '量化评估技术特性，动态模拟不同策略的长期收益与风险',
    fullDescription: '策略魔方为您提供知识产权布局的全方位解决方案。通过AI驱动的分析引擎，帮助您制定最优的知识产权保护策略。支持专利保护、商业秘密保护等多种方案模拟。',
    usageGuide: ['输入技术特性和保护需求', '选择期望的保护策略类型', '系统生成策略模拟结果和风险评估', '根据建议优化知识产权布局'],
    suitableScenarios: ['新技术保护方案规划', '专利与商业秘密选择', '出海专利布局策略', '竞争对手专利围堵应对']
  },
  {
    id: 4,
    name: '价值引擎',
    title: '成果转化与交易支持',
    icon: 'trending_up',
    color: '#00BFA5',
    features: ['IP价值AI动态评估', '合规交易支持', '资源智能匹配'],
    description: '融合专利强度、技术性能指标、市场容量等多重因子',
    fullDescription: '价值引擎是专业的知识产权价值评估工具，结合市场数据和技术指标，为您的知识产权资产提供科学的价值评估。支持动态估值、交易建议等功能。',
    usageGuide: ['选择要评估的知识产权资产', '填写相关技术参数和市场信息', '系统生成综合价值评估报告', '获取交易建议和资源匹配推荐'],
    suitableScenarios: ['专利转让许可前估值', '成果转化路径规划', '融资并购IP尽调', '专利池加入决策参考']
  },
  {
    id: 5,
    name: 'IP作战室',
    title: '资产监控与维权决策',
    icon: 'security',
    color: '#FFC107',
    features: ['IP资产驾驶舱', '7x24小时侵权监测', '维权策略模拟器'],
    description: '可视化集中管理全球知识产权状态',
    fullDescription: 'IP作战室是您知识产权资产的全方位管控中心，提供实时监控、风险预警和维权决策支持。支持全球专利监控、侵权检测等功能。',
    usageGuide: ['添加要监控的知识产权资产', '配置监控范围和告警规则', '查看实时监控数据和预警信息', '使用维权策略模拟器制定应对方案'],
    suitableScenarios: ['竞品专利动态监控', '疑似侵权目标追查', '专利年费到期提醒', '维权方案模拟决策']
  }
]

// 智能体引导内容配置
const BOT_GUIDES: Record<number, {
  welcome: string;
  capabilities: string[];
  exampleQuestions: string[];
  tips: string[];
}> = {
  // 创新雷达
  1: {
    welcome: '您好！我是创新雷达AI助手，专门帮助您进行专利检索和技术分析。',
    capabilities: [
      '🔍 专利文献智能检索与语义分析',
      '📊 技术全景图谱绘制与可视化',
      '⚠️ 侵权风险智能评估与预警',
      '💡 创新机会识别与建议',
      '🧬 基因序列/蛋白结构专利比对'
    ],
    exampleQuestions: [
      '"帮我搜索CRISPR基因编辑技术的最新专利"',
      '"分析这个技术方案是否有侵权风险"',
      '"给我讲讲什么是专利新颖性"',
      '"帮我对比这两篇专利的技术差异"',
      '"这个领域未来发展趋势是什么"'
    ],
    tips: [
      '💡 提问越具体，答案越精准',
      '📎 支持上传技术文档进行智能分析',
      '🔄 可以追问深入了解细节',
      '📝 重要结果可保存或导出'
    ]
  },
  // 策略魔方
  3: {
    welcome: '您好！我是策略魔方AI助手，专注于知识产权布局策略规划。',
    capabilities: [
      '📋 专利申请策略制定与优化',
      '🛡️ 专利规避设计方案',
      '🎯 技术分支路线图规划',
      '⚖️ 侵权诉讼策略分析',
      '💼 知识产权组合管理建议'
    ],
    exampleQuestions: [
      '"如何为我的技术选择最优专利保护策略"',
      '"帮我设计一个专利规避方案"',
      '"什么情况下需要申请发明专利vs实用新型"',
      '"给出专利布局的优化建议"',
      '"分析竞争对手的专利布局"'
    ],
    tips: [
      '💡 说明您的技术方案细节可获得更准确定位',
      '📊 提供行业背景有助于策略分析',
      '🎯 说明商业目标可获得针对性建议',
      '⚖️ 如有侵权纠纷，可提供具体案情分析'
    ]
  },
  // 价值引擎
  4: {
    welcome: '您好！我是价值引擎AI助手，为您提供专业的知识产权价值评估服务。',
    capabilities: [
      '💰 专利价值多维度综合评估',
      '📈 市场潜力与技术成熟度分析',
      '🤝 许可转让估值与交易建议',
      '📊 投资价值分析与风险提示',
      '🎯 成果转化路径规划'
    ],
    exampleQuestions: [
      '"评估这项专利大概值多少钱"',
      '"这项技术的市场前景如何"',
      '"给出专利许可的建议价格区间"',
      '"分析这项专利的投资价值"',
      '"帮我制定成果转化方案"'
    ],
    tips: [
      '💰 提供专利详细信息可获得更准确估值',
      '📈 结合市场数据可提升评估精度',
      '🤝 说明交易意向可获得针对性建议',
      '📊 定期评估有助于动态掌握价值变化'
    ]
  },
  // IP作战室
  5: {
    welcome: '您好！我是IP作战室AI助手，为您提供知识产权监控与维权支持。',
    capabilities: [
      '🛡️ 侵权监测与预警通知',
      '⚖️ 维权策略制定与模拟',
      '📊 竞争对手监控与分析',
      '🔔 专利状态跟踪与提醒',
      '📋 知识产权资产管理'
    ],
    exampleQuestions: [
      '"帮我监测竞争对手的专利动态"',
      '"发现疑似侵权应该怎么办"',
      '"如何制定维权方案"',
      '"我的专利到期了需要续费吗"',
      '"帮我分析行业侵权热点"'
    ],
    tips: [
      '🛡️ 添加监控对象可获得实时预警',
      '⚖️ 维权需要准备充分的证据材料',
      '📊 定期监控有助于及时发现风险',
      '🔔 记得设置专利年费提醒'
    ]
  }
}

// ========== Coze 聊天组件 (OAuth认证+会话隔离) ==========
// 跳转到扣子官方网页版的函数移到组件外部备用（暂不使用）
const openCozeWebVersionForModule = (moduleId: number) => {
  const cozeWebUrls: Record<number, string> = {
    1: 'https://www.coze.cn/store/bot/7606000324104683574',
    3: 'https://www.coze.cn/store/bot/7606399531299356682',
    4: 'https://www.coze.cn/store/bot/7606240448894107702',
    5: 'https://www.coze.cn/store/bot/7605897070553284648'
  }
  const url = cozeWebUrls[moduleId]
  if (url) {
    window.open(url, '_blank')
  }
}

const CozeChat: React.FC<{ moduleId: number; onClose: () => void }> = ({ moduleId, onClose }) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const clientRef = useRef<any>(null)
  const sessionNameRef = useRef<string>('')
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [sdkReady, setSdkReady] = useState(false)
  const [sessionName, setSessionName] = useState<string>('')
  const botConfig = getBotConfig(moduleId)

  // 获取用户ID用于会话隔离
  const getUserId = (): string | undefined => {
    const user = getStoredUser()
    return user ? String(user.id) : undefined
  }

  // 初始化 sessionName
  useEffect(() => {
    const userId = getUserId()
    const session = userId || getAnonymousUserId()
    setSessionName(session)
    console.log(`[CozeChat] Session初始化: ${session}, 来源: ${userId ? '登录用户' : '匿名用户'}`)
  }, [])

  // 初始化 Coze SDK with OAuth
  useEffect(() => {
    if (!botConfig) return

    const initChat = async () => {
      setIsLoading(true)
      setError(null)

      try {
        // 检查 Coze SDK 是否加载
        if (!(window as any).CozeWebSDK) {
          setError('Coze SDK 未加载，请检查网络连接')
          setIsLoading(false)
          return
        }

        // 清理之前的实例
        if (containerRef.current) {
          containerRef.current.innerHTML = ''
        }

        // 使用 OAuth 获取 Access Token（会话隔离：同一用户使用相同的sessionName）
        const userId = getUserId()
        console.log(`[CozeChat] 正在获取OAuth Token, Module: ${moduleId}, User: ${userId || 'anonymous'}, Session: ${sessionName}`)

        const { accessToken, sessionName: newSessionName } = await getCozeAccessTokenWithUserId(moduleId, userId)
        setSessionName(newSessionName)
        sessionNameRef.current = newSessionName
        console.log(`[CozeChat] OAuth Token获取成功, Session: ${newSessionName}`)

        // 获取用户信息（确保 userInfo.id 与 sessionName 一致）
        const user = getStoredUser()
        const userInfo = user ? {
          id: String(user.id),
          nickname: user.username || '用户',
          url: ''
        } : {
          id: getAnonymousUserId(),
          nickname: '访客',
          url: ''
        }

        // 创建 Coze WebChatClient
        const client = new (window as any).CozeWebSDK.WebChatClient({
          config: {
            bot_id: botConfig.botId,
          },
          auth: {
            type: 'token',
            token: accessToken,
            onRefreshToken: async () => {
              // Token 刷新时使用 ref 中的 sessionName，确保获取最新值
              console.log(`[CozeChat] 正在刷新 OAuth Token, Session: ${sessionNameRef.current}`)
              return await getCozeAccessToken(moduleId, sessionNameRef.current)
            }
          },
          userInfo,
          ui: {
            base: {
              icon: '',
              layout: 'mobile',
              zIndex: 1000,
              lang: 'zh-CN'
            },
            asstBtn: {
              isNeed: false
            },
            footer: {
              isShow: false
            },
            header: {
              isShow: true,
              isNeedClose: true
            },
            chatBot: {
              title: botConfig.name,
              uploadable: true,
              width: '100%',
              height: '100%',
              el: containerRef.current,
              isNeedAddNewConversation: true,
              isNeedQuote: true,
              isNeedFunctionCallMessage: true,
              onHide: () => {
                console.log('[CozeChat] SDK 触发 onHide，准备返回')
                onClose()
              },
              onShow: () => {
                console.log('[CozeChat] SDK 触发 onShow')
              }
            }
          }
        })

        client.showChatBot()
        clientRef.current = client
        setSdkReady(true)
        console.log(`[CozeChat] SDK初始化成功`)

        // 添加消息事件监听
        client.on('conversation.message.completed', (data: any) => {
          console.log('[CozeChat] 消息完成:', data);
        });

        client.on('conversation.message.in_progress', (data: any) => {
          console.log('[CozeChat] 消息进行中:', data);
        });

        client.on('conversation.message.failed', (error: any) => {
          console.error('[CozeChat] 消息失败:', error);
        });

        client.on('error', (error: any) => {
          console.error('[CozeChat] SDK错误:', error);
        });
      } catch (err: any) {
        console.error('[CozeChat] 初始化失败:', err)
        setError(err.message || 'AI服务初始化失败')
      } finally {
        setIsLoading(false)
      }
    }

    initChat()

    // 组件卸载时销毁 SDK 实例
    return () => {
      if (clientRef.current) {
        try {
          clientRef.current.destroy()
          console.log('[CozeChat] SDK 实例已销毁')
        } catch (e) {
          console.warn('[CozeChat] SDK 销毁时出错:', e)
        }
        clientRef.current = null
      }
      if (containerRef.current) {
        containerRef.current.innerHTML = ''
      }
    }
  }, [moduleId])

  // 数据锚点不支持AI对话
  if (moduleId === 2) {
    return null
  }

  if (!botConfig) {
    return null
  }

  return (
    <div
      ref={containerRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        backgroundColor: '#0f172a',
        zIndex: 9999,
        overflow: 'hidden'
      }}
    />
  )
}

// ========== 各功能模块页面组件 ==========

// 1. 工作台页面
const DashboardPage: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const [stats, setStats] = useState([
    { label: '在研项目', value: '0', icon: 'folder', color: '#00E5FF' },
    { label: '持有专利', value: '0', icon: 'lightbulb', color: '#7C4DFF' },
    { label: '高风险警告', value: '0', icon: 'warning', color: '#FF4081' },
    { label: '重点资产', value: '0', icon: 'star', color: '#FFD700' },
    { label: '研技术路线', value: '0', icon: 'route', color: '#00BFA5' }
  ])
  const [recentProjects, setRecentProjects] = useState<{name: string; progress: number; status: string}[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        const projectData = await getProjects()
        const patentData = await getPatentStats()
        const fileData = await getFiles()

        // 计算统计数据
        const highRiskCount = projectData.filter((p: any) => p.riskLevel === '高' || p.riskLevel === '极高').length
        const keyAssetCount = projectData.filter((p: any) => p.budget > 5000).length
        const techRouteCount = projectData.length

        setStats([
          { label: '在研项目', value: String(projectData.length || 0), icon: 'folder', color: '#00E5FF' },
          { label: '持有专利', value: String(patentData.total || 0), icon: 'lightbulb', color: '#7C4DFF' },
          { label: '高风险警告', value: String(highRiskCount), icon: 'warning', color: '#FF4081' },
          { label: '重点资产', value: String(keyAssetCount), icon: 'star', color: '#FFD700' },
          { label: '研技术路线', value: String(techRouteCount), icon: 'route', color: '#00BFA5' }
        ])

        // 获取最近的项目
        if (projectData && projectData.length > 0) {
          setRecentProjects(projectData.slice(0, 3).map((p: any) => ({
            name: p.name,
            progress: p.progress || 0,
            status: p.status
          })))
        }
      } catch (error) {
        console.error('加载仪表盘数据失败:', error)
      } finally {
        setLoading(false)
      }
    }

    loadDashboardData()
  }, [])

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 bg-slate-950 overflow-y-auto">
      <div className="min-h-full">
        {/* 顶部导航 */}
        <div className="sticky top-0 z-10 bg-slate-950/95 backdrop-blur-xl border-b border-white/10 p-4" style={{ background: 'linear-gradient(135deg, rgba(0,229,255,0.15), rgba(0,229,255,0.05))' }}>
          <div className="flex items-center justify-between max-w-4xl mx-auto">
            <div className="flex items-center gap-4">
              <button onClick={onBack} className="w-10 h-10 rounded-xl bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors shrink-0">
                <span className="material-icons text-white">arrow_back</span>
              </button>
              <div className="w-10 h-10 rounded-xl bg-cyan-500/20 flex items-center justify-center shrink-0">
                <span className="material-icons text-cyan-300">dashboard</span>
              </div>
              <div>
                <h2 className="text-lg font-bold text-white">工作台</h2>
                <p className="text-xs text-cyan-200/70">总览您的知识产权资产</p>
              </div>
            </div>
          </div>
        </div>

        {/* 内容区域 */}
        <div className="p-4 max-w-4xl mx-auto space-y-4">
          {/* 统计卡片 */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {stats.map((stat, idx) => (
              <motion.div key={idx} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.1 }} className="p-4 rounded-2xl bg-white/5 border border-white/10">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-2" style={{ backgroundColor: stat.color + '20' }}>
                  <span className="material-icons" style={{ color: stat.color }}>{stat.icon}</span>
                </div>
                <p className="text-2xl font-bold text-white">{stat.value}</p>
                <p className="text-xs text-blue-200/60">{stat.label}</p>
              </motion.div>
            ))}
          </div>

          {/* 最近项目 */}
          <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
            <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
              <span className="material-icons text-cyan-300">Folder</span>
              最近项目
            </h3>
            <div className="space-y-3">
              {recentProjects.map((project, idx) => (
                <div key={idx} className="p-3 rounded-xl bg-slate-900/50">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-white">{project.name}</span>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-green-500/20 text-green-300">{project.status}</span>
                  </div>
                  <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                    <motion.div initial={{ width: 0 }} animate={{ width: `${project.progress}%` }} transition={{ duration: 0.8, delay: 0.2 }} className="h-full bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

// 2. 项目管理页面
const ProjectsPage: React.FC<{ onBack: () => void; onProjectCreated?: () => void }> = ({ onBack, onProjectCreated }) => {
  const [projects, setProjects] = useState<{
    id: number; name: string; type: string; status: string;
    progress: number; date: string; projectCode: string; manager: string;
    budget: number; startDate: string; endDate: string; riskLevel: string;
    complianceStatus: string; regulatoryFramework: string;
  }[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingProject, setEditingProject] = useState<any>(null)

  const [formData, setFormData] = useState({
    name: '', type: '研究项目', projectCode: '', manager: '',
    budget: 0, startDate: '', endDate: '', riskLevel: '低',
    complianceStatus: '待审核', regulatoryFramework: '', description: ''
  })

  const riskLevelOptions = ['低', '中', '高', '极高']
  const complianceStatusOptions = ['待审核', '审核中', '已通过', '需整改', '未通过']
  const typeOptions = ['研究项目', '合规项目', '专利项目', '临床试验', '产品开发', '其他']

  useEffect(() => {
    const loadProjects = async () => {
      try {
        const data = await getProjects()
        if (data && Array.isArray(data)) {
          setProjects(data.map((p: any) => ({
            id: p.id,
            name: p.name || '',
            type: p.type || '研究项目',
            status: p.status || '进行中',
            progress: p.progress || 0,
            date: p.date ? new Date(p.date).toLocaleDateString('zh-CN') : new Date().toLocaleDateString('zh-CN'),
            projectCode: p.projectCode || '',
            manager: p.manager || '',
            budget: p.budget || 0,
            startDate: p.startDate || '',
            endDate: p.endDate || '',
            riskLevel: p.riskLevel || '低',
            complianceStatus: p.complianceStatus || '待审核',
            regulatoryFramework: p.regulatoryFramework || ''
          })))
        }
      } catch (error) {
        console.error('加载项目失败:', error)
      } finally {
        setLoading(false)
      }
    }
    loadProjects()
  }, [])

  const resetForm = () => {
    setFormData({
      name: '', type: '研究项目', projectCode: '', manager: '',
      budget: 0, startDate: '', endDate: '', riskLevel: '低',
      complianceStatus: '待审核', regulatoryFramework: '', description: ''
    })
    setEditingProject(null)
  }

  const handleCreateProject = async () => {
    if (!formData.name.trim()) {
      alert('请输入项目名称')
      return
    }
    if (!formData.type) {
      alert('请选择项目类型')
      return
    }
    if (!formData.projectCode.trim()) {
      alert('请输入项目编号')
      return
    }
    if (!formData.manager.trim()) {
      alert('请输入项目负责人')
      return
    }
    if (!formData.riskLevel) {
      alert('请选择风险等级')
      return
    }
    if (formData.budget === 0 || !formData.budget) {
      alert('请输入预算金额')
      return
    }
    try {
      const newProject = await createProject({
        name: formData.name,
        type: formData.type,
        description: formData.description,
        projectCode: formData.projectCode,
        manager: formData.manager,
        budget: formData.budget,
        startDate: formData.startDate,
        endDate: formData.endDate,
        riskLevel: formData.riskLevel,
        complianceStatus: formData.complianceStatus,
        regulatoryFramework: formData.regulatoryFramework
      })
      setProjects([{
        id: newProject.id,
        name: formData.name,
        type: formData.type,
        status: '进行中',
        progress: 0,
        date: new Date().toLocaleDateString('zh-CN'),
        projectCode: formData.projectCode,
        manager: formData.manager,
        budget: formData.budget,
        startDate: formData.startDate,
        endDate: formData.endDate,
        riskLevel: formData.riskLevel,
        complianceStatus: formData.complianceStatus,
        regulatoryFramework: formData.regulatoryFramework
      }, ...projects])
      setShowForm(false)
      resetForm()
      alert('项目创建成功！')
      // 创建项目后返回仪表盘以刷新数据
      if (onProjectCreated) {
        onProjectCreated()
      }
      onBack()
    } catch (error: any) {
      console.error('创建项目失败:', error)
      alert('创建失败: ' + (error?.message || '请重试'))
    }
  }

  const handleEditProject = (project: any) => {
    setEditingProject(project)
    setFormData({
      name: project.name,
      type: project.type,
      projectCode: project.projectCode || '',
      manager: project.manager || '',
      budget: project.budget || 0,
      startDate: project.startDate || '',
      endDate: project.endDate || '',
      riskLevel: project.riskLevel || '低',
      complianceStatus: project.complianceStatus || '待审核',
      regulatoryFramework: project.regulatoryFramework || '',
      description: ''
    })
    setShowForm(true)
  }

  const handleUpdateProject = async () => {
    if (!editingProject) return
    try {
      await updateProject(editingProject.id, {
        name: formData.name,
        type: formData.type,
        projectCode: formData.projectCode,
        manager: formData.manager,
        budget: formData.budget,
        startDate: formData.startDate,
        endDate: formData.endDate,
        riskLevel: formData.riskLevel,
        complianceStatus: formData.complianceStatus,
        regulatoryFramework: formData.regulatoryFramework
      })
      setProjects(projects.map(p =>
        p.id === editingProject.id ? { ...p, ...formData } : p
      ))
      setShowForm(false)
      resetForm()
      alert('项目更新成功！')
    } catch (error: any) {
      console.error('更新项目失败:', error)
      alert('更新失败: ' + (error?.message || '请重试'))
    }
  }

  const getRiskColor = (level: string) => {
    switch (level) {
      case '极高': return 'bg-red-500/20 text-red-300 border-red-400/50'
      case '高': return 'bg-orange-500/20 text-orange-300 border-orange-400/50'
      case '中': return 'bg-yellow-500/20 text-yellow-300 border-yellow-400/50'
      default: return 'bg-green-500/20 text-green-300 border-green-400/50'
    }
  }

  const getComplianceColor = (status: string) => {
    switch (status) {
      case '已通过': return 'bg-green-500/20 text-green-300'
      case '审核中': return 'bg-blue-500/20 text-blue-300'
      case '需整改': return 'bg-orange-500/20 text-orange-300'
      case '未通过': return 'bg-red-500/20 text-red-300'
      default: return 'bg-gray-500/20 text-gray-300'
    }
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 bg-slate-950 overflow-y-auto">
      <div className="min-h-full">
        <div className="sticky top-0 z-10 bg-slate-950/95 backdrop-blur-xl border-b border-white/10 p-4" style={{ background: 'linear-gradient(135deg, rgba(139,92,246,0.15), rgba(139,92,246,0.05))' }}>
          <div className="flex items-center justify-between max-w-4xl mx-auto">
            <div className="flex items-center gap-4">
              <button onClick={onBack} className="w-10 h-10 rounded-xl bg-white/10 hover:bg-white/20 flex items-center justify-center shrink-0">
                <span className="material-icons text-white">arrow_back</span>
              </button>
              <div className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center shrink-0">
                <span className="material-icons text-purple-300">folder</span>
              </div>
              <div>
                <h2 className="text-lg font-bold text-white">项目管理</h2>
                <p className="text-xs text-purple-200/70">合规监控与进度管理</p>
              </div>
            </div>
            <button onClick={() => { resetForm(); setShowForm(true) }} className="px-4 py-2 rounded-xl bg-purple-500/20 hover:bg-purple-500/30 border border-purple-400/50 text-purple-100 text-sm flex items-center gap-2">
              <span className="material-icons text-sm">add</span>
              新建项目
            </button>
          </div>
        </div>

        {/* 项目列表 */}
        <div className="p-4 max-w-4xl mx-auto space-y-3">
          {loading ? (
            <div className="text-center py-12 text-blue-200/60">加载中...</div>
          ) : projects.length === 0 ? (
            <div className="text-center py-12 text-blue-200/60">暂无项目，点击上方按钮创建</div>
          ) : (
            projects.map((project) => (
              <motion.div key={project.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="p-4 rounded-2xl bg-white/5 border border-white/10 hover:border-purple-400/30 transition-colors cursor-pointer" onClick={() => handleEditProject(project)}>
                <div className="flex justify-between items-start mb-3">
                  <div className="flex-1">
                    <h3 className="text-sm font-semibold text-white">{project.name}</h3>
                    <p className="text-xs text-blue-200/60 mt-1">
                      {project.projectCode && <span className="mr-2">编号: {project.projectCode}</span>}
                      {project.manager && <span className="mr-2">负责人: {project.manager}</span>}
                      <span>{project.type}</span>
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <span className={`text-xs px-2 py-1 rounded-full ${getRiskColor(project.riskLevel)}`}>风险: {project.riskLevel}</span>
                    <span className={`text-xs px-2 py-1 rounded-full ${getComplianceColor(project.complianceStatus)}`}>{project.complianceStatus}</span>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs text-blue-200/60 mb-3">
                  <div><span className="material-icons text-xs mr-1">event</span>{project.startDate || '未设置'} ~ {project.endDate || '未设置'}</div>
                  <div><span className="material-icons text-xs mr-1">attach_money</span>预算: {project.budget ? project.budget.toLocaleString() : 0} 元</div>
                  {project.regulatoryFramework && <div className="col-span-2"><span className="material-icons text-xs mr-1">gavel</span>适用法规: {project.regulatoryFramework}</div>}
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex-1 h-2 bg-slate-800 rounded-full overflow-hidden">
                    <motion.div initial={{ width: 0 }} animate={{ width: `${project.progress}%` }} transition={{ duration: 0.5 }} className="h-full bg-gradient-to-r from-purple-400 to-pink-500 rounded-full" />
                  </div>
                  <span className="text-xs text-purple-200">{project.progress}%</span>
                </div>
              </motion.div>
            ))
          )}
        </div>
      </div>

      {/* 项目表单弹窗 */}
      <AnimatePresence>
        {showForm && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[60] overflow-y-auto">
            <div className="min-h-full flex items-center justify-center p-4">
              <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-xl" onClick={() => setShowForm(false)} />
              <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} className="relative w-full max-w-lg bg-slate-900/95 backdrop-blur-2xl rounded-3xl border border-white/10 overflow-hidden shadow-2xl max-h-[90vh] overflow-y-auto">
                <div className="p-5 border-b border-white/10" style={{ background: 'linear-gradient(135deg, rgba(139,92,246,0.2), rgba(139,92,246,0.05))' }}>
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-bold text-white">{editingProject ? '编辑项目' : '新建项目'}</h3>
                    <button onClick={() => setShowForm(false)} className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center">
                      <span className="material-icons text-white text-sm">close</span>
                    </button>
                  </div>
                </div>

                <div className="p-5 space-y-4">
                  {/* 基本信息 */}
                  <div className="space-y-3">
                    <h4 className="text-sm font-semibold text-purple-200 flex items-center gap-2"><span className="material-icons text-xs">info</span>基本信息</h4>
                    <div>
                      <label className="text-xs text-blue-200/70 block mb-1">项目名称 *</label>
                      <input type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-white/10 text-white text-sm focus:border-purple-400 focus:outline-none" placeholder="请输入项目名称" />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs text-blue-200/70 block mb-1">项目类型 *</label>
                        <select value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})} className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-white/10 text-white text-sm focus:border-purple-400 focus:outline-none">
                          {typeOptions.map(t => <option key={t} value={t}>{t}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="text-xs text-blue-200/70 block mb-1">项目编号 *</label>
                        <input type="text" value={formData.projectCode} onChange={e => setFormData({...formData, projectCode: e.target.value})} className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-white/10 text-white text-sm focus:border-purple-400 focus:outline-none" placeholder="如: PRJ-2026-001" />
                      </div>
                    </div>
                    <div>
                      <label className="text-xs text-blue-200/70 block mb-1">项目负责人 *</label>
                      <input type="text" value={formData.manager} onChange={e => setFormData({...formData, manager: e.target.value})} className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-white/10 text-white text-sm focus:border-purple-400 focus:outline-none" placeholder="请输入负责人姓名" />
                    </div>
                  </div>

                  {/* 时间与预算 */}
                  <div className="space-y-3">
                    <h4 className="text-sm font-semibold text-purple-200 flex items-center gap-2"><span className="material-icons text-xs">schedule</span>时间与预算</h4>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs text-blue-200/70 block mb-1">开始日期</label>
                        <input type="date" value={formData.startDate} onChange={e => setFormData({...formData, startDate: e.target.value})} className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-white/10 text-white text-sm focus:border-purple-400 focus:outline-none" />
                      </div>
                      <div>
                        <label className="text-xs text-blue-200/70 block mb-1">结束日期</label>
                        <input type="date" value={formData.endDate} onChange={e => setFormData({...formData, endDate: e.target.value})} className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-white/10 text-white text-sm focus:border-purple-400 focus:outline-none" />
                      </div>
                    </div>
                    <div>
                      <label className="text-xs text-blue-200/70 block mb-1">预算金额 (元) *</label>
                      <input type="number" value={formData.budget} onChange={e => setFormData({...formData, budget: parseFloat(e.target.value) || 0})} className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-white/10 text-white text-sm focus:border-purple-400 focus:outline-none" placeholder="请输入预算金额" />
                    </div>
                  </div>

                  {/* 合规信息 */}
                  <div className="space-y-3">
                    <h4 className="text-sm font-semibold text-purple-200 flex items-center gap-2"><span className="material-icons text-xs">verified_user</span>合规信息</h4>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs text-blue-200/70 block mb-1">风险等级 *</label>
                        <select value={formData.riskLevel} onChange={e => setFormData({...formData, riskLevel: e.target.value})} className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-white/10 text-white text-sm focus:border-purple-400 focus:outline-none">
                          {riskLevelOptions.map(r => <option key={r} value={r}>{r}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="text-xs text-blue-200/70 block mb-1">合规状态</label>
                        <select value={formData.complianceStatus} onChange={e => setFormData({...formData, complianceStatus: e.target.value})} className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-white/10 text-white text-sm focus:border-purple-400 focus:outline-none">
                          {complianceStatusOptions.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                      </div>
                    </div>
                    <div>
                      <label className="text-xs text-blue-200/70 block mb-1">适用法规框架</label>
                      <input type="text" value={formData.regulatoryFramework} onChange={e => setFormData({...formData, regulatoryFramework: e.target.value})} className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-white/10 text-white text-sm focus:border-purple-400 focus:outline-none" placeholder="如: GMP, GCP, GLP, FDA 21 CFR Part 11" />
                    </div>
                  </div>
                </div>

                <div className="p-5 border-t border-white/10 flex gap-3">
                  <button onClick={() => setShowForm(false)} className="flex-1 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white text-sm font-medium">取消</button>
                  <button onClick={editingProject ? handleUpdateProject : handleCreateProject} className="flex-1 py-3 rounded-xl bg-purple-500 hover:bg-purple-600 text-white text-sm font-medium" style={{ background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)' }}>
                    {editingProject ? '保存修改' : '创建项目'}
                  </button>
                </div>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

// 3. 团队协作页面
const TeamsPage: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const [members, setMembers] = useState<{id: number; name: string; role: string; avatar: string; status: string; email: string; phone: string}[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingMember, setEditingMember] = useState<any>(null)

  const [formData, setFormData] = useState({
    name: '', role: '成员', email: '', phone: ''
  })

  const roleOptions = ['项目负责人', '技术主管', '研发人员', '合规专员', '财务人员', '普通成员', '顾问', '其他']

  useEffect(() => {
    const loadMembers = async () => {
      try {
        const data = await getTeamMembers()
        if (data && Array.isArray(data)) {
          setMembers(data.map((m: any) => ({
            id: m.id,
            name: m.name || '',
            role: m.role || '成员',
            avatar: 'person',
            status: m.status || 'offline',
            email: m.email || '',
            phone: m.phone || ''
          })))
        }
      } catch (error) {
        console.error('加载团队成员失败:', error)
      } finally {
        setLoading(false)
      }
    }
    loadMembers()
  }, [])

  const resetForm = () => {
    setFormData({ name: '', role: '成员', email: '', phone: '' })
    setEditingMember(null)
  }

  const handleAddMember = async () => {
    if (!formData.name.trim()) {
      alert('请输入成员姓名')
      return
    }
    try {
      const newMember = await addTeamMember({
        name: formData.name,
        role: formData.role,
        email: formData.email,
        phone: formData.phone
      })
      setMembers([...members, {
        id: newMember.id,
        name: formData.name,
        role: formData.role,
        avatar: 'person',
        status: 'offline',
        email: formData.email,
        phone: formData.phone
      }])
      setShowForm(false)
      resetForm()
      alert('成员添加成功！')
    } catch (error: any) {
      console.error('添加成员失败:', error)
      alert('添加失败: ' + (error?.message || '请重试'))
    }
  }

  const handleDeleteMember = async (id: number) => {
    if (!confirm('确定要删除该成员吗？')) return
    try {
      await removeTeamMember(id)
      setMembers(members.filter(m => m.id !== id))
      alert('成员已删除')
    } catch (error: any) {
      console.error('删除成员失败:', error)
      alert('删除失败: ' + (error?.message || '请重试'))
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return 'bg-green-400'
      case 'away': return 'bg-amber-400'
      default: return 'bg-slate-500'
    }
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 bg-slate-950 overflow-y-auto">
      <div className="min-h-full">
        <div className="sticky top-0 z-10 bg-slate-950/95 backdrop-blur-xl border-b border-white/10 p-4" style={{ background: 'linear-gradient(135deg, rgba(236,72,153,0.15), rgba(236,72,153,0.05))' }}>
          <div className="flex items-center justify-between max-w-4xl mx-auto">
            <div className="flex items-center gap-4">
              <button onClick={onBack} className="w-10 h-10 rounded-xl bg-white/10 hover:bg-white/20 flex items-center justify-center shrink-0">
                <span className="material-icons text-white">arrow_back</span>
              </button>
              <div className="w-10 h-10 rounded-xl bg-pink-500/20 flex items-center justify-center shrink-0">
                <span className="material-icons text-pink-300">groups</span>
              </div>
              <div>
                <h2 className="text-lg font-bold text-white">团队协作</h2>
                <p className="text-xs text-pink-200/70">团队成员与权限管理</p>
              </div>
            </div>
            <button onClick={() => { resetForm(); setShowForm(true) }} className="px-4 py-2 rounded-xl bg-pink-500/20 hover:bg-pink-500/30 border border-pink-400/50 text-pink-100 text-sm flex items-center gap-2">
              <span className="material-icons text-sm">person_add</span>
              添加成员
            </button>
          </div>
        </div>

        <div className="p-4 max-w-4xl mx-auto space-y-3">
          {loading ? (
            <div className="text-center py-12 text-blue-200/60">加载中...</div>
          ) : members.length === 0 ? (
            <div className="text-center py-12 text-blue-200/60">暂无团队成员，点击上方按钮添加</div>
          ) : (
            members.map((member, idx) => (
              <motion.div key={idx} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: idx * 0.1 }} className="flex items-center gap-4 p-4 rounded-2xl bg-white/5 border border-white/10">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-pink-400 to-purple-500 flex items-center justify-center">
                  <span className="material-icons text-white">{member.avatar}</span>
                </div>
                <div className="flex-1">
                  <h3 className="text-sm font-semibold text-white">{member.name}</h3>
                  <p className="text-xs text-blue-200/60">{member.role}</p>
                  {(member.email || member.phone) && (
                    <p className="text-xs text-blue-200/50 mt-1">
                      {member.email && <span className="mr-2">{member.email}</span>}
                      {member.phone && <span>{member.phone}</span>}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <span className={`w-3 h-3 rounded-full ${getStatusColor(member.status)}`} />
                  <button onClick={() => handleDeleteMember(member.id)} className="w-8 h-8 rounded-lg bg-red-500/20 hover:bg-red-500/40 flex items-center justify-center">
                    <span className="material-icons text-red-300 text-sm">delete</span>
                  </button>
                </div>
              </motion.div>
            ))
          )}
        </div>
      </div>

      {/* 添加成员表单弹窗 */}
      <AnimatePresence>
        {showForm && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[60] overflow-y-auto">
            <div className="min-h-full flex items-center justify-center p-4">
              <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-xl" onClick={() => setShowForm(false)} />
              <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} className="relative w-full max-w-md bg-slate-900/95 backdrop-blur-2xl rounded-3xl border border-white/10 overflow-hidden shadow-2xl">
                <div className="p-5 border-b border-white/10" style={{ background: 'linear-gradient(135deg, rgba(236,72,153,0.2), rgba(236,72,153,0.05))' }}>
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-bold text-white">添加团队成员</h3>
                    <button onClick={() => setShowForm(false)} className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center">
                      <span className="material-icons text-white text-sm">close</span>
                    </button>
                  </div>
                </div>

                <div className="p-5 space-y-4">
                  <div>
                    <label className="text-xs text-blue-200/70 block mb-1">姓名 *</label>
                    <input type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-white/10 text-white text-sm focus:border-pink-400 focus:outline-none" placeholder="请输入成员姓名" />
                  </div>
                  <div>
                    <label className="text-xs text-blue-200/70 block mb-1">职位</label>
                    <select value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})} className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-white/10 text-white text-sm focus:border-pink-400 focus:outline-none">
                      {roleOptions.map(r => <option key={r} value={r}>{r}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs text-blue-200/70 block mb-1">邮箱</label>
                    <input type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-white/10 text-white text-sm focus:border-pink-400 focus:outline-none" placeholder="请输入邮箱地址" />
                  </div>
                  <div>
                    <label className="text-xs text-blue-200/70 block mb-1">电话</label>
                    <input type="tel" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-white/10 text-white text-sm focus:border-pink-400 focus:outline-none" placeholder="请输入电话号码" />
                  </div>
                </div>

                <div className="p-5 border-t border-white/10 flex gap-3">
                  <button onClick={() => setShowForm(false)} className="flex-1 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white text-sm font-medium">取消</button>
                  <button onClick={handleAddMember} className="flex-1 py-3 rounded-xl bg-pink-500 hover:bg-pink-600 text-white text-sm font-medium" style={{ background: 'linear-gradient(135deg, #ec4899, #db2777)' }}>
                    添加成员
                  </button>
                </div>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

// 4. 日程安排页面
const CalendarPage: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const [events, setEvents] = useState<{title: string; time: string; type: string; color: string; id?: number}[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadEvents = async () => {
      try {
        const data = await getEvents()
        if (data && Array.isArray(data)) {
          const colorMap: Record<string, string> = { '会议': '#00E5FF', '讨论': '#7C4DFF', '截止': '#FF4081', '提醒': '#FFC107' }
          setEvents(data.map((e: any) => ({
            id: e.id,
            title: e.title,
            time: e.time,
            type: e.type || '提醒',
            color: colorMap[e.type] || '#FFC107'
          })))
        }
      } catch (error) {
        console.error('加载日程失败:', error)
      } finally {
        setLoading(false)
      }
    }
    loadEvents()
  }, [])

  const handleAddEvent = async () => {
    const title = prompt('请输入日程标题:')
    if (!title) return
    const time = prompt('请输入时间 (如 09:00):') || '09:00'
    const type = prompt('请输入类型 (会议/讨论/截止/提醒):') || '提醒'
    try {
      const newEvent = await createEvent({ title, time, type, eventDate: new Date().toISOString().split('T')[0] })
      const colorMap: Record<string, string> = { '会议': '#00E5FF', '讨论': '#7C4DFF', '截止': '#FF4081', '提醒': '#FFC107' }
      setEvents([...events, { id: newEvent.id, title, time, type, color: colorMap[type] || '#FFC107' }])
      alert('日程创建成功！')
    } catch (error: any) {
      console.error('创建日程失败:', error)
      alert('创建失败: ' + (error?.message || '请重试'))
    }
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 bg-slate-950 overflow-y-auto">
      <div className="min-h-full">
        <div className="sticky top-0 z-10 bg-slate-950/95 backdrop-blur-xl border-b border-white/10 p-4" style={{ background: 'linear-gradient(135deg, rgba(245,158,11,0.15), rgba(245,158,11,0.05))' }}>
          <div className="flex items-center justify-between max-w-4xl mx-auto">
            <div className="flex items-center gap-4">
              <button onClick={onBack} className="w-10 h-10 rounded-xl bg-white/10 hover:bg-white/20 flex items-center justify-center shrink-0">
                <span className="material-icons text-white">arrow_back</span>
              </button>
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center shrink-0">
                <span className="material-icons text-amber-300">calendar_month</span>
              </div>
              <div>
                <h2 className="text-lg font-bold text-white">日程安排</h2>
                <p className="text-xs text-amber-200/70">重要会议与截止日期</p>
              </div>
            </div>
            <button onClick={handleAddEvent} className="px-4 py-2 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-400/50 text-amber-100 text-sm flex items-center gap-2">
              <span className="material-icons text-sm">add</span>
              添加日程
            </button>
          </div>
        </div>

        <div className="p-4 max-w-4xl mx-auto">
          {(() => {
            const now = new Date();
            const beijingTime = new Date(now.getTime() + 8 * 60 * 60 * 1000);
            const day = beijingTime.getDate();
            const month = beijingTime.getMonth() + 1;
            const year = beijingTime.getFullYear();
            return (
              <div className="text-center mb-6">
                <p className="text-3xl font-bold text-white">{day}</p>
                <p className="text-sm text-amber-200/70">{year}年{month}月</p>
              </div>
            );
          })()}
          <div className="space-y-3">
            {events.map((event, idx) => (
              <motion.div key={idx} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.1 }} className="flex items-center gap-4 p-4 rounded-2xl bg-white/5 border border-white/10">
                <div className="w-16 text-center">
                  <p className="text-lg font-bold text-white">{event.time}</p>
                </div>
                <div className="w-1 h-12 rounded-full" style={{ backgroundColor: event.color }} />
                <div className="flex-1">
                  <h3 className="text-sm font-semibold text-white">{event.title}</h3>
                  <p className="text-xs text-blue-200/60">{event.type}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  )
}

// 5. 消息中心页面
const NotificationsPage: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const [notifications, setNotifications] = useState<{title: string; content: string; time: string; read: boolean; icon: string; color: string; id: number}[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadNotifications = async () => {
      try {
        const data = await getNotifications()
        if (data && Array.isArray(data)) {
          const iconMap: Record<string, string> = { 'success': 'check_circle', 'warning': 'warning', 'info': 'info', 'error': 'error' }
          const colorMap: Record<string, string> = { 'success': '#10b981', 'warning': '#ef4444', 'info': '#3b82f6', 'error': '#8b5cf6' }
          setNotifications(data.map((n: any) => ({
            id: n.id,
            title: n.title,
            content: n.content,
            time: new Date(n.createdAt).toLocaleString('zh-CN'),
            read: n.read || false,
            icon: iconMap[n.type] || 'notifications',
            color: colorMap[n.type] || '#3b82f6'
          })))
        }
      } catch (error) {
        console.error('加载通知失败:', error)
      } finally {
        setLoading(false)
      }
    }
    loadNotifications()
  }, [])

  const handleMarkAsRead = async (id: number) => {
    try {
      await markNotificationRead(id)
      setNotifications(notifications.map(n => n.id === id ? { ...n, read: true } : n))
    } catch (error) {
      console.error('标记已读失败:', error)
    }
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 bg-slate-950 overflow-y-auto">
      <div className="min-h-full">
        <div className="sticky top-0 z-10 bg-slate-950/95 backdrop-blur-xl border-b border-white/10 p-4" style={{ background: 'linear-gradient(135deg, rgba(16,185,129,0.15), rgba(16,185,129,0.05))' }}>
          <div className="flex items-center gap-4 max-w-4xl mx-auto">
            <button onClick={onBack} className="w-10 h-10 rounded-xl bg-white/10 hover:bg-white/20 flex items-center justify-center shrink-0">
              <span className="material-icons text-white">arrow_back</span>
            </button>
            <div className="w-10 h-10 rounded-xl bg-green-500/20 flex items-center justify-center shrink-0">
              <span className="material-icons text-green-300">notifications</span>
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">消息中心</h2>
              <p className="text-xs text-green-200/70">系统通知与待办事项</p>
            </div>
          </div>
        </div>

        <div className="p-4 max-w-4xl mx-auto space-y-2">
          {notifications.map((notif, idx) => (
            <motion.div key={idx} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: idx * 0.1 }} className={`p-4 rounded-2xl border transition-colors ${notif.read ? 'bg-white/5 border-white/10' : 'bg-white/10 border-green-400/30'}`}>
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: notif.color + '20' }}>
                  <span className="material-icons" style={{ color: notif.color }}>{notif.icon}</span>
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-start">
                    <h3 className="text-sm font-semibold text-white">{notif.title}</h3>
                    {!notif.read && <span className="w-2 h-2 rounded-full bg-green-400" />}
                  </div>
                  <p className="text-xs text-blue-200/60 mt-1">{notif.content}</p>
                  <p className="text-xs text-blue-200/40 mt-2">{notif.time}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  )
}

// 6. 云端存储页面
const CloudPage: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const [files, setFiles] = useState<{name: string; size: string; type: string; date: string; id: number}[]>([])
  const [totalSize, setTotalSize] = useState(0)
  const [loading, setLoading] = useState(true)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const loadFiles = async () => {
      try {
        const data = await getFiles()
        if (data && Array.isArray(data)) {
          let sizeSum = 0
          const typeIconMap: Record<string, string> = { 'PDF': 'picture_as_pdf', 'Word': 'description', 'Excel': 'table_chart', '图片': 'image' }
          setFiles(data.map((f: any) => {
            sizeSum += Number(f.size) || 0
            const ext = f.originalName?.split('.').pop()?.toUpperCase() || 'FILE'
            return {
              id: f.id,
              name: f.originalName,
              size: formatSize(Number(f.size) || 0),
              type: ext,
              date: new Date(f.createdAt).toLocaleDateString('zh-CN')
            }
          }))
          setTotalSize(sizeSum)
        }
      } catch (error) {
        console.error('加载文件失败:', error)
      } finally {
        setLoading(false)
      }
    }
    loadFiles()
  }, [])

  const formatSize = (bytes: number): string => {
    if (bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const handleUploadClick = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return
    
    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i]
        const result = await uploadFile(file)
        
        // 记录使用统计
        await recordAIUsage(2, 'file_upload')
        
        setFiles(prev => [{
          id: result.id,
          name: result.originalName,
          size: formatSize(file.size),
          type: file.name.split('.').pop()?.toUpperCase() || 'FILE',
          date: new Date().toLocaleDateString('zh-CN')
        }, ...prev])
        setTotalSize(prev => prev + file.size)
      }
      alert('文件上传成功！')
    } catch (error: any) {
      console.error('上传文件失败:', error)
      alert('上传失败: ' + (error?.message || '请重试'))
    }
    
    // 清空input以便重复选择同一文件
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 bg-slate-950 overflow-y-auto">
      <div className="min-h-full">
        <div className="sticky top-0 z-10 bg-slate-950/95 backdrop-blur-xl border-b border-white/10 p-4" style={{ background: 'linear-gradient(135deg, rgba(59,130,246,0.15), rgba(59,130,246,0.05))' }}>
          <div className="flex items-center justify-between max-w-4xl mx-auto">
            <div className="flex items-center gap-4">
              <button onClick={onBack} className="w-10 h-10 rounded-xl bg-white/10 hover:bg-white/20 flex items-center justify-center shrink-0">
                <span className="material-icons text-white">arrow_back</span>
              </button>
              <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center shrink-0">
                <span className="material-icons text-blue-300">cloud</span>
              </div>
              <div>
                <h2 className="text-lg font-bold text-white">云端存储</h2>
                <p className="text-xs text-blue-200/70">文件同步与管理</p>
              </div>
            </div>
            <button onClick={handleUploadClick} className="px-4 py-2 rounded-xl bg-blue-500/20 hover:bg-blue-500/30 border border-blue-400/50 text-blue-100 text-sm flex items-center gap-2">
              <span className="material-icons text-sm">cloud_upload</span>
              上传文件
            </button>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              className="hidden"
              onChange={handleFileChange}
            />
          </div>
        </div>

        <div className="p-4 max-w-4xl mx-auto">
          <div className="mb-4 p-4 rounded-2xl bg-blue-500/10 border border-blue-400/30">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-blue-200">存储空间</span>
              <span className="text-sm text-white">{formatSize(totalSize)} / 10 GB</span>
            </div>
            <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-blue-400 to-cyan-500 rounded-full" style={{ width: `${Math.min((totalSize / (10 * 1024 * 1024 * 1024)) * 100, 100)}%` }} />
            </div>
          </div>
          <div className="space-y-2">
            {files.map((file, idx) => (
              <motion.div key={idx} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.1 }} className="flex items-center gap-4 p-4 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors">
                <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center">
                  <span className="material-icons text-blue-300">description</span>
                </div>
                <div className="flex-1">
                  <h3 className="text-sm font-semibold text-white">{file.name}</h3>
                  <p className="text-xs text-blue-200/60">{file.size} · {file.date}</p>
                </div>
                <button className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center">
                  <span className="material-icons text-white/60 text-sm">more_vert</span>
                </button>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  )
}

// 7. 数据分析页面
const AnalyticsPage: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const [stats, setStats] = useState([
    { label: '本月检索', value: '0', icon: 'search', color: '#00E5FF' },
    { label: '本月存证', value: '0', icon: 'storage', color: '#7C4DFF' },
    { label: '新增专利', value: '0', icon: 'lightbulb', color: '#FF4081' },
    { label: '风险预警', value: '0', icon: 'warning', color: '#FFC107' }
  ])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadStats = async () => {
      try {
        // 使用本月统计数据（真实数据库统计）
        const monthlyData = await getMonthlyStats()
        setStats([
          { label: '本月检索', value: String(monthlyData.monthSearches || 0), icon: 'search', color: '#00E5FF' },
          { label: '本月存证', value: String(monthlyData.monthEvidence || 0), icon: 'storage', color: '#7C4DFF' },
          { label: '新增专利', value: String(monthlyData.monthPatents || 0), icon: 'lightbulb', color: '#FF4081' },
          { label: '风险预警', value: String(monthlyData.riskWarnings || 0), icon: 'warning', color: '#FFC107' }
        ])
      } catch (error) {
        console.error('加载统计数据失败:', error)
      } finally {
        setLoading(false)
      }
    }
    loadStats()
  }, [])

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 bg-slate-950 overflow-y-auto">
      <div className="min-h-full">
        <div className="sticky top-0 z-10 bg-slate-950/95 backdrop-blur-xl border-b border-white/10 p-4" style={{ background: 'linear-gradient(135deg, rgba(6,182,212,0.15), rgba(6,182,212,0.05))' }}>
          <div className="flex items-center gap-4 max-w-4xl mx-auto">
            <button onClick={onBack} className="w-10 h-10 rounded-xl bg-white/10 hover:bg-white/20 flex items-center justify-center shrink-0">
              <span className="material-icons text-white">arrow_back</span>
            </button>
            <div className="w-10 h-10 rounded-xl bg-cyan-500/20 flex items-center justify-center shrink-0">
              <span className="material-icons text-cyan-300">analytics</span>
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">数据分析</h2>
              <p className="text-xs text-cyan-200/70">使用统计与报告</p>
            </div>
          </div>
        </div>

        <div className="p-4 max-w-4xl mx-auto">
          <div className="grid grid-cols-2 gap-4 mb-6">
            {stats.map((item, idx) => (
              <div key={idx} className="p-4 rounded-2xl bg-white/5 border border-white/10">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-2" style={{ backgroundColor: item.color + '20' }}>
                  <span className="material-icons" style={{ color: item.color }}>{item.icon}</span>
                </div>
                <p className="text-2xl font-bold text-white">{loading ? '...' : item.value}</p>
                <p className="text-xs text-blue-200/60">{item.label}</p>
              </div>
            ))}
          </div>
          <div className="p-6 rounded-2xl bg-white/5 border border-white/10 text-center">
            <span className="material-icons text-cyan-300 text-5xl mb-3">show_chart</span>
            <p className="text-sm text-blue-200/70">详细分析报告生成中...</p>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

// 8. 安全设置页面
const SecurityPage: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const [settings, setSettings] = useState([
    { title: '登录密码', desc: '已设置密码，定期更换保护账户安全', icon: 'lock', enabled: true },
    { title: '手机绑定', desc: '用于接收验证码（暂未开放）', icon: 'smartphone', enabled: false, notOpen: true },
    { title: '邮箱验证', desc: '用于接收重要通知（暂未开放）', icon: 'email', enabled: false, notOpen: true },
    { title: '两步验证', desc: '额外安全验证（暂未开放）', icon: 'security', enabled: false, notOpen: true }
  ])
  const [loading, setLoading] = useState(true)
  const [showNotOpenModal, setShowNotOpenModal] = useState(false)
  const [notOpenTitle, setNotOpenTitle] = useState('')

  useEffect(() => {
    const loadSettings = async () => {
      try {
        // 从用户资料获取真实绑定状态
        const profile = await getProfile()
        const hasPhone = !!(profile?.phone && profile.phone.length === 11)
        const hasEmail = !!(profile?.email && profile.email.includes('@'))
        
        setSettings([
          { title: '登录密码', desc: '已设置密码，定期更换保护账户安全', icon: 'lock', enabled: true },
          { title: '手机绑定', desc: '用于接收验证码（暂未开放）', icon: 'smartphone', enabled: hasPhone, notOpen: !hasPhone },
          { title: '邮箱验证', desc: '用于接收重要通知（暂未开放）', icon: 'email', enabled: hasEmail, notOpen: !hasEmail },
          { title: '两步验证', desc: '额外安全验证（暂未开放）', icon: 'security', enabled: false, notOpen: true }
        ])
      } catch (error) {
        console.error('加载安全设置失败:', error)
      } finally {
        setLoading(false)
      }
    }
    loadSettings()
  }, [])

  // 显示暂未开放提示
  const handleShowNotOpen = (title: string) => {
    setNotOpenTitle(title)
    setShowNotOpenModal(true)
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 bg-slate-950 overflow-y-auto">
      {/* 暂未开放提示弹窗 */}
      {showNotOpenModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50" onClick={() => setShowNotOpenModal(false)}>
          <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="bg-slate-900 rounded-2xl p-6 max-w-sm mx-4 border border-white/20 shadow-xl" onClick={e => e.stopPropagation()}>
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-amber-500/20 flex items-center justify-center">
                <span className="material-icons text-3xl text-amber-400">info</span>
              </div>
              <h3 className="text-lg font-bold text-white mb-2">{notOpenTitle}</h3>
              <p className="text-sm text-blue-200/80 mb-6">该功能暂未开放，敬请期待！</p>
              <button onClick={() => setShowNotOpenModal(false)} className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-white font-semibold">
                我知道了
              </button>
            </div>
          </motion.div>
        </div>
      )}
      <div className="min-h-full">
        <div className="sticky top-0 z-10 bg-slate-950/95 backdrop-blur-xl border-b border-white/10 p-4" style={{ background: 'linear-gradient(135deg, rgba(239,68,68,0.15), rgba(239,68,68,0.05))' }}>
          <div className="flex items-center gap-4 max-w-4xl mx-auto">
            <button onClick={onBack} className="w-10 h-10 rounded-xl bg-white/10 hover:bg-white/20 flex items-center justify-center shrink-0">
              <span className="material-icons text-white">arrow_back</span>
            </button>
            <div className="w-10 h-10 rounded-xl bg-red-500/20 flex items-center justify-center shrink-0">
              <span className="material-icons text-red-300">security</span>
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">安全设置</h2>
              <p className="text-xs text-red-200/70">账户与数据安全</p>
            </div>
          </div>
        </div>

        <div className="p-4 max-w-4xl mx-auto space-y-2">
          {settings.map((setting, idx) => (
            <motion.div key={idx} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: idx * 0.1 }} className="flex items-center gap-4 p-4 rounded-2xl bg-white/5 border border-white/10">
              <div className="w-10 h-10 rounded-xl bg-red-500/20 flex items-center justify-center">
                <span className="material-icons text-red-300">{setting.icon}</span>
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-semibold text-white">{setting.title}</h3>
                <p className="text-xs text-blue-200/60">{setting.desc}</p>
              </div>
              {setting.notOpen ? (
                <button onClick={() => handleShowNotOpen(setting.title)} className="px-3 py-1.5 rounded-full bg-amber-500/20 text-amber-300 text-xs hover:bg-amber-500/30 transition-colors">
                  暂未开放
                </button>
              ) : (
                <button className={`w-12 h-6 rounded-full transition-colors ${setting.enabled ? 'bg-green-500' : 'bg-slate-700'}`}>
                  <motion.div animate={{ x: setting.enabled ? 24 : 2 }} className="w-5 h-5 bg-white rounded-full shadow" />
                </button>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  )
}

// 9. 帮助中心页面
const HelpCenterPage: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const [faqs] = useState([
    { q: '如何创建新项目？', a: '在项目管理页面点击"新建项目"按钮，填写项目信息即可创建。' },
    { q: '如何进行专利检索？', a: '使用"创新雷达"模块，输入关键词或上传技术文档即可进行分析。' },
    { q: '数据锚点安全吗？', a: '采用SHA-256加密算法，生成的哈希值具有唯一性和不可篡改性。' },
    { q: '如何联系客服？', a: '点击右下角"帮助"按钮，选择在线客服或发送邮件联系我们。' }
  ])

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 bg-slate-950 overflow-y-auto">
      <div className="min-h-full">
        <div className="sticky top-0 z-10 bg-slate-950/95 backdrop-blur-xl border-b border-white/10 p-4" style={{ background: 'linear-gradient(135deg, rgba(20,184,166,0.15), rgba(20,184,166,0.05))' }}>
          <div className="flex items-center justify-between max-w-4xl mx-auto">
            <div className="flex items-center gap-4">
              <button onClick={onBack} className="w-10 h-10 rounded-xl bg-white/10 hover:bg-white/20 flex items-center justify-center shrink-0">
                <span className="material-icons text-white">arrow_back</span>
              </button>
              <div className="w-10 h-10 rounded-xl bg-teal-500/20 flex items-center justify-center shrink-0">
                <span className="material-icons text-teal-300">help</span>
              </div>
              <div>
                <h2 className="text-lg font-bold text-white">帮助中心</h2>
                <p className="text-xs text-teal-200/70">使用指南与常见问题</p>
              </div>
            </div>
          </div>
        </div>

        <div className="p-4 max-w-4xl mx-auto space-y-3">
          {faqs.map((faq, idx) => (
            <motion.div key={idx} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.1 }} className="p-4 rounded-2xl bg-white/5 border border-white/10">
              <details className="group">
                <summary className="flex items-center justify-between cursor-pointer list-none">
                  <span className="text-sm font-semibold text-white">{faq.q}</span>
                  <span className="material-icons text-white/40 group-open:rotate-180">expand_more</span>
                </summary>
                <p className="text-xs text-blue-200/70 mt-3 border-t border-white/10 pt-3">{faq.a}</p>
              </details>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  )
}

// 10. 关于我们页面
const AboutPage: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 bg-slate-950 overflow-y-auto">
      <div className="min-h-full">
        <div className="sticky top-0 z-10 bg-slate-950/95 backdrop-blur-xl border-b border-white/10 p-4" style={{ background: 'linear-gradient(135deg, rgba(99,102,241,0.15), rgba(99,102,241,0.05))' }}>
          <div className="flex items-center gap-4 max-w-4xl mx-auto">
            <button onClick={onBack} className="w-10 h-10 rounded-xl bg-white/10 hover:bg-white/20 flex items-center justify-center shrink-0">
              <span className="material-icons text-white">arrow_back</span>
            </button>
            <div className="w-10 h-10 rounded-xl bg-indigo-500/20 flex items-center justify-center shrink-0">
              <span className="material-icons text-indigo-300">info</span>
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">关于我们</h2>
              <p className="text-xs text-indigo-200/70">版本信息与联系方式</p>
            </div>
          </div>
        </div>

        <div className="p-4 max-w-4xl mx-auto">
          <div className="text-center py-8">
            <div className="w-24 h-24 mx-auto mb-4 rounded-3xl bg-gradient-to-br from-cyan-400 via-purple-500 to-indigo-500 flex items-center justify-center shadow-lg">
              <span className="material-icons text-white text-4xl">hub</span>
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">BioGuardian</h2>
            <p className="text-sm text-indigo-200/70 mb-4">版本 1.0.0</p>
            <p className="text-xs text-blue-200/60 max-w-xs mx-auto">IP全生命周期智能守护平台，让知识产权管理更简单、更高效</p>
          </div>

          <div className="space-y-3 mt-8">
            {[
              { icon: 'email', label: '邮箱', value: '932717281@qq.com' },
              { icon: 'phone', label: '电话', value: '13692485646' },
              { icon: 'language', label: '官网', value: 'www.bioguardian.com' },
              { icon: 'location_on', label: '地址', value: '湘潭大学' }
            ].map((item, idx) => (
              <div key={idx} className="flex items-center gap-4 p-4 rounded-2xl bg-white/5 border border-white/10">
                <div className="w-10 h-10 rounded-xl bg-indigo-500/20 flex items-center justify-center">
                  <span className="material-icons text-indigo-300">{item.icon}</span>
                </div>
                <div>
                  <p className="text-xs text-blue-200/60">{item.label}</p>
                  <p className="text-sm text-white">{item.value}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  )
}

// ========== 菜单中心面板 ==========
const MenuPanel: React.FC<{ onClose: () => void; onNavigate: (page: string) => void }> = ({ onClose, onNavigate }) => {
  const [searchTerm, setSearchTerm] = useState('')

  const menuItems = [
    { id: 'dashboard', icon: 'dashboard', label: '工作台', desc: '总览所有功能模块', color: '#00E5FF' },
    { id: 'projects', icon: 'folder', label: '项目管理', desc: '管理您的研究项目', color: '#8b5cf6' },
    { id: 'teams', icon: 'groups', label: '团队协作', desc: '团队成员与权限管理', color: '#ec4899' },
    { id: 'calendar', icon: 'calendar_month', label: '日程安排', desc: '重要会议与截止日期', color: '#f59e0b' },
    { id: 'notifications', icon: 'notifications', label: '消息中心', desc: '系统通知与待办事项', color: '#10b981' },
    { id: 'cloud', icon: 'cloud', label: '云端存储', desc: '文件同步与管理', color: '#3b82f6' },
    { id: 'analytics', icon: 'analytics', label: '数据分析', desc: '使用统计与报告', color: '#06b6d4' },
    { id: 'security', icon: 'security', label: '安全设置', desc: '账户与数据安全', color: '#ef4444' },
    { id: 'help', icon: 'help', label: '帮助中心', desc: '使用指南与常见问题', color: '#14b8a6' },
    { id: 'about', icon: 'info', label: '关于我们', desc: '版本信息与联系方式', color: '#6366f1' }
  ]

  const filteredItems = menuItems.filter(item => 
    item.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.desc.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleItemClick = (item: typeof menuItems[0]) => {
    onNavigate(item.id)
    onClose()
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: 100 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 100 }}
      className="fixed inset-y-0 right-0 w-full sm:w-[480px] bg-slate-950/98 backdrop-blur-xl border-l border-white/10 z-50 flex flex-col shadow-2xl"
    >
      <div className="flex items-center justify-between p-5 border-b border-white/10" style={{ background: 'linear-gradient(135deg, rgba(139,92,246,0.15), rgba(236,72,153,0.1))' }}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-400 to-pink-500 flex items-center justify-center shadow-lg shadow-purple-500/30">
            <span className="material-icons text-white">menu</span>
          </div>
          <div>
            <h2 className="text-lg font-semibold text-white">菜单中心</h2>
            <p className="text-xs text-blue-200/70">快速导航与功能入口</p>
          </div>
        </div>
        <button onClick={onClose} className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors">
          <span className="material-icons text-white/70 hover:text-white">close</span>
        </button>
      </div>

      <div className="p-4 border-b border-white/10">
        <div className="relative">
          <span className="material-icons absolute left-4 top-1/2 -translate-y-1/2 text-white/40">search</span>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="搜索功能菜单..."
            className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-400/20 transition-all text-sm"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        <div className="grid grid-cols-2 gap-3">
          {filteredItems.map((item, idx) => (
            <motion.button
              key={item.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.03 }}
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleItemClick(item)}
              className="text-left p-4 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-purple-400/40 transition-all group relative overflow-hidden"
            >
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity" style={{ background: `linear-gradient(135deg, ${item.color}10, transparent)` }} />
              <div className="relative z-10">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-3 transition-all group-hover:scale-110" style={{ backgroundColor: item.color + '20' }}>
                  <span className="material-icons" style={{ color: item.color }}>{item.icon}</span>
                </div>
                <h3 className="text-sm font-semibold text-white mb-1">{item.label}</h3>
                <p className="text-xs text-blue-200/60 line-clamp-2">{item.desc}</p>
              </div>
            </motion.button>
          ))}
        </div>

        {filteredItems.length === 0 && (
          <div className="text-center py-12">
            <span className="material-icons text-white/30 text-5xl mb-3">search_off</span>
            <p className="text-blue-200/60">未找到相关菜单</p>
          </div>
        )}
      </div>

      <div className="p-4 border-t border-white/10" style={{ background: 'linear-gradient(180deg, transparent, rgba(139,92,246,0.1))' }}>
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold text-purple-200/80 uppercase tracking-wider flex items-center gap-2">
            <span className="material-icons text-sm">flash_on</span>快捷操作
          </span>
        </div>
        <div className="flex gap-2">
          <button onClick={() => { onNavigate('projects'); onClose(); }} className="flex-1 py-2.5 px-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs text-blue-100 flex items-center justify-center gap-1.5 transition-colors hover:scale-105">
            <span className="material-icons text-sm">add</span>
            新建项目
          </button>
          <button onClick={() => { onNavigate('cloud'); onClose(); }} className="flex-1 py-2.5 px-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs text-blue-100 flex items-center justify-center gap-1.5 transition-colors hover:scale-105">
            <span className="material-icons text-sm">upload_file</span>
            上传文件
          </button>
          <button onClick={() => alert('扫码登录功能暂未开放，敬请期待！')} className="flex-1 py-2.5 px-3 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-xs text-amber-300 flex items-center justify-center gap-1.5 transition-colors">
            <span className="material-icons text-sm">qr_code</span>
            扫码登录
          </button>
        </div>
      </div>
    </motion.div>
  )
}

// ========== 个人信息相关页面 ==========

// 编辑资料页面
const EditProfilePage: React.FC<{ onBack: () => void; onLogout: () => void }> = ({ onBack, onLogout }) => {
  const [userData, setUserData] = useState({
    username: '',
    company: '',
    position: '',
    email: '',
    phone: '',
    bio: ''
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const profile = await getProfile()
        setUserData({
          username: profile.username || '',
          company: profile.company || '',
          position: profile.position || '',
          email: profile.email || '',
          phone: profile.phone || '',
          bio: profile.bio || ''
        })
      } catch (error) {
        console.error('加载用户资料失败:', error)
      } finally {
        setLoading(false)
      }
    }
    loadProfile()
  }, [])

  const handleSave = async () => {
    try {
      const result = await updateProfile(userData)
      alert('保存成功！')
      onBack()
    } catch (error: any) {
      console.error('保存失败:', error)
      alert('保存失败: ' + (error?.message || '请重试'))
    }
  }

  const updateField = (field: string, value: string) => {
    setUserData({ ...userData, [field]: value })
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 bg-slate-950 overflow-y-auto">
      <div className="min-h-full">
        <div className="sticky top-0 z-10 bg-slate-950/95 backdrop-blur-xl border-b border-white/10 p-4" style={{ background: 'linear-gradient(135deg, rgba(6,182,212,0.15), rgba(139,92,246,0.05))' }}>
          <div className="flex items-center gap-4 max-w-4xl mx-auto">
            <button onClick={onBack} className="w-10 h-10 rounded-xl bg-white/10 hover:bg-white/20 flex items-center justify-center shrink-0">
              <span className="material-icons text-white">arrow_back</span>
            </button>
            <div className="w-10 h-10 rounded-xl bg-cyan-500/20 flex items-center justify-center shrink-0">
              <span className="material-icons text-cyan-300">person</span>
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">编辑资料</h2>
              <p className="text-xs text-cyan-200/70">修改您的个人信息</p>
            </div>
          </div>
        </div>

        <div className="p-4 max-w-4xl mx-auto space-y-4">
          <div className="text-center py-6">
            <div className="w-24 h-24 mx-auto mb-3 rounded-full bg-gradient-to-br from-blue-400 via-purple-500 to-cyan-400 flex items-center justify-center shadow-lg">
              <span className="material-icons text-white text-4xl">person</span>
            </div>
            <button className="text-sm text-cyan-400">更换头像</button>
          </div>

          {loading ? (
            <div className="text-center py-4 text-blue-200/60">加载中...</div>
          ) : (
            <>
              {[
                { label: '姓名', field: 'username', value: userData.username, icon: 'person' },
                { label: '公司', field: 'company', value: userData.company, icon: 'business' },
                { label: '职位', field: 'position', value: userData.position, icon: 'work' },
                { label: '邮箱', field: 'email', value: userData.email, icon: 'email' },
                { label: '手机', field: 'phone', value: userData.phone, icon: 'phone' }
              ].map((field, idx) => (
                <div key={idx} className="p-4 rounded-2xl bg-white/5 border border-white/10">
                  <label className="text-xs text-blue-200/60 mb-2 block">{field.label}</label>
                  <div className="flex items-center gap-3">
                    <span className="material-icons text-white/40">{field.icon}</span>
                    <input 
                      type="text" 
                      value={field.value} 
                      onChange={(e) => updateField(field.field, e.target.value)}
                      className="flex-1 bg-transparent text-white text-sm focus:outline-none" 
                    />
                  </div>
                </div>
              ))}

              <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
                <label className="text-xs text-blue-200/60 mb-2 block">个人简介</label>
                <textarea 
                  value={userData.bio} 
                  onChange={(e) => updateField('bio', e.target.value)}
                  rows={3} 
                  className="w-full bg-transparent text-white text-sm focus:outline-none resize-none" 
                />
              </div>
            </>
          )}

          <button onClick={handleSave} className="w-full py-4 rounded-xl bg-gradient-to-r from-cyan-500 to-purple-500 text-white font-semibold">保存修改</button>
          
          <button 
            onClick={() => {
              if (confirm('确定要退出登录吗？')) {
                logout()
                // 退出登录后返回登录界面
                onLogout()
              }
            }} 
            className="w-full py-4 mt-3 rounded-xl bg-red-500/20 hover:bg-red-500/30 border border-red-400/50 text-red-100 font-semibold flex items-center justify-center gap-2"
          >
            <span className="material-icons text-sm">logout</span>
            退出登录
          </button>
        </div>
      </div>
    </motion.div>
  )
}

// 账户设置页面
const AccountSettingsPage: React.FC<{ onBack: () => void; onLogout: () => void }> = ({ onBack, onLogout }) => {
  const [settings, setSettings] = useState([
    { icon: 'lock', title: '修改密码', desc: '定期更换密码保护账户安全', color: '#ef4444' },
    { icon: 'smartphone', title: '绑定手机', desc: '用于接收验证码', color: '#10b981' },
    { icon: 'email', title: '绑定邮箱', desc: '用于接收重要通知', color: '#3b82f6' },
    { icon: 'security', title: '两步验证', desc: '额外安全验证', color: '#f59e0b' },
    { icon: 'notifications', title: '通知设置', desc: '管理推送通知', color: '#8b5cf6' },
    { icon: 'language', title: '语言设置', desc: '选择界面语言', color: '#06b6d4' }
  ])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const userSettings = await getUserSettings()
        setSettings([
          { icon: 'lock', title: '修改密码', desc: '定期更换密码保护账户安全', color: '#ef4444' },
          { icon: 'smartphone', title: '绑定手机', desc: userSettings.hasPhone ? '已绑定' : '用于接收验证码', color: '#10b981' },
          { icon: 'email', title: '绑定邮箱', desc: userSettings.hasEmail ? '已绑定' : '用于接收重要通知', color: '#3b82f6' },
          { icon: 'security', title: '两步验证', desc: userSettings.twoFactorEnabled ? '已开启' : '额外安全验证', color: '#f59e0b' },
          { icon: 'notifications', title: '通知设置', desc: '管理推送通知', color: '#8b5cf6' },
          { icon: 'language', title: '语言设置', desc: '选择界面语言', color: '#06b6d4' }
        ])
      } catch (error) {
        console.error('加载设置失败:', error)
      } finally {
        setLoading(false)
      }
    }
    loadSettings()
  }, [])

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 bg-slate-950 overflow-y-auto">
      <div className="min-h-full">
        <div className="sticky top-0 z-10 bg-slate-950/95 backdrop-blur-xl border-b border-white/10 p-4" style={{ background: 'linear-gradient(135deg, rgba(139,92,246,0.15), rgba(236,72,153,0.05))' }}>
          <div className="flex items-center gap-4 max-w-4xl mx-auto">
            <button onClick={onBack} className="w-10 h-10 rounded-xl bg-white/10 hover:bg-white/20 flex items-center justify-center shrink-0">
              <span className="material-icons text-white">arrow_back</span>
            </button>
            <div className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center shrink-0">
              <span className="material-icons text-purple-300">settings</span>
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">账户设置</h2>
              <p className="text-xs text-purple-200/70">管理您的账户信息</p>
            </div>
          </div>
        </div>

        <div className="p-4 max-w-4xl mx-auto space-y-3">
          {[
            { icon: 'lock', title: '修改密码', desc: '定期更换密码保护账户安全', color: '#ef4444' },
            { icon: 'smartphone', title: '绑定手机', desc: '用于接收验证码', color: '#10b981' },
            { icon: 'email', title: '绑定邮箱', desc: '用于接收重要通知', color: '#3b82f6' },
            { icon: 'security', title: '两步验证', desc: '额外安全验证', color: '#f59e0b' },
            { icon: 'notifications', title: '通知设置', desc: '管理推送通知', color: '#8b5cf6' },
            { icon: 'language', title: '语言设置', desc: '选择界面语言', color: '#06b6d4' }
          ].map((item, idx) => (
            <motion.div key={idx} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: idx * 0.1 }} className="flex items-center gap-4 p-4 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors cursor-pointer">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: item.color + '20' }}>
                <span className="material-icons" style={{ color: item.color }}>{item.icon}</span>
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-semibold text-white">{item.title}</h3>
                <p className="text-xs text-blue-200/60">{item.desc}</p>
              </div>
              <span className="material-icons text-white/40">chevron_right</span>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  )
}

// 隐私政策页面
const PrivacyPage: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 bg-slate-950 overflow-y-auto">
      <div className="min-h-full">
        <div className="sticky top-0 z-10 bg-slate-950/95 backdrop-blur-xl border-b border-white/10 p-4">
          <div className="flex items-center gap-4 max-w-4xl mx-auto">
            <button onClick={onBack} className="w-10 h-10 rounded-xl bg-white/10 hover:bg-white/20 flex items-center justify-center shrink-0">
              <span className="material-icons text-white">arrow_back</span>
            </button>
            <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center shrink-0">
              <span className="material-icons text-blue-300">policy</span>
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">隐私政策</h2>
              <p className="text-xs text-blue-200/70">了解我们如何保护您的数据</p>
            </div>
          </div>
        </div>

        <div className="p-4 max-w-4xl mx-auto">
          <div className="p-6 rounded-2xl bg-white/5 border border-white/10 space-y-4">
            <p className="text-sm text-blue-100/80 leading-relaxed">
              BioGuardian高度重视用户隐私保护。我们收集的信息仅用于提供和改进我们的服务。您有权随时访问、更正或删除您的个人数据。
            </p>
            <p className="text-sm text-blue-100/80 leading-relaxed">
              我们采用行业标准的加密技术保护您的数据安全，包括SSL传输加密、数据存储加密等。所有个人数据均存储在符合ISO27001标准的服务器上。
            </p>
            <p className="text-sm text-blue-100/80 leading-relaxed">
              如有任何隐私相关问题，请联系我们的隐私团队：privacy@bioguardian.com
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

// ========== 功能介绍页面组件 ==========
// ========== 功能介绍页面组件 ==========
const ModuleIntro: React.FC<{ module: any; onEnter: () => void; onBack: () => void }> = ({ module, onEnter, onBack }) => {
  const [activeTab, setActiveTab] = useState<'intro' | 'usage'>('intro')

  if (!module) return null

  // 模块对应的AI能力描述
  const aiCapabilities: Record<number, { title: string; desc: string }> = {
    1: { title: '多模态智能分析', desc: '融合深度学习与专利知识图谱，提供基因序列、分子结构等生物数据的智能检索与侵权风险评估' },
    2: { title: '区块链存证溯源', desc: 'SHA-256哈希算法确保实验数据不可篡改，时间戳权威认证，司法举证全链路可信' },
    3: { title: '策略模拟引擎', desc: '基于历史数据的AI策略推荐，量化评估专利保护与商业秘密的最优组合方案' },
    4: { title: '动态价值评估', desc: '多因子量化模型结合市场数据，实时计算知识产权资产的动态价值与交易建议' },
    5: { title: '智能监控预警', desc: '7×24小时全球专利监控，AI识别相似专利与潜在侵权风险，主动推送预警' }
  }
  
  const aiInfo = aiCapabilities[module.id] || { title: 'AI智能驱动', desc: '由扣子AI大模型提供支持，为您提供专业的智能服务体验' }

  return (
    <motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }} 
      exit={{ opacity: 0 }} 
      className="fixed inset-0 z-50 flex flex-col"
      style={{ background: 'linear-gradient(180deg, #020617 0%, #0f172a 40%, #1e293b 100%)' }}
    >
      {/* 刘海屏安全区域 */}
      <div style={{ paddingTop: 'env(safe-area-inset-top)' }} />
      
      {/* 顶部导航 */}
      <div className="flex items-center justify-between px-4 py-3 bg-slate-950/50 backdrop-blur-lg border-b border-white/5">
        <button 
          onClick={onBack} 
          className="w-9 h-9 rounded-xl bg-white/10 hover:bg-white/15 flex items-center justify-center transition-all active:scale-95"
        >
          <span className="material-icons text-white text-xl">arrow_back</span>
        </button>
        <div className="flex items-center gap-2">
          <div 
            className="w-7 h-7 rounded-lg flex items-center justify-center"
            style={{ backgroundColor: module.color + '33' }}
          >
            <span className="material-icons text-sm" style={{ color: module.color }}>{module.icon}</span>
          </div>
          <span className="text-white font-semibold text-sm">{module.name}</span>
        </div>
        <div className="w-9" />
      </div>

      {/* 内容区域 - 可滚动但设计为刚好一屏 */}
      <div className="flex-1 overflow-y-auto px-4 py-3">
        <AnimatePresence mode="wait">
          {activeTab === 'intro' ? (
            <motion.div 
              key="intro" 
              initial={{ opacity: 0, x: -20 }} 
              animate={{ opacity: 1, x: 0 }} 
              exit={{ opacity: 0, x: 20 }}
              className="space-y-3"
            >
              {/* 模块概览卡片 */}
              <div 
                className="rounded-2xl p-4"
                style={{ 
                  background: `linear-gradient(135deg, ${module.color}18, ${module.color}06)`,
                  border: `1px solid ${module.color}30`
                }}
              >
                <div className="flex items-center gap-3 mb-2">
                  <div 
                    className="w-12 h-12 rounded-xl flex items-center justify-center"
                    style={{ backgroundColor: module.color + '25' }}
                  >
                    <span className="material-icons text-2xl" style={{ color: module.color }}>{module.icon}</span>
                  </div>
                  <div>
                    <h1 className="text-lg font-bold text-white">{module.name}</h1>
                    <p className="text-xs" style={{ color: module.color }}>{module.title}</p>
                  </div>
                </div>
                <p className="text-xs text-blue-100/70 leading-relaxed">{module.fullDescription}</p>
              </div>

              {/* 核心能力 */}
              <div className="rounded-xl p-3 bg-white/5 border border-white/8">
                <h3 className="text-xs font-semibold text-cyan-300 mb-2 flex items-center gap-1.5">
                  <span className="material-icons text-xs">auto_awesome</span>
                  核心能力
                </h3>
                <div className="grid grid-cols-3 gap-2">
                  {(module.features || []).map((feature: string, idx: number) => (
                    <div 
                      key={idx} 
                      className="text-center p-2 rounded-lg"
                      style={{ backgroundColor: module.color + '12' }}
                    >
                      <span className="text-xs text-white/90 leading-tight">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* AI 智能加持 */}
              <div 
                className="rounded-xl p-3"
                style={{ 
                  background: `linear-gradient(135deg, ${module.color}10, transparent)`,
                  border: `1px solid ${module.color}25`
                }}
              >
                <h3 className="text-xs font-semibold text-cyan-300 mb-2 flex items-center gap-1.5">
                  <span className="material-icons text-xs">psychology</span>
                  {aiInfo.title}
                </h3>
                <p className="text-xs text-blue-100/60 leading-relaxed">{aiInfo.desc}</p>
              </div>

              {/* 适用对象 */}
              <div className="rounded-xl p-3 bg-white/5 border border-white/8">
                <h3 className="text-xs font-semibold text-cyan-300 mb-2 flex items-center gap-1.5">
                  <span className="material-icons text-xs">auto_awesome</span>
                  适用情景
                </h3>
                <div className="flex flex-wrap gap-1.5">
                  {(module.suitableScenarios || []).map((item: string, idx: number) => (
                    <span 
                      key={idx}
                      className="px-2.5 py-1 rounded-full text-xs text-white/90"
                      style={{ backgroundColor: module.color + '20' }}
                    >
                      {item}
                    </span>
                  ))}
                </div>
              </div>

              {/* 我能帮你什么 */}
              <div 
                className="rounded-xl p-3"
                style={{ 
                  background: `linear-gradient(135deg, ${module.color}10, transparent)`,
                  border: `1px solid ${module.color}25`
                }}
              >
                <h3 className="text-xs font-semibold text-cyan-300 mb-2 flex items-center gap-1.5">
                  <span className="material-icons text-xs">support_agent</span>
                  我能帮你什么
                </h3>
                <div className="space-y-1.5">
                  {(BOT_GUIDES[module.id]?.capabilities || [
                    '📋 提供专业的智能问答与建议',
                    '📊 分析和解读相关数据信息',
                    '💡 给出针对性的优化方案',
                    '🔍 协助查找和对比相关内容',
                  ]).map((item: string, idx: number) => (
                    <div key={idx} className="flex items-start gap-2">
                      <span className="text-xs text-white/80 leading-snug">{item}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* 你可以这样问我 */}
              <div className="rounded-xl p-3 bg-white/5 border border-white/8">
                <h3 className="text-xs font-semibold text-cyan-300 mb-2 flex items-center gap-1.5">
                  <span className="material-icons text-xs">chat_bubble_outline</span>
                  你可以这样问我
                </h3>
                <div className="space-y-1.5">
                  {(BOT_GUIDES[module.id]?.exampleQuestions || [
                    '"帮我了解一下这个模块的主要功能"',
                    '"有什么使用技巧可以分享吗"',
                    '"遇到问题应该怎么处理"',
                  ]).map((item: string, idx: number) => (
                    <div key={idx} className="flex items-start gap-2">
                      <span className="text-cyan-400/70 mt-0.5 shrink-0">·</span>
                      <span className="text-xs text-blue-100/65 leading-snug">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div 
              key="usage" 
              initial={{ opacity: 0, x: 20 }} 
              animate={{ opacity: 1, x: 0 }} 
              exit={{ opacity: 0, x: -20 }}
              className="space-y-3"
            >
              {/* 使用步骤 */}
              <div className="rounded-xl p-3 bg-white/5 border border-white/8">
                <h3 className="text-xs font-semibold text-cyan-300 mb-2.5 flex items-center gap-1.5">
                  <span className="material-icons text-xs">directions</span>
                  快速上手
                </h3>
                <div className="space-y-2">
                  {(module.usageGuide || []).map((step: string, idx: number) => (
                    <div key={idx} className="flex items-start gap-2.5">
                      <div 
                        className="w-5 h-5 rounded-md flex items-center justify-center shrink-0 text-xs font-bold mt-0.5"
                        style={{ backgroundColor: module.color + '30', color: module.color }}
                      >
                        {idx + 1}
                      </div>
                      <p className="text-xs text-blue-100/75 leading-snug pt-0.5">{step}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* 操作提示 */}
              <div className="rounded-xl p-3 bg-amber-500/8 border border-amber-400/25">
                <h3 className="text-xs font-semibold text-amber-300 mb-2 flex items-center gap-1.5">
                  <span className="material-icons text-xs">tips_and_updates</span>
                  操作建议
                </h3>
                <ul className="space-y-1.5">
                  <li className="text-xs text-blue-100/65 flex items-start gap-1.5">
                    <span className="text-amber-400/80 mt-0.5">•</span>
                    <span>输入越详细，AI分析结果越精准可靠</span>
                  </li>
                  <li className="text-xs text-blue-100/65 flex items-start gap-1.5">
                    <span className="text-amber-400/80 mt-0.5">•</span>
                    <span>支持上传多种格式的实验数据文件</span>
                  </li>
                  <li className="text-xs text-blue-100/65 flex items-start gap-1.5">
                    <span className="text-amber-400/80 mt-0.5">•</span>
                    <span>分析报告可随时查看、导出或分享</span>
                  </li>
                </ul>
              </div>

              {/* 注意事项 */}
              <div className="rounded-xl p-3 bg-red-500/8 border border-red-400/25">
                <h3 className="text-xs font-semibold text-red-300 mb-2 flex items-center gap-1.5">
                  <span className="material-icons text-xs">warning</span>
                  注意事项
                </h3>
                <ul className="space-y-1.5">
                  <li className="text-xs text-blue-100/65 flex items-start gap-1.5">
                    <span className="text-red-400/80 mt-0.5">•</span>
                    <span>涉及敏感数据请先脱敏处理</span>
                  </li>
                  <li className="text-xs text-blue-100/65 flex items-start gap-1.5">
                    <span className="text-red-400/80 mt-0.5">•</span>
                    <span>AI分析结果仅供参考，最终决策请咨询专业人士</span>
                  </li>
                </ul>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Tab 切换 + 底部按钮 */}
      <div className="px-4 pb-2 pt-1" style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}>
        {/* Tab 切换 */}
        <div className="flex gap-2 mb-3">
          <button 
            onClick={() => setActiveTab('intro')}
            className={`flex-1 py-2 rounded-xl text-xs font-medium transition-all ${
              activeTab === 'intro' ? 'text-white' : 'text-blue-200/50'
            }`}
            style={{ 
              background: activeTab === 'intro' ? module.color + '25' : 'transparent',
              border: `1px solid ${activeTab === 'intro' ? module.color + '40' : 'transparent'}`
            }}
          >
            功能介绍
          </button>
          <button 
            onClick={() => setActiveTab('usage')}
            className={`flex-1 py-2 rounded-xl text-xs font-medium transition-all ${
              activeTab === 'usage' ? 'text-white' : 'text-blue-200/50'
            }`}
            style={{ 
              background: activeTab === 'usage' ? module.color + '25' : 'transparent',
              border: `1px solid ${activeTab === 'usage' ? module.color + '40' : 'transparent'}`
            }}
          >
            使用指南
          </button>
        </div>
        
        {/* 底部按钮 */}
        <button 
          onClick={onEnter}
          className="w-full py-3.5 rounded-2xl text-white font-semibold text-sm flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
          style={{ 
            background: `linear-gradient(135deg, ${module.color}, ${module.color}cc)`,
            boxShadow: `0 4px 16px ${module.color}35`
          }}
        >
          {module.id === 2 ? (
            <>
              <span>开始使用</span>
              <span className="material-icons text-lg">anchor</span>
            </>
          ) : (
            <>
              <span>启动AI对话</span>
              <span className="material-icons text-lg">smart_toy</span>
            </>
          )}
        </button>
      </div>
    </motion.div>
  )
}

// 数据锚点组件 - 专利时间证据链系统
const DataAnchor: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const [declarations, setDeclarations] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [currentView, setCurrentView] = useState<'main' | 'declare' | 'list' | 'verify' | 'report' | 'keys'>('main')
  const [verifyDeclarationId, setVerifyDeclarationId] = useState<number | null>(null)
  const [reportDeclarationId, setReportDeclarationId] = useState<number | null>(null)

  // 密钥状态
  const [hasKeys, setHasKeys] = useState<boolean | null>(null)
  const [publicKey, setPublicKey] = useState<string | null>(null)
  const [copiedPublicKey, setCopiedPublicKey] = useState(false)

  // 密钥找回状态
  const [showRecoverModal, setShowRecoverModal] = useState(false)
  const [recoverUsername, setRecoverUsername] = useState('')
  const [recoverPhone, setRecoverPhone] = useState('')
  const [recoverError, setRecoverError] = useState('')
  const [recoverSuccess, setRecoverSuccess] = useState(false)
  const [recoverLoading, setRecoverLoading] = useState(false)

  // 密钥删除确认
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [deleteLoading, setDeleteLoading] = useState(false)

  // 加载已有声明记录
  useEffect(() => {
    loadDeclarations()
    loadKeyStatus()
  }, [currentView])

  const loadDeclarations = async () => {
    setLoading(true)
    try {
      const data = await getDeclarations()
      setDeclarations(data || [])
    } catch (error) {
      console.error('加载声明记录失败:', error)
      setDeclarations([])
    } finally {
      setLoading(false)
    }
  }

  // 加载密钥状态
  const loadKeyStatus = async () => {
    try {
      const hasKey = await checkUserHasKeys()
      setHasKeys(hasKey)
      if (hasKey) {
        const pubKey = await getUserPublicKey()
        setPublicKey(pubKey)
      } else {
        setPublicKey(null)
      }
    } catch (error) {
      console.error('加载密钥状态失败:', error)
      setHasKeys(false)
    }
  }

  // 复制公钥
  const handleCopyPublicKey = () => {
    if (publicKey) {
      navigator.clipboard.writeText(publicKey)
      setCopiedPublicKey(true)
      setTimeout(() => setCopiedPublicKey(false), 2000)
    }
  }

  // 删除密钥
  const handleDeleteKeys = async () => {
    setDeleteLoading(true)
    try {
      const success = await deleteUserKeys()
      if (success) {
        removeStoredKeys()
        setHasKeys(false)
        setPublicKey(null)
        setShowDeleteConfirm(false)
      } else {
        alert('删除密钥失败')
      }
    } catch (error) {
      console.error('删除密钥失败:', error)
      alert('删除密钥失败')
    } finally {
      setDeleteLoading(false)
    }
  }

  // 找回密钥提交
  const handleRecoverKeys = async () => {
    if (!recoverUsername || recoverUsername.length < 3) {
      setRecoverError('请输入账号（至少3位）')
      return
    }
    if (!recoverPhone || recoverPhone.length !== 11) {
      setRecoverError('请填写11位手机号码')
      return
    }
    setRecoverError('')
    setRecoverLoading(true)
    try {
      await recoverUserKeys(recoverUsername, recoverPhone)
      setRecoverSuccess(true)
      setTimeout(() => {
        setShowRecoverModal(false)
        setRecoverSuccess(false)
        setRecoverUsername('')
        setRecoverPhone('')
        loadKeyStatus()
      }, 2000)
    } catch (error: any) {
      setRecoverError(error.message || '密钥找回失败，请稍后重试')
    } finally {
      setRecoverLoading(false)
    }
  }

  const copyHash = (hash: string) => {
    navigator.clipboard.writeText(hash)
  }

  // 获取类型标签样式
  const getCategoryStyle = (category?: string) => {
    switch (category) {
      case '构思':
        return 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30'
      case '现有技术':
        return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
      case '侵权线索':
        return 'bg-rose-500/20 text-rose-300 border-rose-500/30'
      default:
        return 'bg-white/10 text-white border-white/20'
    }
  }

  // 获取声明类型图标
  const getTypeIcon = (type?: string) => {
    switch (type) {
      case 'text':
        return 'edit_note'
      case 'file':
        return 'attach_file'
      case 'link':
        return 'link'
      default:
        return 'description'
    }
  }

  // 获取声明类型名称
  const getTypeName = (type?: string) => {
    switch (type) {
      case 'text':
        return '文字'
      case 'file':
        return '文件'
      case 'link':
        return '链接'
      default:
        return '未知'
    }
  }

  // 渲染主界面 - 知晓声明为核心功能
  const renderMainView = () => (
    <div className="flex flex-col h-full">
      {/* 核心功能入口 - 知晓声明 */}
      <div className="p-4">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setCurrentView('declare')}
          className="w-full p-5 rounded-2xl bg-gradient-to-br from-purple-500/30 to-purple-600/20 border border-purple-500/50 hover:border-purple-400/70 transition-all shadow-lg shadow-purple-500/20"
        >
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-purple-500/30 flex items-center justify-center shadow-inner">
              <span className="material-icons text-3xl text-purple-300">edit_document</span>
            </div>
            <div className="flex-1 text-left">
              <div className="text-white font-bold text-lg">知晓声明</div>
              <div className="text-sm text-purple-200/70 mt-0.5">记录何时知晓何事，生成司法可信证据</div>
            </div>
            <span className="material-icons text-purple-300/50">chevron_right</span>
          </div>
        </motion.button>
      </div>

      {/* 次要功能入口 - 横向排列 */}
      <div className="px-4 pb-3">
        <div className="grid grid-cols-2 gap-3">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => { setVerifyDeclarationId(null); setCurrentView('verify') }}
            className="p-4 rounded-2xl bg-gradient-to-br from-cyan-500/20 to-cyan-600/10 border border-cyan-500/30 hover:border-cyan-400/50 transition-all"
          >
            <span className="material-icons text-2xl text-cyan-400 mb-1">verified</span>
            <div className="text-white font-medium text-sm">查询验证</div>
            <div className="text-xs text-cyan-200/60 mt-0.5">验证存证真伪</div>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setCurrentView('list')}
            className="p-4 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-emerald-600/10 border border-emerald-500/30 hover:border-emerald-400/50 transition-all"
          >
            <span className="material-icons text-2xl text-emerald-400 mb-1">list_alt</span>
            <div className="text-white font-medium text-sm">声明记录</div>
            <div className="text-xs text-emerald-200/60 mt-0.5">查看全部存证</div>
          </motion.button>
        </div>
      </div>

      {/* 密钥状态卡片 */}
      <div className="px-4 pb-3">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setCurrentView('keys')}
          className={`w-full p-4 rounded-2xl border transition-all flex items-center gap-3 ${
            hasKeys === true
              ? 'bg-emerald-500/15 border-emerald-500/30 hover:border-emerald-400/50'
              : hasKeys === false
              ? 'bg-amber-500/15 border-amber-500/30 hover:border-amber-400/50'
              : 'bg-white/5 border-white/10'
          }`}
        >
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
            hasKeys === true ? 'bg-emerald-500/30' : hasKeys === false ? 'bg-amber-500/30' : 'bg-white/10'
          }`}>
            <span className={`material-icons text-xl ${
              hasKeys === true ? 'text-emerald-400' : hasKeys === false ? 'text-amber-400' : 'text-white/50'
            }`}>
              {hasKeys === true ? 'key' : hasKeys === false ? 'vpn_key' : 'sync'}
            </span>
          </div>
          <div className="flex-1 text-left">
            <div className="text-white font-medium text-sm">密钥管理</div>
            <div className={`text-xs mt-0.5 ${
              hasKeys === true ? 'text-emerald-200/70' : hasKeys === false ? 'text-amber-200/70' : 'text-white/50'
            }`}>
              {hasKeys === null ? '加载中...' : hasKeys === true ? 'RSA密钥对已生成 · 可进行签名存证' : '尚未生成密钥 · 需要先创建密钥对'}
            </div>
          </div>
          <span className="material-icons text-white/30">chevron_right</span>
        </motion.button>
      </div>

      {/* 存证效力提示 */}
      <div className="px-4 pb-3">
        <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30">
          <div className="flex items-start gap-2">
            <span className="material-icons text-amber-300 text-lg mt-0.5">info</span>
            <div className="text-xs text-amber-200/90 leading-relaxed">
              存证效力只及于存证之日后，存证之日前无证明力。使用SHA-256哈希链 + RSA签名确保数据不可篡改。
            </div>
          </div>
        </div>
      </div>

      {/* 存证记录预览 - 最新3条 */}
      <div className="flex-1 px-4 pb-4 overflow-hidden">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-blue-200/80 flex items-center gap-2">
            <span className="material-icons text-sm">history</span>
            最新存证 ({declarations.length})
          </h3>
          {declarations.length > 3 && (
            <button
              onClick={() => setCurrentView('list')}
              className="text-xs text-purple-400 hover:text-purple-300"
            >
              查看全部
            </button>
          )}
        </div>

        <div className="h-[calc(100%-2rem)] overflow-y-auto space-y-2">
          {loading ? (
            <div className="h-full flex flex-col items-center justify-center text-center py-8">
              <span className="material-icons text-white/20 text-4xl mb-3 animate-spin">sync</span>
              <p className="text-blue-200/50 text-sm">加载中...</p>
            </div>
          ) : declarations.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center py-8">
              <span className="material-icons text-white/10 text-5xl mb-3">folder_open</span>
              <p className="text-blue-200/50 text-sm">暂无存证记录</p>
              <p className="text-blue-200/30 text-xs mt-1">点击上方"知晓声明"开始</p>
            </div>
          ) : (
            <>
              {declarations.slice(0, 3).map((decl, idx) => (
                <motion.div key={decl.id || idx} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="p-3 rounded-xl bg-white/5 border border-white/10">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-purple-500/20 flex items-center justify-center">
                        <span className="material-icons text-purple-300 text-sm">{getTypeIcon(decl.declarationType)}</span>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-white truncate max-w-[120px]">{decl.knowledgeTopic || '无主题'}</h4>
                        <p className="text-[10px] text-blue-200/60">{decl.timestampString || decl.serverTimestamp}</p>
                      </div>
                    </div>
                    <span className={`px-1.5 py-0.5 rounded text-[10px] border ${getCategoryStyle(decl.knowledgeCategory)}`}>
                      {getTypeName(decl.declarationType)}
                    </span>
                  </div>
                  <div className="p-1.5 rounded-lg bg-slate-950/80">
                    <div className="flex items-center justify-between">
                      <span className="text-[9px] text-blue-200/50">区块 #{decl.blockIndex}</span>
                      <button onClick={() => copyHash(decl.blockHash)} className="text-[9px] text-cyan-400 hover:text-cyan-300 flex items-center gap-0.5">
                        <span className="material-icons text-xs">content_copy</span>复制
                      </button>
                    </div>
                    <p className="text-[9px] text-purple-200/70 font-mono truncate">{decl.blockHash}</p>
                  </div>
                </motion.div>
              ))}
            </>
          )}
        </div>
      </div>
    </div>
  )

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-slate-950/95 backdrop-blur-xl" onClick={onBack} />

      <div className="h-full flex items-center justify-center p-3">
        <motion.div initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} className="relative w-full max-w-md h-[95vh] max-h-[800px] bg-slate-900/95 backdrop-blur-2xl rounded-3xl border border-white/10 overflow-hidden shadow-2xl flex flex-col">
          {/* 顶部标题栏 */}
          <div className="p-4 border-b border-white/10 flex-shrink-0" style={{ background: 'linear-gradient(135deg, rgba(124,77,255,0.2), rgba(124,77,255,0.05))' }}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <button onClick={onBack} className="w-9 h-9 rounded-xl bg-white/10 hover:bg-white/20 flex items-center justify-center">
                  <span className="material-icons text-white text-lg">arrow_back</span>
                </button>
                <div>
                  <h2 className="text-lg font-bold text-white flex items-center gap-2">
                    <span className="material-icons text-purple-300 text-xl">hub</span>
                    数据锚点
                  </h2>
                  <p className="text-xs text-purple-200/70">专利时间证据链 · 司法可信存证</p>
                </div>
              </div>
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-purple-500/20 border border-purple-400/50">
                <span className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-pulse"></span>
                <span className="text-[10px] text-purple-200">SHA-256</span>
              </div>
            </div>
          </div>

          {/* 动态内容区域 - 自适应高度 */}
          <div className="flex-1 overflow-hidden">
            {currentView === 'main' && renderMainView()}
            {currentView === 'declare' && (
              <DeclarationForm
                onSuccess={(result) => {
                  loadDeclarations()
                  // 成功后显示提示并引导用户
                  alert(`✅ 声明创建成功！\n\n📋 声明ID: ${result.id}\n🔗 区块序号: #${result.blockIndex}\n\n💡 提示: 您可以在"声明记录"中查看和管理您的声明，点击"验证"按钮可验明真伪。`)
                  setCurrentView('list')
                }}
                onCancel={() => setCurrentView('main')}
              />
            )}
            {currentView === 'list' && (
              <DeclarationList
                onVerify={(id) => { setVerifyDeclarationId(id); setCurrentView('verify') }}
                onGenerateReport={(id) => { setReportDeclarationId(id); setCurrentView('report') }}
                onBack={() => setCurrentView('main')}
                onRefresh={loadDeclarations}
              />
            )}
            {currentView === 'verify' && (
              <VerificationPanel
                declarationId={verifyDeclarationId || undefined}
                onBack={() => setCurrentView('main')}
                onGenerateReport={(id) => { setReportDeclarationId(id); setCurrentView('report') }}
              />
            )}
            {currentView === 'report' && reportDeclarationId && (
              <ReportGenerator
                declarationId={reportDeclarationId}
                onBack={() => setCurrentView('main')}
              />
            )}

            {/* 密钥管理视图 */}
            {currentView === 'keys' && (
              <div className="flex flex-col h-full">
                {/* 顶部导航 */}
                <div className="flex-shrink-0 border-b border-white/10 p-3">
                  <div className="flex items-center justify-between">
                    <button
                      onClick={() => setCurrentView('main')}
                      className="w-9 h-9 rounded-xl bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
                    >
                      <span className="material-icons text-white text-lg">arrow_back</span>
                    </button>
                    <div className="flex items-center gap-2">
                      <span className="material-icons text-amber-400 text-lg">vpn_key</span>
                      <span className="text-white font-semibold text-sm">密钥管理</span>
                    </div>
                    <div className="w-9" />
                  </div>
                </div>

                {/* 内容区域 */}
                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                  {hasKeys === null ? (
                    <div className="flex flex-col items-center justify-center py-12">
                      <span className="material-icons text-3xl text-amber-400 animate-spin">sync</span>
                      <p className="text-blue-200/70 text-sm mt-2">加载中...</p>
                    </div>
                  ) : hasKeys ? (
                    <>
                      {/* 已有密钥 - 显示公钥和删除选项 */}
                      <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="material-icons text-emerald-400">check_circle</span>
                          <span className="text-emerald-200 font-medium text-sm">密钥对已生成</span>
                        </div>
                        <p className="text-xs text-emerald-200/70">
                          您的RSA-2048密钥对已安全存储，可用于签署存证声明。
                        </p>
                      </div>

                      {/* 公钥显示 */}
                      <div className="p-3 rounded-xl bg-slate-900/75 border border-white/10">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs text-blue-200/70">公钥（可复制分享）</span>
                          <button
                            onClick={handleCopyPublicKey}
                            className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
                          >
                            <span className="material-icons text-xs">{copiedPublicKey ? 'check' : 'content_copy'}</span>
                            {copiedPublicKey ? '已复制' : '复制'}
                          </button>
                        </div>
                        <div className="p-2 rounded-lg bg-slate-950/80 break-all">
                          <p className="text-[9px] text-purple-300 font-mono leading-relaxed">
                            {publicKey ? publicKey.substring(0, 80) + '...' : '无公钥'}
                          </p>
                        </div>
                      </div>

                      {/* 密钥找回 */}
                      <div className="p-3 rounded-xl bg-purple-500/10 border border-purple-500/30">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="material-icons text-purple-400 text-base">vpn_key</span>
                          <span className="text-purple-200 font-medium text-sm">密钥找回</span>
                        </div>
                        <p className="text-xs text-purple-200/70 mb-3">
                          如果您忘记了签名密码，可以通过验证用户名和手机号来重置密钥（原有签名记录将失效）。
                        </p>
                        <button
                          onClick={() => setShowRecoverModal(true)}
                          className="w-full py-2 rounded-xl bg-purple-500/20 border border-purple-500/50 text-purple-200 text-xs hover:bg-purple-500/30 transition-colors"
                        >
                          通过手机号找回密钥
                        </button>
                      </div>

                      {/* 删除密钥 */}
                      <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="material-icons text-red-400 text-base">delete_forever</span>
                          <span className="text-red-200 font-medium text-sm">危险操作</span>
                        </div>
                        <p className="text-xs text-red-200/70 mb-3">
                          删除密钥将清除本地存储的所有密钥数据。原有声明记录中的签名将失效。
                        </p>
                        {showDeleteConfirm ? (
                          <div className="space-y-2">
                            <p className="text-xs text-red-300 text-center">确定要删除密钥吗？此操作不可恢复！</p>
                            <div className="flex gap-2">
                              <button
                                onClick={() => setShowDeleteConfirm(false)}
                                className="flex-1 py-1.5 rounded-lg bg-white/5 border border-white/20 text-blue-200 text-xs hover:bg-white/10"
                              >
                                取消
                              </button>
                              <button
                                onClick={handleDeleteKeys}
                                disabled={deleteLoading}
                                className="flex-1 py-1.5 rounded-lg bg-red-500/30 border border-red-500/50 text-red-200 text-xs hover:bg-red-500/40 disabled:opacity-50"
                              >
                                {deleteLoading ? '删除中...' : '确认删除'}
                              </button>
                            </div>
                          </div>
                        ) : (
                          <button
                            onClick={() => setShowDeleteConfirm(true)}
                            className="w-full py-2 rounded-xl bg-red-500/20 border border-red-500/50 text-red-200 text-xs hover:bg-red-500/30 transition-colors"
                          >
                            删除密钥
                          </button>
                        )}
                      </div>
                    </>
                  ) : (
                    <>
                      {/* 没有密钥 - 引导生成 */}
                      <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="material-icons text-amber-400">warning</span>
                          <span className="text-amber-200 font-medium text-sm">尚未生成密钥</span>
                        </div>
                        <p className="text-xs text-amber-200/70 mb-3">
                          生成密钥对后，才能进行签名存证。每次存证需要输入签名密码来解密私钥。
                        </p>
                      </div>

                      {/* 密钥找回 */}
                      <div className="p-3 rounded-xl bg-purple-500/10 border border-purple-500/30">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="material-icons text-purple-400 text-base">vpn_key</span>
                          <span className="text-purple-200 font-medium text-sm">密钥找回</span>
                        </div>
                        <p className="text-xs text-purple-200/70 mb-3">
                          如果您已有密钥但忘记了签名密码，可以通过验证用户名和手机号来重置。
                        </p>
                        <button
                          onClick={() => setShowRecoverModal(true)}
                          className="w-full py-2 rounded-xl bg-purple-500/20 border border-purple-500/50 text-purple-200 text-xs hover:bg-purple-500/30 transition-colors"
                        >
                          通过手机号找回密钥
                        </button>
                      </div>

                      {/* 引导按钮 */}
                      <button
                        onClick={() => setCurrentView('declare')}
                        className="w-full py-3 rounded-xl bg-gradient-to-r from-purple-600 to-purple-500 text-white font-semibold text-sm hover:from-purple-500 hover:to-purple-400 transition-all"
                      >
                        前往创建密钥并发起存证
                      </button>
                    </>
                  )}
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </div>

      {/* 密钥找回模态框 */}
      <AnimatePresence>
        {showRecoverModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] flex items-center justify-center p-4"
          >
            <div className="absolute inset-0 bg-black/60" onClick={() => { if (!recoverLoading) setShowRecoverModal(false) }} />
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className="relative w-full max-w-sm bg-slate-900/95 backdrop-blur-xl rounded-2xl border border-white/10 p-5 shadow-2xl"
            >
              {/* 关闭按钮 */}
              <button
                onClick={() => { if (!recoverLoading) setShowRecoverModal(false) }}
                className="absolute top-3 right-3 w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center"
              >
                <span className="material-icons text-white/60 text-base">close</span>
              </button>

              <div className="text-center mb-4">
                <div className="w-14 h-14 mx-auto mb-3 rounded-2xl bg-gradient-to-br from-purple-400 to-indigo-600 flex items-center justify-center">
                  <span className="material-icons text-white text-2xl">vpn_key</span>
                </div>
                <h3 className="text-white font-bold text-base">找回密钥</h3>
                <p className="text-xs text-purple-200/70 mt-1">验证身份后可重新生成密钥对</p>
              </div>

              {recoverSuccess ? (
                <div className="text-center py-4">
                  <span className="material-icons text-emerald-400 text-4xl mb-2">check_circle</span>
                  <p className="text-white text-sm font-medium">密钥已清除</p>
                  <p className="text-purple-200/70 text-xs mt-1">请重新生成新的密钥对</p>
                </div>
              ) : (
                <>
                  <AnimatePresence>
                    {recoverError && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mb-3 p-2 rounded-lg bg-red-500/10 border border-red-500/30 flex items-center gap-2"
                      >
                        <span className="material-icons text-red-400 text-sm">error_outline</span>
                        <span className="text-red-400 text-xs flex-1">{recoverError}</span>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <div className="p-2 mb-3 rounded-lg bg-amber-500/10 border border-amber-500/30">
                    <p className="text-amber-200/90 text-xs">
                      <span className="material-icons text-amber-400 text-xs align-middle mr-1">warning</span>
                      注意：此操作将清除旧密钥，原有声明记录中的签名将失效。
                    </p>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs text-blue-200/70 mb-1">账号</label>
                      <input
                        type="text"
                        value={recoverUsername}
                        onChange={(e) => setRecoverUsername(e.target.value)}
                        placeholder="请输入注册时的账号"
                        className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-sm placeholder-white/40 focus:outline-none focus:border-purple-500/50"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-blue-200/70 mb-1">注册手机号</label>
                      <input
                        type="tel"
                        value={recoverPhone}
                        onChange={(e) => setRecoverPhone(e.target.value)}
                        placeholder="请输入11位手机号"
                        maxLength={11}
                        className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-sm placeholder-white/40 focus:outline-none focus:border-purple-500/50"
                      />
                    </div>
                    <button
                      onClick={handleRecoverKeys}
                      disabled={recoverLoading}
                      className="w-full py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-purple-500 text-white font-semibold text-sm hover:from-purple-500 hover:to-purple-400 transition-all disabled:opacity-50"
                    >
                      {recoverLoading ? '提交中...' : '确认清除旧密钥'}
                    </button>
                  </div>
                </>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

// 首次登录使用说明弹窗
const WelcomeGuide: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const [currentStep, setCurrentStep] = useState(0)

  const steps = [
    { icon: 'biotech', title: '欢迎使用 BioGuardian', description: 'IP全生命周期智能守护平台，让知识产权管理更简单、更高效', color: '#00E5FF' },
    { icon: 'radar', title: '创新雷达', description: '多模态AI专利分析，侵权风险预警，发掘创新机会', color: '#00E5FF' },
    { icon: 'anchor', title: '数据锚点', description: '区块链哈希存证，确保实验数据不可篡改，司法可信取证', color: '#7C4DFF' },
    { icon: 'extension', title: '策略魔方', description: '智能评估保护策略，优化知识产权布局方案', color: '#FF4081' },
    { icon: 'trending_up', title: '价值引擎', description: 'AI动态估值，成果转化支持，资源智能匹配', color: '#00BFA5' },
    { icon: 'security', title: 'IP作战室', description: '资产监控，侵权监测，维权决策支持', color: '#FFC107' }
  ]

  const handleNext = () => {
    if (currentStep < steps.length - 1) setCurrentStep(currentStep + 1)
    else onClose()
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-950/95 backdrop-blur-xl" />

      <motion.div key={currentStep} initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} className="relative w-full max-w-sm bg-slate-900/95 backdrop-blur-2xl rounded-3xl border border-white/10 overflow-hidden shadow-2xl">
        <div className="absolute top-3 left-4 right-4 flex gap-1.5">
          {steps.map((_, idx) => (
            <div key={idx} className="h-1 flex-1 rounded-full transition-colors" style={{ backgroundColor: idx <= currentStep ? steps[currentStep].color : 'rgba(255,255,255,0.1)', opacity: idx <= currentStep ? 1 : 0.3 }} />
          ))}
        </div>

        <div className="p-6 pt-12 text-center">
          <motion.div key={`icon-${currentStep}`} initial={{ scale: 0, rotate: -180 }} animate={{ scale: 1, rotate: 0 }} transition={{ type: 'spring', duration: 0.6 }} className="w-20 h-20 mx-auto mb-4 rounded-2xl flex items-center justify-center" style={{ background: `linear-gradient(135deg, ${steps[currentStep].color}33, ${steps[currentStep].color}11)`, border: `2px solid ${steps[currentStep].color}66`, boxShadow: `0 0 20px ${steps[currentStep].color}44` }}>
            <span className="material-icons text-4xl" style={{ color: steps[currentStep].color }}>{steps[currentStep].icon}</span>
          </motion.div>

          <motion.h2 key={`title-${currentStep}`} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="text-xl font-bold text-white mb-2">{steps[currentStep].title}</motion.h2>
          <motion.p key={`desc-${currentStep}`} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="text-xs text-blue-200/70 leading-relaxed">{steps[currentStep].description}</motion.p>
        </div>

        <div className="p-5 border-t border-white/10" style={{ background: 'linear-gradient(180deg, transparent, rgba(6,182,212,0.1))' }}>
          <button onClick={handleNext} className="w-full py-3 rounded-xl text-white font-semibold transition-all flex items-center justify-center gap-2 hover:scale-[1.02]" style={{ background: `linear-gradient(135deg, ${steps[currentStep].color}, ${steps[currentStep].color}dd)`, boxShadow: `0 4px 15px ${steps[currentStep].color}44` }}>
            {currentStep < steps.length - 1 ? (<><span>下一项</span><span className="material-icons text-base">arrow_forward</span></>) : (<><span>开始使用</span><span className="material-icons text-base">rocket_launch</span></>)}
          </button>
          {currentStep < steps.length - 1 && <button onClick={onClose} className="w-full mt-2 py-1.5 text-xs text-blue-200/60 hover:text-white transition-colors">跳过引导</button>}
        </div>
      </motion.div>
    </motion.div>
  )
}

// ========== 主应用组件 ==========
const App: React.FC = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [showWelcomeGuide, setShowWelcomeGuide] = useState(false)
  const [hasSeenGuide, setHasSeenGuide] = useState(false)
  
  // 页面状态
  const [currentPage, setCurrentPage] = useState<string | null>(null)
  const [showMenu, setShowMenu] = useState(false)
  const [selectedModule, setSelectedModule] = useState<any>(null)
  const [showDataAnchor, setShowDataAnchor] = useState(false)
  
  // Coze 聊天状态 - 只存储模块ID
  const [cozeModuleId, setCozeModuleId] = useState<number | null>(null)
  // 用于触发 BioScene 刷新使用统计
  const [usageRefreshKey, setUsageRefreshKey] = useState(0)

  const handleLogin = async () => {
    setIsLoggedIn(true)
    if (!hasSeenGuide) {
      setShowWelcomeGuide(true)
      setHasSeenGuide(true)
    }
    
    // 登录成功后检查数据库表
    try {
      const missingTables = await getMissingTables()
      if (missingTables.length > 0) {
        console.log('检测到缺失的表:', missingTables)
        // 提示用户需要在 Supabase 后台创建表
        alert(`⚠️ 检测到数据库缺少以下表:\n${missingTables.join(', ')}\n\n请在 Supabase SQL Editor 中执行建表 SQL`)
      }
    } catch (error) {
      console.error('检查数据库失败:', error)
    }
  }

  // 统一的退出登录处理
  const handleLogout = () => {
    logout()
    setIsLoggedIn(false)
    setCurrentPage(null)
    setShowMenu(false)
    setSelectedModule(null)
    setShowDataAnchor(false)
    setCozeModuleId(null)
  }

  // 处理手机返回键
  useEffect(() => {
    let backButtonListener: any = null;

    CapacitorApp.addListener('backButton', ({ canGoBack }) => {
      if (!canGoBack) {
        // 没有上一页了，返回登录界面而非退出APP
        handleLogout()
      } else {
        // 有上一页，返回上一页
        // 尝试关闭弹窗/页面
        if (cozeModuleId) {
          setCozeModuleId(null)
        } else if (showDataAnchor) {
          setShowDataAnchor(false)
        } else if (currentPage) {
          setCurrentPage(null)
        } else if (showMenu) {
          setShowMenu(false)
        }
      }
    }).then(listener => {
      backButtonListener = listener
    })

    return () => {
      if (backButtonListener) {
        backButtonListener.remove()
      }
    }
  }, [cozeModuleId, showDataAnchor, currentPage, showMenu])

  const navigateTo = (page: string) => {
    setCurrentPage(page)
    setShowMenu(false)
  }

  const handleModuleClick = (module: any) => {
    setSelectedModule(module)
  }

  const handleEnterModule = async () => {
    const moduleId = selectedModule?.id
    
    // 数据锚点 - 打开数据锚点页面
    if (moduleId === 2) {
      // 记录使用
      try {
        await recordAIUsage(2, 'enter_module')
      } catch (e) {
        console.log('记录使用失败:', e)
      }
      setSelectedModule(null)
      setShowDataAnchor(true)
    } else if (isCozeModule(moduleId)) {
      // 每次进入智能体前清除该模块的Token缓存，确保获取新Token和全新会话
      const user = getStoredUser()
      const userId = user ? String(user.id) : 'anonymous'
      clearCozeTokenCache(moduleId, userId)
      console.log(`[handleEnterModule] 清除模块 ${moduleId} 的Token缓存，准备获取新Token`)
      
      // 记录使用
      try {
        await recordAIUsage(moduleId, 'enter_module')
      } catch (e) {
        console.log('记录使用失败:', e)
      }
      
      // 先保存 moduleId，再清空 selectedModule，最后打开 Coze 聊天
      // 这样确保三个状态不会同时为 true
      setSelectedModule(null)
      setTimeout(() => {
        setCozeModuleId(moduleId)
      }, 100)
    }
  }

  const closeCozeChat = async () => {
    const moduleId = cozeModuleId
    if (moduleId) {
      const user = getStoredUser()
      const userId = user ? String(user.id) : 'anonymous'
      clearCozeTokenCache(moduleId, userId)
      console.log(`[closeCozeChat] 关闭时清除模块 ${moduleId} 的Token缓存`)
    }
    // 直接通过状态切换返回主页，不用页面刷新
    setCozeModuleId(null)
  }

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard': return <DashboardPage onBack={() => setCurrentPage(null)} />
      case 'projects': return <ProjectsPage onBack={() => setCurrentPage(null)} onProjectCreated={() => setUsageRefreshKey(k => k + 1)} />
      case 'teams': return <TeamsPage onBack={() => setCurrentPage(null)} />
      case 'calendar': return <CalendarPage onBack={() => setCurrentPage(null)} />
      case 'notifications': return <NotificationsPage onBack={() => setCurrentPage(null)} />
      case 'cloud': return <CloudPage onBack={() => setCurrentPage(null)} />
      case 'analytics': return <AnalyticsPage onBack={() => setCurrentPage(null)} />
      case 'security': return <SecurityPage onBack={() => setCurrentPage(null)} />
      case 'help': return <HelpCenterPage onBack={() => setCurrentPage(null)} />
      case 'about': return <AboutPage onBack={() => setCurrentPage(null)} />
      case 'editProfile': return <EditProfilePage onBack={() => setCurrentPage(null)} onLogout={handleLogout} />
      case 'accountSettings': return <AccountSettingsPage onBack={() => setCurrentPage(null)} onLogout={handleLogout} />
      case 'privacy': return <PrivacyPage onBack={() => setCurrentPage(null)} />
      default: return null
    }
  }

  return (
    <div className="min-h-screen bg-slate-950">
      <AnimatePresence mode="wait">
        {!isLoggedIn ? (
          <motion.div key="login" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <Login key="login-component" onLogin={handleLogin} />
          </motion.div>
        ) : (
          <motion.div key="main" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <BioScene
              onModuleClick={handleModuleClick}
              onUserClick={() => navigateTo('editProfile')}
              onMenuClick={() => setShowMenu(true)}
              onHelpClick={() => navigateTo('help')}
              usageRefreshKey={usageRefreshKey}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* 页面渲染 */}
      <AnimatePresence>
        {currentPage && renderPage()}
      </AnimatePresence>

      {/* 菜单中心面板 */}
      <AnimatePresence>
        {showMenu && <MenuPanel onClose={() => setShowMenu(false)} onNavigate={navigateTo} />}
      </AnimatePresence>

      {/* 首次登录欢迎引导 */}
      <AnimatePresence>
        {showWelcomeGuide && <WelcomeGuide onClose={() => setShowWelcomeGuide(false)} />}
      </AnimatePresence>

      {/* 功能介绍页面 */}
      <AnimatePresence>
        {selectedModule && (
          <ModuleIntro module={selectedModule} onEnter={handleEnterModule} onBack={() => setSelectedModule(null)} />
        )}
      </AnimatePresence>

      {/* 数据锚点页面 */}
      <AnimatePresence>
        {showDataAnchor && <DataAnchor onBack={() => setShowDataAnchor(false)} />}
      </AnimatePresence>

      {/* Coze AI 聊天页面 */}
      <AnimatePresence>
        {cozeModuleId && (
          <CozeChat
            moduleId={cozeModuleId}
            onClose={closeCozeChat}
          />
        )}
      </AnimatePresence>
    </div>
  )
}

export default App
