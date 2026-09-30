import type { Metadata, Viewport } from 'next';
import { Inter, JetBrains_Mono, Noto_Sans_SC } from 'next/font/google';
import '@/styles/globals.css';
import { Providers } from '@/components/layout/Providers';
import { Toaster } from 'react-hot-toast';
import { AppShell } from '@/components/layout/AppShell';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap'
});

const jetbrains = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  display: 'swap'
});

const notoSansSC = Noto_Sans_SC({
  weight: ['300', '400', '500', '700'],
  subsets: ['latin'],
  variable: '--font-noto-sc',
  display: 'swap'
});

export const metadata: Metadata = {
  title: 'FluBioStack | 科研级生物信息控制台',
  description:
    '面向合成生物学的智能元件数据库、多组学分析、回路仿真、流行病预测与 IP 保护一体化科研控制台。',
  keywords: ['合成生物学', '生物信息', 'scFv', '多组学', 'IP保护', 'iGEM', 'FluBioStack'],
  authors: [{ name: 'FluBioStack Team' }],
  openGraph: {
    title: 'FluBioStack | 科研级生物信息控制台',
    description:
      '面向合成生物学的智能元件数据库、多组学分析、回路仿真与 IP 保护一体化科研控制台。',
    type: 'website',
    locale: 'zh_CN'
  }
};

export const viewport: Viewport = {
  themeColor: '#05070F',
  width: 'device-width',
  initialScale: 1
};

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN" className="dark">
      <body
        className={`${inter.variable} ${jetbrains.variable} ${notoSansSC.variable} font-sans antialiased`}
      >
        <Providers>
          <AppShell>{children}</AppShell>
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: 'rgba(11, 16, 32, 0.95)',
                color: '#E8EEFF',
                border: '1px solid rgba(147, 90, 255, 0.45)',
                backdropFilter: 'blur(16px)',
                borderRadius: '10px',
                boxShadow: '0 18px 40px rgba(2,4,18,0.7)',
                fontSize: '14px'
              },
              success: { iconTheme: { primary: '#16D88A', secondary: '#0B1020' } },
              error: { iconTheme: { primary: '#FF4242', secondary: '#0B1020' } }
            }}
          />
        </Providers>
      </body>
    </html>
  );
}
