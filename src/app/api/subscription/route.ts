import { NextRequest, NextResponse } from 'next/server';
import { getUserSubscriptionStatus } from '@/lib/subscription';
import { getAuthenticatedUserId } from '@/lib/auth-server';

export async function GET(request: NextRequest) {
  try {
    const userId = await getAuthenticatedUserId(request);
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const status = await getUserSubscriptionStatus(userId);

    return NextResponse.json({
      plan_type: status.isPremium ? 'premium' : 'free',
      subscription_status: status.isPremium ? 'active' : 'inactive',
      current_period_end: status.premiumUntil?.toISOString() ?? null,
      cancel_at_period_end: status.cancelAtPeriodEnd ?? false,
      source: status.source,
      stripe_subscription_id: status.stripeSubscriptionId ?? null,
    });
  } catch (error: unknown) {
    console.error('Get subscription error:', error);
    return NextResponse.json({
      plan_type: 'free',
      subscription_status: 'active',
    });
  }
}

