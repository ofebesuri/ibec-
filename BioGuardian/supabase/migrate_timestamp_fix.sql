-- BioGuardian 数据迁移脚本 v2
-- 修复 server_timestamp 时区问题
-- 执行前请备份数据库！

-- 1. 将 server_timestamp 从 TIMESTAMPTZ 改为 VARCHAR
-- 这样可以存储精确的 ISO 格式时间字符串，避免时区转换导致哈希不匹配

ALTER TABLE declarations
ALTER COLUMN server_timestamp TYPE VARCHAR(100)
USING server_timestamp::text;

-- 2. 如果有旧数据，将 timestamp_string 中的时间转换为 UTC ISO 格式来修复哈希
-- 注意：这个修复只针对2026年3月之后创建的声明
-- 对于每个声明，我们需要用正确的 server_timestamp 来更新它

-- 首先，查看当前数据
-- SELECT id, server_timestamp, timestamp_string FROM declarations LIMIT 10;

-- 如果已有数据格式不对，可以执行以下修复：
-- 将 server_timestamp 重新格式化为 ISO UTC 格式
-- UPDATE declarations
-- SET server_timestamp = TO_CHAR(TO_TIMESTAMP(timestamp_string, 'YYYY-MM-DD HH24:MI:SS.US'), 'YYYY-MM-DD"T"HH24:MI:SS.US"Z"')
-- WHERE server_timestamp LIKE '%+%' OR server_timestamp LIKE '%-%';

-- 3. 确认更改
-- SELECT column_name, data_type FROM information_schema.columns
-- WHERE table_name = 'declarations' AND column_name = 'server_timestamp';

SELECT '迁移完成：server_timestamp 已改为 VARCHAR(100)，新的声明将使用精确的 ISO 时间字符串。' as status;
