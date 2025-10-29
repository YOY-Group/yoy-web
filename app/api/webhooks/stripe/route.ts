// app/api/webhooks/stripe/route.ts
import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import supabaseAdmin from '@/lib/supabaseAdmin';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  return NextResponse.json({ ok: true });
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(req: NextRequest) {
  const rawBody = await req.text();
  const signature = req.headers.get('stripe-signature') as string | null;
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
      const amount = amountMinor / 100; // major units for numeric column

      // 1) CRM — ensure customer exists (by email)
      if (email) {
        const { error: custErr } = await supabaseAdmin
          .from('customers')
          .upsert(
            { email },
            { onConflict: 'email', ignoreDuplicates: false }
          );

        if (custErr) console.error('❌ customer upsert error:', custErr);
      }

      // 2) Orders ledger — idempotent on stripe_session_id
      const { error: upsertErr } = await supabaseAdmin
        .from('orders')
        .upsert(
          {
            stripe_session_id: session.id,
            stripe_payment_intent: payment_intent || null,
            email,
            total_amount: amount,
            currency: session.currency ?? null,
            status: session.payment_status ?? session.status,
            raw: session as any, // optional: keep the raw session for audit
          },
          { onConflict: 'stripe_session_id' }
        );

      if (upsertErr) {
        console.error('❌ orders upsert error:', upsertErr);
        break;
      }

      // 3) XP event — simple 1 point for paid checkout
      const { error: xpErr } = await supabaseAdmin
        .from('xp_events')
        .insert({
          kind: 'checkout_paid',
          points: 1,
          ref: session.id,
          payload: { email, pi: payment_intent },
        });

      if (xpErr) console.error('❌ xp_events insert error:', xpErr);

      console.log('✅ Checkout paid + ledgered:', session.id, email);
      break;
    }

    default: {
      console.log(`ℹ️ Unhandled Stripe event: ${event.type}`);
    }
  }

  return NextResponse.json({ received: true });
}