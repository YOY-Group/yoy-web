// apps/web/app/api/webhooks/order-paid/route.js
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { createHmac, timingSafeEqual } from 'crypto';

export const runtime = 'nodejs'; // ensure Node runtime (not Edge)

// ---- ENV VARS ----
const {
  SHOPIFY_WEBHOOK_SECRET,
  NEXT_PUBLIC_SUPABASE_URL,
  SUPABASE_SERVICE_ROLE,
} = process.env;

// ---- HMAC verify (raw body) ----
function verifyShopifyHmac(raw, header) {
  if (!header || !SHOPIFY_WEBHOOK_SECRET) return false;
  const computed = createHmac('sha256', SHOPIFY_WEBHOOK_SECRET)
    .update(raw, 'utf8')
    .digest('base64');
  try {
    return timingSafeEqual(Buffer.from(computed), Buffer.from(header));
  } catch {
    return false;
  }
}

export async function POST(req) {
  // 0) guard env
  if (!NEXT_PUBLIC_SUPABASE_URL || !SUPABASE_SERVICE_ROLE || !SHOPIFY_WEBHOOK_SECRET) {
    return new NextResponse('Missing env', { status: 500 });
  }

  // 1) read raw body
  const raw = await req.text();

  // 2) verify signature
  const hmacHeader = req.headers.get('x-shopify-hmac-sha256');
  if (!verifyShopifyHmac(raw, hmacHeader)) {
    return new NextResponse('Invalid HMAC', { status: 401 });
  }

  // 3) parse JSON
  let o;
  try {
    o = JSON.parse(raw);
  } catch {
    return new NextResponse('Bad JSON', { status: 400 });
  }

  // 4) supabase client
  const sb = createClient(NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE, {
    auth: { persistSession: false },
  });

  // 5) audit log in `events`
  try {
    await sb.from('events').insert({
      type: 'shopify_order_paid',
      payload_jsonb: { id: o.id, raw: o },
    });
  } catch (e) {
    console.error('events insert failed:', e);
  }

  // 6) map order → shopify_orders row
  const num = (v) => (v == null ? null : Number(v));
  const row = {
    shopify_order_id: String(o.id),
    name: o.name ?? null,
    order_number: o.order_number ?? null,
    currency: o.currency ?? 'GBP',

    total_price: num(o.total_price),
    subtotal_price: num(o.subtotal_price),
    total_tax: num(o.total_tax),
    total_discounts: num(o.total_discounts),

    financial_status: o.financial_status ?? null,
    fulfillment_status: o.fulfillment_status ?? null,
    gateway: Array.isArray(o.payment_gateway_names)
      ? o.payment_gateway_names[0] ?? null
      : null,

    processed_at: o.processed_at ?? null,
    created_at: o.created_at ?? null,

    customer_id: o.customer?.id ?? null,
    customer_email: o.email ?? null,
    customer_phone: o.phone ?? null,

    line_items: o.line_items ?? null,
    shipping_address: o.shipping_address ?? null,
    billing_address: o.billing_address ?? null,

    raw: { id: o.id, name: o.name }, // mini snapshot
    source: 'vercel',

    shop_domain: req.headers.get('x-shopify-shop-domain') ?? null,
    webhook_id: req.headers.get('x-shopify-webhook-id') ?? null,
    shopify_topic: req.headers.get('x-shopify-topic') ?? 'orders/paid',

    shopify_processed_at: o.processed_at ?? null,
    paid_at: o.processed_at ?? null,
    test: !!o.test,

    payload: o, // (optional full payload)
  };

  // 7) upsert order
  const { error } = await sb
    .from('shopify_orders')
    .upsert(row, { onConflict: 'shopify_order_id' });
  if (error) {
    console.error('upsert failed:', error);
    return new NextResponse('DB error', { status: 500 });
  }

  return NextResponse.json({ ok: true });
}