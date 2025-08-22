import crypto from 'crypto'
import { createClient } from '@supabase/supabase-js'

export const config = { api: { bodyParser: false } }

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_SERVICE_ROLE = process.env.SUPABASE_SERVICE_ROLE
const RAW_SECRET = process.env.SHOPIFY_WEBHOOK_SECRET || ''

// Normalize secret (trim stray spaces/newlines)
const SHOPIFY_WEBHOOK_SECRET = RAW_SECRET.trim()

function timingSafeEq(a, b) {
  try { return a.length === b.length && crypto.timingSafeEqual(a, b) }
  catch { return false }
}

async function readRaw(req) {
  const chunks = []
  for await (const c of req) chunks.push(c)
  return Buffer.concat(chunks)
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end('Method Not Allowed')

  const raw = await readRaw(req)

  // Header can be string or array
  const h = req.headers['x-shopify-hmac-sha256']
  const header = Array.isArray(h) ? (h[0] || '') : (h || '')
  const theirSigB64 = header.trim()
  const theirSigBuf = Buffer.from(theirSigB64, 'base64')

  // Compute our signature (same encoding as header: base64)
  const ourSigB64 = crypto
    .createHmac('sha256', SHOPIFY_WEBHOOK_SECRET)
    .update(raw)            // IMPORTANT: raw Buffer
    .digest('base64')
  const ourSigBuf = Buffer.from(ourSigB64, 'base64')

  const ok = SHOPIFY_WEBHOOK_SECRET &&
             theirSigBuf.length > 0 &&
             timingSafeEq(ourSigBuf, theirSigBuf)

  if (!ok) {
    // Safe debug: only first 10 chars of base64 strings
    console.warn('webhook_hmac_fail_debug', {
      haveSecret: !!SHOPIFY_WEBHOOK_SECRET,
      topic: req.headers['x-shopify-topic'],
      shop: req.headers['x-shopify-shop-domain'],
      hdr10: theirSigB64.slice(0, 10),
      our10: ourSigB64.slice(0, 10),
      rawLen: raw.length
    })
    return res.status(401).end('Invalid HMAC')
  }

  // Verified -> parse and store
  let payload = {}
  try { payload = JSON.parse(raw.toString('utf8')) } catch {}

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE, { auth: { persistSession: false }})
  const record = {
    type: 'shopify_order_paid',
    payload: {
      topic: req.headers['x-shopify-topic'] || null,
      shopDomain: req.headers['x-shopify-shop-domain'] || null,
      id: payload?.id,
      name: payload?.name,
      email: payload?.email,
      total_price: payload?.total_price,
      currency: payload?.currency,
      line_items: payload?.line_items || [],
      raw: payload,
    },
  }
  const { error } = await supabase.from('events').insert(record)
  if (error) {
    console.error('events_insert_error', error.message)
    return res.status(500).end('DB error')
  }

  res.status(200).json({ ok: true })
}