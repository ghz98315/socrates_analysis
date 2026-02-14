-- =====================================================
-- 更新用户创建触发器以支持手机号
-- =====================================================

-- 删除旧的触发器
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- 更新触发器函数，从 metadata 中获取 phone
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, role, display_name, phone)
  VALUES (
    NEW.id,
    'student',
    COALESCE(NEW.raw_user_meta_data->>'display_name', 'User'),
    NEW.raw_user_meta_data->>'phone'  -- 从 metadata 获取手机号
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 重新创建触发器
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- 验证触发器已更新
SELECT
  trigger_name,
  event_manipulation,
  action_statement
FROM information_schema.triggers
WHERE trigger_name = 'on_auth_user_created';
