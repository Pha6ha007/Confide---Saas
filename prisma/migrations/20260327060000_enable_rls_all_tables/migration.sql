-- Confide — Enable Row Level Security on ALL tables
-- This prevents direct Supabase REST API access to other users' data
-- Prisma uses DATABASE_URL (direct connection with superuser role), so RLS does NOT affect Prisma.
-- RLS only affects connections through Supabase anon key (PostgREST / client SDK).
--
-- IMPORTANT: auth.uid() maps to the Supabase Auth user ID, which matches our users.id (UUID)

-- ============================================
-- 1. ENABLE RLS ON ALL TABLES
-- ============================================

ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE journal_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE knowledge_base ENABLE ROW LEVEL SECURITY;
ALTER TABLE diaries ENABLE ROW LEVEL SECURITY;
ALTER TABLE mood_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE milestones ENABLE ROW LEVEL SECURITY;
ALTER TABLE homework ENABLE ROW LEVEL SECURITY;
ALTER TABLE proactive_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE alliance_surveys ENABLE ROW LEVEL SECURITY;
ALTER TABLE safety_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE rate_limits ENABLE ROW LEVEL SECURITY;

-- ============================================
-- 2. USERS TABLE
-- Users can only read/update their own row
-- ============================================

CREATE POLICY "users_select_own"
  ON users FOR SELECT
  USING (id = auth.uid());

CREATE POLICY "users_update_own"
  ON users FOR UPDATE
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

-- Allow insert during registration (auth callback creates user row)
CREATE POLICY "users_insert_own"
  ON users FOR INSERT
  WITH CHECK (id = auth.uid());

-- ============================================
-- 3. USER PROFILES
-- ============================================

CREATE POLICY "user_profiles_select_own"
  ON user_profiles FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "user_profiles_insert_own"
  ON user_profiles FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "user_profiles_update_own"
  ON user_profiles FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "user_profiles_delete_own"
  ON user_profiles FOR DELETE
  USING (user_id = auth.uid());

-- ============================================
-- 4. SESSIONS
-- ============================================

CREATE POLICY "sessions_select_own"
  ON sessions FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "sessions_insert_own"
  ON sessions FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "sessions_update_own"
  ON sessions FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- ============================================
-- 5. MESSAGES
-- ============================================

CREATE POLICY "messages_select_own"
  ON messages FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "messages_insert_own"
  ON messages FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- ============================================
-- 6. JOURNAL ENTRIES
-- ============================================

CREATE POLICY "journal_entries_select_own"
  ON journal_entries FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "journal_entries_insert_own"
  ON journal_entries FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "journal_entries_update_own"
  ON journal_entries FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "journal_entries_delete_own"
  ON journal_entries FOR DELETE
  USING (user_id = auth.uid());

-- ============================================
-- 7. SUBSCRIPTIONS
-- ============================================

CREATE POLICY "subscriptions_select_own"
  ON subscriptions FOR SELECT
  USING (user_id = auth.uid());

-- Insert/update only via service role (webhook handler via Prisma)
-- No anon-key write policies needed

-- ============================================
-- 8. KNOWLEDGE BASE (read-only for authenticated users)
-- ============================================

CREATE POLICY "knowledge_base_select_authenticated"
  ON knowledge_base FOR SELECT
  USING (auth.role() = 'authenticated');

-- Write only via service role (ingest scripts via Prisma)

-- ============================================
-- 9. DIARIES
-- ============================================

CREATE POLICY "diaries_select_own"
  ON diaries FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "diaries_insert_own"
  ON diaries FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "diaries_update_own"
  ON diaries FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- ============================================
-- 10. MOOD ENTRIES
-- ============================================

CREATE POLICY "mood_entries_select_own"
  ON mood_entries FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "mood_entries_insert_own"
  ON mood_entries FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- ============================================
-- 11. GOALS
-- ============================================

CREATE POLICY "goals_select_own"
  ON goals FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "goals_insert_own"
  ON goals FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "goals_update_own"
  ON goals FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "goals_delete_own"
  ON goals FOR DELETE
  USING (user_id = auth.uid());

-- ============================================
-- 12. MILESTONES (via goal ownership)
-- ============================================

CREATE POLICY "milestones_select_own"
  ON milestones FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM goals WHERE goals.id = milestones.goal_id AND goals.user_id = auth.uid()
    )
  );

CREATE POLICY "milestones_insert_own"
  ON milestones FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM goals WHERE goals.id = goal_id AND goals.user_id = auth.uid()
    )
  );

CREATE POLICY "milestones_update_own"
  ON milestones FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM goals WHERE goals.id = milestones.goal_id AND goals.user_id = auth.uid()
    )
  );

CREATE POLICY "milestones_delete_own"
  ON milestones FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM goals WHERE goals.id = milestones.goal_id AND goals.user_id = auth.uid()
    )
  );

-- ============================================
-- 13. HOMEWORK
-- ============================================

CREATE POLICY "homework_select_own"
  ON homework FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "homework_insert_own"
  ON homework FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "homework_update_own"
  ON homework FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- ============================================
-- 14. PROACTIVE MESSAGES
-- ============================================

CREATE POLICY "proactive_messages_select_own"
  ON proactive_messages FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "proactive_messages_update_own"
  ON proactive_messages FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Insert only via service role (proactive engine via Prisma)

-- ============================================
-- 15. ALLIANCE SURVEYS
-- ============================================

CREATE POLICY "alliance_surveys_select_own"
  ON alliance_surveys FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "alliance_surveys_insert_own"
  ON alliance_surveys FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- ============================================
-- 16. SAFETY LOGS — NO direct access via anon key
-- Only service role (Prisma) can read/write safety logs
-- This is intentional — users should not see or modify safety audit data
-- ============================================

-- No policies = no access via anon key (RLS enabled but no ALLOW rules)

-- ============================================
-- 17. RATE LIMITS — NO direct access via anon key
-- Only service role (Prisma) manages rate limits
-- ============================================

-- No policies = no access via anon key
