-- =====================================================
-- 修复 RLS 策略无限递归问题
-- =====================================================

-- 删除有问题的策略
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Admins can update all profiles" ON profiles;

-- 重新创建正确的策略
CREATE POLICY "Users can view their own profile"
  ON profiles FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON profiles FOR UPDATE USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- 简单的 service role 策略
CREATE POLICY "Service role can manage profiles"
  ON profiles TO service_role
  USING (true)
  WITH CHECK (true);

SELECT 'RLS policies fixed!' as status;
