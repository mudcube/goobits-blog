import type { Cookies } from '@sveltejs/kit'

export type Target = 'staging' | 'dev'

export const TARGET_COOKIE = 'site-target'
export const LEGACY_TARGET_COOKIE = 'site-dev-surface'
export const DEFAULT_TARGET: Target = 'dev'

export function normalizeTarget(value: string | null | undefined): Target {
	return value === 'staging' ? 'staging' : 'dev'
}

export function getTarget(cookies?: Cookies): Target {
	return normalizeTarget(cookies?.get(TARGET_COOKIE) ?? cookies?.get(LEGACY_TARGET_COOKIE))
}
