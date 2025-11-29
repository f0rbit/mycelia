/** @type {import('next').NextConfig} */
const nextConfig = {
  // Use 'export' for production builds, but allow dynamic routes in dev
  output: process.env.NODE_ENV === 'production' ? 'export' : undefined,
  basePath: process.env.NODE_ENV === 'production' ? '/mycelia/demo' : '',
  assetPrefix: process.env.NODE_ENV === 'production' ? '/mycelia/demo' : '',
  reactStrictMode: true,
  transpilePackages: ['@mycelia/render', '@mycelia/parser', '@mycelia/core'],
  images: {
    unoptimized: true, // Required for static export
  },
}

module.exports = nextConfig
