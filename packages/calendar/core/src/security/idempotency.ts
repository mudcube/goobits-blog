export function normalizeIdempotencyKey(key: unknown) {
	if (!key || typeof key !== 'string') return null
	const trimmed = key.trim()
	if (!trimmed) return null
	if (trimmed.length < 16 || trimmed.length > 128) return null
	return trimmed
}
