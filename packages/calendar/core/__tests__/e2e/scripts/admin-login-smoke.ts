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

		// If already authed, we're done.
		const alreadyAuthed = (await page.locator('.admin-page__sidebar').count()) > 0
		if (alreadyAuthed) {
			console.log('[admin-login-smoke] PASS (already authed)')
			return
		}

		const hasLogin = (await page.locator('.admin-login').count()) > 0
		if (!hasLogin) throw new Error('admin login form not found')

		// UI-driven login (real form submit + redirect).
		await page.fill('input[name="password"]', passcode)
		const navWait = page
			.waitForURL((url) => url.pathname.startsWith('/admin/overview'), { timeout: 30000 })
			.catch(() => null)
		await page.click('button[type="submit"]')
		await navWait

		// Load /admin/ fresh to ensure hooks/session are valid server-side after login.
		await page.goto(ADMIN_URL, { waitUntil: 'domcontentloaded', timeout: 30000 })
		await page.locator('.admin-page__sidebar').first().waitFor({ timeout: 30000 })

		const hasSidebar = (await page.locator('.admin-page__sidebar').count()) > 0
		if (!hasSidebar) {
			const errorText = await page.locator('.admin-login__error').first().textContent().catch(() => '')
			throw new Error(`expected to be authed after login, but sidebar not found. error=${JSON.stringify(errorText || '')}`)
		}

		console.log('[admin-login-smoke] PASS')
	} finally {
		await context.close()
		await browser.close()
	}
}
