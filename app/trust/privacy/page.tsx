// app/trust/privacy/page.tsx
import type { Metadata } from "next";
export const metadata: Metadata = { title: "Privacy — YOY", description: "Our privacy policy details." };
export default function PrivacyPage() {
  return (
    <main className="prose mx-auto py-10">
      <h1>Privacy Policy</h1>
      <p>Details about our privacy practices.</p>
    </main>
  );
}