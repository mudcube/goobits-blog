CREATE TABLE IF NOT EXISTS calendar_admins (
  user_id INTEGER PRIMARY KEY,
  granted_at INTEGER NOT NULL DEFAULT (unixepoch()),
  granted_by INTEGER,
  FOREIGN KEY (user_id) REFERENCES calendar_users(id) ON DELETE CASCADE,
  FOREIGN KEY (granted_by) REFERENCES calendar_users(id) ON DELETE SET NULL
);

INSERT INTO calendar_users (email, name, avatar_url, email_verified, created_at, last_login_at)
SELECT admin.email, admin.name, admin.avatar_url, admin.email_verified, admin.created_at, unixepoch()
FROM admin_users admin
WHERE NOT EXISTS (
  SELECT 1
  FROM calendar_users existing
  WHERE lower(existing.email) = lower(admin.email)
);

INSERT OR IGNORE INTO calendar_admins (user_id)
SELECT calendar_users.id
FROM calendar_users
INNER JOIN admin_users ON lower(admin_users.email) = lower(calendar_users.email);

INSERT OR IGNORE INTO calendar_admins (user_id)
SELECT id
FROM calendar_users
WHERE lower(email) = lower('hello@miko.art');

DROP TABLE IF EXISTS admin_sessions;
DROP TABLE IF EXISTS admin_users;
