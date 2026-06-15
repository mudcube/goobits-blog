CREATE TABLE IF NOT EXISTS calendar_payment_transactions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  provider TEXT NOT NULL,
  event_id INTEGER NOT NULL,
  participant_id INTEGER,
  user_id TEXT NOT NULL,
  confirmation_id TEXT,
  amount_cents INTEGER NOT NULL,
  currency TEXT NOT NULL DEFAULT 'USD',
  status TEXT NOT NULL DEFAULT 'created',
  external_id TEXT NOT NULL,
  funding_source TEXT,
  raw_response TEXT,
  created_at INTEGER NOT NULL DEFAULT (unixepoch()),
  updated_at INTEGER NOT NULL DEFAULT (unixepoch()),
  UNIQUE(provider, external_id),
  FOREIGN KEY(event_id) REFERENCES calendar_events(id) ON DELETE CASCADE,
  FOREIGN KEY(participant_id) REFERENCES calendar_event_participants(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_calendar_payment_transactions_event_user
  ON calendar_payment_transactions(event_id, user_id);

CREATE INDEX IF NOT EXISTS idx_calendar_payment_transactions_confirmation
  ON calendar_payment_transactions(confirmation_id);
