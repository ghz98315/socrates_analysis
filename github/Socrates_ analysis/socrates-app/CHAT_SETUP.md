# 苏格拉底 AI 对话系统

## 功能概述

集成了通义千问 AI 的苏格拉底式教学对话系统，支持：
- 智能预设回应（无需 API Key 也可使用）
- 通义千问 API 集成（需要配置 API Key）
- 流式响应
- 上下文感知对话

## 两种模式

### 1. 预设回应模式（默认）

无需配置 API Key，使用改进的预设回应逻辑：

**特点：**
- 智能分析学生输入（询问答案、给出思路、表示困惑）
- 根据题目类型提供针对性提示（数学、语文、英语）
- 支持小学生/中学生不同语气
- 快速响应，无需网络请求

**触发场景：**
- 未设置 `DASHSCOPE_API_KEY` 环境变量
- 自动回退到预设模式

### 2. 通义千问 AI 模式

配置 API Key 后启用真正的 AI 对话：

**特点：**
- 使用阿里云通义千问大模型
- 流式响应，实时显示
- 更智能的上下文理解
- 苏格拉底式引导教学

## 配置步骤

### 获取 API Key

1. 访问 [阿里云 DashScope 控制台](https://dashscope.console.aliyun.com/)
2. 登录阿里云账号
3. 创建 API Key
4. 复制 API Key

### 配置到项目

编辑 `.env.local` 文件：

```env
DASHSCOPE_API_KEY=sk-your-actual-api-key
```

### 重启服务

```bash
# 停止当前前端服务 (Ctrl+C)
# 重新启动
npm run dev
```

## 改进的预设回应逻辑

### 智能场景识别

| 学生输入 | 回应策略 |
|---------|---------|
| "不知道"、"不懂" | 鼓励并换角度引导 |
| "答案是..." | 不直接给答案，提供提示 |
| "我觉得..." | 肯定并追问细节 |
| 普通对话 | 根据进度渐进引导 |

### 学科针对性提示

**数学题：**
- 画出图形帮助理解
- 分解复杂问题
- 注意等量关系
- 逆向思维

**语文题：**
- 抓住关键词
- 理解作者意图
- 联系上下文
- 段落大意

**英语题：**
- 时态语态
- 主谓结构
- 逻辑关系
- 固定搭配

## API 端点

### POST /api/chat

发送消息给 AI

**请求体：**
```json
{
  "message": "用户消息",
  "sessionId": "会话ID",
  "theme": "junior",  // 或 "senior"
  "subject": "数学",   // 可选
  "questionContent": "题目内容"  // 可选
}
```

**响应（预设模式）：**
```json
{
  "content": "AI 回应",
  "done": true
}
```

**响应（AI 模式）：** 流式响应

### GET /api/chat?sessionId=xxx

获取对话历史

### DELETE /api/chat?sessionId=xxx

清除对话历史

## 苏格拉底教学原则

1. 永不直接给出答案
2. 通过提问引导学生思考
3. 赞美学生的正确思考
4. 温和引导偏离的学生
5. 循序渐进引导
6. 鼓励为主，不打击信心

## 前端集成示例

```typescript
const response = await fetch('/api/chat', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    message: userInput,
    sessionId: session.id,
    theme: user.theme,
    questionContent: ocrText
  })
});

const data = await response.json();
// 处理响应...
```
