-- Enable RLS on all protocol builder tables
ALTER TABLE protocols ENABLE ROW LEVEL SECURITY;
ALTER TABLE protocol_phases ENABLE ROW LEVEL SECURITY;
ALTER TABLE protocol_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE protocol_schedule_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE dose_occurrences ENABLE ROW LEVEL SECURITY;
ALTER TABLE dose_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE protocol_stats_snapshots ENABLE ROW LEVEL SECURITY;

-- Policies for protocols
CREATE POLICY "Users can manage their own protocols"
  ON protocols FOR ALL USING (auth.uid() = user_id);

-- Policies for protocol_phases
CREATE POLICY "Users can manage their own protocol phases"
  ON protocol_phases FOR ALL USING (
    EXISTS (SELECT 1 FROM protocols WHERE protocols.id = protocol_id AND protocols.user_id = auth.uid())
  );

-- Policies for protocol_items
CREATE POLICY "Users can manage their own protocol items"
  ON protocol_items FOR ALL USING (
    EXISTS (SELECT 1 FROM protocols WHERE protocols.id = protocol_id AND protocols.user_id = auth.uid())
  );

-- Policies for protocol_schedule_rules
CREATE POLICY "Users can manage their own protocol schedule rules"
  ON protocol_schedule_rules FOR ALL USING (
    EXISTS (
      SELECT 1 FROM protocol_items
      JOIN protocols ON protocols.id = protocol_items.protocol_id
      WHERE protocol_items.id = protocol_item_id AND protocols.user_id = auth.uid()
    )
  );

-- Policies for dose_occurrences
CREATE POLICY "Users can manage their own dose occurrences"
  ON dose_occurrences FOR ALL USING (
    EXISTS (SELECT 1 FROM protocols WHERE protocols.id = protocol_id AND protocols.user_id = auth.uid())
  );

-- Policies for dose_notes
CREATE POLICY "Users can manage their own dose notes"
  ON dose_notes FOR ALL USING (
    EXISTS (
      SELECT 1 FROM dose_occurrences
      JOIN protocols ON protocols.id = dose_occurrences.protocol_id
      WHERE dose_occurrences.id = dose_occurrence_id AND protocols.user_id = auth.uid()
    )
  );

-- Policies for protocol_stats_snapshots
CREATE POLICY "Users can manage their own protocol stats"
  ON protocol_stats_snapshots FOR ALL USING (
    EXISTS (SELECT 1 FROM protocols WHERE protocols.id = protocol_id AND protocols.user_id = auth.uid())
  );

-- Enable RLS on remaining data tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE referral_tracking ENABLE ROW LEVEL SECURITY;
ALTER TABLE bloodwork_ai_analyses ENABLE ROW LEVEL SECURITY;

-- Policies for profiles
CREATE POLICY "Users can view and update their own profile"
  ON profiles FOR ALL USING (auth.uid() = id);

-- Policies for user_subscriptions
CREATE POLICY "Users can view their own subscription"
  ON user_subscriptions FOR SELECT USING (auth.uid() = user_id);

-- Policies for referral_tracking
CREATE POLICY "Users can view referrals they made or received"
  ON referral_tracking FOR SELECT USING (
    auth.uid() = referrer_id OR auth.uid() = referred_id
  );

-- Policies for bloodwork_ai_analyses
CREATE POLICY "Users can manage their own bloodwork analyses"
  ON bloodwork_ai_analyses FOR ALL USING (auth.uid() = user_id);
