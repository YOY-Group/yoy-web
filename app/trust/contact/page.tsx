// app/trust/contact/page.tsx
import type { Metadata } from "next";
export const metadata: Metadata = { title: "Contact — YOY", description: "How to contact us." };
export default function ContactPage() {
  return (
    <main className="prose mx-auto py-10">
      <h1>Contact Us</h1>
      <p>Details on how to contact our team.</p>
    </main>
  );
}