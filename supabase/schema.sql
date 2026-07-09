-- Founder English OS — Supabase schema
-- Run this in the Supabase SQL editor of your project.
--
-- This is a PRIVATE, single-user training app. There is no login screen:
-- the app signs in anonymously (enable "Anonymous sign-ins" in
-- Supabase → Authentication → Providers) and scopes every row to that
-- anonymous user via Row Level Security. Cloud sync is a best-effort backup;
-- the app works fully offline from local storage even with no Supabase config.

-- ─── Profile ─────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS user_profile (
  id             UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name           TEXT NOT NULL DEFAULT 'Founder',
  level          TEXT NOT NULL DEFAULT 'B2 · Upper-intermediate',
  last_active_day DATE,
  current_streak INT NOT NULL DEFAULT 0,
  longest_streak INT NOT NULL DEFAULT 0,
  updated_at     TIMESTAMPTZ DEFAULT NOW()
);

-- ─── Scenarios (catalog) ─────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS scenarios (
  id        TEXT PRIMARY KEY,
  title     TEXT NOT NULL,
  brief     TEXT NOT NULL DEFAULT '',
  brief_es  TEXT NOT NULL DEFAULT '',
  category  TEXT NOT NULL DEFAULT '',
  intensity INT  NOT NULL DEFAULT 1,
  opener    TEXT NOT NULL DEFAULT '',
  goal      TEXT NOT NULL DEFAULT ''
);

-- ─── Sessions ────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS sessions (
  id             TEXT NOT NULL,
  owner          UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  scenario_id    TEXT NOT NULL DEFAULT '',
  scenario_title TEXT NOT NULL DEFAULT '',
  date           TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  turns          INT NOT NULL DEFAULT 0,
  mistakes_logged INT NOT NULL DEFAULT 0,
  phrases_saved  INT NOT NULL DEFAULT 0,
  score          JSONB,
  PRIMARY KEY (id, owner)
);

-- ─── Mistakes ────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS mistakes (
  id             TEXT NOT NULL,
  owner          UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  original       TEXT NOT NULL DEFAULT '',
  corrected      TEXT NOT NULL DEFAULT '',
  explanation_es TEXT NOT NULL DEFAULT '',
  example        TEXT NOT NULL DEFAULT '',
  date           TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  scenario_id    TEXT NOT NULL DEFAULT '',
  scenario_title TEXT NOT NULL DEFAULT '',
  PRIMARY KEY (id, owner)
);

-- ─── Phrases ─────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS phrases (
  id         TEXT NOT NULL,
  owner      UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  english    TEXT NOT NULL DEFAULT '',
  spanish    TEXT NOT NULL DEFAULT '',
  situation  TEXT NOT NULL DEFAULT '',
  example    TEXT NOT NULL DEFAULT '',
  confidence INT NOT NULL DEFAULT 1,
  date       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (id, owner)
);

-- ─── Scores ──────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS scores (
  id              TEXT NOT NULL,
  owner           UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  scenario_id     TEXT NOT NULL DEFAULT '',
  scenario_title  TEXT NOT NULL DEFAULT '',
  fluency         INT NOT NULL DEFAULT 0,
  clarity         INT NOT NULL DEFAULT 0,
  grammar         INT NOT NULL DEFAULT 0,
  vocabulary      INT NOT NULL DEFAULT 0,
  pronunciation   INT NOT NULL DEFAULT 0,
  confidence      INT NOT NULL DEFAULT 0,
  founder_presence INT NOT NULL DEFAULT 0,
  PRIMARY KEY (id, owner)
);

-- ─── Row Level Security ──────────────────────────────────────────────────────

ALTER TABLE user_profile ENABLE ROW LEVEL SECURITY;
ALTER TABLE sessions     ENABLE ROW LEVEL SECURITY;
ALTER TABLE mistakes     ENABLE ROW LEVEL SECURITY;
ALTER TABLE phrases      ENABLE ROW LEVEL SECURITY;
ALTER TABLE scores       ENABLE ROW LEVEL SECURITY;
ALTER TABLE scenarios    ENABLE ROW LEVEL SECURITY;

-- Profile: a user owns their single row
CREATE POLICY "own profile" ON user_profile FOR ALL
  USING (id = auth.uid()) WITH CHECK (id = auth.uid());

-- Personal data: owner-scoped full access
CREATE POLICY "own sessions" ON sessions FOR ALL
  USING (owner = auth.uid()) WITH CHECK (owner = auth.uid());
CREATE POLICY "own mistakes" ON mistakes FOR ALL
  USING (owner = auth.uid()) WITH CHECK (owner = auth.uid());
CREATE POLICY "own phrases" ON phrases FOR ALL
  USING (owner = auth.uid()) WITH CHECK (owner = auth.uid());
CREATE POLICY "own scores" ON scores FOR ALL
  USING (owner = auth.uid()) WITH CHECK (owner = auth.uid());

-- Scenarios: shared catalog — any authenticated user can read/seed
CREATE POLICY "read scenarios" ON scenarios FOR SELECT
  USING (auth.uid() IS NOT NULL);
CREATE POLICY "seed scenarios" ON scenarios FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

-- ─── Indexes ─────────────────────────────────────────────────────────────────

CREATE INDEX IF NOT EXISTS sessions_owner_idx ON sessions (owner);
CREATE INDEX IF NOT EXISTS mistakes_owner_idx ON mistakes (owner);
CREATE INDEX IF NOT EXISTS phrases_owner_idx  ON phrases  (owner);
CREATE INDEX IF NOT EXISTS scores_owner_idx   ON scores   (owner);
