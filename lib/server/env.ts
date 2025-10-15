// Server-only secrets. Never import this from a client component.
export const ENV = {
  SHOPIFY_STOREFRONT_API_TOKEN: process.env.SHOPIFY_STOREFRONT_API_TOKEN!,
  SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY ?? "",
} as const;