# Database Migration Guide

## 需要执行的迁移

请在 Supabase SQL Editor 中按顺序执行以下脚本：

**SQL Editor 地址**: https://app.supabase.com/project/_/sql

---

## Migration 1: Add parent_id column

```sql
-- =====================================================
-- 添加 parent_id 字段到 profiles 表
-- 用于关联家长和学生账号
-- =====================================================

-- 添加 parent_id 字段（可空，允许独立的家长/学生账号）
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS parent_id UUID;

-- 添加外键约束（可选，用于数据完整性）
ALTER TABLE profiles
  ADD CONSTRAINT profiles_parent_id_fkey
    FOREIGN KEY (parent_id)
    REFERENCES profiles(id)
    ON DELETE SET NULL;

-- 创建索引以提高查询性能
CREATE INDEX IF NOT EXISTS profiles_parent_id_idx ON profiles(parent_id);

-- 验证
SELECT 'parent_id column added to profiles table' as status;
```

---

## Migration 2: Add phone column

```sql
-- =====================================================
-- 添加手机号字段到 profiles 表
-- 支持中国环境常用的手机号注册方式
-- =====================================================

-- 添加 phone 字段
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS phone TEXT;

-- 添加索引以提高查询性能
CREATE INDEX IF NOT EXISTS profiles_phone_idx ON profiles(phone);

-- 添加注释
COMMENT ON COLUMN profiles.phone IS '手机号，用于学生账号注册和登录';

SELECT 'phone column added to profiles table' as status;
```

---

## Migration 3: Fix role constraint

```sql
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
```

---

## 执行步骤

1. 打开 [Supabase Dashboard](https://app.supabase.com)
2. 选择你的项目
3. 点击左侧菜单 "SQL Editor"
4. 按顺序复制粘贴上述 SQL 代码
5. 点击 "Run" 执行
6. 确认每条 SQL 都返回成功状态

---

## 验证迁移

执行以下 SQL 验证迁移成功：

```sql
-- 检查表结构
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'profiles'
  AND column_name IN ('parent_id', 'phone')
ORDER BY column_name;

-- 检查约束
SELECT constraint_name, check_clause
FROM information_schema.check_constraints
WHERE constraint_name = 'profiles_role_check';
```

---

## 回滚（如需要）

```sql
-- 回滚 parent_id
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_parent_id_fkey;
ALTER TABLE profiles DROP COLUMN IF EXISTS parent_id;

-- 回滚 phone
ALTER TABLE profiles DROP COLUMN IF EXISTS phone;

-- 回滚 role constraint (恢复原状)
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_role_check;
ALTER TABLE profiles
  ADD CONSTRAINT profiles_role_check
    CHECK (role = 'student' OR role = 'admin');
```
