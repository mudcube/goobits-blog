CREATE TABLE IF NOT EXISTS calendar_sync_dead_letters (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  job_id INTEGER NOT NULL,
  event_id INTEGER NOT NULL,
  trigger TEXT NOT NULL,
  requested_by_user_id TEXT,
  payload_json TEXT,
  attempt_count INTEGER NOT NULL,
  last_error TEXT,
  created_at INTEGER NOT NULL,
  moved_at INTEGER NOT NULL DEFAULT (unixepoch())
);

CREATE INDEX IF NOT EXISTS idx_calendar_sync_dead_letters_moved_at
  ON calendar_sync_dead_letters(moved_at, id);

CREATE INDEX IF NOT EXISTS idx_calendar_sync_dead_letters_event
  ON calendar_sync_dead_letters(event_id);
