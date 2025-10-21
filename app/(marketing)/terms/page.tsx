import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service — YOY",
  description: "The rules for using YOY’s site and services.",
  robots: { index: false, follow: true }, // flip to index:true once Shopify ToS exists
  // When Shopify ToS is created, add:
  // alternates: { canonical: "https://shop.yoy.group/policies/terms-of-service" },
};

export default function Page() {
  return (
    <main className="prose mx-auto px-4 py-12">
      <h1>Terms of Service</h1>
      <p>Last updated: 21 October 2025</p>

      <h2>1. Overview</h2>
      <p>These Terms govern your use of shop.yoy.group and purchases made through our store, operated by Years On Years Ltd (“YOY”, “we”, “us”).</p>

      <h2>2. Orders & Fulfilment</h2>
      <ul>
        <li>Orders are produced on demand. Estimated production & dispatch windows are shown at checkout.</li>
        <li>Limited editions may have quantity caps and staggered delivery windows.</li>
      </ul>

      <h2>3. Print-On-Demand (POD)</h2>
      <ul>
        <li>Products may be produced by vetted POD partners in the UK/EU.</li>
        <li>Quality standards and defect remediation are handled directly by YOY.</li>
        <li>Where applicable, local production may be used to reduce carbon impact.</li>
      </ul>

      <h2>4. Payments, Taxes & Duties</h2>
      <ul>
        <li>Prices are in GBP unless stated. Taxes shown at checkout. Duties may apply for international orders.</li>
      </ul>

      <h2>5. Returns & Defects</h2>
      <p>See our <a href="/returns">Returns & Exchanges</a> policy for defect handling.</p>

      <h2>6. Intellectual Property</h2>
      <p>All content, designs, and marks are property of YOY. All rights reserved.</p>

      <h2>7. Limitation of Liability</h2>
      <p>We are not liable for indirect or consequential losses to the extent permitted by law.</p>

      <h2>8. Governing Law</h2>
      <p>England & Wales. Disputes subject to the exclusive jurisdiction of English courts.</p>

      <p className="italic text-sm">
        Note: The Shopify-hosted Terms page will be linked here when published.
      </p>
    </main>
  );
}
