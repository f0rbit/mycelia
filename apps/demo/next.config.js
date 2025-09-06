/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  images: {
    unoptimized: true
  },
  basePath: process.env.NODE_ENV === 'production' ? '/mycelia' : '',
  assetPrefix: process.env.NODE_ENV === 'production' ? '/mycelia/' : '',
  transpilePackages: ['@mycelia/core', '@mycelia/parser', '@mycelia/render']
}

export default nextConfig