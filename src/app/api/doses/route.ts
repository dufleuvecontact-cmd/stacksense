import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin, getAuthenticatedUser } from '@/lib/auth-server';

export async function GET(request: NextRequest) {
  const user = await getAuthenticatedUser(request);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const date = searchParams.get('date');

  if (!date) {
    return NextResponse.json({ error: 'Missing date query param' }, { status: 400 });
  }

  const dayStart = new Date(`${date}T00:00:00.000Z`).toISOString();
  const dayEnd = new Date(`${date}T23:59:59.999Z`).toISOString();

  const { data: doses, error } = await supabaseAdmin
    .from('dose_occurrences')
    .select('*, protocol_id(protocols(*)), protocol_item_id(protocol_items(*))')
    .gte('scheduled_at', dayStart)
    .lte('scheduled_at', dayEnd)
    .order('scheduled_at', { ascending: true });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const filtered = (doses ?? []).filter((dose: any) => ({ userId: dose.protocol_id?.user_id }));

  // Since we cannot easily join via in json above for user's protocols, use enough guard
  const allowed = (doses ?? []).filter((dose: any) => dose.protocol_id?.user_id === user.id);

  return NextResponse.json({ doses: allowed });
}
