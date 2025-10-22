import "@/styles/tailwind.css";
import type { Metadata } from "next";
import Link from "next/link";
import TrustFooter from "@/components/TrustFooter";
import { SITE, urls } from "@/lib/siteMeta";

export const metadata: Metadata = {
  title: { default: SITE.brand, template: "%s — YOY" },
  description: SITE.description,
  metadataBase: urls.baseHttps(
    process.env.VERCEL_ENV === "production" ? SITE.domain : process.env.VERCEL_URL
  ),
  alternates: { canonical: "/" },
};

function NavLink({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className="link-underline text-neutral-700 hover:text-black"
    >
      {children}
    </Link>
  );
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-white text-neutral-900">
        <header className="border-b border-gray-200">
          <div className="container mx-auto px-4 md:px-6 h-14 flex items-center justify-between">
            <Link href="/shop" className="font-medium tracking-wide">
              YOY
            </Link>
            <nav className="flex items-center gap-6 text-sm">
              <NavLink href="/shop">Shop</NavLink>
              <NavLink href="/drops">Drops</NavLink>
              {/* Shopify collections */}
              <a
                href="https://shop.yoy.group/collections/core"
                className="link-underline text-neutral-700 hover:text-black"
                rel="noopener"
              >
                Core
              </a>
              <a
                href="https://shop.yoy.group/collections/noos-core"
                className="link-underline text-neutral-700 hover:text-black"
                rel="noopener"
              >
                The First Layer
              </a>
              <a
                href="https://shop.yoy.group/collections"
                className="link-underline text-neutral-700 hover:text-black"
                rel="noopener"
              >
                Archive
              </a>
            </nav>
          </div>
        </header>

        {children}
        <TrustFooter />
      </body>
    </html>
  );
}