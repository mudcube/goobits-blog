import { chromium, type BrowserContext, type Page } from 'playwright'
import { execSync } from 'node:child_process'

export const BASE_URL = process.env['E2E_BASE_URL'] || 'http://localhost:3610'
export const ADMIN_URL = `${BASE_URL}/schedule/admin/`

export function getAdminPasscode() {
	if (process.env['ADMIN_PASSCODE']) return process.env['ADMIN_PASSCODE']
	try {
		// Pull the decrypted value from the same env file used by dev/build scripts.
		return execSync('pnpm exec dotenvx get ADMIN_PASSCODE -f config/env/.env', {
			stdio: ['ignore', 'pipe', 'ignore']
		})
			.toString('utf8')
			.trim()
	} catch {
		return ''
	}
}

export function getE2ETestToken() {
	if (process.env['E2E_TEST_TOKEN']) return process.env['E2E_TEST_TOKEN']
	try {
		return execSync('pnpm exec dotenvx get E2E_TEST_TOKEN -f config/env/.env', {
			stdio: ['ignore', 'pipe', 'ignore']
		})
			.toString('utf8')
			.trim()
	} catch {
		return getAdminPasscode()
	}
}

export async function bootstrapAdminSession(request: import('playwright').APIRequestContext) {
	const token = getE2ETestToken() || getAdminPasscode()
	if (!token) throw new Error('E2E test token not available')

	const response = await request.post(`${BASE_URL}/api/test/admin-session`, {
		headers: { authorization: `Bearer ${token}` }
	})

	if (!response.ok()) {
		throw new Error(`admin session bootstrap failed: ${response.status()}`)
	}
}

export async function withBrowserContext<T>(run: (context: BrowserContext) => Promise<T>) {
	const browser = await chromium.launch({ headless: true })
	const context = await browser.newContext()

	try {
		return await run(context)
	} finally {
		await context.close()
		await browser.close()
	}
}

export async function withAdminPage<T>(run: (page: Page, context: BrowserContext) => Promise<T>) {
	return withBrowserContext(async (context) => {
		const page = await context.newPage()

		try {
			await bootstrapAdminSession(context.request)
			await page.goto(`${ADMIN_URL}?preview=1`, { waitUntil: 'domcontentloaded', timeout: 30000 })
			return await run(page, context)
		} finally {
			await page.close()
		}
	})
}

export async function bootstrapCalendarSession(
	request: import('playwright').APIRequestContext,
	input: { email?: string; name?: string } = {}
) {
	const token = getE2ETestToken() || getAdminPasscode()
	if (!token) throw new Error('E2E test token not available')

	const response = await request.post(`${BASE_URL}/api/test/calendar-session`, {
		headers: { authorization: `Bearer ${token}` },
		data: {
			email: input.email || `e2e-calendar-${Date.now()}@example.com`,
			name: input.name || 'E2E Calendar User'
		}
	})

	if (!response.ok()) {
		throw new Error(`calendar session bootstrap failed: ${response.status()}`)
	}
}
