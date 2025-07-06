import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { headers } from 'next/headers';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

async function getRawBody(req: NextRequest) {
  const body = await req.arrayBuffer();
  return Buffer.from(body);
}

export async function POST(req: NextRequest) {
  const body = await getRawBody(req);
  const signature = headers().get('stripe-signature')!;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error';
    console.error(`Webhook-Signaturfehler: ${errorMessage}`);
    return NextResponse.json({ error: `Webhook error: ${errorMessage}` }, { status: 400 });
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;
    console.log('Zahlung erfolgreich! Webhook für Session empfangen:', session.id);
    // Hier kommt später die Logik zur Datenbank-Aktualisierung hin
  }

  return NextResponse.json({ received: true });
}
