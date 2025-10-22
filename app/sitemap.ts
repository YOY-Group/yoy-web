// app/sitemap.ts
import type { MetadataRoute } from "next";
import { SITE, urls } from "@/lib/siteMeta";

export default function sitemap(): MetadataRoute.Sitemap {
  const isProd = process.env.VERCEL_ENV === "production";
  const host = isProd ? SITE.domain : process.env.VERCEL_URL || SITE.domain;
  const base = urls.baseHttps(host).toString().replace(/\/$/, "");
  const now = new Date();

  const pages = [
    "",              // /
    "privacy",
    "returns",
    "shipping",
    "terms",
    "contact",
  ];

  return pages.map((p) => ({
    url: `${base}/${p}`.replace(/\/+$/, p ? "" : "/"),
    lastModified: now,
    changeFrequency: "monthly",
    priority: p ? 0.6 : 0.8,
  }));
}