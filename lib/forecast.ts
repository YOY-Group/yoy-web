// lib/forecast.ts
export type ForecastRow = {
  ts: string; yhat: number; yhat_lo: number; yhat_hi: number; color: string; size: string;
};

export type RiskRow = {
  sku_id: string; color: string; size: string;
  demand_48h_median: number; demand_48h_hi: number;
};

const base = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const key  = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const headers = {
  apikey: key,
  Authorization: `Bearer ${key}`,
};

// 72h forecast
export async function getForecastBySku(sku: string): Promise<ForecastRow[]> {
  const url = `${base}/rest/v1/drop_forecast_next72_live` +
              `?sku_id=eq.${encodeURIComponent(sku)}` +
              `&select=ts,yhat,yhat_lo,yhat_hi,color,size&order=ts.asc`;
  try {
    const r = await fetch(url, { headers, next: { revalidate: 3600 } });
    if (!r.ok) throw new Error(`forecast fetch failed: ${r.status}`);
    return (await r.json()) as ForecastRow[];
  } catch {
    return [];
  }
}

// 48h risk
export async function getRiskBySku(sku: string): Promise<RiskRow | null> {
  const url = `${base}/rest/v1/drop_forecast_48h_risk?sku_id=eq.${encodeURIComponent(sku)}`;
  try {
    const r = await fetch(url, { headers, next: { revalidate: 1800 } });
    if (!r.ok) return null;
    const rows = (await r.json()) as RiskRow[];
    return rows[0] ?? null;
  } catch {
    return null;
  }
}