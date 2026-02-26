# Project Socrates - 国内部署优化方案

> 版本: v2.0
> 更新日期: 2026-02-26
> 域名: socra.cn
> 状态: ✅ 已部署完成

---

## 当前部署架构

```
用户(国内) → Cloudflare CDN → Vercel (香港节点 hkg1)
```

### 已配置域名

| 域名 | 应用 | 状态 |
|------|------|------|
| socra.cn | apps/landing (落地页) | ✅ |
| socrates.socra.cn | apps/socrates (苏格拉底) | ✅ |

### Vercel 项目

| 项目 | Root Directory | 域名 |
|------|----------------|------|
| socra-landing | apps/landing | socra.cn |
| socra-socrates | apps/socrates | socrates.socra.cn |

---

## Monorepo 架构

```
socra-platform/                    # GitHub 仓库
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

---

## Cloudflare DNS 配置

| 类型 | 名称 | 内容 | 代理状态 |
|------|------|------|----------|
| A | @ | 76.76.21.21 | ✅ 已代理 |
| CNAME | www | cname.vercel-dns.com | ✅ 已代理 |
| CNAME | socrates | cname.vercel-dns.com | ✅ 已代理 |
| CNAME | essay | cname.vercel-dns.com | ✅ 已代理 (预留) |
| CNAME | planner | cname.vercel-dns.com | ✅ 已代理 (预留) |

---

## 环境变量配置

### socrates 应用

在 Vercel Dashboard → Settings → Environment Variables 添加：

```
NEXT_PUBLIC_SUPABASE_URL=https://avwknvhdewommwealsrd.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
DASHSCOPE_API_KEY=sk-3230b3ee3b0449058366c5c3131381c8
```

---

## 本地开发

```bash
# 克隆仓库
git clone https://github.com/ghz98315/socra-platform.git
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

## 常见问题

### Q1: 部署失败？

检查 Vercel 项目配置：
- Root Directory 是否正确
- Build Command: `pnpm build`
- Install Command: `pnpm install`

### Q2: 环境变量未生效？

1. 在 Vercel Dashboard 添加环境变量
2. 重新部署项目

### Q3: 域名无法访问？

1. 检查 Cloudflare DNS 是否正确
2. 确认代理状态为橙色云朵
3. 等待 DNS 生效（最多 24 小时）

---

**文档版本**: v2.0
**最后更新**: 2026-02-26
