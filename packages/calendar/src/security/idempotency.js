export function normalizeIdempotencyKey(key) {
	return key?.trim() || null
}
