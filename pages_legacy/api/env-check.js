export default function handler(req, res) {
  res.status(200).json({
    NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN: process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN || null,
    SHOPIFY_STOREFRONT_API_TOKEN: !!process.env.SHOPIFY_STOREFRONT_API_TOKEN
  });
}