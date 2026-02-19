import { chromium } from 'playwright'
import { BASE_URL, getAdminPasscode } from './_helpers'

const ADMIN_URL = `${BASE_URL}/admin/`

export async function runAdminLoginSmoke() {
	const passcode = getAdminPasscode()
	if (!passcode) throw new Error('ADMIN_PASSCODE not available (set env var or configure config/env/.env)')

	const browser = await chromium.launch({ headless: true })
	const context = await browser.newContext()
	const page = await context.newPage()

	try {
		await page.goto(ADMIN_URL, { waitUntil: 'domcontentloaded', timeout: 30000 })
		const hasLogin = (await page.locator('.admin-login').count()) > 0
		if (hasLogin) {
			// UI-driven login (real form submit + redirect).
			await page.fill('input[name="password"]', passcode)
			const navWait = page
				.waitForURL((url) => url.pathname.startsWith('/admin'), { timeout: 30000 })
				.catch(() => null)
			await page.click('button[type="submit"]')
			await navWait
		}

		// Load /admin/ fresh to ensure hooks/session are valid server-side after login.
		await page.goto(ADMIN_URL, { waitUntil: 'domcontentloaded', timeout: 30000 })
		const hasSessionCookie = (await context.cookies(ADMIN_URL)).some((cookie) => cookie.name === 'admin_session')
		if (!hasSessionCookie) throw new Error('admin session cookie missing after login')

		const stillAtLogin = (await page.locator('.admin-login').count()) > 0
		if (stillAtLogin) {
			const errorText = await page.locator('.admin-login__error').first().textContent().catch(() => '')
			throw new Error(`expected to be authed after login, but login form is still visible. error=${JSON.stringify(errorText || '')}`)
		}

		console.log('[admin-login-smoke] PASS')
	} finally {
		await context.close()
		await browser.close()
	}
}
