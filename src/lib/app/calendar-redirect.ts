const PRODUCTION_FALLBACK_CALENDAR_SITE_URL = 'https://pdx.fun'
const LOCAL_FALLBACK_CALENDAR_SITE_URL = 'http://127.0.0.1:3611'

type PlatformEnv = Record<string, string | undefined> | undefined

function getCalendarSiteBase(env: PlatformEnv) {
	const isDevelopment = process.env['NODE_ENV'] === 'development'
	const raw = isDevelopment
		? process.env['PUBLIC_CALENDAR_SITE_DEV_URL'] || LOCAL_FALLBACK_CALENDAR_SITE_URL
		: env?.['PUBLIC_CALENDAR_SITE_URL'] ||
			process.env['PUBLIC_CALENDAR_SITE_URL'] ||
			PRODUCTION_FALLBACK_CALENDAR_SITE_URL

	return raw.replace(/\/+$/, '')
}

export function buildCalendarRedirectUrl(pathname: string, search: string, env: PlatformEnv) {
	const base = getCalendarSiteBase(env)
	const normalizedPath = pathname.startsWith('/schedule')
		? pathname.replace(/^\/schedule/, '') || '/'
		: pathname
	const url = new URL(normalizedPath, `${base}/`)
	url.search = search
	return url.toString()
}
