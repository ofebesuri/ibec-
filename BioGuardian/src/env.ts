// 环境变量配置
// VITE_API_URL: 后端API地址

// 开发环境默认地址
const DEFAULT_API_URL = 'http://localhost:3000/api';

// 从环境变量获取API地址，如果未设置则使用默认值
export const API_BASE_URL = import.meta.env.VITE_API_URL || DEFAULT_API_URL;

// 判断是否为开发环境
export const isDevMode = import.meta.env.DEV;

// 导出API地址供其他模块使用
console.log('API地址:', API_BASE_URL);
console.log('开发模式:', isDevMode);
