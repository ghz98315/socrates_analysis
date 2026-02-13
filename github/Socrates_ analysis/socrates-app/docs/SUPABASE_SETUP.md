# Supabase 设置指南

## 步骤 1: 创建 Supabase 项目

1. 访问 [https://supabase.com](https://supabase.com)
2. 点击 "New Project"
3. 填写项目信息：
   - Name: `socrates-app`
   - Database Password: (设置一个强密码并保存)
   - Region: 选择距离你最近的区域
4. 等待项目创建完成（约 2 分钟）

## 步骤 2: 获取 API 密钥

1. 进入项目 Dashboard
2. 点击左侧菜单 **Settings** → **API**
3. 复制以下信息到 `.env.local`：
   - `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon public` key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. 点击 **generate new passphrase** 生成 `service_role` key
   - ⚠️ 警告：service_role key 可以绕过 RLS，仅在服务端使用
   - 复制到 `.env.local` 的 `SUPABASE_SERVICE_ROLE_KEY`

## 步骤 3: 执行数据库 Schema

1. 点击左侧菜单 **SQL Editor**
2. 点击 **New Query**
3. 复制 `supabase/schema.sql` 文件内容
4. 粘贴到编辑器中
5. 点击 **Run** 执行
6. 确认所有表创建成功

## 步骤 4: 配置 Storage

### 创建存储桶

1. 点击左侧菜单 **Storage**
2. 创建以下 3 个 buckets：

#### Bucket 1: error-images
- Name: `error-images`
- Public bucket: ❌ 否
- File size limit: 5MB
- Allowed MIME types: `image/png`, `image/jpeg`, `image/webp`

#### Bucket 2: avatars
- Name: `avatars`
- Public bucket: ✅ 是
- File size limit: 2MB
- Allowed MIME types: `image/png`, `image/jpeg`, `image/webp`

#### Bucket 3: reports
- Name: `reports`
- Public bucket: ❌ 否
- File size limit: 10MB
- Allowed MIME types: `application/pdf`

### 配置 RLS 策略

在 Storage 中为每个 bucket 配置 RLS：

#### error-images 策略

```sql
-- 用户可以上传自己的错题图片
CREATE POLICY "Users can upload error images"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'error-images' AND
  auth.role() = 'authenticated'
);

-- 用户可以查看自己的图片
CREATE POLICY "Users can view own error images"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'error-images' AND
  auth.uid()::text = (storage.foldername(name))[1]
);
```

#### avatars 策略

```sql
-- 用户可以上传自己的头像
CREATE POLICY "Users can upload own avatar"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'avatars' AND
  auth.role() = 'authenticated' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- 所有人可以查看头像（公开 bucket）
CREATE POLICY "Public can view avatars"
ON storage.objects FOR SELECT
USING (bucket_id = 'avatars');

-- 用户可以删除自己的头像
CREATE POLICY "Users can delete own avatar"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'avatars' AND
  auth.uid()::text = (storage.foldername(name))[1]
);
```

## 步骤 5: 配置认证

1. 点击左侧菜单 **Authentication** → **Providers**
2. 确认 **Email** provider 已启用
3. 可选：启用其他登录方式（如需要）
   - Google OAuth
   - GitHub OAuth

## 步骤 6: 验证配置

在 Supabase Dashboard 中验证：

### 表结构检查
点击 **Table Editor**，确认以下表存在：
- ✅ profiles
- ✅ knowledge_tags
- ✅ error_sessions
- ✅ chat_messages
- ✅ review_schedule
- ✅ study_sessions
- ✅ learning_reports
- ✅ parent_reviews
- ✅ multi_question_images

### 数据检查
点击 `knowledge_tags` 表，确认预设数据已插入（18 条记录）

### 视图检查
点击 **Database** → **Views**，确认：
- ✅ student_stats
- ✅ pending_reviews

## 步骤 7: 更新本地环境变量

在项目根目录创建 `.env.local` 文件：

```bash
# 复制自 Supabase Dashboard → Settings → API
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJxxxxx...
SUPABASE_SERVICE_ROLE_KEY=eyJxxxxx...

# AI 模型配置（下一步配置）
AI_BASE_URL_LOGIC=https://api.deepseek.com/v1
AI_API_KEY_LOGIC=
AI_BASE_URL_VISION=https://dashscope.aliyuncs.com/compatible-mode/v1
AI_API_KEY_VISION=
```

## 常见问题

### Q: RLS 策略报错
A: 确保在 SQL Editor 中执行了完整的 schema.sql，包括 RLS 策略部分

### Q: 上传图片失败
A: 检查 Storage RLS 策略是否正确配置，确保用户有上传权限

### Q: 获取不到数据
A: 检查 RLS 策略，确保用户可以访问自己的数据

### Q: 触发器不工作
A: 检查 `handle_new_user` 函数是否创建成功

---

配置完成后，继续执行 **Phase 1.3: AI 模型配置与测试**
