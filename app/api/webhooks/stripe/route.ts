// app/api/webhooks/stripe/route.ts
import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import supabaseAdmin from '@/lib/supabaseAdmin';
import { sendTelegram } from '@/server/telegram';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  return NextResponse.json({ ok: true });
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(req: NextRequest) {
  const rawBody = await req.text();
  const signature = req.headers.get('stripe-signature');
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

  if (!signature) {
    return new NextResponse('Missing stripe-signature header', { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
  } catch (err: any) {
    console.error('❌ Stripe signature verification failed:', err?.message);
    return new NextResponse(`Webhook Error: ${err?.message}`, { status: 400 });
  }

  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session;

      const payment_intent = (session.payment_intent ?? '') as string;
      const email =
        (typeof session.customer_details?.email === 'string'
          ? session.customer_details?.email
          : session.customer_email) || null;

      const amountMinor = session.amount_total ?? 0;
      const amountMajor = amountMinor / 100;
      const currency = (session.currency ?? '').toUpperCase();

      // 🧾 1) Upsert customer
      if (email) {
        const { error: custErr } = await supabaseAdmin
          .from('customers')
          .upsert({ email }, { onConflict: 'email', ignoreDuplicates: false });

        if (custErr) console.error('❌ customer upsert error:', custErr);
      }

      // 📦 2) Upsert order
      const { error: orderErr } = await supabaseAdmin
        .from('orders')
        .upsert(
          {
            stripe_session_id: session.id,
            stripe_payment_intent: payment_intent || null,
            email,
            total_amount: amountMajor,
            currency,
            status: session.payment_status ?? session.status,
            raw: session as any,
          },
          { onConflict: 'stripe_session_id' }
        );

      if (orderErr) {
        console.error('❌ orders upsert error:', orderErr);
        break;
      }

      // 🪙 3) XP mint
      const { error: xpErr } = await supabaseAdmin.from('xp_events').insert({
        kind: 'checkout_paid',
        points: 1,
        ref: session.id,
        payload: { email, pi: payment_intent },
      });

      if (xpErr) console.error('❌ xp_events insert error:', xpErr);

      // 🚀 4) Telegram OS signal
      try {
        const msg =
`⚡️ *YOY | WEB OPS*
*XP MINTED* — Checkout Paid  
• *Email:* ${email ?? '—'}  
• *Amount:* ${amountMajor.toFixed(2)} ${currency}  
• *Session:* \`${session.id}\`  
• *PI:* \`${payment_intent || '—'}\`

_“Your first XP minted — welcome to Layer One.”_`;

        await sendTelegram(msg);
      } catch (e) {
        console.error('⚠️ Telegram send failed:', e);
      }

      console.log('✅ Checkout paid + XP minted + CRM updated:', session.id, email);
      break;
    }

    default:
      console.log(`ℹ️ Unhandled Stripe event: ${event.type}`);
  }

  return NextResponse.json({ received: true });
}