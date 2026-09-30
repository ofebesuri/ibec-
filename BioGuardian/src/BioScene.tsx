import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { getAIUsageStats, getProjects, getPatents, getFiles, getUserStats } from './api'

const MODULES = [
  {
    id: 1,
    name: '创新雷达',
    title: '技术前瞻与合规预警',
    icon: 'radar',
    color: '#00E5FF',
    features: ['多模态AI专利全景分析', '侵权风险初筛', '创新机会地图'],
    description: '利用多模态AI模型，支持基因序列、质粒图谱等生物数据与专利文献的智能比对，生成可视化"创新机会地图"'
  },
  {
    id: 2,
    name: '数据锚点',
    title: '可信研发数据管理',
    icon: 'anchor',
    color: '#7C4DFF',
    features: ['区块链可信实验记录本', '数据关联与创新洞察', '司法可信存证'],
    description: '基于联盟链技术构建司法可信的电子实验记录本，为每次实验操作加盖不可篡改的时空戳'
  },
  {
    id: 3,
    name: '策略魔方',
    title: '知识产权布局优化',
    icon: 'extension',
    color: '#FF4081',
    features: ['双轨策略模拟器', '全球化布局导航', 'AI撰稿助手'],
    description: '量化评估技术特性，动态模拟"专利保护"、"商业秘密保护"等不同策略的长期收益与风险'
  },
  {
    id: 4,
    name: '价值引擎',
    title: '成果转化与交易支持',
    icon: 'trending_up',
    color: '#00BFA5',
    features: ['IP价值AI动态评估', '合规交易支持', '资源智能匹配'],
    description: '融合专利强度、技术性能指标、市场容量等多重因子，输出贴近市场的动态估值区间报告'
  },
  {
    id: 5,
    name: 'IP作战室',
    title: '资产监控与维权决策',
    icon: 'security',
    color: '#FFC107',
    features: ['IP资产驾驶舱', '7x24小时侵权监测', '维权策略模拟器'],
    description: '可视化集中管理全球知识产权状态，实时扫描全网信息，发现疑似侵权并生成预警报告'
  }
]

interface BioSceneProps {
  onModuleClick: (module: any) => void
  onUserClick: () => void
  onMenuClick: () => void
  onHelpClick: () => void
  usageRefreshKey?: number
}

