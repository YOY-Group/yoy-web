export default function TrustFooter() {
  return (
    <footer className="border-t border-gray-200 bg-gray-900 text-white mt-24">
      <nav className="container mx-auto flex flex-wrap justify-center gap-6 py-8 text-sm opacity-90">
        <a href="/shipping" className="hover:underline">Shipping</a>
        <a href="/returns" className="hover:underline">Returns</a>
        <a href="/privacy" className="hover:underline">Privacy</a>
        <a href="/terms" className="hover:underline">Terms</a>
        <a href="/contact" className="hover:underline">Contact</a>
      </nav>
    </footer>
  );
}