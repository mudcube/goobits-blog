PRAGMA foreign_keys=OFF;

-- OAuth accounts table (new auth flow)
CREATE TABLE IF NOT EXISTS calendar_oauth_accounts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  provider TEXT NOT NULL,
  provider_account_id TEXT NOT NULL,
  created_at INTEGER NOT NULL DEFAULT (unixepoch()),
  UNIQUE(provider, provider_account_id),
  FOREIGN KEY(user_id) REFERENCES calendar_users(id)
);

INSERT INTO calendar_oauth_accounts (user_id, provider, provider_account_id, created_at)
SELECT id, provider, provider_id, created_at
FROM calendar_users
WHERE provider IS NOT NULL AND provider_id IS NOT NULL;

-- Normalize calendar_users schema
CREATE TABLE IF NOT EXISTS calendar_users_new (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT NOT NULL,
  name TEXT,
  avatar_url TEXT,
  email_verified INTEGER NOT NULL DEFAULT 0,
  password TEXT,
  created_at INTEGER NOT NULL DEFAULT (unixepoch()),
  last_login_at INTEGER NOT NULL DEFAULT (unixepoch())
);

INSERT INTO calendar_users_new (id, email, name, avatar_url, email_verified, password, created_at, last_login_at)
SELECT
  id,
  email,
  name,
  avatar_url,
  0,
  NULL,
  COALESCE(created_at, unixepoch()),
  COALESCE(last_login_at, created_at, unixepoch())
FROM calendar_users;

DROP TABLE calendar_users;
ALTER TABLE calendar_users_new RENAME TO calendar_users;

CREATE INDEX IF NOT EXISTS idx_calendar_users_email ON calendar_users(email);

-- Normalize calendar_sessions schema for ISO timestamps
CREATE TABLE IF NOT EXISTS calendar_sessions_new (
  id TEXT PRIMARY KEY,
  user_id INTEGER NOT NULL,
  expires_at TEXT NOT NULL,
  created_at INTEGER NOT NULL DEFAULT (unixepoch()),
  FOREIGN KEY(user_id) REFERENCES calendar_users(id)
);

INSERT INTO calendar_sessions_new (id, user_id, expires_at, created_at)
SELECT
  id,
  user_id,
  CASE
    WHEN typeof(expires_at) = 'integer' THEN strftime('%Y-%m-%dT%H:%M:%fZ', expires_at, 'unixepoch')
    ELSE expires_at
  END,
  COALESCE(created_at, unixepoch())
FROM calendar_sessions;

DROP TABLE calendar_sessions;
ALTER TABLE calendar_sessions_new RENAME TO calendar_sessions;

CREATE INDEX IF NOT EXISTS idx_calendar_sessions_user_id ON calendar_sessions(user_id);

-- Remove legacy OAuth state storage (unused in new flow)
DROP TABLE IF EXISTS calendar_oauth_states;

-- Admin users + sessions
CREATE TABLE IF NOT EXISTS admin_users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT NOT NULL,
  name TEXT,
  avatar_url TEXT,
  email_verified INTEGER NOT NULL DEFAULT 0,
  password TEXT,
  created_at INTEGER NOT NULL DEFAULT (unixepoch())
);

CREATE INDEX IF NOT EXISTS idx_admin_users_email ON admin_users(email);

CREATE TABLE IF NOT EXISTS admin_sessions_new (
  id TEXT PRIMARY KEY,
  user_id INTEGER NOT NULL,
  expires_at TEXT NOT NULL,
  created_at INTEGER NOT NULL DEFAULT (unixepoch()),
  FOREIGN KEY(user_id) REFERENCES admin_users(id)
);

DROP TABLE IF EXISTS admin_sessions;
ALTER TABLE admin_sessions_new RENAME TO admin_sessions;

CREATE INDEX IF NOT EXISTS idx_admin_sessions_user_id ON admin_sessions(user_id);

PRAGMA foreign_keys=ON;
