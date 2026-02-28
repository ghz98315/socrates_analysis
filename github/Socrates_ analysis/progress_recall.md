# Project Socrates - 开发节点回顾

> 本文档用于记录每日开发结束时的项目状态，便于下次直接读取并继续开发

---

## 最新节点: 2026-02-28 v1.6.2

### 当前状态
- **版本**: v1.6.2
- **分支**: main (socra-platform)
- **最后提交**: 几何图形坐标系统修复（矩形顶点命名约定）

### 已完成功能
1. ✅ 几何图形自动渲染 (JSXGraph)
2. ✅ 几何精确解析Prompt (100%匹配原题)
3. ✅ 几何镜像问题修复（Y轴坐标规则明确）
4. ✅ 几何条件自动提取（长度、角度、比例、平行、垂直等）
5. ✅ 几何图形保存（JSON+SVG双格式）
6. ✅ 自定义点功能（自动命名P1/P2、可拖动、可连线）
7. ✅ 双栏布局（PC端左侧固定、移动端可折叠）
8. ✅ 变式题生成系统
9. ✅ 数学符号快捷输入
10. ✅ OCR符号输出规范（禁止LaTeX）
11. ✅ 社区功能
12. ✅ AI对话分析（家长端）
13. ✅ 辅助线绘制功能（手动添加虚线）
14. ✅ 直角自动识别标记
15. ✅ OCR识别范围界定（只识别题目文字，忽略界面元素和图形标记）
16. ✅ 反比例函数曲线绘制（y=k/x）
17. ✅ 函数方程条件提取
18. ✅ 几何条件传递到AI对话
19. ✅ AI模型调用调试日志
20. ✅ **Prompt System v2.0 - 三层架构**
21. ✅ **对话模式区分（Logic/Socra）**
22. ✅ **科目识别+题型识别**
23. ✅ **用户分层（免费/付费）**
24. ✅ **前端适配完成**（传递新参数+对话名称显示）
25. ✅ **科目/题型标签显示**（OCRResult 组件）
26. ✅ **几何坐标系统修复**（矩形从左下角开始顺时针排列）

### 新增文件结构
```
socra-platform/apps/socrates/
├── lib/prompts/                    # 🆕 Prompt系统
│   ├── types.ts                    # 类型定义
│   ├── base.ts                     # 通用层（Layer 1）
│   ├── builder.ts                  # Prompt构建器（三层合并）
│   ├── index.ts                    # 导出入口
│   └── subjects/                   # 科目层（Layer 2）
│       ├── index.ts                # 科目配置导出
│       ├── math.ts                 # 数学配置（已实现）
│       ├── chinese.ts              # 语文配置（预留）
│       ├── english.ts              # 英语配置（预留）
│       └── generic.ts              # 通用模式配置
├── app/api/
│   ├── chat/route.ts               # AI对话API（重构，支持三层Prompt）
│   ├── ocr/route.ts                # OCR识别（新增科目/题型识别）
│   ├── geometry/route.ts           # 几何图形解析API
│   └── variants/route.ts           # 变式题API
├── lib/ai-models/
│   ├── config.ts                   # AI模型配置
│   └── service.ts                  # AI模型调用服务
└── components/
    ├── GeometryRenderer.tsx        # JSXGraph几何渲染
    ├── OCRResult.tsx               # OCR结果+几何解析
    └── ...
```

### 待调试/优化
- ⏳ 几何调整后实时传递到对话
- ⏳ PDF导出功能
- ⏳ 家长通知系统（微信模板消息）
- ✅ 数据库迁移已完成（subscription_tier + OCR识别字段）
- ✅ 几何坐标系统修复（矩形顶点命名约定）

---

## 历史节点

### 2026-02-28 几何坐标系统修复 (v1.6.2)

**问题描述**：
几何图形渲染后与原图方向不一致，矩形ABCD渲染后A出现在左上角，而原图A在左下角。

