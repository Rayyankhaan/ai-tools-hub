/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['logo.clearbit.com', 'img.logo.dev'],
    unoptimized: true,
  },
}

module.exports = nextConfig
