import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import 'material-icons/iconfont/material-icons.css';
import App from './App.tsx';
import { initializeDatabase, checkSupabaseConnection } from './lib/supabase';

// 确保在 App 组件之前定义 lingguang polyfill
if (typeof window !== 'undefined' && !(window as any).lingguang) {
  console.log('[Polyfill] lingguang API not found, creating mock implementation...');

  const memoryStorage: { [key: string]: string } = {};

  const mockStorage = {
    async setItem(key: string, value: any): Promise<boolean> {
      try {
        memoryStorage[key] = JSON.stringify(value);
        return true;
      } catch (error) {
        console.error('[Mock Storage] setItem error:', error);
        return false;
      }
    },
    async getItem(key: string): Promise<any | null> {
      try {
        const value = memoryStorage[key];
        return value ? JSON.parse(value) : null;
      } catch (error) {
        console.error('[Mock Storage] getItem error:', error);
        return null;
      }
    },
    async removeItem(key: string): Promise<boolean> {
      try {
        delete memoryStorage[key];
        return true;
      } catch (error) {
        console.error('[Mock Storage] removeItem error:', error);
        return false;
      }
    },
    async clear(): Promise<boolean> {
      try {
        Object.keys(memoryStorage).forEach(key => delete memoryStorage[key]);
        return true;
      } catch (error) {
        console.error('[Mock Storage] clear error:', error);
        return false;
      }
    }
  };

  (window as any).lingguang = {
    storage: mockStorage,
    _call: async (action: string, params?: any) => {
      console.log('[Mock lingguang._call]', action, params);
      return { success: true, data: null, message: 'Mock' };
    },
    _getArtifactId: () => 'mock-id',
    _getArtifactVersion: () => '1',
    callLLM: async (message: string) => {
      return { content: 'Mock Response', extInfo: {} };
    },
    ai: {
      imageGeneration: async (params: { width: number; height: number }) => {
        return { url: `https://via.placeholder.com/${params.width}x${params.height}` };
      },
      vllm: async (params: any) => {
        return { content: 'Mock VLLM' };
      }
    },
    data: {
      fetch: async () => null
    },
    vibrate: () => {},
    gyroscope: {
      start: async () => {},
      stop: async () => {}
    },
    asr: {
      start: async () => {},
      stop: async () => {},
      abort: async () => {}
    }
  };

  (window as any).callLLM = (window as any).lingguang.callLLM;
  console.log('[Polyfill] lingguang mock created');
}

// 不拦截 console.error 和 warn，以便查看真实错误信息
// console.error = (...args) => console.log('[ERROR]', ...args);
// console.warn = (...args) => console.log('[WARN]', ...args);

// 初始化Supabase数据库连接
const initApp = async () => {
  try {
    // 检查Supabase连接
    const connected = await checkSupabaseConnection();
    if (connected) {
      console.log('Supabase连接成功');
      // 尝试初始化数据库表
      await initializeDatabase();
    } else {
      console.log('Supabase连接失败，将使用本地存储');
    }
  } catch (error) {
    console.error('初始化失败:', error);
  }
  
  // 渲染应用
  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <App />
    </StrictMode>
  );
};

// 启动应用
initApp();
