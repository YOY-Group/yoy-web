import { getForecastBySku } from "@/lib/forecast";

export default async function ForecastBadge({ sku }: { sku: string }) {
  const rows = await getForecastBySku(sku);
  if (!rows.length) return <div className="text-xs opacity-60">No forecast</div>;
  const last = rows.at(-1)!;
  const band = (last.yhat_hi - last.yhat_lo).toFixed(1);
  return (
    <div className="text-xs rounded-xl border p-3 space-y-1">
      <div className="font-medium">{sku}</div>
      <div>72h median: {last.yhat.toFixed(1)}</div>
      <div className="opacity-70">
        band: {last.yhat_lo.toFixed(1)} – {last.yhat_hi.toFixed(1)} (±{band})
      </div>
    </div>
  );
}