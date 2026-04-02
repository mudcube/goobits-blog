import { chromium } from 'playwright'
import fs from 'fs/promises'
import path from 'path'

const baseUrl = 'http://127.0.0.1:3610'
const outputDir = path.resolve('tmp/playwright-main-pages')

const viewports = [
	{ name: 'iphone-se', width: 375, height: 667, isMobile: true },
	{ name: 'iphone-14', width: 390, height: 844, isMobile: true },
	{ name: 'ipad', width: 768, height: 1024, isMobile: true },
	{ name: 'laptop', width: 1280, height: 800, isMobile: false },
	{ name: 'desktop', width: 1440, height: 900, isMobile: false }
]

const pages = [
	{ name: 'home', path: '/' },
	{ name: 'about', path: '/about' },
	{ name: 'contact', path: '/contact' }
]

await fs.mkdir(outputDir, { recursive: true })

const browser = await chromium.launch({ headless: true })
const results = []

for (const viewport of viewports) {
	const context = await browser.newContext({
		baseURL: baseUrl,
		viewport: { width: viewport.width, height: viewport.height },
		isMobile: viewport.isMobile
	})

	for (const pageConfig of pages) {
		const page = await context.newPage()
		const consoleMessages = []
		const pageErrors = []
		const failedRequests = []

		page.on('console', (msg) => {
			if (msg.type() === 'error' || msg.type() === 'warning') {
				consoleMessages.push(`${msg.type()}: ${msg.text()}`)
			}
		})
		page.on('pageerror', (err) => {
			pageErrors.push(String(err))
		})
		page.on('requestfailed', (request) => {
			failedRequests.push(`${request.method()} ${request.url()} :: ${request.failure()?.errorText || 'failed'}`)
		})

		const response = await page.goto(pageConfig.path, { waitUntil: 'networkidle' })
		await page.screenshot({
			path: path.join(outputDir, `${pageConfig.name}-${viewport.name}.png`),
			fullPage: true
		})

		const metrics = await page.evaluate(() => {
			const html = document.documentElement
			const body = document.body
			const header = document.querySelector('header')
			const main = document.querySelector('main')

			return {
				title: document.title,
				innerWidth: window.innerWidth,
				scrollWidth: Math.max(html.scrollWidth, body?.scrollWidth || 0),
				hasHorizontalOverflow: Math.max(html.scrollWidth, body?.scrollWidth || 0) > window.innerWidth + 1,
				headerHeight: header ? Math.round(header.getBoundingClientRect().height) : 0,
				mainTop: main ? Math.round(main.getBoundingClientRect().top) : null,
				bodyTextSample: body?.innerText?.slice(0, 200) || ''
			}
		})

		results.push({
			page: pageConfig.name,
			path: pageConfig.path,
			viewport: viewport.name,
			width: viewport.width,
			height: viewport.height,
			status: response?.status() ?? null,
			finalUrl: page.url(),
			consoleMessages,
			pageErrors,
			failedRequests,
			...metrics
		})

		await page.close()
	}

	await context.close()
}

await browser.close()

const reportPath = path.join(outputDir, 'report.json')
await fs.writeFile(reportPath, JSON.stringify(results, null, 2))
console.log(JSON.stringify({ outputDir, reportPath, results }, null, 2))
