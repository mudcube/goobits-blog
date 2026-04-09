import { BASE_URL, NAV_TIMEOUT_MS } from './_config';
import { withBrowserContext } from './_helpers';
import { shouldIgnoreKnownConsoleError, shouldIgnoreTurnstileNoise } from './_noise';

const SITEMAP_URL = `${BASE_URL}/sitemap.xml`;

function unique(values) {
	return [...new Set(values)];
}

function parseSitemapLocs(xmlText) {
	const matches = [...xmlText.matchAll(/<loc>(.*?)<\/loc>/g)].map((m) => m[1]?.trim()).filter(Boolean);
	return unique(matches);
}

async function fetchSitemapUrls() {
	const res = await fetch(SITEMAP_URL);
	if (!res.ok) {
		throw new Error(`Failed to load sitemap.xml (${res.status}) at ${SITEMAP_URL}`);
	}
	const xml = await res.text();
	const urls = parseSitemapLocs(xml);
	if (urls.length === 0) {
		throw new Error(`No <loc> entries found in sitemap.xml at ${SITEMAP_URL}`);
	}
	return urls;
}

export async function runSitemapSmoke() {
	const urls = await fetchSitemapUrls();
	console.log(`[sitemap-smoke] Checking ${urls.length} URL(s) from ${SITEMAP_URL}`);

	const failures = [];
	await withBrowserContext(async (context) => {
		for (const url of urls) {
			const page = await context.newPage();
			const pageIssues = [];

			page.on('console', (msg) => {
				if (msg.type() !== 'error') return;
				const text = msg.text();
				if (shouldIgnoreKnownConsoleError(text)) return;
				if (shouldIgnoreTurnstileNoise(url, text)) return;
				pageIssues.push({ type: 'console-error', detail: text });
			});

			page.on('pageerror', (err) => {
				const detail = err?.message || String(err);
				if (shouldIgnoreTurnstileNoise(url, detail)) return;
				pageIssues.push({ type: 'page-error', detail });
			});

			page.on('response', (res) => {
				const status = res.status();
				if (status >= 500) {
					pageIssues.push({ type: 'response-5xx', detail: `${status} ${res.url()}` });
				}
			});

			try {
				const response = await page.goto(url, { waitUntil: 'domcontentloaded', timeout: NAV_TIMEOUT_MS });
				if (!response) {
					pageIssues.push({ type: 'navigation', detail: 'No response from page.goto()' });
				} else {
					const status = response.status();
					if (status >= 500) {
						pageIssues.push({ type: 'navigation-5xx', detail: `${status} ${url}` });
					}
				}
				await page.waitForLoadState('networkidle', { timeout: 2_000 }).catch(() => {});
			} catch (error) {
				pageIssues.push({ type: 'navigation-exception', detail: error?.message || String(error) });
			}

			await page.close();

			if (pageIssues.length > 0) {
				failures.push({ url, issues: pageIssues });
			}
		}
	});

	if (failures.length > 0) {
		console.error(`\n[sitemap-smoke] FAIL: ${failures.length} URL(s) reported issues.`);
		for (const failure of failures) {
			console.error(`\n- ${failure.url}`);
			for (const issue of failure.issues) {
				console.error(`  [${issue.type}] ${issue.detail}`);
			}
		}
		throw new Error(`[sitemap-smoke] ${failures.length} URL(s) reported issues.`);
	}

	console.log('[sitemap-smoke] PASS: no console errors, page errors, or 5xx responses detected.');
}
