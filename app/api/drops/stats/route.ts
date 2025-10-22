// app/api/drops/stats/route.ts
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";        // server runtime (not edge)
export const dynamic = "force-dynamic"; // never pre-render at build
export const revalidate = 0;

type Row = {
  drop_code: string;
  release_date: string | null;
  units_total: number | null;
  units_sold: number | null;
  last_sale_at: string | null;
  region: string | null;
};

function getSupabase() {
  const url =
    process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
  const key =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.SUPABASE_SERVICE_ROLE ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) {
    throw new Error("Supabase URL/key missing (check Vercel envs)");
  }
  return createClient(url, key);
}

function colorFor(pct: number) {
  if (pct >= 80) return "green";
  if (pct >= 40) return "yellow";
  return "red";
}

export async function GET() {
  const supabase = getSupabase();

  const { data, error } = await supabase
  .from("v_drops_telemetry")
  .select("drop_code,release_date,units_total,units_sold,last_sale_at,region")
  .order("release_date", { ascending: false })
  .limit(6)
  .returns<Row[]>();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const now = Date.now();
  const payload =
    (data ?? []).map((r) => {
      const total = r.units_total ?? 0;
      const sold = r.units_sold ?? 0;
      const pct = total > 0 ? Math.min(100, Math.round((sold / total) * 100)) : 0;
      const lastAgo =
        r.last_sale_at == null
          ? null
          : Math.max(0, Math.floor((now - Date.parse(r.last_sale_at)) / 60000));
      return {
        drop: r.drop_code,
        soldPct: pct,
        pairsLeft: Math.max(0, total - sold),
        lastSaleAgo: lastAgo == null ? "—" : lastAgo < 60 ? `${lastAgo}m` : `${Math.floor(lastAgo / 60)}h`,
        spark: [60, Math.max(1, pct / 4), Math.max(2, pct / 2), pct], // simple spark
        color: colorFor(pct),
        release: r.release_date,
        region: r.region ?? "GB",
      };
    });

  return NextResponse.json({ drops: payload });
}