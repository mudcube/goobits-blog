-- Admin sessions for server-side auth
CREATE TABLE IF NOT EXISTS admin_sessions (
  id TEXT PRIMARY KEY,
  expires_at INTEGER NOT NULL,
  created_at INTEGER NOT NULL DEFAULT (unixepoch())
);

-- Add cancel token to bookings for secure public cancellation
ALTER TABLE bookings ADD COLUMN cancel_token TEXT;

CREATE UNIQUE INDEX IF NOT EXISTS idx_bookings_cancel_token ON bookings (cancel_token);

CREATE INDEX IF NOT EXISTS idx_admin_sessions_expires ON admin_sessions (expires_at);
