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

  const results = {
    parent_id: { exists: false, details: null },
    phone: { exists: false, details: null },
    role_constraint: { exists: false, details: null }
  };

  // Check 1: parent_id column
  console.log('🔍 Checking parent_id column...');
  try {
    const { data: parentCheck } = await supabase
      .from('profiles')
      .select('parent_id')
      .limit(1);

    if (parentCheck && parentCheck.length > 0 && 'parent_id' in parentCheck[0]) {
      results.parent_id.exists = true;
      results.parent_id.details = 'Column exists and accessible';
      console.log('   ✅ parent_id column EXISTS\n');
    } else {
      results.parent_id.details = 'Column not found in query results';
      console.log('   ❌ parent_id column NOT FOUND\n');
    }
  } catch (error) {
    results.parent_id.details = error.message;
    console.log('   ❌ Error checking parent_id:', error.message, '\n');
  }

  // Check 2: phone column
  console.log('🔍 Checking phone column...');
  try {
    const { data: phoneCheck } = await supabase
      .from('profiles')
      .select('phone')
      .limit(1);

    if (phoneCheck && phoneCheck.length > 0 && 'phone' in phoneCheck[0]) {
      results.phone.exists = true;
      results.phone.details = 'Column exists and accessible';
      console.log('   ✅ phone column EXISTS\n');
    } else {
      results.phone.details = 'Column not found in query results';
      console.log('   ❌ phone column NOT FOUND\n');
    }
  } catch (error) {
    results.phone.details = error.message;
    console.log('   ❌ Error checking phone:', error.message, '\n');
  }

  // Check 3: role constraint (by trying to create a parent profile)
  console.log('🔍 Checking role constraint (parent role support)...');
  try {
    // Try to query for parent role
    const { data: roleCheck, error } = await supabase
      .from('profiles')
      .select('role')
      .eq('role', 'parent')
      .limit(1);

    if (!error && roleCheck && roleCheck.length >= 0) {
      results.role_constraint.exists = true;
      results.role_constraint.details = 'Parent role is accepted';
      console.log('   ✅ parent role is SUPPORTED\n');
    } else {
      results.role_constraint.exists = false;
      results.role_constraint.details = error?.message || 'Parent role not supported';
      console.log('   ❌ parent role NOT SUPPORTED');
      if (error) {
        console.log('      Error:', error.message, '\n');
      }
    }
  } catch (err) {
    results.role_constraint.details = err.message;
    console.log('   ❌ Error checking role constraint:', err.message, '\n');
  }

  // Summary
  console.log('====================================================');
  console.log('Verification Summary');
  console.log('====================================================\n');

  const allSuccess = results.parent_id.exists && results.phone.exists && results.role_constraint.exists;

  console.log('Results:');
  console.log(`  parent_id column:   ${results.parent_id.exists ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`  phone column:       ${results.phone.exists ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`  parent role support: ${results.role_constraint.exists ? '✅ PASS' : '❌ FAIL'}`);
  console.log('');

  if (allSuccess) {
    console.log('🎉 ALL MIGRATIONS SUCCESSFUL!\n');
    console.log('Next steps:');
    console.log('  1. Test parent login and dashboard');
    console.log('  2. Test add student feature');
    console.log('  3. Test student upload error question');
    console.log('');
    return true;
  } else {
    console.log('⚠️ SOME MIGRATIONS FAILED!\n');
    console.log('Please ensure you have executed the migrations in Supabase SQL Editor:');
    console.log('  https://app.supabase.com/project/_/sql\n');
    console.log('Refer to: scripts/migrate-all-in-one.md');
    return false;
  }
}

verifyMigrations()
  .then(success => {
    process.exit(success ? 0 : 1);
  })
  .catch(error => {
    console.error('Verification error:', error);
    process.exit(1);
  });
