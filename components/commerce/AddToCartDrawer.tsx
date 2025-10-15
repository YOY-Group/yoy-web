"use client";
import { useState } from "react";
import CartDrawer from "./CartDrawer";

type VariantOpt = { id: string; title: string };

export default function AddToCartDrawer({ variants }: { variants: VariantOpt[] }) {
  const [variantId, setVariantId] = useState(variants[0]?.id ?? "");
  const [open, setOpen] = useState(false);
  const [cart, setCart] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  async function onAdd(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    try {
      const fd = new FormData();
      fd.set("variantId", variantId);
      fd.set("quantity", "1");
      const res = await fetch("/api/cart/add", { method: "POST", body: fd });
      const json = await res.json();
      setCart(json.cart);
      setOpen(true);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <div className="space-y-3">
        <select
          className="border rounded p-2 w-full"
          value={variantId}
          onChange={(e) => setVariantId(e.target.value)}
        >
          {variants.map(v => <option key={v.id} value={v.id}>{v.title}</option>)}
        </select>

        <form onSubmit={onAdd} className="space-y-2">
          <button disabled={!variantId || loading} type="submit" className="w-full rounded px-4 py-3 border">
            {loading ? "Adding..." : "Add to bag"}
          </button>
        </form>
      </div>

      <CartDrawer open={open} onOpenChange={setOpen} cart={cart} />
    </>
  );
}