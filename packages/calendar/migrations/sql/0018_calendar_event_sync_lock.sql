ALTER TABLE calendar_event_sync ADD COLUMN sync_locked_at INTEGER;
ALTER TABLE calendar_event_sync ADD COLUMN sync_locked_by TEXT;

CREATE INDEX IF NOT EXISTS idx_calendar_event_sync_lock
  ON calendar_event_sync(sync_locked_at);
