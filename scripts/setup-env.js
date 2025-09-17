#!/usr/bin/env node

/**
 * Environment Setup Script for PathNiti
 * This script helps you set up your environment variables
 */

const fs = require('fs')
const path = require('path')
const readline = require('readline')

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
})

function question(query) {
  return new Promise(resolve => rl.question(query, resolve))
}

async function setupEnvironment() {
  console.log('🔧 PathNiti Environment Setup\n')
  console.log('This script will help you set up your environment variables.\n')

  try {
    // Check if .env.local already exists
    const envPath = path.join(process.cwd(), '.env.local')
    const envExists = fs.existsSync(envPath)

    if (envExists) {
      const overwrite = await question('⚠️  .env.local already exists. Do you want to overwrite it? (y/N): ')
      if (overwrite.toLowerCase() !== 'y' && overwrite.toLowerCase() !== 'yes') {
        console.log('❌ Setup cancelled.')
        rl.close()
        return
      }
    }

    console.log('\n📋 Please provide your Supabase credentials:')
    console.log('   You can find these in your Supabase project dashboard under Settings > API\n')

    const supabaseUrl = await question('🔗 Supabase Project URL (https://your-project-id.supabase.co): ')
    const supabaseAnonKey = await question('🔑 Supabase Anon Key (starts with eyJ...): ')
    const supabaseServiceKey = await question('🔐 Supabase Service Role Key (starts with eyJ...): ')

    // Validate inputs
    if (!supabaseUrl || !supabaseAnonKey || !supabaseServiceKey) {
      console.log('❌ All fields are required. Please try again.')
      rl.close()
      return
    }

    if (!supabaseUrl.startsWith('https://') || !supabaseUrl.includes('supabase.co')) {
      console.log('❌ Invalid Supabase URL format. Please check and try again.')
      rl.close()
      return
    }

    if (!supabaseAnonKey.startsWith('eyJ') || !supabaseServiceKey.startsWith('eyJ')) {
      console.log('❌ Invalid Supabase key format. Keys should start with "eyJ".')
      rl.close()
      return
    }

    // Create .env.local content
    const envContent = `# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=${supabaseUrl}
NEXT_PUBLIC_SUPABASE_ANON_KEY=${supabaseAnonKey}
SUPABASE_SERVICE_ROLE_KEY=${supabaseServiceKey}

# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_APP_NAME=PathNiti
NEXT_PUBLIC_APP_DESCRIPTION=One-Stop Personalized Career & Education Advisor for Indian Students

# Environment
NODE_ENV=development

# Optional: AI Service (for future implementation)
AI_SERVICE_URL=your_ai_service_url
AI_SERVICE_KEY=your_ai_service_key

# Optional: Analytics
NEXT_PUBLIC_GA_ID=your_google_analytics_id

# Optional: Sentry (for error tracking)
SENTRY_DSN=your_sentry_dsn
`

    // Write .env.local file
    fs.writeFileSync(envPath, envContent)

    console.log('\n✅ Environment variables set up successfully!')
    console.log(`📁 Created: ${envPath}`)
    console.log('\n📋 Next steps:')
    console.log('   1. Run the database setup: node scripts/setup-database.js')
    console.log('   2. Start the development server: npm run dev')
    console.log('   3. Visit http://localhost:3000 to see your app')

  } catch (error) {
    console.error('❌ Error setting up environment:', error.message)
  } finally {
    rl.close()
  }
}

// Run the setup
setupEnvironment()
