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
    return [{ source: '/trust/:path*', destination: '/:path*', permanent: true }];
  },

  async headers() {
    // Don’t let previews get indexed
    const isPreview = process.env.VERCEL_ENV && process.env.VERCEL_ENV !== 'production';
    return isPreview
      ? [
          {
            source: '/:path*',
            headers: [{ key: 'X-Robots-Tag', value: 'noindex, nofollow' }],
          },
        ]
      : [];
  },
};

module.exports = nextConfig;