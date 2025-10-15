// app/trust/returns/page.tsx
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Returns — YOY",
  description: "Our returns policy details.",
};

export default function ReturnsPage() {
  return (
    <main className="prose mx-auto py-10">
      <h1>Returns Policy</h1>
      <p>Details about our returns policy.</p>
    </main>
  );
}