// apps/web/app/(marketing)/page.tsx
import { redirect } from "next/navigation";

export const dynamic = "force-static";

export default function Page() {
  redirect("/shop"); // Temporary: send traffic to the Shop grid
  return null;
}