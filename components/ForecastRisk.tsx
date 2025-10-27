// components/ForecastRisk.tsx
import { getRiskBySku } from "@/lib/forecast";

export default async function ForecastRisk({ sku }:{ sku:string }) {
  const r = await getRiskBySku(sku);
  if (!r) return <div className="text-xs opacity-60">No risk data</div>;
  const CAPS: Record<string, number> = {
  "BOXER-NOOS-BLK-M": 800,
  "BOXER-NOOS-BLK-L": 700,
  "BOXER-NOOS-WHT-M": 600,
};
const cap = CAPS[sku] ?? 600; // <- TEMP: your 48h POD capacity for this SKU/colour
  const pct = (r.demand_48h_hi / cap) * 100;
  const status = pct > 120 ? "PRE-ORDER" : pct > 90 ? "WATCH" : "GREEN";
  return (
    <div className="text-xs rounded-xl border p-3 space-y-1">
      <div className="font-medium">{sku}</div>
      <div>48h high: {Math.round(r.demand_48h_hi)}</div>
      <div className={status==="PRE-ORDER"?"text-red-600":status==="WATCH"?"text-amber-600":"text-emerald-600"}>
        {status}
      </div>
    </div>
  );
}