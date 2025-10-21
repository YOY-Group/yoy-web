// apps/web/app/shop/product/[handle]/page.tsx

import Image from "next/image";
import dynamic from "next/dynamic";
import { shopifyFetch } from "@/lib/shopify/client";
import { PRODUCT_BY_HANDLE } from "@/lib/shopify/queries";
import Price from "@/components/commerce/Price";
import Badge from "@/components/commerce/Badge";
import Countdown from "@/components/commerce/Countdown";
import { InventoryMeter } from "@/components/commerce/InventoryMeter";

const AddToCart = dynamic(() => import("@/components/commerce/AddToCart"), { ssr: false });

/* ---------- Types (minimal) ---------- */

type MF = { namespace: string; key: string; type: string; value: string };

type VariantNode = {
  id: string;
  title: string;
  availableForSale: boolean;
  quantityAvailable: number | null;
  price: { amount: string; currencyCode: string };
};

type ProductData = {
  product: {
    id: string;
    title: string;
    handle: string;
    description: string;
    totalInventory: number;
    availableForSale: boolean;
    featuredImage?: { url: string; altText: string | null; width: number; height: number } | null;
    images: { edges: { node: { url: string; altText: string | null; width: number; height: number } }[] };
    priceRange: { minVariantPrice: { amount: string; currencyCode: string } };
    variants: { edges: { node: VariantNode }[] };
    metafields: { edges: { node: MF }[] };
  } | null;
};

/* ---------- Helpers ---------- */

function mf(product: NonNullable<ProductData["product"]>, key: string) {
  return (
    product.metafields.edges.find((e) => e.node.namespace === "yoy" && e.node.key === key)?.node.value ?? null
  );
}

export default async function Page({ params }: { params: { handle: string } }) {
  const data = await shopifyFetch<ProductData>(PRODUCT_BY_HANDLE, { handle: params.handle });
  if (!data.product) return <main className="container py-12">Product not found.</main>;

  const p = data.product;

  // Metafields
  const limitedEdition = mf(p, "limited_edition") === "true";
  const editionEndAt = mf(p, "edition_end_at"); // ISO string or null
  const editionSize = mf(p, "edition_size") ? Number(mf(p, "edition_size")) : null;
  const printTheme = mf(p, "print_theme");
  const vibeTagline = mf(p, "vibe_tagline");
  const archetype = mf(p, "archetype");
  const dropTier = mf(p, "drop_tier");
  const badge = mf(p, "badge");
  const showInventoryFlag = mf(p, "show_inventory") === "true";
  const inventoryMax = mf(p, "inventory_meter_max") ? Number(mf(p, "inventory_meter_max")) : null;

  // Images & Variants
  const images = p.images.edges.map((e) => e.node);
  const variants = p.variants.edges.map((v) => ({ id: v.node.id, title: v.node.title }));

  // Inventory meter rules
  const shouldShowInventory = showInventoryFlag || limitedEdition;
  // Use explicit max, else edition size, else clamp to totalInventory
  const meterMax = Math.max((inventoryMax ?? editionSize ?? p.totalInventory ?? 0), 1);
  const current = Math.min(p.totalInventory, meterMax);

  return (
    <main className="container py-12 grid gap-10 md:grid-cols-2">
      {/* Media column */}
      <div className="space-y-4">
        {images[0] && (
          <div className="relative w-full aspect-square overflow-hidden rounded-2xl border">
            <Image
              src={images[0].url}
              alt={images[0].altText ?? p.title}
              fill
              sizes="(min-width: 768px) 50vw, 100vw"
              className="object-cover"
              priority
            />
          </div>
        )}

        {images.length > 1 && (
          <div className="grid grid-cols-5 gap-2">
            {images.slice(1, 6).map((img) => (
              <div key={img.url} className="relative aspect-square overflow-hidden rounded border">
                <Image src={img.url} alt={img.altText ?? p.title} fill className="object-cover" />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Content column */}
      <div className="space-y-6">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <h1 className="text-3xl md:text-4xl font-medium">{p.title}</h1>
            {!!badge && <Badge text={badge} />}
          </div>

          {vibeTagline && <p className="text-sm text-muted-foreground">{vibeTagline}</p>}

          <div className="text-xl">
            <Price amount={p.priceRange.minVariantPrice.amount} currency={p.priceRange.minVariantPrice.currencyCode} />
          </div>
        </div>

        {/* Edition / countdown */}
        {limitedEdition && (
          <div className="space-y-2">
            {!!editionEndAt && <Countdown endsAt={editionEndAt} />}
            {editionSize && (
              <div className="text-xs text-muted-foreground">Edition size: {editionSize.toLocaleString()}</div>
            )}
            {!!dropTier && <div className="text-xs text-muted-foreground">Tier: {dropTier}</div>}
          </div>
        )}

        {/* Inventory meter */}
        {shouldShowInventory && meterMax > 0 && <InventoryMeter current={current} max={meterMax} />}

        {/* Narrative bits */}
        <div className="space-y-1 text-sm text-muted-foreground">
          {printTheme && (
            <div>
              <span className="font-medium text-foreground">Theme:</span> {printTheme}
            </div>
          )}
          {archetype && (
            <div>
              <span className="font-medium text-foreground">Archetype:</span> {archetype}
            </div>
          )}
        </div>

        {/* Description */}
        {!!p.description && <div className="text-sm leading-relaxed">{p.description}</div>}

        {/* ATC */}
        <AddToCart variants={variants} />
      </div>
    </main>
  );
}