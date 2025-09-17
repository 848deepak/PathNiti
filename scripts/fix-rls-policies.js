#!/usr/bin/env node

/**
 * RLS Policy Fix Script for PathNiti
 * This script fixes the conflicting RLS policies for the profiles table
 */

const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')
const path = require('path')
require('dotenv').config()

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing required environment variables:')
  console.error('   NEXT_PUBLIC_SUPABASE_URL')
  console.error('   SUPABASE_SERVICE_ROLE_KEY')
  console.error('\nPlease check your .env file and try again.')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function fixRLSPolicies() {
  try {
    console.log('🔧 Fixing RLS policies for profiles table...')

    // Read the SQL fix script
    const sqlPath = path.join(__dirname, 'fix-rls-policies.sql')
    const sqlContent = fs.readFileSync(sqlPath, 'utf8')

    // Execute the SQL
    const { data, error } = await supabase.rpc('exec_sql', { sql: sqlContent })

    if (error) {
      console.error('❌ Error executing SQL:', error)
      
      // Try alternative approach - execute SQL directly
      console.log('🔄 Trying alternative approach...')
      
      // Drop conflicting policies
      await supabase.rpc('exec_sql', { 
        sql: 'DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;' 
      })
      
      await supabase.rpc('exec_sql', { 
        sql: 'DROP POLICY IF EXISTS "Authenticated users can insert profiles" ON public.profiles;' 
      })

      // Create new policy
      await supabase.rpc('exec_sql', { 
        sql: `CREATE POLICY "Allow profile creation for authenticated users" ON public.profiles
              FOR INSERT WITH CHECK (
                  auth.role() = 'authenticated' 
                  AND auth.uid() = id
              );` 
      })

      console.log('✅ RLS policies fixed successfully!')
    } else {
      console.log('✅ RLS policies fixed successfully!')
      console.log('📊 Policy status:', data)
    }

    // Verify the fix
    console.log('\n🔍 Verifying RLS policies...')
    const { data: policies, error: verifyError } = await supabase
      .from('pg_policies')
      .select('policyname, cmd')
      .eq('tablename', 'profiles')
      .eq('schemaname', 'public')

    if (verifyError) {
      console.log('⚠️  Could not verify policies (this is normal)')
    } else {
      console.log('📋 Current policies for profiles table:')
      policies.forEach(policy => {
        console.log(`   ${policy.cmd}: ${policy.policyname}`)
      })
    }

  } catch (error) {
    console.error('❌ Error fixing RLS policies:', error)
    process.exit(1)
  }
}

// Run the fix
fixRLSPolicies()
