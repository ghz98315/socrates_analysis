-- =====================================================
-- Project Socrates - 开发环境 Auth 配置
-- =====================================================
-- 问题：注册时报错 "Database error saving new user"
-- 可能原因：Supabase Auth 需要邮箱确认
--
-- 解决方案：在开发环境禁用邮箱确认
-- =====================================================

-- 禁用邮箱确认（开发环境）
-- 注意：生产环境应该启用邮箱确认
ALTER TABLE auth.users
  ALTER COLUMN email_confirmed_at SET DEFAULT NOW();

-- 或者更简单的方法：在 Supabase Dashboard 中配置
-- 1. 打开 Supabase Dashboard
-- 2. 进入 Authentication → Settings
-- 3. 找到 "Email Confirmation" 选项
-- 4. 关闭 "Enable email confirmations"

-- 检查是否有用户被创建但没有确认
SELECT
  id,
  email,
  email_confirmed_at,
  created_at,
  raw_user_meta_data
FROM auth.users
ORDER BY created_at DESC
LIMIT 5;
