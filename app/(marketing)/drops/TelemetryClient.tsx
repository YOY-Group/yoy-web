"use client";

import { useEffect, useState } from "react";

type Drop = {
  drop: string;
  soldPct: number;
  pairsLeft: number;
  lastSaleAgo: string;
  color: "green" | "yellow" | "red";
  spark?: number[];
};

export default function TelemetryClient() {
  const [drops, setDrops] = useState<Drop[] | null>(null);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const res = await fetch("/api/drops/stats", { cache: "no-store" });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = await res.json();
        const list = Array.isArray(json) ? json : json?.drops || [];
        if (alive) setDrops(list);
      } catch (e) {
        console.error("client fetch /api/drops/stats failed:", e);
        if (alive) setDrops([]);
      }
    })();
    return () => { alive = false; };
  }, []);

  if (drops === null) {
    return (
      <div className="min-h-[40vh] grid place-items-center text-white/60">
        Loading…
      </div>
    );
  }

  if (!drops.length) {
    return (
      <div className="min-h-[40vh] grid place-items-center text-white/60">
        No drops yet.
      </div>
    );
  }

  return (
    <section className="container mx-auto px-4 py-16">
      <h1 className="text-3xl font-medium mb-6 text-white">Drops Telemetry</h1>
      <div className="grid md:grid-cols-3 gap-4">
        {drops.map((d, i) => (
          <div key={i} className="rounded-xl border border-white/10 bg-white/5 p-4 text-white">
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
              {(d.spark ?? []).map((v, j) => (
                <div key={j} style={{ height: `${Math.max(6, v)}%` }} className="w-2 bg-white/30 rounded-sm" />
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}