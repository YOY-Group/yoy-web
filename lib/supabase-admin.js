import { createClient } from '@supabase/supabase-js';

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE; // server-only

if (!url || !serviceKey) throw new Error('Missing Supabase server env');

export const supabaseAdmin = createClient(url, serviceKey, {
  auth: { persistSession: false },
});