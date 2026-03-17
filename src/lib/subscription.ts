/**
 * getUserSubscriptionStatus — single source of truth for subscription state.
 *
 * Checks user_subscriptions (Stripe) AND profiles.premium_until (referral rewards).
 * Returns a clean status object with isPremium, premiumUntil, and source.
 *
 * Use this in API routes that need to gate features server-side.
 * The client-side hook useSubscription() is the UI equivalent.
 */

import { createClient } from "@supabase/supabase-js";

export type SubscriptionStatus = {
  isPremium: boolean;
  premiumUntil: Date | null;
  source: "paid" | "referral" | "trial" | "free";
  stripeSubscriptionId?: string;
  cancelAtPeriodEnd?: boolean;
};

// Lazy-init admin client (server-side only)
function getAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

export async function getUserSubscriptionStatus(
  userId: string
): Promise<SubscriptionStatus> {
  const supabaseAdmin = getAdmin();

  const [subResult, profileResult] = await Promise.all([
    supabaseAdmin
      .from("user_subscriptions")
      .select("plan_type, subscription_status, current_period_end, stripe_subscription_id, cancel_at_period_end")
      .eq("user_id", userId)
      .single(),
    supabaseAdmin
      .from("profiles")
      .select("premium_until")
      .eq("id", userId)
      .single(),
  ]);

  const sub = subResult.data;
  const profile = profileResult.data;

  const now = new Date();

  // Check Stripe subscription
  const stripeActive =
    sub?.plan_type === "premium" &&
    (sub.subscription_status === "active" || sub.subscription_status === "trialing") &&
    (sub.current_period_end ? new Date(sub.current_period_end) > now : true);

  // Check referral-based premium (profiles.premium_until)
  const referralActive =
    !!profile?.premium_until && new Date(profile.premium_until) > now;

  const isPremium = stripeActive || referralActive;

  let premiumUntil: Date | null = null;
  let source: SubscriptionStatus["source"] = "free";

  if (stripeActive && sub?.current_period_end) {
    premiumUntil = new Date(sub.current_period_end);
    source = sub.subscription_status === "trialing" ? "trial" : "paid";
  } else if (referralActive && profile?.premium_until) {
    premiumUntil = new Date(profile.premium_until);
    source = "referral";
  }

  return {
    isPremium,
    premiumUntil,
    source,
    stripeSubscriptionId: sub?.stripe_subscription_id ?? undefined,
    cancelAtPeriodEnd: sub?.cancel_at_period_end ?? false,
  };
}
