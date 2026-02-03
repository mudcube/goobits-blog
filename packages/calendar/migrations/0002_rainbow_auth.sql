-- Users authenticated via OAuth
CREATE TABLE IF NOT EXISTS rainbow_users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  provider TEXT NOT NULL,
  provider_id TEXT NOT NULL,
  email TEXT NOT NULL,
  name TEXT,
  avatar_url TEXT,
  created_at INTEGER NOT NULL DEFAULT (unixepoch()),
  last_login_at INTEGER NOT NULL DEFAULT (unixepoch()),
  UNIQUE(provider, provider_id)
);

-- Invites issued by admin
CREATE TABLE IF NOT EXISTS rainbow_invites (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  code TEXT UNIQUE NOT NULL,
  email TEXT,
  uses_remaining INTEGER DEFAULT 1,
  expires_at INTEGER,
  created_at INTEGER NOT NULL DEFAULT (unixepoch())
);

-- Track redemptions
CREATE TABLE IF NOT EXISTS rainbow_invite_redemptions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  invite_id INTEGER NOT NULL,
  user_id INTEGER NOT NULL,
  redeemed_at INTEGER NOT NULL DEFAULT (unixepoch()),
  FOREIGN KEY(invite_id) REFERENCES rainbow_invites(id),
  FOREIGN KEY(user_id) REFERENCES rainbow_users(id)
);

-- Sessions
CREATE TABLE IF NOT EXISTS rainbow_sessions (
  id TEXT PRIMARY KEY,
  user_id INTEGER NOT NULL,
  expires_at INTEGER NOT NULL,
  created_at INTEGER NOT NULL DEFAULT (unixepoch()),
  FOREIGN KEY(user_id) REFERENCES rainbow_users(id)
);

-- OAuth state (with invite code)
CREATE TABLE IF NOT EXISTS rainbow_oauth_states (
  state TEXT PRIMARY KEY,
  provider TEXT NOT NULL,
  invite_code TEXT,
  redirect_to TEXT,
  created_at INTEGER NOT NULL DEFAULT (unixepoch())
);
