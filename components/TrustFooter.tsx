"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function TrustFooter() {
  const pathname = usePathname();
  const showBack = pathname !== "/shop";

  return (
    <footer className="border-t border-gray-200 bg-gray-900 text-white mt-24">
      <div className="container mx-auto flex flex-col md:flex-row md:items-center md:justify-between gap-6 py-8 text-sm opacity-90">

        {/* Left: trust links */}
        <nav className="flex flex-wrap justify-center md:justify-start gap-6">
          <Link href="/shipping" className="link-underline hover:opacity-100">
            Shipping
          </Link>
          <Link href="/returns" className="link-underline hover:opacity-100">
            Returns
          </Link>
          <Link href="/privacy" className="link-underline hover:opacity-100">
            Privacy
          </Link>
          <Link href="/terms" className="link-underline hover:opacity-100">
            Terms
          </Link>
          <Link href="/contact" className="link-underline hover:opacity-100">
            Contact
          </Link>
        </nav>

        {/* Right: Back to Shop (hidden on /shop) */}
        {showBack && (
          <Link
            href="/shop"
            aria-label="Back to Shop"
            className="inline-flex items-center gap-2 text-white/70 hover:text-white transition-colors link-underline"
          >
            <svg
              aria-hidden="true"
              className="h-4 w-4"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M15 19l-7-7 7-7" />
            </svg>
            <span>Back to Shop</span>
          </Link>
        )}
      </div>
    </footer>
  );
}