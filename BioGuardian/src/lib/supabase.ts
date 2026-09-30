import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Supabase连接配置
// 项目URL: https://kgrozfrsurvfrwuvhcyw.supabase.co
const SUPABASE_PROJECT_REF = 'kgrozfrsurvfrwuvhcyw';
export const supabaseUrl = `https://${SUPABASE_PROJECT_REF}.supabase.co`;

// 匿名key（从环境变量获取）
// 用户提供的API密钥: sb_publishable_2yQz4gHfXaip_800LO222A_NdHXC46W
export const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_2yQz4gHfXaip_800LO222A_NdHXC46W';

// 创建Supabase客户端
export const supabase: SupabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false
  }
});

// 数据库表初始化SQL（在应用启动时自动创建表）
const CREATE_TABLES_SQL = `
-- 用户表
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  phone VARCHAR(50),
  email VARCHAR(255),
  company VARCHAR(255),
  position VARCHAR(255),
  bio TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 项目表
CREATE TABLE IF NOT EXISTS projects (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  type VARCHAR(100),
  status VARCHAR(50) DEFAULT '进行中',
  progress INTEGER DEFAULT 0,
  date VARCHAR(50),
  description TEXT,
  project_code VARCHAR(100),
  manager VARCHAR(100),
  budget DECIMAL(15,2),
  start_date DATE,
  end_date DATE,
  risk_level VARCHAR(20) DEFAULT '低',
  compliance_status VARCHAR(50) DEFAULT '待审核',
  regulatory_framework VARCHAR(100),
  review_status VARCHAR(50) DEFAULT 'pending',
  last_review_date DATE,
  next_review_date DATE,
  attachments TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 专利表
CREATE TABLE IF NOT EXISTS patents (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  patent_name VARCHAR(255),
  patent_number VARCHAR(100),
  applicant VARCHAR(255),
  inventor VARCHAR(255),
  apply_date DATE,
  publish_date DATE,
  patent_type VARCHAR(50),
  abstract TEXT,
  claims TEXT,
  status VARCHAR(50) DEFAULT 'draft',
  category VARCHAR(100),
  tags TEXT,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 文件表
CREATE TABLE IF NOT EXISTS files (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  original_name VARCHAR(255) NOT NULL,
  stored_name VARCHAR(255),
  mime_type VARCHAR(100),
  size BIGINT DEFAULT 0,
  path TEXT,
  url TEXT,
  hash VARCHAR(255),
  status VARCHAR(50) DEFAULT 'pending',
  module VARCHAR(50),
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 日程事件表
CREATE TABLE IF NOT EXISTS events (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  type VARCHAR(50),
  time VARCHAR(20),
  event_date DATE,
  is_completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 通知表
CREATE TABLE IF NOT EXISTS notifications (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  content TEXT,
  read BOOLEAN DEFAULT FALSE,
  icon VARCHAR(50),
  type VARCHAR(50),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 团队成员表
CREATE TABLE IF NOT EXISTS team_members (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  role VARCHAR(100),
  email VARCHAR(255),
  phone VARCHAR(50),
  status VARCHAR(50) DEFAULT 'offline',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- AI使用记录表（全局互通）
CREATE TABLE IF NOT EXISTS usage_records (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  module_id INTEGER NOT NULL,
  action_type VARCHAR(50),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 知晓声明表（专利时间证据链核心）
CREATE TABLE IF NOT EXISTS declarations (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  -- 核心内容
  declaration_type VARCHAR(50) NOT NULL,  -- text/file/link
  content_text TEXT,                       -- 文字内容
  file_id INTEGER REFERENCES files(id),   -- 上传文件的ID
  file_hash VARCHAR(64),                  -- 文件哈希
  link_url TEXT,                          -- 文献链接
  link_type VARCHAR(20),                  -- patent/doi/paper
  -- 知晓信息
  knowledge_topic VARCHAR(255),             -- 知晓主题
  knowledge_category VARCHAR(50),          -- 构思/现有技术/侵权线索
  content_summary TEXT,                   -- AI生成的内容摘要
  -- 哈希链
  block_hash VARCHAR(64) NOT NULL,         -- 当前区块哈希
  previous_hash VARCHAR(64) NOT NULL,      -- 前一区块哈希（创世区块为'genesis'）
  block_index INTEGER NOT NULL,            -- 区块序号
  -- 时间戳
  server_timestamp TIMESTAMPTZ NOT NULL,   -- 服务器时间
  timestamp_string VARCHAR(100),           -- 格式化时间字符串
  -- 签名
  signature TEXT,                          -- RSA签名
  -- 地理信息
  location_city VARCHAR(100),              -- 城市级别位置
  ip_address VARCHAR(50),                  -- IP地址
  -- 专利关联
  patent_case_id VARCHAR(100),             -- 关联专利案件ID
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 用户密钥表（RSA密钥对存储）
CREATE TABLE IF NOT EXISTS user_keys (
  id SERIAL PRIMARY KEY,
  user_id INTEGER UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  public_key TEXT NOT NULL,                -- RSA公钥（PEM格式）
  encrypted_private_key TEXT NOT NULL,     -- AES加密的RSA私钥
  key_created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 为files表添加区块哈希字段（向后兼容）
-- 注意：Supabase SQL中如需添加字段请手动执行以下SQL：
-- ALTER TABLE files ADD COLUMN IF NOT EXISTS block_hash VARCHAR(64);
-- ALTER TABLE files ADD COLUMN IF NOT EXISTS previous_hash VARCHAR(64);
-- ALTER TABLE files ADD COLUMN IF NOT EXISTS block_index INTEGER;
-- ALTER TABLE files ADD COLUMN IF NOT EXISTS server_timestamp TIMESTAMPTZ;

-- 创建索引以提高查询性能
CREATE INDEX IF NOT EXISTS idx_projects_user_id ON projects(user_id);
CREATE INDEX IF NOT EXISTS idx_patents_user_id ON patents(user_id);
CREATE INDEX IF NOT EXISTS idx_files_user_id ON files(user_id);
CREATE INDEX IF NOT EXISTS idx_events_user_id ON events(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_team_members_user_id ON team_members(user_id);
CREATE INDEX IF NOT EXISTS idx_usage_records_module_id ON usage_records(module_id);
CREATE INDEX IF NOT EXISTS idx_usage_records_created_at ON usage_records(created_at);
CREATE INDEX IF NOT EXISTS idx_declarations_user_id ON declarations(user_id);
CREATE INDEX IF NOT EXISTS idx_declarations_block_index ON declarations(block_index);
CREATE INDEX IF NOT EXISTS idx_declarations_created_at ON declarations(created_at);
CREATE INDEX IF NOT EXISTS idx_user_keys_user_id ON user_keys(user_id);
`;

