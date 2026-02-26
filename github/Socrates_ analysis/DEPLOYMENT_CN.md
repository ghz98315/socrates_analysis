# Project Socrates - 国内部署优化方案

> 版本: v1.0
> 更新日期: 2026-02-26
> 域名: socra.cn

---

## 一、问题分析

### 1.1 Vercel 国内访问问题

| 问题 | 原因 | 影响 |
|------|------|------|
| 访问速度慢 | Vercel 边缘节点不在中国 | 加载时间 5-10秒 |
| 间歇性无法访问 | 部分 IP 被限制 | 用户体验差 |
| API 请求超时 | 网络不稳定 | 功能无法使用 |

### 1.2 当前状态

```
当前部署: socrates-app-gamma.vercel.app
目标域名: socrates.socra.cn
访问状态: 国内不稳定
```

---

## 二、解决方案对比

### 方案对比表

| 方案 | 速度 | 稳定性 | 成本 | 复杂度 | 备案需求 |
|------|------|--------|------|--------|----------|
| **A. Cloudflare 代理** | ⭐⭐⭐ | ⭐⭐⭐ | 免费 | 低 | 不需要 |
| **B. 国内 CDN** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | 低 | 中 | **需要** |
| **C. 双栈部署** | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ | 中 | 高 | 需要 |
| **D. 完全迁移国内** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | 中 | 高 | **需要** |

---

## 三、推荐方案：Cloudflare 代理（立即可用）

### 3.1 方案架构

```
用户(国内) → Cloudflare CDN (国内优化节点) → Vercel (香港节点 hkg1)
                ↓
         socra.cn / socrates.socra.cn
```

### 3.2 优点

- **免费**：Cloudflare 免费套餐足够使用
- **无需备案**：立即可用
- **SSL 自动**：免费 SSL 证书
- **CDN 加速**：全球 CDN，国内有优化节点
- **防护**：DDoS 防护

### 3.3 配置步骤

#### 步骤 1：注册 Cloudflare

1. 访问 https://dash.cloudflare.com/sign-up
2. 注册账号
3. 添加站点 `socra.cn`

#### 步骤 2：修改 DNS 服务器

Cloudflare 会提供两个 NS 服务器，需要在域名服务商修改：

```
# Cloudflare 提供的 NS（示例）
NS: bob.ns.cloudflare.com
NS: coco.ns.cloudflare.com
```

在阿里云/腾讯云域名管理中修改 DNS 服务器。

#### 步骤 3：配置 DNS 记录

在 Cloudflare DNS 设置中添加：

| 类型 | 名称 | 内容 | 代理状态 | TTL |
|------|------|------|----------|-----|
| CNAME | socrates | cname.vercel-dns.com | ✅ 已代理 | 自动 |
| CNAME | essay | cname.vercel-dns.com | ✅ 已代理 | 自动 |
| CNAME | planner | cname.vercel-dns.com | ✅ 已代理 | 自动 |
| A | @ | 76.76.21.21 | ✅ 已代理 | 自动 |
| CNAME | www | cname.vercel-dns.com | ✅ 已代理 | 自动 |

**重要**：代理状态必须开启（橙色云朵图标）

#### 步骤 4：SSL/TLS 配置

```
Cloudflare Dashboard → SSL/TLS → Overview
选择：Full (strict)
```

#### 步骤 5：优化设置

```
Speed → Optimization:
├─ Auto Minify: HTML, CSS, JS 全部开启
├─ Brotli: 开启
├─ Early Hints: 开启
└─ Rocket Loader: 开启（可选）

Caching → Configuration:
├─ Caching Level: Standard
├─ Browser Cache TTL: 4 hours
└─ Always Online: 开启
```

#### 步骤 6：Vercel 域名配置

```bash
# 在 Vercel 项目中添加域名
vercel domains add socrates.socra.cn

# 或在 Vercel Dashboard 中添加
# Settings → Domains → Add Domain
```

---

## 四、进阶方案：国内 CDN（需要备案）

### 4.1 适用场景

- Cloudflare 效果不理想
- 需要更快的访问速度
- 愿意完成 ICP 备案

### 4.2 推荐 CDN 服务商

| 服务商 | 价格 | 特点 |
|------|------|------|
| 又拍云 | 低 | 按流量计费，有免费额度 |
| 七牛云 | 低 | 按流量计费，10GB免费 |
| 阿里云 CDN | 中 | 稳定，与阿里云生态集成 |
| 腾讯云 CDN | 中 | 稳定，有免费额度 |

### 4.3 备案流程

```
1. 准备材料
   ├── 域名证书
   ├── 身份证照片
   ├── 幕布照片（服务商提供）
   └── 网站信息

2. 提交备案（服务商后台）
   └── 通常 7-20 个工作日

3. 备案完成后
   └── 配置 CDN 加速
```

