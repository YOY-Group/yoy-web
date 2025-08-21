// apps/web/lib/supabase.js
import { createClient } from '@supabase/supabase-js';

const url  = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Fail fast if envs are missing
if (!url || !anon) {
  throw new Error('Missing Supabase env (NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY)');
}

// Browser-safe client (no session persistence needed for now)
export const supabase = createClient(url, anon, {
  auth: { persistSession: false },
});