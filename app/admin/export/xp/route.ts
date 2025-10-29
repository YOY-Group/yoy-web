// apps/web/app/admin/export/xp/route.ts
import supabaseAdmin from "@/lib/supabaseAdmin";
export const dynamic = "force-dynamic";

function toCsv(rows:any[]) {
  const headers = ["created_at","kind","points","ref"];
  const esc = (v:any) => v==null ? "" : `"${String(v).replace(/"/g,'""')}"`;
  return [headers.join(","), ...rows.map(r=>headers.map(h=>esc(r[h])).join(","))].join("\n");
}

export async function GET() {
  const { data } = await supabaseAdmin
    .from("xp_events")
    .select("created_at,kind,points,ref")
    .order("created_at",{ascending:false})
    .limit(1000);

  const rows = (data ?? []) as any[];
  return new Response(toCsv(rows), {
    headers:{
      "Content-Type":"text/csv; charset=utf-8",
      "Content-Disposition":'attachment; filename="xp_events.csv"',
      "Cache-Control":"no-store",
    }
  });
}