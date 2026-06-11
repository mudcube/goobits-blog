const FALLBACK_CALENDAR_SITE_URL = 'https://calendar.example.com'

type PlatformEnv = Record<string, string | undefined> | undefined

function getCalendarSiteBase(env: PlatformEnv) {
	const raw =
		env?.['PUBLIC_CALENDAR_SITE_URL'] ||
		process.env['PUBLIC_CALENDAR_SITE_URL'] ||
		FALLBACK_CALENDAR_SITE_URL

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
