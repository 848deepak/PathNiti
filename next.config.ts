import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    turbo: {
      rules: {
        '*.svg': {
          loaders: ['@svgr/webpack'],
          as: '*.js',
        },
      },
    },
  },
  images: {
    domains: ['localhost'],
  },
  env: {
    CUSTOM_KEY: process.env.CUSTOM_KEY,
    NEXT_PUBLIC_APP_NAME: 'PathNiti',
    NEXT_PUBLIC_APP_DESCRIPTION: 'One-Stop Personalized Career & Education Advisor for Indian Students',
  },
};

export default nextConfig;
