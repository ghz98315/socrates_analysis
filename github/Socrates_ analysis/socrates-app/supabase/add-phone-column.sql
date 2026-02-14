-- =====================================================
-- 添加手机号字段到 profiles 表
-- 支持中国环境常用的手机号注册方式
-- =====================================================

-- 添加 phone 字段
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS phone TEXT;

-- 添加索引以提高查询性能
CREATE INDEX IF NOT EXISTS profiles_phone_idx ON profiles(phone);

-- 添加注释
COMMENT ON COLUMN profiles.phone IS '手机号，用于学生账号注册和登录';

SELECT 'phone column added to profiles table' as status;
