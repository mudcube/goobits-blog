-- Remove legacy invite codes that don't match the new friendly format
-- (word-word-number, e.g., sunny-otter-4217). The friendly format always
-- contains at least one separator (-, ., or !).
--
-- Old formats removed:
--   * 24-char hex strings (e.g., 3703d6f43892a075cce88b6c)
--   * Test prefixed codes (e.g., testinvite00000000000001)
--
-- New friendly codes always have a separator, so we delete codes that
-- contain only [a-z0-9] (no dashes/dots/bangs).

DELETE FROM calendar_invite_redemptions
WHERE invite_id IN (
	SELECT id FROM calendar_invites
	WHERE code NOT GLOB '*[-.!]*'
);

DELETE FROM calendar_invites
WHERE code NOT GLOB '*[-.!]*';
