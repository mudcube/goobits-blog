import { chromium } from 'playwright'
import { BASE_URL, bootstrapAdminSession } from './_helpers'

const ADMIN_URL = `${BASE_URL}/schedule/admin/`

export async function runAdminLoginSmoke() {
	const browser = await chromium.launch({ headless: true })
	const context = await browser.newContext()
	const page = await context.newPage()

	try {
		await bootstrapAdminSession(context.request)
		await page.goto(`${ADMIN_URL}?preview=1`, { waitUntil: 'domcontentloaded', timeout: 30000 })
		const hasSessionCookie = (await context.cookies(ADMIN_URL)).some((cookie) => cookie.name === 'admin_session')
		if (!hasSessionCookie) throw new Error('admin session cookie missing after login')
		if (!page.url().startsWith(ADMIN_URL)) {
			throw new Error(`expected to be on admin route after bootstrap, got ${page.url()}`)
		}

		console.log('[admin-login-smoke] PASS')
	} finally {
		await context.close()
		await browser.close()
	}
}
