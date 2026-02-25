# Project Socrates: Master Design Document

**Target Audience**: AI Coding Assistants (Cursor, Claude Code, Windsurf)
**Role**: Senior Full-Stack Engineer & Product Designer
**Mission**: Build a Socratic error-analysis agent for children, using domestic AI models (DeepSeek + Qwen).

**Current Version**: v0.99
**Last Updated**: 2026-02-25
**Status**: 99% Complete

---

## Development Progress Summary

| Module | Status | Completion |
|--------|--------|------------|
| Authentication System | ✅ Complete | 100% |
| Student Workbench | ✅ Complete | 95% |
| Parent Dashboard | ✅ Complete | 90% |
| Error Book | ✅ Complete | 90% |
| Achievement System | 🟡 In Progress | 85% |
| P2 Advanced Features | ✅ Complete | 100% |
| Backend API | ✅ Complete | 95% |
| Database Schema | ✅ Complete | 95% |

---

## 1. Tech Stack & Infrastructure

### Framework
- **Next.js**: 16.1.6 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4 + Shadcn/UI
- **PDF**: @react-pdf/renderer

### Backend
- **Database**: Supabase (PostgreSQL, Auth, Storage)
- **AI Integration**: Multi-model support
  - 通义千问 (Qwen) - Recommended
  - DeepSeek
  - 豆包 (Doubao)
  - Custom OpenAI-compatible APIs
- **OCR**: Tesseract.js + Python OCR Server
- **Offline Storage**: IndexedDB

### AI Models (Domestic)
- **Logic/Chat**: DeepSeek-V3, 通义千问
- **Vision/OCR**: Aliyun Qwen-VL-Max (via DashScope)
- **Speech (TTS/STT)**: Web Speech API

### Deployment
- **Platform**: Vercel

---

## 2. Database Schema (Supabase)

### Current Schema (v0.99)

```sql
-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- 1. PROFILES: Handles multi-user logic (Parent + Students)
create table profiles (
  id uuid references auth.users on delete cascade primary key,
  role text check (role in ('admin', 'student', 'parent')),
  display_name text,
  phone text,                    -- NEW: Phone number for login
  grade_level int,               -- 3-6 (Primary/Junior), 7-9 (Middle/Senior)
  theme_preference text check (theme_preference in ('junior', 'senior')),
  parent_id uuid references profiles(id),  -- NEW: Link students to parent
  avatar_url text,
  xp_points int default 0,
  created_at timestamptz default now()
);

-- 2. ERROR_SESSIONS: The core unit of work (one problem)
create table error_sessions (
  id uuid default uuid_generate_v4() primary key,
  student_id uuid references profiles(id),
  subject text check (subject in ('math', 'physics', 'chemistry')),
  original_image_url text,
  extracted_text text,
  status text check (status in ('analyzing', 'guided_learning', 'mastered')) default 'analyzing',
  difficulty_rating int,
  concept_tags text[],
  theme_used text check (theme_used in ('junior', 'senior')),  -- NEW: Track learning mode
  created_at timestamptz default now()
);

-- 3. CHAT_MESSAGES: History of the Socratic dialogue
create table chat_messages (
  id uuid default uuid_generate_v4() primary key,
  session_id uuid references error_sessions(id) on delete cascade,
  role text check (role in ('user', 'assistant', 'system')),
  content text,
  is_thought boolean default false,
  created_at timestamptz default now()
);

-- 4. REVIEW_SCHEDULE: Ebbinghaus Spaced Repetition Logic
create table review_schedule (
  id uuid default uuid_generate_v4() primary key,
  session_id uuid references error_sessions(id) on delete cascade,
  student_id uuid references profiles(id),
  review_stage int default 1,
  next_review_at timestamptz not null,
  is_completed boolean default false,
  variant_question_text text,
  created_at timestamptz default now()
);

-- 5. STUDY_SESSIONS: Learning time tracking
create table study_sessions (
  id uuid default uuid_generate_v4() primary key,
  student_id uuid references profiles(id),
  session_type text check (session_type in ('error_analysis', 'review')),
  start_time timestamptz default now(),
  end_time timestamptz,
  duration_seconds int
);

-- 6. LEARNING_REPORTS: Weekly/Monthly reports
create table learning_reports (
  id uuid default uuid_generate_v4() primary key,
  student_id uuid references profiles(id),
  report_type text check (report_type in ('weekly', 'monthly')),
  period_start date not null,
  period_end date not null,
  total_errors_analyzed int default 0,
  total_reviews_completed int default 0,
  mastery_rate numeric(5,2),
  weak_points jsonb,
  total_study_minutes int default 0,
  generated_at timestamptz default now()
);

-- Views for stats
create view student_stats as
select
  student_id,
  count(*) as total_errors,
  count(*) filter (where status = 'mastered') as mastered_count
from error_sessions
group by student_id;
```

### Migration Files
- ✅ `add-parent-id-column.sql` - Link students to parents
- ✅ `add-phone-column.sql` - Phone number support
- ✅ `fix-profile-role-constraint.sql` - Add 'parent' role
- ✅ `add-theme-used-column.sql` - Track learning mode

