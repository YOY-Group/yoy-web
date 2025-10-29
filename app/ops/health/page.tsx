import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";
export const revalidate = 0;

type Log = {
  id: string;
  job_name: string;
  status: string;
  rows_synced: number;
  created_at: string;
};

export default async function OpsHealthPage() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  const supabase = createClient(url, key, { auth: { persistSession: false } });

  const { data, error } = await supabase
    .from("sync_logs")
    .select("id, job_name, status, rows_synced, created_at")
    .order("created_at", { ascending: false })
    .limit(5);

  if (error) return <pre>Error: {error.message}</pre>;

  return (
    <main className="max-w-3xl mx-auto p-8">
      <h1 className="text-2xl font-bold mb-4">Ops Health</h1>
      <p className="mb-6 text-sm text-gray-500">
        Last 5 synchronization logs (from Supabase)
      </p>
      <ul className="space-y-2">
        {data?.map((log) => (
          <li key={log.id} className="p-3 border rounded-md">
            <strong>{log.job_name}</strong> — 
            {log.status === "ok" ? "✅ OK" : "⚠️ Error"} —
            {log.rows_synced ?? 0} rows — 
            {new Date(log.created_at).toLocaleString("en-GB", {
              timeZone: "Europe/London",
            })}
          </li>
        ))}
      </ul>
    </main>
  );
}