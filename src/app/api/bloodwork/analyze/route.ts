import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { generateBloodworkSummary, BloodworkMarker } from "@/services/ai";
import { getAuthenticatedUserId, supabaseAdmin as authSupabaseAdmin } from "@/lib/auth-server";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const FREE_QUOTA = 2; // analyses allowed before paywall

export async function POST(req: NextRequest) {
  try {
    const userId = await getAuthenticatedUserId(req);
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { data: sub } = await supabaseAdmin
      .from('user_subscriptions')
      .select('plan_type, current_period_end')
      .eq('user_id', userId)
      .maybeSingle();

    const isPremium = sub?.plan_type === 'premium' &&
      sub?.current_period_end &&
      new Date(sub.current_period_end) > new Date();

    const body = await req.json();
    const {
      bloodworkEntryId,
      date,
      markers,
      rawText,
      userContext,
    }: {
      bloodworkEntryId?: string;
      date: string;
      markers?: BloodworkMarker[];
      rawText?: string;
      userContext?: { age?: string; gender?: string; goal?: string };
    } = body;

    if (!date) {
      return NextResponse.json(
        { error: "Missing date" },
        { status: 400 }
      );
    }

    // Quota check for free users
    if (!isPremium) {
      const { data: profile } = await supabaseAdmin
        .from("profiles")
        .select("free_analyses_used")
        .eq("id", userId)
        .single();

      const used = profile?.free_analyses_used ?? 0;
      if (used >= FREE_QUOTA) {
        return NextResponse.json(
          {
            error: "free_quota_exceeded",
            message: `Free users get ${FREE_QUOTA} AI analyses. Upgrade to Premium for unlimited analysis.`,
            used,
            quota: FREE_QUOTA,
          },
          { status: 402 }
        );
      }

      // Increment counter
      await supabaseAdmin
        .from("profiles")
        .update({ free_analyses_used: used + 1 })
        .eq("id", userId);
    }

    // Run AI analysis
    const result = await generateBloodworkSummary({
      date,
      markers,
      rawText,
      userContext,
    });

    // Persist analysis to DB
    const { data: saved, error: saveError } = await supabaseAdmin
      .from("bloodwork_ai_analyses")
      .insert({
        user_id: userId,
        bloodwork_entry_id: bloodworkEntryId ?? null,
        summary: result.summary,
        key_findings: result.keyFindings,
        questions_for_doctor: result.questionsForDoctor,
        disclaimer: result.disclaimer,
        raw_markers: markers ?? [],
        analysis_date: new Date().toISOString(),
      })
      .select("id")
      .single();

    if (saveError) {
      console.error("Failed to save analysis:", saveError);
    }

    return NextResponse.json({
      id: saved?.id,
      ...result,
    });
  } catch (err: unknown) {
    console.error("bloodwork/analyze error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
