import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUser, supabaseAdmin } from '@/lib/auth-server';

// This endpoint is intentionally development-only to avoid accidental production privilege escalation.
const devEnabled =
  process.env.NODE_ENV === 'development' ||
  process.env.NEXT_PUBLIC_DEV_GRANT_PREMIUM === 'true';

export async function POST(request: NextRequest) {
  if (!devEnabled) {
    return NextResponse.json({ error: 'Dev grant not enabled' }, { status: 403 });
  }

  const user = await getAuthenticatedUser(request);
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const now = new Date();

  const { data: sub } = await supabaseAdmin
    .from('user_subscriptions')
    .select('current_period_end')
    .eq('user_id', user.id)
    .maybeSingle();

  const base = new Date(
    sub?.current_period_end && new Date(sub.current_period_end) > now
      ? sub.current_period_end
      : now
  );

  base.setMonth(base.getMonth() + 1); // 1 month of premium

  const premiumUntil = base.toISOString();

  const { error: upsertError } = await supabaseAdmin
    .from('user_subscriptions')
    .upsert(
      {
        user_id: user.id,
        plan_type: 'premium',
        subscription_status: 'active',
        current_period_end: premiumUntil,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'user_id' }
    );

  if (upsertError) {
    console.error('Dev grant premium upsert error:', upsertError);
    return NextResponse.json({ error: 'Failed to set subscription state' }, { status: 500 });
  }

  const { error: profileError } = await supabaseAdmin
    .from('profiles')
    .update({ premium_until: premiumUntil })
    .eq('id', user.id);

  if (profileError) {
    console.error('Dev grant premium profile error:', profileError);
    return NextResponse.json({ error: 'Failed to update profile premium date' }, { status: 500 });
  }

  return NextResponse.json({ ok: true, premiumUntil });
}
