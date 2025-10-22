// app/robots.ts
import type { MetadataRoute } from "next";
import { SITE } from "@/lib/siteMeta";

/**
 * Rules:
 * - Block indexing unless we're truly live.
 * - Allow explicit preview override via NEXT_PUBLIC_IS_PREVIEW="true".
 * - Build absolute sitemap/host across prod/preview/dev (port-flex).
 */
export default function robots(): MetadataRoute.Robots {
  const vercelEnv = process.env.VERCEL_ENV; // "production" | "preview" | "development"
  const previewOverride = process.env.NEXT_PUBLIC_IS_PREVIEW === "true";
  const isProd = vercelEnv === "production" && !previewOverride;

  // Highest-priority explicit base (recommended to set per env):
  // e.g. https://yoy.group or http://localhost:3101
  const explicit = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "");

  // Otherwise build from environment
  const host = isProd
    ? SITE.domain // e.g., "yoy.group"
    : process.env.VERCEL_URL || `localhost:${process.env.PORT || "3000"}`;

  const isLocal =
    host.startsWith("localhost") || host.startsWith("127.0.0.1");

  // Final absolute base with protocol
  const base = explicit
    ? explicit
    : isLocal
    ? `http://${host}`
    : `https://${host}`;

  return {
    rules: isProd
      ? [{ userAgent: "*", allow: "/" }]
      : [{ userAgent: "*", disallow: "/" }], // keep previews/dev out of the index
    sitemap: `${base}/sitemap.xml`,
    host: base.replace(/^https?:\/\//, ""),
  };
}