**问题原因**：
Geometry API 的 Prompt 中矩形顶点命名规则与初中数学课本习惯不一致：
- Prompt 规定：A(左上) → B(右上) → C(右下) → D(左下)
- 课本习惯：A(左下) → B(右下) → C(右上) → D(左上)

**修复内容**：
1. 更新 Geometry API Prompt 的坐标系统规则
2. 明确矩形顶点命名约定：从左下角开始，顺时针排列
3. 更新示例代码中的坐标值和标签位置
4. 添加显眼的警告说明，强调严格按照课本约定

**修复后坐标规则**：
```
A = (-w/2, -h/2) 左下角，Y值最小
B = (w/2, -h/2)  右下角，Y值最小
C = (w/2, h/2)   右上角，Y值最大
D = (-w/2, h/2)  左上角，Y值最大
```

**修改文件**：
- `app/api/geometry/route.ts` - 更新 Prompt 规则和示例

---

## 架构说明

### Prompt 三层架构
```
┌─────────────────────────────────────────────────────────┐
│                    System Prompt                         │
├─────────────────────────────────────────────────────────┤
│ Layer 1: 通用层（base.ts）                               │
│   - 角色定义（苏格拉底 + 20年教学经验）                   │
│   - 绝对红线（禁绝答案、严禁越界、拒绝预判、启发铁律）      │
│   - 通用工作流（四步法）                                  │
│   - 情绪抚慰话术                                         │
├─────────────────────────────────────────────────────────┤
│ Layer 2: 科目层（subjects/*.ts）                         │
│   - 科目特定策略（小学/初中不同策略）                      │
│   - 知识点库（按学段）                                   │
│   - Few-Shot 示例（按学段）                              │
├─────────────────────────────────────────────────────────┤
│ Layer 3: 动态层（builder.ts 运行时）                      │
│   - 当前题目内容                                         │
│   - 几何/图形数据                                        │
│   - 图片检测（触发复述确认）                              │
│   - 题型信息                                            │
└─────────────────────────────────────────────────────────┘
```

### 用户分层与对话模式
| 用户等级 | 科目识别 | 模式 | 对话显示名称 |
|---------|---------|------|-------------|
| free | 任意 | 通用模式 | **Logic** |
| premium | 成功(>0.7) | 专科模式 | **Socra** |
| premium | 失败 | 通用模式 | **Logic** |

### API 调用示例
```typescript
// Chat API 新增参数
const response = await fetch('/api/chat', {
  method: 'POST',
  body: JSON.stringify({
    message: '...',
    subject: 'math',           // 科目（来自OCR识别）
    userLevel: 'premium',      // 用户等级
    subjectConfidence: 0.92,   // 科目识别置信度
    grade: 'senior',           // 学段
    questionType: 'proof',     // 题型
    // ...
  }),
});

// 返回值新增 dialogMode
{
  "content": "...",
  "dialogMode": "Socra",       // 或 "Logic"
  "modelUsed": "qwen-plus"
}
```

---

## 快速启动提示词

复制以下内容到新的对话中继续开发：

```
我是 Project Socrates 项目的开发者。请阅读以下文件了解项目当前状态：

1. 读取 D:\github\Socrates_ analysis\progress_recall.md 了解最新节点
2. 读取 D:\github\Socrates_ analysis\PROGRESS.md 了解完整进度
3. 读取 D:\github\Socrates_ analysis\prd.md 了解产品需求
4. 读取 D:\github\Socrates_ analysis\mathprompt.md 了解Prompt设计

当前项目目录：
- 主项目：D:\github\Socrates_ analysis\socra-platform\apps\socrates
- 文档目录：D:\github\Socrates_ analysis

当前版本：v1.6.0
Prompt架构：三层架构（通用层+科目层+动态层）

请确认已了解项目状态，我需要继续开发以下内容：
[在此填写具体需求]
```

---

## 历史节点

### 2026-02-28 Prompt System v2.0 + 对话模式区分 (v1.6.0)

