import type { Metadata } from "next";
import { urls } from "@/lib/siteMeta";

export const metadata: Metadata = {
  title: "Terms of Service — YOY",
  description:
    "Terms governing purchases from YOY, including orders, POD production, payments, and governing law.",
  // Canonical to our own page while Shopify ToS doesn't exist
  alternates: { canonical: urls.canonical("/terms") },
  // Temporary: keep out of index until final legal copy + Shopify policy exist
  robots: { index: false, follow: true },
};

export default function Page() {
  return (
    <main className="prose mx-auto px-4 py-12">
      <h1>Terms of Service</h1>
      <p>Last updated: 21 October 2025</p>

      <h2>1. Overview</h2>
      <p>
        These Terms govern your use of shop.yoy.group and purchases made through
        our store, operated by Years On Years Ltd (“YOY”, “we”, “us”).
      </p>

      <h2>2. Orders &amp; Fulfilment</h2>
      <ul>
        <li>Orders are produced on demand. Estimated production &amp; dispatch windows are shown at checkout.</li>
        <li>Limited editions may have quantity caps and staggered delivery windows.</li>
      </ul>

      <h2>3. Print-On-Demand (POD)</h2>
      <ul>
        <li>Products may be produced by vetted POD partners in the UK/EU.</li>
        <li>Quality standards and defect remediation are handled directly by YOY.</li>
        <li>Where applicable, local production may be used to reduce carbon impact.</li>
      </ul>

      <h2>4. Payments, Taxes &amp; Duties</h2>
      <ul>
        <li>Prices are in GBP unless stated. Taxes shown at checkout. Duties may apply for international orders.</li>
      </ul>

      <h2>5. Returns &amp; Defects</h2>
      <p>
        See our <a href="/returns">Returns &amp; Exchanges</a> policy for defect handling.
      </p>

      <h2>6. Intellectual Property</h2>
      <p>All content, designs, and marks are property of YOY. All rights reserved.</p>

      <h2>7. Limitation of Liability</h2>
      <p>We are not liable for indirect or consequential losses to the extent permitted by law.</p>

      <h2>8. Governing Law</h2>
      <p>England &amp; Wales. Disputes subject to the exclusive jurisdiction of English courts.</p>

      <p className="italic text-sm">
        Note: The Shopify-hosted Terms page will be linked here when published.
      </p>
    </main>
  );
}