import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Returns & Exchanges — YOY",
  description: "Our process for defects, damage, and replacements.",
  alternates: { canonical: "https://shop.yoy.group/pages/returns" },
};

export default function Page() {
  return (
    <main className="prose mx-auto px-4 py-12">
      <h1>Returns & Exchanges</h1>
      <p>Last updated: 21 October 2025</p>
      <p>We stand by the quality of every Edition. If something goes wrong, we make it right.</p>
      <ul>
        <li><strong>Defects/Damage:</strong> Email <a href="mailto:support@yoy.group">support@yoy.group</a> within 14 days with photos.</li>
        <li><strong>Packaging:</strong> Items must be returned in original packaging if required.</li>
        <li><strong>Process:</strong> Replacements ship immediately or refunds are processed.</li>
      </ul>
      <p>
        Authoritative policy lives on{" "}
        <a href="https://shop.yoy.group/pages/returns">Shopify</a>.
      </p>
    </main>
  );
}
