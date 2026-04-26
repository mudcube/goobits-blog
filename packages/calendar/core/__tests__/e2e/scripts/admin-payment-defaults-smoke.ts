import { BASE_URL, withAdminPage } from './_helpers'

export async function runAdminPaymentDefaultsSmoke() {
	await withAdminPage(async (_page, context) => {
		const beforeRes = await context.request.get(`${BASE_URL}/api/admin/settings/payment`)
		if (!beforeRes.ok()) throw new Error(`payment defaults GET failed: ${beforeRes.status()}`)
		const before = await beforeRes.json() as { payment: { provider: string | null; handle: string | null } }

		const nextProvider = before.payment.provider === 'venmo' ? 'paypal' : 'venmo'
		const nextHandle = before.payment.handle === '@miko-e2e' ? '@miko-e2e-2' : '@miko-e2e'
		const putRes = await context.request.put(`${BASE_URL}/api/admin/settings/payment`, {
			headers: { origin: BASE_URL, 'content-type': 'application/json' },
			data: { provider: nextProvider, handle: nextHandle }
		})
		if (!putRes.ok()) throw new Error(`payment defaults PUT failed: ${putRes.status()}`)

		const afterRes = await context.request.get(`${BASE_URL}/api/admin/settings/payment`)
		if (!afterRes.ok()) throw new Error(`payment defaults verify GET failed: ${afterRes.status()}`)
		const after = await afterRes.json() as { payment: { provider: string | null; handle: string | null } }
		if (after.payment.provider !== nextProvider || after.payment.handle !== nextHandle) {
			throw new Error('payment defaults not persisted')
		}

		await context.request.put(`${BASE_URL}/api/admin/settings/payment`, {
			headers: { origin: BASE_URL, 'content-type': 'application/json' },
			data: before.payment
		})

		console.log('[admin-payment-defaults-smoke] PASS')
	})
}
