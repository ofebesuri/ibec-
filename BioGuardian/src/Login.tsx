import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { login, register, storeUser, resetPassword } from './api'

// 当前应用版本号
const APP_VERSION = '1.0.0'

interface LoginProps {
  onLogin: () => void
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [loginType, setLoginType] = useState('account')
  const [account, setAccount] = useState('')
  const [password, setPassword] = useState('')
  const [loginError, setLoginError] = useState('')
  const [showWelcome, setShowWelcome] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  
  // 注册相关状态
  const [showRegister, setShowRegister] = useState(false)
  const [regUsername, setRegUsername] = useState('')
  const [regPhone, setRegPhone] = useState('')
  const [regPwd, setRegPwd] = useState('')
  const [regPwd2, setRegPwd2] = useState('')
  const [regError, setRegError] = useState('')
  const [regSuccess, setRegSuccess] = useState(false)
  const [isRegLoading, setIsRegLoading] = useState(false)

  // 找回密码相关状态
  const [showForgotPwd, setShowForgotPwd] = useState(false)
  const [forgotUsername, setForgotUsername] = useState('')
  const [forgotPhone, setForgotPhone] = useState('')
  const [forgotPwd, setForgotPwd] = useState('')
  const [forgotPwd2, setForgotPwd2] = useState('')
  const [forgotError, setForgotError] = useState('')
  const [forgotSuccess, setForgotSuccess] = useState(false)
  const [forgotLoading, setForgotLoading] = useState(false)

  // 账号密码登录
  const handleAccountLogin = async () => {
    if (!account || !password) {
      setLoginError('请输入账号和密码')
      return
    }
    setLoginError('')
    setIsLoading(true)
    try {
      const result = await login(account, password)
      if (result.user) {
        storeUser(result.user)
        setShowWelcome(true)
        setTimeout(() => {
          onLogin()
        }, 1500)
      }
    } catch (error: any) {
      setLoginError(error.message || '登录失败，请稍后重试')
    } finally {
      setIsLoading(false)
    }
  }

  // 模拟第三方登录
  const handleThirdPartyLogin = (type: string) => {
    setLoginError('')
    setShowWelcome(true)
    setTimeout(() => {
      onLogin()
    }, 2000)
  }

  // 注册提交
  const handleRegister = async () => {
    if (!regUsername || regUsername.length < 3) {
      setRegError('账号长度至少3位')
      return
    }
    if (!regPhone || regPhone.length !== 11) {
      setRegError('请填写11位手机号码')
      return
    }
    if (!regPwd || regPwd.length < 6) {
      setRegError('密码长度至少6位')
      return
    }
    if (regPwd !== regPwd2) {
      setRegError('两次密码输入不一致')
      return
    }
    setRegError('')
    setIsRegLoading(true)
    try {
      const result = await register({
        username: regUsername,
        password: regPwd,
        phone: regPhone,
      })
      if (result.user) {
        storeUser(result.user)
        setRegSuccess(true)
        setTimeout(() => {
          setShowRegister(false)
          setRegSuccess(false)
          onLogin()
        }, 1500)
      }
    } catch (error: any) {
      setRegError(error.message || '注册失败，请稍后重试')
    } finally {
      setIsRegLoading(false)
    }
  }

  // 找回密码提交
  const handleForgotPwdReset = async () => {
    if (!forgotUsername || forgotUsername.length < 3) {
      setForgotError('请输入账号（至少3位）')
      return
    }
    if (!forgotPhone || forgotPhone.length !== 11) {
      setForgotError('请填写11位手机号码')
      return
    }
    if (!forgotPwd || forgotPwd.length < 6) {
      setForgotError('新密码长度至少6位')
      return
    }
    if (forgotPwd !== forgotPwd2) {
      setForgotError('两次密码输入不一致')
      return
    }
    setForgotError('')
    setForgotLoading(true)
    try {
      await resetPassword(forgotUsername, forgotPhone, forgotPwd)
      setForgotSuccess(true)
      setTimeout(() => {
        setShowForgotPwd(false)
        setForgotSuccess(false)
        setForgotUsername('')
        setForgotPhone('')
        setForgotPwd('')
        setForgotPwd2('')
      }, 2000)
    } catch (error: any) {
      setForgotError(error.message || '找回密码失败，请重试')
    } finally {
      setForgotLoading(false)
    }
  }


