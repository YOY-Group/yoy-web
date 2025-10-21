import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { shopifyFetch } from "@/lib/shopify/client";
import { CART_CREATE, CART_LINES_ADD, CART_QUERY } from "@/lib/shopify/queries";

const CART_COOKIE = "yoy_cart_id";

async function ensureCartId(): Promise<string> {
  const cookie = (await cookies()).get(CART_COOKIE)?.value;
  if (cookie) return cookie;
  const res = await shopifyFetch<any>(CART_CREATE, { lines: [] });
  const id = res?.cartCreate?.cart?.id;
  if (!id) throw new Error("Failed to create cart");
  (await cookies()).set(CART_COOKIE, id, { httpOnly: true, sameSite: "lax", path: "/" });
  return id;
}

export async function POST(req: Request) {
  try {
    const form = await req.formData();
    const variantId = String(form.get("variantId"));
    const quantity = Number(form.get("quantity") ?? 1);

    const cartId = await ensureCartId();
    await shopifyFetch(CART_LINES_ADD, {
      cartId,
      lines: [{ merchandiseId: variantId, quantity }]
    });

    const data = await shopifyFetch<any>(CART_QUERY, { cartId });
    return NextResponse.json({ cart: data.cart });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? "Cart add failed" }, { status: 500 });
  }
}