**开发内容**：
1. **Prompt 三层架构重构**
   - Layer 1 通用层：角色定义、绝对红线、工作流、话术规范
   - Layer 2 科目层：按科目加载策略、知识点库、Few-Shot示例
   - Layer 3 动态层：题目内容、几何数据、图片检测

2. **对话模式区分**
   - Logic（通用模式）：免费用户或科目识别失败
   - Socra（专科模式）：付费用户 + 科目识别成功

3. **科目识别系统**
   - OCR 新增科目识别（math/chinese/english）
   - OCR 新增题型识别（choice/fill/solution/proof等）
   - 返回置信度，用于判断使用哪种模式

4. **科目配置模块化**
   - 数学配置完整实现（math.ts）
   - 语文/英语配置预留（chinese.ts, english.ts）
   - 通用模式配置（generic.ts）

5. **API 增强**
   - Chat API：新增 subject、userLevel、dialogMode 等参数
   - OCR API：新增科目识别、题型识别

**新增文件**：
- lib/prompts/types.ts
- lib/prompts/base.ts
- lib/prompts/builder.ts
- lib/prompts/index.ts
- lib/prompts/subjects/index.ts
- lib/prompts/subjects/math.ts
- lib/prompts/subjects/chinese.ts
- lib/prompts/subjects/english.ts
- lib/prompts/subjects/generic.ts

**待前端适配**：
- 传递 userLevel 参数（从用户信息获取）
- 传递 subject、subjectConfidence 参数（从OCR结果获取）
- 根据 dialogMode 显示对话名称

---

### 2026-02-28 苏格拉底提示词增强+AI调用调试 (v1.5.2)

**开发内容**：
1. 苏格拉底提示词全面增强
   - 添加【知识引导策略】：引导学生回忆公式/定理
   - 添加【渐进式引导流程】五步法：读题→知识点回忆→建立联系→执行计算→反思总结
   - 小学生知识点库：运算、几何、应用题、分数百分数
   - 初中生知识点库：代数、函数、几何定理（三角形/四边形/圆/比例）
   - 提问技巧示例（好的问法 vs 不好的问法）

2. 几何数据传递到AI对话
   - Chat API传递完整几何条件（长度、角度、比例、函数等）
   - 系统提示词中包含几何图形信息

3. 自定义点功能修复
   - 使用JSXGraph原生事件 `board.on('down')` 替代React onClick

4. AI模型调用调试
   - 添加详细日志：模型选择、API Key状态、响应状态
   - 响应中返回 `modelUsed` 字段方便调试

**Git提交**：
- `6239191` - fix: Add detailed logging for AI model calling debugging
- `655afab` - feat: Enhance Socratic prompt with knowledge point guidance
- `90cc3ec` - fix: Enhance geometry data passing to AI chat and fix point adding
- `53a47bf` - fix: Fix custom point adding using JSXGraph native events

---

### 2026-02-28 OCR优化+反比例函数支持 (v1.5.1)

**开发内容**：
1. OCR识别范围优化
   - 明确识别范围界定：只识别题目文字部分
   - 忽略界面元素（按钮、标签等）
   - 忽略图形上的标记字母
   - 添加识别截止点规则

2. 反比例函数曲线支持
   - 添加CurveData接口支持函数曲线
   - 支持 inverse_proportional (y=k/x) 类型
   - 同时绘制正负两个分支
   - 显示函数方程标签

3. 函数方程条件提取
   - 添加 functions 条件类型
   - 提取"y=k/x"、"函数经过点X"等条件
   - 在已知条件区域显示函数方程

**Git提交**：
- `b2f400f` - feat: Add OCR boundary control and inverse proportional function support

---

### 2026-02-28 几何+UI全面优化 (v1.5.0)

**开发内容**：
1. 自定义点功能
   - 添加点模式（点击图板任意位置）
   - 自动命名（P1、P2...）
   - 点可拖动
   - 可与现有点连接画辅助线

