-- 删除触发器
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- 删除触发器函数
DROP FUNCTION IF EXISTS handle_new_user();
