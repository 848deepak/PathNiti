import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/** @type {import('next').NextConfig} */
const nextConfig = {
  // For Next.js 15, serverComponentsExternalPackages moved to root level
  serverExternalPackages: [
    "@supabase/ssr",
    "@supabase/realtime-js",
  ],
  // Fix client reference manifest issues
  experimental: {
    // Fix client reference manifest issues in Next.js 15
    optimizePackageImports: ['@supabase/supabase-js'],
  },
  images: {
    domains: ["localhost", "maps.googleapis.com"],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "maps.googleapis.com",
        port: "",
        pathname: "/maps/api/place/photo**",
      },
    ],
  },
  // Explicitly define environment variables for client-side access
  env: {
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    NEXT_PUBLIC_APP_NAME: process.env.NEXT_PUBLIC_APP_NAME || "PathNiti",
    NEXT_PUBLIC_APP_DESCRIPTION:
      process.env.NEXT_PUBLIC_APP_DESCRIPTION ||
      "One-Stop Personalized Career & Education Advisor for Indian Students",
    NEXT_PUBLIC_APP_URL:
      process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
  },
  eslint: {
    ignoreDuringBuilds: false,
  },
  typescript: {
    ignoreBuildErrors: false,
  },
  // Optimize build performance
  compress: true,
  webpack: (config, { isServer, dev }) => {
    // Fix webpack module loading issues
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      net: false,
      tls: false,
    };

    // Improve module resolution
    config.resolve.alias = {
      ...config.resolve.alias,
    };

    // Fix client reference manifest issues
    if (!isServer) {
      // Remove problematic aliases that cause module resolution issues
      config.resolve.alias = {
        ...config.resolve.alias,
      };
    }

    // Fix chunk loading issues
    if (!isServer) {
      config.optimization = {
        ...config.optimization,
        splitChunks: {
          ...config.optimization.splitChunks,
          chunks: 'all',
          cacheGroups: {
            ...config.optimization.splitChunks?.cacheGroups,
            default: {
              minChunks: 2,
              priority: -20,
              reuseExistingChunk: true,
            },
            vendor: {
              test: /[\\/]node_modules[\\/]/,
              name: 'vendors',
              priority: -10,
              chunks: 'all',
            },
          },
        },
      };
    }

    // Create missing CSS file during build to prevent ENOENT errors
    if (isServer) {
      // Create CSS file in all possible locations
      const locations = [
        path.join(__dirname, ".next", "browser", "default-stylesheet.css"),
        path.join(
          __dirname,
          ".next",
          "server",
          "app",
          "auth",
          "browser",
          "default-stylesheet.css",
        ),
        path.join(
          __dirname,
          ".next",
          "server",
          "app",
          "auth",
          "signup",
          "college",
          "browser",
          "default-stylesheet.css",
        ),
        path.join(
          __dirname,
          ".next",
          "server",
          "app",
          "api",
          "colleges",
          "register",
          "browser",
          "default-stylesheet.css",
        ),
      ];

      locations.forEach((cssFile) => {
        const cssDir = path.dirname(cssFile);
        if (!fs.existsSync(cssDir)) {
          fs.mkdirSync(cssDir, { recursive: true });
        }

        if (!fs.existsSync(cssFile)) {
          fs.writeFileSync(cssFile, "/* Default stylesheet placeholder */");
        }
      });
    }

    return config;
  },
};

export default nextConfig;
