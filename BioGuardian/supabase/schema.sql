-- BioGuardian Supabase 数据库初始化脚本
-- 请在 Supabase SQL Editor 中执行此脚本

-- 1. 创建扩展（如果需要）
-- CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. 创建用户表
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(100) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  phone VARCHAR(20),
  email VARCHAR(255),
  company VARCHAR(255),
  position VARCHAR(100),
  bio TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. 创建项目表
CREATE TABLE IF NOT EXISTS projects (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL,
  name VARCHAR(255) NOT NULL,
  type VARCHAR(50),
  status VARCHAR(50) DEFAULT '进行中',
  progress INTEGER DEFAULT 0,
  date VARCHAR(50),
  description TEXT,
  project_code VARCHAR(100),
  manager VARCHAR(100),
  budget DECIMAL(15,2) DEFAULT 0,
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

-- 4. 创建专利表
CREATE TABLE IF NOT EXISTS patents (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL,
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

-- 5. 创建文件表
CREATE TABLE IF NOT EXISTS files (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL,
  original_name VARCHAR(255) NOT NULL,
  stored_name VARCHAR(255),
  mime_type VARCHAR(100),
  size BIGINT DEFAULT 0,
  path VARCHAR(500),
  url VARCHAR(500),
  hash VARCHAR(64),
  status VARCHAR(50) DEFAULT 'pending',
  module VARCHAR(50),
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. 创建事件/待办表
CREATE TABLE IF NOT EXISTS events (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL,
  title VARCHAR(255) NOT NULL,
  type VARCHAR(50),
  time VARCHAR(10),
  event_date DATE,
  is_completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. 创建通知表
CREATE TABLE IF NOT EXISTS notifications (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL,
  title VARCHAR(255) NOT NULL,
  content TEXT,
  read BOOLEAN DEFAULT FALSE,
  icon VARCHAR(50),
  type VARCHAR(50),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 8. 创建团队成员表
CREATE TABLE IF NOT EXISTS team_members (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL,
  name VARCHAR(100) NOT NULL,
  role VARCHAR(100),
  email VARCHAR(255),
  phone VARCHAR(20),
  status VARCHAR(20) DEFAULT 'offline',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 9. 创建AI使用记录表（全局共享 - 实时运营指标）
CREATE TABLE IF NOT EXISTS usage_records (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL,
  module_id INTEGER NOT NULL,
  action_type VARCHAR(50),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 10. 创建索引
CREATE INDEX IF NOT EXISTS idx_projects_user_id ON projects(user_id);
CREATE INDEX IF NOT EXISTS idx_patents_user_id ON patents(user_id);
CREATE INDEX IF NOT EXISTS idx_files_user_id ON files(user_id);
CREATE INDEX IF NOT EXISTS idx_events_user_id ON events(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_team_members_user_id ON team_members(user_id);
CREATE INDEX IF NOT EXISTS idx_usage_records_user_id ON usage_records(user_id);
CREATE INDEX IF NOT EXISTS idx_usage_records_created_at ON usage_records(created_at);
CREATE INDEX IF NOT EXISTS idx_usage_records_module_id ON usage_records(module_id);

-- 11. 启用RLS（行级安全策略）
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE patents ENABLE ROW LEVEL SECURITY;
ALTER TABLE files ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE usage_records ENABLE ROW LEVEL SECURITY;

-- 12. 创建RLS策略

-- users表：用户只能查看和修改自己的记录
CREATE POLICY "users_select_own" ON users FOR SELECT USING (true);
CREATE POLICY "users_insert_own" ON users FOR INSERT WITH CHECK (true);
CREATE POLICY "users_update_own" ON users FOR UPDATE USING (true);
CREATE POLICY "users_delete_own" ON users FOR DELETE USING (true);

-- projects表：用户只能操作自己的项目
CREATE POLICY "projects_select_own" ON projects FOR SELECT USING (true);
CREATE POLICY "projects_insert_own" ON projects FOR INSERT WITH CHECK (user_id IS NOT NULL);
CREATE POLICY "projects_update_own" ON projects FOR UPDATE USING (true);
CREATE POLICY "projects_delete_own" ON projects FOR DELETE USING (true);

-- patents表：用户只能操作自己的专利
CREATE POLICY "patents_select_own" ON patents FOR SELECT USING (true);
CREATE POLICY "patents_insert_own" ON patents FOR INSERT WITH CHECK (user_id IS NOT NULL);
CREATE POLICY "patents_update_own" ON patents FOR UPDATE USING (true);
CREATE POLICY "patents_delete_own" ON patents FOR DELETE USING (true);

-- files表：用户只能操作自己的文件
CREATE POLICY "files_select_own" ON files FOR SELECT USING (true);
CREATE POLICY "files_insert_own" ON files FOR INSERT WITH CHECK (user_id IS NOT NULL);
CREATE POLICY "files_update_own" ON files FOR UPDATE USING (true);
CREATE POLICY "files_delete_own" ON files FOR DELETE USING (true);

-- events表：用户只能操作自己的事件
CREATE POLICY "events_select_own" ON events FOR SELECT USING (true);
CREATE POLICY "events_insert_own" ON events FOR INSERT WITH CHECK (user_id IS NOT NULL);
CREATE POLICY "events_update_own" ON events FOR UPDATE USING (true);
CREATE POLICY "events_delete_own" ON events FOR DELETE USING (true);

-- notifications表：用户只能操作自己的通知
CREATE POLICY "notifications_select_own" ON notifications FOR SELECT USING (true);
CREATE POLICY "notifications_insert_own" ON notifications FOR INSERT WITH CHECK (user_id IS NOT NULL);
CREATE POLICY "notifications_update_own" ON notifications FOR UPDATE USING (true);
CREATE POLICY "notifications_delete_own" ON notifications FOR DELETE USING (true);

-- team_members表：用户只能操作自己的团队成员
CREATE POLICY "team_members_select_own" ON team_members FOR SELECT USING (true);
CREATE POLICY "team_members_insert_own" ON team_members FOR INSERT WITH CHECK (user_id IS NOT NULL);
CREATE POLICY "team_members_update_own" ON team_members FOR UPDATE USING (true);
CREATE POLICY "team_members_delete_own" ON team_members FOR DELETE USING (true);

-- usage_records表：全局可读写（实时运营指标所有用户互通）
CREATE POLICY "usage_records_all_select" ON usage_records FOR SELECT USING (true);
CREATE POLICY "usage_records_all_insert" ON usage_records FOR INSERT WITH CHECK (true);
CREATE POLICY "usage_records_all_update" ON usage_records FOR UPDATE USING (true);
CREATE POLICY "usage_records_all_delete" ON usage_records FOR DELETE USING (true);

-- 13. 创建查看近7日和近30日使用统计的函数
CREATE OR REPLACE FUNCTION get_usage_stats()
RETURNS TABLE (
  last_7_days_count BIGINT,
  last_30_days_count BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    COUNT(*)::BIGINT AS last_7_days_count,
    0::BIGINT AS last_30_days_count
  FROM usage_records
  WHERE created_at >= NOW() - INTERVAL '7 days'
  UNION ALL
  SELECT
    0::BIGINT AS last_7_days_count,
    COUNT(*)::BIGINT AS last_30_days_count
  FROM usage_records
  WHERE created_at >= NOW() - INTERVAL '30 days';
END;
$$ LANGUAGE plpgsql;

-- 14. 创建按模块统计使用次数的函数
CREATE OR REPLACE FUNCTION get_module_usage_stats()
RETURNS TABLE (
  module_id INTEGER,
  total_count BIGINT,
  last_7_days BIGINT,
  last_30_days BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    u.module_id,
    COUNT(*)::BIGINT AS total_count,
    COUNT(*) FILTER (WHERE u.created_at >= NOW() - INTERVAL '7 days')::BIGINT AS last_7_days,
    COUNT(*) FILTER (WHERE u.created_at >= NOW() - INTERVAL '30 days')::BIGINT AS last_30_days
  FROM usage_records u
  GROUP BY u.module_id
  ORDER BY u.module_id;
END;
$$ LANGUAGE plpgsql;

-- 完成提示
-- 执行完成后，请确认所有表已创建
-- SELECT table_name FROM information_schema.tables WHERE table_schema = 'public';