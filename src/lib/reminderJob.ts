import { supabaseAdmin } from './auth-server';

// Pseudo-job for sending scheduled dose reminders.
// In production, wire this to a cron provider (e.g., CloudScheduler, AWS EventBridge, Supabase Scheduled Functions).

export async function runDoseReminderJob() {
  const now = new Date();
  const windowEnd = new Date(now.getTime() + 15 * 60 * 1000); // next 15 minutes

  const { data: upcoming, error } = await supabaseAdmin
    .from('dose_occurrences')
    .select('*, protocol_id(user_id), protocol_item_id(*)')
    .eq('status', 'PENDING')
    .gte('scheduled_at', now.toISOString())
    .lte('scheduled_at', windowEnd.toISOString())
    .eq('reminder_sent', false);

  if (error) {
    console.error('[reminderJob] db read error', error);
    return;
  }

  for (const dose of upcoming ?? []) {
    // Based on dose.protocol_id.user_id, send push/email notification
    // TODO: integrate with OneSignal, FCM, Apple Push, and deep links.
    console.log('[reminderJob] would send reminder', {
      userId: dose.protocol_id?.user_id,
      protocolItemId: dose.protocol_item_id,
      scheduledAt: dose.scheduled_at,
    });

    await supabaseAdmin
      .from('dose_occurrences')
      .update({ reminder_sent: true })
      .eq('id', dose.id);
  }
}

// Example pseudo cron hook
export async function cronHandler() {
  // Called every minute or 5 minutes by the scheduler.
  await runDoseReminderJob();
}
