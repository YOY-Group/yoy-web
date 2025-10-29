// apps/web/app/admin/export/customers/route.ts
import supabaseAdmin from "@/lib/supabaseAdmin";
export const dynamic = "force-dynamic";

function toCsv(rows:any[]) {
  const headers = ["created_at","email","total_orders","total_xp","last_xp_at"];
  const esc = (v:any) => v==null ? "" : `"${String(v).replace(/"/g,'""')}"`;
  return [headers.join(","), ...rows.map(r=>headers.map(h=>esc(r[h])).join(","))].join("\n");
}

export async function GET() {
  const { data } = await supabaseAdmin
    .from("customers")
    .select("created_at,email,total_orders,total_xp,last_xp_at")
    .order("created_at",{ascending:false})
    .limit(5000);

  const rows = (data ?? []) as any[];
  return new Response(toCsv(rows), {
    headers:{
      "Content-Type":"text/csv; charset=utf-8",
      "Content-Disposition":'attachment; filename="customers.csv"',
      "Cache-Control":"no-store",
    }
  });
}