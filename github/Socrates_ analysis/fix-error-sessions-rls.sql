-- =====================================================
-- Fix RLS Policies for error_sessions Table
-- Run this in Supabase Dashboard > SQL Editor
-- =====================================================

-- Enable RLS
ALTER TABLE error_sessions ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS error_sessions_select_policy ON error_sessions;
DROP POLICY IF EXISTS error_sessions_insert_policy ON error_sessions;
DROP POLICY IF EXISTS error_sessions_update_policy ON error_sessions;
DROP POLICY IF EXISTS error_sessions_delete_policy ON error_sessions;

-- Create INSERT policy - allow authenticated users to insert their own error sessions
CREATE POLICY error_sessions_insert_policy ON error_sessions
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Create SELECT policy - allow users to read their own error sessions
CREATE POLICY error_sessions_select_policy ON error_sessions
  FOR SELECT
  TO authenticated
  USING (auth.uid()::text = student_id);

-- Create UPDATE policy - allow users to update their own error sessions
CREATE POLICY error_sessions_update_policy ON error_sessions
  FOR UPDATE
  TO authenticated
  USING (auth.uid()::text = student_id)
  WITH CHECK (auth.uid()::text = student_id);

-- Create DELETE policy - allow users to delete their own error sessions
CREATE POLICY error_sessions_delete_policy ON error_sessions
  FOR DELETE
  TO authenticated
  USING (auth.uid()::text = student_id);

-- Display current policies
SELECT policyname, tablename, cmd, permissive, roles FROM pg_policies WHERE tablename = 'error_sessions';