const BioScene: React.FC<BioSceneProps> = ({ onModuleClick, onUserClick, onMenuClick, onHelpClick, usageRefreshKey }) => {
  const [hoveredModule, setHoveredModule] = useState<number | null>(null)
  const [overviewTab, setOverviewTab] = useState<'pipeline' | 'risk' | 'assets'>('pipeline')
  const [metricRange, setMetricRange] = useState<'week' | 'month'>('week')
  const [isMobile, setIsMobile] = useState(false)
  
  // 真实数据状态
  const [userStats, setUserStats] = useState({
    projects: 0,
    patents: 0,
    files: 0,
    events: 0
  })
  const [moduleStats, setModuleStats] = useState({
    module1: 0,  // 创新雷达
    module2: 0,  // 数据锚点
    module3: 0,  // 策略魔方
    module4: 0,  // 价值引擎
    module5: 0   // IP作战室
  })
  // 近7天和近30天统计数据（按模块ID索引）
  const [globalStats, setGlobalStats] = useState<{
    last7Days: Record<number, number>;
    last30Days: Record<number, number>;
  }>({
    last7Days: {},
    last30Days: {}
  })
  const [projects, setProjects] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const checkMobile = () => {
      if (typeof window !== 'undefined') {
        setIsMobile(window.innerWidth < 768)
      }
    }

    checkMobile()
    if (typeof window !== 'undefined') {
      window.addEventListener('resize', checkMobile)
    }

    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('resize', checkMobile)
      }
    }
  }, [])

  // 加载真实数据（首次加载 + usageRefreshKey 变化时刷新）
  useEffect(() => {
    const loadData = async () => {
      try {
        const [stats, usageStats, projectData] = await Promise.all([
          getUserStats(),
          getAIUsageStats(),
          getProjects()
        ])
        
        setUserStats({
          projects: stats.projects || 0,
          patents: stats.patents || 0,
          files: stats.files || 0,
          events: stats.events || 0
        })
        
        // 使用全局AI使用统计（所有用户互通）
        setModuleStats({
          module1: usageStats.module1 || 0,
          module2: usageStats.module2 || 0,
          module3: usageStats.module3 || 0,
          module4: usageStats.module4 || 0,
          module5: usageStats.module5 || 0
        })
        
        // 设置近7天和近30天统计
        setGlobalStats({
          last7Days: usageStats.last7Days || {},
          last30Days: usageStats.last30Days || {}
        })
        
        setProjects(projectData || [])
      } catch (error) {
        console.error('加载数据失败:', error)
      } finally {
        setLoading(false)
      }
    }
    
    loadData()
  }, [usageRefreshKey])

  const isWeekRange = metricRange === 'week'

  // 根据真实数据显示 - 使用各模块独立统计
  const getModuleCount = (moduleNum: number) => {
    return isWeekRange
      ? globalStats.last7Days?.[moduleNum] || 0
      : globalStats.last30Days?.[moduleNum] || 0
  }
  const searchCount = String(getModuleCount(1))
  const evidenceCount = String(moduleStats.module2 || 0)
  const riskCount = String(getModuleCount(5))  // IP作战室模块使用次数

  // 根据项目数据计算统计
  const projectCount = projects.length
  const highRiskCount = projects.filter((p: any) => p.riskLevel === '高' || p.riskLevel === '极高').length
  const keyAssetCount = projects.filter((p: any) => p.budget > 5000).length

  const activeModule = hoveredModule
    ? MODULES.find((m) => m.id === hoveredModule) ?? null
    : null

  return (
    <div 
      className="w-full h-full min-h-[100dvh] relative overflow-y-auto lg:overflow-hidden overflow-x-hidden"
    >
      {/* 背景装饰 / 多层渐变 + 粒子 + 光效 */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
        {/* 主渐变云层 */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_16%_18%,rgba(34,211,238,0.18)_0%,transparent_52%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_84%_82%,rgba(139,92,246,0.2)_0%,transparent_55%)]" />
        {/* 纵向光带，营造数据流感 */}
        <div className="absolute inset-0 mix-blend-screen opacity-60">
          <div className="absolute inset-y-0 left-1/3 w-px bg-gradient-to-b from-cyan-400/0 via-cyan-400/50 to-cyan-400/0" />
          <div className="absolute inset-y-0 right-1/4 w-px bg-gradient-to-b from-purple-400/0 via-purple-400/40 to-purple-400/0" />
        </div>

        {/* 动态粒子层（桌面端保留动效，手机端改为极简静态点避免卡顿） */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {!isMobile && (
            <>
              {/* 主要粒子（仅桌面端） */}
              {Array.from({ length: 70 }).map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute w-1 h-1 rounded-full bg-cyan-300/35"
                  initial={{
                    x: Math.random() * 100 + '%',
                    y: Math.random() * 100 + '%',
                    opacity: Math.random() * 0.6 + 0.2
                  }}
                  animate={{
                    x: [Math.random() * 100 + '%', Math.random() * 100 + '%'],
                    y: [Math.random() * 100 + '%', Math.random() * 100 + '%'],
                    opacity: [Math.random() * 0.6 + 0.2, 0, Math.random() * 0.6 + 0.2]
                  }}
                  transition={{
                    duration: Math.random() * 18 + 10,
                    repeat: Infinity,
                    repeatType: 'reverse'
                  }}
                />
              ))}
              
              {/* 高亮粒子（仅桌面端） */}
              {Array.from({ length: 18 }).map((_, i) => (
                <motion.div
                  key={`highlight-${i}`}
                  className="absolute w-2 h-2 rounded-full bg-cyan-400/70"
                  initial={{
                    x: Math.random() * 100 + '%',
                    y: Math.random() * 100 + '%',
                    opacity: Math.random() * 0.8 + 0.3
                  }}
                  animate={{
                    x: [Math.random() * 100 + '%', Math.random() * 100 + '%'],
                    y: [Math.random() * 100 + '%', Math.random() * 100 + '%'],
                    opacity: [Math.random() * 0.8 + 0.3, 0, Math.random() * 0.8 + 0.3],
                    scale: [1, 1.6, 1]
                  }}
                  transition={{
                    duration: Math.random() * 14 + 8,
                    repeat: Infinity,
                    repeatType: 'reverse'
                  }}
                />
              ))}
            </>
          )}

          {isMobile && (
            <>
              {/* 手机端只放少量静态点，完全取消连续位移动画，避免横向“飘逸”感 */}
              {Array.from({ length: 10 }).map((_, i) => (
                <div
                  key={`m-static-${i}`}
                  className="absolute w-[3px] h-[3px] rounded-full bg-cyan-300/40"
                  style={{
                    left: `${Math.random() * 100}%`,
                    top: `${Math.random() * 100}%`,
                    opacity: 0.5
                  }}
                />
              ))}
            </>
          )}
        </div>

        {/* 合成生物学主题光环（桌面端缓慢呼吸，手机端改为静态防止画面整体晃动） */}
        {!isMobile && (
          <>
            <motion.div 
              className="absolute top-1/4 left-1/4 w-72 md:w-80 h-72 md:h-80 bg-cyan-500/12 rounded-full blur-3xl"
              animate={{
                scale: [1, 1.18, 1],
                opacity: [0.12, 0.18, 0.12]
              }}
              transition={{
                duration: 9,
                repeat: Infinity,
                repeatType: 'reverse'
              }}
            />
            <motion.div 
              className="absolute bottom-1/4 right-1/4 w-80 md:w-96 h-80 md:h-96 bg-purple-500/12 rounded-full blur-3xl"
              animate={{
                scale: [1, 1.12, 1],
                opacity: [0.12, 0.16, 0.12]
              }}
              transition={{
                duration: 11,
                repeat: Infinity,
                repeatType: 'reverse',
                delay: 1.8
              }}
            />
          </>
        )}
        {isMobile && (
          <>
            <div className="absolute top-1/4 left-1/4 w-56 h-56 bg-cyan-500/10 rounded-full blur-3xl" />
            <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl" />
          </>
        )}
        
        {/* 中心光效 / 轨道环（移动端进一步弱化动画，几乎静止，以流畅度为优先） */}
        {!isMobile && (
          <motion.div 
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-56 sm:w-64 h-56 sm:h-64 bg-cyan-500/7 rounded-full blur-3xl"
            animate={{
              scale: [1, 1.22, 1],
              opacity: [0.08, 0.14, 0.08]
            }}
            transition={{
              duration: 7.5,
              repeat: Infinity,
              repeatType: 'reverse'
            }}
          />
        )}
        {isMobile && (
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-52 h-52 bg-cyan-500/8 rounded-full blur-3xl" />
        )}
        {/* 旋转的环形线，增强“魔法阵 / DNA 实验台”感 */}
        {!isMobile && (
          <>
            <motion.div
              className="absolute inset-0 flex items-center justify-center"
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 42, ease: 'linear' }}
            >
              <div className="w-[260px] sm:w-[320px] h-[260px] sm:h-[320px] rounded-full border border-cyan-400/15 border-dashed" />
            </motion.div>
            <motion.div
              className="absolute inset-0 flex items-center justify-center"
              animate={{ rotate: -360 }}
              transition={{ repeat: Infinity, duration: 56, ease: 'linear' }}
            >
              <div className="w-[210px] sm:w-[260px] h-[210px] sm:h-[260px] rounded-full border border-purple-400/15" />
            </motion.div>
          </>
        )}
        {isMobile && (
          <>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-[240px] h-[240px] rounded-full border border-cyan-400/18 border-dashed" />
            </div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-[200px] h-[200px] rounded-full border border-purple-400/18" />
            </div>
          </>
        )}

        {/* 底部网格 + 柔光蒙版，提升“商业级仪表盘”氛围 */}
        <div className="absolute inset-x-0 bottom-0 h-40 sm:h-52 opacity-[0.14] sm:opacity-[0.22]">
          <div className="w-full h-full bg-[linear-gradient(to_right,rgba(148,163,184,0.16)_1px,transparent_1px),linear-gradient(to_top,rgba(15,23,42,0.95),rgba(15,23,42,0.35))] bg-[size:40px_1px,100%_100%]" />
        </div>
        <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-slate-950 via-slate-950/0 to-transparent pointer-events-none" />
      </div>

      {/* 顶部信息栏 + LOGO + 用户/菜单入口（移动端适配，避开刘海安全区） */}
      <div className="absolute inset-x-0 top-0 safe-header px-4 sm:px-6 flex items-center justify-between z-20 pointer-events-none">
        {/* 品牌 LOGO：盾牌 + DNA 双螺旋 + BG 标识 */}
        <div className="flex items-center gap-3 pointer-events-auto">
          <div className="relative w-10 h-10 rounded-2xl bg-slate-900/60 border border-cyan-400/40 flex items-center justify-center shadow-[0_0_18px_rgba(34,211,238,0.55)] overflow-hidden">
            <div className="absolute inset-[2px] rounded-[0.9rem] bg-slate-950/95 backdrop-blur-[2px]" />
            <svg
              viewBox="0 0 120 120"
              className="relative z-10 w-7 h-7"
            >
              <defs>
                <linearGradient id="scene-logo-shield" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#38bdf8" />
                  <stop offset="50%" stopColor="#6366f1" />
                  <stop offset="100%" stopColor="#a855f7" />
                </linearGradient>
                <linearGradient id="scene-logo-dna" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#e0f2fe" />
                  <stop offset="100%" stopColor="#bae6fd" />
                </linearGradient>
              </defs>
              <path
                d="M60 10 L90 22 C94 24 96 28 96 32 L96 55 C96 76 82 94 62 102 L60 103 L58 102 C38 94 24 76 24 55 L24 32 C24 28 26 24 30 22 Z"
                fill="#020617"
                stroke="url(#scene-logo-shield)"
                strokeWidth="4"
              />
              <path
                d="M48 70 C56 62 64 58 72 50 C64 42 56 38 48 30"
                fill="none"
                stroke="url(#scene-logo-dna)"
                strokeWidth="3"
                strokeLinecap="round"
              />
              <path
                d="M72 70 C64 62 56 58 48 50 C56 42 64 38 72 30"
                fill="none"
                stroke="url(#scene-logo-dna)"
                strokeWidth="3"
                strokeLinecap="round"
                opacity="0.9"
              />
              <line x1="50" y1="34" x2="70" y2="34" stroke="#e0f2fe" strokeWidth="2" strokeLinecap="round" />
              <line x1="50" y1="42" x2="70" y2="42" stroke="#e0f2fe" strokeWidth="2" strokeLinecap="round" opacity="0.8" />
              <line x1="50" y1="50" x2="70" y2="50" stroke="#e0f2fe" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <p className="text-sm font-semibold text-white tracking-tight">BioGuardian</p>
              <span className="hidden sm:inline-flex px-2 py-[2px] rounded-full text-[10px] font-medium bg-cyan-400/10 text-cyan-200 border border-cyan-400/40">
                SYNBIO · IP COPILOT
              </span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2 sm:gap-3 pointer-events-auto">
          <div className="hidden md:flex items-center gap-3">
          <div className="px-3 py-1 rounded-full bg-white/5 border border-cyan-400/40 text-[11px] text-cyan-100 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            持有专利：<span className="font-semibold">{userStats.patents}</span>
          </div>
          <div className="px-3 py-1 rounded-full bg-white/5 border border-purple-400/40 text-[11px] text-blue-100">
            存证数据：<span className="font-semibold text-purple-100">{userStats.files}</span>
          </div>
          </div>
          <button
            onClick={onMenuClick}
            className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-white/10 border border-white/20 text-[11px] text-blue-50 hover:bg-white/20 active:scale-[0.98] transition-all"
          >
            <span className="material-icons text-[16px]">menu</span>
            菜单中心
          </button>
          <button
            onClick={onUserClick}
            className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-white/10 border border-cyan-400/50 text-[11px] text-blue-50 hover:bg-white/20 active:scale-[0.98] transition-all"
          >
            <span className="material-icons text-[16px]">person</span>
            个人信息
          </button>
        </div>
      </div>

      {/* 右侧浮动使用帮助入口：点击拉出侧边栏 */}
      <button
        onClick={onHelpClick}
        className="fixed right-3 bottom-24 sm:right-6 sm:bottom-10 z-30 inline-flex items-center gap-2 px-3 py-2 rounded-full bg-slate-950/85 border border-cyan-400/60 text-[11px] text-cyan-50 shadow-[0_10px_30px_rgba(8,47,73,0.8)] hover:bg-slate-900/95 active:scale-[0.97] transition-all"
      >
        <span className="material-icons text-[16px] text-cyan-300">help_outline</span>
        <span className="hidden sm:inline">使用帮助</span>
        <span className="sm:hidden">帮助</span>
      </button>

      {/* 主体内容区：左侧简介 + 右侧模块网格（手机优先布局，适当压缩上下间距） */}
      <div className="relative z-10 h-full flex flex-col lg:flex-row items-stretch justify-center px-4 sm:px-6 pt-20 sm:pt-24 pb-20 sm:pb-16 gap-8 lg:gap-10 lg:pr-[360px] max-w-6xl mx-auto overflow-x-hidden">
        {/* 左侧简介 / Hero 区域：概念定位 + 关键信息分区 */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex-1 max-w-xl space-y-5"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-cyan-400/40 text-[11px] text-cyan-100">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            合成生物学 · IP 工作中枢
          </div>
          <div className="space-y-3 sm:space-y-4">
            <h1 className="text-2xl sm:text-3xl lg:text-5xl font-semibold sm:font-bold text-white tracking-tight leading-tight">
              把
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-cyan-300 via-sky-300 to-cyan-200">
                {' '}实验台{' '}
              </span>
              到
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-300 via-fuchsia-300 to-sky-300">
                {' '}市场{' '}
              </span>
              之间的路铺平
            </h1>
            <p className="text-xs sm:text-sm uppercase tracking-[0.22em] text-cyan-200/80">
              SYNTHETIC BIOLOGY · INTELLECTUAL PROPERTY PIPELINE
            </p>
            <p className="text-sm sm:text-base text-blue-100/90 leading-relaxed">
              通过 5 大能力模块，把专利检索、数据锚点、策略魔方、价值引擎与 IP 作战室串成一条
              <span className="text-cyan-200"> 可追踪、可审计、可量化 </span>
              的 IP 流水线。
            </p>
          </div>
          {/* 信息分区：用户画像 / 覆盖环节 / 平台价值 */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-[11px] sm:text-xs text-blue-100/85">
            <div className="rounded-2xl bg-slate-950/70 border border-white/10 px-4 py-3 space-y-1">
              <p className="text-blue-200/80">典型使用者</p>
              <p>科研 PI · 技术负责人 · 法务 / 合规</p>
            </div>
            <div className="rounded-2xl bg-slate-950/70 border border-white/10 px-4 py-3 space-y-1">
              <p className="text-blue-200/80">覆盖环节</p>
              <p>从创新发现 → 交易转化 → 维权决策</p>
            </div>
            <div className="rounded-2xl bg-slate-950/70 border border-cyan-400/30 px-4 py-3 space-y-1">
              <p className="text-blue-200/80">平台价值概览</p>
              <p>检索效率 ↑300% · 风险暴露 ↓85%</p>
            </div>
          </div>
        </motion.div>

        {/* 右侧模块列表 / 在手机上会自动排成两行网格 */}
              <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex-1 max-w-xl"
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-[11px] text-blue-200/80 uppercase tracking-[0.18em]">
                能力模块
              </p>
              <p className="text-sm text-blue-50">点选模块，进入详细功能页</p>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {MODULES.map((module, index) => (
              <motion.button
                key={module.id}
                onClick={() => onModuleClick(module)}
                onMouseEnter={() => setHoveredModule(module.id)}
                onMouseLeave={() => setHoveredModule(null)}
                whileHover={{ y: -4, scale: 1.02 }}
                className={`text-left rounded-2xl bg-slate-950/80 border border-white/10 hover:border-cyan-400/60 hover:shadow-[0_18px_40px_rgba(8,47,73,0.9)] px-4 py-4 flex gap-3 cursor-pointer transition-all active:scale-[0.985] ${index === MODULES.length - 1 ? 'sm:col-span-2' : ''}`}
              >
                <div
                  className="w-10 h-10 rounded-2xl flex items-center justify-center mt-0.5 shrink-0"
                  style={{ backgroundColor: module.color + '26' }}
                >
                  <span className="material-icons text-xl" style={{ color: module.color }}>
                    {module.icon}
                  </span>
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-sm font-semibold text-white">{module.name}</p>
                    <span className="text-[11px] text-blue-200/80">
                      {module.title}
                    </span>
                  </div>
                  <p className="text-[11px] text-blue-100/85 line-clamp-2">
                    {module.description}
                  </p>
                </div>
              </motion.button>
            ))}
          </div>
        </motion.div>
      </div>

      {/* 右侧模块总览面板：
          - 桌面端：作为右侧固定侧栏
          - 移动端：作为主内容下方的第三大块纵向展示
      */}
      <div className="mt-6 lg:mt-0 w-full lg:w-[340px] lg:absolute lg:inset-y-0 lg:right-0 lg:pr-6 px-4 sm:px-6 lg:px-0 py-6 lg:py-16 z-20 border-t border-white/10 lg:border-t-0">
        <div className="h-full flex flex-col justify-between gap-4 lg:gap-0">
          {/* 顶部：当前模块聚焦 / 默认概览 */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="rounded-3xl bg-slate-900/75 border border-white/10 backdrop-blur-2xl p-5 shadow-[0_18px_45px_rgba(15,23,42,0.8)]"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="material-icons text-cyan-300 text-base">
                  {activeModule ? activeModule.icon : 'hub'}
                </span>
                <span className="text-xs uppercase tracking-[0.18em] text-blue-200/70">
                  {activeModule ? '模块聚焦' : '工作台总览'}
                </span>
              </div>
              <span className="text-[11px] text-blue-200/70">
                合成生物学 · IP 中枢
              </span>
            </div>

            {activeModule ? (
              <>
                <div className="mb-3">
                  <h2 className="text-lg font-semibold text-white mb-1">
                    {activeModule.name}
                  </h2>
                  <p className="text-[13px] text-blue-100/90 leading-relaxed">
                    {activeModule.description}
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-3 text-[11px]">
                  {activeModule.features.slice(0, 4).map((feature, idx) => (
                    <motion.div
                      key={idx}
                      whileHover={{ y: -2, scale: 1.02 }}
                      className="rounded-xl bg-white/4 border border-white/8 px-3 py-2 flex items-start gap-2 cursor-default"
                    >
                      <span className="mt-[2px] material-icons text-[14px] text-cyan-300">
                        {idx === 0 ? 'radar' : idx === 1 ? 'insights' : idx === 2 ? 'sync_alt' : 'shield'}
                      </span>
                      <span className="text-blue-100 leading-snug">{feature}</span>
                    </motion.div>
                  ))}
                </div>
              </>
            ) : (
              <>
                <div className="mb-3 space-y-1.5">
                  <h2 className="text-lg font-semibold text-white">
                    BioGuardian IP 实战工作台
                  </h2>
                  <p className="text-[13px] text-blue-100/90 leading-relaxed">
                    把
                    <span className="text-cyan-200"> 创新雷达 · 数据锚点 · 策略魔方 · 价值引擎 · IP 作战室 </span>
                    串成一条从
                    <span className="text-cyan-200"> 文献到维权 </span>
                    的 IP 流水线，下面是一眼总览视图。
                  </p>
                  <div className="grid grid-cols-3 gap-2 text-[11px] pt-1.5">
                    <div className="rounded-xl bg-slate-900/80 border border-cyan-400/35 px-2.5 py-1.5 flex flex-col gap-0.5">
                      <span className="text-blue-200/75">在研技术路线 {projects.length === 0 && <span className="text-amber-400 text-[9px]">（请添加）</span>}</span>
                      <span className="text-white font-semibold text-sm">
                        {projectCount}
                      </span>
                    </div>
                    <div className="rounded-xl bg-slate-900/80 border border-emerald-400/35 px-2.5 py-1.5 flex flex-col gap-0.5">
                      <span className="text-blue-200/75">重点 IP 资产</span>
                      <span className="text-emerald-200 font-semibold text-sm">
                        {keyAssetCount}
                      </span>
                    </div>
                    <div className="rounded-xl bg-slate-900/80 border border-amber-400/45 px-2.5 py-1.5 flex flex-col gap-0.5">
                      <span className="text-blue-200/75">高风险告警</span>
                      <span className="text-amber-200 font-semibold text-sm">
                        {highRiskCount}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 mb-3">
                  <button
                    onClick={() => setOverviewTab('pipeline')}
                    className={`px-2.5 py-1 rounded-full text-[11px] border transition-all ${
                      overviewTab === 'pipeline'
                        ? 'bg-cyan-500/20 border-cyan-400/60 text-cyan-100 shadow-[0_0_12px_rgba(34,211,238,0.45)]'
                        : 'bg-white/3 border-white/10 text-blue-100/75 hover:bg-white/8'
                    }`}
                  >
                    流水线视角
                  </button>
                  <button
                    onClick={() => setOverviewTab('risk')}
                    className={`px-2.5 py-1 rounded-full text-[11px] border transition-all ${
                      overviewTab === 'risk'
                        ? 'bg-amber-500/20 border-amber-400/60 text-amber-100 shadow-[0_0_12px_rgba(251,191,36,0.5)]'
                        : 'bg-white/3 border-white/10 text-blue-100/75 hover:bg-white/8'
                    }`}
                  >
                    风险视角
                  </button>
                  <button
                    onClick={() => setOverviewTab('assets')}
                    className={`px-2.5 py-1 rounded-full text-[11px] border transition-all ${
                      overviewTab === 'assets'
                        ? 'bg-emerald-500/20 border-emerald-400/60 text-emerald-100 shadow-[0_0_12px_rgba(16,185,129,0.5)]'
                        : 'bg-white/3 border-white/10 text-blue-100/75 hover:bg-white/8'
                    }`}
                  >
                    资产视角
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-3 text-[11px]">
                  {overviewTab === 'pipeline' && (
                    <>
                      <motion.div
                        layout
                        whileHover={{ y: -2, scale: 1.02 }}
                        className="rounded-xl bg-white/4 border border-white/8 px-3 py-2 flex flex-col gap-1.5"
                      >
                        <div className="flex items-center gap-1.5">
                          <span className="material-icons text-[14px] text-cyan-300">
                            timeline
                          </span>
                          <span className="text-blue-100">合成路线覆盖</span>
                        </div>
                        <p className="text-blue-100/85 leading-snug">
                          核心技术路线中已有
                          <span className="text-cyan-200 font-semibold"> 92% </span>
                          打通从
                          <span className="text-cyan-200"> 创新雷达 → 数据锚点 → 策略魔方 → 价值引擎 → IP 作战室 </span>
                          的全流程追踪。
                        </p>
                        <div className="mt-2 flex items-center gap-1.5">
                          {MODULES.map((module) => (
                            <motion.button
                              key={module.id}
                              whileHover={{ scale: 1.05, y: -1 }}
                              className="flex-1 h-1.5 rounded-full overflow-hidden bg-slate-900/80 border border-slate-700/60 cursor-pointer"
                              style={{ boxShadow: `0 0 0 1px ${module.color}33` }}
                              onClick={() => onModuleClick(module)}
                            >
                              <motion.div
                                initial={{ width: '0%' }}
                                animate={{ width: `${50 + module.id * 8}%` }}
                                transition={{ duration: 0.8, delay: module.id * 0.04 }}
                                className="h-full"
                                style={{
                                  backgroundImage: `linear-gradient(to right, ${module.color}, #22d3ee)`
                                }}
                              />
                            </motion.button>
                          ))}
                        </div>
                        <div className="mt-1 flex items-center justify-between text-[10px] text-blue-200/80">
                          <span>一键跳转对应能力模块</span>
                          <span>{isWeekRange ? '近 7 天' : '近 30 天'} 路线打通情况</span>
                        </div>
                      </motion.div>
                      <motion.div
                        layout
                        whileHover={{ y: -2, scale: 1.02 }}
                        className="rounded-xl bg-white/4 border border-white/8 px-3 py-2 flex flex-col gap-1.5"
                      >
                        <div className="flex items-center gap-1.5">
                          <span className="material-icons text-[14px] text-sky-300">
                            route
                          </span>
                          <span className="text-blue-100">关键节点留痕</span>
                        </div>
                        <p className="text-blue-100/85 leading-snug">
                          立项、首轮实验、专利撰写、交易谈判等节点自动打点，支持
                          <span className="text-cyan-200"> 逐案复盘 </span>
                          与合规审计。基于
                          <span className="text-cyan-200"> 数据锚点 × IP 作战室 </span>
                          自动关联每一次实验记录与后续维权动作。
                        </p>
                      </motion.div>
                    </>
                  )}
                  {overviewTab === 'risk' && (
                    <>
                      <motion.div
                        layout
                        whileHover={{ y: -2, scale: 1.02 }}
                        className="rounded-xl bg-white/4 border border-white/8 px-3 py-2 flex flex-col gap-1.5"
                      >
                        <div className="flex items-center gap-1.5">
                          <span className="material-icons text-[14px] text-amber-300">
                            warning_amber
                          </span>
                          <span className="text-blue-100">疑似冲突位点</span>
                        </div>
                        <p className="text-blue-100/85 leading-snug">
                          结合专利族与公开文献，最近
                          <span className="text-amber-200 font-semibold"> {isWeekRange ? '7' : '30'} 天 </span>
                          已自动标记
                          <span className="text-amber-200 font-semibold"> 高重合度技术片段 </span>
                          ，对应
                          <span className="text-amber-200 font-semibold"> {riskCount} 条 </span>
                          高风险预警，并给出应对策略建议。
                        </p>
                      </motion.div>
                      <motion.div
                        layout
                        whileHover={{ y: -2, scale: 1.02 }}
                        className="rounded-xl bg-white/4 border border-white/8 px-3 py-2 flex flex-col gap-1.5"
                      >
                        <div className="flex items-center gap-1.5">
                          <span className="material-icons text-[14px] text-rose-300">
                            gavel
                          </span>
                          <span className="text-blue-100">维权决策沙盘</span>
                        </div>
                        <p className="text-blue-100/85 leading-snug">
                          基于历史案例和当前证据强度，结合
                          <span className="text-amber-200"> IP 作战室 </span>
                          中的资产画像，模拟
                          <span className="text-amber-200"> 协商、诉讼、放弃 </span>
                          等不同路径的风险与成本。
                        </p>
                      </motion.div>
                    </>
                  )}
                  {overviewTab === 'assets' && (
                    <>
                      <motion.div
                        layout
                        whileHover={{ y: -2, scale: 1.02 }}
                        className="rounded-xl bg-white/4 border border-white/8 px-3 py-2 flex flex-col gap-1.5"
                      >
                        <div className="flex items-center gap-1.5">
                          <span className="material-icons text-[14px] text-emerald-300">
                            inventory_2
                          </span>
                          <span className="text-blue-100">IP 资产视图</span>
                        </div>
                        <p className="text-blue-100/85 leading-snug">
                          将专利、软件著作权、实验数据锚点等统一纳入
                          <span className="text-emerald-200"> 一张资产地图 </span>
                          ，支持按路线、产品线、地区切片。
                        </p>
                      </motion.div>
                      <motion.div
                        layout
                        whileHover={{ y: -2, scale: 1.02 }}
                        className="rounded-xl bg-white/4 border border-white/8 px-3 py-2 flex flex-col gap-1.5"
                      >
                        <div className="flex items-center gap-1.5">
                          <span className="material-icons text-[14px] text-cyan-300">
                            trending_up
                          </span>
                          <span className="text-blue-100">价值动态估算</span>
                        </div>
                        <p className="text-blue-100/85 leading-snug">
                          结合专利强度、技术成熟度与市场信号，给出
                          <span className="text-emerald-200"> 区间估值 </span>
                          ，与
                          <span className="text-emerald-200"> 价值引擎 × 策略魔方 </span>
                          联动，辅助技术转移与授权谈判。
                        </p>
                      </motion.div>
                    </>
                  )}
                </div>
              </>
            )}
                </motion.div>

          {/* 底部：实时运营小看板 */}
                <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="mt-4 rounded-2xl bg-slate-950/80 border border-white/10 backdrop-blur-2xl px-4 py-3"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-[11px] text-blue-100/80">
                  实时运营指标
                </span>
              </div>
              <div className="flex items-center gap-1 rounded-full bg-slate-900/80 border border-white/10 px-1">
                <button
                  onClick={() => setMetricRange('week')}
                  className={`px-2 py-[2px] rounded-full text-[10px] transition-all ${
                    isWeekRange
                      ? 'bg-cyan-500/70 text-slate-950 font-semibold'
                      : 'text-blue-100/70 hover:text-blue-50'
                  }`}
                >
                  近 7 天
                </button>
                <button
                  onClick={() => setMetricRange('month')}
                  className={`px-2 py-[2px] rounded-full text-[10px] transition-all ${
                    !isWeekRange
                      ? 'bg-cyan-500/70 text-slate-950 font-semibold'
                      : 'text-blue-100/70 hover:text-blue-50'
                  }`}
                >
                  近 30 天
                </button>
              </div>
            </div>
            <div className="grid grid-cols-5 gap-2 text-[10px]">
              <div>
                <p className="text-blue-200/70 mb-1">创新雷达</p>
                <p className="text-white font-semibold text-sm">
                  {isWeekRange 
                    ? globalStats.last7Days?.[1] || 0
                    : globalStats.last30Days?.[1] || 0}
                </p>
                <div className="mt-1 h-1.5 rounded-full bg-slate-800 overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min((moduleStats.module1 / 100) * 100, 100)}%` }}
                    transition={{ duration: 0.8 }}
                    className="h-full bg-gradient-to-r from-cyan-400 to-blue-500"
                  />
                </div>
              </div>
              <div>
                <p className="text-purple-200/70 mb-1">数据锚点</p>
                <p className="text-purple-300 font-semibold text-sm">
                  {isWeekRange ? globalStats.last7Days?.[2] || 0 : globalStats.last30Days?.[2] || 0}
                </p>
                <div className="mt-1 h-1.5 rounded-full bg-slate-800 overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min((moduleStats.module2 / 100) * 100, 100)}%` }}
                    transition={{ duration: 0.8 }}
                    className="h-full bg-gradient-to-r from-purple-400 to-pink-500"
                  />
                </div>
              </div>
              <div>
                <p className="text-pink-200/70 mb-1">策略魔方</p>
                <p className="text-pink-300 font-semibold text-sm">
                  {isWeekRange ? globalStats.last7Days?.[3] || 0 : globalStats.last30Days?.[3] || 0}
                </p>
                <div className="mt-1 h-1.5 rounded-full bg-slate-800 overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min((moduleStats.module3 / 100) * 100, 100)}%` }}
                    transition={{ duration: 0.8 }}
                    className="h-full bg-gradient-to-r from-pink-400 to-rose-500"
                  />
                </div>
              </div>
              <div>
                <p className="text-emerald-200/70 mb-1">价值引擎</p>
                <p className="text-emerald-300 font-semibold text-sm">
                  {isWeekRange ? globalStats.last7Days?.[4] || 0 : globalStats.last30Days?.[4] || 0}
                </p>
                <div className="mt-1 h-1.5 rounded-full bg-slate-800 overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min((moduleStats.module4 / 100) * 100, 100)}%` }}
                    transition={{ duration: 0.8 }}
                    className="h-full bg-gradient-to-r from-emerald-400 to-teal-500"
                  />
                </div>
              </div>
              <div>
                <p className="text-amber-200/70 mb-1">IP作战室</p>
                <p className="text-amber-300 font-semibold text-sm">
                  {isWeekRange ? globalStats.last7Days?.[5] || 0 : globalStats.last30Days?.[5] || 0}
                </p>
                <div className="mt-1 h-1.5 rounded-full bg-slate-800 overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min((moduleStats.module5 / 100) * 100, 100)}%` }}
                    transition={{ duration: 0.8 }}
                    className="h-full bg-gradient-to-r from-amber-400 to-orange-500"
                  />
                </div>
              </div>
            </div>
              </motion.div>
        </div>
      </div>
    </div>
  )
}

export default BioScene