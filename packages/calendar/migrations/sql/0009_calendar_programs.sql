CREATE TABLE IF NOT EXISTS calendar_programs (
  slug TEXT PRIMARY KEY,
  label TEXT NOT NULL,
  activity_name TEXT NOT NULL UNIQUE,
  page_title TEXT NOT NULL,
  eyebrow TEXT NOT NULL,
  hero_title_line_1 TEXT NOT NULL,
  hero_title_line_2 TEXT,
  hero_subtitle TEXT NOT NULL,
  description TEXT NOT NULL,
  icon TEXT NOT NULL,
  eyebrow_class TEXT,
  glow_class TEXT,
  form_glow_class TEXT,
  service_status_note TEXT,
  enabled INTEGER NOT NULL DEFAULT 1,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at INTEGER NOT NULL DEFAULT (unixepoch()),
  updated_at INTEGER NOT NULL DEFAULT (unixepoch())
);

