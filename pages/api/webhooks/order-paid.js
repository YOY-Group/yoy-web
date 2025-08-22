// apps/web/pages/api/webhooks/order-paid.js
import crypto from 'crypto';
import { createClient } from '@supabase/supabase-js';

// Do NOT expose service role on client. This only runs on the server.
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE = process.env.SUPABASE_SERVICE_ROLE;
const SHOPIFY_WEBHOOK_SECRET = process.env.SHOPIFY_WEBHOOK_SECRET;

// We need the raw body to verify HMAC
export const config = { api: { bodyParser: false } };

// Read raw body as Buffer
function readRawBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on('data', (c) => chunks.push(c));
    req.on('end', () => resolve(Buffer.concat(chunks)));
    req.on('error', reject);
  });
}

// Verify Shopify HMAC (sha256 over RAW BYTES, base64)
function verifyShopifyHmac(rawBuffer, hmacHeader, secret) {
  if (!hmacHeader || !secret) return false;
  const digest = crypto.createHmac('sha256', secret).update(rawBuffer).digest('base64');
  try {
    return crypto.timingSafeEqual(Buffer.from(digest), Buffer.from(hmacHeader));
  } catch {
    return false;
  }
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ ok: false, error: 'Method not allowed' });

  // Basic env guardrails
  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE || !SHOPIFY_WEBHOOK_SECRET) {
    return res.status(500).json({ ok: false, error: 'Server envs missing' });
  }

  try {
    const raw = await readRawBody(req); // Buffer

    const hmacHeader = req.headers['x-shopify-hmac-sha256'];
    if (!verifyShopifyHmac(raw, hmacHeader, SHOPIFY_WEBHOOK_SECRET)) {
      return res.status(401).json({ ok: false, error: 'Invalid HMAC' });
    }

    // Only parse after verifying
    let payload = null;
    try { payload = JSON.parse(raw.toString('utf8')); } catch { payload = null; }

    const topic = req.headers['x-shopify-topic'] || 'unknown';
    const shopDomain = req.headers['x-shopify-shop-domain'] || null;

    const record = {
      type: 'shopify_order_paid',
      payload: {
        topic,
        shopDomain,
        order_id: payload?.id ?? null,
        name: payload?.name ?? null,
        email: payload?.email ?? null,
        total_price: payload?.total_price ?? null,
        currency: payload?.currency ?? null,
        line_items: payload?.line_items ?? [],
        raw: payload, // keep full for now; you can trim later
      },
    };

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE, { auth: { persistSession: false } });

    // Insert as ARRAY of rows
    const { error } = await supabase.from('events').insert([record]);
    if (error) throw new Error(error.message);

    // Acknowledge quickly so Shopify doesn’t retry
    return res.status(200).json({ ok: true });
  } catch (e) {
    return res.status(500).json({ ok: false, error: e.message });
  }
}