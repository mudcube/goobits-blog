CREATE INDEX IF NOT EXISTS idx_calendar_users_email_normalized ON calendar_users(lower(email));
CREATE INDEX IF NOT EXISTS idx_admin_users_email_normalized ON admin_users(lower(email));

CREATE TRIGGER IF NOT EXISTS calendar_users_email_unique_insert
BEFORE INSERT ON calendar_users
WHEN EXISTS (
  SELECT 1 FROM calendar_users WHERE lower(email) = lower(NEW.email)
)
BEGIN
  SELECT RAISE(ABORT, 'calendar_users.email must be unique');
END;

CREATE TRIGGER IF NOT EXISTS calendar_users_email_unique_update
BEFORE UPDATE OF email ON calendar_users
WHEN EXISTS (
  SELECT 1 FROM calendar_users WHERE lower(email) = lower(NEW.email) AND id <> OLD.id
)
BEGIN
  SELECT RAISE(ABORT, 'calendar_users.email must be unique');
END;

CREATE TRIGGER IF NOT EXISTS admin_users_email_unique_insert
BEFORE INSERT ON admin_users
WHEN EXISTS (
  SELECT 1 FROM admin_users WHERE lower(email) = lower(NEW.email)
)
BEGIN
  SELECT RAISE(ABORT, 'admin_users.email must be unique');
END;

CREATE TRIGGER IF NOT EXISTS admin_users_email_unique_update
BEFORE UPDATE OF email ON admin_users
WHEN EXISTS (
  SELECT 1 FROM admin_users WHERE lower(email) = lower(NEW.email) AND id <> OLD.id
)
BEGIN
  SELECT RAISE(ABORT, 'admin_users.email must be unique');
END;
