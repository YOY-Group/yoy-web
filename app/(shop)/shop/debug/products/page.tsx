import Link from "next/link";
import { shopifyFetch } from "@/lib/shopify/client";

const ALL_PRODUCTS = /* GraphQL */ `
  query AllProducts($first: Int = 24) {
    products(first: $first, sortKey: CREATED_AT, reverse: true) {
      edges {
        node {
          id
          handle
          title
        }
      }
    }
  }
`;

export default async function Page() {
  const data = await shopifyFetch<any>(ALL_PRODUCTS, {}, { revalidate: 0 });
  const items = data?.products?.edges?.map((e: any) => e.node) ?? [];
  return (
    <main className="container py-10">
      <h1 className="text-2xl mb-4">Debug · Products</h1>
      <ul className="space-y-2">
        {items.map((p:any)=>(
          <li key={p.id}>
            <Link className="underline" href={`/shop/product/${p.handle}`}>{p.title} — {p.handle}</Link>
          </li>
        ))}
      </ul>
      {items.length===0 && <p>No products found. Make sure your token has Storefront access + products are active.</p>}
    </main>
  );
}