CREATE TABLE IF NOT EXISTS calendar_tenants (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  slug TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  owner_user_id TEXT,
  visibility TEXT NOT NULL DEFAULT 'public',
  created_at INTEGER NOT NULL DEFAULT (unixepoch()),
  updated_at INTEGER NOT NULL DEFAULT (unixepoch())
);

CREATE TABLE IF NOT EXISTS calendar_tenant_members (
  tenant_id INTEGER NOT NULL,
  user_id TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'member',
  created_at INTEGER NOT NULL DEFAULT (unixepoch()),
  updated_at INTEGER NOT NULL DEFAULT (unixepoch()),
  PRIMARY KEY (tenant_id, user_id),
  FOREIGN KEY (tenant_id) REFERENCES calendar_tenants(id) ON DELETE CASCADE
);

INSERT OR IGNORE INTO calendar_tenants (id, slug, name, visibility)
VALUES (1, 'pdx-fun', 'pdx.fun', 'public');

INSERT OR IGNORE INTO calendar_tenant_members (tenant_id, user_id, role)
SELECT 1, CAST(user_id AS TEXT), 'admin'
FROM calendar_admins;

ALTER TABLE calendar_events
  ADD COLUMN tenant_id INTEGER NOT NULL DEFAULT 1;

ALTER TABLE calendar_programs
  ADD COLUMN tenant_id INTEGER NOT NULL DEFAULT 1;

CREATE INDEX IF NOT EXISTS idx_calendar_tenants_slug
  ON calendar_tenants(slug);

CREATE INDEX IF NOT EXISTS idx_calendar_tenant_members_user_id
  ON calendar_tenant_members(user_id);

CREATE INDEX IF NOT EXISTS idx_calendar_events_tenant_starts
  ON calendar_events(tenant_id, starts_at);

CREATE INDEX IF NOT EXISTS idx_calendar_events_tenant_activity
  ON calendar_events(tenant_id, activity_slug);

CREATE INDEX IF NOT EXISTS idx_calendar_programs_tenant_enabled
  ON calendar_programs(tenant_id, enabled, sort_order);
