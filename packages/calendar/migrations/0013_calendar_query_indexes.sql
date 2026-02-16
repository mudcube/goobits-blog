-- Expression index for upcoming/recent feed queries that filter on datetime(ends_at)
-- and sort by datetime(starts_at).
CREATE INDEX IF NOT EXISTS idx_calendar_events_status_end_start_dt
  ON calendar_events(status, datetime(ends_at), datetime(starts_at));

-- Supports waitlist promotion ordering and event participant status summaries.
CREATE INDEX IF NOT EXISTS idx_calendar_event_participants_event_status_created
  ON calendar_event_participants(event_id, status, created_at);

-- Supports participant lookups and joined-seat calculations by event/status.
CREATE INDEX IF NOT EXISTS idx_calendar_event_participants_event_status_user
  ON calendar_event_participants(event_id, status, user_id);
