import type { Metadata } from "next";
import { headers } from "next/headers";

export const metadata: Metadata = {
  title: "Drops Telemetry — YOY",
  robots: { index: false }, // until verified live
  alternates: { canonical: "/drops" },
};

const DEV = process.env.NODE_ENV !== "production";

/** Build an absolute base URL that works in dev/preview/prod. */
function getBaseUrl() {
  const h = headers();
  const proto = h.get("x-forwarded-proto") ?? "http";
  const host =
    h.get("x-forwarded-host") ??
    h.get("host") ??
    `localhost:${process.env.PORT || "3000"}`;
  return `${proto}://${host}`;
}

async function getData() {
  try {
    const url = `${getBaseUrl()}/api/drops/stats`;
    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) {
      if (DEV) {
        const text = await res.text();
        throw new Error(`GET ${url} -> ${res.status}\n${text}`);
      }
      return { drops: [] };
    }

    const json = await res.json();

    // Normalize data structure (handles {drops:[]} or [])
    if (Array.isArray(json)) return { drops: json };
    if (json?.drops) return json;

    return { drops: [] };
  } catch (err) {
    if (DEV) console.error("Drops fetch error:", err);
    return { drops: [] };
  }
}

export default async function Page() {
  const { drops } = await getData();

  // Empty state
  if (!drops?.length) {
    return (
      <main className="bg-[#0b0f17] min-h-screen flex items-center justify-center text-white">
        <p className="opacity-60">No drops yet.</p>
      </main>
    );
  }

    return (
    <main className="bg-[#0b0f17] min-h-screen text-white">
      <section className="container mx-auto px-4 py-16">
        <div className="mb-8 flex items-center justify-between">
          <h1 className="text-3xl font-medium">Drops Telemetry</h1>
          <a
            href="/shop"
            className="flex items-center gap-2 text-sm font-medium text-white/70 hover:text-white transition-colors"
          >
            <span className="text-lg leading-none">←</span>
            <span>Back to Shop</span>
          </a>
        </div>

        <div className="grid md:grid-cols-3 gap-4">
          {drops.map((d: any, i: number) => (
            <div key={i} className="rounded-xl border border-white/10 bg-white/5 p-4">
              <div className="flex justify-between font-mono">
                <span className="opacity-70">Drop</span>
                <span>{d.drop}</span>
              </div>

              <div className="mt-2 flex justify-between font-mono">
                <span className="opacity-70">% Sold</span>
                <span
                  className={`tabular-nums ${
                    d.color === "green"
                      ? "text-emerald-400"
                      : d.color === "yellow"
                      ? "text-yellow-300"
                      : "text-red-400"
                  }`}
                >
                  {d.soldPct}%
                </span>
              </div>

              <div className="flex justify-between font-mono">
                <span className="opacity-70">Pairs Left</span>
                <span className="tabular-nums">{d.pairsLeft}</span>
              </div>

              <div className="mt-2 text-xs opacity-70">Last sale {d.lastSaleAgo}</div>

              <div className="mt-3 h-8 flex items-end gap-1">
                {d.spark?.map((v: number, j: number) => (
                  <div key={j} style={{ height: `${Math.max(6, v)}%` }} className="w-2 bg-white/30 rounded-sm" />
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}  