import { chromium, type BrowserContext, type BrowserContextOptions, type Page } from 'playwright'

export async function withBrowserContext<T>(
	run: (context: BrowserContext) => Promise<T>,
	options: BrowserContextOptions = {}
) {
	const browser = await chromium.launch({ headless: true })
	const context = await browser.newContext(options)

	try {
		return await run(context)
	} finally {
		await context.close()
		await browser.close()
	}
}

export async function withPage<T>(
	run: (page: Page, context: BrowserContext) => Promise<T>,
	options: BrowserContextOptions = {}
) {
	return withBrowserContext(async (context) => {
		const page = await context.newPage()

		try {
			return await run(page, context)
		} finally {
			await page.close()
		}
	}, options)
}

export function capturePageErrors(page: Page, shouldIgnore: (detail: string) => boolean = () => false) {
	const errors: string[] = []

	page.on('pageerror', (err) => {
		const detail = `pageerror: ${String(err)}`
		if (!shouldIgnore(detail)) errors.push(detail)
	})

	page.on('console', (msg) => {
		if (msg.type() !== 'error') return
		const detail = `console.error: ${msg.text()}`
		if (!shouldIgnore(detail)) errors.push(detail)
	})

	return errors
}

export function formatCollectedErrors(errors: string[]) {
	return errors.length ? `errors:\n- ${errors.join('\n- ')}\n` : 'errors: none\n'
}
