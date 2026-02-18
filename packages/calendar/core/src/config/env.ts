type EnvLike = Record<string, unknown> | undefined | null

export function requireEnv(env: EnvLike, key: string): string {
	const value = env?.[key]
	if (typeof value !== 'string' || value.length === 0) {
		throw new Error(`Missing required env: ${key}`)
	}
	return value
}

export function getEnv(
	env: EnvLike,
	key: string,
	fallback?: string
): string | undefined {
	const value = env?.[key]
	return typeof value === 'string' ? value : fallback
}
