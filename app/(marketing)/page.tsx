// apps/web/app/(marketing)/page.tsx
import { redirect } from "next/navigation";

export const dynamic = "force-static";

export default function Page() {
  // Only redirect on Vercel Preview or Development
  if (process.env.VERCEL_ENV !== "production") {
    redirect("/shop");
  }
  return (
    <main className="container mx-auto py-16">
      <h1 className="text-3xl font-medium">Marketing Landing</h1>
      <p className="mt-4 text-muted-foreground">
        (In production this will be a proper hero; in preview we redirect to /shop.)
      </p>
    </main>
  );
}