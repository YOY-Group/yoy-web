import "@/styles/tailwind.css";
import type { Metadata } from "next";
import TrustFooter from "@/components/TrustFooter";
import { SITE, urls } from "@/lib/siteMeta";

export const metadata: Metadata = {
  title: { default: SITE.brand, template: "%s — YOY" },
  description: SITE.description,
  metadataBase: urls.baseHttps(
    // On Preview, Next uses VERCEL_URL for absolute URLs
    process.env.VERCEL_ENV === "production" ? SITE.domain : process.env.VERCEL_URL
  ),
  alternates: {
    canonical: "/", // homepage canonical
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-white text-neutral-900">
        {children}
        <TrustFooter />
      </body>
    </html>
  );
}