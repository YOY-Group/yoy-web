// apps/web/app/api/webhooks/refund-created/route.js
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

  let r;
  try { r = JSON.parse(raw); } catch { return new NextResponse('Bad JSON', { status: 400 }); }

  const sb = createClient(NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE, {
    auth: { persistSession: false },
  });

  // 1) Audit log
  try {
    await sb.from('events').insert({
      type: 'shopify_refund_created',
      payload: { id: r.id, order_id: r.order_id, raw: r },
    });
  } catch (e) {
    console.error('events insert failed:', e);
  }

  // 2) Compute refund amount (Shopify refund payload has transactions)
  const sum = (arr = [], pick = (x) => x) =>
    arr.reduce((acc, x) => acc + (Number(pick(x)) || 0), 0);

  const refundAmount =
    sum(r?.transactions, (t) => t.amount) ||
    sum(r?.refund_line_items?.map((x) => x?.subtotal) ?? []);

  // 3) Update the order row with refunded_total and (optionally) financial_status
  //    We'll mark fully-refunded if the refundAmount >= total_price we currently have.
  try {
    // Get current total to determine full vs partial
    const { data: existing, error: selErr } = await sb
      .from('shopify_orders')
      .select('shopify_order_id,total_price')
      .eq('shopify_order_id', String(r.order_id))
      .maybeSingle();

    if (selErr) throw selErr;

    const updates = {
      shopify_order_id: String(r.order_id),
      refunded_total: refundAmount || null,
      refunded_at: r?.processed_at ?? r?.created_at ?? new Date().toISOString(),
      shop_domain: req.headers.get('x-shopify-shop-domain') ?? null,
      webhook_id: req.headers.get('x-shopify-webhook-id') ?? null,
      shopify_topic: req.headers.get('x-shopify-topic') ?? 'refunds/create',
      // keep the full refund event on the order for convenience as well
      payload: r,
    };

    if (existing?.total_price != null && refundAmount != null) {
      const isFull = Number(refundAmount) >= Number(existing.total_price);
      if (isFull) updates.financial_status = 'refunded';
    }

    const { error: upErr } = await sb
      .from('shopify_orders')
      .upsert(updates, { onConflict: 'shopify_order_id' });

    if (upErr) throw upErr;
  } catch (e) {
    console.error('refund-created upsert failed:', e);
    return new NextResponse('DB error', { status: 500 });
  }

  return NextResponse.json({ ok: true });
}