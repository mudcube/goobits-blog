import { BASE_URL, NAV_TIMEOUT_MS } from './_config'
import { withBrowserContext } from './_helpers'
import { shouldIgnoreKnownConsoleError, shouldIgnoreTurnstileNoise } from './_noise'

const SITEMAP_URL = `${BASE_URL}/sitemap.xml`
const EXTRA_PATHS = ['/', '/sitemap/', '/robots.txt', '/journal/rss.xml', '/blog/rss.xml']

function unique(values: string[]) {
	return [...new Set(values)]
}

function normalizePathname(value: string) {
	if (!value) return '/'
	const url = new URL(value, BASE_URL)
	let pathname = url.pathname || '/'
	if (pathname.length > 1 && pathname.endsWith('/')) pathname = pathname.slice(0, -1)
	return pathname || '/'
}

function mapSitemapUrlToBaseUrl(value: string) {
	const url = new URL(value, BASE_URL)
	return new URL(url.pathname + url.search + url.hash, BASE_URL).toString()
}

function parseSitemapLocs(xmlText: string) {
	const matches = [...xmlText.matchAll(/<loc>(.*?)<\/loc>/g)]
		.map((m) => m[1]?.trim())
		.filter((value): value is string => Boolean(value))
		.map((value) => mapSitemapUrlToBaseUrl(value))
	return unique(matches)
}

async function fetchSitemapUrls() {
	const res = await fetch(SITEMAP_URL)
	if (!res.ok) {
		throw new Error(`Failed to load sitemap.xml (${res.status}) at ${SITEMAP_URL}`)
	}
	const xml = await res.text()
	const urls = parseSitemapLocs(xml)
	if (urls.length === 0) {
		throw new Error(`No <loc> entries found in sitemap.xml at ${SITEMAP_URL}`)
	}
	return urls
}

function sameOrigin(url: string) {
	return new URL(url).origin === new URL(BASE_URL).origin
}

function shouldIgnoreConsoleIssue(pageUrl: string, type: string, text: string) {
	if (type === 'error' && shouldIgnoreKnownConsoleError(text)) return true
	if (shouldIgnoreTurnstileNoise(pageUrl, text)) return true
	return false
}

function shouldIgnoreRequestFailure(url: string) {
	return url.endsWith('/favicon.ico')
}

export async function runBuiltRouteScan() {
	const sitemapUrls = await fetchSitemapUrls()
	const urls = unique([
		...sitemapUrls,
		...EXTRA_PATHS.map((path) => new URL(path, BASE_URL).toString())
	])

	console.log(`[built-route-scan] Checking ${urls.length} URL(s) from ${SITEMAP_URL}`)

	const failures: Array<{ url: string; issues: Array<{ type: string; detail: string }> }> = []
	await withBrowserContext(async (context) => {
		for (const url of urls) {
			const page = await context.newPage()
			const pageIssues: Array<{ type: string; detail: string }> = []

			page.on('console', (msg) => {
				if (msg.type() !== 'error' && msg.type() !== 'warning') return
				const text = msg.text()
				if (shouldIgnoreConsoleIssue(url, msg.type(), text)) return
				pageIssues.push({ type: `console-${msg.type()}`, detail: text })
			})

			page.on('pageerror', (err) => {
				const detail = err?.message || String(err)
				if (shouldIgnoreTurnstileNoise(url, detail)) return
				pageIssues.push({ type: 'page-error', detail })
			})

			page.on('requestfailed', (request) => {
				const requestUrl = request.url()
				if (!sameOrigin(requestUrl)) return
				if (shouldIgnoreRequestFailure(requestUrl)) return
				const detail = `${request.method()} ${requestUrl} :: ${request.failure()?.errorText || 'request failed'}`
				pageIssues.push({ type: 'request-failed', detail })
			})

			page.on('response', (response) => {
				if (!sameOrigin(response.url())) return
				const status = response.status()
				if (status < 400) return
				if (shouldIgnoreRequestFailure(response.url())) return
				pageIssues.push({ type: 'response-4xx5xx', detail: `${status} ${response.url()}` })
			})

			try {
				const response = await page.goto(url, { waitUntil: 'domcontentloaded', timeout: NAV_TIMEOUT_MS })
				if (!response) {
					pageIssues.push({ type: 'navigation', detail: 'No response from page.goto()' })
				} else if (response.status() >= 400) {
					pageIssues.push({ type: 'navigation-4xx5xx', detail: `${response.status()} ${url}` })
				}
				await page.waitForLoadState('networkidle', { timeout: 5_000 }).catch(() => {})
			} catch (error) {
				pageIssues.push({ type: 'navigation-exception', detail: error instanceof Error ? error.message : String(error) })
			}

			await page.close()

			if (pageIssues.length > 0) {
				failures.push({ url, issues: pageIssues })
			}
		}
	})

	if (failures.length > 0) {
		console.error(`\n[built-route-scan] FAIL: ${failures.length} URL(s) reported issues.`)
		for (const failure of failures) {
			console.error(`\n- ${normalizePathname(failure.url)}`)
			for (const issue of failure.issues) {
				console.error(`  [${issue.type}] ${issue.detail}`)
			}
		}
		throw new Error(`[built-route-scan] ${failures.length} URL(s) reported issues.`)
	}

	console.log('[built-route-scan] PASS: no route resolution, console, page, or request issues detected.')
}
