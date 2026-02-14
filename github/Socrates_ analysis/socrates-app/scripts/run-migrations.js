// =====================================================
// Database Migration Runner
// =====================================================

require('dotenv').config({ path: '../.env.local' });

// 从 Supabase URL 解析 PostgreSQL 连接信息
function parseSupabaseUrl(url) {
  // https://avwknvhdewommwealsrd.supabase.co
  const match = url.match(/https:\/\/([^.]+)\.supabase\.co/);
  if (!match) {
    throw new Error('Invalid Supabase URL');
  }
  const ref = match[1];
  return {
    host: `db.${ref}.supabase.co`,
    database: 'postgres',
    // 注意：Supabase 使用 postgresql:// 协议的连接字符串
    // 我们需要完整的连接字符串
  };
}

// 从 Supabase 获取完整的 PostgreSQL 连接字符串
// 格式: postgresql://postgres.[project-ref]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres

// 创建 PostgreSQL 连接池
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// 解码 JWT 获取数据库密码 (简化处理，实际需要完整连接字符串)
// Supabase 的 PostgreSQL 连接格式:
// postgresql://postgres.[project-ref]:[password]@aws-0-[region].pooler.supabase.com:5432/postgres

// 由于我们只有 API keys，使用 Supabase 的 SQL API
console.log('Database URL:', supabaseUrl);
console.log('Service Role Key:', serviceRoleKey ? 'Found' : 'Not found');

// SQL 迁移
const migrations = [
  {
    name: '1. Add parent_id column',
    order: 1,
    sql: `
      -- 添加 parent_id 字段
      ALTER TABLE profiles
        ADD COLUMN IF NOT EXISTS parent_id UUID;

      -- 添加外键约束
      ALTER TABLE profiles
        DROP CONSTRAINT IF EXISTS profiles_parent_id_fkey;

      ALTER TABLE profiles
        ADD CONSTRAINT profiles_parent_id_fkey
          FOREIGN KEY (parent_id)
          REFERENCES profiles(id)
          ON DELETE SET NULL;

      -- 创建索引
      CREATE INDEX IF NOT EXISTS profiles_parent_id_idx ON profiles(parent_id);

      SELECT 'parent_id column added' as status;
    `
  },
  {
    name: '2. Add phone column',
    order: 2,
    sql: `
      -- 添加 phone 字段
      ALTER TABLE profiles
        ADD COLUMN IF NOT EXISTS phone TEXT;

      -- 添加索引
      CREATE INDEX IF NOT EXISTS profiles_phone_idx ON profiles(phone);

      -- 添加注释
      COMMENT ON COLUMN profiles.phone IS '手机号，用于学生账号注册和登录';

      SELECT 'phone column added' as status;
    `
  },
  {
    name: '3. Fix role constraint',
    order: 3,
    sql: `
      -- 先删除旧的约束
      ALTER TABLE profiles
        DROP CONSTRAINT IF EXISTS profiles_role_check;

      -- 重新创建约束，允许 'student' | 'parent' | 'admin'
      ALTER TABLE profiles
        ADD CONSTRAINT profiles_role_check
          CHECK (role = 'student' OR role = 'parent' OR role = 'admin');

      SELECT 'role constraint fixed' as status;
    `
  }
];

// 使用 Supabase REST API 执行 SQL
async function executeViaRestAPI(sql) {
  const { createClient } = require('@supabase/supabase-js');
  const supabase = createClient(supabaseUrl, serviceRoleKey);

  // Supabase 不直接支持 REST API 执行任意 SQL
  // 需要使用 SQL Editor 或直接 PostgreSQL 连接
  throw new Error('Direct SQL execution via REST API not supported. Please use Supabase SQL Editor.');
}

// 主函数
async function main() {
  console.log('====================================================');
  console.log('Database Migration Runner');
  console.log('====================================================');
  console.log('\n⚠️  IMPORTANT: Auto-execution not available');
  console.log('\nPlease run the following SQL scripts in Supabase SQL Editor:');
  console.log('\n📁 https://app.supabase.com/project/_/sql\n');

  for (const migration of migrations) {
    console.log(`\n--- ${migration.name} ---`);
    console.log(migration.sql.trim());
    console.log('');
  }

  console.log('\n====================================================');
  console.log('Alternative: Manual Steps');
  console.log('====================================================');
  console.log('1. Go to: https://app.supabase.com');
  console.log('2. Select your project');
  console.log('3. Navigate to SQL Editor');
  console.log('4. Run each migration script in order');
  console.log('');
}

main().catch(console.error);
