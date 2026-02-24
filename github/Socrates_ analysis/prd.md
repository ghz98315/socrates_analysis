🍎 Project Socrates: Master Design Document
Target Audience: AI Coding Assistants (Cursor, Claude Code, Windsurf)
Role: Senior Full-Stack Engineer & Product Designer
Mission: Build a Socratic error-analysis agent for children, using domestic AI models (DeepSeek + Qwen).
1. Tech Stack & Infrastructure
Framework: Next.js 14 (App Router)
Language: TypeScript
Styling: Tailwind CSS + Shadcn/UI
Backend/DB: Supabase (PostgreSQL, Auth, Storage, Vector)
AI Integration: Vercel AI SDK (ai package)
AI Models (Domestic):
Logic/Chat: DeepSeek-V3 (via OpenAI-compatible API)
Vision/OCR: Aliyun Qwen-VL-Max (via DashScope compatible API)
Speech (TTS/STT): Microsoft Edge TTS (or Web Speech API for MVP)
Deployment: Vercel
2. Database Schema (Supabase)
Initialize the Supabase project with the following SQL schema. Ensure Row Level Security (RLS) is enabled.
code
SQL
-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- 1. PROFILES: Handles the multi-user (Dad + 2 Kids) logic
create table profiles (
  id uuid references auth.users on delete cascade primary key,
  role text check (role in ('admin', 'student')), -- 'admin' is Dad
  display_name text,
  grade_level int, -- 3-6 (Primary/Junior), 7-9 (Middle/Senior)
  theme_preference text check (theme_preference in ('junior', 'senior')), 
  avatar_url text,
  xp_points int default 0,
  created_at timestamptz default now()
);

-- 2. ERROR_SESSIONS: The core unit of work (one problem)
create table error_sessions (
  id uuid default uuid_generate_v4() primary key,
  student_id uuid references profiles(id),
  subject text check (subject in ('math', 'physics', 'chemistry')),
  original_image_url text, -- URL from Supabase Storage
  extracted_text text, -- Result from Qwen-VL OCR
  status text check (status in ('analyzing', 'guided_learning', 'mastered')) default 'analyzing',
  difficulty_rating int, -- 1-5 stars (AI assessed)
  concept_tags text[], -- e.g. ['Pythagoras', 'Calculation Error']
  created_at timestamptz default now()
);

-- 3. CHAT_MESSAGES: History of the Socratic dialogue
create table chat_messages (
  id uuid default uuid_generate_v4() primary key,
  session_id uuid references error_sessions(id) on delete cascade,
  role text check (role in ('user', 'assistant', 'system')),
  content text, -- DeepSeek output
  is_thought boolean default false, -- True if it is internal reasoning (DeepSeek R1 <think>)
  created_at timestamptz default now()
);

-- 4. LEARNING_STATS: For the "Dad Dashboard"
create view student_stats as
select 
  student_id,
  count(*) as total_errors,
  count(*) filter (where status = 'mastered') as mastered_count
from error_sessions
group by student_id;

-- [Add to Section 2: Database Schema]

-- 5. REVIEW_SCHEDULE: Ebbinghaus Spaced Repetition Logic
create table review_schedule (
  id uuid default uuid_generate_v4() primary key,
  session_id uuid references error_sessions(id) on delete cascade,
  student_id uuid references profiles(id),
  review_stage int default 1, -- 1=1day, 2=3days, 3=7days, 4=15days
  next_review_at timestamptz not null,
  is_completed boolean default false,
  variant_question_text text, -- AI generated variant question
  created_at timestamptz default now()
);

3. AI Provider Configuration (Domestic Adapters)
We are NOT using default OpenAI endpoints. You must configure the createOpenAI client to point to domestic providers.
File Path: src/lib/ai-config.ts
code
TypeScript
import { createOpenAI } from '@ai-sdk/openai';

// 1. DeepSeek Configuration (Logic Brain)
// Env: AI_BASE_URL_LOGIC="https://api.deepseek.com/v1"
export const deepseekProvider = createOpenAI({
  baseURL: process.env.AI_BASE_URL_LOGIC,
  apiKey: process.env.AI_API_KEY_LOGIC,
});

// 2. Qwen Configuration (Vision Eyes)
// Env: AI_BASE_URL_VISION="https://dashscope.aliyuncs.com/compatible-mode/v1"
// Model: "qwen-vl-max"
export const qwenProvider = createOpenAI({
  baseURL: process.env.AI_BASE_URL_VISION,
  apiKey: process.env.AI_API_KEY_VISION,
});

// Export instances
export const logicModel = deepseekProvider('deepseek-chat'); // or deepseek-reasoner
export const visionModel = qwenProvider('qwen-vl-max');
4. System Prompts & Personas (The Soul)

<!-- [Add to Section 4: System Prompts - Common Rules] -->

