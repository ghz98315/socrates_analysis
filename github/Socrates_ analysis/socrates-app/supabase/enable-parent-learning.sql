-- =====================================================
-- 多角色账号 - 允许家长也能使用学生功能
-- =====================================================

-- 1. 允许家长创建自己的错题会话
DROP POLICY IF EXISTS "Students can create their own sessions" ON error_sessions;
CREATE POLICY "Users can create their own sessions"
  ON error_sessions FOR INSERT
  WITH CHECK (student_id = auth.uid());

-- 2. 允许家长查看自己的错题会话
DROP POLICY IF EXISTS "Students can view their own sessions" ON error_sessions;
CREATE POLICY "Users can view their own sessions"
  ON error_sessions FOR SELECT
  USING (student_id = auth.uid());

-- 3. 允许家长创建自己的聊天消息
DROP POLICY IF EXISTS "System can insert messages" ON chat_messages;
CREATE POLICY "Users can insert messages in their sessions"
  ON chat_messages FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM error_sessions
      WHERE id = session_id AND student_id = auth.uid()
    )
  );

-- 4. 允许家长查看自己会话的聊天消息
DROP POLICY IF EXISTS "Users can view messages in their sessions" ON chat_messages;
CREATE POLICY "Users can view messages in their sessions"
  ON chat_messages FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM error_sessions
      WHERE id = session_id AND student_id = auth.uid()
    )
  );

-- 5. 允许家长创建自己的复习计划
DROP POLICY IF EXISTS "Students can view their own reviews" ON review_schedule;
CREATE POLICY "Users can view their own reviews"
  ON review_schedule FOR SELECT
  USING (student_id = auth.uid());

-- 6. 允许家长创建自己的学习会话
DROP POLICY IF EXISTS "Students can create their own study sessions" ON study_sessions;
CREATE POLICY "Users can create their own study sessions"
  ON study_sessions FOR INSERT
  WITH CHECK (student_id = auth.uid());

DROP POLICY IF EXISTS "Students can view their own study sessions" ON study_sessions;
CREATE POLICY "Users can view their own study sessions"
  ON study_sessions FOR SELECT
  USING (student_id = auth.uid());

DROP POLICY IF EXISTS "Students can update their own study sessions" ON study_sessions;
CREATE POLICY "Users can update their own study sessions"
  ON study_sessions FOR UPDATE
  USING (student_id = auth.uid());

-- 验证
SELECT 'Multi-role policies updated successfully' as status;
