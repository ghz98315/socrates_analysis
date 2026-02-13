-- =====================================================
-- 诊断认证和 Profile 问题
-- 在 Supabase SQL Editor 中执行
-- =====================================================

-- 1. 检查所有用户
SELECT '=== AUTH USERS ===' as section;
SELECT id, email, created_at, email_confirmed_at,
       raw_user_meta_data
FROM auth.users
ORDER BY created_at DESC;

-- 2. 检查所有 profiles
SELECT '=== PROFILES ===' as section;
SELECT id, role, display_name, theme_preference, grade_level, created_at
FROM profiles;

-- 3. 检查触发器
SELECT '=== TRIGGERS ===' as section;
SELECT trigger_name, event_manipulation, event_object_table,
       action_timing, action_statement
FROM information_schema.triggers
WHERE trigger_schema = 'public'
   OR trigger_schema = 'auth';

-- 4. 测试 auth.uid() 函数
SELECT '=== TESTING AUTH.UID() ===' as section;

-- 注意：在 SQL Editor 中 auth.uid() 会返回 NULL
-- 但在客户端请求时会返回当前用户 ID
SELECT
  auth.uid() as current_user_id,
  'Note: NULL in SQL Editor, actual UID in client requests' as note;

-- 5. 检查 RLS 是否启用
SELECT '=== RLS STATUS ===' as section;
SELECT tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename IN ('profiles', 'error_sessions', 'chat_messages');

-- 6. 检查 profiles 表的 RLS 策略
SELECT '=== PROFILES RLS POLICIES ===' as section;
SELECT schemaname, tablename, policyname, permissive,
       roles, cmd, qual, with_check
FROM pg_policies
WHERE tablename = 'profiles';

-- 7. 检查是否有用户没有 profile
SELECT '=== USERS WITHOUT PROFILES ===' as section;
SELECT u.id, u.email,
       'MISSING PROFILE' as status
FROM auth.users u
LEFT JOIN profiles p ON u.id = p.id
WHERE p.id IS NULL;

-- 8. 尝试模拟用户查询（使用实际用户ID）
-- 替换下面的 'YOUR_USER_ID' 为实际的用户 ID
SELECT '=== DIRECT PROFILE QUERY ===' as section;
SELECT * FROM profiles WHERE id = '8c7c7afd-bbf3-400c-9926-b4fc93c86488';
