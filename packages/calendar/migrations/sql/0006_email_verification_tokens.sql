CREATE TABLE IF NOT EXISTS calendar_email_verifications (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id TEXT NOT NULL,
  email TEXT NOT NULL,
  token_hash TEXT NOT NULL UNIQUE,
  expires_at INTEGER NOT NULL,
  created_at INTEGER NOT NULL,
  consumed_at INTEGER
);

CREATE INDEX IF NOT EXISTS idx_calendar_email_verifications_user_id
  ON calendar_email_verifications(user_id);

CREATE INDEX IF NOT EXISTS idx_calendar_email_verifications_email
  ON calendar_email_verifications(email);
