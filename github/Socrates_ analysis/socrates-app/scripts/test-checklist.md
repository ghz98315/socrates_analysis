# P0 任务测试检查清单

> 最后更新: 2026-02-14

---

## 🔴 P0-1: 执行数据库迁移

### 执行步骤

1. **打开 Supabase SQL Editor**
   ```
   https://app.supabase.com/project/_/sql
   ```

2. **执行 Migration 1: Add parent_id column**

   ```sql
   -- 添加 parent_id 字段（可空，允许独立的家长/学生账号）
   ALTER TABLE profiles
     ADD COLUMN IF NOT EXISTS parent_id UUID;

   -- 添加外键约束
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

3. **执行 Migration 2: Add phone column**

   ```sql
   -- 添加 phone 字段
   ALTER TABLE profiles
     ADD COLUMN IF NOT EXISTS phone TEXT;

   -- 添加索引以提高查询性能
   CREATE INDEX IF NOT EXISTS profiles_phone_idx ON profiles(phone);

   -- 添加注释
   COMMENT ON COLUMN profiles.phone IS '手机号，用于学生账号注册和登录';

   SELECT 'phone column added to profiles table' as status;
   ```

4. **执行 Migration 3: Fix role constraint**

   ```sql
   -- 先删除旧的约束
   ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_role_check;

   -- 重新创建约束，允许 'student' | 'parent' | 'admin'
   ALTER TABLE profiles
     ADD CONSTRAINT profiles_role_check
       CHECK (role = 'student' OR role = 'parent' OR role = 'admin');

   SELECT 'profiles_role_check constraint updated to allow parent role' as status;
   ```

5. **验证迁移结果**

   ```sql
   -- 检查新增列
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

### 验证清单

- [ ] parent_id 字段已创建
- [ ] parent_id 外键约束已添加
- [ ] parent_id 索引已创建
- [ ] phone 字段已创建
- [ ] phone 索引已创建
- [ ] profiles_role_check 约束已更新
- [ ] 验证查询返回正确结果

---

## 🟡 P0-2: 测试完整认证流程

### 测试用例

#### TC-01: 家长邮箱注册
| 步骤 | 操作 | 预期结果 | 实际结果 |
|------|------|---------|---------|
| 1 | 访问 `/register` | 显示注册页面 | |
| 2 | 输入邮箱、密码、确认密码 | 表单可提交 | |
| 3 | 点击"创建账户" | 跳转到 `/select-profile` | |
| 4 | 选择 "Parent" 角色 | 跳转到 `/dashboard` | |
| 5 | 检查数据库 | profile.role = 'parent' | |

#### TC-02: 家长邮箱登录
| 步骤 | 操作 | 预期结果 | 实际结果 |
|------|------|---------|---------|
| 1 | 访问 `/login` | 显示登录页面 | |
| 2 | 输入注册的邮箱和密码 | 表单可提交 | |
| 3 | 点击"登录" | 跳转到 `/select-profile` | |
| 4 | 选择 "Parent" 角色 | 跳转到 `/dashboard` | |

#### TC-03: 学生邮箱注册
| 步骤 | 操作 | 预期结果 | 实际结果 |
|------|------|---------|---------|
| 1-4 | 同 TC-01 | 角色选择 "Junior" 或 "Senior" | |
| 5 | 检查数据库 | profile.role = 'student' | |

#### TC-04: 角色重新选择
| 步骤 | 操作 | 预期结果 | 实际结果 |
|------|------|---------|---------|
| 1 | 以家长身份登录后访问 `/select-profile` | 显示三个角色选项 | |
| 2 | 选择不同角色 | profile 更新并跳转 | |

---

## 🟡 P0-3: 测试错题记录保存

### 测试用例

#### TC-05: 学生创建错题会话
| 步骤 | 操作 | 预期结果 | 实际结果 |
|------|------|---------|---------|
| 1 | 学生登录 | 进入工作台 | |
| 2 | 上传错题图片 | OCR 开始处理 | |
| 3 | OCR 完成 | 显示提取的文字 | |
| 4 | 点击"确认" | 创建错题会话 | |
| 5 | 检查数据库 | error_sessions 表有新记录 | |

#### TC-06: 错题会话字段验证
```sql
-- 验证错题会话记录
SELECT
  id,
  student_id,
  subject,
  status,
  created_at
FROM error_sessions
ORDER BY created_at DESC
LIMIT 5;
```

**检查项**:
- [ ] session_id 格式正确 (UUID)
- [ ] student_id 正确关联
- [ ] status = 'guided_learning'
- [ ] created_at 时间正确

---

## 🟡 P0-4: 测试家长添加学生功能

### 测试用例

#### TC-07: 家长添加学生（邮箱方式）
| 步骤 | 操作 | 预期结果 | 实际结果 |
|------|------|---------|---------|
| 1 | 家长登录进入 Dashboard | 显示学生列表 | |
| 2 | 点击"添加学生" | 显示添加学生模态框 | |
| 3 | 填写：姓名、邮箱、密码、年级 | 表单可提交 | |
| 4 | 点击"添加学生" | API 调用成功 | |
| 5 | 检查数据库 | 新学生已创建 | |
| 6 | 检查 parent_id | parent_id 正确关联 | |

#### TC-08: 学生列表权限验证
| 步骤 | 操作 | 预期结果 | 实际结果 |
|------|------|---------|---------|
| 1 | 家长 A 登录 | 只看到 A 的学生 | |
| 2 | 家长 B 登录 | 只看到 B 的学生 | |
| 3 | API `/api/students` | 返回当前家长的学生 | |

#### TC-09: 添加学生字段验证
```sql
-- 验证学生账号
SELECT
  p.id,
  p.display_name,
  p.phone,
  p.role,
  p.parent_id,
  p.grade_level,
  p.theme_preference
FROM profiles p
WHERE p.role = 'student'
ORDER BY p.created_at DESC
LIMIT 5;
```

**检查项**:
- [ ] 新学生 role = 'student'
- [ ] parent_id 指向正确的家长
- [ ] phone 字段已保存
- [ ] theme_preference = 'junior'

---

## 🔴 P0-5: 修复发现的 Bug

### 已知问题清单

| ID | 问题 | 位置 | 严重程度 | 状态 |
|----|------|------|----------|------|
| BUG-01 | error-session API 字段名不一致 | `extracted_text` vs `extract_text` | 🟡 中 | 待修复 |
| BUG-02 | 缺少验证 SQL 验证函数 | API 无法验证字段 | 🟢 低 | 待添加 |

### BUG-01 修复: 字段名不一致

**文件**: `app/api/error-session/route.ts`

**问题**:
- 前端发送 `extracted_text`
- 后端接收 `extract_text`
- 导致数据丢失

**修复方案**:
统一使用 `extracted_text`

---

## 测试报告模板

### 测试执行记录

| 测试用例 | 执行人 | 执行时间 | 结果 | 备注 |
|---------|--------|----------|------|------|
| TC-01 | | | | |
| TC-02 | | | | |
| TC-03 | | | | |
| TC-04 | | | | |
| TC-05 | | | | |
| TC-06 | | | | |
| TC-07 | | | | |
| TC-08 | | | | |
| TC-09 | | | | |

### Bug 报告

| Bug ID | 描述 | 严重程度 | 状态 |
|--------|------|----------|------|
| BUG-01 | 字段名不一致 | 中 | 🔴 待修复 |

---

## 下一步

完成所有 P0 测试后：
- [ ] 修复所有发现的 Bug
- [ ] 更新测试报告
- [ ] 提交代码变更
- [ ] 开始 P1 任务
