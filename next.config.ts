import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  images: {
    domains: ["lh3.googleusercontent.com"], // Googleプロフィール画像のホスティング先
  },
  env: {
    OPENAI_API_KEY: process.env.OPENAI_API_KEY,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
}

export default nextConfig