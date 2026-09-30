// 声明记录列表组件
import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { getDeclarations, deleteDeclaration as deleteDeclarationApi, Declaration, getCurrentUserId } from '../api'

interface DeclarationListProps {
  onVerify: (id: number) => void
  onGenerateReport: (id: number) => void
  onBack: () => void
  onRefresh?: () => void
}

const DeclarationList: React.FC<DeclarationListProps> = ({ onVerify, onGenerateReport, onBack, onRefresh }) => {
  const [declarations, setDeclarations] = useState<Declaration[]>([])
  const [loading, setLoading] = useState(true)
  const [copiedId, setCopiedId] = useState<number | null>(null)
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null)
  const [deleting, setDeleting] = useState(false)

  // 加载声明列表
  useEffect(() => {
    loadDeclarations()
  }, [])

  const loadDeclarations = async () => {
    setLoading(true)
    const userId = getCurrentUserId()
    if (!userId) {
      setLoading(false)
      return
    }
    try {
      const data = await getDeclarations()
      setDeclarations(data)
    } catch (error) {
      console.error('加载声明列表失败:', error)
    } finally {
      setLoading(false)
    }
  }

  // 复制哈希值
  const copyToClipboard = async (text: string, id: number) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedId(id)
      setTimeout(() => setCopiedId(null), 2000)
    } catch (error) {
      console.error('复制失败:', error)
    }
  }

  // 删除声明
  const handleDelete = async (id: number) => {
    setDeleting(true)
    try {
      const success = await deleteDeclarationApi(id)
      if (success) {
        setDeclarations(prev => prev.filter(d => d.id !== id))
        setDeleteConfirm(null)
        onRefresh?.()
      } else {
        alert('删除失败，请重试')
      }
    } catch (error) {
      console.error('删除声明失败:', error)
      alert('删除失败，请重试')
    } finally {
      setDeleting(false)
    }
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

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="h-full flex flex-col"
    >
      {/* 顶部导航 */}
      <div className="flex-shrink-0 border-b border-white/10 p-3">
        <div className="flex items-center justify-between">
          <button
            onClick={onBack}
            className="w-9 h-9 rounded-xl bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
          >
            <span className="material-icons text-white text-lg">arrow_back</span>
          </button>
          <div className="flex items-center gap-2">
            <span className="material-icons text-purple-400 text-lg">list_alt</span>
            <span className="text-white font-semibold text-sm">声明记录</span>
          </div>
          <div className="w-9" />
        </div>
        {/* 统计卡片 */}
        <div className="grid grid-cols-4 gap-2 mt-3">
          <div className="p-2 rounded-lg bg-purple-500/10 border border-purple-500/20 text-center">
            <div className="text-lg font-bold text-purple-300">{declarations.length}</div>
            <div className="text-[9px] text-purple-200/70">总数</div>
          </div>
          <div className="p-2 rounded-lg bg-cyan-500/10 border border-cyan-500/20 text-center">
            <div className="text-lg font-bold text-cyan-300">
              {declarations.filter(d => d.declarationType === 'text').length}
            </div>
            <div className="text-[9px] text-cyan-200/70">文字</div>
          </div>
          <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-center">
            <div className="text-lg font-bold text-emerald-300">
              {declarations.filter(d => d.declarationType === 'file').length}
            </div>
            <div className="text-[9px] text-emerald-200/70">文件</div>
          </div>
          <div className="p-2 rounded-lg bg-amber-500/10 border border-amber-500/20 text-center">
            <div className="text-lg font-bold text-amber-300">
              {declarations.filter(d => d.declarationType === 'link').length}
            </div>
            <div className="text-[9px] text-amber-200/70">链接</div>
          </div>
        </div>
      </div>

      {/* 内容区域 */}
      <div className="flex-1 overflow-y-auto p-3">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="flex flex-col items-center gap-2">
              <span className="material-icons text-3xl text-purple-400 animate-spin">sync</span>
              <span className="text-blue-200/70 text-xs">加载中...</span>
            </div>
          </div>
        ) : declarations.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <span className="material-icons text-4xl text-purple-400/30 mb-3">inbox</span>
            <h3 className="text-sm font-medium text-white mb-1">暂无声明记录</h3>
            <p className="text-xs text-blue-200/70 mb-3">创建您的第一条知晓声明</p>
            <button
              onClick={onBack}
              className="px-4 py-2 rounded-xl bg-purple-500/20 border border-purple-500/50 text-purple-200 text-xs hover:bg-purple-500/30 transition-colors"
            >
              前往创建
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            {declarations.map((declaration, index) => (
              <motion.div
                key={declaration.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.03 }}
                className="p-3 rounded-xl bg-slate-900/75 border border-white/10"
              >
                {/* 头部信息 */}
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-purple-500/20 flex items-center justify-center">
                      <span className="material-icons text-purple-400 text-sm">
                        {getTypeIcon(declaration.declarationType)}
                      </span>
                    </div>
                    <div>
                      <h4 className="text-white text-sm font-medium truncate max-w-[120px]">
                        {declaration.knowledgeTopic || '无主题'}
                      </h4>
                      <div className="flex items-center gap-1 mt-0.5">
                        <span className={`px-1.5 py-0.5 rounded text-[9px] border ${getCategoryStyle(declaration.knowledgeCategory)}`}>
                          {declaration.knowledgeCategory || '未分类'}
                        </span>
                        <span className="text-[9px] text-blue-200/50">
                          #{declaration.blockIndex}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-[10px] text-blue-200/70">
                      ID: {declaration.id}
                    </div>
                    <div className="text-[9px] text-blue-200/50">
                      {declaration.timestampString || declaration.serverTimestamp}
                    </div>
                    {declaration.locationCity && (
                      <div className="text-[9px] text-blue-200/50">
                        {declaration.locationCity}
                      </div>
                    )}
                  </div>
                </div>

                {/* 哈希信息 */}
                <div className="p-1.5 rounded-lg bg-slate-950/80 mb-2">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[9px] text-cyan-400/70">{getTypeName(declaration.declarationType)}哈希</span>
                    <button
                      onClick={() => copyToClipboard(declaration.blockHash, declaration.id)}
                      className="flex items-center gap-1"
                    >
                      <span className="text-[9px] text-blue-200/70 font-mono truncate max-w-[100px]">
                        {declaration.blockHash.substring(0, 20)}...
                      </span>
                      <span className="material-icons text-[10px] text-blue-200/50">
                        {copiedId === declaration.id ? 'check' : 'content_copy'}
                      </span>
                    </button>
                  </div>
                  {/* 声明ID - 方便验证 */}
                  <div className="flex items-center justify-between">
                    <span className="text-[9px] text-purple-400/70">声明ID</span>
                    <button
                      onClick={() => copyToClipboard(String(declaration.id), declaration.id)}
                      className="flex items-center gap-1"
                    >
                      <span className="text-[9px] text-purple-300 font-mono">
                        #{declaration.id}
                      </span>
                      <span className="material-icons text-[10px] text-blue-200/50">
                        {copiedId === declaration.id ? 'check' : 'content_copy'}
                      </span>
                    </button>
                  </div>
                </div>

                {/* 操作按钮 */}
                <div className="flex gap-1.5">
                  <button
                    onClick={() => onVerify(declaration.id)}
                    className="flex-1 py-1.5 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs hover:bg-cyan-500/20 transition-colors flex items-center justify-center gap-1"
                  >
                    <span className="material-icons text-xs">verified</span>
                    验证
                  </button>
                  <button
                    onClick={() => onGenerateReport(declaration.id)}
                    className="flex-1 py-1.5 rounded-lg bg-purple-500/10 border border-purple-500/30 text-purple-300 text-xs hover:bg-purple-500/20 transition-colors flex items-center justify-center gap-1"
                  >
                    <span className="material-icons text-xs">description</span>
                    报告
                  </button>
                  <button
                    onClick={() => setDeleteConfirm(declaration.id)}
                    className="px-2 py-1.5 rounded-lg bg-red-500/10 border border-red-500/30 text-red-300 text-xs hover:bg-red-500/20 transition-colors flex items-center justify-center"
                  >
                    <span className="material-icons text-xs">delete</span>
                  </button>
                </div>

                {/* 删除确认弹窗 */}
                {deleteConfirm === declaration.id && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="mt-2 p-2 rounded-lg bg-red-500/10 border border-red-500/30"
                  >
                    <p className="text-xs text-red-200 mb-2 text-center">
                      确定要删除此声明吗？删除后不可恢复
                    </p>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setDeleteConfirm(null)}
                        className="flex-1 py-1.5 rounded-lg bg-white/5 border border-white/20 text-blue-200 text-xs hover:bg-white/10 transition-colors"
                      >
                        取消
                      </button>
                      <button
                        onClick={() => handleDelete(declaration.id)}
                        disabled={deleting}
                        className="flex-1 py-1.5 rounded-lg bg-red-500/30 border border-red-500/50 text-red-200 text-xs hover:bg-red-500/40 transition-colors disabled:opacity-50"
                      >
                        {deleting ? '删除中...' : '确认删除'}
                      </button>
                    </div>
                  </motion.div>
                )}
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  )
}

export default DeclarationList
