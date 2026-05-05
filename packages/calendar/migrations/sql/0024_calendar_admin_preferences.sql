CREATE TABLE IF NOT EXISTS calendar_admin_preferences (
  user_id INTEGER NOT NULL,
  key TEXT NOT NULL,
  value TEXT NOT NULL,
  updated_at INTEGER NOT NULL DEFAULT (unixepoch()),
  PRIMARY KEY (user_id, key),
  FOREIGN KEY (user_id) REFERENCES calendar_users(id) ON DELETE CASCADE
);
