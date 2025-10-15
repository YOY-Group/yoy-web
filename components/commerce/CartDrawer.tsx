"use client";
import Image from "next/image";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";

export default function CartDrawer({
  open, onOpenChange, cart,
}: { open: boolean; onOpenChange: (v: boolean) => void; cart: any }) {
  const items = cart?.lines?.edges ?? [];
  const subtotal = cart?.cost?.subtotalAmount;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-[420px] sm:w-[480px]">
        <SheetHeader>
          <SheetTitle>Bag</SheetTitle>
        </SheetHeader>

        <div className="mt-6 space-y-4">
          {items.length === 0 && <p className="text-sm opacity-75">Your bag is empty.</p>}
          {items.map(({ node }: any) => {
            const m = node.merchandise;
            const img = m?.product?.featuredImage;
            return (
              <div key={node.id} className="flex items-center gap-4">
                {img?.url && (
                  <div className="relative h-16 w-16 overflow-hidden rounded">
                    <Image src={img.url} alt="" fill className="object-cover" />
                  </div>
                )}
                <div className="flex-1">
                  <div className="text-sm font-medium">{m?.product?.title}</div>
                  <div className="text-xs opacity-70">{m?.title} · Qty {node.quantity}</div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-6 border-t pt-4 flex items-center justify-between">
          <div className="text-sm">Subtotal</div>
          <div className="text-sm font-medium">
            {subtotal ? `${subtotal.amount} ${subtotal.currencyCode}` : "—"}
          </div>
        </div>

        {cart?.checkoutUrl && (
          <a href={cart.checkoutUrl} className="mt-4 block w-full rounded border px-4 py-3 text-center">
            Checkout
          </a>
        )}
      </SheetContent>
    </Sheet>
  );
}