2. 几何保存格式优化
   - 同时保存JSON数据（可编辑）和SVG图片（视觉一致）
   - 添加GeometryRendererRef暴露getSVGContent方法
   - 更新error_session API支持geometry_data和geometry_svg
   - 创建数据库迁移文件add-geometry-columns.sql

3. 删除标注按钮
   - 移除OCRResult中的ImageAnnotator相关代码
   - 保留几何图板中的辅助线绘制功能

4. 双栏布局
   - PC端：左侧固定（40%），右侧滚动（60%）
   - 移动端：可折叠左侧面板+横屏提示
   - 添加移动端检测和切换按钮

**Git提交**：
- `6609db5` - feat: Implement 4 geometry and UI improvements

---

### 2026-02-28 几何条件提取+镜像修复 (v1.4.2)

**开发内容**：
- 修复几何图形Y轴镜像问题（明确坐标规则：上方点Y值大）
- 添加全面的几何关系识别（垂直、平行、相交、相切、全等、相似等）
- 添加条件自动提取功能

**Git提交**：
- `5e6f80c` - feat: Fix geometry mirror issue and add comprehensive conditions extraction

---

### 2026-02-28 几何精确解析 (v1.4.1)

**开发内容**：
- 完全重写几何解析Prompt，确保100%匹配原题要求
- 添加精确坐标计算规则
- 辅助线手动绘制功能（橙色虚线）

**Git提交**：
- `fe3f413` - feat: Completely rewrite geometry parsing prompt for 100% accuracy

---

### 2026-02-28 几何图形渲染 (v1.4.0)

**开发内容**：
- 创建 GeometryRenderer 组件（JSXGraph）
- 创建 /api/geometry 解析API
- 修复 SSR window 未定义错误

**Git提交**：
- `a38df8d` - feat: Add geometry auto-rendering with JSXGraph

---

### 2026-02-28 变式题系统 (v1.3.0)

**开发内容**：
- 创建 variant_questions 和 variant_practice_logs 表
- 完善 /api/variants API

**Git提交**：
- `30cb886` - feat: Complete variant questions system with database support

---

### 2026-02-28 OCR符号规范 (v1.2.x)

**开发内容**：
- 完善OCR prompt，添加初中数学符号输出规范
- 禁止LaTeX格式输出

**Git提交**：
- `0800442` - feat: Complete middle school math symbol guide for OCR

---

## 下一步开发方向

### P0 - 高优先级
1. **验证AI模型调用** - 确认三层Prompt是否正常工作
2. **添加用户订阅字段** - profiles 表添加 subscription_tier 字段
3. **测试完整流程** - OCR识别 → 科目识别 → 对话模式切换

### P1 - 中优先级
4. **语文/英语配置完善** - 完善知识点库和Few-Shot示例
5. **社区功能完善** - 积分、徽章、排行榜
6. **学习数据分析** - 知识点掌握度可视化

---

## 常用命令

```bash
# 进入项目目录
cd "D:\github\Socrates_ analysis\socra-platform\apps\socrates"

# 安装依赖
pnpm install

# 开发模式
pnpm dev

# 构建检查
pnpm build

# TypeScript检查
npx tsc --noEmit

# Git操作
git push origin main
```

---

## 环境变量清单

在 Vercel 和本地 .env 中需要配置：

```
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# AI服务 - 通义千问（对话和OCR）
DASHSCOPE_API_KEY=          # 通义千问 API Key（对话+OCR）
AI_API_KEY_VISION=          # 通义千问 VL (OCR，可选)
AI_API_KEY_LOGIC=           # DeepSeek (可选)

# 站点配置
NEXT_PUBLIC_SITE_URL=https://socrates.socra.cn
```

**重要**：确保 Vercel 中配置了 `DASHSCOPE_API_KEY`，否则对话会回退到 mock 模式。

---

*文档最后更新: 2026-02-28 v1.6.1*
