-- =====================================================
-- 修复 RLS 策略问题（版本 3）
-- =====================================================

-- 先删除所有 profiles 相关的策略
DROP POLICY IF EXISTS "Users can view their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Admins can update all profiles" ON profiles;
DROP POLICY IF EXISTS "Service role can manage profiles" ON profiles;

-- 重新创建正确的策略（避免递归）
CREATE POLICY "Users can view their own profile"
  ON profiles FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON profiles FOR UPDATE USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Admin 策略（不查询 profiles 表，避免递归）
CREATE POLICY "Admins can view all profiles"
  ON profiles FOR SELECT
  USING (auth.uid() IN (SELECT id FROM auth.users WHERE (raw_user_meta_data->>'is_admin')::boolean = true));

CREATE POLICY "Admins can update all profiles"
  ON profiles FOR UPDATE
  USING (auth.uid() IN (SELECT id FROM auth.users WHERE (raw_user_meta_data->>'is_admin')::boolean = true));

-- Service role 策略
CREATE POLICY "Service role can manage profiles"
  ON profiles TO service_role
  USING (true)
  WITH CHECK (true);

SELECT 'RLS policies fixed!' as status;
