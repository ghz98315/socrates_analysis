# Project Socrates - Vercel 部署指南

> 版本: v0.98
> 更新日期: 2026-02-24
> 状态: 准备部署

---

## 一、部署前检查清单

### 1.1 构建状态

- [x] TypeScript 编译通过
- [x] Next.js 生产构建成功
- [x] 26 个路由正常生成
- [x] 无 ESLint 错误

### 1.2 功能测试

- [x] 功能测试 41/41 通过
- [x] 移动端测试 10/10 通过
- [x] API 端点全部正常
- [x] 认证流程正常

### 1.3 安全检查

- [x] 环境变量未暴露
- [x] API 密钥安全存储
- [x] RLS 策略已启用
- [x] 无敏感信息泄露

---

## 二、环境变量配置

### 2.1 必需的环境变量

在 Vercel Dashboard 中配置以下环境变量：

```
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your-project-url.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# AI - DeepSeek (聊天)
AI_BASE_URL_LOGIC=https://api.deepseek.com/v1
AI_API_KEY_LOGIC=sk-your-deepseek-key

# AI - Qwen (视觉/OCR)
AI_BASE_URL_VISION=https://dashscope.aliyuncs.com/compatible-mode/v1
AI_API_KEY_VISION=sk-your-qwen-key

# App
NEXT_PUBLIC_APP_URL=https://your-domain.vercel.app
NEXT_PUBLIC_APP_NAME=Socrates
```

### 2.2 Vercel 配置步骤

1. 进入 Vercel Dashboard
2. 选择项目 → Settings → Environment Variables
3. 添加所有变量（Production, Preview, Development）
4. 点击 Save

---

## 三、部署步骤

### 3.1 方式一：Vercel CLI

```bash
# 安装 Vercel CLI
npm i -g vercel

# 登录
vercel login

# 部署
cd socrates-app
vercel

# 部署到生产环境
vercel --prod
```

### 3.2 方式二：Git 集成（推荐）

1. 将代码推送到 GitHub
2. 在 Vercel 中导入项目
3. 配置 Root Directory 为 `socrates-app`
4. 配置环境变量
5. 点击 Deploy

### 3.3 方式三：手动部署

```bash
# 构建
npm run build

# 导出静态文件（如需要）
# next export
```

---

## 四、项目配置

### 4.1 Root Directory

```
socrates-app
```

### 4.2 Build Command

```
npm run build
```

### 4.3 Output Directory

```
.next
```

### 4.4 Install Command

```
npm install
```

### 4.5 Node.js Version

```
18.x 或更高
```

---

## 五、自定义域名配置

### 5.1 添加域名

1. Vercel Dashboard → 项目 → Settings → Domains
2. 添加自定义域名
3. 配置 DNS 记录

### 5.2 DNS 配置

| 类型 | 名称 | 值 |
|------|------|-----|
| A | @ | 76.76.21.21 |
| CNAME | www | cname.vercel-dns.com |

---

## 六、部署后验证

### 6.1 功能验证清单

- [ ] 首页正常加载
- [ ] 用户注册流程
- [ ] 用户登录流程
- [ ] 错题上传功能
- [ ] AI 对话功能
- [ ] 复习计划功能
- [ ] 学习报告功能
- [ ] 错题本功能
- [ ] 家长仪表板
- [ ] 通知系统

### 6.2 性能验证

- [ ] 首屏加载 < 3秒
- [ ] API 响应 < 2秒
- [ ] 无控制台错误
- [ ] 移动端适配正常

### 6.3 安全验证

- [ ] HTTPS 正常
- [ ] 认证保护正常
- [ ] API 密钥未暴露
- [ ] RLS 策略生效

---

## 七、监控配置

### 7.1 Vercel Analytics

1. Dashboard → 项目 → Analytics
2. 启用 Web Analytics
3. 查看访问数据

### 7.2 错误监控（可选）

推荐使用：
- Sentry
- LogRocket
- Datadog

### 7.3 性能监控

- Vercel Speed Insights
- Lighthouse CI
- Web Vitals

---

## 八、常见问题

### Q1: 构建失败

检查：
- Node.js 版本是否 >= 18
- 环境变量是否配置正确
- 依赖是否完整安装

### Q2: API 请求失败

检查：
- 环境变量是否正确
- Supabase 连接是否正常
- API 密钥是否有效

### Q3: 认证问题

检查：
- Supabase URL 和 Key 是否正确
- 回调 URL 是否配置
- RLS 策略是否正确

### Q4: 移动端问题

检查：
- viewport 配置
- 响应式断点
- 触摸目标尺寸

---

## 九、回滚计划

如果部署出现问题：

1. Vercel Dashboard → Deployments
2. 找到上一个稳定版本
3. 点击 "..." → Promote to Production

---

## 十、联系方式

- 项目仓库: https://github.com/your-username/socrates
- 文档: /docs
- 问题反馈: GitHub Issues

---

**部署版本**: v0.98
**准备状态**: 就绪
**预计上线时间**: 待定
