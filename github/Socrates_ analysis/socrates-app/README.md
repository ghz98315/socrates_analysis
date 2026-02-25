# Project Socrates

> AI 驱动的教育平台 - 通过错题分析和个性化辅导帮助学生提升学习效果

## 项目概述

Project Socrates 是一个面向中国学生的在线学习平台，利用 AI 技术提供错题分析、个性化辅导和学习进度追踪功能。

**当前版本**: v0.99
**最后更新**: 2026-02-25

---

## 技术栈

### 前端
- **框架**: Next.js 16.1.6 (App Router)
- **UI 库**: React 19.2.3
- **语言**: TypeScript
- **样式**: Tailwind CSS v4
- **组件**: shadcn/ui (new-york 风格)
- **图标**: Lucide React
- **状态管理**: React Context + Zustand
- **动画**: Framer Motion + CSS Animations
- **PDF**: @react-pdf/renderer

### 后端
- **数据库**: Supabase (PostgreSQL)
- **认证**: Supabase Auth
- **AI 服务**:
  - 通义千问 (Qwen) - 推荐
  - DeepSeek
  - 豆包 (Doubao)
  - 自定义 OpenAI 兼容 API
- **OCR**: Tesseract.js + Python OCR Server
- **离线存储**: IndexedDB

---

## 功能特性

### 学生端
- **错题上传**: 拍照上传错题图片，支持拖拽、预览
- **OCR 识别**: 自动提取题目文字
- **AI 辅导**: 苏格拉底式教学引导，而非直接给答案
- **学习追踪**: 记录学习时长和进度
- **主题选择**: Junior (3-6年级) / Senior (7-9年级)
- **语音输入**: 语音转文字输入问题
- **PDF 导出**: 单题/批量导出错题
- **错题本**: 分类筛选、难度展示、知识点标签

### 家长端
- **学习报告**: 查看孩子的学习统计数据
- **进度监控**: 错题数量、掌握率、学习时长
- **数据可视化**: 学习热力图、薄弱知识点分析
- **学生管理**: 添加和管理多个学生账号
- **权限控制**: 角色权限验证，学生无法访问家长功能
- **主题统计**: 查看孩子在 Junior/Senior 模式下的学习分布

### 高级功能 (P2)
- **AI 模型切换**: 支持多种 AI 模型，用户可自由切换
- **多设备同步**: 跨设备数据同步
- **离线模式**: 离线使用，自动同步

---

## 项目结构

```
socrates-app/
├── app/                          # Next.js App Router
│   ├── (auth)/                  # 认证相关页面
│   │   ├── login/               # 登录页
│   │   ├── register/            # 注册页
│   │   └── select-profile/      # 角色选择页 (含权限控制)
│   ├── (parent)/                # 家长页面
│   │   └── dashboard/           # 家长仪表板 (含权限验证)
│   ├── (student)/               # 学生页面
│   │   ├── workbench/           # 学习工作台
│   │   ├── error-book/          # 错题本
│   │   ├── achievements/        # 成就系统
│   │   ├── review/              # 复习页面
│   │   └── settings/            # 设置页面
│   ├── api/                     # API 路由
│   │   ├── chat/                # AI 对话 (多模型支持)
│   │   ├── students/            # 学生管理
│   │   ├── error-session/       # 错题会话
│   │   ├── study/session/       # 学习会话
│   │   ├── student/stats/       # 学生统计
│   │   ├── ai-settings/         # AI 模型设置
│   │   └── ocr/                 # OCR 服务
│   └── layout.tsx               # 根布局
├── components/                  # React 组件
│   ├── GlobalNav.tsx           # 全局导航
│   ├── ImageUploader.tsx       # 图片上传
│   ├── ChatMessage.tsx         # 聊天消息
│   ├── ChatInput.tsx           # 聊天输入 (语音支持)
│   ├── LearningHeatmap.tsx     # 学习热力图
│   ├── SyncStatusIndicator.tsx # 同步状态
│   └── OfflineIndicator.tsx    # 离线状态
├── lib/                        # 工具库
│   ├── contexts/               # React Context
│   │   └── AuthContext.tsx     # 认证上下文
│   ├── supabase/               # Supabase 配置
│   │   ├── client.ts           # 客户端 (Cookie 存储)
│   │   └── database.types.ts   # 类型定义
│   ├── ai-models/              # AI 模型配置
│   │   ├── types.ts            # 类型定义
│   │   ├── config.ts           # 模型配置
│   │   └── service.ts          # 模型服务
│   ├── sync/                   # 多设备同步
│   ├── offline/                # 离线模式
│   └── pdf/                    # PDF 导出
│       ├── ErrorQuestionPDF.tsx # 单题导出
│       └── ErrorBookPDF.tsx    # 错题本导出
├── backend/                    # Python 后端
│   └── ocr_server.py          # OCR 服务
└── supabase/                   # 数据库文件
    ├── schema.sql              # 数据库模式
    ├── add-parent-id-column.sql
    ├── add-phone-column.sql
    └── add-theme-used-column.sql
```

