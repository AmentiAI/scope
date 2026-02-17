/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ["@neondatabase/serverless"],
  },
  images: {
    domains: ["pbs.twimg.com", "abs.twimg.com"],
  },
}

module.exports = nextConfig
