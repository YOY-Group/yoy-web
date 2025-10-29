// apps/web/app/admin/export/orders/route.ts
import supabaseAdmin from "@/lib/supabaseAdmin";
export const dynamic = "force-dynamic";

function toCsv(rows: any[]) {
  const headers = ["created_at","email","total_amount","currency","status","stripe_session_id"];
  const esc = (v: any) => v == null ? "" : `"${String(v).replace(/"/g,'""')}"`;
  return [headers.join(","), ...rows.map(r => headers.map(h=>esc(r[h])).join(","))].join("\n");
}

export async function GET() {
  const { data } = await supabaseAdmin
    .from("orders")
    .select("created_at,email,total_amount,currency,status,stripe_session_id")
    .order("created_at",{ascending:false})
    .limit(1000);

  const rows = (data ?? []) as any[];
  const csv = toCsv(rows);

  return new Response(csv, {
    headers: {
      "Content-Type":"text/csv; charset=utf-8",
      "Content-Disposition": 'attachment; filename="orders.csv"',
      "Cache-Control": "no-store",
    },
  });
}