// 检查并初始化数据库表
export const initializeDatabase = async (): Promise<boolean> => {
  try {
    // 尝试查询users表来检查表是否存在
    const { error } = await supabase.from('users').select('id').limit(1);

    if (error) {
      console.log('数据库表不存在，需要在Supabase后台创建表');
      console.log('请在Supabase SQL Editor中执行建表SQL');
      return false;
    }

    console.log('数据库表已存在');
    return true;
  } catch (error) {
    console.error('检查数据库失败:', error);
    return false;
  }
};

// 检查特定表是否存在
export const checkTableExists = async (tableName: string): Promise<boolean> => {
  try {
    const { error } = await supabase.from(tableName).select('*').limit(1);
    return !error || error.code !== 'PGRST116';
  } catch {
    return false;
  }
};

// 获取缺失的表列表
export const getMissingTables = async (): Promise<string[]> => {
  const requiredTables = [
    'users', 'projects', 'patents', 'files', 'events', 
    'notifications', 'team_members', 'usage_records', 
    'declarations', 'user_keys'
  ];
  
  const missingTables: string[] = [];
  for (const table of requiredTables) {
    const exists = await checkTableExists(table);
    if (!exists) {
      missingTables.push(table);
    }
  }
  return missingTables;
};

// 检查Supabase连接
export const checkSupabaseConnection = async (): Promise<boolean> => {
  try {
    const { data, error } = await supabase.from('users').select('id').limit(1);
    if (error && error.code !== 'PGRST116') {
      console.error('Supabase连接错误:', error);
      return false;
    }
    console.log('Supabase连接成功');
    return true;
  } catch (error) {
    console.error('Supabase连接失败:', error);
    return false;
  }
};

// 使用Supabase REST API执行查询
export const executeSelect = async (table: string, query: {
  select?: string;
  where?: Record<string, any>;
  order?: string;
  limit?: number;
} = {}): Promise<any[]> => {
  try {
    let queryBuilder = supabase.from(table).select(query.select || '*');
    
    if (query.where) {
      Object.entries(query.where).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryBuilder = queryBuilder.eq(key, value);
        }
      });
    }
    
    if (query.order) {
      const [column, direction = 'desc'] = query.order.split(' ');
      queryBuilder = queryBuilder.order(column, { ascending: direction.toLowerCase() === 'asc' });
    }
    
    if (query.limit) {
      queryBuilder = queryBuilder.limit(query.limit);
    }
    
    const { data, error } = await queryBuilder;
    
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error(`查询表 ${table} 失败:`, error);
    return [];
  }
};

// 执行插入
export const executeInsert = async (table: string, data: Record<string, any>): Promise<{ lastId: number; success: boolean }> => {
  try {
    const { data: result, error } = await supabase
      .from(table)
      .insert(data)
      .select()
      .single();
    
    if (error) throw error;
    
    return { lastId: result?.id || 0, success: true };
  } catch (error) {
    console.error(`插入表 ${table} 失败:`, error);
    return { lastId: 0, success: false };
  }
};

// 执行更新
export const executeUpdate = async (table: string, id: number, data: Record<string, any>): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from(table)
      .update(data)
      .eq('id', id);
    
    if (error) throw error;
    return true;
  } catch (error) {
    console.error(`更新表 ${table} 失败:`, error);
    return false;
  }
};

// 执行删除
export const executeDelete = async (table: string, id: number): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from(table)
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    return true;
  } catch (error) {
    console.error(`删除表 ${table} 失败:`, error);
    return false;
  }
};

// 执行计数查询
export const executeCount = async (table: string, where: Record<string, any> = {}): Promise<number> => {
  try {
    let queryBuilder = supabase.from(table).select('*', { count: 'exact', head: true });
    
    Object.entries(where).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        queryBuilder = queryBuilder.eq(key, value);
      }
    });
    
    const { count, error } = await queryBuilder;
    
    if (error) throw error;
    return count || 0;
  } catch (error) {
    console.error(`计数表 ${table} 失败:`, error);
    return 0;
  }
};

console.log('Supabase配置:', {
  url: supabaseUrl,
  key: supabaseAnonKey.substring(0, 20) + '...'
});
