// 司法报告生成器组件
import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { generateReport, ReportData } from '../api'

interface ReportGeneratorProps {
  declarationId: number
  onBack: () => void
}

const ReportGenerator: React.FC<ReportGeneratorProps> = ({ declarationId, onBack }) => {
  const [report, setReport] = useState<ReportData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [copiedSection, setCopiedSection] = useState<string | null>(null)

  useEffect(() => {
    const loadReport = async () => {
      setLoading(true)
      setError('')
      try {
        const data = await generateReport(declarationId)
        setReport(data)
      } catch (err: any) {
        setError(err.message || '生成报告失败')
      } finally {
        setLoading(false)
      }
    }
    loadReport()
  }, [declarationId])

  // 复制到剪贴板
  const copyToClipboard = async (text: string, section: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedSection(section)
      setTimeout(() => setCopiedSection(null), 2000)
    } catch (error) {
      console.error('复制失败:', error)
    }
  }

  // 下载报告
  const downloadReport = () => {
    if (!report) return
    const reportText = generateReportText(report)
    const blob = new Blob([reportText], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `BioGuardian_Report_${report.reportId}.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  // 生成纯文本报告
  const generateReportText = (r: ReportData): string => {
    return `
================================================================================
                    BioGuardian 专利时间证据链系统
                        电 子 存 证 鉴 证 报 告
================================================================================

报告编号: ${r.reportId}
生成时间: ${r.generatedAt}

--------------------------------------------------------------------------------
                              第一部分：声明基本信息
--------------------------------------------------------------------------------

声明序号: ${r.declaration.declarationId}
区块序号: #${r.declaration.blockIndex}
用户ID: ${r.declaration.userId}

知晓主题: ${r.declaration.knowledgeTopic}
知晓类型: ${r.declaration.knowledgeCategory}
声明方式: ${r.declaration.declarationType}

存证时间: ${r.declaration.timestampString}
存证地点: ${r.declaration.locationCity}
IP地址: ${r.declaration.ipAddress}

--------------------------------------------------------------------------------
                              第二部分：内容详情
--------------------------------------------------------------------------------

声明类型: ${r.content.type}
${r.content.text ? `声明内容: ${r.content.text}` : ''}
${r.content.fileHash ? `文件哈希: ${r.content.fileHash}` : ''}
${r.content.linkUrl ? `文献链接: ${r.content.linkUrl}` : ''}
${r.content.linkType ? `链接类型: ${r.content.linkType}` : ''}
内容摘要: ${r.content.contentSummary}

--------------------------------------------------------------------------------
                              第三部分：真实性验证
--------------------------------------------------------------------------------

1. 内容哈希验证
   验证结果: ${r.verification.hashComparison.passed ? '通过' : '失败'}
   计算哈希: ${r.verification.hashComparison.computed}
   存储哈希: ${r.verification.hashComparison.stored}

2. 区块哈希验证
   验证结果: ${r.verification.blockHashValidation.passed ? '通过' : '失败'}
   计算哈希: ${r.verification.blockHashValidation.computed}
   存储哈希: ${r.verification.blockHashValidation.stored}

3. 时间戳验证
   验证结果: ${r.verification.timestampValidation.passed ? '通过' : '失败'}
   时间戳: ${r.verification.timestampValidation.timestamp}

4. 哈希链完整性验证
   验证结果: ${r.verification.chainIntegrity.passed ? '通过' : '失败'}
   详情: ${r.verification.chainIntegrity.details}

--------------------------------------------------------------------------------
                              第四部分：哈希值记录
--------------------------------------------------------------------------------

内容哈希: ${r.hashes.contentHash}
区块哈希: ${r.hashes.blockHash}
前驱哈希: ${r.hashes.previousHash}
创世哈希: ${r.hashes.genesisHash}

--------------------------------------------------------------------------------
                              第四部分：法律声明
--------------------------------------------------------------------------------

1. 本报告由BioGuardian专利时间证据链系统自动生成。

2. 本报告基于区块链哈希链技术，确保数据不可篡改。

3. 本报告中的时间戳为服务器记录的可信时间，具有法律效力。

4. 本报告的电子签名使用RSA-2048算法，可验证签名人身份。

5. 本报告可作为知识产权归属纠纷中的时间证据参考。

6. 本报告不构成法律意见，具体法律效力由法院或仲裁机构认定。

================================================================================
                    BioGuardian - 知识产权时间证据链守护者
================================================================================
`
  }

  if (loading) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="h-full flex items-center justify-center"
      >
        <div className="flex flex-col items-center gap-3">
          <span className="material-icons text-4xl text-purple-400 animate-spin">sync</span>
          <span className="text-blue-200/70 text-sm">正在生成报告...</span>
        </div>
      </motion.div>
    )
  }

  if (error) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="h-full flex items-center justify-center p-4"
      >
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-center">
          <span className="material-icons text-4xl text-red-400 mb-3">error</span>
          <h3 className="text-sm font-medium text-red-300 mb-1">生成报告失败</h3>
          <p className="text-xs text-red-200/70 mb-3">{error}</p>
          <button
            onClick={onBack}
            className="px-4 py-2 rounded-xl bg-red-500/20 border border-red-500/50 text-red-200 text-xs hover:bg-red-500/30 transition-colors"
          >
            返回
          </button>
        </div>
      </motion.div>
    )
  }

  if (!report) return null

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
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
            <span className="material-icons text-purple-400 text-lg">description</span>
            <span className="text-white font-semibold text-sm">司法报告</span>
          </div>
          <button
            onClick={downloadReport}
            className="px-3 py-1.5 rounded-xl bg-purple-500/20 border border-purple-500/50 text-purple-200 text-xs hover:bg-purple-500/30 transition-colors flex items-center gap-1"
          >
            <span className="material-icons text-xs">download</span>
            下载
          </button>
        </div>
        {/* 报告编号 */}
        <div className="mt-2 p-2 rounded-lg bg-purple-500/10 border border-purple-500/20">
          <div className="text-center">
            <span className="text-[10px] text-purple-300/70">报告编号</span>
            <div className="text-purple-300 font-mono font-medium text-xs">{report.reportId}</div>
          </div>
        </div>
      </div>

      {/* 报告内容 */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3 pb-4">
        {/* 第一部分：声明基本信息 */}
        <div className="p-3 rounded-xl bg-slate-900/75 border border-white/10">
          <h3 className="text-white font-medium text-sm mb-3 flex items-center gap-2">
            <span className="material-icons text-purple-400 text-base">info</span>
            声明信息
          </h3>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="p-2 rounded-lg bg-white/5">
              <div className="text-blue-200/50 text-[9px] mb-0.5">区块</div>
              <div className="text-white">#{report.declaration.blockIndex}</div>
            </div>
            <div className="p-2 rounded-lg bg-white/5">
              <div className="text-blue-200/50 text-[9px] mb-0.5">类型</div>
              <div className="text-white">{report.declaration.declarationType}</div>
            </div>
            <div className="p-2 rounded-lg bg-white/5 col-span-2">
              <div className="text-blue-200/50 text-[9px] mb-0.5">知晓主题</div>
              <div className="text-white">{report.declaration.knowledgeTopic || '无'}</div>
            </div>
            <div className="p-2 rounded-lg bg-white/5 col-span-2">
              <div className="text-blue-200/50 text-[9px] mb-0.5">存证时间</div>
              <div className="text-white font-mono text-[10px]">{report.declaration.timestampString}</div>
            </div>
          </div>
        </div>

        {/* 第二部分：内容详情 */}
        <div className="p-3 rounded-xl bg-slate-900/75 border border-white/10">
          <h3 className="text-white font-medium text-sm mb-3 flex items-center gap-2">
            <span className="material-icons text-cyan-400 text-base">article</span>
            内容详情
          </h3>
          <div className="space-y-2 text-xs">
            <div className="flex justify-between p-2 rounded bg-white/5">
              <span className="text-blue-200/50">类型</span>
              <span className="text-white">{report.content.type}</span>
            </div>
            {report.content.text && (
              <div className="p-2 rounded bg-white/5">
                <div className="text-blue-200/50 text-[9px] mb-1">声明内容</div>
                <div className="text-white text-xs">{report.content.text.substring(0, 100)}...</div>
              </div>
            )}
            {report.content.fileHash && (
              <div className="flex justify-between p-2 rounded bg-white/5">
                <span className="text-blue-200/50">文件哈希</span>
                <span className="text-white font-mono text-[10px]">{report.content.fileHash.substring(0, 20)}...</span>
              </div>
            )}
            <div className="p-2 rounded bg-white/5">
              <div className="text-blue-200/50 text-[9px] mb-1">内容摘要</div>
              <div className="text-white text-xs">{report.content.contentSummary}</div>
            </div>
          </div>
        </div>

        {/* 第三部分：真实性验证 */}
        <div className="p-3 rounded-xl bg-slate-900/75 border border-white/10">
          <h3 className="text-white font-medium text-sm mb-3 flex items-center gap-2">
            <span className="material-icons text-emerald-400 text-base">verified</span>
            真实性验证
          </h3>
          <div className="space-y-1">
            <VerificationRow
              label="内容哈希"
              passed={report.verification.hashComparison.passed}
              detail={report.verification.hashComparison.computed.substring(0, 20) + '...'}
            />
            <VerificationRow
              label="区块哈希"
              passed={report.verification.blockHashValidation.passed}
              detail={report.verification.blockHashValidation.computed.substring(0, 20) + '...'}
            />
            <VerificationRow
              label="哈希链"
              passed={report.verification.chainIntegrity.passed}
              detail="完整"
            />
          </div>
        </div>

        {/* 第四部分：法律声明 */}
        <div className="p-3 rounded-xl bg-slate-900/75 border border-white/10">
          <h3 className="text-white font-medium text-sm mb-3 flex items-center gap-2">
            <span className="material-icons text-red-400 text-base">gavel</span>
            法律声明
          </h3>
          <ul className="text-xs text-blue-200/70 space-y-1">
            <li>1. 由BioGuardian系统自动生成</li>
            <li>2. 区块链哈希链确保数据不可篡改</li>
            <li>3. 时间戳具有法律效力</li>
            <li className="text-amber-300">4. 存证效力只及于存证之日后</li>
          </ul>
        </div>
      </div>
    </motion.div>
  )
}

// 验证行组件
const VerificationRow: React.FC<{ label: string; passed: boolean; detail: string }> = ({
  label,
  passed,
  detail
}) => (
  <div className="flex items-center justify-between p-2 rounded-lg bg-white/5">
    <div className="flex items-center gap-2">
      <span className={`material-icons text-base ${passed ? 'text-emerald-400' : 'text-red-400'}`}>
        {passed ? 'check_circle' : 'cancel'}
      </span>
      <div>
        <div className="text-white text-xs">{label}</div>
        <div className="text-blue-200/50 text-[9px] font-mono">{detail}</div>
      </div>
    </div>
    <span className={`px-2 py-0.5 rounded text-[10px] ${passed ? 'bg-emerald-500/20 text-emerald-300' : 'bg-red-500/20 text-red-300'}`}>
      {passed ? '通过' : '失败'}
    </span>
  </div>
)

export default ReportGenerator
