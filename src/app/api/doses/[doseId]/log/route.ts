import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin, getAuthenticatedUser } from '@/lib/auth-server';

const PREMATURE_HOURS_LIMIT = 4;

export async function POST(request: NextRequest, { params }: { params: { doseId: string } }) {
  const user = await getAuthenticatedUser(request);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const doseId = params.doseId;
  const body = await request.json();
  const action = body.action as 'TAKEN' | 'SKIPPED' | 'SNOOZED';

  if (!['TAKEN', 'SKIPPED', 'SNOOZED'].includes(action)) {
    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  }

  const { data: dose } = await supabaseAdmin
    .from('dose_occurrences')
    .select('*, protocol_id(*)')
    .eq('id', doseId)
    .single();

  if (!dose || !dose.protocol_id) {
    return NextResponse.json({ error: 'Dose occurrence not found' }, { status: 404 });
  }

  if (dose.protocol_id.user_id !== user.id) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const scheduledAt = new Date(dose.scheduled_at);
  const now = new Date();
  const tooEarly = scheduledAt.getTime() - now.getTime() > PREMATURE_HOURS_LIMIT * 3600 * 1000;

  if (action === 'TAKEN' && tooEarly) {
    return NextResponse.json({ error: `Can not mark as taken more than ${PREMATURE_HOURS_LIMIT} hours early` }, { status: 400 });
  }

  const update: any = { status: action, updated_at: new Date().toISOString() };

  if (action === 'TAKEN') {
    update.taken_at = now.toISOString();
    update.skipped_reason = null;
    update.snoozed_until = null;
  } else if (action === 'SKIPPED') {
    update.skipped_reason = body.reason ?? null;
    update.taken_at = null;
    update.snoozed_until = null;
  } else if (action === 'SNOOZED') {
    const snoozeMinutes = Number(body.snoozeMinutes ?? 15);
    if (Number.isNaN(snoozeMinutes) || snoozeMinutes <= 0) {
      return NextResponse.json({ error: 'Invalid snoozeMinutes' }, { status: 400 });
    }
    update.status = 'SNOOZED';
    update.snoozed_until = new Date(now.getTime() + snoozeMinutes * 60000).toISOString();
  }

  const { error: updateError } = await supabaseAdmin
    .from('dose_occurrences')
    .update(update)
    .eq('id', doseId);

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 });
  }

  // When snoozed, optionally generate a future continuation event
  if (action === 'SNOOZED') {
    const snoozedUntil = update.snoozed_until;
    await supabaseAdmin.from('dose_occurrences').insert({
      protocol_id: dose.protocol_id?.id ?? dose.protocol_id,
      protocol_item_id: dose.protocol_item_id,
      scheduled_at: snoozedUntil,
      status: 'PENDING',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });
  }

  console.log('[analytics] dose_logged', { userId: user.id, doseId, action });

  return NextResponse.json({ ok: true });
}
