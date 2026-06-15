-- Phase 1 of the connections-credentials rename.
--
-- Background: the `connections` table was originally designed for OAuth
-- providers (Google/Outlook/Apple), where `access_token` and `refresh_token`
-- are accurate names. Payment integrations (PayPal/Square) reuse the same
-- table by overloading those columns with non-OAuth secrets:
--   PayPal:  access_token = clientId,        refresh_token = clientSecret
--   Square:  access_token = applicationId,   refresh_token = accessToken
-- This works (the values are encrypted at rest and round-trip correctly)
-- but the column names lie about the contents, which is a maintenance
-- footgun.
--
-- This migration ADDS neutral-named columns and backfills them from the
-- existing data. The old columns stay in place for rollback safety; a
-- follow-up migration (0028, deployed after this one is verified in
-- production) drops them.
--
-- All existing rows continue to work: the runtime reads `primary_credential`
-- with a fallback to `access_token`, and writes to both columns during the
-- transition window.

ALTER TABLE connections ADD COLUMN primary_credential TEXT;
ALTER TABLE connections ADD COLUMN secondary_credential TEXT;

-- Backfill: encrypted ciphertext copies as-is — no re-encryption needed.
UPDATE connections
SET
  primary_credential = access_token,
  secondary_credential = refresh_token
WHERE primary_credential IS NULL;
