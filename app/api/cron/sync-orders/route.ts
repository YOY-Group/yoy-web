import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// Make sure this never statically optimizes
export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const revalidate = 0;

const {
  SHOPIFY_STORE_DOMAIN,
  SHOPIFY_ADMIN_API_VERSION = "2024-10",
  SHOPIFY_ADMIN_API_TOKEN,
  NEXT_PUBLIC_SUPABASE_URL,
  SUPABASE_SERVICE_ROLE,
} = process.env;

function badEnv() {
  return (
    !SHOPIFY_STORE_DOMAIN ||
    !SHOPIFY_ADMIN_API_VERSION ||
    !SHOPIFY_ADMIN_API_TOKEN ||
    !NEXT_PUBLIC_SUPABASE_URL ||
    !SUPABASE_SERVICE_ROLE
  );
}

export async function GET() {
  try {
    if (badEnv()) {
      return NextResponse.json(
        { ok: false, error: "Missing required envs for Admin/Supabase." },
        { status: 503 }
      );
    }

    const supabase = createClient(NEXT_PUBLIC_SUPABASE_URL!, SUPABASE_SERVICE_ROLE!, {
      auth: { persistSession: false },
    });

    // last 24h
    const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

    const url =
      `https://${SHOPIFY_STORE_DOMAIN}/admin/api/${SHOPIFY_ADMIN_API_VERSION}/orders.json` +
      `?status=any&updated_at_min=${encodeURIComponent(since)}&limit=250`;

    const r = await fetch(url, {
      headers: {
        "X-Shopify-Access-Token": SHOPIFY_ADMIN_API_TOKEN!,
        "Content-Type": "application/json",
      },
      // avoid proxy caches
      cache: "no-store",
    });

    if (!r.ok) {
      const text = await r.text();
      return NextResponse.json({ ok: false, error: "Shopify fetch failed", status: r.status, body: text }, { status: 502 });
    }

    const data = await r.json();
    const orders = (data?.orders ?? []) as any[];

    if (!orders.length) {
      return NextResponse.json({ ok: true, count: 0, message: "No orders in window" });
    }

    const rows = orders.map((o: any) => ({
      shopify_order_id: String(o.id),
      name: o.name,
      order_number: o.order_number,
      currency: o.currency,
      total_price: Number(o.total_price),
      financial_status: o.financial_status,
      fulfillment_status: o.fulfillment_status,
      customer_email: o.email,
      inserted_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      payload: o,
    }));

    const { error } = await supabase.from("shopify_orders").upsert(rows, {
      onConflict: "shopify_order_id",
    });

    if (error) {
      console.error("Supabase upsert error:", error);
      return NextResponse.json({ ok: false, error }, { status: 500 });
    }

    return NextResponse.json({ ok: true, count: rows.length });
  } catch (e: any) {
    console.error(e);
    return new NextResponse("Cron sync failed", { status: 500 });
  }
}