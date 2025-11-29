import { createMDX } from 'fumadocs-mdx/next';

const withMDX = createMDX();

/** @type {import('next').NextConfig} */
const config = {
  output: 'export',
  basePath: process.env.NODE_ENV === 'production' ? '/mycelia/docs' : '',
  assetPrefix: process.env.NODE_ENV === 'production' ? '/mycelia/docs' : '',
  reactStrictMode: true,
  transpilePackages: ['@mycelia/core', '@mycelia/parser'],
  images: {
    unoptimized: true, // Required for static export
  },
};

export default withMDX(config);