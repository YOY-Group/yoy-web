// apps/web/components/commerce/Badge.tsx
export default function Badge({ text }: { text: string }) {
  if (!text) return null;
  return (
    <span className="inline-flex items-center rounded-full border px-2 py-0.5 text-xs opacity-80">
      {text}
    </span>
  );
}