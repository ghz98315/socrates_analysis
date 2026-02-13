-- =====================================================
-- Project Socrates - Database Schema
-- =====================================================
-- 执行步骤：
-- 1. 在 Supabase 项目中打开 SQL Editor
-- 2. 复制此文件内容并执行
-- 3. 验证表是否创建成功
-- =====================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- 1. PROFILES - 用户表（扩展 auth.users）
-- =====================================================
CREATE TABLE profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  role TEXT CHECK (role IN ('admin', 'student')) NOT NULL,
  display_name TEXT,
  grade_level INTEGER, -- 3-6 (小学), 7-9 (初中)
  theme_preference TEXT CHECK (theme_preference IN ('junior', 'senior')),
  avatar_url TEXT,
  xp_points INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 2. KNOWLEDGE_TAGS - 知识点标签树
-- =====================================================
CREATE TABLE knowledge_tags (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  subject TEXT CHECK (subject IN ('math', 'physics', 'chemistry')),
  parent_id UUID REFERENCES knowledge_tags(id) ON DELETE CASCADE,
  tag_name TEXT NOT NULL,
  tag_level INTEGER, -- 1=一级分类, 2=二级分类
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 预设知识点数据
INSERT INTO knowledge_tags (subject, tag_name, tag_level) VALUES
-- 数学
('math', '代数', 1), ('math', '几何', 1), ('math', '函数', 1),
('math', '方程', 2), ('math', '不等式', 2), ('math', '勾股定理', 2),
('math', '因式分解', 2), ('math', '分式运算', 2),
-- 物理
('physics', '力学', 1), ('physics', '电学', 1), ('physics', '光学', 1),
('physics', '牛顿定律', 2), ('physics', '力的计算', 2),
('physics', '电路分析', 2), ('physics', '压强计算', 2),
-- 化学
('chemistry', '基础概念', 1), ('chemistry', '化学反应', 1),
('chemistry', '化学方程式', 2), ('chemistry', '酸碱盐', 2),
('chemistry', '摩尔计算', 2), ('chemistry', '元素周期表', 2);

-- =====================================================
-- 3. ERROR_SESSIONS - 错题会话（核心表）
-- =====================================================
CREATE TABLE error_sessions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  student_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  subject TEXT CHECK (subject IN ('math', 'physics', 'chemistry')) NOT NULL,
  original_image_url TEXT,
  extracted_text TEXT,
  status TEXT CHECK (status IN ('analyzing', 'guided_learning', 'mastered')) DEFAULT 'analyzing',
  difficulty_rating INTEGER CHECK (difficulty_rating BETWEEN 1 AND 5),
  concept_tags TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 4. CHAT_MESSAGES - 对话消息历史
-- =====================================================
CREATE TABLE chat_messages (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  session_id UUID REFERENCES error_sessions(id) ON DELETE CASCADE,
  role TEXT CHECK (role IN ('user', 'assistant', 'system')) NOT NULL,
  content TEXT NOT NULL,
  is_thought BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 5. REVIEW_SCHEDULE - 复习计划（艾宾浩斯）
-- =====================================================
-- 复习间隔：1天 → 3天 → 7天 → 15天
CREATE TABLE review_schedule (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  session_id UUID REFERENCES error_sessions(id) ON DELETE CASCADE,
  student_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  review_stage INTEGER DEFAULT 1 CHECK (review_stage BETWEEN 1 AND 4),
  next_review_at TIMESTAMPTZ NOT NULL,
  is_completed BOOLEAN DEFAULT FALSE,
  variant_question_text TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 复习间隔配置（天）
-- stage 1: 1天
-- stage 2: 3天
-- stage 3: 7天
-- stage 4: 15天（完成后标记为已掌握）

-- =====================================================
-- 6. STUDY_SESSIONS - 学习会话记录（时长统计）
-- =====================================================
CREATE TABLE study_sessions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  student_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  session_type TEXT CHECK (session_type IN ('error_analysis', 'review')),
  start_time TIMESTAMPTZ DEFAULT NOW(),
  end_time TIMESTAMPTZ,
  duration_seconds INTEGER
);

-- =====================================================
-- 7. LEARNING_REPORTS - 学习报告
-- =====================================================
CREATE TABLE learning_reports (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  student_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  report_type TEXT CHECK (report_type IN ('weekly', 'monthly')),
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  total_errors_analyzed INTEGER DEFAULT 0,
  total_reviews_completed INTEGER DEFAULT 0,
  mastery_rate NUMERIC(5,2),
  weak_points JSONB,
  total_study_minutes INTEGER DEFAULT 0,
  generated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 8. PARENT_REVIEWS - 家长复核记录
-- =====================================================
CREATE TABLE parent_reviews (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  session_id UUID REFERENCES error_sessions(id) ON DELETE CASCADE,
  parent_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  action TEXT CHECK (action IN ('confirmed', 'overridden')),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 9. MULTI_QUESTION_IMAGES - 多题处理
-- =====================================================
CREATE TABLE multi_question_images (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  session_id UUID REFERENCES error_sessions(id) ON DELETE CASCADE,
  question_index INTEGER NOT NULL,
  cropped_image_url TEXT,
  ocr_result TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- Views 视图
-- =====================================================

-- 学生统计视图
CREATE VIEW student_stats AS
SELECT
  student_id,
  COUNT(*) AS total_errors,
  COUNT(*) FILTER (WHERE status = 'mastered') AS mastered_count,
  ROUND(
    COUNT(*) FILTER (WHERE status = 'mastered')::NUMERIC /
    NULLIF(COUNT(*), 0) * 100,
    2
  ) AS mastery_rate
FROM error_sessions
GROUP BY student_id;

-- 待复习列表视图
CREATE VIEW pending_reviews AS
SELECT
  rs.id,
  rs.session_id,
  rs.student_id,
  es.subject,
  es.concept_tags,
  es.difficulty_rating,
  rs.next_review_at,
  rs.review_stage
FROM review_schedule rs
JOIN error_sessions es ON rs.session_id = es.id
WHERE rs.is_completed = FALSE
  AND rs.next_review_at <= NOW()
ORDER BY rs.next_review_at ASC;

-- =====================================================
-- Indexes 索引
-- =====================================================
CREATE INDEX idx_error_sessions_student ON error_sessions(student_id);
CREATE INDEX idx_error_sessions_status ON error_sessions(status);
CREATE INDEX idx_error_sessions_created ON error_sessions(created_at DESC);
CREATE INDEX idx_chat_messages_session ON chat_messages(session_id);
CREATE INDEX idx_chat_messages_created ON chat_messages(created_at DESC);
CREATE INDEX idx_review_schedule_student ON review_schedule(student_id);
CREATE INDEX idx_review_schedule_next ON review_schedule(next_review_at);
CREATE INDEX idx_study_sessions_student ON study_sessions(student_id);
CREATE INDEX idx_study_sessions_type ON study_sessions(session_type);
CREATE INDEX idx_knowledge_tags_subject ON knowledge_tags(subject);

-- =====================================================
-- RLS (Row Level Security) 策略
-- =====================================================

-- 启用 RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE error_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE review_schedule ENABLE ROW LEVEL SECURITY;
ALTER TABLE study_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE parent_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE multi_question_images ENABLE ROW LEVEL SECURITY;

-- Profiles 策略
CREATE POLICY "Users can view their own profile"
  ON profiles FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON profiles FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Admins can view all profiles"
  ON profiles FOR SELECT USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

CREATE POLICY "Admins can update all profiles"
  ON profiles FOR UPDATE USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Error Sessions 策略
CREATE POLICY "Students can view their own sessions"
  ON error_sessions FOR SELECT USING (student_id = auth.uid());

CREATE POLICY "Students can create their own sessions"
  ON error_sessions FOR INSERT WITH CHECK (student_id = auth.uid());

CREATE POLICY "Admins can view all sessions"
  ON error_sessions FOR SELECT USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Chat Messages 策略
CREATE POLICY "Users can view messages in their sessions"
  ON chat_messages FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM error_sessions
    WHERE id = session_id AND student_id = auth.uid()
  )
);

CREATE POLICY "System can insert messages"
  ON chat_messages FOR INSERT WITH CHECK (true);

-- Review Schedule 策略
CREATE POLICY "Students can view their own reviews"
  ON review_schedule FOR SELECT USING (student_id = auth.uid());

-- Study Sessions 策略
CREATE POLICY "Students can view their own study sessions"
  ON study_sessions FOR SELECT USING (student_id = auth.uid());

CREATE POLICY "Students can create their own study sessions"
  ON study_sessions FOR INSERT WITH CHECK (student_id = auth.uid());

CREATE POLICY "Students can update their own study sessions"
  ON study_sessions FOR UPDATE USING (student_id = auth.uid());

-- Parent Reviews 策略
CREATE POLICY "Admins can view all reviews"
  ON parent_reviews FOR SELECT USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

CREATE POLICY "Admins can create reviews"
  ON parent_reviews FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Multi Question Images 策略
CREATE POLICY "Users can view images in their sessions"
  ON multi_question_images FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM error_sessions
    WHERE id = session_id AND student_id = auth.uid()
  )
);

-- =====================================================
-- Functions 函数
-- =====================================================

-- 创建复习计划的函数
CREATE OR REPLACE FUNCTION create_review_schedule(p_session_id UUID)
RETURNS UUID AS $$
DECLARE
  v_student_id UUID;
  v_new_review_id UUID;
BEGIN
  -- 获取学生ID
  SELECT student_id INTO v_student_id
  FROM error_sessions
  WHERE id = p_session_id;

  -- 创建第一次复习（1天后）
  INSERT INTO review_schedule (session_id, student_id, review_stage, next_review_at)
  VALUES (p_session_id, v_student_id, 1, NOW() + INTERVAL '1 day')
  RETURNING id INTO v_new_review_id;

  RETURN v_new_review_id;
END;
$$ LANGUAGE plpgsql;

-- 更新复习进度的函数
CREATE OR REPLACE FUNCTION advance_review_stage(p_review_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  v_current_stage INTEGER;
  v_session_id UUID;
  v_student_id UUID;
  v_stage_intervals INTEGER[] := ARRAY[1, 3, 7, 15]; -- 天数
BEGIN
  -- 获取当前信息
  SELECT review_stage, session_id, student_id
  INTO v_current_stage, v_session_id, v_student_id
  FROM review_schedule
  WHERE id = p_review_id;

  -- 如果是最后阶段，标记为完成
  IF v_current_stage >= 4 THEN
    UPDATE review_schedule
    SET is_completed = TRUE
    WHERE id = p_review_id;
    RETURN TRUE;
  END IF;

  -- 进入下一阶段
  UPDATE review_schedule
  SET
    review_stage = v_current_stage + 1,
    next_review_at = NOW() + (v_stage_intervals[v_current_stage + 1] || ' days')::INTERVAL
  WHERE id = p_review_id;

  RETURN FALSE;
END;
$$ LANGUAGE plpgsql;

-- 自动创建 profile 的触发器
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, role, display_name)
  VALUES (
    NEW.id,
    'student',
    COALESCE(NEW.raw_user_meta_data->>'display_name', 'User')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 创建触发器
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- =====================================================
-- Storage Buckets (需要在 Supabase Storage 中手动创建)
-- =====================================================
-- Bucket 1: error-images (存储错题图片)
-- Bucket 2: avatars (存储用户头像)
-- Bucket 3: reports (存储生成的报告)

-- =====================================================
-- 完成提示
-- =====================================================
-- 执行完成后，请在 Supabase 中验证：
-- 1. 所有表已创建 (9 张表)
-- 2. 所有视图已创建 (2 个视图)
-- 3. RLS 策略已启用
-- 4. 函数已创建 (3 个函数)
-- 5. 知识点数据已插入 (18 条记录)
