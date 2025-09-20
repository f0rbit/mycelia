/** @type {import('next').NextConfig} */
const nextConfig = {
  // Force static export for production builds
  output: 'export',
  images: {
    unoptimized: true
  },
  // Remove basePath for now to simplify static deployment
  // basePath: process.env.NODE_ENV === 'production' ? '/mycelia' : '',
  // assetPrefix: process.env.NODE_ENV === 'production' ? '/mycelia/' : '',
  transpilePackages: ['@mycelia/core', '@mycelia/parser', '@mycelia/render'],
  trailingSlash: true,
  // Optimize build performance
  experimental: {
    workerThreads: false,
    cpus: 1
  }
}

export default nextConfig