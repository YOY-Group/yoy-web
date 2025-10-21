/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'cdn.shopify.com' },
      { protocol: 'https', hostname: 'shopify.com' },
      { protocol: 'https', hostname: 'static.shopify.com' },
      { protocol: 'https', hostname: 'assets.shopifycdn.com' },
    ],
  },

  async redirects() {
    return [
      // Legacy trust namespace → root equivalents
      { source: '/trust/:path*', destination: '/:path*', permanent: true },
    ];
  },
};

module.exports = nextConfig;