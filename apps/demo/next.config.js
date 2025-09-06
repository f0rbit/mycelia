/** @type {import('next').NextConfig} */
const nextConfig = {
  // Only use static export for production builds, not dev server  
  ...(process.env.NODE_ENV === 'production' && { output: 'export' }),
  images: {
    unoptimized: true
  },
  basePath: process.env.NODE_ENV === 'production' ? '/mycelia' : '',
  assetPrefix: process.env.NODE_ENV === 'production' ? '/mycelia/' : '',
  transpilePackages: ['@mycelia/core', '@mycelia/parser', '@mycelia/render']
}

export default nextConfig