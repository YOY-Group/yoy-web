import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Prevent build-time execution errors and static optimization attempts
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
export const revalidate = 0;

export async function GET() {
  const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  // If env is missing (e.g., during local builds without secrets), do not throw — return 503 gracefully
  if (!url || !key) {
    return NextResponse.json(
      { ok: false, error: 'Supabase not configured: missing SUPABASE_URL or key' },
      { status: 503 }
    );
  }

  const supabase = createClient(url, key, { auth: { persistSession: false } });

  // TODO: implement your real sync logic here (e.g., pull orders from Shopify and persist to Supabase)
  // Keeping a harmless no-op for now so builds never trigger side effects
  return NextResponse.json({ ok: true });
}