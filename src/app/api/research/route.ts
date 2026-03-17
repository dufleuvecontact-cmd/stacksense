import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import Anthropic from '@anthropic-ai/sdk';
import { getAuthenticatedUserId, supabaseAdmin } from '@/lib/auth-server';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function POST(req: Request) {
  try {
    const userId = await getAuthenticatedUserId(req as any);
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { data: sub } = await supabaseAdmin
      .from('user_subscriptions')
      .select('plan_type, current_period_end')
      .eq('user_id', userId)
      .maybeSingle();

    const isPremium = sub?.plan_type === 'premium' &&
      sub?.current_period_end &&
      new Date(sub.current_period_end) > new Date();

    const { query } = await req.json();

    if (!query || typeof query !== 'string') {
      return NextResponse.json({ error: 'Invalid query' }, { status: 400 });
    }
    const sanitizedQuery = query.trim().slice(0, 2000);

    if (!process.env.ANTHROPIC_API_KEY) {
      return NextResponse.json({
        content: "AI API key is not configured.",
        source: null,
      });
    }

    const model = isPremium ? "claude-3-5-sonnet-20241022" : "claude-3-haiku-20240307";

    const message = await anthropic.messages.create({
      model,
      max_tokens: 1000,
      system: `You are the StackSense Bio-Intelligence Engine (v5.0), a world-class clinical research assistant specializing in pharmacology, endocrinology, and nutraceutical science.

Your mission is to provide rigorous, evidence-based data on supplements, peptides, and longevity compounds.

Response Architecture:
1. Mechanism of Action: Explain the molecular pathways (e.g., "Activates AMPK", "Upregulates FOXO3").
2. Clinical Utility: Summarize what the human clinical data actually says (or note if it's animal-only).
3. Optimal Dosing: Provide researched dosages and administration routes (Oral vs SC vs Intranasal).
4. Bio-Synergies: List compounds that enhance its effect.
5. Safety Profile: Explicitly mention contraindications and half-life.

Tone: Highly professional, objective, and analytical. Use scientific terminology but maintain readability.

Mandatory Disclaimer: "This information is for research purposes only. I am an AI, not a doctor. Consult a medical professional before starting any protocol."`,
      messages: [{ role: "user", content: sanitizedQuery }],
    });

    const content = message.content[0].type === "text" ? message.content[0].text : "";

    return NextResponse.json({
      content,
      source: "StackSense Research Engine (Claude)",
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function GET() {
  try {
    const { data: research, error } = await supabase
      .from('research_updates')
      .select('*')
      .order('updated_at', { ascending: false });

    if (error) throw error;

    const latestUpdate = research?.[0]?.updated_at;
    const isStale = !latestUpdate || (new Date().getTime() - new Date(latestUpdate).getTime() > 24 * 60 * 60 * 1000);

    if (isStale && research?.length > 0) {
      for (const item of research) {
        const freshDate = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
        const updatedDescription = item.description.includes('Verified on')
          ? item.description.split('Verified on')[0].trim() + ` Verified on ${freshDate}`
          : `${item.description} Verified on ${freshDate}`;

        await supabase
          .from('research_updates')
          .update({
            updated_at: new Date().toISOString(),
            description: updatedDescription,
          })
          .eq('id', item.id);
      }
    }

    return NextResponse.json({ research });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
