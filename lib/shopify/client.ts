// apps/web/lib/shopify/client.ts
import "server-only";                  // guarantees server usage
import { ENV } from "@/lib/server/env";

type NextFetchInit = RequestInit & {
  next?: { revalidate?: number | false; tags?: string[] };
};

export async function shopifyFetch<T>(
  query: string,
  variables?: Record<string, any>,
  { revalidate = 60 }: { revalidate?: number } = {}
) {
  const domain = process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN!;
  const token = ENV.SHOPIFY_STOREFRONT_API_TOKEN!;
  if (!domain || !token) throw new Error("Missing Shopify env vars");

  const init: NextFetchInit = {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Shopify-Storefront-Access-Token": token,
    },
    body: JSON.stringify({ query, variables }),
    next: { revalidate },            // TS now happy
  };

  const res = await fetch(`https://${domain}/api/2024-07/graphql.json`, init);

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Shopify error ${res.status}: ${text}`);
  }
  const json = await res.json() as { data: T; errors?: unknown };
  if ((json as any).errors) throw new Error(JSON.stringify((json as any).errors));
  return json.data;
}