**CRITICAL RULE FOR VISION MODEL (Qwen-VL):**
When analyzing the image, you MUST output a JSON object containing:
1. `problem_text`: The printed text of the question.
2. `handwriting_content`: What the student wrote.
3. `error_location`: A specific coordinate or line number where the logic failed.
4. `is_blank`: Boolean (if true, the student didn't even try).

If `is_blank` is true, the Persona should start with: "I see a blank sheet! Let's start with the first keyword..."
If `handwriting_content` exists, the Persona should start with: "I saw your work. You got the first part right, but..."
Implement a PromptFactory that returns the correct system message based on user.grade_level.
Persona A: "Jasper" (The Explorer)
Target: Grade 3-6 (11 years old).
Tone: Fun, encouraging, uses Emojis (🌟, 🚀), uses analogies (pizza, games).
Core Rule: NEVER give the answer. Break down complex text into visual descriptions.
Visuals: Use a "Comic Sans" or rounded font style in UI.
Persona B: "Logic" (The Architect)
Target: Grade 7-9 (15 years old).
Tone: Serious, concise, Socratic, "StackOverflow" style.
Core Rule: Focus on "Model Recognition" and "Logic Gaps". Ask "Why?" frequently.
Visuals: Dark Mode, Monospace font, IDE-like interface.
5. UI/UX Architecture
5.1 The "Netflix" Entry
A landing page / that forces profile selection.
Cards: "Junior Profile", "Senior Profile", "Admin (Dad)".
5.2 The Workbench (Split Screen)
Left Panel (40%): The "Evidence".
Top: Image Viewer (Pan/Zoom enabled).
Bottom: Editable Text Area (OCR result). Crucial: Allow user to fix OCR errors.
Right Panel (60%): The "Socratic Chat".
Streaming: Use useChat from Vercel AI SDK. Text must stream in real-time.
Input:
Text Input.
Voice Button: Press-to-talk (Web Speech API).
Quick Actions: "Draw a diagram", "Give me a hint", "I'm stuck".
5.3 Dad's Dashboard
Access restricted to Admin role.
Show heatmap of active days.
Show list of "Weak Knowledge Points" (aggregated from concept_tags).

5.4 Navigation Layout Options (待选择)

以下三个方案用于优化全局导航栏的UI布局，请选择一个进行实施：

---

### 方案一: 精简单栏设计 (Minimal Single Bar)

**设计理念**: 单行导航，所有功能集中在顶部，简洁高效

```
┌─────────────────────────────────────────────────────────────────────────┐
│ 🏠 Socrates    │ 工作台 │ 复习计划 │ 学习报告 │    [🔔] [👤 张三 ▼]    │
└─────────────────────────────────────────────────────────────────────────┘
┌─────────────────────────────────────────────────────────────────────────┐
│                                                                         │
│                          页面内容区域                                    │
│                                                                         │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘

【家长视图】
┌─────────────────────────────────────────────────────────────────────────┐
│ 🏠 Socrates    │ 仪表盘 │ 学习报告 │ 学生管理 │    [🔔] [👤 李爸爸 ▼]    │
└─────────────────────────────────────────────────────────────────────────┘

【移动端】
┌───────────────────────┐
│ 🏠 Socrates    [≡]    │
├───────────────────────┤
│                       │
│      页面内容         │
│                       │
└───────────────────────┘
```

**优点**:
- 占用空间最小，内容区域最大化
- 符合主流网站设计习惯
- 代码实现简单

**缺点**:
- 功能多时可能显得拥挤
- 页面标题不明显

---

### 方案二: 分层卡片设计 (Layered Card Design)

**设计理念**: 卡片式布局，页面标题独立显示，视觉层次分明

```
┌─────────────────────────────────────────────────────────────────────────┐
│  🏠 Socrates                                            [🔔] [👤 张三 ▼] │
├─────────────────────────────────────────────────────────────────────────┤
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐                   │
│  │ 📚 工作台 │ │ 📅 复习  │ │ 📊 报告  │ │ ⚙️ 设置  │                   │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘                   │
├─────────────────────────────────────────────────────────────────────────┤
│  ╔═══════════════════════════════════════════════════════════════════╗ │
│  ║                        📚 学习工作台                               ║ │
│  ╠═══════════════════════════════════════════════════════════════════╣ │
│  ║                                                                   ║ │
│  ║                         页面内容区域                              ║ │
│  ║                                                                   ║ │
│  ╚═══════════════════════════════════════════════════════════════════╝ │
└─────────────────────────────────────────────────────────────────────────┘

【移动端】
┌───────────────────────┐
│ 🏠 Socrates    [≡]    │
├───────────────────────┤
│ ┌─────┐┌─────┐┌─────┐ │
│ │工作台││复习 ││报告 │ │
│ └─────┘└─────┘└─────┘ │
├───────────────────────┤
│ ╔═══════════════════╗ │
│ ║    📚 学习工作台   ║ │
│ ╠═══════════════════╣ │
│ ║                   ║ │
│ ║    页面内容       ║ │
│ ║                   ║ │
│ ╚═══════════════════╝ │
└───────────────────────┘
```

**优点**:
- 视觉层次清晰，页面标题突出
- 卡片式导航易于点击
- 现代化设计风格

**缺点**:
- 占用垂直空间较多
- 需要更多样式代码

---

### 方案三: 侧边栏导航 (Sidebar Navigation)

**设计理念**: 侧边栏固定导航，内容区域更宽，适合功能较多的应用

```
┌────────────┬──────────────────────────────────────────────────────────┐
│            │                                                          │
│  🏠        │  📚 学习工作台                          [🔔] [👤 张三 ▼] │
│            │  ──────────────────────────────────────────────────────  │
│  ┌──────┐  │                                                          │
│  │📚工作│  │                                                          │
│  │  台  │  │                                                          │
│  └──────┘  │                                                          │
│            │                       页面内容区域                        │
│  ┌──────┐  │                                                          │
│  │📅复习│  │                                                          │
│  │  计划│  │                                                          │
│  └──────┘  │                                                          │
│            │                                                          │
│  ┌──────┐  │                                                          │
│  │📊报告│  │                                                          │
│  └──────┘  │                                                          │
│            │                                                          │
│  ┌──────┐  │                                                          │
│  │⚙️设置│  │                                                          │
│  └──────┘  │                                                          │
│            │                                                          │
└────────────┴──────────────────────────────────────────────────────────┘

【移动端 - 侧边栏收起】
┌───────────────────────┐
│ [≡]   📚 学习工作台   │
├───────────────────────┤
│                       │
│      页面内容         │
│                       │
└───────────────────────┘

【移动端 - 侧边栏展开】
┌────────────┬──────────┐
│ ✕          │          │
│            │          │
│  🏠        │          │
│            │          │
│  📚 工作台 │          │
│            │          │
│  📅 复习   │          │
│            │          │
│  📊 报告   │          │
│            │          │
│  ⚙️ 设置   │          │
└────────────┴──────────┘
```

**优点**:
- 导航项可扩展性强
- 内容区域宽度最大化
- 符合后台管理系统习惯

**缺点**:
- 小屏幕设备需要额外处理
- 首次加载可能需要更多资源

---

### 方案对比总结

| 特性 | 方案一 (单栏) | 方案二 (卡片) | 方案三 (侧边栏) |
|------|-------------|--------------|----------------|
| 垂直空间 | ⭐⭐⭐ 最省 | ⭐⭐ 中等 | ⭐⭐⭐ 最省 |
| 内容宽度 | ⭐⭐ 中等 | ⭐⭐ 中等 | ⭐⭐⭐ 最宽 |
| 扩展性 | ⭐ 较差 | ⭐⭐ 中等 | ⭐⭐⭐ 最好 |
| 视觉层次 | ⭐⭐ 中等 | ⭐⭐⭐ 最好 | ⭐⭐ 中等 |
| 移动端适配 | ⭐⭐⭐ 简单 | ⭐⭐ 中等 | ⭐ 复杂 |
| 开发难度 | ⭐⭐⭐ 简单 | ⭐⭐ 中等 | ⭐ 较复杂 |

**推荐**:
- 如果追求简洁高效 → **方案一**
- 如果追求视觉美观 → **方案二**
- 如果功能较多需要扩展 → **方案三**

---

6. Implementation Roadmap (For Cursor)
Use these prompts to guide the AI step-by-step:
Step 1: Foundation
"Initialize Next.js 14 with Supabase, Tailwind, and Shadcn. Set up the database schema provided in the Master Doc."
Step 2: AI Core
"Implement the ai-config.ts using the Domestic Adapters. Create a server action that accepts an image, sends it to Qwen-VL-Max for OCR, and returns the text."
Step 3: Chat Logic
"Build the Chat Interface using useChat. Implement the SystemPromptFactory. Ensure the prompt changes dynamically based on the selected user profile (Jasper vs Logic)."
Step 4: Theming
"Create a ThemeProvider that switches CSS variables (fonts, primary colors, radius) based on the user profile. Junior = Orange/Rounded; Senior = Blue/Square."
Step 5: Voice & Polish
"Add a microphone button to the chat input using Web Speech API. When the AI responds, use a TTS library to read the response if 'Voice Mode' is active."
7. Critical Rules for the AI Developer
Latency Handling: DeepSeek might be fast, but Qwen-VL (Vision) can take 3-5 seconds. Always show a skeleton loader or a "Analyzing your handwriting..." animation during the OCR phase.
No Hallucinations: Do not invent Shadcn components. Use the standard ones.
Error Boundaries: OCR will fail on messy handwriting. Provide a "Retry" or "Edit Text" button.
Domestic First: Do not import openai default instances. Always use the custom configured providers.