// apps/web/components/commerce/Countdown.tsx
"use client";

import { useEffect, useState } from "react";

export default function Countdown({ endsAt }: { endsAt: string }) {
  const [left, setLeft] = useState<string>("");

  useEffect(() => {
    if (!endsAt) {
      setLeft("");
      return;
    }

    const target = new Date(endsAt).getTime();
    const id = setInterval(() => {
      const diff = target - Date.now();
      if (diff <= 0) {
        setLeft("Ended");
        clearInterval(id);
        return;
      }
      const d = Math.floor(diff / (1000 * 60 * 60 * 24));
      const h = Math.floor((diff / (1000 * 60 * 60)) % 24);
      const m = Math.floor((diff / (1000 * 60)) % 60);
      const s = Math.floor((diff / 1000) % 60);
      setLeft(`${d}d ${h}h ${m}m ${s}s`);
    }, 1000);

    return () => clearInterval(id);
  }, [endsAt]);

  if (!left) return null;
  return (
    <div className="text-sm opacity-80">
      Drop ends in <span className="font-medium">{left}</span>
    </div>
  );
}