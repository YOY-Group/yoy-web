export type Meta = { key: string; type: string; value: string | null }[];

export function getMetaBool(meta: Meta, key: string) {
  const m = meta.find(m => m.key === key);
  if (!m?.value) return false;
  // Storefront returns native types in JSON for some types; for safety:
  if (m.type === "boolean") return m.value === "true" || m.value === "1" || m.value === "true\n";
  return m.value === "true";
}

export function getMetaInt(meta: Meta, key: string, fallback = 0) {
  const m = meta.find(m => m.key === key);
  if (!m?.value) return fallback;
  const n = parseInt(m.value, 10);
  return Number.isFinite(n) ? n : fallback;
}

export function getMetaStr(meta: Meta, key: string, fallback = "") {
  return meta.find(m => m.key === key)?.value ?? fallback;
}

export function getMetaDate(meta: Meta, key: string): Date | null {
  const raw = meta.find(m => m.key === key)?.value;
  if (!raw) return null;
  const d = new Date(raw);
  return isNaN(+d) ? null : d;
}