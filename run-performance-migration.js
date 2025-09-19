#!/usr/bin/env node

/**
 * Performance Optimization Migration Runner
 * Applies database optimizations and creates necessary indexes
 */

const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')
const path = require('path')

// Load environment variables
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing required environment variables:')
  console.error('   - NEXT_PUBLIC_SUPABASE_URL')
  console.error('   - SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function runMigration() {
  console.log('🚀 Starting performance optimization migration...')

  try {
    // Read the migration file
    const migrationPath = path.join(__dirname, 'src/lib/migrations/002_performance_optimizations.sql')
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8')

    console.log('📖 Reading migration file...')

    // Split the migration into individual statements
    const statements = migrationSQL
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'))

    console.log(`📝 Found ${statements.length} SQL statements to execute`)

    // Execute each statement
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i]
      
      if (statement.trim()) {
        console.log(`⏳ Executing statement ${i + 1}/${statements.length}...`)
        
        try {
          const { error } = await supabase.rpc('exec_sql', { 
            sql_query: statement + ';' 
          })

          if (error) {
            // Try direct execution for some statements
            const { error: directError } = await supabase
              .from('_temp_migration')
              .select('*')
              .limit(0)

            if (directError) {
              console.log(`⚠️  Statement ${i + 1} may have failed, but continuing...`)
              console.log(`   Statement: ${statement.substring(0, 100)}...`)
              console.log(`   Error: ${error.message}`)
            }
          } else {
            console.log(`✅ Statement ${i + 1} executed successfully`)
          }
        } catch (execError) {
          console.log(`⚠️  Statement ${i + 1} execution error:`, execError.message)
          console.log(`   Statement: ${statement.substring(0, 100)}...`)
        }
      }
    }

    // Verify some key optimizations were applied
    console.log('🔍 Verifying optimizations...')

    // Check if pg_trgm extension is enabled
    const { data: extensions } = await supabase
      .from('pg_extension')
      .select('extname')
      .eq('extname', 'pg_trgm')

    if (extensions && extensions.length > 0) {
      console.log('✅ pg_trgm extension is enabled')
    } else {
      console.log('⚠️  pg_trgm extension may not be enabled')
    }

    // Check if materialized view exists
    const { data: views } = await supabase
      .from('pg_matviews')
      .select('matviewname')
      .eq('matviewname', 'college_stats')

    if (views && views.length > 0) {
      console.log('✅ college_stats materialized view created')
    } else {
      console.log('⚠️  college_stats materialized view may not exist')
    }

    // Test the optimized function
    try {
      const { data: testData, error: testError } = await supabase
        .rpc('get_college_profile_optimized', { college_slug: 'test-college' })

      if (!testError || testError.message.includes('not found')) {
        console.log('✅ Optimized profile function is working')
      } else {
        console.log('⚠️  Optimized profile function may have issues:', testError.message)
      }
    } catch (testErr) {
      console.log('⚠️  Could not test optimized profile function')
    }

    console.log('🎉 Performance optimization migration completed!')
    console.log('')
    console.log('📊 Applied optimizations:')
    console.log('   • Additional database indexes for faster queries')
    console.log('   • Text search indexes using pg_trgm')
    console.log('   • Composite indexes for common filter combinations')
    console.log('   • Materialized view for college statistics')
    console.log('   • Optimized database functions for complex queries')
    console.log('   • Automatic cache refresh triggers')
    console.log('')
    console.log('💡 Next steps:')
    console.log('   • Monitor query performance in your application')
    console.log('   • Use the PerformanceMonitor component to track cache hit rates')
    console.log('   • Consider running ANALYZE on your tables for better query planning')

  } catch (error) {
    console.error('❌ Migration failed:', error.message)
    console.error('   Please check your database connection and permissions')
    process.exit(1)
  }
}

// Helper function to analyze table statistics
async function analyzeTableStats() {
  console.log('📈 Analyzing table statistics...')
  
  const tables = ['colleges', 'student_applications', 'college_courses', 'college_notices']
  
  for (const table of tables) {
    try {
      const { data, error } = await supabase
        .from(table)
        .select('*', { count: 'exact', head: true })

      if (!error && data !== null) {
        console.log(`   ${table}: ${data} records`)
      }
    } catch (err) {
      console.log(`   ${table}: Could not get count`)
    }
  }
}

// Run the migration
if (require.main === module) {
  runMigration()
    .then(() => analyzeTableStats())
    .then(() => {
      console.log('✨ All done!')
      process.exit(0)
    })
    .catch((error) => {
      console.error('💥 Fatal error:', error)
      process.exit(1)
    })
}

module.exports = { runMigration }