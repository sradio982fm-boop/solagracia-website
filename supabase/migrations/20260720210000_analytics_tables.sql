-- Analytics: visitors, sessions, events
-- Public writes go through /api/analytics/beacon (service role only).

CREATE TABLE IF NOT EXISTS visitors (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  uid text NOT NULL UNIQUE,
  ip text,
  city text,
  region text,
  country text,
  viewport text,
  first_seen timestamptz NOT NULL DEFAULT now(),
  last_seen_at timestamptz NOT NULL DEFAULT now(),
  total_sessions integer NOT NULL DEFAULT 0,
  total_page_views integer NOT NULL DEFAULT 0
);

CREATE INDEX IF NOT EXISTS visitors_last_seen_at_idx ON visitors (last_seen_at DESC);
CREATE INDEX IF NOT EXISTS visitors_country_idx ON visitors (country);

CREATE TABLE IF NOT EXISTS sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sid text NOT NULL UNIQUE,
  visitor_id uuid NOT NULL REFERENCES visitors (id) ON DELETE CASCADE,
  started_at timestamptz NOT NULL,
  duration_seconds integer NOT NULL DEFAULT 0,
  page_views integer NOT NULL DEFAULT 0,
  referrer text,
  user_agent text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS sessions_started_at_idx ON sessions (started_at DESC);
CREATE INDEX IF NOT EXISTS sessions_visitor_id_idx ON sessions (visitor_id);

CREATE TABLE IF NOT EXISTS events (
  id bigserial PRIMARY KEY,
  session_sid text,
  visitor_id uuid REFERENCES visitors (id) ON DELETE SET NULL,
  event_type text NOT NULL,
  event_data text,
  occurred_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS events_occurred_at_id_idx ON events (occurred_at DESC, id DESC);
CREATE INDEX IF NOT EXISTS events_event_type_idx ON events (event_type);
CREATE INDEX IF NOT EXISTS events_visitor_id_idx ON events (visitor_id);

CREATE OR REPLACE FUNCTION analytics_on_session_insert()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  UPDATE visitors
  SET total_sessions = total_sessions + 1
  WHERE id = NEW.visitor_id;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS analytics_session_insert ON sessions;
CREATE TRIGGER analytics_session_insert
  AFTER INSERT ON sessions
  FOR EACH ROW
  EXECUTE FUNCTION analytics_on_session_insert();

ALTER TABLE visitors ENABLE ROW LEVEL SECURITY;
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;

-- No anon/authenticated policies: inserts/updates only via service role in API routes.
