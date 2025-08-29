// apps/web/app/api/webhooks/order-updated/route.js
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { createHmac, timingSafeEqual } from 'crypto';

export const runtime = 'nodejs';

const {
  SHOPIFY_WEBHOOK_SECRET,
  NEXT_PUBLIC_SUPABASE_URL,
  SUPABASE_SERVICE_ROLE,
} = process.env;

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
  if (!NEXT_PUBLIC_SUPABASE_URL || !SUPABASE_SERVICE_ROLE || !SHOPIFY_WEBHOOK_SECRET) {
    return new NextResponse('Missing env', { status: 500 });
  }

  const raw = await req.text();
  const hmacHeader = req.headers.get('x-shopify-hmac-sha256');
  if (!verifyShopifyHmac(raw, hmacHeader)) {
    return new NextResponse('Invalid HMAC', { status: 401 });
  }

  let o;
  try { o = JSON.parse(raw); } catch { return new NextResponse('Bad JSON', { status: 400 }); }

  const sb = createClient(NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE, {
    auth: { persistSession: false },
  });

  // 1) Audit log
  try {
    await sb.from('events').insert({
      type: 'shopify_order_updated',
      payload: { id: o.id, raw: o },
    });
  } catch (e) {
    console.error('events insert failed:', e);
  }

  // 2) Map only “mutable” fields that typically change
  const num = (v) => (v == null ? null : Number(v));
  const row = {
    shopify_order_id: String(o.id),

    // status & money fields may change post-payment
    financial_status: o.financial_status ?? null,
    fulfillment_status: o.fulfillment_status ?? null,

    total_price: num(o.total_price),
    subtotal_price: num(o.subtotal_price),
    total_tax: num(o.total_tax),
    total_discounts: num(o.total_discounts),

    // gateway sometimes appears later
    gateway: Array.isArray(o.payment_gateway_names)
      ? o.payment_gateway_names[0] ?? null
      : null,

    // contact could be edited
    customer_email: o.email ?? null,
    customer_phone: o.phone ?? null,

    // addresses/lines could update (partial shipments, edits)
    line_items: o.line_items ?? null,
    shipping_address: o.shipping_address ?? null,
    billing_address: o.billing_address ?? null,

    // headers & housekeeping
    shop_domain: req.headers.get('x-shopify-shop-domain') ?? null,
    webhook_id: req.headers.get('x-shopify-webhook-id') ?? null,
    shopify_topic: req.headers.get('x-shopify-topic') ?? 'orders/updated',

    payload: o,
  };

  // 3) Idempotent write (creates row if somehow we missed order_paid)
  const { error } = await sb
    .from('shopify_orders')
    .upsert(row, { onConflict: 'shopify_order_id' });

  if (error) {
    console.error('order-updated upsert failed:', error);
    return new NextResponse('DB error', { status: 500 });
  }

  return NextResponse.json({ ok: true });
}