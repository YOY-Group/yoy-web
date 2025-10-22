import type { Metadata } from "next";
import { headers } from "next/headers";

export const metadata: Metadata = {
  title: "Drops Telemetry — YOY",
  robots: { index: false }, // flip to true when live
  alternates: { canonical: "/drops" },
};

// Build an absolute URL from the current request (works on Vercel preview/prod and locally)
function absoluteUrl(path: string) {
  const h = headers();
  const proto = h.get("x-forwarded-proto") ?? "http";
  const host  = h.get("x-forwarded-host") ?? h.get("host");
  return `${proto}://${host}${path}`;
}

async function getData() {
  try {
    const url = absoluteUrl("/api/drops/stats");
    const res = await fetch(url, { cache: "no-store" }); // dynamic on every request
    if (!res.ok) return { drops: [] };

    const json = await res.json();
    // Normalize either `{drops: [...]}` or `[...]`
    return Array.isArray(json) ? { drops: json } : (json?.drops ? json : { drops: [] });
  } catch {
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
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-3xl font-medium">Drops Telemetry</h1>
          <a href="/shop" className="inline-flex items-center gap-2 text-white/70 hover:text-white transition-colors">
            <svg aria-hidden="true" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 19l-7-7 7-7" /></svg>
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
                <span className={`tabular-nums ${
                  d.color === "green"
                    ? "text-emerald-400"
                    : d.color === "yellow"
                    ? "text-yellow-300"
                    : "text-red-400"
                }`}>
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