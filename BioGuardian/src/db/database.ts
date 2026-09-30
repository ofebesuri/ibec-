import { supabase, checkSupabaseConnection } from '../lib/supabase';

let dbInitialized = false;

// 检查是否在浏览器环境
const isBrowser = typeof window !== 'undefined';

// 字段名转换：camelCase 到 snake_case
const toSnakeCase = (obj: Record<string, any>): Record<string, any> => {
  const result: Record<string, any> = {};
  Object.entries(obj).forEach(([key, value]) => {
    const snakeKey = key.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
    result[snakeKey] = value;
  });
  return result;
};

// 字段名转换：snake_case 到 camelCase
const toCamelCase = (obj: Record<string, any>): Record<string, any> => {
  const result: Record<string, any> = {};
  Object.entries(obj).forEach(([key, value]) => {
    const camelKey = key.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
    result[camelKey] = value;
  });
  return result;
};

export const initDatabase = async (): Promise<boolean> => {
  if (dbInitialized) {
    return true;
  }

  // 优先尝试 Supabase
  if (!isBrowser) {
    dbInitialized = false;
    console.log('非浏览器环境，无法连接Supabase');
    return false;
  }

  try {
    // 测试 Supabase 连接
    const connected = await checkSupabaseConnection();
    if (connected) {
      dbInitialized = true;
      console.log('Supabase数据库初始化成功');
      return true;
    }
    console.error('Supabase数据库连接失败');
    return false;
  } catch (error) {
    console.error('Supabase初始化失败:', error);
    return false;
  }
};

export const closeDatabase = async (): Promise<void> => {
  console.log('数据库连接关闭');
  dbInitialized = false;
};
