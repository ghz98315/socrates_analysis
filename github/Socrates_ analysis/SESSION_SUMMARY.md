# Project Socrates - 会话总结

## 下次开始从这里读取

> 会话时间: 2026-02-28
> Git提交: 已提交 (v1.1.2 部署修复)
> 项目版本: v1.1.2
> 整体进度: 100%
> 上线状态: 已上线
> 域名状态: socra.cn + socrates.socra.cn ✅ 已配置

---

## 2026-02-28 部署修复

### 问题：Vercel 构建失败 - TypeScript 类型错误

**错误日志**:
```
Failed to compile.
./app/api/profile/ensure/route.ts:81:19
Type error: Argument of type 'Record<string, any>' is not assignable to parameter of type 'never'.
```

**根本原因**:
- Supabase 客户端类型推断问题
- TypeScript 严格模式下 `updates` 对象类型不匹配

**修复内容**:

| 文件 | 修改 |
|------|------|
| `apps/socrates/app/api/profile/ensure/route.ts` | 添加 `(admin as any)` 类型断言 |
| `apps/socrates/app/api/students/route.ts` | 添加调试信息 |
| `apps/socrates/lib/types/index.ts` | UserProfile 添加 phone 字段 |

**提交 (socra-platform)**:
- `a05be47` - fix: Add type assertion for Supabase admin client
- `5e29a29` - fix: TypeScript error and add debugging to students API
- `ff89bb1` - fix: Use API endpoint for profile creation to bypass RLS

**提交 (Socrates_analysis)**:
- `b546155` - docs: Update PROGRESS.md to v1.1.1 with community fixes

---

## 2026-02-27 Bug修复

### 问题：新用户注册选择 Parent 角色失败

**错误日志**:
```
PGRST116: Cannot coerce the result to a single JSON object
The result contains 0 rows
```

**根本原因**:
1. 新注册用户的 profile 记录可能不存在（触发器/手动创建失败）
2. `updateProfile` 使用 `UPDATE` 而非 `UPSERT`
3. CSP 阻止了 Supabase Realtime WebSocket 连接

**修复内容**:

| 文件 | 修改 |
|------|------|
| `AuthContext.tsx` | `update()` → `upsert()` 自动创建不存在的 profile |
| `vercel.json` | 添加 `wss://*.supabase.co` 到 CSP connect-src |

**提交**:
- `d7d649e` - fix: Profile creation with upsert and CSP WebSocket support
- `05d94de` - docs: Update PROGRESS.md to v1.0.1

---

## 2026-02-26 重大更新

### 架构重构：Monorepo

从单一项目迁移到 **Turborepo Monorepo** 架构：

```
socra-platform/                    # Monorepo 根目录
├── apps/
│   ├── landing/                   # 落地页 → socra.cn
│   └── socrates/                  # 苏格拉底 → socrates.socra.cn
├── packages/
│   ├── ui/                        # 共享 UI 组件
│   ├── auth/                      # 共享认证模块
│   ├── database/                  # 共享数据库工具
│   └── config/                    # 共享配置
├── pnpm-workspace.yaml
└── turbo.json
```

### 落地页开发

- **风格**: 教育温馨风（风格B）
- **Slogan**: AI 引导学习，培养独立思考
- **产品展示**: 3个已上线 + 7个即将上线
- **响应式设计**: 支持移动端

### OCR 系统重构

- **云端 OCR API**: 使用通义千问 VL (qwen-vl-max) 替代本地 PaddleOCR
- **移除 Tesseract.js**: 解决国内 CDN 访问问题
- **优势**: 无需本地服务器、支持复杂数学公式、国内访问稳定

### 部署架构

```
用户(国内) → Cloudflare CDN → Vercel (香港节点 hkg1)
```

---

## 部署信息

| 项目 | 地址 | 状态 |
|------|------|------|
| **落地页** | https://socra.cn | ✅ 已上线 |
| **苏格拉底** | https://socrates.socra.cn | ✅ 已上线 |
| **GitHub** | https://github.com/ghz98315/socra-platform | ✅ 新仓库 |
| **CDN** | Cloudflare | ✅ 已配置 |

### Vercel 项目配置

| 项目 | Root Directory | 域名 |
|------|----------------|------|
| socra-landing | apps/landing | socra.cn |
| socra-socrates | apps/socrates | socrates.socra.cn |

### 环境变量 (socrates)

```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
DASHSCOPE_API_KEY
```

---

## 域名架构

```
socra.cn                           # 落地页/产品导航 ✅
├── socrates.socra.cn              # 苏格拉底AI辅导 ✅
├── essay.socra.cn                 # 作文批改 (预留)
└── planner.socra.cn               # 学习任务规划 (预留)
```

---

## 技术栈

| 类别 | 技术 |
|------|------|
| 框架 | Next.js 16.1.6 |
| Monorepo | Turborepo + pnpm |
| 部署 | Vercel |
| CDN | Cloudflare |
| 数据库 | Supabase |
| AI | 通义千问 (Qwen) |
| OCR | 通义千问 VL |

---

## 本地开发

```bash
# 进入 Monorepo 目录
cd socra-platform

# 安装依赖
pnpm install

# 启动所有应用
pnpm dev

# 或单独启动
cd apps/landing && pnpm dev    # http://localhost:3001
cd apps/socrates && pnpm dev   # http://localhost:3000
```

---

## 产品规划

### 已上线产品

| 产品 | 域名 | 功能 |
|------|------|------|
| 苏格拉底 AI 辅导 | socrates.socra.cn | 错题分析、苏格拉底引导 |

### 即将上线产品

| 产品 | 域名 | 功能 |
|------|------|------|
| 作文批改 | essay.socra.cn | AI批改、评分、润色 |
| 学习规划 | planner.socra.cn | 智能排期、要事优先 |
| 英语口语练习 | - | 🗣️ |
| 数学公式推导 | - | 📐 |
| 物理实验模拟 | - | ⚗️ |
| 化学方程式配平 | - | 🧪 |
| 历史时间线 | - | 📜 |
| 地理知识图谱 | - | 🌍 |

---

## 联系方式

| 类型 | 信息 |
|------|------|
| 公众号 | 工程爸的AI教育工厂 |
| 微信 | ghz98315 |
| 邮箱 | ghz007@hotmail.com |

---

## 历史阶段

### 阶段1: 测试与修复 ✅
- TypeScript/ESLint 修复
- 移动端优化
- 暗色模式优化
- 动画优化

### 阶段2: 功能增强 ✅
- P0: 注册/登录美化、PDF导出、语音输入
- P1: 错题本导出、数据可视化、家长通知
- P2: AI模型切换、学习成就、变式题目

### 阶段3: 上线准备 ✅
- 域名配置
- Cloudflare CDN
- Vercel 部署
- Monorepo 架构

---

## 关键文件

| 文件 | 说明 |
|------|------|
| socra-platform/ | Monorepo 主项目 |
| DEPLOYMENT_CN.md | 国内部署指南 |
| packages/ | 共享包 |
| apps/ | 应用目录 |

---

**最后更新**: 2026-02-28
