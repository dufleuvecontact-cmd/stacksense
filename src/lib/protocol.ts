export type Protocol = {
  id: string;
  user_id: string;
  name: string;
  goal?: string;
  start_date: string;
  end_date?: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export type ProtocolItem = {
  id: string;
  protocol_id: string;
  substance_name: string;
  route: 'oral' | 'subQ' | 'IM' | 'transdermal' | 'other';
  dosage_amount: number;
  dosage_unit: 'mcg' | 'mg' | 'IU' | 'ml' | 'pills' | 'other';
  notes?: string;
  item_start_date?: string | null;
  item_end_date?: string | null;
};

export type ProtocolScheduleRule = {
  id: string;
  protocol_item_id: string;
  schedule_type:
    | 'DAILY'
    | 'WEEKLY'
    | 'EVERY_X_HOURS'
    | 'EVERY_N_DAYS'
    | 'CUSTOM_DAYS_OF_WEEK'
    | 'CYCLE_PATTERN';
  times_of_day: string[];
  days_of_week?: number[];
  interval_hours?: number;
  interval_days?: number;
  cycle_pattern_json?: Record<string, unknown>;
  reminder_enabled: boolean;
  reminder_offset_minutes: number;
};

export type DoseOccurrence = {
  id: string;
  protocol_id: string;
  protocol_item_id: string;
  phase_id?: string | null;
  scheduled_at: string;
  status: 'PENDING' | 'TAKEN' | 'SKIPPED' | 'SNOOZED';
  taken_at?: string | null;
  skipped_reason?: string | null;
  snoozed_until?: string | null;
  reminder_sent: boolean;
};

export type DoseLogAction = 'TAKEN' | 'SKIPPED' | 'SNOOZED';

export const DEFAULT_OCCURRENCE_WINDOW_DAYS = 90;

function parseTimeHHMM(value: string): { hour: number; minute: number } {
  const [h, m] = value.split(':').map((p) => Number(p));
  return {
    hour: Number.isNaN(h) ? 0 : h,
    minute: Number.isNaN(m) ? 0 : m,
  };
}

/**
 * Expand all active rules into occurrences between start and end (inclusive)
 */
export function expandScheduleRules(
  itemStartDate: string,
  itemEndDate: string | null,
  rules: Array<Omit<ProtocolScheduleRule, 'id' | 'protocol_item_id'>>,
  fromDate: string,
  toDate: string
): Array<{ scheduledAt: string }> {
  const parseDayStart = (iso: string) => {
    const d = new Date(iso);
    d.setHours(0, 0, 0, 0);
    return d;
  };

  const dateToISO = (d: Date) => new Date(d).toISOString();

  const addDays = (d: Date, n: number) => {
    const next = new Date(d);
    next.setDate(next.getDate() + n);
    return next;
  };

  const start = parseDayStart(fromDate);
  const end = new Date(parseDayStart(toDate));
  end.setHours(23, 59, 59, 999);

  const itemStart = parseDayStart(itemStartDate);
  const itemEnd = itemEndDate ? new Date(itemEndDate) : null;
  if (itemEnd) itemEnd.setHours(23, 59, 59, 999);

  const effectiveStart = itemStart > start ? itemStart : start;
  const effectiveEnd = itemEnd && itemEnd < end ? itemEnd : end;

  if (effectiveEnd < effectiveStart) return [];

  const inRange = (dt: Date) => dt >= effectiveStart && dt <= effectiveEnd;

  const iterations: Array<{ scheduledAt: string }> = [];

  const dayDiff = Math.ceil((effectiveEnd.getTime() - effectiveStart.getTime()) / (1000 * 60 * 60 * 24));

  const createDateTime = (base: Date, hour: number, minute: number) => {
    const d = new Date(base);
    d.setHours(hour, minute, 0, 0);
    return d;
  };

  for (const rule of rules) {
    const type = rule.schedule_type;

    if (type === 'DAILY' || type === 'CUSTOM_DAYS_OF_WEEK' || type === 'WEEKLY') {
      let cursor = new Date(effectiveStart);
      while (cursor <= effectiveEnd) {
        const weekday = cursor.getDay();
        const should =
          type === 'DAILY' ||
          (type === 'WEEKLY' && rule.days_of_week?.includes(weekday)) ||
          (type === 'CUSTOM_DAYS_OF_WEEK' && rule.days_of_week?.includes(weekday));

        if (should) {
          for (const time of rule.times_of_day) {
            const { hour, minute } = parseTimeHHMM(time);
            const scheduled = createDateTime(cursor, hour, minute);
            if (inRange(scheduled)) iterations.push({ scheduledAt: dateToISO(scheduled) });
          }
        }

        cursor = addDays(cursor, 1);
      }
    } else if (type === 'EVERY_X_HOURS') {
      const spacing = rule.interval_hours ?? 6;
      let current = new Date(effectiveStart);
      if (rule.times_of_day.length) {
        current = createDateTime(current, ...Object.values(parseTimeHHMM(rule.times_of_day[0])) as [number, number]);
      }

      while (current <= effectiveEnd) {
        if (inRange(current)) {
          iterations.push({ scheduledAt: dateToISO(current) });
        }
        current = new Date(current.getTime() + spacing * 60 * 60 * 1000);
      }
    } else if (type === 'EVERY_N_DAYS') {
      const step = rule.interval_days ?? 1;
      let cursor = new Date(effectiveStart);
      while (cursor <= effectiveEnd) {
        for (const time of rule.times_of_day) {
          const { hour, minute } = parseTimeHHMM(time);
          const scheduled = createDateTime(cursor, hour, minute);
          if (inRange(scheduled)) iterations.push({ scheduledAt: dateToISO(scheduled) });
        }
        cursor = addDays(cursor, step);
      }
    } else if (type === 'CYCLE_PATTERN') {
      const pattern = rule.cycle_pattern_json as { on?: number; off?: number } | undefined;
      if (!pattern || !pattern.on || !pattern.off) continue;
      const cycleLen = pattern.on + pattern.off;
      let cursor = new Date(effectiveStart);
      let idx = 0;

      while (cursor <= effectiveEnd) {
        if (idx % cycleLen < pattern.on) {
          for (const time of rule.times_of_day) {
            const { hour, minute } = parseTimeHHMM(time);
            const scheduled = createDateTime(cursor, hour, minute);
            if (inRange(scheduled)) iterations.push({ scheduledAt: dateToISO(scheduled) });
          }
        }
        cursor = addDays(cursor, 1);
        idx += 1;
      }
    }
  }

  iterations.sort((a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime());
  return iterations;
}

export function calculateAdherence(doses: DoseOccurrence[]) {
  const total = doses.length;
  const taken = doses.filter((d) => d.status === 'TAKEN').length;
  const missed = doses.filter((d) => ['SKIPPED'].includes(d.status)).length;
  return {
    total,
    taken,
    missed,
    adherencePercent: total ? Math.round((taken / total) * 100) : 0,
  };
}
