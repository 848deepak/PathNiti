#!/bin/bash

# Clear Next.js and Turbopack caches
echo "🧹 Clearing Next.js and Turbopack caches..."

# Remove Next.js build cache
if [ -d ".next" ]; then
    echo "Removing .next directory..."
    rm -rf .next
fi

# Remove Turbopack cache
if [ -d ".turbo" ]; then
    echo "Removing .turbo directory..."
    rm -rf .turbo
fi

# Remove node_modules cache
if [ -d "node_modules/.cache" ]; then
    echo "Removing node_modules/.cache directory..."
    rm -rf node_modules/.cache
fi

# Remove TypeScript build info
if [ -f "tsconfig.tsbuildinfo" ]; then
    echo "Removing TypeScript build info..."
    rm -f tsconfig.tsbuildinfo
fi

# Clear npm cache (optional)
echo "Clearing npm cache..."
npm cache clean --force

echo "✅ Cache clearing complete!"
echo "You can now run 'npm run dev' to start the development server."
