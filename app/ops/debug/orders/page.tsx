// apps/web/app/shop/debug/orders/page.tsx
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

type Row = {
  shopify_order_id: string;
  name: string;
  order_number: number;
  total_price: number | string;
  financial_status: string | null;
  customer_email: string | null;
  inserted_at: string;
};

export default async function OrdersDebugPage() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  // ✅ Server-only: prefer SERVICE_ROLE on server routes/components only.
  const key = process.env.SUPABASE_SERVICE_ROLE || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  if (!url || !key) return <pre>Missing Supabase envs</pre>;

  const supabase = createClient(url, key, { auth: { persistSession: false } });

  const { data, error } = await supabase
    .from('shopify_orders')
    .select('shopify_order_id,name,order_number,total_price,financial_status,customer_email,inserted_at')
    .order('inserted_at', { ascending: false })
    .limit(10) as unknown as { data: Row[] | null, error: { message: string } | null };

  if (error) return <pre>Supabase error: {error.message}</pre>;

  return (
    <main className="max-w-3xl mx-auto py-10 prose">
      <h1>Orders Debug</h1>
      <p>Showing latest {data?.length ?? 0} orders.</p>
      <ul>
        {data?.map((o) => (
          <li key={o.shopify_order_id}>
            <strong>#{o.order_number}</strong> — {o.name} — £{o.total_price} — {o.financial_status ?? 'n/a'} — {o.customer_email ?? 'n/a'}
          </li>
        ))}
      </ul>
    </main>
  );
}