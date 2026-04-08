import { BASE_URL } from './_config'
import { withPage } from './_helpers'

export async function runAuthRegisterSmoke() {
	await withPage(async (page) => {
		await page.goto(`${BASE_URL}/register`, { waitUntil: 'domcontentloaded', timeout: 30000 })
		await page.getByTestId('register-form').waitFor({ state: 'visible', timeout: 30000 })

		const hasForm = await page.getByTestId('register-form').count()
		if (!hasForm) throw new Error('register form not found')

		await page.getByTestId('register-name').fill('Smoke Tester')
		await page.getByTestId('register-email').fill(`smoke-${Date.now()}@example.com`)
		await page.getByTestId('register-password').fill('SmokePassword123')

		// Force a bot-like fast submit; should be rejected by min-fill-time check.
		await page.getByTestId('register-started-at').evaluate((el) => {
			el.value = String(Date.now())
		})

		await page.getByTestId('register-submit-row').locator('button[type="submit"]').click()

		const url = page.url()
		if (!url.includes('/register')) {
			throw new Error(`expected to remain on /register after fast submit, got ${url}`)
		}

		await page.getByTestId('register-error').waitFor({ state: 'visible', timeout: 5000 })
		const hasError = (await page.getByTestId('register-error').count()) > 0
		if (!hasError) {
			throw new Error('expected anti-abuse error message after fast submit')
		}

		// Verify invalid token path redirects to login with invalid marker.
		await page.goto(`${BASE_URL}/verify-email?token=invalid&email=test@example.com`, {
			waitUntil: 'domcontentloaded',
			timeout: 30000
		})
		await page.waitForURL(/\/schedule\/login\/?\?verified=invalid/, { timeout: 30000 })
		if (!/\/schedule\/login\/?\?verified=invalid/.test(page.url())) {
			throw new Error(`unexpected verify-email redirect target: ${page.url()}`)
		}

		console.log('[auth-register-smoke] PASS')
	})
}
