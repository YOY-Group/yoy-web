/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'cdn.shopify.com' },
      { protocol: 'https', hostname: 'shopify.com' },          // optional
      { protocol: 'https', hostname: 'static.shopify.com' },   // optional
      { protocol: 'https', hostname: 'assets.shopifycdn.com' } // optional
    ],
  },
};

module.exports = nextConfig;