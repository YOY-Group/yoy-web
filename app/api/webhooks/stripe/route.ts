import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// Let Stripe use your account's default API version
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function GET() {
  console.log("ℹ️ GET /api/webhooks/stripe hit");
  return NextResponse.json({ ok: true });
}

export async function POST(req: NextRequest) {
  // Pre-log to confirm the webhook is hitting the route
  console.log("➡️ Stripe webhook hit", {
    hasSignature: Boolean(req.headers.get("stripe-signature")),
  });

  const rawBody = await req.text();
  const signature = req.headers.get("stripe-signature") || "";
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
  } catch (err: any) {
    console.error("❌ Stripe signature verification failed:", err.message);
    return new NextResponse(`Webhook Error: ${err.message}`, { status: 400 });
  }

  console.log("✅ Stripe event verified:", event.type);

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      console.log("💳 Checkout paid:", session.id, session.customer_email);

      // NEXT STEPS: (will wire after we see 200)
      // 1) Upsert order into Supabase
      // 2) Insert XP event (+10)
      // 3) Trigger Telegram via n8n

      break;
    }

    case "payment_intent.succeeded": {
      console.log("💰 Payment intent succeeded");
      break;
    }

    default:
      console.log(`ℹ️ Unhandled event type: ${event.type}`);
  }

  return NextResponse.json({ received: true });
}