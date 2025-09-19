/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    // For Next.js 14, use experimental.serverComponentsExternalPackages
    serverComponentsExternalPackages: ['@supabase/ssr', '@supabase/supabase-js', '@supabase/realtime-js'],
  },
  images: {
    domains: ['localhost'],
  },
  // Explicitly define environment variables for client-side access
  env: {
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    NEXT_PUBLIC_APP_NAME: process.env.NEXT_PUBLIC_APP_NAME || 'PathNiti',
    NEXT_PUBLIC_APP_DESCRIPTION: process.env.NEXT_PUBLIC_APP_DESCRIPTION || 'One-Stop Personalized Career & Education Advisor for Indian Students',
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  // Optimize build performance
  swcMinify: true,
  compress: true,
  webpack: (config, { isServer }) => {
    // Create missing CSS file during build to prevent ENOENT errors
    if (isServer) {
      const fs = require('fs');
      const path = require('path');
      
      // Create CSS file in all possible locations
      const locations = [
        path.join(__dirname, '.next', 'browser', 'default-stylesheet.css'),
        path.join(__dirname, '.next', 'server', 'app', 'auth', 'browser', 'default-stylesheet.css'),
        path.join(__dirname, '.next', 'server', 'app', 'auth', 'signup', 'college', 'browser', 'default-stylesheet.css'),
        path.join(__dirname, '.next', 'server', 'app', 'api', 'colleges', 'register', 'browser', 'default-stylesheet.css')
      ];
      
      locations.forEach(cssFile => {
        const cssDir = path.dirname(cssFile);
        if (!fs.existsSync(cssDir)) {
          fs.mkdirSync(cssDir, { recursive: true });
        }
        
        if (!fs.existsSync(cssFile)) {
          fs.writeFileSync(cssFile, '/* Default stylesheet placeholder */');
        }
      });
    }
    
    return config;
  },
};

module.exports = nextConfig;