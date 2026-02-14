# 数据库迁移 - 一次性执行版本 ⚡

> 复制下面所有 SQL 代码，一次性粘贴到 Supabase SQL Editor 执行

---

## 完整 SQL (一次性执行)

```sql
-- =====================================================
-- Project Socrates - Database Migration (All-in-One)
-- =====================================================
-- 执行时间: 2026-02-14
-- 说明: 添加 parent_id 和 phone 字段，修复角色约束

-- =====================================================
-- Migration 1: Add parent_id column
-- =====================================================

ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS parent_id UUID;

ALTER TABLE profiles
  ADD CONSTRAINT profiles_parent_id_fkey
    FOREIGN KEY (parent_id)
    REFERENCES profiles(id)
    ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS profiles_parent_id_idx ON profiles(parent_id);

-- =====================================================
-- Migration 2: Add phone column
-- =====================================================

ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS phone TEXT;

CREATE INDEX IF NOT EXISTS profiles_phone_idx ON profiles(phone);

COMMENT ON COLUMN profiles.phone IS '手机号，用于学生账号注册和登录';

-- =====================================================
-- Migration 3: Fix role constraint
-- =====================================================

ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_role_check;

ALTER TABLE profiles
  ADD CONSTRAINT profiles_role_check
    CHECK (role = 'student' OR role = 'parent' OR role = 'admin');

-- =====================================================
-- 验证
-- =====================================================

SELECT
  'parent_id: ' ||
  CASE
    WHEN EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_name = 'profiles' AND column_name = 'parent_id'
    ) THEN '✅ 已添加'
    ELSE '❌ 未找到'
  END as status,
  'phone: ' ||
  CASE
    WHEN EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_name = 'profiles' AND column_name = 'phone'
    ) THEN '✅ 已添加'
    ELSE '❌ 未找到'
  END as status,
  'role_constraint: ' ||
  CASE
    WHEN EXISTS (
      SELECT 1 FROM information_schema.check_constraints
      WHERE constraint_name = 'profiles_role_check'
    ) THEN '✅ 已更新'
    ELSE '❌ 需要更新'
  END as status;
```

---

## 执行步骤

1. **打开 Supabase SQL Editor**
   ```
   https://app.supabase.com/project/_/sql
   ```

2. **复制上面所有 SQL 代码** (从 `--` 到最后的 `;`)

3. **粘贴到 SQL Editor**

4. **点击 "Run" 按钮**

5. **查看验证结果** - 应该显示 3 个 ✅

---

## 预期输出

成功执行后，验证查询应该返回：

| status | 值 |
|---------|-----|
| parent_id | ✅ 已添加 |
| phone | ✅ 已添加 |
| role_constraint | ✅ 已更新 |

---

## 如果出错

如果执行出错，请使用单独版本逐条执行：
- `scripts/MIGRATE.md`
- `scripts/DATABASE_MIGRATION_GUIDE.md`
