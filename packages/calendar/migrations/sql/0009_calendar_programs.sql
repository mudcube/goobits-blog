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

INSERT OR IGNORE INTO calendar_programs (
  slug, label, activity_name, page_title, eyebrow,
  hero_title_line_1, hero_title_line_2, hero_subtitle, description, icon,
  eyebrow_class, glow_class, form_glow_class, service_status_note,
  enabled, sort_order
) VALUES
  ('gym', 'Gym', 'Rainbow Gym', 'Gym | Rainbow Gym | MIKO.ART', 'Rainbow Gym',
   'Hang out. Work out.', 'Whatever.', 'Grab a time slot and let''s do something fun together.',
   'Book sessions and work out together', '💪',
   NULL, NULL, NULL, NULL, 1, 10),
  ('circus', 'Circus', 'Rainbow Circus', 'Circus | Rainbow Gym | MIKO.ART', 'Rainbow Circus',
   'Fly high. Spin fast.', 'Be brave.', 'Aerial arts and circus skills training for all levels.',
   'Aerial arts and circus skills', '🎪',
   'eyebrow-circus', 'glow-circus', 'form-glow-circus', NULL, 1, 20),
  ('adventure', 'Adventure', 'Rainbow Adventure', 'Adventure | Rainbow Gym | MIKO.ART', 'Rainbow Adventure',
   'Get outside.', 'Find something new.', 'Outdoor excursions and group adventures in the Pacific Northwest.',
   'Outdoor excursions and trips', '🏔️',
   'eyebrow-adventure', 'glow-adventure', 'form-glow-adventure', NULL, 1, 30),
  ('movie-night', 'Movies', 'Movie Night', 'Movie Night | Rainbow Gym | MIKO.ART', 'Movie Night',
   'Grab some snacks.', 'Watch together.', 'Community movie screenings and cozy film nights.',
   'Community film screenings', '🎬',
   'eyebrow-movie', 'glow-movie', 'form-glow-movie', NULL, 1, 40);

