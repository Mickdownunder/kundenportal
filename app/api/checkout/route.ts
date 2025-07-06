import { NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST() {
  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card', 'klarna'],
      line_items: [
        {
          price: 'price_1Rfnge4gc5teY2nFHPir7kdH', // Deine Preis-ID
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${process.env.NEXTAUTH_URL}/portal?payment=success`,
      cancel_url: `${process.env.NEXTAUTH_URL}/ausmess-service?payment=cancel`,
    });

    return NextResponse.json({ id: session.id });

  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
