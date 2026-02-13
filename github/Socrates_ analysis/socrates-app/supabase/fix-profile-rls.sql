-- =====================================================
-- 修复 Profiles 表的 RLS 策略
-- 确保用户可以创建和更新自己的 profile
-- =====================================================

-- 删除所有现有的 profiles 策略
DROP POLICY IF EXISTS "Users can view their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Admins can update all profiles" ON profiles;
DROP POLICY IF EXISTS "Service role can manage profiles" ON profiles;

-- 创建简化的策略 - 允许所有认证用户的基本操作
CREATE POLICY "Allow select own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Allow insert own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Allow update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- 为已存在的用户创建 profile（如果不存在）
INSERT INTO profiles (id, role, display_name, theme_preference, grade_level)
SELECT
  u.id,
  'student',
  COALESCE(u.raw_user_meta_data->>'display_name', split_part(u.email, '@', 1)),
  'junior',
  NULL
FROM auth.users u
WHERE NOT EXISTS (
  SELECT 1 FROM profiles p WHERE p.id = u.id
);

-- 验证结果
SELECT
  'RLS policies fixed!' as status,
  COUNT(*) as profile_count
FROM profiles;

-- 查看当前的 profiles
SELECT id, role, display_name, theme_preference, grade_level, created_at
FROM profiles;
