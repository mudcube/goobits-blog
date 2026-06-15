-- Per-event timezone tracking.
--
-- Until now, events implicitly used the global VENUE_TIMEZONE
-- ('America/Los_Angeles') for recurrence + display. This migration adds
-- an explicit `timezone` column so events can be anchored to a different
-- IANA timezone — useful for travel events ("Adventure: Tokyo") or
-- multi-venue layouts. Existing rows are backfilled with the venue
-- default.
--
-- Display + recurrence code reads this column and passes it to
-- `addWeeksInTimezone()`. The legacy `addWeeksInVenueTime(iso, weeks)`
-- helper still exists as a thin wrapper for callers that haven't been
-- updated yet — it just delegates with VENUE_TIMEZONE.
--
-- The UI doesn't yet expose a timezone picker; new events written
-- through the admin path inherit the venue default. A future PR adds
-- the picker once the UX is decided.

ALTER TABLE calendar_events
  ADD COLUMN timezone TEXT NOT NULL DEFAULT 'America/Los_Angeles';
