import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Drops Telemetry — YOY",
  robots: { index: false }, // until verified live
  alternates: { canonical: "/drops" },
};

async function getData() {
  const res = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL}/api/drops/stats`, { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to load drops");
  return res.json();
}

export default async function Page() {
  const { drops } = await getData();

  // Empty state (polish)
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
        <h1 className="text-3xl font-medium mb-6">Drops Telemetry</h1>
        <div className="grid md:grid-cols-3 gap-4">
          {drops.map((d: any) => (
            <div key={d.drop} className="rounded-xl border border-white/10 bg-white/5 p-4">
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
                {d.spark.map((v: number, i: number) => (
                  <div key={i} style={{ height: `${Math.max(6, v)}%` }} className="w-2 bg-white/30 rounded-sm" />
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}