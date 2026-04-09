import type { Cookies } from '@sveltejs/kit'

export type DevSurface = 'staging' | 'dev'

export const DEV_SURFACE_COOKIE = 'site-dev-surface'
export const DEFAULT_DEV_SURFACE: DevSurface = 'dev'

export function normalizeDevSurface(value: string | null | undefined): DevSurface {
	return value === 'staging' ? 'staging' : 'dev'
}

export function getDevSurface(cookies?: Cookies): DevSurface {
	return normalizeDevSurface(cookies?.get(DEV_SURFACE_COOKIE))
}