---

## 3. AI Provider Configuration

**File**: `lib/ai-models/`

```typescript
// lib/ai-models/config.ts
// Supports multiple AI providers

export const AVAILABLE_MODELS = [
  {
    id: 'qwen-turbo',
    provider: 'qwen',
    name: '通义千问 Turbo',
    base_url: 'https://dashscope.aliyuncs.com/compatible-mode/v1',
    api_key_env: 'DASHSCOPE_API_KEY',
    recommended: true,
    enabled: true,
  },
  {
    id: 'deepseek-chat',
    provider: 'deepseek',
    name: 'DeepSeek Chat',
    base_url: 'https://api.deepseek.com/v1',
    api_key_env: 'AI_API_KEY_LOGIC',
    enabled: false,
  },
  // ... more models
];
```

---

## 4. System Prompts & Personas

### Persona A: "Jasper" (The Explorer)
- **Target**: Grade 3-6 (Junior)
- **Tone**: Fun, encouraging, emojis (🌟, 🚀)
- **Core Rule**: NEVER give the answer
- **UI**: Rounded fonts, orange theme

### Persona B: "Logic" (The Architect)
- **Target**: Grade 7-9 (Senior)
- **Tone**: Serious, concise, Socratic
- **Core Rule**: Focus on logic gaps
- **UI**: Dark mode, monospace font

---

## 5. UI/UX Architecture

### Navigation Layout (Implemented: 方案二 - 分层卡片设计)

```
┌─────────────────────────────────────────────────────────────────────────┐
│  🏆 Socrates                                            [🔔] [👤 用户 ▼] │
├─────────────────────────────────────────────────────────────────────────┤
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐                   │
│  │ 📚 工作台 │ │ 📖 错题本 │ │ 📅 复习  │ │ ⚙️ 设置  │                   │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘                   │
├─────────────────────────────────────────────────────────────────────────┤
│                          页面内容区域                                    │
└─────────────────────────────────────────────────────────────────────────┘
```

### Key Components
- `GlobalNav.tsx` - 全局导航栏
- `ImageUploader.tsx` - 图片上传 (动画渐变边框)
- `ChatMessage.tsx` - 聊天消息 (AI/用户区分色块)
- `ChatInput.tsx` - 聊天输入 (语音支持)

---

## 6. Completed Features

### Authentication System (100%)
- ✅ Phone number login/register
- ✅ Role selection (Junior/Senior/Parent)
- ✅ Role-based access control
- ✅ Session persistence (HTTP/HTTPS compatible)

### Student Workbench (95%)
- ✅ Image upload with drag & drop
- ✅ OCR text recognition
- ✅ AI Socratic tutoring
- ✅ Learning time tracking
- ✅ PDF export (Chinese font support)
- ✅ Voice input
- ✅ Theme tracking

### Parent Dashboard (90%)
- ✅ Student selection
- ✅ Learning statistics
- ✅ Heatmap visualization
- ✅ Weak knowledge points
- ✅ Add/delete students
- ✅ Permission verification
- ✅ Theme mode statistics

### P2 Advanced Features (100%)
- ✅ AI model switching
- ✅ Multi-device sync
- ✅ Offline mode

---

## 7. Pending Features

### High Priority (Phase 3)
- [ ] Parent AI conversation analysis
- [ ] Review reminder system
- [ ] Learning report generation

### Medium Priority (Phase 4)
- [ ] Multi-subject expansion
- [ ] Social features

---

## 8. Bug Fixes (v0.99)

| Issue | Fix | Date |
|-------|-----|------|
| PDF Chinese garbled | Register NotoSansSC font | 2026-02-25 |
| Login state lost | Cookie secure flag conditional | 2026-02-25 |
| Student can access parent | Role permission control | 2026-02-25 |
| Modal overlay too dark | bg-black/50 → bg-black/30 | 2026-02-25 |
| Image display incomplete | object-cover → object-contain | 2026-02-25 |

---

## 9. Critical Rules for AI Developer

1. **Latency Handling**: Always show skeleton loader during OCR
2. **No Hallucinations**: Use standard Shadcn components
3. **Error Boundaries**: Provide "Retry" or "Edit Text" button
4. **Domestic First**: Use custom configured AI providers
5. **Theme Tracking**: Always save theme_used when creating error sessions
6. **Permission Control**: Verify role before accessing parent features

---

## 10. File Structure

```
socrates-app/
├── app/
│   ├── (auth)/           # Login, Register, Select-profile
│   ├── (parent)/         # Dashboard
│   ├── (student)/        # Workbench, Error-book, Achievements, Review, Settings
│   ├── api/              # All API routes
│   └── layout.tsx
├── components/           # React components
├── lib/
│   ├── ai-models/       # Multi-model AI service
│   ├── contexts/        # React Context (Auth, Sync, Offline)
│   ├── pdf/             # PDF export components
│   ├── offline/         # Offline mode support
│   ├── sync/            # Multi-device sync
│   └── supabase/        # Database client & types
├── supabase/            # SQL migrations
└── backend/             # Python OCR server
```

---

*This document is updated as development progresses.*
