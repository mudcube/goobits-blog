CREATE TABLE IF NOT EXISTS calendar_event_sync (
  event_id INTEGER PRIMARY KEY,
  google_event_id TEXT,
  google_html_link TEXT,
  last_synced_at INTEGER,
  last_error TEXT,
  updated_at INTEGER NOT NULL DEFAULT (unixepoch()),
  FOREIGN KEY(event_id) REFERENCES calendar_events(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS calendar_sync_jobs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  event_id INTEGER NOT NULL,
  trigger TEXT NOT NULL DEFAULT 'unknown',
  requested_by_user_id TEXT,
  payload_json TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  attempt_count INTEGER NOT NULL DEFAULT 0,
  next_attempt_at INTEGER NOT NULL DEFAULT (unixepoch()),
  last_error TEXT,
  locked_at INTEGER,
  locked_by TEXT,
  created_at INTEGER NOT NULL DEFAULT (unixepoch()),
  updated_at INTEGER NOT NULL DEFAULT (unixepoch()),
  FOREIGN KEY(event_id) REFERENCES calendar_events(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_calendar_sync_jobs_due
  ON calendar_sync_jobs(status, next_attempt_at, id);

CREATE INDEX IF NOT EXISTS idx_calendar_sync_jobs_event
  ON calendar_sync_jobs(event_id);
