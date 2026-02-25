-- =====================================================
-- 添加 theme_used 字段到 error_sessions 表
-- 用于记录对话时使用的主题模式（Junior/Senior）
-- =====================================================

-- 添加 theme_used 字段
ALTER TABLE error_sessions
  ADD COLUMN IF NOT EXISTS theme_used TEXT CHECK (theme_used IN ('junior', 'senior'));

-- 添加注释
COMMENT ON COLUMN error_sessions.theme_used IS '对话时使用的主题模式：junior=小学版, senior=中学版';

-- 创建索引以提高按主题查询的性能
CREATE INDEX IF NOT EXISTS error_sessions_theme_used_idx ON error_sessions(theme_used);

-- 验证
SELECT 'theme_used column added to error_sessions table' as status;
