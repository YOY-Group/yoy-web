import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const key = process.env.SUPABASE_SERVICE_ROLE!;

if (!url || !key) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE in .env.local');
  process.exit(1);
}

const supabase = createClient(url, key, { auth: { persistSession: false } });

// Adjust this list to whatever tables you expect to exist
const tables = ['shopify_orders'];

(async () => {
  try {
    console.log('Connecting to Supabase:', url);
    for (const t of tables) {
      const { error, count } = await supabase.from(t).select('*', { head: true, count: 'exact' });
      if (error) {
        console.log(`• ${t}: ERROR -> ${error.code ?? ''} ${error.message}`);
      } else {
        console.log(`• ${t}: OK (rows: ${count ?? 0})`);
      }
    }
    process.exit(0);
  } catch (e: any) {
    console.error('Health check failed:', e?.message ?? e);
    process.exit(1);
  }
})();
