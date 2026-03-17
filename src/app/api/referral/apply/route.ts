import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUserId, supabaseAdmin, rateLimit } from '@/lib/auth-server';

// Referral codes are exactly 10 uppercase hex chars (from crypto.randomBytes(5))
const REFERRAL_CODE_RE = /^[A-Z0-9]{6,12}$/;

// POST /api/referral/apply
// Called right after signup if the new user had a referral code.
// The new user must be authenticated — their JWT proves their identity.
// Body: { referralCode: string }
export async function POST(request: NextRequest) {
  // --- Rate limit: 10 requests / 60s per IP ---
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown';
  if (!(await rateLimit(`apply:${ip}`))) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
  }

  // --- Auth: newUserId comes from the JWT, not the request body ---
  const newUserId = await getAuthenticatedUserId(request);
  if (!newUserId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let body: { referralCode?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const rawCode = (body.referralCode ?? '').trim().toUpperCase();

  // --- Input validation ---
  if (!rawCode || !REFERRAL_CODE_RE.test(rawCode)) {
    return NextResponse.json({ error: 'Invalid referral code format' }, { status: 400 });
  }

  // --- Look up referrer by code ---
  const { data: referrer, error: lookupError } = await supabaseAdmin
    .from('profiles')
    .select('id')
    .eq('referral_code', rawCode)
    .maybeSingle();

  if (lookupError) {
    console.error('referral lookup error:', lookupError);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }

  if (!referrer) {
    return NextResponse.json({ error: 'Invalid referral code' }, { status: 404 });
  }

  // --- Self-referral guard ---
  if (referrer.id === newUserId) {
    return NextResponse.json({ error: 'Self-referral not allowed' }, { status: 400 });
  }

  // --- Duplicate guard: this new user can only be referred once ---
  const { data: existingByReferred } = await supabaseAdmin
    .from('referral_tracking')
    .select('id')
    .eq('referred_id', newUserId)
    .maybeSingle();

  if (existingByReferred) {
    // Already has a referrer — silently succeed (idempotent)
    return NextResponse.json({ ok: true, message: 'Already tracked' });
  }

  // --- Insert referral row ---
  const { error: insertError } = await supabaseAdmin
    .from('referral_tracking')
    .insert({
      referrer_id: referrer.id,
      referred_id: newUserId,
      usage_days_count: 0,
      reward_granted: false,
      created_at: new Date().toISOString(),
    });

  if (insertError) {
    console.error('referral insert error:', insertError);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }

  // Record referred_by on the new user's profile
  await supabaseAdmin
    .from('profiles')
    .update({ referred_by: referrer.id })
    .eq('id', newUserId);

  return NextResponse.json({ ok: true });
}

// PUT /api/referral/apply
// Called once per day when an authenticated user opens the app.
// Increments their usage_days_count in any active referral row.
// The userId is derived entirely from the JWT — body is empty.
export async function PUT(request: NextRequest) {
  // --- Rate limit: 10 requests / 60s per IP ---
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown';
  if (!(await rateLimit(`activity:${ip}`))) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
  }

  // --- Auth: userId from JWT ---
  const userId = await getAuthenticatedUserId(request);
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Find the active referral row for this user (unrewarded)
  const { data: row, error: rowError } = await supabaseAdmin
    .from('referral_tracking')
    .select('id, usage_days_count, referrer_id, last_activity_date')
    .eq('referred_id', userId)
    .eq('reward_granted', false)
    .maybeSingle();

  if (rowError) {
    console.error('activity row error:', rowError);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }

  if (!row) {
    return NextResponse.json({ ok: true, message: 'No active referral' });
  }

  const today = new Date().toISOString().split('T')[0];

  // Idempotent — only count once per calendar day
  if (row.last_activity_date === today) {
    return NextResponse.json({ ok: true, message: 'Already counted today' });
  }

  const newCount = (row.usage_days_count ?? 0) + 1;
  const rewardReady = newCount >= 7;

  const update: Record<string, unknown> = {
    usage_days_count: newCount,
    last_activity_date: today,
  };

  if (rewardReady) {
    update.reward_granted = true;
    update.reward_granted_at = new Date().toISOString();
  }

  const { error: updateError } = await supabaseAdmin
    .from('referral_tracking')
    .update(update)
    .eq('id', row.id);

  if (updateError) {
    console.error('activity update error:', updateError);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }

  if (rewardReady) {
    await grantReward(row.referrer_id);
  }

  return NextResponse.json({ ok: true, newCount, rewardGranted: rewardReady });
}

async function grantReward(referrerId: string) {
  const { data: sub } = await supabaseAdmin
    .from('user_subscriptions')
    .select('current_period_end')
    .eq('user_id', referrerId)
    .maybeSingle();

  const base = new Date(
    sub?.current_period_end && new Date(sub.current_period_end) > new Date()
      ? sub.current_period_end
      : new Date()
  );
  base.setDate(base.getDate() + 30);

  await supabaseAdmin
    .from('user_subscriptions')
    .upsert(
      {
        user_id: referrerId,
        plan_type: 'premium',
        subscription_status: 'active',
        current_period_end: base.toISOString(),
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'user_id' }
    );

  await supabaseAdmin
    .from('profiles')
    .update({ premium_until: base.toISOString() })
    .eq('id', referrerId);
}
