-- =====================================================
-- Project Socrates - 修复触发器问题
-- =====================================================
-- 问题：Supabase Auth 返回 500 错误，注册失败
-- 原因：触发器 handle_new_user() 可能无法正常工作
--
-- 解决方案：删除触发器，由客户端代码负责创建 profile
-- =====================================================

-- 1. 删除触发器
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- 2. 删除触发器函数
DROP FUNCTION IF EXISTS handle_new_user();

-- 3. 确认删除成功
SELECT
  trigger_name,
  event_manipulation,
  event_object_table
FROM information_schema.triggers
WHERE trigger_name = 'on_auth_user_created';

-- 如果返回空结果，说明触发器已成功删除
