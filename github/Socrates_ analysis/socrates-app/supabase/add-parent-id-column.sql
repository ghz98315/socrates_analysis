-- =====================================================
-- 添加 parent_id 字段到 profiles 表
-- 用于关联家长和学生账号
-- =====================================================

-- 添加 parent_id 字段（可空，允许独立的家长/学生账号）
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS parent_id UUID;

-- 添加外键约束（可选，用于数据完整性）
ALTER TABLE profiles
  ADD CONSTRAINT profiles_parent_id_fkey
    FOREIGN KEY (parent_id)
    REFERENCES profiles(id)
    ON DELETE SET NULL;

-- 创建索引以提高查询性能
CREATE INDEX IF NOT EXISTS profiles_parent_id_idx ON profiles(parent_id);

-- 验证
SELECT 'parent_id column added to profiles table' as status;
