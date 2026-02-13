-- =====================================================
-- 修复注册时创建 profile 的问题 (简化版)
-- =====================================================

-- 步骤 1: 删除旧的触发器
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- 步骤 2: 删除旧的函数
DROP FUNCTION IF EXISTS handle_new_user();

-- 步骤 3: 重新创建函数（使用 SECURITY DEFINER 绕过 RLS）
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  INSERT INTO public.profiles (id, role, display_name)
  VALUES (
    NEW.id,
    'student',
    COALESCE(NEW.raw_user_meta_data->>'display_name', 'User')
  );
  RETURN NEW;
EXCEPTION
  WHEN unique_violation THEN
    -- Profile 已存在，忽略错误
    RETURN NEW;
END;
$$;

-- 步骤 4: 重新创建触发器
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();

-- 完成
SELECT 'Auth trigger fix applied!' as status;
