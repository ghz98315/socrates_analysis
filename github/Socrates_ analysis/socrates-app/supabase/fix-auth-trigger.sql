-- =====================================================
-- 修复注册时创建 profile 的问题
-- =====================================================

-- 方案 1: 为触发器函数添加绕过 RLS 的策略

-- 先删除旧的触发器
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- 删除并重新创建函数，添加 SECURITY DEFINER
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
    -- Profile 已存在，忽略
    RETURN NEW;
END;
$$;

-- 重新创建触发器
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();

-- 方案 2: 添加 RLS 策略允许服务端插入

-- 允许认证用户通过触发器插入
CREATE POLICY "Service role can insert profiles"
  ON profiles
  FOR INSERT
  TO service_role
  WITH CHECK (true);

-- 确保触发器可以绕过 RLS
ALTER POLICY "Service role can insert profiles"
  ON profiles
  USING (true);

-- 完成
SELECT 'Auth trigger fix applied!' as status;
