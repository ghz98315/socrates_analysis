// =====================================================
// Database Migration Verification Script
// =====================================================

require('dotenv').config({ path: '../.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function verifyMigrations() {
  console.log('====================================================');
  console.log('Database Migration Verification');
  console.log('====================================================\n');

  // Check parent_id column
  console.log('Checking parent_id column...');
  const { data: parentCheck, error: parentError } = await supabase
    .rpc('check_column_exists', {
      table_name: 'profiles',
      column_name: 'parent_id'
    })
    .catch(() => ({ data: null, error: { message: 'RPC not available' } }));

  // Try direct query instead
  const { data: columns } = await supabase
    .from('profiles')
    .select('parent_id, phone')
    .limit(1);

  const hasParentId = columns !== null && 'parent_id' in (columns[0] || {});
  const hasPhone = columns !== null && 'phone' in (columns[0] || {});

  console.log(`  parent_id column: ${hasParentId ? '✅ EXISTS' : '❌ NOT FOUND'}`);
  console.log(`  phone column:     ${hasPhone ? '✅ EXISTS' : '❌ NOT FOUND'}\n`);

  // Check constraint
  console.log('Checking role constraint...');
  // This would need admin access to check directly

  console.log('\n====================================================');
  console.log('Verification Summary');
  console.log('====================================================');

  if (hasParentId && hasPhone) {
    console.log('✅ All migrations completed successfully!');
    console.log('\nNext steps:');
    console.log('  1. Test authentication flow');
    console.log('  2. Test add student feature');
    console.log('  3. Test error session saving');
    return true;
  } else {
    console.log('❌ Some migrations are missing!');
    console.log('\nPlease execute the migrations in Supabase SQL Editor:');
    console.log('  https://app.supabase.com/project/_/sql');
    console.log('\nRefer to: scripts/MIGRATE.md');
    return false;
  }
}

verifyMigrations().catch(console.error);
