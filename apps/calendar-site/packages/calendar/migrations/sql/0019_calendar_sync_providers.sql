ALTER TABLE calendar_event_sync ADD COLUMN outlook_event_id TEXT;
ALTER TABLE calendar_event_sync ADD COLUMN outlook_html_link TEXT;
ALTER TABLE calendar_event_sync ADD COLUMN apple_event_id TEXT;
ALTER TABLE calendar_event_sync ADD COLUMN apple_html_link TEXT;

INSERT OR IGNORE INTO calendar_admin_settings (key, value, updated_at)
VALUES ('sync_provider', null, unixepoch());
