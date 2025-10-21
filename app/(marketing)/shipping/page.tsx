import type { Metadata } from "next";
export const metadata: Metadata = {
  title: "Contact — YOY",
  description: "Need help with an order or defect claim? Email support@yoy.group.",
  alternates: { canonical: "/contact" },
};

export default function Page() {
  return (
    <main className="prose mx-auto px-4 py-12">
      <h1>Shipping</h1>
      <p>Dispatch windows and rates are shown at checkout. Full policy will publish with the next drop.</p>
    </main>
  );
}
