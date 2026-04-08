import { chromium } from 'playwright'

const BASE_URL = process.env.E2E_BASE_URL || 'http://localhost:3610'

export async function runAuthRegisterSmoke() {
	const browser = await chromium.launch({ headless: true })
	const context = await browser.newContext()
	const page = await context.newPage()

	try {
		await page.goto(`${BASE_URL}/register`, { waitUntil: 'networkidle', timeout: 30000 })

		const hasForm = await page.getByTestId('register-form').count()
		if (!hasForm) throw new Error('register form not found')

		await page.getByTestId('register-name').fill('Smoke Tester')
		await page.getByTestId('register-email').fill(`smoke-${Date.now()}@example.com`)
		await page.getByTestId('register-password').fill('SmokePassword123')

		// Force a bot-like fast submit; should be rejected by min-fill-time check.
		await page.getByTestId('register-started-at').evaluate((el) => {
			el.value = String(Date.now())
		})

		await Promise.all([
			page.waitForLoadState('networkidle', { timeout: 15000 }),
			page.getByTestId('register-submit-row').locator('button[type="submit"]').click()
		])

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
			waitUntil: 'networkidle',
			timeout: 30000
		})
		if (!/\/schedule\/login\/?\?verified=invalid/.test(page.url())) {
			throw new Error(`unexpected verify-email redirect target: ${page.url()}`)
		}

		console.log('[auth-register-smoke] PASS')
	} finally {
		await context.close()
		await browser.close()
	}
}
