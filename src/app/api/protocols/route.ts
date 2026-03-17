import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin, getAuthenticatedUser } from '@/lib/auth-server';
import { expandScheduleRules, DEFAULT_OCCURRENCE_WINDOW_DAYS } from '@/lib/protocol';

const OCCURRENCE_WINDOW_DAYS = DEFAULT_OCCURRENCE_WINDOW_DAYS;
const MAX_NON_PREMIUM_ITEMS = 1;

export async function GET(request: NextRequest) {
  const user = await getAuthenticatedUser(request);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const activeOnly = searchParams.get('activeOnly') !== 'false';

  const query = supabaseAdmin
    .from('protocols')
    .select(`*,
      protocol_items(*),
      protocol_stats_snapshots!protocol_stats_snapshots_protocol_id_fkey(*)
    `)
    .eq('user_id', user.id);

  if (activeOnly) query.eq('is_active', true);

  const { data, error } = await query.order('created_at', { ascending: false });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ protocols: data ?? [] });
}

export async function POST(request: NextRequest) {
  const user = await getAuthenticatedUser(request);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await request.json();

  if (!body?.name || !body?.start_date || !Array.isArray(body.items) || body.items.length === 0) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }

  // Premium gating: basic enforcement
  const isPremium = body.isPremium === true;
  if (!isPremium && body.items.length > MAX_NON_PREMIUM_ITEMS) {
    return NextResponse.json({ error: 'Free tier supports one substance per protocol' }, { status: 403 });
  }

  const insertProtocol = {
    user_id: user.id,
    name: body.name,
    goal: body.goal || null,
    start_date: body.start_date,
    end_date: body.end_date || null,
    is_active: true,
  };

  const { data: protocolData, error: protocolError } = await supabaseAdmin
    .from('protocols')
    .insert(insertProtocol)
    .select('*')
    .single();

  if (protocolError || !protocolData) {
    return NextResponse.json({ error: protocolError?.message || 'Failed to create protocol' }, { status: 500 });
  }

  const protocolId = protocolData.id;

  // Insert items and schedules
  const protocolsWithItems: any[] = [];
  for (const item of body.items) {
    if (!item.substance_name || !item.route || !item.dosage_amount || !item.dosage_unit) {
      return NextResponse.json({ error: 'Invalid item format' }, { status: 400 });
    }

    const insertItem = {
      protocol_id: protocolId,
      substance_name: item.substance_name,
      route: item.route,
      dosage_amount: item.dosage_amount,
      dosage_unit: item.dosage_unit,
      notes: item.notes ?? null,
      item_start_date: item.item_start_date || body.start_date,
      item_end_date: item.item_end_date ?? body.end_date ?? null,
    };

    const { data: insertedItem, error: itemError } = await supabaseAdmin
      .from('protocol_items')
      .insert(insertItem)
      .select('*')
      .single();

    if (itemError || !insertedItem) {
      return NextResponse.json({ error: itemError?.message || 'Failed to create protocol item' }, { status: 500 });
    }

    const itemId = insertedItem.id;

    const rules = Array.isArray(item.schedule_rules) ? item.schedule_rules : [];
    for (const rule of rules) {
      const insertRule = {
        protocol_item_id: itemId,
        schedule_type: rule.schedule_type,
        times_of_day: Array.isArray(rule.times_of_day) ? rule.times_of_day : [],
        days_of_week: rule.days_of_week ?? null,
        interval_hours: rule.interval_hours ?? null,
        interval_days: rule.interval_days ?? null,
        cycle_pattern_json: rule.cycle_pattern_json ?? null,
        reminder_enabled: rule.reminder_enabled ?? true,
        reminder_offset_minutes: rule.reminder_offset_minutes ?? 15,
      };

      const { error: ruleError } = await supabaseAdmin.from('protocol_schedule_rules').insert(insertRule);
      if (ruleError) {
        return NextResponse.json({ error: ruleError.message }, { status: 500 });
      }
    }

    protocolsWithItems.push({ ...insertedItem, schedule_rules: rules });
  }

  // generate dose occurrences for the next window
  const fromDate = body.start_date;
  const toDate = new Date();
  toDate.setDate(toDate.getDate() + OCCURRENCE_WINDOW_DAYS);

  const occurrences = [];

  for (const itemRow of protocolsWithItems) {
    const itemRules = itemRow.schedule_rules || [];

    const expanded = expandScheduleRules(
      itemRow.item_start_date ?? body.start_date,
      itemRow.item_end_date ?? body.end_date ?? null,
      itemRules,
      fromDate,
      toDate.toISOString().slice(0, 10)
    );

    for (const occ of expanded) {
      occurrences.push({
        protocol_id: protocolId,
        protocol_item_id: itemRow.id,
        scheduled_at: occ.scheduledAt,
        status: 'PENDING',
      });
    }
  }

  if (occurrences.length) {
    await supabaseAdmin.from('dose_occurrences').insert(occurrences);
  }

  // capture analytics event
  // TODO: use real analytics integration
  console.log('[analytics] protocol_created', { userId: user.id, protocolId });

  return NextResponse.json({ protocol: protocolData });
}
