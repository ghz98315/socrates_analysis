# Project Socrates

> AI 驱动的教育平台 - 通过错题分析和个性化辅导帮助学生提升学习效果

## 项目概述

Project Socrates 是一个面向中国学生的在线学习平台，利用 AI 技术提供错题分析、个性化辅导和学习进度追踪功能。

**当前版本**: v0.65
**最后更新**: 2026-02-14

---

## 技术栈

### 前端
- **框架**: Next.js 16.1.6 (App Router)
- **UI 库**: React 19.2.3
- **语言**: TypeScript
- **样式**: Tailwind CSS v4
- **组件**: shadcn/ui (new-york 风格)
- **图标**: Lucide React
- **状态管理**: Zustand
- **动画**: Framer Motion

### 后端
- **数据库**: Supabase (PostgreSQL)
- **认证**: Supabase Auth
- **AI 服务**:
  - OpenAI GPT
  - 阿里云通义千问
- **OCR**: Tesseract.js + Python OCR Server

---

## 功能特性

### 学生端
- **错题上传**: 拍照上传错题图片
- **OCR 识别**: 自动提取题目文字
- **AI 辅导**: 苏格拉底式教学引导，而非直接给答案
- **学习追踪**: 记录学习时长和进度
- **主题选择**: Junior (3-6年级) / Senior (7-9年级)

### 家长端
- **学习报告**: 查看孩子的学习统计数据
- **进度监控**: 错题数量、掌握率、学习时长
- **数据可视化**: 学习热力图、薄弱知识点分析
- **学生管理**: 添加和管理多个学生账号

---

## 项目结构

```
socrates-app/
├── app/                          # Next.js App Router
│   ├── (auth)/                  # 认证相关页面
│   │   ├── login/               # 登录页
│   │   ├── register/            # 注册页
│   │   └── select-profile/      # 角色选择页
│   ├── (parent)/                # 家长页面
│   │   └── dashboard/           # 家长仪表板
│   ├── (student)/               # 学生页面
│   │   ├── review/              # 复习页面
│   │   └── workbench/           # 学习工作台
│   ├── api/                     # API 路由
│   │   ├── chat/                # AI 对话
│   │   ├── students/            # 学生管理
│   │   ├── ocr/                # OCR 服务
│   │   └── study/session/      # 学习会话
│   └── layout.tsx               # 根布局
├── components/                  # React 组件
├── lib/                        # 工具库
│   ├── contexts/               # React Context
│   └── supabase/              # Supabase 配置
├── backend/                    # Python 后端
│   └── ocr_server.py          # OCR 服务
└── supabase/                  # 数据库文件
    └── schema.sql             # 数据库模式
```

---

## 快速开始

### 环境要求
- Node.js 18+
- Python 3.8+ (用于 OCR 服务)

### 安装依赖
```bash
npm install
```

### 配置环境变量
创建 `.env.local` 文件：
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

OPENAI_API_KEY=your_openai_key
ALIBABA_API_KEY=your_alibaba_key
```

### 启动开发服务器
```bash
npm run dev
```

访问 [http://localhost:3000](http://localhost:3000)

### 启动 OCR 服务 (可选)
```bash
cd backend
python ocr_server.py
```

---

## 数据库设置

### 执行数据库迁移

在 Supabase SQL Editor 中按顺序执行以下文件：

1. **基础模式**
   ```bash
   supabase/schema.sql
   ```

2. **家长-学生关联** (新增)
   ```bash
   supabase/add-parent-id-column.sql
   ```

3. **手机号字段** (新增)
   ```bash
   supabase/add-phone-column.sql
   ```

4. **修复角色约束** (新增)
   ```bash
   supabase/fix-profile-role-constraint.sql
   ```

---

## API 文档

### 认证相关
- `POST /api/auth/login` - 用户登录
- `POST /api/auth/register` - 用户注册

### 学生管理
- `GET /api/students` - 获取学生列表 (仅当前家长的学生)
- `POST /api/students/add` - 添加学生账号

### 学习相关
- `POST /api/ocr` - OCR 文字识别
- `POST /api/chat` - AI 对话
- `POST /api/study/session` - 学习会话管理
- `GET /api/student/stats` - 学生统计数据

---

## 开发进度

详细的开发进度请参考 [DEVELOPMENT.md](./DEVELOPMENT.md)

---

## 贡献指南

1. Fork 本项目
2. 创建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交变更 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 创建 Pull Request

---

## 许可证

本项目采用 MIT 许可证 - 详见 [LICENSE](LICENSE) 文件

---

## 联系方式

如有问题或建议，请提交 Issue 或 Pull Request。
