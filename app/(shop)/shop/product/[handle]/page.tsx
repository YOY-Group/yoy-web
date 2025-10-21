import Image from "next/image";
import dynamic from "next/dynamic";
import { shopifyFetch } from "@/lib/shopify/client";
import { PRODUCT_BY_HANDLE } from "@/lib/shopify/queries";
import Price from "@/components/commerce/Price";
import { InventoryMeter } from "@/components/commerce/InventoryMeter";
import Countdown from "@/components/commerce/Countdown";

const AddToCartDrawer = dynamic(() => import("@/components/commerce/AddToCartDrawer"), { ssr: false });

export default async function Page({ params }: { params: { handle: string } }) {
  const data = await shopifyFetch<any>(PRODUCT_BY_HANDLE, { handle: params.handle });
  if (!data?.product) return <main className="container-xl py-12">Product not found.</main>;

  const p = data.product;
  const images = p.images.edges.map((e: any) => e.node);
  const variants = p.variants.edges.map((v: any) => ({ id: v.node.id, title: v.node.title }));

  const DROP_END_ISO = new Date(Date.now() + 5 * 24 * 3600 * 1000).toISOString();

  return (
    <main className="container-xl py-12 grid md:grid-cols-2 gap-12">
      <div className="space-y-4">
        {images[0] && (
          <div className="relative aspect-[4/5] w-full overflow-hidden rounded-2xl card">
            <Image
              src={images[0].url}
              alt={images[0].altText ?? p.title}
              fill
              className="object-cover"
              sizes="(min-width: 1024px) 50vw, 100vw"
              priority
            />
          </div>
        )}
      </div>

      <div className="space-y-6">
        <h1 className="text-3xl md:text-4xl font-medium">{p.title}</h1>
        <div className="text-xl">
          <Price amount={p.priceRange.minVariantPrice.amount} currency={p.priceRange.minVariantPrice.currencyCode} />
        </div>

        <div className="flex items-center gap-4 text-sm">
          <span className="opacity-70">Drop ends in</span>
          <Countdown endsAt={DROP_END_ISO} />
        </div>

        <InventoryMeter current={p.totalInventory} max={150} />

        <div className="text-sm opacity-80 leading-relaxed">{p.description}</div>

        <AddToCartDrawer variants={variants} />
      </div>
    </main>
  );
}