import { ADMIN_URL, withAdminPage } from './_helpers'

export async function runAdminLoginSmoke() {
	await withAdminPage(async (page, context) => {
		const hasSessionCookie = (await context.cookies(ADMIN_URL)).some((cookie) => cookie.name === 'calendar_session')
		if (!hasSessionCookie) throw new Error('calendar session cookie missing after admin login')
		const adminOriginPath = new URL(ADMIN_URL)
		const current = new URL(page.url())
		if (current.origin !== adminOriginPath.origin || !current.pathname.startsWith('/admin')) {
			throw new Error(`expected to be on admin route after bootstrap, got ${page.url()}`)
		}
		await page.waitForSelector('.social-admin', { timeout: 30_000 })

		console.log('[admin-login-smoke] PASS')
	})
}
