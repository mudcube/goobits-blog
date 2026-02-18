CREATE TABLE IF NOT EXISTS calendar_admin_settings (
  key TEXT PRIMARY KEY,
  value TEXT,
  updated_at INTEGER NOT NULL DEFAULT (unixepoch())
);

INSERT OR IGNORE INTO calendar_admin_settings (key, value, updated_at)
VALUES
  ('payment_provider', null, unixepoch()),
  ('payment_handle', null, unixepoch());
