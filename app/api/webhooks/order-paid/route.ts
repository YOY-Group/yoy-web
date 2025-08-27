import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { createHmac, timingSafeEqual } from 'crypto';

const SHOPIFY_WEBHOOK_SECRET = process.env.SHOPIFY_WEBHOOK_SECRET!;
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_SERVICE_ROLE = process.env.SUPABASE_SERVICE_ROLE!;

function verifyShopifyHmac(raw: string, header: string | null) {
  if (!header) return false;
  const computed = createHmac('sha256', SHOPIFY_WEBHOOK_SECRET)
    .update(raw, 'utf8')
    .digest('base64');
  try {
    return timingSafeEqual(Buffer.from(computed), Buffer.from(header));
  } catch {
    return false;
  }
}

export async function POST(req: Request) {
  const raw = await req.text();

  // 1) Verify signature against the *raw* body
  const hmacHeader = req.headers.get('x-shopify-hmac-sha256');
  if (!verifyShopifyHmac(raw, hmacHeader)) {
    return new NextResponse('Invalid HMAC', { status: 401 });
  }

  // 2) Parse JSON safely
  let o: any;
  try {
    o = JSON.parse(raw);
  } catch {
    return new NextResponse('Bad JSON', { status: 400 });
  }

  // 3) Write to Supabase
  const sb = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE);

  // (Optional) also keep a copy in public.events for auditing
  await sb.from('events').insert({
    type: 'shopify_order_paid',
    payload_jsonb: { id: o?.id, raw: o },
  });

  // Map Shopify → shopify_orders columns you showed in your table definition
  const row = {
    shopify_order_id: String(o.id),
    name: o.name ?? null,
    order_number: o.order_number ?? null,
    currency: o.currency ?? null,
    total_price: o.total_price ? Number(o.total_price) : null,
    subtotal_price: o.subtotal_price ? Number(o.subtotal_price) : null,
    total_tax: o.total_tax ? Number(o.total_tax) : null,
    total_discounts: o.total_discounts ? Number(o.total_discounts) : null,
    financial_status: o.financial_status ?? null,
    fulfillment_status: o.fulfillment_status ?? null,
    gateway: Array.isArray(o.payment_gateway_names) ? o.payment_gateway_names[0] : null,

    processed_at: o.processed_at ? new Date(o.processed_at).toISOString() : null,
    created_at:   o.created_at   ? new Date(o.created_at).toISOString()   : null,
    paid_at:      o.processed_at ? new Date(o.processed_at).toISOString() : null, // tweak if you prefer

    customer_id: o.customer?.id ?? null,
    customer_email: o.email ?? o.customer?.email ?? null,
    customer_phone: o.phone ?? null,

    line_items: o.line_items ?? null,
    shipping_address: o.shipping_address ?? null,
    billing_address: o.billing_address ?? null,

    raw: { raw: o }, // jsonb
    source: o.source_name ?? null,

    // headers that might be useful for idempotency/debug
    shop_domain: req.headers.get('x-shopify-shop-domain') ?? null,
    webhook_id:  req.headers.get('x-shopify-webhook-id') ?? null,
    shopify_topic: req.headers.get('x-shopify-topic') ?? 'orders/paid',
    shopify_processed_at: req.headers.get('x-shopify-triggered-at') ?? null,

    test: Boolean(o.test ?? false),
    payload: o, // full snapshot
  };

  // 4) Upsert on shopify_order_id
  const { error } = await sb
    .from('shopify_orders')
    .upsert(row, { onConflict: 'shopify_order_id' });

  if (error) {
    // don’t fail the webhook forever — return 200 and log
    console.error('supabase upsert error', error);
  }

  return NextResponse.json({ ok: true });
}