# Socra 平台 - 订阅功能入口路径

## 域名说明

| 域名 | 用途 | 页面 |
|------|------|------|
| **socra.cn** | Landing Page | 营销页面、产品介绍、定价 |
| **socrates.socra.cn** | 应用入口 | 登录/注册、学习功能 |

---

## 订阅页面直接访问 (socrates.socra.cn)

| 页面 | URL | 说明 |
|------|-----|------|
| 订阅套餐选择 | https://socrates.socra.cn/subscription | 三档套餐：免费/Pro季度/年度 |
| 支付页面 | https://socrates.socra.cn/payment | 选择支付方式 |
| 支付成功 | https://socrates.socra.cn/payment/success | 支付完成确认页 |

---

## Landing Page 入口 (socra.cn)

### 导航栏
1. **定价** - 点击跳转到定价区域 (#pricing)
2. **开始使用** - 跳转到 socrates.socra.cn 应用

### 定价区域 (Pricing Section)
位置：产品介绍下方，关于我们上方

| 套餐 | 价格 | 按钮 | 跳转 |
|------|------|------|------|
| Standard | 免费 | 免费注册 | socrates.socra.cn/register |
| Pro (热门) | ¥79.9/季 | 立即订阅 | socrates.socra.cn/subscription |
| 年度会员 | ¥239.9/年 | 选择年度 | socrates.socra.cn/subscription |

---

## Dashboard 入口 (登录后 - socrates.socra.cn)

### 学科卡片
- **数学/语文/英语** - 免费学科，直接点击进入学习
- **物理/化学** - Pro 学科，显示 Pro 标签
  - 点击后显示「开通 Pro」按钮
  - 点击「开通 Pro」跳转到 /subscription

---

## 订阅流程

```
socra.cn (Landing Page) → 点击订阅 → socrates.socra.cn/subscription
                              或
socrates.socra.cn Dashboard → 点击Pro学科 → /subscription
```

---

## 测试步骤

### 1. 测试 Landing Page (socra.cn)
1. 访问 https://socra.cn
2. 点击导航栏「定价」
3. 滚动到定价区域
4. 点击「立即订阅」
5. 应跳转到 socrates.socra.cn/subscription

### 2. 测试应用入口 (socrates.socra.cn)
1. 访问 https://socrates.socra.cn
2. 应自动重定向到 /login 登录页
3. 登录后进入 Dashboard

### 3. 测试 Dashboard Pro 入口
1. 登录 socrates.socra.cn
2. 进入 Dashboard (/dashboard)
3. 点击物理或化学学科（Pro 学科）
4. 点击「开通 Pro」
5. 跳转到 /subscription

---

*最后更新: 2026-03-10*
