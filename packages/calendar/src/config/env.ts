type EnvLike = Record<string, string | undefined> | undefined | null

export function requireEnv(env: EnvLike, key: string): string {
	const value = env?.[key]
	if (!value) {
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
	return value ?? fallback
}
