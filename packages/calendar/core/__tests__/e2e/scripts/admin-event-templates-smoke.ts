import { BASE_URL, withAdminPage } from './_helpers'

export async function runAdminEventTemplatesSmoke() {
	await withAdminPage(async (page, context) => {
		await page.waitForSelector('.social-admin', { timeout: 30_000 })

		const res = await context.request.get(`${BASE_URL}/api/admin/events/templates`)
		if (!res.ok()) throw new Error(`templates GET failed: ${res.status()}`)
		const payload = await res.json() as { templates?: unknown[] }
		if (!Array.isArray(payload.templates)) throw new Error('templates payload invalid')

		console.log('[admin-event-templates-smoke] PASS')
	})
}
