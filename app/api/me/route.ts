// @ts-nocheck
// apps/web/app/api/me/route.ts
import { NextResponse } from 'next/server';
import supabaseAdmin from '@/lib/supabaseAdmin';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET() {
  const { data } = await supabaseAdmin
    .from('customers')
    .select('email,total_orders,total_xp,last_xp_at')
    .order('created_at', { ascending: false })
    .limit(1);

  return NextResponse.json({ me: data?.[0] ?? null });
}

// ensure ESM module in any TS config edge-case
export {};