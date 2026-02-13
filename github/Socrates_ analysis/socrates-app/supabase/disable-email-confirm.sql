-- =====================================================
-- 开发环境: 禁用邮箱验证
-- 执行此 SQL 后，新注册用户无需验证邮箱即可登录
-- =====================================================

-- 修改用户确认设置
ALTER TABLE auth.users
ALTER COLUMN email_confirmed_at SET DEFAULT NOW();

-- 更新现有未确认的用户
UPDATE auth.users
SET email_confirmed_at = NOW()
WHERE email_confirmed_at IS NULL;

SELECT 'Email confirmation disabled for development!' as status;
