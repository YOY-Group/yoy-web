// app/not-found.tsx
export default function NotFound() {
  return (
    <main className="container mx-auto py-16">
      <h1 className="text-2xl font-medium">404 — Not found</h1>
      <p className="mt-2 text-muted-foreground">
        Sorry, we couldn’t find that page.
      </p>
      <a href="/shop" className="link-underline mt-6 inline-block">
        Back to shop
      </a>
    </main>
  );
}