import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const key = process.env.SUPABASE_SERVICE_ROLE || '';
  if (!url || !key) {
    return NextResponse.json({ ok: false, error: 'missing supabase envs' }, { status: 503 });
  }

  const supabase = createClient(url, key, { auth: { persistSession: false } });
  const body = await req.json().catch(() => ({} as any));

  const payload = {
    job_name: body.job_name ?? 'yoy:orders',
    status: body.status ?? 'ok',
    rows_synced: body.rows_synced ?? null,
    duration_ms: body.duration_ms ?? null,
    message: body.message ?? null,
  };

  const { error } = await supabase.from('sync_logs').insert(payload);
  if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}