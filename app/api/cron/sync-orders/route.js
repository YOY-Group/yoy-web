import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const runtime = 'nodejs';

const {
  SHOPIFY_ACCESS_TOKEN,
  SHOPIFY_STORE_DOMAIN,
  NEXT_PUBLIC_SUPABASE_URL,
  SUPABASE_SERVICE_ROLE,
} = process.env;

export async function GET() {
  try {
    const sb = createClient(NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE, {
      auth: { persistSession: false },
    });

    // 1) Fetch last 24h orders from Shopify
    const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    const url = `https://${SHOPIFY_STORE_DOMAIN}/admin/api/2025-01/orders.json?status=any&updated_at_min=${since}`;

    const r = await fetch(url, {
      headers: {
        'X-Shopify-Access-Token': SHOPIFY_ACCESS_TOKEN,
        'Content-Type': 'application/json',
      },
    });
    const data = await r.json();

    if (!data.orders) {
      return NextResponse.json({ ok: false, error: 'No orders found' });
    }

    // 2) Upsert into Supabase
    const rows = data.orders.map((o) => ({
      shopify_order_id: String(o.id),
      name: o.name,
      order_number: o.order_number,
      currency: o.currency,
      total_price: Number(o.total_price),
      financial_status: o.financial_status,
      fulfillment_status: o.fulfillment_status,
      customer_email: o.email,
      inserted_at: new Date().toISOString(),
      updated_row_at: new Date().toISOString(),
      payload: o,
    }));

    const { error } = await sb
      .from('shopify_orders')
      .upsert(rows, { onConflict: 'shopify_order_id' });

    if (error) {
      console.error(error);
      return NextResponse.json({ ok: false, error });
    }

    return NextResponse.json({ ok: true, count: rows.length });
  } catch (e) {
    console.error(e);
    return new NextResponse('Cron sync failed', { status: 500 });
  }
}