---

## 快速开始

### 环境要求
- Node.js 18+
- Python 3.8+ (用于 OCR 服务，可选)

### 安装依赖
```bash
npm install
```

### 配置环境变量
创建 `.env.local` 文件：
```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# AI 模型 (至少配置一个)
DASHSCOPE_API_KEY=your_dashscope_key      # 通义千问 (推荐)
AI_API_KEY_LOGIC=your_deepseek_key         # DeepSeek
DOUBAO_API_KEY=your_doubao_key             # 豆包
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

2. **家长-学生关联**
   ```bash
   supabase/add-parent-id-column.sql
   ```

3. **手机号字段**
   ```bash
   supabase/add-phone-column.sql
   ```

4. **修复角色约束**
   ```bash
   supabase/fix-profile-role-constraint.sql
   ```

5. **主题追踪字段** (新增)
   ```bash
   supabase/add-theme-used-column.sql
   ```

---

## API 文档

### 认证相关
- `POST /api/auth/login` - 用户登录
- `POST /api/auth/register` - 用户注册

### 学生管理
- `GET /api/students` - 获取学生列表 (仅当前家长的学生)
- `POST /api/students/add` - 添加学生账号
- `DELETE /api/students/[id]` - 删除学生

### 学习相关
- `POST /api/ocr` - OCR 文字识别
- `POST /api/chat` - AI 对话 (支持多模型)
- `POST /api/error-session` - 错题会话管理
- `GET /api/error-session` - 获取错题列表
- `POST /api/study/session` - 学习会话管理
- `GET /api/student/stats` - 学生统计数据 (含主题统计)

### AI 设置
- `GET /api/ai-settings` - 获取 AI 模型设置
- `POST /api/ai-settings` - 更新 AI 模型设置

---

## 开发进度

详细的开发进度请参考 [DEVELOPMENT.md](./DEVELOPMENT.md)

### 当前状态: v0.99 (99% 完成)

| 模块 | 完成度 |
|-----|--------|
| 认证系统 | 100% |
| 学生工作台 | 95% |
| 家长仪表板 | 90% |
| 错题本功能 | 90% |
| 成就系统 | 85% |
| P2 高级功能 | 100% |

---

## 最近更新 (v0.99)

### 新增功能
- ✅ 主题追踪: 记录对话时的 Junior/Senior 模式
- ✅ 角色权限控制: 学生无法切换到家长角色
- ✅ Session 持久化修复: HTTP/HTTPS 兼容

### Bug 修复
- PDF 中文乱码问题
- 登录状态丢失问题
- 添加学生界面蒙版过暗
- 图片显示不完整

### UI 优化
- 页面渐变背景
- 对话气泡区分色块
- 图片上传动画边框
- 成就页圆形进度环

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
