#!/usr/bin/env node

/**
 * Verify Dynamic College Profiles Schema
 * This script verifies that the database schema extensions have been properly applied
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function verifySchema() {
  console.log('🔍 Verifying Dynamic College Profiles Schema...\n');

  const checks = [
    {
      name: 'Colleges table has slug column',
      test: async () => {
        const { error } = await supabase.from('colleges').select('slug').limit(1);
        return !error;
      }
    },
    {
      name: 'Colleges table has about column',
      test: async () => {
        const { error } = await supabase.from('colleges').select('about').limit(1);
        return !error;
      }
    },
    {
      name: 'Colleges table has admission_criteria column',
      test: async () => {
        const { error } = await supabase.from('colleges').select('admission_criteria').limit(1);
        return !error;
      }
    },
    {
      name: 'Colleges table has scholarships column',
      test: async () => {
        const { error } = await supabase.from('colleges').select('scholarships').limit(1);
        return !error;
      }
    },
    {
      name: 'Colleges table has entrance_tests column',
      test: async () => {
        const { error } = await supabase.from('colleges').select('entrance_tests').limit(1);
        return !error;
      }
    },
    {
      name: 'Colleges table has gallery column',
      test: async () => {
        const { error } = await supabase.from('colleges').select('gallery').limit(1);
        return !error;
      }
    },
    {
      name: 'Student applications table exists',
      test: async () => {
        const { error } = await supabase.from('student_applications').select('id').limit(1);
        return !error;
      }
    },
    {
      name: 'College courses table exists',
      test: async () => {
        const { error } = await supabase.from('college_courses').select('id').limit(1);
        return !error;
      }
    },
    {
      name: 'College notices table exists',
      test: async () => {
        const { error } = await supabase.from('college_notices').select('id').limit(1);
        return !error;
      }
    },
    {
      name: 'Slug generation function exists',
      test: async () => {
        const { error } = await supabase.rpc('generate_college_slug', { 
          college_name: 'Test College' 
        });
        return !error;
      }
    }
  ];

  let passedChecks = 0;
  let totalChecks = checks.length;

  for (const check of checks) {
    try {
      const passed = await check.test();
      if (passed) {
        console.log(`✅ ${check.name}`);
        passedChecks++;
      } else {
        console.log(`❌ ${check.name}`);
      }
    } catch (error) {
      console.log(`❌ ${check.name} - Error: ${error.message}`);
    }
  }

  console.log(`\n📊 Schema Verification Results:`);
  console.log(`   Passed: ${passedChecks}/${totalChecks}`);
  
  if (passedChecks === totalChecks) {
    console.log(`✅ All schema extensions are properly applied!`);
    process.exit(0);
  } else {
    console.log(`❌ Some schema extensions are missing. Please run the migration script.`);
    process.exit(1);
  }
}

// Test database connection first
async function testConnection() {
  try {
    const { data, error } = await supabase.from('profiles').select('id').limit(1);
    if (error) {
      console.error('❌ Database connection failed:', error.message);
      process.exit(1);
    }
    console.log('✅ Database connection successful\n');
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    process.exit(1);
  }
}

async function main() {
  await testConnection();
  await verifySchema();
}

main().catch(console.error);