// pages/api/webhooks/order-paid.js
import crypto from 'crypto'
import { createClient } from '@supabase/supabase-js'

export const config = { api: { bodyParser: false } } // do NOT parse JSON

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_SERVICE_ROLE = process.env.SUPABASE_SERVICE_ROLE
const SHOPIFY_WEBHOOK_SECRET = process.env.SHOPIFY_WEBHOOK_SECRET  // == Admin "API secret key" (client secret)

function timingSafeEq(a, b) {
  try {
    return a.length === b.length && crypto.timingSafeEqual(a, b)
  } catch {
    return false
  }
}

async function readRaw(req) {
  const chunks = []
  for await (const c of req) chunks.push(c)
  return Buffer.concat(chunks)
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end('Method Not Allowed')

  // 1) Read raw body first
  const raw = await readRaw(req)

  // 2) Verify HMAC exactly as Shopify expects (base64 of sha256(secret, rawBody))
  const header = req.headers['x-shopify-hmac-sha256'] || ''
  const theirSig = Buffer.from(header, 'base64')                       // header is base64
  const ourSig   = crypto.createHmac('sha256', SHOPIFY_WEBHOOK_SECRET) // secret = Admin "API secret key"
                        .update(raw)                                   // IMPORTANT: raw Buffer, not string
                        .digest()

  if (!SHOPIFY_WEBHOOK_SECRET || !timingSafeEq(ourSig, theirSig)) {
    console.warn('webhook_hmac_fail', {
      haveSecret: !!SHOPIFY_WEBHOOK_SECRET,
      hLen: header.length,
      t: req.headers['x-shopify-topic']
    })
    return res.status(401).end('Invalid HMAC')
  }

  // 3) Safe to parse after verification
  let payload = {}
  try { payload = JSON.parse(raw.toString('utf8')) } catch {}

  // 4) Minimal normalize & store
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

  return res.status(200).json({ ok: true })
}