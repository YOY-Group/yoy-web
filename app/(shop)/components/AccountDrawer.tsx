"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type Me = {
  email: string | null;
  total_orders: number | null;
  total_xp: number | null;
  last_xp_at: string | null;
};

function fmtDate(s?: string | null) {
  if (!s) return "—";
  return new Date(s).toLocaleString(undefined, {
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function Stat({
  label,
  value,
  small,
}: {
  label: string;
  value: any;
  small?: boolean;
}) {
  return (
    <div className="rounded-lg border p-3">
      <div className="text-[11px] uppercase tracking-wide text-zinc-500">
        {label}
      </div>
      <div className={small ? "text-xs text-zinc-700" : "text-base font-semibold"}>
        {String(value)}
      </div>
    </div>
  );
}

function AccountDrawer() {
  const [open, setOpen] = useState(false);
  const [me, setMe] = useState<Me | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open || me) return;
    setLoading(true);
    fetch("/api/me", { cache: "no-store" })
      .then((r) => r.json())
      .then((d) => setMe(d?.me ?? null))
      .catch(() => setMe(null))
      .finally(() => setLoading(false));
  }, [open, me]);

  return (
    <>
      {/* Trigger */}
      <button
        onClick={() => setOpen(true)}
        className="rounded-full border px-3 py-1.5 text-sm hover:bg-zinc-50"
        aria-label="Open account drawer"
      >
        Account
      </button>

      {/* Backdrop */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/30"
          onClick={() => setOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Drawer */}
      <aside
        className={`fixed right-0 top-0 z-50 h-full w-[360px] transform bg-white shadow-xl transition-transform duration-200 ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
        role="dialog"
        aria-label="Account"
      >
        <div className="flex items-center justify-between border-b px-4 py-3">
          <h2 className="text-base font-semibold">Your Account</h2>
          <button
            onClick={() => setOpen(false)}
            className="rounded p-2 text-zinc-500 hover:bg-zinc-100"
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        <div className="space-y-4 p-4">
          {loading && <div className="text-sm text-zinc-500">Loading…</div>}

          {!loading && !me && (
            <div className="space-y-2">
              <div className="text-sm text-zinc-600">
                Earn XP with your first order and unlock early access to Editions.
              </div>
              <Link
                href="/shop"
                className="inline-flex items-center justify-center rounded-md border px-3 py-2 text-sm hover:bg-zinc-50"
              >
                Continue shopping
              </Link>
            </div>
          )}

          {me && (
            <>
              <div className="rounded-lg border p-3 space-y-1">
                <div className="text-xs uppercase tracking-wide text-zinc-500">
                  Welcome Back
                </div>
                <div className="truncate text-sm font-medium">{me.email ?? "—"}</div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <Stat label="Orders" value={me.total_orders ?? 0} />
                <Stat label="XP" value={me.total_xp ?? 0} />
                <Stat label="Last XP" value={fmtDate(me.last_xp_at)} small />
              </div>

              <div className="rounded-lg border p-3">
                <div className="mb-1 text-sm font-medium">Early Access</div>
                <p className="text-sm text-zinc-600">
                  XP unlocks early drop previews soon.
                </p>
              </div>

              <div className="flex items-center justify-between">
                <Link href="/shop" className="text-sm underline">
                  Back to shop
                </Link>
                <button
                  onClick={() => setOpen(false)}
                  className="rounded-md border px-3 py-2 text-sm hover:bg-zinc-50"
                >
                  Close
                </button>
              </div>
            </>
          )}
        </div>
      </aside>
    </>
  );
}

export default AccountDrawer;