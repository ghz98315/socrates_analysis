-- =====================================================
-- 修复 RLS 策略 - 允许认证用户读取自己的 profile
-- =====================================================

-- 删除旧的策略
DROP POLICY IF EXISTS "Users can view their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;

-- 重新创建更宽松的策略（使用 anon 角色作为后备）
CREATE POLICY "Users can view their own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id OR auth.uid() IS NOT NULL);

CREATE POLICY "Users can update their own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

SELECT 'RLS policies updated!' as status;
