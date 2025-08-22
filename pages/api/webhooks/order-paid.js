// pages/api/webhooks/order-paid.js
import crypto from 'crypto';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE = process.env.SUPABASE_SERVICE_ROLE;
const SHOPIFY_WEBHOOK_SECRET = process.env.SHOPIFY_WEBHOOK_SECRET;

// ---- Next: keep the raw body so we can hash exact bytes
export const config = { api: { bodyParser: false } };

function readRawBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on('data', (c) => chunks.push(c));
    req.on('end', () => resolve(Buffer.concat(chunks)));
    req.on('error', reject);
  });
}

function safeEqual(a, b) {
  // Shopify header is base64; our digest is base64
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(Buffer.from(a), Buffer.from(b));
}

function verifyShopifyHmac(rawBuffer, hmacHeader, secret) {
  if (!hmacHeader || !secret) return false;
  // IMPORTANT: hash the raw bytes (Buffer), NOT a JSON/string that may change bytes
  const digest = crypto.createHmac('sha256', secret).update(rawBuffer).digest('base64');
  return safeEqual(digest, hmacHeader);
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ ok: false, error: 'Method not allowed' });

  try {
    const raw = await readRawBody(req);
    const hmacHeader = req.headers['x-shopify-hmac-sha256'];
    const topic = req.headers['x-shopify-topic'] || 'unknown';
    const shopDomain = req.headers['x-shopify-shop-domain'] || null;

    const ok = verifyShopifyHmac(raw, hmacHeader || '', SHOPIFY_WEBHOOK_SECRET || '');
    if (!ok) {
      // DEBUG (safe): shows lengths only, not secrets
      console.log('webhook_hmac_fail', {
        haveSecret: !!SHOPIFY_WEBHOOK_SECRET,
        hLen: (hmacHeader || '').length,
        t: topic,
      });
      return res.status(401).json({ ok: false, error: 'Invalid HMAC' });
    }

    const payload = JSON.parse(raw.toString('utf8'));

    const record = {
      type: 'shopify_order_paid',
      payload: {
        topic,
        shopDomain,
        id: payload?.id,
        name: payload?.name,
        email: payload?.email,
        total_price: payload?.total_price,
        currency: payload?.currency,
        line_items: payload?.line_items || [],
        raw: payload,
      },
    };

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE, { auth: { persistSession: false } });
    const { error } = await supabase.from('events').insert(record);
    if (error) throw new Error(error.message);

    return res.status(200).json({ ok: true });
  } catch (e) {
    console.error('webhook_error', e.message);
    return res.status(500).json({ ok: false, error: e.message });
  }
}