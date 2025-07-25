// import type { NextConfig } from "next"

// const nextConfig: NextConfig = {
//   images: {
//     domains: ["lh3.googleusercontent.com"], // Googleプロフィール画像のホスティング先
//   },
//   env: {
//     OPENAI_API_KEY: process.env.OPENAI_API_KEY,
//   },
//   typescript: {
//     ignoreBuildErrors: true,
//   },
//   eslint: {
//     ignoreDuringBuilds: true,
//   },
// }

// export default nextConfig


import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  images: {
    domains: ["lh3.googleusercontent.com"], // Googleプロフィール画像のホスティング先
  },
  // 環境変数を明示的に追加（重要！）
  env: {
    NEXTAUTH_URL: process.env.NEXTAUTH_URL,
    NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET,
    DATABASE_URL: process.env.DATABASE_URL,
    GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
    OPENAI_API_KEY: process.env.OPENAI_API_KEY,
    STRIPE_PUBLIC_KEY: process.env.STRIPE_PUBLIC_KEY,
    STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY,
  },
  experimental: {
    serverComponentsExternalPackages: ['@prisma/client', 'bcryptjs']
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  // Amplifyでのビルド最適化
  outputFileTracing: true,
}

export default nextConfig