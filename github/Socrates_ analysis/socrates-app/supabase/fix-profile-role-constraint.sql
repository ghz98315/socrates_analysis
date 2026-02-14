-- =====================================================
-- 修复 profiles_role_check 约束允许 'parent' 角色
-- =====================================================

-- 先删除旧的约束
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_role_check;

-- 重新创建约束，允许 'student' | 'parent' | 'admin'
ALTER TABLE profiles
  ADD CONSTRAINT profiles_role_check
    CHECK (role = 'student' OR role = 'parent' OR role = 'admin');

SELECT 'profiles_role_check constraint updated to allow parent role' as status;
