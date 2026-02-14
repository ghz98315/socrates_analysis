// =====================================================
// Direct Database Migration via Supabase Client
// =====================================================

require('dotenv').config({ path: '../.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

console.log('====================================================');
console.log('Direct Database Migration');
console.log('====================================================');
console.log(`Database: ${supabaseUrl}`);
console.log(`Service Role Key: ${serviceRoleKey ? 'Found' : 'Not Found'}`);

// 创建 Supabase 客户端
const supabase = createClient(supabaseUrl, serviceRoleKey);

// 迁移 SQL
const migrations = [
  {
    name: '1. Add parent_id column',
    sql: `
      ALTER TABLE profiles
        ADD COLUMN IF NOT EXISTS parent_id UUID;

      ALTER TABLE profiles
        DROP CONSTRAINT IF EXISTS profiles_parent_id_fkey;

      ALTER TABLE profiles
        ADD CONSTRAINT profiles_parent_id_fkey
          FOREIGN KEY (parent_id)
          REFERENCES profiles(id)
          ON DELETE SET NULL;

      CREATE INDEX IF NOT EXISTS profiles_parent_id_idx ON profiles(parent_id);

      SELECT 'parent_id column added' as status;
    `
  },
  {
    name: '2. Add phone column',
    sql: `
      ALTER TABLE profiles
        ADD COLUMN IF NOT EXISTS phone TEXT;

      CREATE INDEX IF NOT EXISTS profiles_phone_idx ON profiles(phone);

      COMMENT ON COLUMN profiles.phone IS '手机号，用于学生账号注册和登录';

      SELECT 'phone column added' as status;
    `
  },
  {
    name: '3. Fix role constraint',
    sql: `
      ALTER TABLE profiles
        DROP CONSTRAINT IF EXISTS profiles_role_check;

      ALTER TABLE profiles
        ADD CONSTRAINT profiles_role_check
          CHECK (role = 'student' OR role = 'parent' OR role = 'admin');

      SELECT 'role constraint fixed' as status;
    `
  }
];

// 由于 Supabase 客户端不直接支持执行 DDL，我们需要通过 RPC 函数
// 或者使用 PostgreSQL 直接连接

async function migrateViaRPC() {
  console.log('\n尝试通过 RPC 执行迁移...\n');

  for (const migration of migrations) {
    console.log(`--- ${migration.name} ---`);

    try {
      // Supabase 客户端不支持直接执行 DDL
      // 需要在 Supabase SQL Editor 中手动执行
      console.log('⚠️  需要在 Supabase SQL Editor 中手动执行以下 SQL:');
      console.log(migration.sql);
      console.log('');
    } catch (error) {
      console.error(`❌ 失败:`, error.message);
    }
  }
}

async function migrateViaDirectSQL() {
  console.log('\n尝试使用 PostgreSQL 直接连接执行迁移...\n');

  const { Pool } = require('pg');

  // 从 Supabase URL 构建 PostgreSQL 连接字符串
  // 格式: postgresql://postgres:[password]@db.[ref].supabase.co:5432/postgres

  const { Pool } = require('pg');

  // 需要数据库密码
  console.log('⚠️  需要数据库连接字符串');
  console.log('请在 Supabase 项目设置中获取:');
  console.log('1. 访问: https://app.supabase.com/project/_/settings/database');
  console.log('2. 复制 "Connection string"');
  console.log('3. 设置环境变量: DB_CONNECTION_STRING');
  console.log('');

  const connectionString = process.env.DB_CONNECTION_STRING;

  if (!connectionString) {
    console.log('❌ 未找到 DB_CONNECTION_STRING 环境变量');
    console.log('\n请改用 Supabase SQL Editor 手动执行迁移');
    return false;
  }

  const pool = new Pool({ connectionString });

  for (const migration of migrations) {
    console.log(`--- ${migration.name} ---`);

    try {
      await pool.query(migration.sql);
      console.log(`✅ 成功`);
    } catch (error) {
      console.error(`❌ 失败:`, error.message);
    }
  }

  await pool.end();
  return true;
}

async function main() {
  console.log('\n请选择执行方式:\n');
  console.log('1. 在 Supabase SQL Editor 中手动执行');
  console.log('2. 使用 PostgreSQL 连接字符串自动执行');
  console.log('\n推荐使用方式 1（最安全）\n');

  console.log('\n====================================================');
  console.log('手动执行步骤:');
  console.log('====================================================');
  console.log('1. 打开: https://app.supabase.com/project/_/sql');
  console.log('2. 复制以下 SQL 并按顺序执行:\n');

  for (const migration of migrations) {
    console.log(`\n### ${migration.name}`);
    console.log('```sql');
    console.log(migration.sql.trim());
    console.log('``\n');
  }

  console.log('\n====================================================');
}

main().catch(console.error);
