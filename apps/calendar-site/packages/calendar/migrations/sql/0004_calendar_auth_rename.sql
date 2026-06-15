-- Rename Rainbow auth tables to Calendar auth tables
ALTER TABLE rainbow_users RENAME TO calendar_users;
ALTER TABLE rainbow_invites RENAME TO calendar_invites;
ALTER TABLE rainbow_invite_redemptions RENAME TO calendar_invite_redemptions;
ALTER TABLE rainbow_sessions RENAME TO calendar_sessions;
ALTER TABLE rainbow_oauth_states RENAME TO calendar_oauth_states;
