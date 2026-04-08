import { ADMIN_URL, withAdminPage } from './_helpers'

export async function runAdminLoginSmoke() {
	await withAdminPage(async (page, context) => {
		const hasSessionCookie = (await context.cookies(ADMIN_URL)).some((cookie) => cookie.name === 'admin_session')
		if (!hasSessionCookie) throw new Error('admin session cookie missing after login')
		if (!page.url().startsWith(ADMIN_URL)) {
			throw new Error(`expected to be on admin route after bootstrap, got ${page.url()}`)
		}
		await page.waitForSelector('.social-admin', { timeout: 30_000 })

		console.log('[admin-login-smoke] PASS')
	})
}
