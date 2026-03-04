# Socra Platform - 开发进度总览

> 本文档为项目总览，详细进度请查看各产品文档

---

## 产品矩阵

```
┌─────────────────────────────────────────────────────────────────┐
│                     Landing Page                                 │
│                   https://socra.cn                               │
├─────────────────────────────────────────────────────────────────┤
│                              │                                   │
│        ┌─────────────────────┴─────────────────────┐            │
│        ▼                                           ▼            │
│  ┌─────────────────────┐              ┌─────────────────────┐   │
│  │   Socrates 错题本    │              │   Essay 作文批改    │   │
│  │  socrates.socra.cn  │              │   essay.socra.cn    │   │
│  ├─────────────────────┤              ├─────────────────────┤   │
│  │ • OCR错题识别       │              │ • 作文图片上传      │   │
│  │ • AI苏格拉底对话    │              │ • AI批改评分        │   │
│  │ • 几何图形渲染      │              │ • 闪光点挖掘        │   │
│  │ • 复习计划管理      │              │ • 魔法修改建议      │   │
│  │ • 成就系统          │              │ • 金句百宝箱        │   │
│  └─────────────────────┘              └─────────────────────┘   │
│                              │                                   │
│                              ▼                                   │
│                   ┌─────────────────────┐                       │
│                   │   Supabase Auth     │                       │
│                   │   (共享用户系统)     │                       │
│                   └─────────────────────┘                       │
└─────────────────────────────────────────────────────────────────┘
```

---

## 进度文档

| 产品 | 文档 | 当前版本 | 状态 |
|------|------|----------|------|
| **Socrates 错题本** | [progress_socrates.md](./progress_socrates.md) | v1.6.29 | 🟢 运行中 |
| **Essay 作文批改** | [progress_essay.md](./progress_essay.md) | v1.2.0 | 🟢 历史完成 |

---

## 当前开发重点

### 2026-03-04 更新
- ✅ 统一项目到 socra-platform monorepo
- ✅ 全站暖色调主题更新（Socrates + Essay + Landing）
- ✅ 修复 Essay 登录模块（使用本地 supabase client）
- ✅ 修复 Vercel 部署配置（outputDirectory 路径问题）
- ⏳ Vercel 部署测试（等待网络问题恢复）

### Socrates (错题本平台)
- ✅ 核心功能完成
- ✅ 暖色调主题更新
- ⏳ 时间规划页面开发
- ⏳ 外部API集成（接收Essay数据）

### Essay (作文批改)
- ✅ 批改功能完成
- ✅ Supabase认证集成
- ✅ 数据持久化（历史记录）
- ✅ 暖色调主题更新
- ✅ 登录模块修复
- ⏳ 与Socrates同步

---

## 技术架构

### 共享组件
- **认证**: Supabase Auth
- **数据库**: Supabase PostgreSQL
- **AI服务**: 阿里云通义千问

### 独立组件
| 组件 | Socrates | Essay |
|------|----------|-------|
| 框架 | Next.js 15 | Vite + React |
| 部署 | Vercel | Cloudflare Pages |
| 仓库 | socra-platform (monorepo) |

---

## 快速启动提示词

复制以下内容到新的对话中继续开发：

```
我是 Socra 平台的开发者。请阅读以下文件了解项目当前状态：

1. 读取 D:\github\Socrates_ analysis\progress_recall.md 了解项目总览
2. 根据需要阅读：
   - D:\github\Socrates_ analysis\progress_socrates.md (错题本平台)
   - D:\github\Socrates_ analysis\progress_essay.md (作文批改)

项目目录 (统一 monorepo):
- 主仓库: D:\github\Socrates_ analysis\socra-platform
- Socrates: socra-platform/apps/socrates
- Essay: socra-platform/apps/essay
- Landing: socra-platform/apps/landing
- 共享包: socra-platform/packages
- 文档: D:\github\Socrates_ analysis\

请确认已了解项目状态，我需要继续开发：
[在此填写具体需求]
```

---

## 相关文档

| 文档 | 说明 |
|------|------|
| [prd.md](./prd.md) | 产品需求文档 |
| [DEPLOYMENT.md](./DEPLOYMENT.md) | 部署指南 |
| [mathpromote.md](./mathpromote.md) | Prompt设计参考 |

---

---

## Vercel 部署配置说明

### 根本问题
pnpm 工作空间需要在 monorepo 根目录运行 install，所以 Vercel Dashboard 的 **Root Directory 必须留空**。

### 正确配置

```
Vercel Dashboard 设置：
┌─────────────────────────────────────────────┐
│ Root Directory: 留空（必须！）                │
│ Framework: 自动检测                          │
└─────────────────────────────────────────────┘

vercel.json 配置（已在各 app 中配置）：
┌─────────────────────────────────────────────┐
│ buildCommand: pnpm --filter=@socra/xxx build│
│ installCommand: pnpm install                │
│ outputDirectory: apps/xxx/.next 或 dist     │
└─────────────────────────────────────────────┘
```

### 三个项目的 Vercel 配置

| 项目 | Vercel 项目名 | outputDirectory |
|------|--------------|-----------------|
| Socrates | socra-socrates | apps/socrates/.next |
| Essay | socra-platform-essay | apps/essay/dist |
| Landing | socra-landing | apps/landing/.next |

---

*文档最后更新: 2026-03-04*
