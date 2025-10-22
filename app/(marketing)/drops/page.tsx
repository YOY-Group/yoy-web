// app/(marketing)/drops/page.tsx
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Drops Telemetry — YOY",
  robots: { index: false }, // flip to true when live
  alternates: { canonical: "/drops" },
};

// 👇 ensure this page never gets statically prerendered on Vercel
export const dynamic = "force-dynamic";
// (alternative would be: export const revalidate = 0)

function getOrigin() {
  // Works on Vercel Preview/Prod and locally
  const PROTO =
    process.env.VERCEL_ENV ? "https" : (process.env.NODE_ENV === "production" ? "https" : "http");
  const HOST =
    process.env.VERCEL_URL ??
    process.env.NEXT_PUBLIC_SITE_URL?.replace(/^https?:\/\//, "") ??
    `localhost:${process.env.PORT || "3000"}`;
  return `${PROTO}://${HOST}`;
}

async function getData() {
  const url = `${getOrigin()}/api/drops/stats`;
  try {
    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) return { drops: [] as any[] };
    const json = await res.json();
    // normalize either {drops: [...]} or [...]
    return Array.isArray(json) ? { drops: json } : (json?.drops ? json : { drops: [] });
  } catch {
    return { drops: [] as any[] };
  }
}

export default async function Page() {
  const { drops } = await getData();

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