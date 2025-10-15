import "@/styles/tailwind.css";

export const metadata = {
  title: "YOY — Sensual Systems",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-white text-neutral-900">
        {children}

        {/* ─────────────── TRUST FOOTER ─────────────── */}
        <footer className="border-t border-gray-200 bg-gray-900 text-white mt-24">
          <nav className="container mx-auto flex flex-wrap justify-center gap-6 py-8 text-sm opacity-90">
            <a href="/trust/shipping" className="hover:underline">
              Shipping
            </a>
            <a href="/trust/returns" className="hover:underline">
              Returns
            </a>
            <a href="/trust/privacy" className="hover:underline">
              Privacy
            </a>
            <a href="/trust/terms" className="hover:underline">
              Terms
            </a>
            <a href="/trust/contact" className="hover:underline">
              Contact
            </a>
          </nav>
        </footer>
      </body>
    </html>
  );
}