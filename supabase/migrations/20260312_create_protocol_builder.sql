-- Migration: Add protocol/cycle builder tables

-- Protocol master record
CREATE TABLE IF NOT EXISTS protocols (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name text NOT NULL,
  goal text,
  start_date date NOT NULL,
  end_date date,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT NOW(),
  updated_at timestamptz NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_protocols_user_id ON protocols(user_id);
CREATE INDEX IF NOT EXISTS idx_protocols_is_active ON protocols(is_active);

-- Optional phases for protocols
CREATE TABLE IF NOT EXISTS protocol_phases (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  protocol_id uuid NOT NULL REFERENCES protocols(id) ON DELETE CASCADE,
  name text,
  start_date date NOT NULL,
  end_date date,
  notes text,
  created_at timestamptz NOT NULL DEFAULT NOW(),
  updated_at timestamptz NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_protocol_phases_protocol_id ON protocol_phases(protocol_id);

-- Stack items (substances) per protocol
CREATE TABLE IF NOT EXISTS protocol_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  protocol_id uuid NOT NULL REFERENCES protocols(id) ON DELETE CASCADE,
  substance_name text NOT NULL,
  route text NOT NULL CHECK (route IN ('oral','subQ','IM','transdermal','other')),
  dosage_amount numeric NOT NULL,
  dosage_unit text NOT NULL CHECK (dosage_unit IN ('mcg','mg','IU','ml','pills','other')),
  notes text,
  item_start_date date,
  item_end_date date,
  created_at timestamptz NOT NULL DEFAULT NOW(),
  updated_at timestamptz NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_protocol_items_protocol_id ON protocol_items(protocol_id);

-- Schedule rules for protocol items
CREATE TABLE IF NOT EXISTS protocol_schedule_rules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  protocol_item_id uuid NOT NULL REFERENCES protocol_items(id) ON DELETE CASCADE,
  schedule_type text NOT NULL CHECK (schedule_type IN ('DAILY','WEEKLY','EVERY_X_HOURS','EVERY_N_DAYS','CUSTOM_DAYS_OF_WEEK','CYCLE_PATTERN')),
  times_of_day text[] NOT NULL DEFAULT ARRAY[]::text[],          -- '08:00', '20:00'
  days_of_week int[] NULL,  -- 0=Sunday .. 6=Saturday
  interval_hours int NULL,
  interval_days int NULL,
  cycle_pattern_json jsonb NULL,
  reminder_enabled boolean NOT NULL DEFAULT true,
  reminder_offset_minutes int NOT NULL DEFAULT 15,
  created_at timestamptz NOT NULL DEFAULT NOW(),
  updated_at timestamptz NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_protocol_schedule_rules_item_id ON protocol_schedule_rules(protocol_item_id);

-- Generated dose occurrences
CREATE TABLE IF NOT EXISTS dose_occurrences (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  protocol_id uuid NOT NULL REFERENCES protocols(id) ON DELETE CASCADE,
  protocol_item_id uuid NOT NULL REFERENCES protocol_items(id) ON DELETE CASCADE,
  phase_id uuid NULL REFERENCES protocol_phases(id) ON DELETE SET NULL,
  scheduled_at timestamptz NOT NULL,
  status text NOT NULL CHECK (status IN ('PENDING','TAKEN','SKIPPED','SNOOZED')) DEFAULT 'PENDING',
  taken_at timestamptz NULL,
  skipped_reason text NULL,
  snoozed_until timestamptz NULL,
  reminder_sent boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT NOW(),
  updated_at timestamptz NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_dose_occurrences_protocol_id_scheduled ON dose_occurrences(protocol_id, scheduled_at);
CREATE INDEX IF NOT EXISTS idx_dose_occurrences_status ON dose_occurrences(status);

-- Optional notes for doses
CREATE TABLE IF NOT EXISTS dose_notes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  dose_occurrence_id uuid NOT NULL REFERENCES dose_occurrences(id) ON DELETE CASCADE,
  note_text text NOT NULL,
  side_effects jsonb NULL,
  created_at timestamptz NOT NULL DEFAULT NOW(),
  updated_at timestamptz NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_dose_notes_dose_id ON dose_notes(dose_occurrence_id);

-- Stats for dashboards
CREATE TABLE IF NOT EXISTS protocol_stats_snapshots (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  protocol_id uuid NOT NULL REFERENCES protocols(id) ON DELETE CASCADE,
  snapshot_date date NOT NULL,
  adherence_percent numeric NOT NULL,
  doses_taken int NOT NULL,
  doses_missed int NOT NULL,
  streak_count int NOT NULL,
  created_at timestamptz NOT NULL DEFAULT NOW()
);
CREATE UNIQUE INDEX IF NOT EXISTS idx_protocol_stats_snapshot_date ON protocol_stats_snapshots(protocol_id, snapshot_date);