---

## 五、最终方案：双栈部署

### 5.1 架构

```
                ┌─────────────────┐
                │   DNS 智能解析   │
                └────────┬────────┘
                         │
         ┌───────────────┼───────────────┐
         ▼               ▼               ▼
   国内用户         未知用户         海外用户
         │               │               │
         ▼               ▼               ▼
   国内服务器      Cloudflare       Vercel
   (需备案)        (代理)          (直连)
```

### 5.2 国内服务器选项

| 选项 | 价格 | 特点 |
|------|------|------|
| 阿里云 ECS | 中 | 稳定，生态完善 |
| 腾讯云 CVM | 中 | 稳定，有优惠 |
| 华为云 | 中 | 政企用户多 |
| Zeabur 国内版 | 低 | 简单易用 |

---

## 六、当前推荐执行计划

### 阶段 1：立即执行（本周）

```
1. 配置 Cloudflare（免费，立即可用）
   ├── 注册 Cloudflare
   ├── 添加 socra.cn
   ├── 配置 DNS 记录
   ├── 开启 CDN 代理
   └── 配置 SSL

2. 配置 Vercel 域名
   ├── 添加 socrates.socra.cn
   └── 验证域名所有权

3. 测试访问
   └── 国内多地区测试
```

### 阶段 2：观察优化（下周）

```
1. 监控访问速度
2. 收集用户反馈
3. 如效果不理想，考虑：
   └── 启动 ICP 备案
```

### 阶段 3：长期方案（下月）

```
1. 完成 ICP 备案
2. 配置国内 CDN
3. 或部署国内镜像站
```

---

## 七、Cloudflare 配置清单

### 7.1 DNS 记录

```
socrates.socra.cn → CNAME → cname.vercel-dns.com [代理]
essay.socra.cn    → CNAME → cname.vercel-dns.com [代理]
planner.socra.cn  → CNAME → cname.vercel-dns.com [代理]
socra.cn          → A      → 76.76.21.21        [代理]
www.socra.cn      → CNAME → cname.vercel-dns.com [代理]
```

### 7.2 SSL 设置

```
加密模式: Full (strict)
始终使用 HTTPS: 开启
自动 HTTPS 重写: 开启
```

### 7.3 速度优化

```
Auto Minify: HTML ✓ CSS ✓ JS ✓
Brotli: ✓
Early Hints: ✓
```

### 7.4 安全设置

```
安全级别: Medium
挑战通过期: 30 分钟
浏览器完整性检查: 开启
```

---

## 八、验证步骤

### 8.1 DNS 生效验证

```bash
# 检查 DNS 解析
nslookup socrates.socra.cn

# 应该返回 Cloudflare IP (104.x.x.x 或 172.x.x.x)
```

### 8.2 SSL 验证

```bash
# 检查 SSL 证书
curl -I https://socrates.socra.cn

# 应该返回 200 OK
```

### 8.3 访问测试

```
测试项目:
├── 首页加载速度 < 3秒
├── API 响应正常
├── 认证流程正常
├── 图片上传正常
└── AI 对话正常
```

---

## 九、常见问题

### Q1: Cloudflare 代理后仍然慢？

```
检查项:
1. 确认代理状态是"已代理"（橙色云朵）
2. 检查 SSL 模式是否为 "Full (strict)"
3. 清除 Cloudflare 缓存
4. 尝试开启 Argo（付费加速）
```

### Q2: 502/504 错误？

```
原因: Vercel 与 Cloudflare 连接问题
解决:
1. 检查 Vercel 域名配置是否正确
2. 确认 Vercel 项目正常运行
3. 检查 Vercel 地区设置 (regions: ["hkg1"])
```

### Q3: API 请求跨域？

```
在 Vercel 中配置 CORS 头:
vercel.json → headers 中添加:
{
  "key": "Access-Control-Allow-Origin",
  "value": "https://socrates.socra.cn"
}
```

---

## 十、成本估算

### 10.1 Cloudflare 方案（当前）

| 项目 | 费用 |
|------|------|
| Cloudflare Free | $0/月 |
| 域名续费 | ~¥50/年 |
| **总计** | **~¥50/年** |

### 10.2 国内 CDN 方案（未来）

| 项目 | 费用 |
|------|------|
| CDN 流量 (100GB) | ~¥20/月 |
| ICP 备案 | 免费 |
| 域名续费 | ~¥50/年 |
| **总计** | **~¥290/年** |

---

**文档版本**: v1.0
**最后更新**: 2026-02-26
**下一步**: 执行 Cloudflare 配置
