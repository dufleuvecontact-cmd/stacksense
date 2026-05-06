import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin, getAuthenticatedUser } from '@/lib/auth-server';

export async function POST(request: NextRequest, { params }: { params: { protocolId: string } }) {
  const user = await getAuthenticatedUser(request);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const protocolId = params.protocolId;

  const { error: fetchError } = await supabaseAdmin
    .from('protocols')
    .select('id')
    .eq('id', protocolId)
    .eq('user_id', user.id)
    .single();

  if (fetchError) {
    return NextResponse.json({ error: 'Protocol not found' }, { status: 404 });
  }

  const { error: updateError } = await supabaseAdmin
    .from('protocols')
    .update({ is_active: false, updated_at: new Date().toISOString() })
    .eq('id', protocolId);

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 });
  }

  // TODO: analytics event
  console.log('[analytics] protocol_paused', { userId: user.id, protocolId });

  return NextResponse.json({ ok: true });
}
