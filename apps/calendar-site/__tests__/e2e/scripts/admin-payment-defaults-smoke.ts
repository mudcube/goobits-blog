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

export async function runAdminPaymentDefaultsEventFlowSmoke() {
	await withAdminPage(async (_page, context) => {
		const unique = Date.now()
		const beforeRes = await context.request.get(`${BASE_URL}/api/admin/settings/payment`)
		if (!beforeRes.ok()) throw new Error(`payment defaults GET failed: ${beforeRes.status()}`)
		const before = await beforeRes.json() as { payment: { provider: string | null; handle: string | null } }

		const putRes = await context.request.put(`${BASE_URL}/api/admin/settings/payment`, {
			headers: { origin: BASE_URL, 'content-type': 'application/json' },
			data: { provider: 'paypal', handle: 'billing@example.com' }
		})
		if (!putRes.ok()) throw new Error(`payment defaults PUT failed: ${putRes.status()}`)

		try {
			const start = new Date(Date.now() + 5 * 24 * 60 * 60 * 1000)
			start.setUTCHours(18, 0, 0, 0)
			const end = new Date(start.getTime() + 60 * 60 * 1000)
			const title = `Payment Defaults Flow ${unique}`
			const createRes = await context.request.post(`${BASE_URL}/api/admin/events`, {
				headers: { origin: BASE_URL, 'content-type': 'application/json' },
				data: {
					activitySlug: 'gym',
					title,
					startsAt: start.toISOString(),
					endsAt: end.toISOString(),
					capacity: 4,
					repeatWeeks: 0,
					costCents: 1250,
					currency: 'USD',
					paymentProvider: null,
					paymentHandle: null,
					paymentNoteTemplate: null,
					location: null,
					note: null
				}
			})
			if (!createRes.ok()) throw new Error(`admin event create failed: ${createRes.status()}`)
			const created = await createRes.json() as { ids?: number[] }
			const eventId = created.ids?.[0]
			if (typeof eventId !== 'number') throw new Error('admin event create did not return event id')

			const eventsRes = await context.request.get(`${BASE_URL}/api/admin/events`)
			if (!eventsRes.ok()) throw new Error(`admin events GET failed: ${eventsRes.status()}`)
			const events = await eventsRes.json() as {
				upcoming?: Array<{
					id: number
					paymentProvider: string | null
					paymentHandle: string | null
					costCents: number
				}>
			}
			const event = events.upcoming?.find((item) => item.id === eventId)
			if (!event) throw new Error('created payment event missing from admin feed')
			if (event.paymentProvider !== 'paypal' || event.paymentHandle !== 'billing@example.com' || event.costCents !== 1250) {
				throw new Error(`payment defaults not applied to event: ${JSON.stringify(event)}`)
			}
		} finally {
			await context.request.put(`${BASE_URL}/api/admin/settings/payment`, {
				headers: { origin: BASE_URL, 'content-type': 'application/json' },
				data: before.payment
			})
		}

		console.log('[admin-payment-defaults-event-flow-smoke] PASS')
	})
}
