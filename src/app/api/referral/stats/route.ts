import { NextRequest, NextResponse } from 'next/server';
import { randomBytes } from 'crypto';
import { getAuthenticatedUserId, supabaseAdmin, rateLimit } from '@/lib/auth-server';

/** Generate a cryptographically random, non-guessable referral code */
function generateReferralCode(): string {
  // 5 random bytes → 10 hex chars, uppercase. Collision probability negligible at scale.
  return randomBytes(5).toString('hex').toUpperCase();
}

export async function GET(request: NextRequest) {
  // --- Rate limit: 10 requests / 60s per IP ---
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown';
  if (!(await rateLimit(`stats:${ip}`))) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
  }

  // --- Auth: derive userId from JWT, never from query params ---
  const userId = await getAuthenticatedUserId(request);
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // --- Get or create referral code ---
  const { data: profile, error: profileError } = await supabaseAdmin
    .from('profiles')
    .select('referral_code')
    .eq('id', userId)
    .single();

  if (profileError && profileError.code !== 'PGRST116') {
    console.error('profile fetch error:', profileError);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }

  let referralCode = profile?.referral_code as string | null;

  if (!referralCode) {
    // Generate unique code — retry on collision (extremely unlikely)
    let attempts = 0;
    while (!referralCode && attempts < 5) {
      const candidate = generateReferralCode();
      const { data: conflict } = await supabaseAdmin
        .from('profiles')
        .select('id')
        .eq('referral_code', candidate)
        .maybeSingle();

      if (!conflict) {
        await supabaseAdmin
          .from('profiles')
          .update({ referral_code: candidate })
          .eq('id', userId);
        referralCode = candidate;
      }
      attempts++;
    }

    if (!referralCode) {
      return NextResponse.json({ error: 'Could not generate referral code' }, { status: 500 });
    }
  }

  // --- Fetch referrals ---
  const { data: referrals, error: referralsError } = await supabaseAdmin
    .from('referral_tracking')
    .select('id, referred_id, usage_days_count, reward_granted, reward_granted_at, created_at')
    .eq('referrer_id', userId)
    .order('created_at', { ascending: false });

  if (referralsError) {
    console.error('referrals fetch error:', referralsError);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }

  const rows = referrals ?? [];

  // --- Enrich with referred user emails in one query ---
  let enriched: Array<typeof rows[0] & { referred_email: string | null }> = [];

  if (rows.length > 0) {
    const referredIds = rows.map((r) => r.referred_id);
    const { data: profiles } = await supabaseAdmin
      .from('profiles')
      .select('id, email')
      .in('id', referredIds);

    const emailMap = Object.fromEntries((profiles ?? []).map((p) => [p.id, p.email as string | null]));
    enriched = rows.map((r) => ({ ...r, referred_email: emailMap[r.referred_id] ?? null }));
  }

  // --- Belt-and-suspenders: grant any missed rewards ---
  for (const r of enriched) {
    if ((r.usage_days_count ?? 0) >= 7 && !r.reward_granted) {
      await grantReward(r.id, userId);
      r.reward_granted = true;
      r.reward_granted_at = new Date().toISOString();
    }
  }

  return NextResponse.json({
    referralCode,
    referrals: enriched,
    stats: {
      total: enriched.length,
      inProgress: enriched.filter((r) => !r.reward_granted && (r.usage_days_count ?? 0) > 0).length,
      monthsEarned: enriched.filter((r) => r.reward_granted).length,
    },
  });
}

async function grantReward(rowId: string, referrerId: string) {
  await supabaseAdmin
    .from('referral_tracking')
    .update({ reward_granted: true, reward_granted_at: new Date().toISOString() })
    .eq('id', rowId);

  const { data: sub } = await supabaseAdmin
    .from('user_subscriptions')
    .select('current_period_end')
    .eq('user_id', referrerId)
    .single();

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
