import Link from "next/link";
import Image from "next/image";
import { shopifyFetch } from "@/lib/shopify/client";

const ALL_PRODUCTS = /* GraphQL */ `
  query AllProducts($first: Int = 24) {
    products(first: $first, sortKey: CREATED_AT, reverse: true) {
      edges {
        node {
          id
          handle
          title
          featuredImage { url altText width height }
          priceRange { minVariantPrice { amount currencyCode } }
        }
      }
    }
  }
`;

export default async function Page() {
  const data = await shopifyFetch<any>(ALL_PRODUCTS, {}, { revalidate: 60 });
  const products = data?.products?.edges?.map((e: any) => e.node) ?? [];

  return (
    <main className="mx-auto max-w-screen-xl px-4 md:px-6 py-12">
      <h1 className="text-2xl mb-6">Shop</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {products.map((p: any) => (
          <Link key={p.id} href={`/shop/product/${p.handle}`} className="block group">
            {/* Constrained, consistent ratio — prevents stretching */}
            <div className="relative aspect-[4/5] w-full overflow-hidden rounded-xl">
              {p.featuredImage?.url ? (
                <Image
                  src={p.featuredImage.url}
                  alt={p.featuredImage.altText ?? p.title}
                  fill
                  className="object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                  sizes="(min-width: 1280px) 33vw, (min-width: 768px) 50vw, 100vw"
                  priority={false}
                />
              ) : (
                <div className="absolute inset-0 grid place-items-center bg-neutral-100 text-neutral-500 text-sm">
                  No image
                </div>
              )}
            </div>

            {/* Text shows because the image is no longer full-width huge */}
            <div className="mt-3 flex items-baseline justify-between">
              <span className="text-sm opacity-80">{p.title}</span>
              <span className="text-sm font-medium">
                {p.priceRange.minVariantPrice.amount} {p.priceRange.minVariantPrice.currencyCode}
              </span>
            </div>
          </Link>
        ))}
      </div>
    </main>
  );
}