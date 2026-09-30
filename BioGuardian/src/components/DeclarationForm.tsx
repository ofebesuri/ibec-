// 主动知晓声明表单组件
import React, { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  checkUserHasKeys,
  generateUserKeys,
  createDeclaration,
  DeclarationResult
} from '../api'

interface DeclarationFormProps {
  onSuccess: (result: DeclarationResult) => void
  onCancel: () => void
}

type DeclarationType = 'text' | 'file' | 'link'
type KnowledgeCategory = '构思' | '现有技术' | '侵权线索'

const DeclarationForm: React.FC<DeclarationFormProps> = ({ onSuccess, onCancel }) => {
  // 表单状态
  const [declarationType, setDeclarationType] = useState<DeclarationType>('text')
  const [contentText, setContentText] = useState('')
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [linkUrl, setLinkUrl] = useState('')
  const [linkType, setLinkType] = useState<'patent' | 'doi' | 'paper'>('patent')
  const [knowledgeTopic, setKnowledgeTopic] = useState('')
  const [knowledgeCategory, setKnowledgeCategory] = useState<KnowledgeCategory>('构思')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  // UI状态
  const [step, setStep] = useState<'type' | 'content' | 'keys'>('type')
  const [hasKeys, setHasKeys] = useState<boolean | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isGeneratingKeys, setIsGeneratingKeys] = useState(false)
  const [error, setError] = useState('')
  const [filePreview, setFilePreview] = useState<string | null>(null)
  const [dragActive, setDragActive] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // 检查是否有密钥
  useEffect(() => {
    const checkKeys = async () => {
      const result = await checkUserHasKeys()
      setHasKeys(result)
    }
    checkKeys()
  }, [])

  // 文件拖拽处理
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0])
    }
  }

  const handleFileSelect = (file: File) => {
    if (file.size > 50 * 1024 * 1024) {
      setError('文件大小不能超过50MB')
      return
    }
    setSelectedFile(file)
    setError('')
    // 生成预览
    if (file.type.startsWith('image/')) {
      const reader = new FileReader()
      reader.onload = (e) => setFilePreview(e.target?.result as string)
      reader.readAsDataURL(file)
    } else {
      setFilePreview(null)
    }
  }

  // 验证表单
  const validateForm = (): boolean => {
    if (!knowledgeTopic.trim()) {
      setError('请输入知晓主题')
      return false
    }
    if (declarationType === 'text' && !contentText.trim()) {
      setError('请输入声明内容')
      return false
    }
    if (declarationType === 'file' && !selectedFile) {
      setError('请选择文件')
      return false
    }
    if (declarationType === 'link' && !linkUrl.trim()) {
      setError('请输入文献链接')
      return false
    }
    // 无密钥时：需要设置密码来生成密钥
    if (!hasKeys) {
      if (!password.trim()) {
        setError('请输入密码用于加密您的私钥')
        return false
      }
      if (password.length < 6) {
        setError('密码长度至少6位')
        return false
      }
      if (password !== confirmPassword) {
        setError('两次密码输入不一致')
        return false
      }
    } else {
      // 有密钥时：需要输入签名密码来解密私钥进行签名
      if (!password.trim()) {
        setError('请输入签名密码解密私钥进行签名')
        return false
      }
    }
    return true
  }

  // 生成密钥对
  const handleGenerateKeys = async () => {
    if (password.length < 6) {
      setError('密码长度至少6位')
      return
    }
    if (password !== confirmPassword) {
      setError('两次密码输入不一致')
      return
    }
    setIsGeneratingKeys(true)
    setError('')
    try {
      await generateUserKeys(password)
      setHasKeys(true)
      setStep('content')
    } catch (err: any) {
      setError(err.message || '生成密钥失败')
    } finally {
      setIsGeneratingKeys(false)
    }
  }

  // 提交声明
  const handleSubmit = async () => {
    if (!validateForm()) return
    setIsLoading(true)
    setError('')
    try {
      const result = await createDeclaration({
        declarationType,
        contentText: declarationType === 'text' ? contentText : undefined,
        file: declarationType === 'file' ? selectedFile! : undefined,
        linkUrl: declarationType === 'link' ? linkUrl : undefined,
        linkType: declarationType === 'link' ? linkType : undefined,
        knowledgeTopic,
        knowledgeCategory,
        password
      })
      onSuccess(result)
    } catch (err: any) {
      setError(err.message || '创建声明失败')
    } finally {
      setIsLoading(false)
    }
  }

  // 渲染步骤1：选择声明类型
  const renderTypeSelection = () => (
    <div className="space-y-3">
      <h3 className="text-base font-semibold text-white text-center mb-4">选择声明方式</h3>
      <div className="grid grid-cols-3 gap-2">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => { setDeclarationType('text'); setStep('content') }}
          className={`p-3 rounded-xl border-2 transition-all ${
            declarationType === 'text'
              ? 'border-purple-500 bg-purple-500/20'
              : 'border-white/10 bg-white/5 hover:border-white/20'
          }`}
        >
          <span className="material-icons text-2xl text-purple-400 mb-1">edit_note</span>
          <div className="text-white font-medium text-xs">文字声明</div>
          <div className="text-[10px] text-blue-200/70 mt-0.5">构思、线索</div>
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => { setDeclarationType('file'); setStep('content') }}
          className={`p-3 rounded-xl border-2 transition-all ${
            declarationType === 'file'
              ? 'border-purple-500 bg-purple-500/20'
              : 'border-white/10 bg-white/5 hover:border-white/20'
          }`}
        >
          <span className="material-icons text-2xl text-cyan-400 mb-1">attach_file</span>
          <div className="text-white font-medium text-xs">文件上传</div>
          <div className="text-[10px] text-blue-200/70 mt-0.5">草稿、PDF</div>
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => { setDeclarationType('link'); setStep('content') }}
          className={`p-3 rounded-xl border-2 transition-all ${
            declarationType === 'link'
              ? 'border-purple-500 bg-purple-500/20'
              : 'border-white/10 bg-white/5 hover:border-white/20'
          }`}
        >
          <span className="material-icons text-2xl text-emerald-400 mb-1">link</span>
          <div className="text-white font-medium text-xs">文献链接</div>
          <div className="text-[10px] text-blue-200/70 mt-0.5">专利、论文</div>
        </motion.button>
      </div>
    </div>
  )

  // 渲染步骤2：输入内容
  const renderContentInput = () => (
    <div className="space-y-3">
      <h3 className="text-base font-semibold text-white text-center mb-3">填写声明内容</h3>

      {/* 知晓主题 */}
      <div>
        <label className="block text-xs text-blue-200/70 mb-1">
          知晓主题 <span className="text-red-400">*</span>
        </label>
        <input
          type="text"
          value={knowledgeTopic}
          onChange={(e) => setKnowledgeTopic(e.target.value)}
          placeholder="如：电机驱动方案..."
          className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-sm placeholder-blue-200/40 focus:outline-none focus:border-purple-500/50"
        />
      </div>

      {/* 知晓分类 */}
      <div>
        <label className="block text-xs text-blue-200/70 mb-1">知晓类型</label>
        <div className="flex gap-1.5">
          {(['构思', '现有技术', '侵权线索'] as KnowledgeCategory[]).map((cat) => (
            <button
              key={cat}
              onClick={() => setKnowledgeCategory(cat)}
              className={`px-3 py-1.5 rounded-full text-xs transition-all ${
                knowledgeCategory === cat
                  ? 'bg-purple-500/30 border border-purple-500/60 text-purple-200'
                  : 'bg-white/5 border border-white/10 text-blue-200/70 hover:border-white/20'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* 文字内容 */}
      {declarationType === 'text' && (
        <div>
          <label className="block text-xs text-blue-200/70 mb-1">
            声明内容 <span className="text-red-400">*</span>
          </label>
          <textarea
            value={contentText}
            onChange={(e) => setContentText(e.target.value)}
            placeholder="记录您的知晓内容，如技术方案构思、侵权线索描述..."
            rows={4}
            className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-sm placeholder-blue-200/40 focus:outline-none focus:border-purple-500/50 resize-none"
          />
          <div className="text-[10px] text-blue-200/50 mt-1 text-right">{contentText.length} 字符</div>
        </div>
      )}

      {/* 文件上传 */}
      {declarationType === 'file' && (
        <div>
          <label className="block text-xs text-blue-200/70 mb-1">
            选择文件 <span className="text-red-400">*</span>
          </label>
          <div
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`p-4 rounded-xl border-2 border-dashed transition-all cursor-pointer ${
              dragActive
                ? 'border-purple-500 bg-purple-500/10'
                : 'border-white/20 bg-white/5 hover:border-white/30'
            }`}
          >
            {selectedFile ? (
              <div className="text-center">
                <span className="material-icons text-2xl text-purple-400 mb-1">description</span>
                <div className="text-white text-xs">{selectedFile.name}</div>
              </div>
            ) : (
              <div className="text-center">
                <span className="material-icons text-2xl text-purple-400 mb-1">cloud_upload</span>
                <div className="text-white text-xs">点击上传文件</div>
                <div className="text-blue-200/50 text-[10px] mt-0.5">支持 PDF、图片、Word、Excel</div>
              </div>
            )}
          </div>
          <input
            ref={fileInputRef}
            type="file"
            onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
            accept=".pdf,.jpg,.jpeg,.png,.doc,.docx,.xls,.xlsx"
            className="hidden"
          />
        </div>
      )}

      {/* 文献链接 */}
      {declarationType === 'link' && (
        <div>
          <label className="block text-xs text-blue-200/70 mb-1">
            文献链接 <span className="text-red-400">*</span>
          </label>
          <div className="flex gap-1 mb-2">
            {(['patent', 'doi', 'paper'] as const).map((type) => (
              <button
                key={type}
                onClick={() => setLinkType(type)}
                className={`px-2 py-1 rounded-lg text-[10px] transition-all ${
                  linkType === type
                    ? 'bg-purple-500/30 border border-purple-500/60 text-purple-200'
                    : 'bg-white/5 border border-white/10 text-blue-200/70'
                }`}
              >
                {type === 'patent' ? '专利号' : type === 'doi' ? 'DOI' : '论文'}
              </button>
            ))}
          </div>
          <input
            type="text"
            value={linkUrl}
            onChange={(e) => setLinkUrl(e.target.value)}
            placeholder={
              linkType === 'patent'
                ? '如：CN202310123456'
                : linkType === 'doi'
                ? '如：10.1000/xyz123'
                : '如：https://...'
            }
            className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-sm placeholder-blue-200/40 focus:outline-none focus:border-purple-500/50"
          />
        </div>
      )}

      {/* 密钥设置（如果没有密钥） */}
      {!hasKeys && (
        <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30">
          <div className="flex items-center gap-2 mb-2">
            <span className="material-icons text-amber-400 text-base">key</span>
            <span className="text-amber-200 font-medium text-xs">设置签名密码</span>
          </div>
          <p className="text-[10px] text-amber-200/70 mb-2">
            此密码用于加密您的RSA私钥（提交声明时需输入解密私钥进行签名），请妥善保管
          </p>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="设置密码（至少6位）"
            className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-sm placeholder-blue-200/40 focus:outline-none focus:border-purple-500/50 mb-2"
          />
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="确认密码"
            className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-sm placeholder-blue-200/40 focus:outline-none focus:border-purple-500/50"
          />
        </div>
      )}

      {/* 已有密钥时显示密码输入框 */}
      {hasKeys && (
        <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30">
          <div className="flex items-center gap-2 mb-2">
            <span className="material-icons text-emerald-400 text-base">lock_open</span>
            <span className="text-emerald-200 font-medium text-xs">输入签名密码</span>
          </div>
          <p className="text-[10px] text-emerald-200/70 mb-2">
            请输入签名密码解密私钥进行签名
          </p>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="输入签名密码"
            className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-sm placeholder-blue-200/40 focus:outline-none focus:border-emerald-500/50"
          />
        </div>
      )}

      {/* 错误提示 */}
      {error && (
        <div className="p-2 rounded-xl bg-red-500/10 border border-red-500/30 text-red-200 text-xs">
          {error}
        </div>
      )}
    </div>
  )

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
            onClick={step === 'type' ? onCancel : () => setStep('type')}
            className="w-9 h-9 rounded-xl bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
          >
            <span className="material-icons text-white text-lg">arrow_back</span>
          </button>
          <div className="flex items-center gap-2">
            <span className="material-icons text-purple-400 text-lg">edit_document</span>
            <span className="text-white font-semibold text-sm">主动知晓声明</span>
          </div>
          <div className="w-9" />
        </div>
        {/* 进度指示 */}
        <div className="flex gap-2 mt-3">
          <div className={`flex-1 h-1 rounded-full ${step === 'type' || step === 'content' || step === 'keys' ? 'bg-purple-500' : 'bg-white/10'}`} />
          <div className={`flex-1 h-1 rounded-full ${step === 'content' || step === 'keys' ? 'bg-purple-500' : 'bg-white/10'}`} />
        </div>
      </div>

      {/* 内容区域 - 可滚动 */}
      <div className="flex-1 overflow-y-auto p-4">
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            {step === 'type' && renderTypeSelection()}
            {step === 'content' && renderContentInput()}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* 底部操作栏 */}
      {step === 'content' && (
        <div className="flex-shrink-0 border-t border-white/10 p-3">
          <div className="flex gap-3">
            {!hasKeys && password.length >= 6 && password === confirmPassword && (
              <button
                onClick={handleGenerateKeys}
                disabled={isGeneratingKeys}
                className="px-4 py-2.5 rounded-xl bg-amber-500/20 border border-amber-500/50 text-amber-200 font-medium text-sm hover:bg-amber-500/30 transition-colors disabled:opacity-50"
              >
                {isGeneratingKeys ? '生成中...' : '生成密钥'}
              </button>
            )}
            <button
              onClick={handleSubmit}
              disabled={isLoading || (!hasKeys && !password)}
              className="flex-1 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-purple-500 text-white font-semibold text-sm hover:from-purple-500 hover:to-purple-400 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <span className="material-icons animate-spin text-lg">sync</span>
                  存证中...
                </>
              ) : (
                <>
                  <span className="material-icons text-lg">save</span>
                  提交声明
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* 功能说明 */}
      <div className="flex-shrink-0 p-3 border-t border-white/10">
        <div className="p-3 rounded-xl bg-slate-900/50 border border-white/10">
          <h4 className="text-xs font-medium text-purple-300 mb-2 flex items-center gap-2">
            <span className="material-icons text-xs">info</span>
            技术说明
          </h4>
          <ul className="text-[10px] text-blue-200/70 space-y-0.5">
            <li>• SHA-256 哈希确保内容唯一性</li>
            <li>• RSA-2048 签名验证身份</li>
            <li>• 签名密码用于解密本地私钥，非数据库密码</li>
            <li className="text-amber-300">• 存证效力只及于存证之日后</li>
          </ul>
        </div>
      </div>
    </motion.div>
  )
}

export default DeclarationForm
