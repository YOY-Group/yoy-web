// lib/siteMeta.ts
export const SITE = {
  brand: "YOY — Sensual Systems",
  domain: "shop.yoy.group",               // prod host
  previewHostHint: process.env.VERCEL_URL || "",
  description:
    "YOY designs sensual systems for everyday life. First Layer editions, limited runs.",
};

export const urls = {
  baseHttps: (host?: string) => new URL(`https://${host ?? SITE.domain}`),
  canonical: (path: string, host?: string) =>
    new URL(path.startsWith("/") ? path : `/${path}`, `https://${host ?? SITE.domain}`),
};