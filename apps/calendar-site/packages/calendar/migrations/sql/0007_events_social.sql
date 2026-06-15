CREATE TABLE IF NOT EXISTS calendar_events (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  activity_slug TEXT NOT NULL,
  title TEXT NOT NULL,
  starts_at TEXT NOT NULL,
  ends_at TEXT NOT NULL,
  capacity INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'scheduled',
  location TEXT,
  note TEXT,
  created_by_user_id TEXT,
  created_at INTEGER NOT NULL DEFAULT (unixepoch()),
  updated_at INTEGER NOT NULL DEFAULT (unixepoch())
);

CREATE INDEX IF NOT EXISTS idx_calendar_events_starts_at
  ON calendar_events(starts_at);

CREATE INDEX IF NOT EXISTS idx_calendar_events_activity_slug
  ON calendar_events(activity_slug);

CREATE TABLE IF NOT EXISTS calendar_event_participants (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  event_id INTEGER NOT NULL,
  user_id TEXT NOT NULL,
  guest_count INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'joined',
  attendance_status TEXT NOT NULL DEFAULT 'unknown',
  note TEXT,
  created_at INTEGER NOT NULL DEFAULT (unixepoch()),
  updated_at INTEGER NOT NULL DEFAULT (unixepoch()),
  UNIQUE(event_id, user_id),
  FOREIGN KEY(event_id) REFERENCES calendar_events(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_calendar_event_participants_event_id
  ON calendar_event_participants(event_id);

CREATE INDEX IF NOT EXISTS idx_calendar_event_participants_user_id
  ON calendar_event_participants(user_id);

CREATE TABLE IF NOT EXISTS calendar_user_profiles (
  user_id TEXT PRIMARY KEY,
  emergency_contact TEXT,
  dietary_restrictions TEXT,
  chat_handle TEXT,
  updated_at INTEGER NOT NULL DEFAULT (unixepoch())
);

