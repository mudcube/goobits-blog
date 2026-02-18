CREATE TABLE IF NOT EXISTS calendar_user_program_access (
  user_id INTEGER NOT NULL,
  program_slug TEXT NOT NULL,
  allowed INTEGER NOT NULL DEFAULT 1,
  updated_at INTEGER NOT NULL DEFAULT (unixepoch()),
  PRIMARY KEY (user_id, program_slug),
  FOREIGN KEY (user_id) REFERENCES calendar_users(id) ON DELETE CASCADE,
  FOREIGN KEY (program_slug) REFERENCES calendar_programs(slug) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_calendar_user_program_access_user
  ON calendar_user_program_access(user_id);

CREATE INDEX IF NOT EXISTS idx_calendar_user_program_access_program
  ON calendar_user_program_access(program_slug);

-- Seed explicit allow rules for existing users across enabled programs.
INSERT OR IGNORE INTO calendar_user_program_access (user_id, program_slug, allowed, updated_at)
SELECT u.id, p.slug, 1, unixepoch()
FROM calendar_users u
JOIN calendar_programs p ON p.enabled = 1;
