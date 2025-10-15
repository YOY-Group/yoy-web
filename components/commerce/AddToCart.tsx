// apps/web/components/commerce/AddToCart.tsx
"use client";
import { useState } from "react";

type VariantOpt = { id: string; title: string };

export default function AddToCart({ variants }: { variants: VariantOpt[] }) {
  const [variantId, setVariantId] = useState(variants[0]?.id ?? "");
  return (
    <div className="space-y-3">
      <select className="border rounded p-2 w-full" value={variantId} onChange={(e) => setVariantId(e.target.value)}>
        {variants.map(v => <option key={v.id} value={v.id}>{v.title}</option>)}
      </select>

      <form action="/app-actions/add-to-cart" method="post" className="space-y-2">
        <input type="hidden" name="variantId" value={variantId} />
        <input type="hidden" name="quantity" value="1" />
        <button type="submit" className="w-full rounded px-4 py-3 border">Add to cart</button>
      </form>
    </div>
  );
}