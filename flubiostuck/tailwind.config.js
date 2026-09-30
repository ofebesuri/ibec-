/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}'
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // 深色科研控制台主色
        ink: {
          950: '#05070F',
          900: '#080B17',
          850: '#0B1020',
          800: '#111733',
          700: '#1A2143',
          600: '#222B57',
          500: '#2C376C',
          400: '#3B468A'
        },
        // 数据高亮（青色/荧光绿）
        bio: {
          50: '#E6FCFF',
          100: '#BEF5FA',
          200: '#7DE9F4',
          300: '#36D7EB',
          400: '#16BFDB',
          500: '#0EA5C7',
          600: '#0885A3',
          700: '#0A6783',
          800: '#0E536B',
          900: '#0F4457'
        },
        // 计算/AI（紫色）
        compute: {
          50: '#F2EBFF',
          100: '#DEC9FF',
          200: '#C5A6FF',
          300: '#A87BFF',
          400: '#935AFF',
          500: '#7E3AFF',
          600: '#6628E3',
          700: '#501CB8',
          800: '#3E1592',
          900: '#2E0F70'
        },
        // 成功/激活
        glow: {
          50: '#E6FFF4',
          100: '#BCFCE0',
          200: '#7BF7C4',
          300: '#3DECA6',
          400: '#16D88A',
          500: '#0AB872',
          600: '#079659',
          700: '#0A7547',
          800: '#0B5E3A',
          900: '#0A4B2F'
        },
        // IP 风险
        ip: {
          50: '#FFF7E6',
          100: '#FFE7B8',
          200: '#FFCF7A',
          300: '#FFB441',
          400: '#FF9A1F',
          500: '#F5800B',
          600: '#D96808',
          700: '#B0500A',
          800: '#8C3F0D',
          900: '#6E330F'
        },
        // 危险/中断
        alert: {
          50: '#FFEDED',
          100: '#FFD1D1',
          200: '#FF9F9F',
          300: '#FF6E6E',
          400: '#FF4242',
          500: '#F12020',
          600: '#C71212',
          700: '#9D0E10',
          800: '#780C13',
          900: '#5A0B11'
        },
        // 中性文本
        text: {
          primary: '#E8EEFF',
          secondary: '#9BA8D0',
          tertiary: '#6A77A8',
          muted: '#46517A'
        },
        surface: {
          0: 'rgba(8,11,23,0.65)',
          1: 'rgba(11,16,32,0.85)',
          2: 'rgba(17,23,51,0.95)',
          3: 'rgba(26,33,67,0.95)'
        }
      },
      animation: {
        'grid-pulse': 'gridPulse 8s linear infinite',
        'data-stream': 'dataStream 6s linear infinite',
        'scan-line': 'scanLine 6s linear infinite',
        'ring-spin': 'ringSpin 22s linear infinite',
        'glow-pulse': 'glowPulse 2.4s ease-in-out infinite',
        'fade-in-up': 'fadeInUp 0.6s ease-out',
        'fade-in-down': 'fadeInDown 0.6s ease-out',
        'sweep': 'sweep 4s linear infinite',
        'spectrum': 'spectrum 6s linear infinite',
        'ticker': 'ticker 38s linear infinite',
        'stage-scan': 'stageScan 7s linear infinite',
        'pulse-slow': 'pulseSlow 4s ease-in-out infinite',
        // ===== 借鉴模板示例新增的动效 =====
        'radial-grow': 'radialGrow 4.5s ease-out infinite',
        'radial-grow-fast': 'radialGrow 2.8s ease-out infinite',
        'radial-grow-slow': 'radialGrow 6.2s ease-out infinite',
        'core-pulse': 'corePulse 3.4s ease-in-out infinite',
        'core-spin': 'coreSpin 22s linear infinite',
        'core-spin-reverse': 'coreSpinReverse 18s linear infinite',
        'satellite-pulse': 'satellitePulse 2.6s ease-in-out infinite',
        'corner-deco-pulse': 'cornerDecoPulse 2.4s ease-in-out infinite',
        'bar-progress': 'barProgress 2.2s ease-in-out infinite',
        'panel-float': 'panelFloat 6s ease-in-out infinite',
        'flt-flicker': 'fltFlicker 4.8s ease-in-out infinite',
        'signal-blink': 'signalBlink 1.6s ease-in-out infinite'
      },
      keyframes: {
        gridPulse: {
          '0%, 100%': { opacity: '0.35' },
          '50%': { opacity: '0.7' }
        },
        dataStream: {
          '0%': { backgroundPosition: '0% 50%' },
          '100%': { backgroundPosition: '200% 50%' }
        },
        scanLine: {
          '0%': { transform: 'translateY(-110%)' },
          '100%': { transform: 'translateY(110%)' }
        },
        ringSpin: {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' }
        },
        glowPulse: {
          '0%, 100%': { boxShadow: '0 0 0 rgba(126,58,255,0.25)' },
          '50%': { boxShadow: '0 0 32px rgba(126,58,255,0.45)' }
        },
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' }
        },
        fadeInDown: {
          '0%': { opacity: '0', transform: 'translateY(-12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' }
        },
        sweep: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(100%)' }
        },
        spectrum: {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' }
        },
        ticker: {
          '0%': { transform: 'translateY(0)' },
          '100%': { transform: 'translateY(-50%)' }
        },
        stageScan: {
          '0%': { backgroundPosition: '0 -100%' },
          '100%': { backgroundPosition: '0 220%' }
        },
        pulseSlow: {
          '0%, 100%': { opacity: '0.65' },
          '50%': { opacity: '1' }
        },
        // ===== 新增 keyframes =====
        radialGrow: {
          '0%': { transform: 'scaleX(0)', opacity: '0' },
          '15%': { opacity: '0.9' },
          '70%': { opacity: '1' },
          '100%': { transform: 'scaleX(1)', opacity: '0' }
        },
        corePulse: {
          '0%, 100%': {
            transform: 'scale(1)',
            boxShadow: '0 0 24px rgba(147,90,255,0.55), 0 0 48px rgba(22,191,219,0.35), inset 0 0 12px rgba(22,216,138,0.4)'
          },
          '50%': {
            transform: 'scale(1.04)',
            boxShadow: '0 0 48px rgba(147,90,255,0.85), 0 0 96px rgba(22,191,219,0.55), inset 0 0 18px rgba(22,216,138,0.65)'
          }
        },
        coreSpin: {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' }
        },
        coreSpinReverse: {
          '0%': { transform: 'rotate(360deg)' },
          '100%': { transform: 'rotate(0deg)' }
        },
        satellitePulse: {
          '0%, 100%': { transform: 'scale(1)', opacity: '0.85' },
          '50%': { transform: 'scale(1.18)', opacity: '1' }
        },
        cornerDecoPulse: {
          '0%, 100%': { opacity: '0.45', filter: 'drop-shadow(0 0 4px currentColor)' },
          '50%': { opacity: '1', filter: 'drop-shadow(0 0 12px currentColor)' }
        },
        barProgress: {
          '0%': { backgroundPosition: '-200% 50%' },
          '100%': { backgroundPosition: '200% 50%' }
        },
        panelFloat: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-4px)' }
        },
        fltFlicker: {
          '0%, 100%': { opacity: '0.55' },
          '50%': { opacity: '1' }
        },
        signalBlink: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.35' }
        }
      },
      fontFamily: {
        sans: ['var(--font-noto-sc)', 'var(--font-inter)', 'Inter', 'PingFang SC', 'Microsoft YaHei', 'system-ui', 'sans-serif'],
        mono: ['var(--font-mono)', 'JetBrains Mono', 'Consolas', 'Menlo', 'monospace'],
        cn: ['var(--font-noto-sc)', 'PingFang SC', 'Microsoft YaHei', 'sans-serif'],
        display: ['var(--font-noto-sc)', 'var(--font-inter)', 'Inter', 'SF Pro Display', 'system-ui', 'sans-serif']
      },
      backgroundImage: {
        'grid-lines': 'linear-gradient(rgba(155,168,208,0.07) 1px, transparent 1px), linear-gradient(90deg, rgba(155,168,208,0.07) 1px, transparent 1px)',
        'aurora': 'radial-gradient(circle at 20% 0%, rgba(126,58,255,0.35), transparent 45%), radial-gradient(circle at 90% 0%, rgba(14,165,199,0.28), transparent 50%), radial-gradient(circle at 50% 100%, rgba(16,216,138,0.18), transparent 55%)',
        'data-stream': 'linear-gradient(90deg, transparent, rgba(126,58,255,0.55), rgba(14,165,199,0.45), transparent)',
        'spectrum-line': 'linear-gradient(90deg, #7E3AFF, #16BFDB, #16D88A, #FF9A1F, #FF4242)'
      },
      boxShadow: {
        'glow-sm': '0 0 12px rgba(126,58,255,0.25)',
        'glow-md': '0 0 24px rgba(126,58,255,0.35)',
        'glow-lg': '0 0 36px rgba(126,58,255,0.45)',
        'cyan-glow': '0 0 24px rgba(22,191,219,0.35)',
        'green-glow': '0 0 24px rgba(22,216,138,0.3)',
        'inset-stroke': 'inset 0 0 0 1px rgba(155,168,208,0.18)'
      },
      backdropBlur: {
        xs: '2px'
      }
    }
  },
  plugins: []
};
