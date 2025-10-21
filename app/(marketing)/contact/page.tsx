import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact — YOY",
  description:
    "Need help with an order or defect claim? Contact YOY support and we’ll reply within 24–48h.",
  alternates: { canonical: "https://shop.yoy.group/contact" },
};

export default function Page() {
  return (
    <main className="prose mx-auto px-4 py-12">
      <h1>Contact</h1>
      <p>
        Email <a href="mailto:support@yoy.group">support@yoy.group</a> and we’ll reply within 24–48h.
      </p>
      <p className="text-sm opacity-80">
        Include your order number and clear photos for any defect claims.
      </p>
    </main>
  );
}
