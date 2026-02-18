import { dev } from '$app/environment'
import { getDevDb } from '../dev/devDb'
import type { D1DatabaseLike } from '../dev/types'

export type RuntimeEnv = {
	DB: D1DatabaseLike
	[key: string]: string | D1DatabaseLike | undefined
}

type PlatformLike = {
	env?: { DB?: D1DatabaseLike; [key: string]: string | D1DatabaseLike | undefined }
} | null | undefined

/**
 * Builds the environment object for SvelteKit API/loader handlers.
 *
 * Production: Uses Cloudflare D1 from platform.env.DB
 * Development: Falls back to local SQLite with a D1-compatible wrapper
 */
export async function buildEnv(platform: PlatformLike): Promise<RuntimeEnv> {
	// Development: use local SQLite to avoid relying on external bindings.
	if (dev) {
		const cachedDevDb = await getDevDb()
		return {
			...process.env,
			DB: cachedDevDb
		} as RuntimeEnv
	}

	if (platform?.env?.DB) {
		return {
			...Object.fromEntries(Object.entries(process.env).filter(([, v]) => typeof v === 'string')),
			...platform.env
		} as RuntimeEnv
	}

	throw new Error('Database not available. Ensure D1 is configured in wrangler.toml.')
}
