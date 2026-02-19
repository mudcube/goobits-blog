import { chromium } from 'playwright'
import { BASE_URL, getAdminPasscode } from './_helpers'

async function loginAdminContext(page: import('playwright').Page) {
	const passcode = getAdminPasscode()
	if (!passcode) throw new Error('ADMIN_PASSCODE not available')

	const context = page.context()
	await page.goto(`${BASE_URL}/admin/`, { waitUntil: 'domcontentloaded', timeout: 30000 })
	if (await page.locator('input[name="password"]').count()) {
		await page.fill('input[name="password"]', passcode)
		await page.click('button[type="submit"]')
		for (let attempt = 0; attempt < 20; attempt += 1) {
			const cookies = await context.cookies(`${BASE_URL}/admin/`)
			if (cookies.some((cookie) => cookie.name === 'admin_session')) break
			await page.waitForTimeout(150)
		}
	}
	await page.goto(`${BASE_URL}/admin/`, { waitUntil: 'domcontentloaded', timeout: 30000 })

	const hasLogin = (await page.locator('input[name="password"]').count()) > 0
	if (hasLogin) throw new Error('admin auth failed')
}

export async function runAdminPaymentDefaultsSmoke() {
	const browser = await chromium.launch({ headless: true })
	const context = await browser.newContext()
	const page = await context.newPage()

	try {
		await loginAdminContext(page)

		const beforeRes = await context.request.get(`${BASE_URL}/api/calendar/admin/settings/payment`)
		if (!beforeRes.ok()) throw new Error(`payment defaults GET failed: ${beforeRes.status()}`)
		const before = await beforeRes.json() as { payment: { provider: string | null; handle: string | null } }

		const nextProvider = before.payment.provider === 'venmo' ? 'paypal' : 'venmo'
		const nextHandle = before.payment.handle === '@miko-e2e' ? '@miko-e2e-2' : '@miko-e2e'
		const putRes = await context.request.put(`${BASE_URL}/api/calendar/admin/settings/payment`, {
			headers: { origin: BASE_URL, 'content-type': 'application/json' },
			data: { provider: nextProvider, handle: nextHandle }
		})
		if (!putRes.ok()) throw new Error(`payment defaults PUT failed: ${putRes.status()}`)

		const afterRes = await context.request.get(`${BASE_URL}/api/calendar/admin/settings/payment`)
		if (!afterRes.ok()) throw new Error(`payment defaults verify GET failed: ${afterRes.status()}`)
		const after = await afterRes.json() as { payment: { provider: string | null; handle: string | null } }
		if (after.payment.provider !== nextProvider || after.payment.handle !== nextHandle) {
			throw new Error('payment defaults not persisted')
		}

		await context.request.put(`${BASE_URL}/api/calendar/admin/settings/payment`, {
			headers: { origin: BASE_URL, 'content-type': 'application/json' },
			data: before.payment
		})

		console.log('[admin-payment-defaults-smoke] PASS')
	} finally {
		await context.close()
		await browser.close()
	}
}

export async function runAdminPeopleAccessSmoke() {
	const browser = await chromium.launch({ headless: true })
	const context = await browser.newContext()
	const page = await context.newPage()

	try {
		await loginAdminContext(page)
		const usersRes = await context.request.get(`${BASE_URL}/api/calendar/admin/users`)
		if (!usersRes.ok()) throw new Error(`users GET failed: ${usersRes.status()}`)
		const usersPayload = await usersRes.json() as { users?: Array<{ id: string | number }> }
		const user = usersPayload.users?.[0]
		if (!user) {
			console.log('[admin-people-access-smoke] PASS (no users)')
			return
		}

		const userId = String(user.id)
		const accessRes = await context.request.get(`${BASE_URL}/api/calendar/admin/users/${userId}/access`)
		if (!accessRes.ok()) throw new Error(`access GET failed: ${accessRes.status()}`)
		const accessPayload = await accessRes.json() as { access: Array<{ programSlug: string; allowed: boolean }> }
		if (!accessPayload.access.length) throw new Error('no program access rows')

		const changed = accessPayload.access.map((row, idx) => ({
			...row,
			allowed: idx === 0 ? !row.allowed : row.allowed
		}))
		const putRes = await context.request.put(`${BASE_URL}/api/calendar/admin/users/${userId}/access`, {
			headers: { origin: BASE_URL, 'content-type': 'application/json' },
			data: { access: changed }
		})
		if (!putRes.ok()) throw new Error(`access PUT failed: ${putRes.status()}`)

		await context.request.put(`${BASE_URL}/api/calendar/admin/users/${userId}/access`, {
			headers: { origin: BASE_URL, 'content-type': 'application/json' },
			data: { access: accessPayload.access }
		})

		console.log('[admin-people-access-smoke] PASS')
	} finally {
		await context.close()
		await browser.close()
	}
}

export async function runAdminWaitlistPromoteSmoke() {
	const browser = await chromium.launch({ headless: true })
	const context = await browser.newContext()
	const page = await context.newPage()

	try {
		await loginAdminContext(page)
		const res = await context.request.post(`${BASE_URL}/api/calendar/admin/events/999999/waitlist/999999/promote`, {
			headers: { origin: BASE_URL }
		})
		if (![400, 404].includes(res.status())) {
			throw new Error(`expected 400/404, got ${res.status()}`)
		}
		console.log('[admin-waitlist-promote-smoke] PASS')
	} finally {
		await context.close()
		await browser.close()
	}
}

export async function runAdminEventTemplatesSmoke() {
	const browser = await chromium.launch({ headless: true })
	const context = await browser.newContext()
	const page = await context.newPage()

	try {
		await loginAdminContext(page)
		const res = await context.request.get(`${BASE_URL}/api/calendar/admin/events/templates`)
		if (!res.ok()) throw new Error(`templates GET failed: ${res.status()}`)
		const payload = await res.json() as { templates?: unknown[] }
		if (!Array.isArray(payload.templates)) throw new Error('templates payload invalid')
		console.log('[admin-event-templates-smoke] PASS')
	} finally {
		await context.close()
		await browser.close()
	}
}
