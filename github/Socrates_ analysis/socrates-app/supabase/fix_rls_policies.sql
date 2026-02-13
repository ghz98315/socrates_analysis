-- =====================================================
-- Project Socrates - RLS 策略修复
-- =====================================================
-- 问题：用户注册后 profile 无法创建，导致角色选择失败
-- 原因：RLS 策略中没有 INSERT 权限
--
-- 执行步骤：
-- 1. 在 Supabase Dashboard 中打开 SQL Editor
-- 2. 复制此文件内容并执行
-- 3. 重新测试用户注册流程
-- =====================================================

-- 允许认证用户插入自己的 profile（用于触发器和手动创建）
CREATE POLICY "Users can insert their own profile"
  ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- 验证策略是否创建成功
SELECT
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE tablename = 'profiles';
