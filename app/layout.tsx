// app/layout.tsx
import "@/styles/tailwind.css";
import type { Metadata } from "next";
import Link from "next/link";
import TrustFooter from "@/components/TrustFooter";
import dynamic from "next/dynamic";
import { BrandToneProvider } from "@/components/BrandToneProvider"; // ← ADD

import { SITE, urls } from "@/lib/siteMeta";

const TonProvider = dynamic(() => import("@/components/TonProvider"), { ssr: false });
const isProd = process.env.VERCEL_ENV === "production";

export const metadata: Metadata = {
  title: { default: SITE.brand, template: "%s — YOY" },
  description: SITE.description,
  metadataBase: isProd
    ? urls.baseHttps(SITE.domain)
    : new URL(process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3100"),
  alternates: { canonical: "/" },
};

function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link href={href} className="link-underline text-neutral-700 hover:text-black">
      {children}
    </Link>
  );
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-white text-neutral-900">
        <TonProvider>
          <BrandToneProvider> {/* ← WRAP EVERYTHING */}
            <div className="min-h-[100svh] flex flex-col">
              <header className="border-b border-gray-200">
                <div className="container mx-auto px-4 md:px-6 h-14 flex items-center justify-between">
                  <Link href="/shop" className="font-medium tracking-wide">YOY</Link>
                  <nav aria-label="Primary" className="flex items-center gap-6 text-sm">
                    <NavLink href="/shop">Shop</NavLink>
                    <NavLink href="/drops">Drops</NavLink>
                    <a href="https://shop.yoy.group/collections/core" className="link-underline text-neutral-700 hover:text-black" rel="noopener noreferrer">Core</a>
                    <a href="https://shop.yoy.group/collections/noos-core" className="link-underline text-neutral-700 hover:text-black" rel="noopener noreferrer">The First Layer</a>
                    <a href="https://shop.yoy.group/collections" className="link-underline text-neutral-700 hover:text-black" rel="noopener noreferrer">Archive</a>
                  </nav>
                </div>
              </header>

              <main className="flex-1">{children}</main>
              <TrustFooter />
            </div>
          </BrandToneProvider>
        </TonProvider>
      </body>
    </html>
  );
}