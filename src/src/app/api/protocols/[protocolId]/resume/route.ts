import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin, getAuthenticatedUser } from '@/lib/auth-server';
import { expandScheduleRules, DEFAULT_OCCURRENCE_WINDOW_DAYS } from '@/lib/protocol';

const OCCURRENCE_WINDOW_DAYS = DEFAULT_OCCURRENCE_WINDOW_DAYS;

export async function POST(request: NextRequest, { params }: { params: { protocolId: string } }) {
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

  const { error: updateError } = await supabaseAdmin
    .from('protocols')
    .update({ is_active: true, updated_at: new Date().toISOString() })
    .eq('id', protocolId);

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 });
  }

  // Generate next occurrences from today for existing schedules
  const { data: items } = await supabaseAdmin
    .from('protocol_items')
    .select('*')
    .eq('protocol_id', protocolId);

  const { data: rules } = await supabaseAdmin
    .from('protocol_schedule_rules')
    .select('*')
    .in('protocol_item_id', items?.map((i: any) => i.id) ?? []);

  const fromDate = new Date().toISOString().slice(0, 10);
  const toDate = new Date();
  toDate.setDate(toDate.getDate() + OCCURRENCE_WINDOW_DAYS);

  const occurrences = [];
  for (const item of items ?? []) {
    const rulesForItem = (rules ?? []).filter((r: any) => r.protocol_item_id === item.id);
    const expanded = expandScheduleRules(
      item.item_start_date ?? protocolData.start_date,
      item.item_end_date ?? protocolData.end_date ?? null,
      rulesForItem,
      fromDate,
      toDate.toISOString().slice(0, 10)
    );

    for (const occ of expanded) {
      occurrences.push({
        protocol_id: protocolId,
        protocol_item_id: item.id,
        scheduled_at: occ.scheduledAt,
        status: 'PENDING',
      });
    }
  }

  if (occurrences.length) {
    await supabaseAdmin.from('dose_occurrences').insert(occurrences);
  }

  console.log('[analytics] protocol_resumed', { userId: user.id, protocolId });

  return NextResponse.json({ ok: true });
}
