ALTER TABLE calendar_events ADD COLUMN cost_cents INTEGER NOT NULL DEFAULT 0;
ALTER TABLE calendar_events ADD COLUMN currency TEXT NOT NULL DEFAULT 'USD';
ALTER TABLE calendar_events ADD COLUMN payment_provider TEXT;
ALTER TABLE calendar_events ADD COLUMN payment_handle TEXT;
ALTER TABLE calendar_events ADD COLUMN payment_note_template TEXT;
ALTER TABLE calendar_events ADD COLUMN recap_text TEXT;
ALTER TABLE calendar_events ADD COLUMN hero_image_url TEXT;

CREATE INDEX IF NOT EXISTS idx_calendar_events_ends_at
  ON calendar_events(ends_at);

