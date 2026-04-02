const FALLBACK_SITE_ORIGIN = 'https://miko.art'

function trimTrailingSlash(value: string) {
	return value.endsWith('/') ? value.slice(0, -1) : value
}

function isLocalOrigin(origin: string) {
	try {
		const { hostname } = new URL(origin)
		return hostname === 'localhost' || hostname === '127.0.0.1' || hostname.endsWith('.local')
	} catch {
		return true
	}
}

export function resolveSiteOrigin({ baseUrl, requestUrl }: { baseUrl?: string; requestUrl?: URL }) {
	if (baseUrl) {
		try {
			return trimTrailingSlash(new URL(baseUrl).origin)
		} catch {
			// Ignore invalid BASE_URL and continue to fallback resolution.
		}
	}

	if (requestUrl && !isLocalOrigin(requestUrl.origin)) {
		return trimTrailingSlash(requestUrl.origin)
	}

	return FALLBACK_SITE_ORIGIN
}

export function getPlatformEnv(platform: unknown): Record<string, string | undefined> | undefined {
	try {
		return (platform as { env?: Record<string, string | undefined> } | undefined)?.env
	} catch {
		return undefined
	}
}

export function getBaseUrl(platformEnv: Record<string, string | undefined> | undefined) {
	const processBaseUrl = process.env['PUBLIC_BASE_URL'] || process.env['BASE_URL']
	if (processBaseUrl) return processBaseUrl

	try {
		return platformEnv?.['PUBLIC_BASE_URL'] || platformEnv?.['BASE_URL']
	} catch {
		return undefined
	}
}

export function formatSitemapLastMod(isoString: string) {
	const date = new Date(isoString)
	return Number.isNaN(date.getTime()) ? new Date().toISOString() : date.toISOString()
}

export function escapeXml(value: string) {
	return value
		.replaceAll('&', '&amp;')
		.replaceAll('<', '&lt;')
		.replaceAll('>', '&gt;')
		.replaceAll('"', '&quot;')
		.replaceAll("'", '&apos;')
}

export function toAbsoluteUrl(origin: string, path: string) {
	const normalizedPath = path.startsWith('/') ? path : `/${path}`
	return `${trimTrailingSlash(origin)}${normalizedPath}`
}
