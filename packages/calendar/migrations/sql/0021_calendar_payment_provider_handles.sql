INSERT OR IGNORE INTO calendar_admin_settings (key, value, updated_at)
VALUES
  ('payment_handle_venmo', null, unixepoch()),
  ('payment_handle_paypal', null, unixepoch()),
  ('payment_handle_cashapp', null, unixepoch());
