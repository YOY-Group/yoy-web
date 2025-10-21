// apps/web/components/commerce/InventoryMeter.tsx
export function InventoryMeter({ current, max }: { current: number; max: number }) {
  const pct = Math.max(0, Math.min(100, max ? Math.round((current / max) * 100) : 0));
  return (
    <div className="w-full">
      <div className="mb-1 flex justify-between text-xs opacity-70">
        <span>Inventory</span>
        <span>
          {current} / {max}
        </span>
      </div>
      <div className="h-2 w-full rounded bg-black/10">
        <div className="h-2 rounded bg-black" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}