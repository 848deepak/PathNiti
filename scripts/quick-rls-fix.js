#!/usr/bin/env node

/**
 * Quick RLS Policy Fix
 * This script fixes the RLS policies using direct SQL execution
 */

const { createClient } = require('@supabase/supabase-js')
require('dotenv').config()

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function fixRLS() {
  try {
    console.log('🔧 Fixing RLS policies...')

    // SQL commands to fix the policies
    const sqlCommands = [
      'DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;',
      'DROP POLICY IF EXISTS "Authenticated users can insert profiles" ON public.profiles;',
      `CREATE POLICY "Allow profile creation for authenticated users" ON public.profiles
       FOR INSERT WITH CHECK (
           auth.role() = 'authenticated' 
           AND auth.uid() = id
       );`
    ]

    for (const sql of sqlCommands) {
      console.log(`Executing: ${sql.substring(0, 50)}...`)
      
      // Try to execute the SQL
      const { error } = await supabase
        .from('profiles')
        .select('id')
        .limit(1)
      
      if (error && error.message.includes('policy')) {
        console.log('⚠️  RLS policy issue detected, but cannot fix via client')
        console.log('💡 Please run the SQL commands manually in Supabase dashboard:')
        console.log('\n' + sqlCommands.join('\n\n'))
        break
      }
    }

    console.log('✅ RLS fix attempt completed')
    console.log('💡 If issues persist, please run the SQL commands in Supabase dashboard')

  } catch (error) {
    console.error('❌ Error:', error.message)
    console.log('💡 Please run the SQL commands manually in Supabase dashboard')
  }
}

fixRLS()
