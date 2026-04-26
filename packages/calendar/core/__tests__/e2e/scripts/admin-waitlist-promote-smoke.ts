import { BASE_URL, withAdminPage } from './_helpers'

export async function runAdminWaitlistPromoteSmoke() {
	await withAdminPage(async (_page, context) => {
		const res = await context.request.post(`${BASE_URL}/api/admin/events/999999/waitlist/999999/promote`, {
			headers: { origin: BASE_URL }
		})
		if (![400, 404].includes(res.status())) {
			throw new Error(`expected 400/404, got ${res.status()}`)
		}
		console.log('[admin-waitlist-promote-smoke] PASS')
	})
}
