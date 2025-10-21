import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { shopifyFetch } from "@/lib/shopify/client";
import { CART_QUERY } from "@/lib/shopify/queries";

const CART_COOKIE = "yoy_cart_id";

export async function GET() {
  try {
    const cartId = (await cookies()).get(CART_COOKIE)?.value;
    if (!cartId) return NextResponse.json({ cart: null });
    const data = await shopifyFetch<any>(CART_QUERY, { cartId });
    return NextResponse.json({ cart: data.cart });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? "Cart get failed" }, { status: 500 });
  }
}