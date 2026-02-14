# 数据库迁移执行指南 🚀

> 请在 Supabase SQL Editor 中按顺序执行以下 SQL

---

## 快速开始

**1. 打开 Supabase SQL Editor**
```
https://app.supabase.com/project/_/sql
```

**2. 按顺序执行以下 3 个迁移**

---

## Migration 1: Add parent_id column (家长-学生关联)

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

**执行后应返回**: `parent_id column added to profiles table`

---

## Migration 2: Add phone column (手机号字段)

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

**执行后应返回**: `phone column added to profiles table`

---

## Migration 3: Fix role constraint (修复角色约束)

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

**执行后应返回**: `profiles_role_check constraint updated to allow parent role`

---

## ✅ 验证迁移成功

执行完所有迁移后，运行此验证 SQL：

```sql
-- 验证新增字段
SELECT
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_name = 'profiles'
  AND column_name IN ('parent_id', 'phone')
ORDER BY column_name;
```

**预期结果**:
- `parent_id` | `uuid` | `YES`
- `phone` | `text` | `YES`

---

## 🔧 如需回滚

如果出现问题，执行以下 SQL 回滚：

```sql
-- 回滚 parent_id
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_parent_id_fkey;
ALTER TABLE profiles DROP COLUMN IF EXISTS parent_id;

-- 回滚 phone
ALTER TABLE profiles DROP COLUMN IF EXISTS phone;

-- 回滚 role constraint
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_role_check;
ALTER TABLE profiles
  ADD CONSTRAINT profiles_role_check
    CHECK (role = 'student' OR role = 'admin');
```

---

## 📋 执行检查清单

- [ ] Migration 1 执行成功
- [ ] Migration 2 执行成功
- [ ] Migration 3 执行成功
- [ ] 验证 SQL 返回正确结果
- [ ] 前端功能测试通过

---

## 下一步

迁移完成后，测试以下功能：

1. **家长添加学生**
   - 登录家长账号
   - 点击"添加学生"
   - 填写表单并提交
   - 验证学生列表更新

2. **学生列表权限**
   - 确认只显示当前家长的学生
   - 不同家长看到不同的学生列表

3. **错题记录保存**
   - 学生上传错题
   - 验证数据库保存成功