  // 如果显示注册成功
  if (regSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center relative overflow-hidden">
        <div id="safe-area"></div>
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="text-center relative z-10"
        >
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
            className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center shadow-2xl shadow-green-500/30 relative"
          >
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.4, delay: 0.6, ease: "easeOut" }}
              className="material-icons text-white text-5xl relative z-10"
            >
              check_circle
            </motion.span>
          </motion.div>
          <motion.h1
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="text-3xl font-bold text-white mb-3"
          >
            注册成功
          </motion.h1>
          <motion.p
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.6 }}
            className="text-blue-200 text-base"
          >
            正在进入登录页面...
          </motion.p>
        </motion.div>
      </div>
    )
  }

  // 如果显示找回密码页面
  if (showForgotPwd) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex flex-col items-center justify-center p-4 relative overflow-hidden">
        <div id="safe-area"></div>
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="absolute top-6 left-6 z-20"
        >
          <button
            onClick={() => { setShowForgotPwd(false); setForgotError(''); setForgotUsername(''); setForgotPhone(''); setForgotPwd(''); setForgotPwd2(''); }}
            className="flex items-center gap-2 text-white/70 hover:text-white transition-colors"
          >
            <span className="material-icons">arrow_back</span>
            <span className="text-sm">返回登录</span>
          </button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8 relative z-10"
        >
          <div className="w-20 h-20 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-amber-400 via-orange-500 to-red-600 flex items-center justify-center shadow-2xl">
            <span className="material-icons text-white text-4xl">lock_reset</span>
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">找回密码</h1>
          <p className="text-blue-200/70 text-sm">输入账号与注册手机号即可重置密码</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-md bg-white/5 backdrop-blur-xl rounded-3xl p-6 shadow-2xl border border-white/10 relative z-10"
        >
          {forgotSuccess ? (
            <div className="text-center py-6">
              <span className="material-icons text-green-400 text-5xl mb-3">check_circle</span>
              <p className="text-white font-medium">密码已重置，请使用新密码登录</p>
            </div>
          ) : (
            <>
              <AnimatePresence>
                {forgotError && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-xl flex items-center gap-2"
                  >
                    <span className="material-icons text-red-400 text-lg">error_outline</span>
                    <span className="text-red-400 text-sm flex-1">{forgotError}</span>
                    <button onClick={() => setForgotError('')} className="text-red-400/60 hover:text-red-400">
                      <span className="material-icons text-base">close</span>
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
              <div className="space-y-4">
                <div>
                  <label className="block text-white/90 text-sm font-medium mb-2">账号</label>
                  <div className="relative">
                    <span className="material-icons absolute left-3 top-1/2 -translate-y-1/2 text-white/40 text-lg">person</span>
                    <input
                      type="text"
                      value={forgotUsername}
                      onChange={(e) => setForgotUsername(e.target.value)}
                      placeholder="请输入注册时的账号"
                      className="w-full pl-10 pr-3 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-blue-400 text-sm"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-white/90 text-sm font-medium mb-2">注册手机号</label>
                  <div className="relative">
                    <span className="material-icons absolute left-3 top-1/2 -translate-y-1/2 text-white/40 text-lg">phone</span>
                    <input
                      type="tel"
                      value={forgotPhone}
                      onChange={(e) => setForgotPhone(e.target.value)}
                      placeholder="请输入11位注册手机号"
                      maxLength={11}
                      className="w-full pl-10 pr-3 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-blue-400 text-sm"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-white/90 text-sm font-medium mb-2">新密码</label>
                  <div className="relative">
                    <span className="material-icons absolute left-3 top-1/2 -translate-y-1/2 text-white/40 text-lg">lock</span>
                    <input
                      type="password"
                      value={forgotPwd}
                      onChange={(e) => setForgotPwd(e.target.value)}
                      placeholder="请设置新密码（至少6位）"
                      className="w-full pl-10 pr-3 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-blue-400 text-sm"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-white/90 text-sm font-medium mb-2">确认新密码</label>
                  <div className="relative">
                    <span className="material-icons absolute left-3 top-1/2 -translate-y-1/2 text-white/40 text-lg">lock_outline</span>
                    <input
                      type="password"
                      value={forgotPwd2}
                      onChange={(e) => setForgotPwd2(e.target.value)}
                      placeholder="请再次输入新密码"
                      className="w-full pl-10 pr-3 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-blue-400 text-sm"
                    />
                  </div>
                </div>
                <button
                  onClick={handleForgotPwdReset}
                  disabled={forgotLoading}
                  className="w-full py-3.5 bg-gradient-to-r from-amber-500 via-orange-500 to-red-600 rounded-xl text-white font-semibold shadow-lg disabled:opacity-50"
                >
                  {forgotLoading ? '提交中...' : '确认重置密码'}
                </button>
              </div>
            </>
          )}
        </motion.div>
      </div>
    )
  }



  // 如果显示注册页面
  if (showRegister) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex flex-col items-center justify-center p-4 relative overflow-hidden">
        <div id="safe-area"></div>
        
        {/* 返回按钮 */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="absolute top-6 left-6 z-20"
        >
          <button 
            onClick={() => setShowRegister(false)}
            className="flex items-center gap-2 text-white/70 hover:text-white transition-colors"
          >
            <span className="material-icons">arrow_back</span>
            <span className="text-sm">返回登录</span>
          </button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8 relative z-10"
        >
          <div className="w-20 h-20 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-blue-400 via-blue-500 to-purple-600 flex items-center justify-center shadow-2xl">
            <span className="material-icons text-white text-4xl">person_add</span>
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">新用户注册</h1>
          <p className="text-blue-200/70 text-sm">创建账户，体验BioGuardian</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-md bg-white/5 backdrop-blur-xl rounded-3xl p-6 shadow-2xl border border-white/10 relative z-10"
        >
          {/* 错误提示 */}
          <AnimatePresence>
            {regError && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-xl flex items-center gap-2"
              >
                <span className="material-icons text-red-400 text-lg">error_outline</span>
                <span className="text-red-400 text-sm flex-1">{regError}</span>
                <button onClick={() => setRegError('')} className="text-red-400/60 hover:text-red-400">
                  <span className="material-icons text-base">close</span>
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="space-y-4">
            <div>
              <label className="block text-white/90 text-sm font-medium mb-2">账号</label>
              <div className="relative">
                <span className="material-icons absolute left-3 top-1/2 -translate-y-1/2 text-white/40 text-lg">person</span>
                <input
                  type="text"
                  value={regUsername}
                  onChange={(e) => setRegUsername(e.target.value)}
                  placeholder="请输入账号（至少3位）"
                  className="w-full pl-10 pr-3 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-blue-400 text-sm"
                />
              </div>
            </div>
            <div>
              <label className="block text-white/90 text-sm font-medium mb-2">手机号</label>
              <div className="relative">
                <span className="material-icons absolute left-3 top-1/2 -translate-y-1/2 text-white/40 text-lg">phone</span>
                <input
                  type="tel"
                  value={regPhone}
                  onChange={(e) => setRegPhone(e.target.value)}
                  placeholder="请输入11位手机号码"
                  maxLength={11}
                  className="w-full pl-10 pr-3 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-blue-400 text-sm"
                />
              </div>
            </div>
            <div>
              <label className="block text-white/90 text-sm font-medium mb-2">设置密码</label>
              <div className="relative">
                <span className="material-icons absolute left-3 top-1/2 -translate-y-1/2 text-white/40 text-lg">lock</span>
                <input
                  type="password"
                  value={regPwd}
                  onChange={(e) => setRegPwd(e.target.value)}
                  placeholder="请设置密码（至少6位）"
                  className="w-full pl-10 pr-3 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-blue-400 text-sm"
                />
              </div>
            </div>
            <div>
              <label className="block text-white/90 text-sm font-medium mb-2">确认密码</label>
              <div className="relative">
                <span className="material-icons absolute left-3 top-1/2 -translate-y-1/2 text-white/40 text-lg">lock_outline</span>
                <input
                  type="password"
                  value={regPwd2}
                  onChange={(e) => setRegPwd2(e.target.value)}
                  placeholder="请再次输入密码"
                  className="w-full pl-10 pr-3 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-blue-400 text-sm"
                />
              </div>
            </div>
            <button
              onClick={handleRegister}
              disabled={isRegLoading}
              className="w-full py-3.5 bg-gradient-to-r from-blue-500 via-blue-600 to-purple-600 rounded-xl text-white font-semibold transition-all shadow-lg shadow-blue-500/20 disabled:opacity-50"
            >
              {isRegLoading ? '注册中...' : '立即注册'}
            </button>
          </div>
        </motion.div>
      </div>
    )
  }

  // 如果显示欢迎动画
  if (showWelcome) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center relative overflow-hidden">
        <div id="safe-area"></div>
        
        {/* 背景装饰元素 */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-10 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-20 right-10 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '0.5s' }}></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        </div>

        {/* 欢迎动画 */}
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="text-center relative z-10"
        >
          {/* 成功图标 */}
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
            className="w-32 h-32 mx-auto mb-8 rounded-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center shadow-2xl shadow-green-500/30 relative"
          >
            <div className="absolute inset-0 rounded-full bg-gradient-to-br from-white/20 to-transparent"></div>
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.4, delay: 0.6, ease: "easeOut" }}
              className="material-icons text-white text-6xl relative z-10"
            >
              check_circle
            </motion.span>
          </motion.div>

          {/* 欢迎文字 */}
          <motion.h1
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="text-4xl font-bold text-white mb-4"
          >
            登录成功
          </motion.h1>
          <motion.p
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.6 }}
            className="text-blue-200 text-lg mb-8"
          >
            欢迎使用BioGuardian
          </motion.p>

          {/* 加载动画 */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.8 }}
            className="flex items-center justify-center gap-2"
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full"
            ></motion.div>
            <span className="text-white/60 text-sm">正在进入...</span>
          </motion.div>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex flex-col items-center justify-center p-4 relative overflow-hidden">
      <div id="safe-area"></div>
      
      {/* 粒子背景 */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {Array.from({ length: 30 }).map((_, i) => {
          const size = Math.random() * 2 + 1
          const opacity = Math.random() * 0.3 + 0.1
          return (
            <div
              key={i}
              className="absolute rounded-full bg-blue-400/30"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                width: `${size}px`,
                height: `${size}px`,
                opacity: opacity,
                filter: 'blur(1px)',
                willChange: 'transform, opacity',
                transition: 'left 10s linear, top 10s linear'
              }}
            />
          )
        })}
      </div>
      
      {/* 背景装饰元素 */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div 
          animate={{ 
            scale: [1, 1.2, 1],
            opacity: [0.1, 0.2, 0.1]
          }}
          transition={{ 
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute top-20 left-10 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl"
        />
        <motion.div 
          animate={{ 
            scale: [1, 1.3, 1],
            opacity: [0.1, 0.15, 0.1]
          }}
          transition={{ 
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1
          }}
          className="absolute bottom-20 right-10 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl"
        />
        <motion.div 
          animate={{ 
            scale: [1, 1.1, 1],
            opacity: [0.05, 0.1, 0.05]
          }}
          transition={{ 
            duration: 6,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 2
          }}
          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl"
        />
      </div>

      {/* Logo区域 */}
      <motion.div
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="text-center mb-10 relative z-10"
      >
        {/* 自定义 BioGuardian 标志：DNA + 盾牌 */}
        <div className="w-24 h-24 mx-auto mb-5 rounded-3xl bg-gradient-to-br from-blue-400 via-blue-500 to-purple-600 flex items-center justify-center shadow-2xl shadow-blue-500/30 relative overflow-hidden">
          <div className="absolute inset-[2px] rounded-3xl bg-slate-950/80 backdrop-blur-xl" />
          <svg
            viewBox="0 0 120 120"
            className="relative z-10 w-18 h-18"
          >
            {/* 外部盾牌轮廓 */}
            <defs>
              <linearGradient id="logo-shield" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#38bdf8" />
                <stop offset="50%" stopColor="#6366f1" />
                <stop offset="100%" stopColor="#a855f7" />
              </linearGradient>
              <linearGradient id="logo-dna" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#cffafe" />
                <stop offset="100%" stopColor="#e0f2fe" />
              </linearGradient>
            </defs>
            <path
              d="M60 10 L90 22 C94 24 96 28 96 32 L96 55 C96 76 82 94 62 102 L60 103 L58 102 C38 94 24 76 24 55 L24 32 C24 28 26 24 30 22 Z"
              fill="none"
              stroke="url(#logo-shield)"
              strokeWidth="4"
            />
            {/* 内部发光背景 */}
            <radialGradient id="logo-glow" cx="50%" cy="35%" r="60%">
              <stop offset="0%" stopColor="#0ea5e9" stopOpacity="0.9" />
              <stop offset="100%" stopColor="#0f172a" stopOpacity="0" />
            </radialGradient>
            <circle cx="60" cy="50" r="30" fill="url(#logo-glow)" opacity="0.7" />
            {/* DNA 双螺旋 */}
            <path
              d="M48 70 C56 62 64 58 72 50 C64 42 56 38 48 30"
              fill="none"
              stroke="url(#logo-dna)"
              strokeWidth="3"
              strokeLinecap="round"
            />
            <path
              d="M72 70 C64 62 56 58 48 50 C56 42 64 38 72 30"
              fill="none"
              stroke="url(#logo-dna)"
              strokeWidth="3"
              strokeLinecap="round"
              opacity="0.9"
            />
            {/* 横向碱基对 */}
            <line x1="50" y1="34" x2="70" y2="34" stroke="#e0f2fe" strokeWidth="2" strokeLinecap="round" />
            <line x1="50" y1="42" x2="70" y2="42" stroke="#e0f2fe" strokeWidth="2" strokeLinecap="round" opacity="0.8" />
            <line x1="50" y1="50" x2="70" y2="50" stroke="#e0f2fe" strokeWidth="2" strokeLinecap="round" />
            <line x1="50" y1="58" x2="70" y2="58" stroke="#e0f2fe" strokeWidth="2" strokeLinecap="round" opacity="0.8" />
            <line x1="50" y1="66" x2="70" y2="66" stroke="#e0f2fe" strokeWidth="2" strokeLinecap="round" />
          </svg>
          {/* 外圈高光边框 */}
          <div className="absolute inset-0 rounded-3xl border border-white/20" />
        </div>
        <h1 className="text-4xl font-bold text-white mb-3 tracking-tight">BioGuardian</h1>
        <p className="text-blue-200/80 text-base font-light tracking-wide">IP全生命周期 · 一键智能守护</p>
      </motion.div>

      {/* 登录卡片 */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="w-full max-w-md bg-white/5 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-white/10 relative z-10"
      >
        {/* 错误提示 */}
        <AnimatePresence>
          {loginError && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-xl flex items-center gap-3"
            >
              <span className="material-icons text-red-400 text-xl">error_outline</span>
              <span className="text-red-400 text-sm flex-1">{loginError}</span>
              <button
                onClick={() => setLoginError('')}
                className="text-red-400/60 hover:text-red-400 transition-colors"
              >
                <span className="material-icons text-lg">close</span>
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* 登录方式切换 */}
        <div className="flex gap-3 mb-8 p-1 bg-white/5 rounded-2xl">
          <button
            onClick={() => setLoginType('account')}
            className={`flex-1 py-3.5 rounded-xl font-semibold transition-all duration-300 ${
              loginType === 'account'
                ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg shadow-blue-500/30'
                : 'text-white/60 hover:text-white hover:bg-white/10'
            }`}
          >
            <span className="material-icons text-lg align-middle mr-1">person</span>
            账号登录
          </button>
          <button
            onClick={() => setLoginType('qq')}
            className={`flex-1 py-3.5 rounded-xl font-semibold transition-all duration-300 ${
              loginType === 'qq'
                ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg shadow-blue-500/30'
                : 'text-white/60 hover:text-white hover:bg-white/10'
            }`}
          >
            <span className="material-icons text-lg align-middle mr-1">chat_bubble</span>
            QQ登录
          </button>
          <button
            onClick={() => setLoginType('wechat')}
            className={`flex-1 py-3.5 rounded-xl font-semibold transition-all duration-300 ${
              loginType === 'wechat'
                ? 'bg-gradient-to-r from-green-500 to-green-600 text-white shadow-lg shadow-green-500/30'
                : 'text-white/60 hover:text-white hover:bg-white/10'
            }`}
          >
            <span className="material-icons text-lg align-middle mr-1">forum</span>
            微信登录
          </button>
        </div>

        {/* 账号密码登录表单 */}
        {loginType === 'account' && (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
            className="space-y-5"
          >
            <div>
              <label className="block text-white/90 text-sm font-medium mb-2.5">账号</label>
              <div className="relative">
                <span className="material-icons absolute left-4 top-1/2 transform -translate-y-1/2 text-white/40">person</span>
                <input
                  type="text"
                  value={account}
                  onChange={(e) => setAccount(e.target.value)}
                  placeholder="请输入账号"
                  className="w-full pl-12 pr-4 py-3.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20 transition-all"
                />
              </div>
            </div>
            <div>
              <label className="block text-white/90 text-sm font-medium mb-2.5">密码</label>
              <div className="relative">
                <span className="material-icons absolute left-4 top-1/2 transform -translate-y-1/2 text-white/40">lock</span>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="请输入密码"
                  className="w-full pl-12 pr-4 py-3.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20 transition-all"
                />
              </div>
            </div>
            <button
              onClick={handleAccountLogin}
              disabled={isLoading}
              className="w-full py-4 bg-gradient-to-r from-blue-500 via-blue-600 to-purple-600 hover:from-blue-600 hover:via-blue-700 hover:to-purple-700 rounded-xl text-white font-semibold transition-all duration-300 shadow-xl shadow-blue-500/30 hover:shadow-2xl hover:shadow-blue-500/40 disabled:opacity-50"
            >
              <span className="material-icons text-lg align-middle mr-2">login</span>
              {isLoading ? '登录中...' : '立即登录'}
            </button>
          </motion.div>
        )}

        {/* QQ登录 */}
        {loginType === 'qq' && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
            className="text-center py-4"
          >
            <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center shadow-xl shadow-blue-500/30 relative">
              <div className="absolute inset-0 rounded-full bg-gradient-to-br from-white/20 to-transparent"></div>
              <span className="material-icons text-white text-5xl relative z-10">chat_bubble</span>
            </div>
            <p className="text-white/90 mb-8 text-lg font-medium">使用QQ账号快速登录</p>
            <button
              onClick={() => alert('暂未开放QQ登录，请使用账号登录')}
              className="w-full py-4 bg-gradient-to-r from-blue-500 via-blue-600 to-blue-700 hover:from-blue-600 hover:via-blue-700 hover:to-blue-800 rounded-xl text-white font-semibold transition-all duration-300 shadow-xl shadow-blue-500/30 hover:shadow-2xl hover:shadow-blue-500/40"
            >
              <span className="material-icons text-lg align-middle mr-2">login</span>
              QQ一键登录
            </button>
          </motion.div>
        )}

        {/* 微信登录 */}
        {loginType === 'wechat' && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
            className="text-center py-4"
          >
            <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center shadow-xl shadow-green-500/30 relative">
              <div className="absolute inset-0 rounded-full bg-gradient-to-br from-white/20 to-transparent"></div>
              <span className="material-icons text-white text-5xl relative z-10">forum</span>
            </div>
            <p className="text-white/90 mb-8 text-lg font-medium">使用微信账号快速登录</p>
            <button
              onClick={() => alert('暂未开放微信登录，请使用账号登录')}
              className="w-full py-4 bg-gradient-to-r from-green-500 via-green-600 to-green-700 hover:from-green-600 hover:via-green-700 hover:to-green-800 rounded-xl text-white font-semibold transition-all duration-300 shadow-xl shadow-green-500/30 hover:shadow-2xl hover:shadow-green-500/40"
            >
              <span className="material-icons text-lg align-middle mr-2">login</span>
              微信一键登录
            </button>
          </motion.div>
        )}

        {/* 注册入口与找回密码：立即登录右下方 */}
        <div className="mt-6 flex justify-between items-center">
          <button 
            onClick={() => setShowRegister(true)}
            className="text-blue-400 hover:text-blue-300 transition-colors text-sm font-medium"
          >
            新用户注册 →
          </button>
          <div className="flex gap-4">
            <button 
              onClick={() => setShowForgotPwd(true)}
              className="text-amber-400 hover:text-amber-300 transition-colors text-sm font-medium"
            >
              找回密码
            </button>

          </div>
        </div>

        {/* 版本号 */}
        <div className="mt-6 pt-4 border-t border-white/10 text-center">
          <p className="text-white/40 text-xs">BioGuardian v{APP_VERSION}</p>
        </div>
      </motion.div>
    </div>
  )
}

export default Login
