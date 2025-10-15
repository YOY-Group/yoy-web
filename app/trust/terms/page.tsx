// app/trust/terms/page.tsx
import type { Metadata } from "next";
export const metadata: Metadata = { title: "Terms — YOY", description: "Our terms of service details." };
export default function TermsPage() {
  return (
    <main className="prose mx-auto py-10">
      <h1>Terms of Service</h1>
      <p>Details about our terms of service.</p>
    </main>
  );
}