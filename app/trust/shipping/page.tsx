// app/trust/shipping/page.tsx
import type { Metadata } from "next";
export const metadata: Metadata = { title: "Shipping — YOY", description: "Our shipping policy details." };
export default function ShippingPage() {
  return (
    <main className="prose mx-auto py-10">
      <h1>Shipping Policy</h1>
      <p>Details about our shipping practices.</p>
    </main>
  );
}