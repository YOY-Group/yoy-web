import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy — YOY",
  description: "How YOY collects, uses, and protects your data.",
  alternates: { canonical: "/privacy" },   // was full https://...
};

export default function Page() {
  return (
    <main className="prose mx-auto px-4 py-12">
      <h1>Privacy Policy</h1>
      <p>Last updated: 21 October 2025</p>
      <p>
        Our commerce stack is powered by Shopify. This page summarises how we process data
        and links to the authoritative Shopify-hosted policy.
      </p>
      <p>
        Read the full policy on{" "}
        <a href="https://shop.yoy.group/policies/privacy-policy">Shopify</a>.
      </p>
    </main>
  );
}
