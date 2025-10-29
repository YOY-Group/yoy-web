// lib/supabaseAdmin.ts
import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const url = process.env.SUPABASE_URL as string;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY as string;

if (!url || !key) {
  throw new Error(
    'Supabase admin client misconfigured: missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY'
  );
}

export const supabaseAdmin: SupabaseClient = createClient(url, key, {
  auth: { persistSession: false },
});

// also provide default for any lingering default-imports
export default supabaseAdmin;