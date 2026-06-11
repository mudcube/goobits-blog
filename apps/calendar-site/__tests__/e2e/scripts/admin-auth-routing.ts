import { chromium } from 'playwright'
import {
	ADMIN_URL,
	BASE_URL,
	ensureDevCalendarSession,
	withBrowserContext
} from './_helpers'

async function expectStatus(label: string, response: { status: () => number }, expected: number) {
	const status = response.status()
	if (status !== expected) {
		throw new Error(`${label}: expected ${expected}, got ${status}`)
	}
}

export async function runAdminAuthRouting() {
	await withBrowserContext(async (context) => {
		const response = await context.request.get(`${BASE_URL}/api/admin/users`)
		await expectStatus('no session admin api', response, 401)
	})

	await withBrowserContext(async (context) => {
		await ensureDevCalendarSession(context, {
			email: `non-admin-${Date.now()}@example.com`,
			name: 'Non Admin',
			admin: false
		})
		const response = await context.request.get(`${BASE_URL}/api/admin/users`)
		await expectStatus('non-admin admin api', response, 403)
	})

	const browser = await chromium.launch({ headless: true })
	const context = await browser.newContext()
	const page = await context.newPage()
	try {
		await ensureDevCalendarSession(context, {
			email: 'hello@pdx.fun',
			name: 'Miko Admin',
			admin: true
		})

		const apiResponse = await context.request.get(`${BASE_URL}/api/admin/users`)
		await expectStatus('admin api', apiResponse, 200)

		await page.goto(`${ADMIN_URL}?preview=1`, { waitUntil: 'domcontentloaded', timeout: 30_000 })
		await page.getByTestId('admin-dashboard-main').waitFor({ timeout: 30_000 })
	} finally {
		await page.close()
		await context.close()
		await browser.close()
	}
}
