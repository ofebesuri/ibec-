// 验证查询面板组件
import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { verifyDeclaration, VerifyResult, Declaration } from '../api'
import { getDeclarationByIdAny } from '../db/declarations'

interface VerificationPanelProps {
  declarationId?: number
  onBack: () => void
  onGenerateReport?: (id: number) => void
}

const VerificationPanel: React.FC<VerificationPanelProps> = ({ declarationId, onBack, onGenerateReport }) => {
  const [inputId, setInputId] = useState('')
  const [publicKey, setPublicKey] = useState('')
  const [verifying, setVerifying] = useState(false)
  const [result, setResult] = useState<VerifyResult | null>(null)
  const [error, setError] = useState('')

  // 如果传入了declarationId，直接验证
  useEffect(() => {
    if (declarationId) {
      setInputId(String(declarationId))
      handleVerify(String(declarationId))
    }
  }, [declarationId])

  // 验证声明
  const handleVerify = async (id?: string) => {
    const verifyId = id || inputId.trim()
    if (!verifyId) {
      setError('请输入声明ID')
      return
    }

    setVerifying(true)
    setError('')
    setResult(null)

    try {
      // 如果没有提供公钥，尝试获取声明者的公钥
      let pubKey = publicKey.trim()
      if (!pubKey) {
        // 尝试从数据库获取声明创建者的公钥
        const decl = await getDeclarationByIdAny(parseInt(verifyId))
        if (decl) {
          // 提示用户需要提供公钥
          setError('请提供声明创建者的公钥以进行验证')
          setVerifying(false)
          return
        }
      }

      const verifyResult = await verifyDeclaration(parseInt(verifyId), pubKey)
      setResult(verifyResult)
    } catch (err: any) {
      setError(err.message || '验证失败')
    } finally {
      setVerifying(false)
    }
  }

  // 获取状态图标和颜色
  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'valid':
        return {
          icon: 'verified',
          color: 'text-emerald-400',
          bg: 'bg-emerald-500/20',
          border: 'border-emerald-500/30',
          label: '验证通过'
        }
      case 'invalid':
        return {
          icon: 'cancel',
          color: 'text-red-400',
          bg: 'bg-red-500/20',
          border: 'border-red-500/30',
          label: '验证失败'
        }
      case 'warning':
        return {
          icon: 'warning',
          color: 'text-amber-400',
          bg: 'bg-amber-500/20',
          border: 'border-amber-500/30',
          label: '存在警告'
        }
      default:
        return {
          icon: 'help',
          color: 'text-blue-400',
          bg: 'bg-blue-500/20',
          border: 'border-blue-500/30',
          label: '未找到'
        }
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
            <span className="material-icons text-cyan-400 text-lg">search</span>
            <span className="text-white font-semibold text-sm">查询验证</span>
          </div>
          <div className="w-9" />
        </div>
      </div>

      {/* 内容区域 */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        {/* 验证说明 */}
        <div className="p-3 rounded-xl bg-cyan-500/5 border border-cyan-500/20">
          <div className="flex items-center gap-2 text-cyan-300 text-xs mb-1">
            <span className="material-icons text-sm">info</span>
            <span className="font-medium">验证说明</span>
          </div>
          <div className="text-[10px] text-cyan-200/70 space-y-1">
            <p>• <span className="text-cyan-300">验证自己的声明</span>：无需输入公钥</p>
            <p>• <span className="text-cyan-300">验证他人声明</span>：需提供对方的公钥</p>
            <p>• 公钥可在"声明记录"中查看并复制分享</p>
          </div>
        </div>

        {/* 输入区域 */}
        <div className="p-3 rounded-xl bg-slate-900/75 border border-white/10">
          <h3 className="text-white font-medium text-sm mb-2 flex items-center gap-2">
            <span className="material-icons text-cyan-400 text-base">qr_code</span>
            输入声明信息
          </h3>
          <div className="space-y-3">
            {/* 声明ID输入 */}
            <div>
              <label className="text-[10px] text-blue-200/70 mb-1 block">声明ID</label>
              <input
                type="number"
                value={inputId}
                onChange={(e) => setInputId(e.target.value)}
                placeholder="输入声明ID"
                className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-sm placeholder-blue-200/40 focus:outline-none focus:border-cyan-500/50"
              />
            </div>
            {/* 公钥输入 */}
            <div>
              <label className="text-[10px] text-blue-200/70 mb-1 block">
                公钥 <span className="text-amber-400">(验证他人声明时必填)</span>
              </label>
              <textarea
                value={publicKey}
                onChange={(e) => setPublicKey(e.target.value)}
                placeholder="输入声明创建者的公钥 (PEM格式)"
                rows={3}
                className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-xs placeholder-blue-200/40 focus:outline-none focus:border-cyan-500/50 font-mono resize-none"
              />
            </div>
            <button
              onClick={() => handleVerify()}
              disabled={verifying}
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 to-cyan-500 text-white font-medium text-sm hover:from-cyan-500 hover:to-cyan-400 transition-all disabled:opacity-50 flex items-center justify-center gap-1"
            >
              {verifying ? (
                <>
                  <span className="material-icons animate-spin text-base">sync</span>
                  验证中...
                </>
              ) : (
                <>
                  <span className="material-icons text-base">verified</span>
                  验证
                </>
              )}
            </button>
          </div>
        </div>

        {/* 错误提示 */}
        {error && (
          <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30">
            <div className="flex items-center gap-2 text-red-300 text-sm">
              <span className="material-icons text-base">error</span>
              <span>{error}</span>
            </div>
          </div>
        )}

        {/* 验证结果 */}
        <AnimatePresence>
          {result && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-3"
            >
              {/* 状态卡片 */}
              <div className={`p-4 rounded-xl ${getStatusStyle(result.status).bg} border ${getStatusStyle(result.status).border}`}>
                <div className="flex items-center gap-3">
                  <span className={`material-icons text-3xl ${getStatusStyle(result.status).color}`}>
                    {getStatusStyle(result.status).icon}
                  </span>
                  <div>
                    <div className={`text-lg font-bold ${getStatusStyle(result.status).color}`}>
                      {getStatusStyle(result.status).label}
                    </div>
                    <div className="text-xs text-blue-200/70 mt-0.5">
                      {result.message}
                    </div>
                  </div>
                </div>
              </div>

              {/* 声明信息 */}
              {result.declaration && (
                <div className="p-3 rounded-xl bg-slate-900/75 border border-white/10">
                  <h4 className="text-white font-medium text-sm mb-2 flex items-center gap-2">
                    <span className="material-icons text-purple-400 text-base">info</span>
                    声明信息
                  </h4>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="p-2 rounded bg-white/5">
                      <div className="text-blue-200/50 text-[10px]">区块序号</div>
                      <div className="text-white font-medium">#{result.declaration.blockIndex}</div>
                    </div>
                    <div className="p-2 rounded bg-white/5">
                      <div className="text-blue-200/50 text-[10px]">声明类型</div>
                      <div className="text-white font-medium">{result.declaration.declarationType}</div>
                    </div>
                    <div className="p-2 rounded bg-white/5 col-span-2">
                      <div className="text-blue-200/50 text-[10px]">知晓主题</div>
                      <div className="text-white">{result.declaration.knowledgeTopic || '无'}</div>
                    </div>
                    <div className="p-2 rounded bg-white/5 col-span-2">
                      <div className="text-blue-200/50 text-[10px]">时间戳</div>
                      <div className="text-white font-mono text-[10px]">{result.declaration.timestampString}</div>
                    </div>
                  </div>
                </div>
              )}

              {/* 验证详情 */}
              <div className="p-3 rounded-xl bg-slate-900/75 border border-white/10">
                <h4 className="text-white font-medium text-sm mb-2 flex items-center gap-2">
                  <span className="material-icons text-cyan-400 text-base">rule</span>
                  验证详情
                </h4>
                <div className="space-y-1">
                  <VerificationItem
                    label="内容哈希"
                    passed={result.details.isHashValid}
                    value={result.details.computedContentHash?.substring(0, 20) + '...'}
                  />
                  <VerificationItem
                    label="区块哈希"
                    passed={result.details.isBlockHashValid}
                    value={result.details.computedBlockHash?.substring(0, 20) + '...'}
                  />
                  <VerificationItem
                    label="哈希链"
                    passed={result.details.isChainValid}
                    value="完整"
                  />
                </div>
              </div>

              {/* 生成报告按钮 */}
              {result.declaration && onGenerateReport && (
                <button
                  onClick={() => onGenerateReport(result.declaration!.id)}
                  className="w-full py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-purple-500 text-white font-semibold text-sm hover:from-purple-500 hover:to-purple-400 transition-all flex items-center justify-center gap-2"
                >
                  <span className="material-icons text-base">description</span>
                  生成司法报告
                </button>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  )
}

// 验证项组件
const VerificationItem: React.FC<{ label: string; passed: boolean; value?: string }> = ({
  label,
  passed,
  value
}) => (
  <div className="flex items-center justify-between p-2 rounded-lg bg-white/5">
    <div className="flex items-center gap-2">
      <span className={`material-icons text-base ${passed ? 'text-emerald-400' : 'text-red-400'}`}>
        {passed ? 'check_circle' : 'cancel'}
      </span>
      <span className="text-blue-200/70 text-xs">{label}</span>
    </div>
    <div className="flex items-center gap-2">
      {value && (
        <span className="text-[9px] text-blue-200/50 font-mono truncate max-w-[80px]">{value}</span>
      )}
      <span className={`text-[9px] px-1.5 py-0.5 rounded ${passed ? 'bg-emerald-500/20 text-emerald-300' : 'bg-red-500/20 text-red-300'}`}>
        {passed ? '通过' : '失败'}
      </span>
    </div>
  </div>
)

export default VerificationPanel
