import Stripe from 'stripe';

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-10-29.clover' as const,
});

export const PREMIUM_PRICE_ID = 'price_1SigptAe1eciQd5jlhBJ1Ms0';
