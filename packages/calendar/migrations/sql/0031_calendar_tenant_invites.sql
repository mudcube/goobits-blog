CREATE TABLE IF NOT EXISTS calendar_tenant_invites (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  tenant_id INTEGER NOT NULL,
  email TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'member',
  code TEXT NOT NULL UNIQUE,
  invited_by_user_id TEXT,
  accepted_user_id TEXT,
  accepted_at INTEGER,
  expires_at INTEGER,
  created_at INTEGER NOT NULL DEFAULT (unixepoch()),
  updated_at INTEGER NOT NULL DEFAULT (unixepoch()),
  FOREIGN KEY (tenant_id) REFERENCES calendar_tenants(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_calendar_tenant_invites_tenant_id
  ON calendar_tenant_invites(tenant_id, created_at);

CREATE INDEX IF NOT EXISTS idx_calendar_tenant_invites_email
  ON calendar_tenant_invites(lower(email));
