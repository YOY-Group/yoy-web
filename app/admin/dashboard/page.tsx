// apps/web/app/admin/dashboard/page.tsx
import supabaseAdmin from "@/lib/supabaseAdmin";

export const dynamic = "force-dynamic";

type OrderRow = {
  id: string;
  email: string | null;
  total_amount: number | null; // major units (e.g., 1.00)
  currency: string | null;
  status: string | null;
  created_at: string;
  stripe_session_id: string | null;
};

type XpRow = {
  id: string;
  kind: string | null;
  points: number | null;
  ref: string | null;
  created_at: string;
  payload: any | null;
};

type CustomerRow = {
  id: string;
  email: string | null;
  total_orders: number | null;
  total_xp: number | null;
  last_xp_at: string | null;
  created_at: string;
};

function Sparkline({ points }: { points: number[] }) {
  const w = 160;
  const h = 40;
  const max = Math.max(1, ...points);
  const step = points.length > 1 ? w / (points.length - 1) : w;
  const d = points
    .map((v, i) => {
      const x = i * step;
      const y = h - (v / max) * (h - 4) - 2;
      return `${i === 0 ? "M" : "L"}${x},${y}`;
    })
    .join(" ");
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-40 h-10">
      <path d={d} fill="none" stroke="currentColor" strokeWidth="2" />
    </svg>
  );
}

function dt(s?: string | null) {
  if (!s) return "—";
  const d = new Date(s);
  return d.toLocaleString(undefined, {
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default async function AdminDashboard() {
  // Latest Orders
  const { data: orders } = (await supabaseAdmin
    .from("orders")
    .select(
      "id,email,total_amount,currency,status,created_at,stripe_session_id"
    )
    .order("created_at", { ascending: false })
    .limit(12)) as { data: OrderRow[] | null };

  // Latest XP events
  const { data: xp } = (await supabaseAdmin
    .from("xp_events")
    .select("id,kind,points,ref,created_at,payload")
    .order("created_at", { ascending: false })
    .limit(12)) as { data: XpRow[] | null };

  // Recent customers
  const { data: customers } = (await supabaseAdmin
    .from("customers")
    .select("id,email,total_orders,total_xp,last_xp_at,created_at")
    .order("created_at", { ascending: false })
    .limit(12)) as { data: CustomerRow[] | null };

  // Orders last 24h sparkline (hour buckets)
  const sinceIso = new Date(Date.now() - 24 * 3600 * 1000).toISOString();
  const { data: hourly } = await supabaseAdmin
    .from("orders")
    .select("created_at")
    .gte("created_at", sinceIso)
    .order("created_at", { ascending: true });

  const buckets = Array.from({ length: 24 }, () => 0);
  (hourly ?? []).forEach((row: any) => {
    const msAgo = Date.now() - new Date(row.created_at).getTime();
    const hAgo = Math.floor(msAgo / (3600 * 1000));
    const idx = 23 - Math.min(23, Math.max(0, hAgo));
    buckets[idx] += 1;
  });

  const ordersShown = orders?.length ?? 0;
  const xpShown = (xp ?? []).reduce((sum, r) => sum + (r.points ?? 0), 0);

  return (
    <div className="px-6 py-8 space-y-8">
      <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">YOY Admin — Telemetry</h1>
          <p className="text-sm text-zinc-500">
            Live: Stripe → Orders → XP → CRM
          </p>
        </div>
        <div className="flex items-center gap-8">
          <div className="text-right">
            <div className="text-[11px] uppercase tracking-wide text-zinc-500">
              Orders (last 12)
            </div>
            <div className="text-2xl font-semibold">{ordersShown}</div>
          </div>
          <div className="text-right">
            <div className="text-[11px] uppercase tracking-wide text-zinc-500">
              XP minted (shown)
            </div>
            <div className="text-2xl font-semibold">{xpShown}</div>
          </div>
          <div className="flex items-center gap-2">
            <Sparkline points={buckets} />
            <div className="text-[11px] text-zinc-500 w-28">
              Orders last 24h
            </div>
          </div>
        </div>
      </header>

      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Latest Orders */}
        <div className="rounded-2xl border border-zinc-200 p-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-medium">Latest Orders</h2>
            <span className="text-xs text-zinc-500">12 most recent</span>
          </div>
          <div className="space-y-3">
            {(orders ?? []).map((o) => (
              <div
                key={o.id}
                className="flex items-center justify-between text-sm"
              >
                <div className="min-w-0">
                  <div className="truncate font-medium">
                    {o.email ?? "—"}
                  </div>
                  <div className="text-xs text-zinc-500">{dt(o.created_at)}</div>
                </div>
                <div className="text-right">
                  <div className="font-medium">
                    {typeof o.total_amount === "number"
                      ? o.total_amount.toFixed(2)
                      : "—"}{" "}
                    {o.currency?.toUpperCase()}
                  </div>
                  <div className="text-xs text-zinc-500">
                    {o.status ?? "—"}
                  </div>
                </div>
              </div>
            ))}
            {(orders ?? []).length === 0 && (
              <div className="text-sm text-zinc-500">No orders yet.</div>
            )}
          </div>
        </div>

        {/* XP Feed */}
        <div className="rounded-2xl border border-zinc-200 p-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-medium">XP Feed</h2>
            <span className="text-xs text-zinc-500">12 most recent</span>
          </div>
          <div className="space-y-3">
            {(xp ?? []).map((x) => (
              <div
                key={x.id}
                className="flex items-center justify-between text-sm"
              >
                <div>
                  <div className="font-medium">{x.kind ?? "xp"}</div>
                  <div className="text-xs text-zinc-500">{dt(x.created_at)}</div>
                </div>
                <div className="text-right">
                  <div className="font-medium">+{x.points ?? 0} XP</div>
                  <div className="text-[10px] text-zinc-500 truncate max-w-[160px]">
                    ref: {x.ref ?? "—"}
                  </div>
                </div>
              </div>
            ))}
            {(xp ?? []).length === 0 && (
              <div className="text-sm text-zinc-500">No XP events yet.</div>
            )}
          </div>
        </div>

        {/* Recent Customers */}
        <div className="rounded-2xl border border-zinc-200 p-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-medium">Recent Customers</h2>
            <span className="text-xs text-zinc-500">latest 12</span>
          </div>
          <div className="space-y-3">
            {(customers ?? []).map((c) => (
              <div
                key={c.id}
                className="flex items-center justify-between text-sm"
              >
                <div className="min-w-0">
                  <div className="truncate font-medium">{c.email ?? "—"}</div>
                  <div className="text-xs text-zinc-500">
                    XP {c.total_xp ?? 0} • Orders {c.total_orders ?? 0}
                  </div>
                </div>
                <div className="text-right text-xs text-zinc-500">
                  {c.last_xp_at ? `Last XP ${dt(c.last_xp_at)}` : "—"}
                </div>
              </div>
            ))}
            {(customers ?? []).length === 0 && (
              <div className="text-sm text-zinc-500">No customers yet.</div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}