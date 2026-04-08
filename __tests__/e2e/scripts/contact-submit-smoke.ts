import { BASE_URL } from './_config'
import { capturePageErrors, formatCollectedErrors, withPage } from './_helpers'

export async function runContactSubmitSmoke() {
	await withPage(async (page) => {
		const errors = capturePageErrors(page)

		await page.goto(`${BASE_URL}/contact`, { waitUntil: 'domcontentloaded', timeout: 30_000 })
		await page.waitForSelector('form.contact-page__form', { timeout: 30_000 })
		await page.waitForSelector('input[name="name"]', { timeout: 30_000 })

		await page.fill('input[name="name"]', 'E2E Contact User')
		await page.fill('input[name="email"]', `e2e-contact-${Date.now()}@example.com`)
		await page.fill('textarea[name="message"]', 'Hello from Playwright Vitest smoke test.')

		try {
			await Promise.all([
				page.waitForURL(/\/contact\/thank-you\/?$/, { timeout: 30_000 }),
				page.click('button[type="submit"]')
			])
		} catch (err) {
			throw new Error(
				`contact submit did not navigate (url=${page.url()}): ${String(err)}\n${formatCollectedErrors(errors)}`
			)
		}
	})
}
