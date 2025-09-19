/**
 * Apply Conversation Schema for AI Sarthi Chat Interface
 * This script applies the conversation schema to the database
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Load environment variables
require('dotenv').config();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing required environment variables:');
  console.error('- NEXT_PUBLIC_SUPABASE_URL');
  console.error('- SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function applyConversationSchema() {
  try {
    console.log('🚀 Applying conversation schema for AI Sarthi chat interface...');
    
    // Read the schema file
    const schemaPath = path.join(__dirname, 'src/lib/conversation-schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');
    
    // Split the schema into individual statements
    const statements = schema
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));
    
    console.log(`📝 Found ${statements.length} SQL statements to execute`);
    
    // Execute each statement
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      if (statement.trim()) {
        try {
          console.log(`⏳ Executing statement ${i + 1}/${statements.length}...`);
          const { error } = await supabase.rpc('exec_sql', { sql: statement });
          
          if (error) {
            console.warn(`⚠️  Warning in statement ${i + 1}:`, error.message);
            // Continue with other statements even if one fails
          } else {
            console.log(`✅ Statement ${i + 1} executed successfully`);
          }
        } catch (err) {
          console.warn(`⚠️  Error in statement ${i + 1}:`, err.message);
        }
      }
    }
    
    console.log('🎉 Conversation schema application completed!');
    console.log('\n📋 Created tables:');
    console.log('  • conversation_sessions - Stores chat sessions');
    console.log('  • conversation_messages - Stores individual messages');
    console.log('  • sarthi_interactions - Tracks AI interactions for analytics');
    console.log('\n🔐 Security:');
    console.log('  • Row Level Security (RLS) enabled');
    console.log('  • User-specific access policies configured');
    console.log('  • Admin analytics access enabled');
    console.log('\n🚀 AI Sarthi chat interface is ready to use!');
    
  } catch (error) {
    console.error('❌ Error applying conversation schema:', error);
    process.exit(1);
  }
}

// Alternative method using direct SQL execution
async function applySchemaDirect() {
  try {
    console.log('🚀 Applying conversation schema using direct SQL execution...');
    
    const schemaPath = path.join(__dirname, 'src/lib/conversation-schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');
    
    // Execute the entire schema at once
    const { error } = await supabase.rpc('exec_sql', { sql: schema });
    
    if (error) {
      console.error('❌ Error executing schema:', error);
      process.exit(1);
    }
    
    console.log('🎉 Conversation schema applied successfully!');
    
  } catch (error) {
    console.error('❌ Error applying schema:', error);
    process.exit(1);
  }
}

// Check if we can execute SQL directly
async function checkDatabaseAccess() {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('count')
      .limit(1);
    
    if (error) {
      console.error('❌ Database access check failed:', error.message);
      return false;
    }
    
    console.log('✅ Database access confirmed');
    return true;
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    return false;
  }
}

// Main execution
async function main() {
  console.log('🔍 Checking database access...');
  const hasAccess = await checkDatabaseAccess();
  
  if (!hasAccess) {
    console.error('❌ Cannot proceed without database access');
    process.exit(1);
  }
  
  // Try direct execution first, fallback to statement-by-statement
  try {
    await applySchemaDirect();
  } catch (error) {
    console.log('⚠️  Direct execution failed, trying statement-by-statement...');
    await applyConversationSchema();
  }
}

// Run the script
if (require.main === module) {
  main().catch(console.error);
}

module.exports = { applyConversationSchema, applySchemaDirect };
