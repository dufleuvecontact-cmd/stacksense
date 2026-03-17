import { NextRequest, NextResponse } from 'next/server';
import { stripe, PREMIUM_PRICE_ID } from '@/lib/stripe';
import { createClient } from '@supabase/supabase-js';
import { getAuthenticatedUser } from '@/lib/auth-server';
import type Stripe from 'stripe';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser(request);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { userId, email } = user;

    const { data: existingSub } = await supabaseAdmin
      .from('user_subscriptions')
      .select('stripe_customer_id, plan_type')
      .eq('user_id', userId)
      .single();

    if (existingSub?.plan_type === 'premium') {
      return NextResponse.json({ error: 'Already subscribed to premium' }, { status: 400 });
    }

    let customerId = existingSub?.stripe_customer_id;

    if (!customerId) {
      const customer = await stripe.customers.create({
        email,
        metadata: { supabase_user_id: userId },
      });
      customerId = customer.id;

      await supabaseAdmin
        .from('user_subscriptions')
        .upsert({
          user_id: userId,
          stripe_customer_id: customerId,
          plan_type: 'free',
        }, { onConflict: 'user_id' });
    }

    const subscription = await stripe.subscriptions.create({
      customer: customerId,
      items: [{ price: PREMIUM_PRICE_ID }],
      payment_behavior: 'default_incomplete',
      payment_settings: { save_default_payment_method: 'on_subscription' },
      expand: ['latest_invoice.payment_intent'],
      metadata: { supabase_user_id: userId },
    });

      const invoice = subscription.latest_invoice as (Stripe.Invoice & { payment_intent?: Stripe.PaymentIntent }) | null;
      const paymentIntent = invoice?.payment_intent as Stripe.PaymentIntent | undefined;

    if (!paymentIntent?.client_secret) {
      return NextResponse.json({ error: 'Failed to get payment intent' }, { status: 500 });
    }

    return NextResponse.json({
      subscriptionId: subscription.id,
      clientSecret: paymentIntent.client_secret,
    });
  } catch (error: unknown) {
    console.error('Create subscription error:', error);
    const message = error instanceof Error ? error.message : 'Failed to create subscription';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
