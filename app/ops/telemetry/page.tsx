// web/app/ops/telemetry/page.tsx
// web/app/ops/telemetry/page.tsx
import ForecastBadge from "../../../components/ForecastBadge";
import ForecastRisk  from "../../../components/ForecastRisk";

const SKUS = ["BOXER-NOOS-BLK-M", "BOXER-NOOS-BLK-L", "BOXER-NOOS-WHT-M"];

export default function Page() {
  return (
    <main className="p-6 grid gap-6 md:grid-cols-3">
      {SKUS.map((sku) => (
        <div key={sku} className="space-y-3">
          <ForecastBadge sku={sku} />
          <ForecastRisk  sku={sku} />
        </div>
      ))}
    </main>
  );
}