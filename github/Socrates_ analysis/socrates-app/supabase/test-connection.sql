-- =====================================================
-- 测试 Supabase 连接和 RLS
-- =====================================================

-- 1. 检查当前用户
SELECT '=== CURRENT USER (should be NULL in SQL Editor) ===' as section;
SELECT auth.uid() as current_user_id;

-- 2. 尝试模拟用户操作
SELECT '=== TEST: CAN USER SELECT THEIR OWN PROFILE? ===' as section;
-- 注意：在 SQL Editor 中 auth.uid() 返回 NULL
-- 这条语句会返回所有记录（因为 NULL = NULL 不成立）

SELECT *
FROM profiles
WHERE id = auth.uid()
  OR auth.uid() IS NULL;  -- 这个条件用于 SQL Editor 测试

-- 3. 检查特定用户的 profile
SELECT '=== SPECIFIC USER PROFILE ===' as section;
SELECT * FROM profiles
WHERE id = '8c7c7afd-bbf3-400c-9926-b4fc93c86488';

-- 4. 尝试直接更新（在 SQL Editor 中应该成功）
SELECT '=== TEST: UPDATE PROFILE ===' as section;

UPDATE profiles
SET
  theme_preference = 'senior',
  grade_level = 7,
  role = 'student'
WHERE id = '8c7c7afd-bbf3-400c-9926-b4fc93c86488'
RETURNING *;

-- 5. 验证更新结果
SELECT '=== VERIFY UPDATE ===' as section;
SELECT * FROM profiles
WHERE id = '8c7c7afd-bbf3-400c-9926-b4fc93c86488';
