import "@/styles/tailwind.css";
import type { Metadata } from "next";
import TrustFooter from "@/components/TrustFooter";

export const metadata: Metadata = {
  title: "YOY — Sensual Systems",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-white text-neutral-900">
        {children}
        <TrustFooter />
      </body>
    </html>
  );
}