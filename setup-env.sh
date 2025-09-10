#!/bin/bash

# EduNiti Environment Setup Script
echo "🚀 Setting up EduNiti development environment..."

# Create .env.local file if it doesn't exist
if [ ! -f ".env.local" ]; then
    echo "📝 Creating .env.local file..."
    cat > .env.local << EOF
# Supabase Configuration (Demo values for development)
NEXT_PUBLIC_SUPABASE_URL=https://demo.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=demo-key
NEXT_PUBLIC_APP_URL=http://localhost:3001

# For production, replace with your actual Supabase credentials:
# NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
# NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
EOF
    echo "✅ Created .env.local with demo values"
else
    echo "⚠️  .env.local already exists, skipping creation"
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm install

echo "🎉 Setup complete! You can now run 'npm run dev' to start the development server."
echo ""
echo "📋 Next steps:"
echo "1. To use real Supabase, update .env.local with your credentials"
echo "2. Run 'npm run dev' to start the development server"
echo "3. Visit http://localhost:3001 to see the application"
echo ""
echo "🔧 For production deployment:"
echo "1. Set up a Supabase project at https://supabase.com"
echo "2. Update environment variables with real credentials"
echo "3. Deploy using the instructions in DEPLOYMENT.md"

