/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['@classverse/shared'],
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: false,
  },
};

module.exports = nextConfig;
