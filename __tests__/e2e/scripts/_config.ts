export const BASE_URL = process.env.E2E_BASE_URL || 'http://localhost:3610'

export const SHARED_LAYOUT_ROUTES = [
	'/',
	'/about',
	'/labs',
	'/journal',
	'/contact',
	'/privacy',
	'/terms',
	'/cookies'
]

export const NAV_TIMEOUT_MS = Number(process.env.E2E_NAV_TIMEOUT_MS || 20_000)
