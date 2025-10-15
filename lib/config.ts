// PUBLIC config only — safe for client imports
type Env = "development" | "preview" | "production";

function currentEnv(): Env {
  const raw = process.env.VERCEL_ENV ?? "development";
  return raw === "production" || raw === "preview" ? raw : "development";
}

function resolveSiteUrl(): string {
  const explicit = process.env.NEXT_PUBLIC_SITE_URL;
  if (explicit) return explicit.replace(/\/+$/, "");
  const vercelUrl = process.env.VERCEL_URL; // e.g. myapp.vercel.app
  if (vercelUrl) return `https://${vercelUrl}`;
  return "http://localhost:3000";
}

export const CONFIG = {
  env: currentEnv(),
  isDev: currentEnv() === "development",
  isPreview: currentEnv() === "preview",
  isProd: currentEnv() === "production",

  siteUrl: resolveSiteUrl(),

  shopify: {
    storeDomain: process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN!, // public is fine
  },
  supabase: {
    publicUrl: process.env.NEXT_PUBLIC_SUPABASE_URL ?? "",
    anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "",
  },
} as const;