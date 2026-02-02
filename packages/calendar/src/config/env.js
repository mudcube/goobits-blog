export function requireEnv(env, key) {
	const value = env?.[key]
	if (!value) {
		throw new Error(`Missing required env: ${key}`)
	}
	return value
}

export function getEnv(env, key, fallback = undefined) {
	const value = env?.[key]
	return value ?? fallback
}
