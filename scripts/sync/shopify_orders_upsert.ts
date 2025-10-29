import "dotenv/config";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceRole = process.env.SUPABASE_SERVICE_ROLE!;

const SHOPIFY_STORE_DOMAIN = process.env.SHOPIFY_STORE_DOMAIN!;
const SHOPIFY_ADMIN_API_VERSION = process.env.SHOPIFY_ADMIN_API_VERSION || "2024-10";
const SHOPIFY_ADMIN_API_TOKEN = process.env.SHOPIFY_ADMIN_API_TOKEN!;

const supabase = createClient(supabaseUrl, supabaseServiceRole, {
  auth: { persistSession: false },
});

async function syncShopifyOrders() {
  const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
  const url =
    `https://${SHOPIFY_STORE_DOMAIN}/admin/api/${SHOPIFY_ADMIN_API_VERSION}/orders.json` +
    `?status=any&updated_at_min=${encodeURIComponent(since)}&limit=250`;

  console.log("→ Fetching Shopify orders…");
  const res = await fetch(url, {
    headers: {
      "X-Shopify-Access-Token": SHOPIFY_ADMIN_API_TOKEN,
      "Content-Type": "application/json",
    },
    cache: "no-store",
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Shopify fetch failed (${res.status}): ${body}`);
  }

  const data = await res.json();
  const orders: any[] = data?.orders ?? [];
  if (!orders.length) {
    console.log("No orders found.");
    return;
  }

  console.log(`✔ Retrieved ${orders.length} orders. Upserting…`);

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

  if (error) throw error;
  console.log("✅ Orders upserted successfully.");
}

syncShopifyOrders().catch((e) => {
  console.error("✖ Sync failed:", e);
  process.exit(1);
});