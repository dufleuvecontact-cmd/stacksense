import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin, getAuthenticatedUser } from '@/lib/auth-server';
import { calculateAdherence } from '@/lib/protocol';

export async function GET(request: NextRequest, { params }: { params: { protocolId: string } }) {
  const user = await getAuthenticatedUser(request);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const protocolId = params.protocolId;

  const { data: protocolData, error: protocolError } = await supabaseAdmin
    .from('protocols')
    .select('*')
    .eq('id', protocolId)
    .eq('user_id', user.id)
    .single();

  if (protocolError || !protocolData) {
    return NextResponse.json({ error: 'Protocol not found' }, { status: 404 });
  }

  const { data: items } = await supabaseAdmin
    .from('protocol_items')
    .select('*')
    .eq('protocol_id', protocolId);

  const { data: rules } = await supabaseAdmin
    .from('protocol_schedule_rules')
    .select('*')
    .in('protocol_item_id', items?.map((i: any) => i.id) ?? []);

  const upcoming = await supabaseAdmin
    .from('dose_occurrences')
    .select('*')
    .eq('protocol_id', protocolId)
    .gte('scheduled_at', new Date().toISOString())
    .order('scheduled_at', { ascending: true })
    .limit(40);

  const { data: pastDoses } = await supabaseAdmin
    .from('dose_occurrences')
    .select('*')
    .eq('protocol_id', protocolId)
    .order('scheduled_at', { ascending: false })
    .limit(200);

  const adherence = calculateAdherence(pastDoses ?? []);

  return NextResponse.json({ protocol: protocolData, items, rules, upcoming: upcoming.data, past: pastDoses, adherence });
}
