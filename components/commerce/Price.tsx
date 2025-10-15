// apps/web/components/commerce/Price.tsx
export default function Price({ amount, currency }: { amount: string; currency: string }) {
  const n = parseFloat(amount);
  const fmt = new Intl.NumberFormat(undefined, { style: "currency", currency });
  return <span>{fmt.format(n)}</span>;
}