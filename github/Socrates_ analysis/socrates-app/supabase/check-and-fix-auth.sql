-- =====================================================
-- 检查和修复认证触发器
-- 在 Supabase SQL Editor 中执行
-- =====================================================

-- 1. 检查用户是否存在
SELECT id, email, created_at, email_confirmed_at
FROM auth.users
ORDER BY created_at DESC
LIMIT 5;

-- 2. 检查 profiles 是否存在
SELECT id, role, display_name, theme_preference, created_at
FROM profiles
ORDER BY created_at DESC
LIMIT 5;

-- 3. 检查触发器函数是否存在
SELECT routine_name, routine_type
FROM information_schema.routines
WHERE routine_schema = 'public'
  AND routine_name LIKE '%auth%';

-- 4. 检查触发器是否存在
SELECT trigger_name, event_manipulation, action_statement
FROM information_schema.triggers
WHERE trigger_schema = 'public';

-- 5. 为已存在用户手动创建 profile（如果不存在）
INSERT INTO profiles (id, role, display_name, theme_preference)
SELECT id, 'student', COALESCE(raw_user_meta_data->>'display_name', split_part(email, '@', 1)), 'junior'
FROM auth.users
WHERE id NOT IN (SELECT id FROM profiles);

-- 6. 重新创建触发器函数
DROP FUNCTION IF EXISTS handle_new_user() CASCADE;

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, role, display_name, theme_preference)
  VALUES (
    NEW.id,
    'student',
    COALESCE(NEW.raw_user_meta_data->>'display_name', 'User'),
    'junior'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 7. 删除旧触发器
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- 8. 创建新触发器
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- 9. 验证触发器
SELECT 'Trigger setup complete!' as status;

-- 10. 检查 RLS 策略
SELECT tablename, policyname, permissive, roles, cmd
FROM pg_policies
WHERE tablename = 'profiles';
